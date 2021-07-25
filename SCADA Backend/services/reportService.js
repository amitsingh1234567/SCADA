const Excel = require('exceljs');
const nodemailer = require('nodemailer')

const { User } = require('../models/user');
const { SCB } = require('../models/scb');
const { StringInverter } = require('../models/stringinverter');
const { CentralizedInverter } = require('../models/centralizedinverter');
const { Meter } = require('../models/meter');
const { WeatherStation } = require('../models/weatherstation');
const { PlantProfile } = require('../models/plantProfile');
const { PlantAnalysis } = require('../models/plantanalysis');

exports.reportDailyService = async(username, plantIds, device, timestampRaw)=>{

    const plantId = Math.sqrt(plantIds);
    const timestampNumber = Number(timestampRaw);
    let user;

    let d = new Date(timestampNumber);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDateGT = new Date(d).toUTCString();

    let dt = new Date(timestampNumber);
    dt.setHours(23);
    dt.setMinutes(59);
    dt.setSeconds(59);
    dt.setMilliseconds(59);
    const GMTDateLT = new Date(dt).toUTCString();

    let d1 = new Date(timestampNumber);
    d1.setHours(04);
    d1.setMinutes(30);
    d1.setSeconds(00);
    d1.setMilliseconds(00);
    const GMTDateGT1 = new Date(d1).toUTCString();

    let dt1 = new Date(timestampNumber);
    dt1.setHours(20);
    dt1.setMinutes(00);
    dt1.setSeconds(00);
    dt1.setMilliseconds(00);
    const GMTDateLT1 = new Date(dt1).toUTCString();

    let getCell_Front = (worksheet, cellValue, size, color)=>{
        worksheet.getCell(cellValue).font = {
            size: size,
            color: { argb: color },
            bold: true,
        };
    };
    
    let getCell_Fill = (worksheet, cellValue, type, pattern, color)=>{
        worksheet.getCell(cellValue).fill = {
            type: type,
            pattern: pattern,
            fgColor: { argb: color }
        };
    };

    const workbook = new Excel.Workbook();
    workbook.creator = 'Holmium Technologies Pvt. Ltd.';
    workbook.created = new Date();
   
    try{

        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
            user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
    
        const  plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }
        ]);

        if(plantProfile[0] == undefined){
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }

        if(device == 'Site Analysis')
        {
            
            let query = [ 
                
                // Plant Analysis Query
                PlantAnalysis.aggregate([
                    {
                    '$match': {
                        'timestamp': {
                        '$lte': new Date(GMTDateLT), 
                        '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                    }
                    }, {
                    '$sort': {
                        'timestamp': -1
                    }
                    }, {
                    '$limit': 1
                    }
                ]),

                //String Inverter Daily Energy
                StringInverter.aggregate([
                    {
                        '$match': {
                        'timestamp': {
                            '$lte': new Date(GMTDateLT), 
                            '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0
                        }
                    }, {
                        '$group': {
                        '_id': {
                            'deviceNo': '$deviceNo'
                        }, 
                        'dailyEnergy': {
                            '$last': '$dailyEnergy'
                        }
                        }
                    }, {
                        '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                        }
                    }, {
                        '$project': {
                        '_id': 0
                        }
                    }, {
                        '$sort': {
                        'deviceNo': 1
                        }
                    }
                ]),

                //String inverter total Energy
                StringInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0, 
                        'totalEnergy': {
                          '$ne': 0
                        }
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'timestamp': {
                          '$last': '$timestamp'
                        }, 
                        'totalEnergy': {
                          '$last': '$totalEnergy'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'deviceNo': 1, 
                        'totalEnergy': 1
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ plantAnalyticsRecord, dailyEnergyStringInverter, totalEnergyStringInverter ] = await Promise.allSettled(query);

            let timestamp;
            let clientName;
            let plantName;
            let plantCapacity;
            let plantStartTime;
            let plantStopTime;
            let plantGenerationTime = 0;
            let maxActivePower = 0;
            let dailyEnergy = 0;
            let specificEnergy = 0;
            let totalEnergy = 0;
            let cumulativeGHI;
            let cumulativeGTI1;
            let cumulativeGTI2;
            let cumulativeGTI3;
            let cumulativeGTI4;
            let cumulativeGTI5;
            let PR;
            let CUF = 'NA';
            let MFMEnergyExport;
            let MFMEnergyImport;
            // let diesalGeneratorEnergyExport;
            // let zeroExportActiveEnergyExport;
            // let zeroExportActiveEnergyImport;
            let deviceName = [];
            let capacity = [];
            let dailyYield = [];
            let totalYield = [];
            let specificYield = [];

            if( typeof plantAnalyticsRecord.value != 'undefined')
            {
                timestamp = new Date(plantAnalyticsRecord.value[0].timestamp);
                clientName = user.clientName;
                plantName = plantAnalyticsRecord.value[0].plantName;
                plantCapacity = plantAnalyticsRecord.value[0].totalCapacity;
                if(plantCapacity>9999)
                    plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
                else
                    plantCapacity=parseInt(plantCapacity) + ' kW';
                if(plantAnalyticsRecord.value[0].plantStartTime)
                    plantStartTime=plantAnalyticsRecord.value[0].plantStartTime;
                if(plantAnalyticsRecord.value[0].plantStopTime)
                    plantStopTime=plantAnalyticsRecord.value[0].plantStopTime;
                if(plantAnalyticsRecord.value[0].plantGenerationTime)
                    plantGenerationTime=plantAnalyticsRecord.value[0].plantGenerationTime;
                if(plantAnalyticsRecord.value[0].maxActivePower)
                    maxActivePower=plantAnalyticsRecord.value[0].maxActivePower;
                if(plantAnalyticsRecord.value[0].specificEnergy)
                    specificEnergy=plantAnalyticsRecord.value[0].specificEnergy;
                if(plantAnalyticsRecord.value[0].dailyEnergy)
                    dailyEnergy=plantAnalyticsRecord.value[0].dailyEnergy;
                if(plantAnalyticsRecord.value[0].totalEnergy)
                    totalEnergy=plantAnalyticsRecord.value[0].totalEnergy;
                if(plantAnalyticsRecord.value[0].CUF)
                    CUF=plantAnalyticsRecord.value[0].CUF;
                if(typeof plantAnalyticsRecord.value[0].PR != 'undefined')
                    PR=plantAnalyticsRecord.value[0].PR;
                if(typeof plantAnalyticsRecord.value[0].cumulativeGHI != 'undefined')
                    cumulativeGHI=plantAnalyticsRecord.value[0].cumulativeGHI;
                if(typeof plantAnalyticsRecord.value[0].cumulativeGTI1 != 'undefined')
                    cumulativeGTI1=plantAnalyticsRecord.value[0].cumulativeGTI1;
                if(typeof plantAnalyticsRecord.value[0].cumulativeGTI2 != 'undefined')
                    cumulativeGTI2=plantAnalyticsRecord.value[0].cumulativeGTI2;
                // if(typeof plantAnalyticsRecord.value[0].gridEnergyExport != 'undefined')
                //     zeroExportActiveEnergyExport=plantAnalyticsRecord.value[0].gridEnergyExport;
                // if(typeof plantAnalyticsRecord.value[0].gridEnergyImport != 'undefined')
                //     zeroExportActiveEnergyImport=plantAnalyticsRecord.value[0].gridEnergyImport;
            }

            if(typeof dailyEnergyStringInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].stringInverter.details.forEach(element => {
                   
                  if(typeof dailyEnergyStringInverter.value[i] != 'undefined')
                  {
                    if(element.id == dailyEnergyStringInverter.value[i].deviceNo)
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        capacity.push(element.capacity);
                        dailyYield.push(dailyEnergyStringInverter.value[i].dailyEnergy);
                        specificYield.push(parseFloat((dailyEnergyStringInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        i++;
                    }
                    else
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                    }
                  }
                  else
                  {
                        deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                  }
                   
                });
            }

            if(typeof totalEnergyStringInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].stringInverter.details.forEach(element => {
                   
                  if(typeof totalEnergyStringInverter.value[i] != 'undefined')
                  {
                    if(element.id == totalEnergyStringInverter.value[i].deviceNo)
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(totalEnergyStringInverter.value[i].totalEnergy);
                        //specificYield.push(parseFloat((dailyEnergyStringInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        i++;
                    }
                    else
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                    }
                  }
                  else
                  {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                  }
                   
                });
            }

            workbook.addWorksheet('Site Analysis');
            workbook.addWorksheet('Inverters Daily Yield');
    
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:O2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('E1').value = "Site: "+ plantName;
                worksheet.getCell('G1').value = "Site Capacity: "+plantCapacity;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"];


                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
           
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];

                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });
            
            let worksheet = workbook.getWorksheet('Site Analysis');
            
            worksheet.getCell('A3').value = 'Date (DD-MM-YYYY)';
            worksheet.getCell('A4').value = timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
            worksheet.getCell('B3').value = 'Start Time (HH:MM:SS)';
            if(plantStartTime == 'NA')
                worksheet.getCell('B4').value =plantStartTime;
            else
            {
                plantStartTime = new Date(plantStartTime);
                worksheet.getCell('B4').value = plantStartTime.toLocaleTimeString("en-IN", {hourCycle:"h23"});
            }
            
            worksheet.getCell('C3').value = 'Stop Time (HH:MM:SS)';
            if(plantStopTime == 'NA')
                worksheet.getCell('C4').value = plantStopTime;
            else
            {
                plantStopTime = new Date(plantStopTime);
                worksheet.getCell('C4').value = plantStopTime.toLocaleTimeString("en-IN", {hourCycle:"h23"});
            }
            
            worksheet.getCell('D3').value = 'Generation Time (HH:MM)';
            if(plantGenerationTime == 0)
                worksheet.getCell('D4').value = plantGenerationTime;
            else
            {
                let hour = parseInt(plantGenerationTime / 60); 
                plantGenerationTime %= 60;
                let minute =  parseInt(plantGenerationTime); 

                if(hour<10)
                    hour = "0"+hour;
                if(minute == 0)
                    minute = "0"+minute;
                worksheet.getCell('D4').value = hour+":"+minute;
            }

            worksheet.getCell('E3').value = 'Max Output Power (kW)';
            if( maxActivePower == 0)
                worksheet.getCell('E4').value = 'NA';
            else
                worksheet.getCell('E4').value =  maxActivePower;

           
            worksheet.getCell('F3').value = 'Daily Yield (kWh)';
            worksheet.getCell('F4').value =  dailyEnergy;

            worksheet.getCell('G3').value = 'Specific Yield (kWh/m2)';
            worksheet.getCell('G4').value =  specificEnergy;

            worksheet.getCell('H3').value = 'Total Yield (MWh)';
            worksheet.getCell('H4').value =  parseFloat((totalEnergy/1000).toFixed(2));
           
            worksheet.getCell('I3').value = 'CUF (%)';
            worksheet.getCell('I4').value =  CUF;
           
            let columnId = ["J", "K", "L", "M", "N", "O"];

            let flagPR = true;
            let flagCumulativeGHI = false;
            let flagCumulativeGTI1 = false;
            // let flagGridImport = false;
            // let flagGridExport = false;

            for (let i=0; i<columnId.length;i++)
            {
               
                if(typeof PR != 'undefined')
                {
                    if(flagPR)
                    {
                        worksheet.getCell(columnId[i]+'3').value = 'PR (%)';
                        worksheet.getCell(columnId[i]+'4').value =  PR;
                        flagPR = false;
                        flagCumulativeGTI1 =true;
                        continue;
                    }
                    else
                    {
                        console.log("skip");
                    }
                   
                }
                else
                {
                    if(flagPR)
                    {
                        flagPR = false;
                        flagCumulativeGHI =true;
                    }
                    else
                    {
                        console.log("skip");
                    }
                  
                }
                
                if(typeof cumulativeGHI != 'undefined')
                {
                    if(flagCumulativeGHI)
                    {
                        worksheet.getCell(columnId[i]+'3').value = 'Cumulative GHI (kWh/m2)';
                        worksheet.getCell(columnId[i]+'4').value =  cumulativeGHI;
                        flagCumulativeGHI = false;
                        flagCumulativeGTI1 =true;
                        continue;
                    }
                    else
                    {
                        console.log("skip");
                    } 
                }
                else
                {
                    if(flagCumulativeGHI)
                    {
                        flagCumulativeGHI = false;
                        flagCumulativeGTI1 =true;
                    }
                    else
                    {
                        console.log("skip");
                    }
                  
                }

                if(typeof cumulativeGTI1 != 'undefined')
                {
                    if(flagCumulativeGTI1)
                    {
                        worksheet.getCell(columnId[i]+'3').value = 'Cumulative GTI (kWh/m2)';
                        worksheet.getCell(columnId[i]+'4').value =  cumulativeGTI1;
                        flagCumulativeGTI1 = false;
                        flagGridImport=true;
                        continue;
                    }
                    else
                    {
                        console.log("skip");
                    }
                   
                }
                else
                {
                    if(flagCumulativeGTI1)
                    {
                        flagCumulativeGTI1 = false;
                        flagGridImport =true;
                    }
                    else
                    {
                        console.log("skip");
                    }
                  
                }

                // if(typeof zeroExportActiveEnergyImport != 'undefined')
                // {
                //     if(flagGridImport)
                //     {
                //         worksheet.getCell(columnId[i]+'3').value = 'Grid Energy Import (kWh)';
                //         worksheet.getCell(columnId[i]+'4').value =  zeroExportActiveEnergyImport;
                //         flagGridImport = false;
                //         flagGridExport =true;
                //         continue;
                //     }
                //     else
                //     {
                //         console.log("skip");
                //     }
                   
                // }
                // else
                // {
                //     if(flagGridImport)
                //     {
                //         flagGridImport = false;
                //         flagGridExport =true;
                //     }
                //     else
                //     {
                //         console.log("skip");
                //     }
                  
                // }

                // if(typeof zeroExportActiveEnergyExport != 'undefined')
                // {
                //     if(flagGridExport)
                //     {
                //         worksheet.getCell(columnId[i]+'3').value = 'Grid Energy Export (kWh)';
                //         worksheet.getCell(columnId[i]+'4').value =  zeroExportActiveEnergyExport;
                //         //flagGridImport = false;
                //         flagGridExport =false;
                //         continue;
                //     }
                //     else
                //     {
                //         console.log("skip");
                //     }
                   
                // }
                // else
                // {
                //     if(flagGridExport)
                //     {
                //         //flagGridImport = false;
                //         flagGridExport =false;
                //     }
                //     else
                //     {
                //         console.log("skip");
                //     }
                  
                // }
            }
            //});

            worksheet = workbook.getWorksheet('Inverters Daily Yield');

            worksheet.getCell('A3').value = 'Device Name';
            worksheet.getCell('B3').value = 'DC Capacity (kW)';
            worksheet.getCell('C3').value = 'Daily Yield (kWh)';
            worksheet.getCell('D3').value = 'Specific Yield (kWh/m2)';
            worksheet.getCell('E3').value = 'Total Yield (kWh)';

            for(let i=0,j=4; i<deviceName.length;i++)
            {
                worksheet.getCell('A'+j).value = deviceName[i];
                // getCell_Front( worksheet, 'A'+j, 10, 'FFFFFFFF');
                // getCell_Fill( worksheet,'A'+j, 'pattern', 'solid', 'FFDB5A23');
                worksheet.getCell('B'+j).value = capacity[i];
                worksheet.getCell('C'+j).value = dailyYield[i];
                worksheet.getCell('D'+j).value = specificYield[i];
                worksheet.getCell('E'+j).value = totalYield[i];
                j++;
            }
        
        }
        else if(device == 'SCB')
        {
            let query = [

                //SCB logs
                SCB.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT1), 
                          '$gte': new Date(GMTDateGT1)
                        }, 
                        'plantId': plantId,
                        'errorFlag': 0
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1, 
                        'timestamp': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ logSCB ] = await Promise.allSettled(query);

            let clientName;
            let plantName;
            let plantCapacity;
 
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';

            plantProfile[0].scb.details.forEach(element => {
                workbook.addWorksheet(element.name);
            });
            
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:BZ2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"]

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
            
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3",
                "AA3","AB3","AC3","AD3","AE3","AF3","AG3","AH3","AI3","AJ3","AK3","AL3","AM3","AN3","AO3","AP3","AQ3","AR3","AS3","AT3","AU3","AV3","AW3","AX3","AY3","AZ3",
                "BA3","BB3","BC3","BD3","BE3","BF3","BG3","BH3","BI3","BJ3","BK3","BL3","BM3","BN3","BO3","BP3","BQ3","BR3","BS3","BT3","BU3","BV3","BW3","BX3","BY3","BZ3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 }];
            
                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });

            for(let i=0,k=0; i<plantProfile[0].scb.details.length; i++)
            {
                let j=4;

                worksheet = workbook.worksheets[i];
                worksheet.getCell('E1').value = plantProfile[0].scb.details[i].name;
                worksheet.getCell('G1').value = "Site: "+ plantName;
                worksheet.getCell('A3').value = 'Timestamp (HH:MM:SS)';
                worksheet.getCell('B3').value = 'Voltage (V)';
                worksheet.getCell('C3').value = 'Current (A)';
                worksheet.getCell('D3').value = 'Power (kW)';
                worksheet.getCell('E3').value = 'Temperture (°C)';
                worksheet.getCell('F3').value = 'Current String 1 (A)';
                worksheet.getCell('G3').value = 'Current String 2 (A)';
                worksheet.getCell('H3').value = 'Current String 3 (A)';
                worksheet.getCell('I3').value = 'Current String 4 (A)';
                worksheet.getCell('J3').value = 'Current String 5 (A)';
                worksheet.getCell('K3').value = 'Current String 6 (A)';
                worksheet.getCell('L3').value = 'Current String 7 (A)';
                worksheet.getCell('M3').value = 'Current String 8 (A)';
                worksheet.getCell('N3').value = 'Current String 9 (A)';
                worksheet.getCell('O3').value = 'Current String 10 (A)';
                worksheet.getCell('P3').value = 'Current String 11 (A)';
                worksheet.getCell('Q3').value = 'Current String 12 (A)';
                worksheet.getCell('R3').value = 'Current String 13 (A)';
                worksheet.getCell('S3').value = 'Current String 14 (A)';
                worksheet.getCell('T3').value = 'Current String 15 (A)';
                worksheet.getCell('U3').value = 'Current String 16 (A)';
                worksheet.getCell('V3').value = 'Current String 17 (A)';
                worksheet.getCell('W3').value = 'Current String 18 (A)';
                worksheet.getCell('X3').value = 'Current String 19 (A)';
                worksheet.getCell('Y3').value = 'Current String 20 (A)';
                worksheet.getCell('Z3').value = 'Current String 21 (A)';
                worksheet.getCell('AA3').value = 'Current String 22 (A)';
                worksheet.getCell('AB3').value = 'Current String 23 (A)';
                worksheet.getCell('AC3').value = 'Current String 24 (A)';

                while(k<=logSCB.value.length)
                {
                    if(typeof logSCB.value[k] != 'undefined')
                    {
                        if(plantProfile[0].scb.details[i].id == logSCB.value[k].deviceNo)
                        {
                            if(logSCB.value[k].timestamp)
                            {
                                let temp = new Date(logSCB.value[k].timestamp);
                                worksheet.getCell('A'+j).value = temp.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                            }

                            if(logSCB.value[k].voltage)
                                worksheet.getCell('B'+j).value = logSCB.value[k].voltage;
                            
                            if(logSCB.value[k].current)
                                worksheet.getCell('C'+j).value = logSCB.value[k].current;    
                            
                            if(logSCB.value[k].power)
                                worksheet.getCell('D'+j).value = logSCB.value[k].power;

                            if(logSCB.value[k].temperature)
                                worksheet.getCell('E'+j).value = logSCB.value[k].temperature;
                            
                            if(logSCB.value[k].currentString1)
                                worksheet.getCell('F'+j).value = logSCB.value[k].currentString1;

                            if(logSCB.value[k].currentString2)
                                worksheet.getCell('G'+j).value = logSCB.value[k].currentString2;

                            if(logSCB.value[k].currentString3)
                                worksheet.getCell('H'+j).value = logSCB.value[k].currentString3;

                            if(logSCB.value[k].currentString4)
                                worksheet.getCell('I'+j).value = logSCB.value[k].currentString4;

                            if(logSCB.value[k].currentString5)
                                worksheet.getCell('J'+j).value = logSCB.value[k].currentString5;

                            if(logSCB.value[k].currentString6)
                                worksheet.getCell('K'+j).value = logSCB.value[k].currentString6;
                                
                            if(logSCB.value[k].currentString7)
                                worksheet.getCell('L'+j).value = logSCB.value[k].currentString7;    

                            if(logSCB.value[k].currentString8)
                                worksheet.getCell('M'+j).value = logSCB.value[k].currentString8;

                            if(logSCB.value[k].currentString9)
                                worksheet.getCell('N'+j).value = logSCB.value[k].currentString9;

                            if(logSCB.value[k].currentString10)
                                worksheet.getCell('O'+j).value = logSCB.value[k].currentString10;

                            if(logSCB.value[k].currentString11)
                                worksheet.getCell('P'+j).value = logSCB.value[k].currentString11;

                            if(logSCB.value[k].currentString12)
                                worksheet.getCell('Q'+j).value = logSCB.value[k].currentString12;

                            if(logSCB.value[k].currentString13)
                                worksheet.getCell('R'+j).value = logSCB.value[k].currentString13;

                            if(logSCB.value[k].currentString14)
                                worksheet.getCell('S'+j).value = logSCB.value[k].currentString14;

                            if(logSCB.value[k].currentString15)
                                worksheet.getCell('T'+j).value = logSCB.value[k].currentString15;

                            if(logSCB.value[k].currentString16)
                                worksheet.getCell('U'+j).value = logSCB.value[k].currentString16;

                            if(logSCB.value[k].currentString17)
                                worksheet.getCell('V'+j).value = logSCB.value[k].currentString17;

                            if(logSCB.value[k].currentString18)
                                worksheet.getCell('W'+j).value = logSCB.value[k].currentString18;

                            if(logSCB.value[k].currentString19)
                                worksheet.getCell('X'+j).value = logSCB.value[k].currentString19;

                            if(logSCB.value[k].currentString20)
                                worksheet.getCell('Y'+j).value = logSCB.value[k].currentString20;

                            if(logSCB.value[k].currentString21)
                                worksheet.getCell('Z'+j).value = logSCB.value[k].currentString21;

                            if(logSCB.value[k].currentString22)
                                worksheet.getCell('AA'+j).value = logSCB.value[k].currentString22;

                            if(logSCB.value[k].currentString23)
                                worksheet.getCell('AB'+j).value = logSCB.value[k].currentString23;

                            if(logSCB.value[k].currentString24)
                                worksheet.getCell('AC'+j).value = logSCB.value[k].currentString24;

                            j++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    
                    k++;
                }
            }
        }
        else if(device == 'String Inverter')
        {
           
            let query = [

                //String Inverter Daily Energy
                StringInverter.aggregate([
                    {
                        '$match': {
                        'timestamp': {
                            '$lte': new Date(GMTDateLT), 
                            '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0
                        }
                    }, {
                        '$group': {
                        '_id': {
                            'deviceNo': '$deviceNo'
                        }, 
                        'dailyEnergy': {
                            '$last': '$dailyEnergy'
                        },
                        "dailyRuntime": {
                            "$last":"$dailyRuntime"
                        },
                        "totalRuntime": {
                            "$last":"$totalRuntime"
                        },
                        }
                    }, {
                        '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                        }
                    }, {
                        '$project': {
                        '_id': 0
                        }
                    }, {
                        '$sort': {
                        'deviceNo': 1
                        }
                    }
                ]),

                //String inverter total Energy
                StringInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0, 
                        'totalEnergy': {
                          '$ne': 0
                        }
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'timestamp': {
                          '$last': '$timestamp'
                        }, 
                        'totalEnergy': {
                          '$last': '$totalEnergy'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'deviceNo': 1, 
                        'totalEnergy': 1
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ]),

                //String Inverter Max Output Power
                StringInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT), 
                          '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0
                      }
                    }, {
                      '$sort': {
                        'activePower': 1
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'maxOutputPowerTimestamp': {
                          '$last': '$timestamp'
                        }, 
                        'maxOutputPower': {
                          '$last': '$activePower'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'deviceNo': 1, 
                        'maxOutputPower': 1, 
                        'maxOutputPowerTimestamp': 1
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ]),

                //String Inverter logs
                StringInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT1), 
                          '$gte': new Date(GMTDateGT1)
                        }, 
                        'plantId': plantId,
                        'errorFlag': 0
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1, 
                        'timestamp': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ dailyEnergyStringInverter, totalEnergyStringInverter, maxOutputPowerStringInverter, logStringInverter ] = await Promise.allSettled(query);
            
            let clientName;
            let plantName;
            let plantCapacity;
            let deviceName = [];
            let capacity = [];
            let maxOutputPower = [];
            let maxOutputPowerTimestamp = [];
            let dailyYield = [];
            let totalYield = [];
            let specificYield = [];
            let dailyRuntime = [];
            let totalRuntime = [];
 
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';

            if(typeof dailyEnergyStringInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].stringInverter.details.forEach(element => {
                   
                  if(typeof dailyEnergyStringInverter.value[i] != 'undefined')
                  {
                    if(element.id == dailyEnergyStringInverter.value[i].deviceNo)
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name);
                        capacity.push(element.capacity);
                        dailyYield.push(dailyEnergyStringInverter.value[i].dailyEnergy);
                        specificYield.push(parseFloat((dailyEnergyStringInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        dailyRuntime.push(dailyEnergyStringInverter.value[i].dailyRuntime);
                        totalRuntime.push(dailyEnergyStringInverter.value[i].totalRuntime);
                        i++;
                    }
                    else
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name);
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                        dailyRuntime.push(null);
                        totalRuntime.push(null);
                    }
                  }
                  else
                  {
                        deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                        dailyRuntime.push(null);
                        totalRuntime.push(null);
                  }
                   
                });
            }

            if(typeof totalEnergyStringInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].stringInverter.details.forEach(element => {
                   
                  if(typeof totalEnergyStringInverter.value[i] != 'undefined')
                  {
                    if(element.id == totalEnergyStringInverter.value[i].deviceNo)
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(totalEnergyStringInverter.value[i].totalEnergy);
                        //specificYield.push(parseFloat((dailyEnergyStringInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        i++;
                    }
                    else
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                    }
                  }
                  else
                  {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                  }
                   
                });
            }

            if(typeof maxOutputPowerStringInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].stringInverter.details.forEach(element => {
                   
                  if(typeof maxOutputPowerStringInverter.value[i] != 'undefined')
                  {
                    if(element.id == maxOutputPowerStringInverter.value[i].deviceNo)
                    {
                        maxOutputPower.push(maxOutputPowerStringInverter.value[i].maxOutputPower);
                        let maxActivePowerTimestamp = maxOutputPowerStringInverter.value[i].maxOutputPowerTimestamp;

                        if( maxActivePowerTimestamp == null)
                            maxOutputPowerTimestamp.push(null);
                        else
                        {
                            maxActivePowerTimestamp = new Date(maxActivePowerTimestamp);
                            maxOutputPowerTimestamp.push(maxActivePowerTimestamp.toLocaleTimeString("en-IN", {hourCycle:"h23"}));
                        }
                        i++;
                    }
                    else
                    {
                        maxOutputPower.push(null);
                        maxOutputPowerTimestamp.push(null);  
                    }
                  }
                  else
                  {
                    maxOutputPower.push(null);
                    maxOutputPowerTimestamp.push(null);
                  }
                   
                });
            }

            workbook.addWorksheet('StringInverter Summary');
            
            plantProfile[0].stringInverter.details.forEach(element => {
                workbook.addWorksheet(element.name);
            });
            
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:BZ2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"]

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
           
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3",
                "AA3","AB3","AC3","AD3","AE3","AF3","AG3","AH3","AI3","AJ3","AK3","AL3","AM3","AN3","AO3","AP3","AQ3","AR3","AS3","AT3","AU3","AV3","AW3","AX3","AY3","AZ3",
                "BA3","BB3","BC3","BD3","BE3","BF3","BG3","BH3","BI3","BJ3","BK3","BL3","BM3","BN3","BO3","BP3","BQ3","BR3","BS3","BT3","BU3","BV3","BW3","BX3","BY3","BZ3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 }];
            
                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });
            
            worksheet = workbook.getWorksheet('StringInverter Summary');

            worksheet.getCell('E1').value = "Site: "+ plantName;
            worksheet.getCell('G1').value = "Site Capacity: "+plantCapacity;
            worksheet.getCell('A3').value = 'Device Name';
            worksheet.getCell('B3').value = 'DC Capacity (kW)';
            worksheet.getCell('C3').value = 'Daily Yield (kWh)';
            worksheet.getCell('D3').value = 'Specific Yield (kWh/m2)';
            worksheet.getCell('E3').value = 'Total Yield (kWh)';
            worksheet.getCell('F3').value = 'Max Output Power (kW)';
            worksheet.getCell('G3').value = 'Timestamp Max Output Power (HH:MM:SS)';
            worksheet.getCell('H3').value = 'Daily Runtime (H)';
            worksheet.getCell('I3').value = 'Total Runtime (H)';

            for(let i=0,j=4; i<deviceName.length;i++)
            {
                worksheet.getCell('A'+j).value = deviceName[i];
                worksheet.getCell('B'+j).value = capacity[i];
                worksheet.getCell('C'+j).value = dailyYield[i];
                worksheet.getCell('D'+j).value = specificYield[i];
                worksheet.getCell('E'+j).value = totalYield[i];
                worksheet.getCell('F'+j).value = maxOutputPower[i];
                worksheet.getCell('G'+j).value = maxOutputPowerTimestamp[i];
                worksheet.getCell('H'+j).value = dailyRuntime[i];
                worksheet.getCell('I'+j).value = totalRuntime[i];
                j++;
            }

            for(let i=0,k=0; i<plantProfile[0].stringInverter.details.length; i++)
            {
                let j=4;

                worksheet = workbook.worksheets[i+1];
                worksheet.getCell('E1').value = "Inverter Capacity: "+plantProfile[0].stringInverter.details[i].capacity+' kW';
                worksheet.getCell('G1').value = "Site: "+ plantName;
                worksheet.getCell('A3').value = 'Timestamp (HH:MM:SS)';
                worksheet.getCell('B3').value = 'Status';
                worksheet.getCell('C3').value = 'Daily Yield (kWh)';
                worksheet.getCell('D3').value = 'Total Yield (kWh)';
                worksheet.getCell('E3').value = 'Efficiency (%)';
                worksheet.getCell('F3').value = 'Temperature (°C)';
                worksheet.getCell('G3').value = 'Voltage R (V)';
                worksheet.getCell('H3').value = 'Voltage Y (V)';
                worksheet.getCell('I3').value = 'Voltage B (V)';
                worksheet.getCell('J3').value = 'Output Voltage (V)';
                worksheet.getCell('K3').value = 'Current R (A)';
                worksheet.getCell('L3').value = 'Current Y (A)';
                worksheet.getCell('M3').value = 'Current B (A)';
                worksheet.getCell('N3').value = 'Output Current (A)';
                worksheet.getCell('O3').value = 'Power R (kW)';
                worksheet.getCell('P3').value = 'Power Y (kW)';
                worksheet.getCell('Q3').value = 'Power B (kW)';
                worksheet.getCell('R3').value = 'Output Power (kW)';
                worksheet.getCell('S3').value = 'Frequency (Hz)';
                worksheet.getCell('T3').value = 'Power Factor';
                worksheet.getCell('U3').value = 'Input Current (A)';
                worksheet.getCell('V3').value = 'Input Power (kW)';
                worksheet.getCell('W3').value = 'Voltage MPPT1 (V)';
                worksheet.getCell('X3').value = 'Voltage MPPT2 (V)';
                worksheet.getCell('Y3').value = 'Voltage MPPT3 (V)';
                worksheet.getCell('Z3').value = 'Voltage MPPT4 (V)';
                worksheet.getCell('AA3').value = 'Voltage MPPT5 (V)';
                worksheet.getCell('AB3').value = 'Voltage MPPT6 (V)';
                worksheet.getCell('AC3').value = 'Voltage MPPT7 (V)';
                worksheet.getCell('AD3').value = 'Voltage MPPT8 (V)';
                worksheet.getCell('AE3').value = 'Current MPPT1 (A)';
                worksheet.getCell('AF3').value = 'Current MPPT2 (A)';
                worksheet.getCell('AG3').value = 'Current MPPT3 (A)';
                worksheet.getCell('AH3').value = 'Current MPPT4 (A)';
                worksheet.getCell('AI3').value = 'Current MPPT5 (A)';
                worksheet.getCell('AJ3').value = 'Current MPPT6 (A)';
                worksheet.getCell('AK3').value = 'Current MPPT7 (A)';
                worksheet.getCell('AL3').value = 'Current MPPT8 (A)';
                worksheet.getCell('AM3').value = 'Power MPPT1 (kW)';
                worksheet.getCell('AN3').value = 'Power MPPT2 (kW)';
                worksheet.getCell('AO3').value = 'Power MPPT3 (kW)';
                worksheet.getCell('AP3').value = 'Power MPPT4 (kW)';
                worksheet.getCell('AQ3').value = 'Power MPPT5 (kW)';
                worksheet.getCell('AR3').value = 'Power MPPT6 (kW)';
                worksheet.getCell('AS3').value = 'Power MPPT7 (kW)';
                worksheet.getCell('AT3').value = 'Power MPPT8 (kW)';
                worksheet.getCell('AU3').value = 'String 1 (A)';
                worksheet.getCell('AV3').value = 'String 2 (A)';
                worksheet.getCell('AW3').value = 'String 3 (A)';
                worksheet.getCell('AX3').value = 'String 4 (A)';
                worksheet.getCell('AY3').value = 'String 5 (A)';
                worksheet.getCell('AZ3').value = 'String 6 (A)';
                worksheet.getCell('BA3').value = 'String 7 (A)';
                worksheet.getCell('BB3').value = 'String 8 (A)';
                worksheet.getCell('BC3').value = 'String 9 (A)';
                worksheet.getCell('BD3').value = 'String 10 (A)';
                worksheet.getCell('BE3').value = 'String 11 (A)';
                worksheet.getCell('BF3').value = 'String 12 (A)';
                worksheet.getCell('BG3').value = 'String 13 (A)';
                worksheet.getCell('BH3').value = 'String 14 (A)';
                worksheet.getCell('BI3').value = 'String 15 (A)';
                worksheet.getCell('BJ3').value = 'String 16 (A)';
                worksheet.getCell('BK3').value = 'String 17 (A)';
                worksheet.getCell('BL3').value = 'String 18 (A)';
                worksheet.getCell('BM3').value = 'String 19 (A)';
                worksheet.getCell('BN3').value = 'String 20 (A)';
                worksheet.getCell('BO3').value = 'String 21 (A)';
                worksheet.getCell('BP3').value = 'String 22 (A)';
                worksheet.getCell('BQ3').value = 'String 23 (A)';
                worksheet.getCell('BR3').value = 'String 24 (A)';

                while(k<=logStringInverter.value.length)
                {
                    if(typeof logStringInverter.value[k] != 'undefined')
                    {
                        if(plantProfile[0].stringInverter.details[i].id == logStringInverter.value[k].deviceNo)
                        {
                            if(logStringInverter.value[k].timestamp)
                            {
                                let temp = new Date(logStringInverter.value[k].timestamp);
                                worksheet.getCell('A'+j).value = temp.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                            }

                            if(logStringInverter.value[k].status)
                            {
                                let status = logStringInverter.value[k].status;
                                worksheet.getCell('B'+j).value = logStringInverter.value[k].status;
                                getCell_Front( worksheet, 'B'+j, 11, 'FFFFFFFF');
                                if(status == 'Running')
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FF008000');
                                else if(status == 'Fault')
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FFFE0000');
                                else
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FFFFA500');
                            }
                            

                            if(logStringInverter.value[k].dailyEnergy)
                                worksheet.getCell('C'+j).value = logStringInverter.value[k].dailyEnergy;    
                            
                            if(logStringInverter.value[k].totalEnergy)
                                worksheet.getCell('D'+j).value = logStringInverter.value[k].totalEnergy;

                            if(logStringInverter.value[k].efficiency)
                                worksheet.getCell('E'+j).value = logStringInverter.value[k].efficiency;
                            
                            if(logStringInverter.value[k].temperature)
                                worksheet.getCell('F'+j).value = logStringInverter.value[k].temperature;

                            if(logStringInverter.value[k].voltagePhaseR)
                                worksheet.getCell('G'+j).value = logStringInverter.value[k].voltagePhaseR;

                            if(logStringInverter.value[k].voltagePhaseY)
                                worksheet.getCell('H'+j).value = logStringInverter.value[k].voltagePhaseY;

                            if(logStringInverter.value[k].voltagePhaseB)
                                worksheet.getCell('I'+j).value = logStringInverter.value[k].voltagePhaseB;

                            if(logStringInverter.value[k].outputVoltage)
                                worksheet.getCell('J'+j).value = logStringInverter.value[k].outputVoltage;

                            if(logStringInverter.value[k].currentPhaseR)
                                worksheet.getCell('K'+j).value = logStringInverter.value[k].currentPhaseR;
                                
                            if(logStringInverter.value[k].currentPhaseY)
                                worksheet.getCell('L'+j).value = logStringInverter.value[k].currentPhaseY;    

                            if(logStringInverter.value[k].currentPhaseB)
                                worksheet.getCell('M'+j).value = logStringInverter.value[k].currentPhaseB;

                            if(logStringInverter.value[k].outputCurrent)
                                worksheet.getCell('N'+j).value = logStringInverter.value[k].outputCurrent;

                            if(logStringInverter.value[k].powerPhaseR)
                                worksheet.getCell('O'+j).value = logStringInverter.value[k].powerPhaseR;

                            if(logStringInverter.value[k].powerPhaseY)
                                worksheet.getCell('P'+j).value = logStringInverter.value[k].powerPhaseY;

                            if(logStringInverter.value[k].powerPhaseB)
                                worksheet.getCell('Q'+j).value = logStringInverter.value[k].powerPhaseB;

                            if(logStringInverter.value[k].activePower)
                                worksheet.getCell('R'+j).value = logStringInverter.value[k].activePower;

                            if(logStringInverter.value[k].frequency)
                                worksheet.getCell('S'+j).value = logStringInverter.value[k].frequency;

                            if(logStringInverter.value[k].powerFactor)
                                worksheet.getCell('T'+j).value = logStringInverter.value[k].powerFactor;

                            if(logStringInverter.value[k].inputCurrent)
                                worksheet.getCell('U'+j).value = logStringInverter.value[k].inputCurrent;

                            if(logStringInverter.value[k].inputPower)
                                worksheet.getCell('V'+j).value = logStringInverter.value[k].inputPower;

                            if(logStringInverter.value[k].voltageMPPT1)
                                worksheet.getCell('W'+j).value = logStringInverter.value[k].voltageMPPT1;

                            if(logStringInverter.value[k].voltageMPPT2)
                                worksheet.getCell('X'+j).value = logStringInverter.value[k].voltageMPPT2;

                            if(logStringInverter.value[k].voltageMPPT3)
                                worksheet.getCell('Y'+j).value = logStringInverter.value[k].voltageMPPT3;

                            if(logStringInverter.value[k].voltageMPPT4)
                                worksheet.getCell('Z'+j).value = logStringInverter.value[k].voltageMPPT4;

                            if(logStringInverter.value[k].voltageMPPT5)
                                worksheet.getCell('AA'+j).value = logStringInverter.value[k].voltageMPPT5;

                            if(logStringInverter.value[k].voltageMPPT6)
                                worksheet.getCell('AB'+j).value = logStringInverter.value[k].voltageMPPT6;

                            if(logStringInverter.value[k].voltageMPPT7)
                                worksheet.getCell('AC'+j).value = logStringInverter.value[k].voltageMPPT7;

                            if(logStringInverter.value[k].voltageMPPT8)
                                worksheet.getCell('AD'+j).value = logStringInverter.value[k].voltageMPPT8;
                            
                            if(logStringInverter.value[k].currentMPPT1)
                                worksheet.getCell('AE'+j).value = logStringInverter.value[k].currentMPPT1;
                                
                            if(logStringInverter.value[k].currentMPPT2)
                                worksheet.getCell('AF'+j).value = logStringInverter.value[k].currentMPPT2;
                            
                            if(logStringInverter.value[k].currentMPPT3)
                                worksheet.getCell('AG'+j).value = logStringInverter.value[k].currentMPPT3;

                            if(logStringInverter.value[k].currentMPPT4)
                                worksheet.getCell('AH'+j).value = logStringInverter.value[k].currentMPPT4;
                            
                            if(logStringInverter.value[k].currentMPPT5)
                                worksheet.getCell('AI'+j).value = logStringInverter.value[k].currentMPPT5;
                                
                            if(logStringInverter.value[k].currentMPPT6)
                                worksheet.getCell('AJ'+j).value = logStringInverter.value[k].currentMPPT6;
                            
                            if(logStringInverter.value[k].currentMPPT7)
                                worksheet.getCell('AK'+j).value = logStringInverter.value[k].currentMPPT7;
                                
                            if(logStringInverter.value[k].currentMPPT8)
                                worksheet.getCell('AL'+j).value = logStringInverter.value[k].currentMPPT8;

                            if(logStringInverter.value[k].powerMPPT1)
                                worksheet.getCell('AM'+j).value = logStringInverter.value[k].powerMPPT1;

                            if(logStringInverter.value[k].powerMPPT2)
                                worksheet.getCell('AN'+j).value = logStringInverter.value[k].powerMPPT2;

                            if(logStringInverter.value[k].powerMPPT3)
                                worksheet.getCell('AO'+j).value = logStringInverter.value[k].powerMPPT3;

                            if(logStringInverter.value[k].powerMPPT4)
                                worksheet.getCell('AP'+j).value = logStringInverter.value[k].powerMPPT4;

                            if(logStringInverter.value[k].powerMPPT5)
                                worksheet.getCell('AQ'+j).value = logStringInverter.value[k].powerMPPT5;

                            if(logStringInverter.value[k].powerMPPT6)
                                worksheet.getCell('AR'+j).value = logStringInverter.value[k].powerMPPT6;

                            if(logStringInverter.value[k].powerMPPT7)
                                worksheet.getCell('AS'+j).value = logStringInverter.value[k].powerMPPT7;

                            if(logStringInverter.value[k].powerMPPT8)
                                worksheet.getCell('AT'+j).value = logStringInverter.value[k].powerMPPT8;

                            if(logStringInverter.value[k].currentString1)
                                worksheet.getCell('AU'+j).value = logStringInverter.value[k].currentString1;

                            if(logStringInverter.value[k].currentString2)
                                worksheet.getCell('AV'+j).value = logStringInverter.value[k].currentString2;

                            if(logStringInverter.value[k].currentString3)
                                worksheet.getCell('AW'+j).value = logStringInverter.value[k].currentString3;

                            if(logStringInverter.value[k].currentString4)
                                worksheet.getCell('AX'+j).value = logStringInverter.value[k].currentString4;

                            if(logStringInverter.value[k].currentString5)
                                worksheet.getCell('AY'+j).value = logStringInverter.value[k].currentString5;

                            if(logStringInverter.value[k].currentString6)
                                worksheet.getCell('AZ'+j).value = logStringInverter.value[k].currentString6;

                            if(logStringInverter.value[k].currentString7)
                                worksheet.getCell('BA'+j).value = logStringInverter.value[k].currentString7;

                            if(logStringInverter.value[k].currentString8)
                                worksheet.getCell('BB'+j).value = logStringInverter.value[k].currentString8;

                            if(logStringInverter.value[k].currentString9)
                                worksheet.getCell('BC'+j).value = logStringInverter.value[k].currentString9;

                            if(logStringInverter.value[k].currentString10)
                                worksheet.getCell('BD'+j).value = logStringInverter.value[k].currentString10;

                            if(logStringInverter.value[k].currentString11)
                                worksheet.getCell('BE'+j).value = logStringInverter.value[k].currentString11;

                            if(logStringInverter.value[k].currentString12)
                                worksheet.getCell('BF'+j).value = logStringInverter.value[k].currentString12;

                            if(logStringInverter.value[k].currentString13)
                                worksheet.getCell('BG'+j).value = logStringInverter.value[k].currentString13;

                            if(logStringInverter.value[k].currentString14)
                                worksheet.getCell('BH'+j).value = logStringInverter.value[k].currentString14;

                            if(logStringInverter.value[k].currentString15)
                                worksheet.getCell('BI'+j).value = logStringInverter.value[k].currentString15;

                            if(logStringInverter.value[k].currentString16)
                                worksheet.getCell('BJ'+j).value = logStringInverter.value[k].currentString16;

                            if(logStringInverter.value[k].currentString17)
                                worksheet.getCell('BK'+j).value = logStringInverter.value[k].currentString17;

                            if(logStringInverter.value[k].currentString18)
                                worksheet.getCell('BL'+j).value = logStringInverter.value[k].currentString18;

                            if(logStringInverter.value[k].currentString19)
                                worksheet.getCell('BM'+j).value = logStringInverter.value[k].currentString19;

                            if(logStringInverter.value[k].currentString20)
                                worksheet.getCell('BN'+j).value = logStringInverter.value[k].currentString20;

                            if(logStringInverter.value[k].currentString21)
                                worksheet.getCell('BO'+j).value = logStringInverter.value[k].currentString21;

                            if(logStringInverter.value[k].currentString22)
                                worksheet.getCell('BP'+j).value = logStringInverter.value[k].currentString22;

                            if(logStringInverter.value[k].currentString23)
                                worksheet.getCell('BQ'+j).value = logStringInverter.value[k].currentString23;

                            if(logStringInverter.value[k].currentString24)
                                worksheet.getCell('BR'+j).value = logStringInverter.value[k].currentString24;

                            j++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    
                    k++;
                }
            }

        }
        else if(device == 'Centralized Inverter')
        {
           
            let query = [

                //Centralized Inverter Daily Energy
                CentralizedInverter.aggregate([
                    {
                        '$match': {
                        'timestamp': {
                            '$lte': new Date(GMTDateLT), 
                            '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0,
                        'masterFlag': 0
                        }
                    }, {
                        '$group': {
                        '_id': {
                            'deviceNo': '$deviceNo'
                        }, 
                        'dailyEnergy': {
                            '$last': '$dailyEnergy'
                        },
                        "dailyRuntime": {
                            "$last":"$dailyRuntime"
                        },
                        "totalRuntime": {
                            "$last":"$totalRuntime"
                        },
                        }
                    }, {
                        '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                        }
                    }, {
                        '$project': {
                        '_id': 0
                        }
                    }, {
                        '$sort': {
                        'deviceNo': 1
                        }
                    }
                ]),

                //Centralized inverter total Energy
                CentralizedInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0,
                        'masterFlag': 0, 
                        'totalEnergy': {
                          '$ne': 0
                        }
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'timestamp': {
                          '$last': '$timestamp'
                        }, 
                        'totalEnergy': {
                          '$last': '$totalEnergy'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'deviceNo': 1, 
                        'totalEnergy': 1
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ]),

                //Centralized Inverter Max Output Power
                CentralizedInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT), 
                          '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId, 
                        'errorFlag': 0,
                        'masterFlag': 0
                      }
                    }, {
                      '$sort': {
                        'activePower': 1
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'maxOutputPowerTimestamp': {
                          '$last': '$timestamp'
                        }, 
                        'maxOutputPower': {
                          '$last': '$activePower'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0, 
                        'deviceNo': 1, 
                        'maxOutputPower': 1, 
                        'maxOutputPowerTimestamp': 1
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ]),

                //Centralized Inverter logs
                CentralizedInverter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT1), 
                          '$gte': new Date(GMTDateGT1)
                        }, 
                        'plantId': plantId,
                        'errorFlag': 0,
                        'masterFlag': 0
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1, 
                        'timestamp': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ dailyEnergyCentralizedInverter, totalEnergyCentralizedInverter, maxOutputPowerCentralizedInverter, logCentralizedInverter ] = await Promise.allSettled(query);
            
            let clientName;
            let plantName;
            let plantCapacity;
            let deviceName = [];
            let capacity = [];
            let maxOutputPower = [];
            let maxOutputPowerTimestamp = [];
            let dailyYield = [];
            let totalYield = [];
            let specificYield = [];
            let dailyRuntime = [];
            let totalRuntime = [];
 
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';

            if(typeof dailyEnergyCentralizedInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].centralizedInverter.details.forEach(element => {
                   
                  if(typeof dailyEnergyCentralizedInverter.value[i] != 'undefined')
                  {
                    if(element.id == dailyEnergyCentralizedInverter.value[i].deviceNo)
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name);
                        capacity.push(element.capacity);
                        dailyYield.push(dailyEnergyCentralizedInverter.value[i].dailyEnergy);
                        specificYield.push(parseFloat((dailyEnergyCentralizedInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        dailyRuntime.push(dailyEnergyCentralizedInverter.value[i].dailyRuntime);
                        totalRuntime.push(dailyEnergyCentralizedInverter.value[i].totalRuntime);
                        i++;
                    }
                    else
                    {
                        deviceName.push(element.building.substr(0,8)+' '+element.name);
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                        dailyRuntime.push(null);
                        totalRuntime.push(null);
                    }
                  }
                  else
                  {
                        deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        capacity.push(element.capacity);
                        dailyYield.push(null);
                        specificYield.push(null);
                        dailyRuntime.push(null);
                        totalRuntime.push(null);
                  }
                   
                });
            }

            if(typeof totalEnergyCentralizedInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].centralizedInverter.details.forEach(element => {
                   
                  if(typeof totalEnergyCentralizedInverter.value[i] != 'undefined')
                  {
                    if(element.id == totalEnergyCentralizedInverter.value[i].deviceNo)
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(totalEnergyCentralizedInverter.value[i].totalEnergy);
                        //specificYield.push(parseFloat((dailyEnergyStringInverter.value[i].dailyEnergy/element.capacity).toFixed(3)));
                        i++;
                    }
                    else
                    {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                    }
                  }
                  else
                  {
                        //deviceName.push(element.building.substr(0,8)+' '+element.name.substr(0,3)+element.name.substr(8,3));
                        //capacity.push(element.capacity);
                        totalYield.push(null);
                        //specificYield.push(null);
                  }
                   
                });
            }

            if(typeof maxOutputPowerCentralizedInverter.value != 'undefined')
            {
                let i = 0;
               
                plantProfile[0].centralizedInverter.details.forEach(element => {
                   
                  if(typeof maxOutputPowerCentralizedInverter.value[i] != 'undefined')
                  {
                    if(element.id == maxOutputPowerCentralizedInverter.value[i].deviceNo)
                    {
                        maxOutputPower.push(maxOutputPowerCentralizedInverter.value[i].maxOutputPower);
                        let maxActivePowerTimestamp = maxOutputPowerCentralizedInverter.value[i].maxOutputPowerTimestamp;

                        if( maxActivePowerTimestamp == null)
                            maxOutputPowerTimestamp.push(null);
                        else
                        {
                            maxActivePowerTimestamp = new Date(maxActivePowerTimestamp);
                            maxOutputPowerTimestamp.push(maxActivePowerTimestamp.toLocaleTimeString("en-IN", {hourCycle:"h23"}));
                        }
                        i++;
                    }
                    else
                    {
                        maxOutputPower.push(null);
                        maxOutputPowerTimestamp.push(null);  
                    }
                  }
                  else
                  {
                    maxOutputPower.push(null);
                    maxOutputPowerTimestamp.push(null);
                  }
                   
                });
            }

            workbook.addWorksheet('Centralized Inverter Summary');
            
            plantProfile[0].centralizedInverter.details.forEach(element => {
                workbook.addWorksheet(element.name);
            });
            
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:BZ2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"]

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
           
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3",
                "AA3","AB3","AC3","AD3","AE3","AF3","AG3","AH3","AI3","AJ3","AK3","AL3","AM3","AN3","AO3","AP3","AQ3","AR3","AS3","AT3","AU3","AV3","AW3","AX3","AY3","AZ3",
                "BA3","BB3","BC3","BD3","BE3","BF3","BG3","BH3","BI3","BJ3","BK3","BL3","BM3","BN3","BO3","BP3","BQ3","BR3","BS3","BT3","BU3","BV3","BW3","BX3","BY3","BZ3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 }];
            
                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });
            
            worksheet = workbook.getWorksheet('Centralized Inverter Summary');

            worksheet.getCell('E1').value = "Site: "+ plantName;
            worksheet.getCell('G1').value = "Site Capacity: "+plantCapacity;
            worksheet.getCell('A3').value = 'Device Name';
            worksheet.getCell('B3').value = 'DC Capacity (kW)';
            worksheet.getCell('C3').value = 'Daily Yield (kWh)';
            worksheet.getCell('D3').value = 'Specific Yield (kWh/m2)';
            worksheet.getCell('E3').value = 'Total Yield (kWh)';
            worksheet.getCell('F3').value = 'Max Output Power (kW)';
            worksheet.getCell('G3').value = 'Timestamp Max Output Power (HH:MM:SS)';
            worksheet.getCell('H3').value = 'Daily Runtime (H)';
            worksheet.getCell('I3').value = 'Total Runtime (H)';

            for(let i=0,j=4; i<deviceName.length;i++)
            {
                worksheet.getCell('A'+j).value = deviceName[i];
                worksheet.getCell('B'+j).value = capacity[i];
                worksheet.getCell('C'+j).value = dailyYield[i];
                worksheet.getCell('D'+j).value = specificYield[i];
                worksheet.getCell('E'+j).value = totalYield[i];
                worksheet.getCell('F'+j).value = maxOutputPower[i];
                worksheet.getCell('G'+j).value = maxOutputPowerTimestamp[i];
                worksheet.getCell('H'+j).value = dailyRuntime[i];
                worksheet.getCell('I'+j).value = totalRuntime[i];
                j++;
            }

            for(let i=0,k=0; i<plantProfile[0].centralizedInverter.details.length; i++)
            {
                let j=4;

                worksheet = workbook.worksheets[i+1];
                worksheet.getCell('E1').value = "Inverter Capacity: "+plantProfile[0].centralizedInverter.details[i].capacity+' kW';
                worksheet.getCell('G1').value = "Site: "+ plantName;
                worksheet.getCell('A3').value = 'Timestamp (HH:MM:SS)';
                worksheet.getCell('B3').value = 'Status';
                worksheet.getCell('C3').value = 'Daily Yield (kWh)';
                worksheet.getCell('D3').value = 'Total Yield (kWh)';
                worksheet.getCell('E3').value = 'Efficiency (%)';
                worksheet.getCell('F3').value = 'Temperature (°C)';
                worksheet.getCell('G3').value = 'Voltage R (V)';
                worksheet.getCell('H3').value = 'Voltage Y (V)';
                worksheet.getCell('I3').value = 'Voltage B (V)';
                worksheet.getCell('J3').value = 'Output Voltage (V)';
                worksheet.getCell('K3').value = 'Current R (A)';
                worksheet.getCell('L3').value = 'Current Y (A)';
                worksheet.getCell('M3').value = 'Current B (A)';
                worksheet.getCell('N3').value = 'Output Current (A)';
                worksheet.getCell('O3').value = 'Power R (kW)';
                worksheet.getCell('P3').value = 'Power Y (kW)';
                worksheet.getCell('Q3').value = 'Power B (kW)';
                worksheet.getCell('R3').value = 'Output Power (kW)';
                worksheet.getCell('S3').value = 'Frequency (Hz)';
                worksheet.getCell('T3').value = 'Power Factor';
                worksheet.getCell('U3').value = 'Input Current (A)';
                worksheet.getCell('V3').value = 'Input Power (kW)';
                worksheet.getCell('W3').value = 'Voltage Unit1 (V)';
                worksheet.getCell('X3').value = 'Voltage Unit2 (V)';
                worksheet.getCell('Y3').value = 'Voltage Unit3 (V)';
                worksheet.getCell('Z3').value = 'Voltage Unit4 (V)';
                worksheet.getCell('AA3').value = 'Voltage Unit5 (V)';
                worksheet.getCell('AB3').value = 'Voltage Unit6 (V)';
                worksheet.getCell('AC3').value = 'Voltage Unit7 (V)';
                worksheet.getCell('AD3').value = 'Voltage Unit8 (V)';
                worksheet.getCell('AE3').value = 'Current Unit1 (A)';
                worksheet.getCell('AF3').value = 'Current Unit2 (A)';
                worksheet.getCell('AG3').value = 'Current Unit3 (A)';
                worksheet.getCell('AH3').value = 'Current Unit4 (A)';
                worksheet.getCell('AI3').value = 'Current Unit5 (A)';
                worksheet.getCell('AJ3').value = 'Current Unit6 (A)';
                worksheet.getCell('AK3').value = 'Current Unit7 (A)';
                worksheet.getCell('AL3').value = 'Current Unit8 (A)';
                worksheet.getCell('AM3').value = 'Power Unit1 (kW)';
                worksheet.getCell('AN3').value = 'Power Unit2 (kW)';
                worksheet.getCell('AO3').value = 'Power Unit3 (kW)';
                worksheet.getCell('AP3').value = 'Power Unit4 (kW)';
                worksheet.getCell('AQ3').value = 'Power Unit5 (kW)';
                worksheet.getCell('AR3').value = 'Power Unit6 (kW)';
                worksheet.getCell('AS3').value = 'Power Unit7 (kW)';
                worksheet.getCell('AT3').value = 'Power Unit8 (kW)';
                // worksheet.getCell('AU3').value = 'String 1 (A)';
                // worksheet.getCell('AV3').value = 'String 2 (A)';
                // worksheet.getCell('AW3').value = 'String 3 (A)';
                // worksheet.getCell('AX3').value = 'String 4 (A)';
                // worksheet.getCell('AY3').value = 'String 5 (A)';
                // worksheet.getCell('AZ3').value = 'String 6 (A)';
                // worksheet.getCell('BA3').value = 'String 7 (A)';
                // worksheet.getCell('BB3').value = 'String 8 (A)';
                // worksheet.getCell('BC3').value = 'String 9 (A)';
                // worksheet.getCell('BD3').value = 'String 10 (A)';
                // worksheet.getCell('BE3').value = 'String 11 (A)';
                // worksheet.getCell('BF3').value = 'String 12 (A)';
                // worksheet.getCell('BG3').value = 'String 13 (A)';
                // worksheet.getCell('BH3').value = 'String 14 (A)';
                // worksheet.getCell('BI3').value = 'String 15 (A)';
                // worksheet.getCell('BJ3').value = 'String 16 (A)';
                // worksheet.getCell('BK3').value = 'String 17 (A)';
                // worksheet.getCell('BL3').value = 'String 18 (A)';
                // worksheet.getCell('BM3').value = 'String 19 (A)';
                // worksheet.getCell('BN3').value = 'String 20 (A)';
                // worksheet.getCell('BO3').value = 'String 21 (A)';
                // worksheet.getCell('BP3').value = 'String 22 (A)';
                // worksheet.getCell('BQ3').value = 'String 23 (A)';
                // worksheet.getCell('BR3').value = 'String 24 (A)';

                while(k<=logCentralizedInverter.value.length)
                {
                    if(typeof logCentralizedInverter.value[k] != 'undefined')
                    {
                        if(plantProfile[0].centralizedInverter.details[i].id == logCentralizedInverter.value[k].deviceNo)
                        {
                            if(logCentralizedInverter.value[k].timestamp)
                            {
                                let temp = new Date(logCentralizedInverter.value[k].timestamp);
                                worksheet.getCell('A'+j).value = temp.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                            }

                            if(logCentralizedInverter.value[k].status)
                            {
                                let status = logCentralizedInverter.value[k].status;
                                worksheet.getCell('B'+j).value = logCentralizedInverter.value[k].status;
                                getCell_Front( worksheet, 'B'+j, 11, 'FFFFFFFF');
                                if(status == 'Running')
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FF008000');
                                else if(status == 'Fault')
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FFFE0000');
                                else
                                    getCell_Fill( worksheet,'B'+j, 'pattern', 'solid', 'FFFFA500');
                            }
                            

                            if(logCentralizedInverter.value[k].dailyEnergy)
                                worksheet.getCell('C'+j).value = logCentralizedInverter.value[k].dailyEnergy;    
                            
                            if(logCentralizedInverter.value[k].totalEnergy)
                                worksheet.getCell('D'+j).value = logCentralizedInverter.value[k].totalEnergy;

                            if(logCentralizedInverter.value[k].efficiency)
                                worksheet.getCell('E'+j).value = logCentralizedInverter.value[k].efficiency;
                            
                            if(logCentralizedInverter.value[k].temperature)
                                worksheet.getCell('F'+j).value = logCentralizedInverter.value[k].temperature;

                            if(logCentralizedInverter.value[k].voltagePhaseR)
                                worksheet.getCell('G'+j).value = logCentralizedInverter.value[k].voltagePhaseR;

                            if(logCentralizedInverter.value[k].voltagePhaseY)
                                worksheet.getCell('H'+j).value = logCentralizedInverter.value[k].voltagePhaseY;

                            if(logCentralizedInverter.value[k].voltagePhaseB)
                                worksheet.getCell('I'+j).value = logCentralizedInverter.value[k].voltagePhaseB;

                            if(logCentralizedInverter.value[k].outputVoltage)
                                worksheet.getCell('J'+j).value = logCentralizedInverter.value[k].outputVoltage;

                            if(logCentralizedInverter.value[k].currentPhaseR)
                                worksheet.getCell('K'+j).value = logCentralizedInverter.value[k].currentPhaseR;
                                
                            if(logCentralizedInverter.value[k].currentPhaseY)
                                worksheet.getCell('L'+j).value = logCentralizedInverter.value[k].currentPhaseY;    

                            if(logCentralizedInverter.value[k].currentPhaseB)
                                worksheet.getCell('M'+j).value = logCentralizedInverter.value[k].currentPhaseB;

                            if(logCentralizedInverter.value[k].outputCurrent)
                                worksheet.getCell('N'+j).value = logCentralizedInverter.value[k].outputCurrent;

                            if(logCentralizedInverter.value[k].powerPhaseR)
                                worksheet.getCell('O'+j).value = logCentralizedInverter.value[k].powerPhaseR;

                            if(logCentralizedInverter.value[k].powerPhaseY)
                                worksheet.getCell('P'+j).value = logCentralizedInverter.value[k].powerPhaseY;

                            if(logCentralizedInverter.value[k].powerPhaseB)
                                worksheet.getCell('Q'+j).value = logCentralizedInverter.value[k].powerPhaseB;

                            if(logCentralizedInverter.value[k].activePower)
                                worksheet.getCell('R'+j).value = logCentralizedInverter.value[k].activePower;

                            if(logCentralizedInverter.value[k].frequency)
                                worksheet.getCell('S'+j).value = logCentralizedInverter.value[k].frequency;

                            if(logCentralizedInverter.value[k].powerFactor)
                                worksheet.getCell('T'+j).value = logCentralizedInverter.value[k].powerFactor;

                            if(logCentralizedInverter.value[k].inputCurrent)
                                worksheet.getCell('U'+j).value = logCentralizedInverter.value[k].inputCurrent;

                            if(logCentralizedInverter.value[k].inputPower)
                                worksheet.getCell('V'+j).value = logCentralizedInverter.value[k].inputPower;

                            if(logCentralizedInverter.value[k].voltageUnit1)
                                worksheet.getCell('W'+j).value = logCentralizedInverter.value[k].voltageUnit1;

                            if(logCentralizedInverter.value[k].voltageUnit2)
                                worksheet.getCell('X'+j).value = logCentralizedInverter.value[k].voltageUnit2;

                            if(logCentralizedInverter.value[k].voltageUnit3)
                                worksheet.getCell('Y'+j).value = logCentralizedInverter.value[k].voltageUnit3;

                            if(logCentralizedInverter.value[k].voltageUnit4)
                                worksheet.getCell('Z'+j).value = logCentralizedInverter.value[k].voltageUnit4;

                            if(logCentralizedInverter.value[k].voltageUnit5)
                                worksheet.getCell('AA'+j).value = logCentralizedInverter.value[k].voltageUnit5;

                            if(logCentralizedInverter.value[k].voltageUnit6)
                                worksheet.getCell('AB'+j).value = logCentralizedInverter.value[k].voltageUnit6;

                            if(logCentralizedInverter.value[k].voltageUnit7)
                                worksheet.getCell('AC'+j).value = logCentralizedInverter.value[k].voltageUnit7;

                            if(logCentralizedInverter.value[k].voltageUnit8)
                                worksheet.getCell('AD'+j).value = logCentralizedInverter.value[k].voltageUnit8;
                            
                            if(logCentralizedInverter.value[k].currentUnit1)
                                worksheet.getCell('AE'+j).value = logCentralizedInverter.value[k].currentUnit1;
                                
                            if(logCentralizedInverter.value[k].currentUnit2)
                                worksheet.getCell('AF'+j).value = logCentralizedInverter.value[k].currentUnit2;
                            
                            if(logCentralizedInverter.value[k].currentUnit3)
                                worksheet.getCell('AG'+j).value = logCentralizedInverter.value[k].currentUnit3;

                            if(logCentralizedInverter.value[k].currentUnit4)
                                worksheet.getCell('AH'+j).value = logCentralizedInverter.value[k].currentUnit4;
                            
                            if(logCentralizedInverter.value[k].currentUnit5)
                                worksheet.getCell('AI'+j).value = logCentralizedInverter.value[k].currentUnit5;
                                
                            if(logCentralizedInverter.value[k].currentUnit6)
                                worksheet.getCell('AJ'+j).value = logCentralizedInverter.value[k].currentUnit6;
                            
                            if(logCentralizedInverter.value[k].currentUnit7)
                                worksheet.getCell('AK'+j).value = logCentralizedInverter.value[k].currentUnit7;
                                
                            if(logCentralizedInverter.value[k].currentUnit8)
                                worksheet.getCell('AL'+j).value = logCentralizedInverter.value[k].currentUnit8;

                            if(logCentralizedInverter.value[k].powerUnit1)
                                worksheet.getCell('AM'+j).value = logCentralizedInverter.value[k].powerUnit1;

                            if(logCentralizedInverter.value[k].powerUnit2)
                                worksheet.getCell('AN'+j).value = logCentralizedInverter.value[k].powerUnit2;

                            if(logCentralizedInverter.value[k].powerUnit3)
                                worksheet.getCell('AO'+j).value = logCentralizedInverter.value[k].powerUnit3;

                            if(logCentralizedInverter.value[k].powerUnit4)
                                worksheet.getCell('AP'+j).value = logCentralizedInverter.value[k].powerUnit4;

                            if(logCentralizedInverter.value[k].powerUnit5)
                                worksheet.getCell('AQ'+j).value = logCentralizedInverter.value[k].powerUnit5;

                            if(logCentralizedInverter.value[k].powerUnit6)
                                worksheet.getCell('AR'+j).value = logCentralizedInverter.value[k].powerUnit6;

                            if(logCentralizedInverter.value[k].powerUnit7)
                                worksheet.getCell('AS'+j).value = logCentralizedInverter.value[k].powerUnit7;

                            if(logCentralizedInverter.value[k].powerUnit8)
                                worksheet.getCell('AT'+j).value = logCentralizedInverter.value[k].powerUnit8;

                            // if(logStringInverter.value[k].currentString1)
                            //     worksheet.getCell('AU'+j).value = logStringInverter.value[k].currentString1;

                            // if(logStringInverter.value[k].currentString2)
                            //     worksheet.getCell('AV'+j).value = logStringInverter.value[k].currentString2;

                            // if(logStringInverter.value[k].currentString3)
                            //     worksheet.getCell('AW'+j).value = logStringInverter.value[k].currentString3;

                            // if(logStringInverter.value[k].currentString4)
                            //     worksheet.getCell('AX'+j).value = logStringInverter.value[k].currentString4;

                            // if(logStringInverter.value[k].currentString5)
                            //     worksheet.getCell('AY'+j).value = logStringInverter.value[k].currentString5;

                            // if(logStringInverter.value[k].currentString6)
                            //     worksheet.getCell('AZ'+j).value = logStringInverter.value[k].currentString6;

                            // if(logStringInverter.value[k].currentString7)
                            //     worksheet.getCell('BA'+j).value = logStringInverter.value[k].currentString7;

                            // if(logStringInverter.value[k].currentString8)
                            //     worksheet.getCell('BB'+j).value = logStringInverter.value[k].currentString8;

                            // if(logStringInverter.value[k].currentString9)
                            //     worksheet.getCell('BC'+j).value = logStringInverter.value[k].currentString9;

                            // if(logStringInverter.value[k].currentString10)
                            //     worksheet.getCell('BD'+j).value = logStringInverter.value[k].currentString10;

                            // if(logStringInverter.value[k].currentString11)
                            //     worksheet.getCell('BE'+j).value = logStringInverter.value[k].currentString11;

                            // if(logStringInverter.value[k].currentString12)
                            //     worksheet.getCell('BF'+j).value = logStringInverter.value[k].currentString12;

                            // if(logStringInverter.value[k].currentString13)
                            //     worksheet.getCell('BG'+j).value = logStringInverter.value[k].currentString13;

                            // if(logStringInverter.value[k].currentString14)
                            //     worksheet.getCell('BH'+j).value = logStringInverter.value[k].currentString14;

                            // if(logStringInverter.value[k].currentString15)
                            //     worksheet.getCell('BI'+j).value = logStringInverter.value[k].currentString15;

                            // if(logStringInverter.value[k].currentString16)
                            //     worksheet.getCell('BJ'+j).value = logStringInverter.value[k].currentString16;

                            // if(logStringInverter.value[k].currentString17)
                            //     worksheet.getCell('BK'+j).value = logStringInverter.value[k].currentString17;

                            // if(logStringInverter.value[k].currentString18)
                            //     worksheet.getCell('BL'+j).value = logStringInverter.value[k].currentString18;

                            // if(logStringInverter.value[k].currentString19)
                            //     worksheet.getCell('BM'+j).value = logStringInverter.value[k].currentString19;

                            // if(logStringInverter.value[k].currentString20)
                            //     worksheet.getCell('BN'+j).value = logStringInverter.value[k].currentString20;

                            // if(logStringInverter.value[k].currentString21)
                            //     worksheet.getCell('BO'+j).value = logStringInverter.value[k].currentString21;

                            // if(logStringInverter.value[k].currentString22)
                            //     worksheet.getCell('BP'+j).value = logStringInverter.value[k].currentString22;

                            // if(logStringInverter.value[k].currentString23)
                            //     worksheet.getCell('BQ'+j).value = logStringInverter.value[k].currentString23;

                            // if(logStringInverter.value[k].currentString24)
                            //     worksheet.getCell('BR'+j).value = logStringInverter.value[k].currentString24;

                            j++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    
                    k++;
                }
            }

        }
        else if(device == 'Weather Station')
        {
            let query = [ 
        
                //Weather Station Summary
                WeatherStation.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$gte': new Date(GMTDateGT), 
                          '$lte': new Date(GMTDateLT)
                        }, 
                        'plantId': plantId
                      }
                    }, {
                      '$group': {
                        '_id': {
                          'deviceNo': '$deviceNo'
                        }, 
                        'cumulativeGHI': {
                          '$last': '$cumulativeGHI'
                        }, 
                        'cumulativeGTI1': {
                          '$last': '$cumulativeGTI1'
                        }, 
                        'cumulativeGTI2': {
                          '$last': '$cumulativeGTI2'
                        }, 
                        'cumulativeGTI3': {
                          '$last': '$cumulativeGTI3'
                        }, 
                        'cumulativeGTI4': {
                          '$last': '$cumulativeGTI4'
                        }, 
                        'cumulativeGTI5': {
                          '$last': '$cumulativeGTI5'
                        }
                      }
                    }, {
                      '$addFields': {
                        'deviceNo': '$_id.deviceNo'
                      }
                    }, {
                      '$project': {
                        '_id': 0
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1
                      }
                    }
                ]),

                //Weather Station Log
                WeatherStation.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT), 
                          '$gte': new Date(GMTDateGT)
                        }, 
                        'plantId': plantId,
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1, 
                        'timestamp': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ weatherStationSummary, logWeatherStation ] = await Promise.allSettled(query);

            let clientName;
            let plantName;
            let plantCapacity;
            let deviceName = [];
            let cumulativeGHI = [];
            let cumulativeGTI1 = [];
            let cumulativeGTI2 = [];
            let cumulativeGTI3 = [];
            let cumulativeGTI4 = [];
            let cumulativeGTI5 = [];
        
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';

            if(typeof weatherStationSummary.value != 'undefined')
            {
                let i = 0;
                
                plantProfile[0].weatherStation.details.forEach(element => {
                    
                    if(typeof weatherStationSummary.value[i] != 'undefined')
                    {
                        if(element.id == weatherStationSummary.value[i].deviceNo)
                        {
                            deviceName.push(element.name);
                            cumulativeGHI.push(weatherStationSummary.value[0].cumulativeGHI);
                            cumulativeGTI1.push(weatherStationSummary.value[0].cumulativeGTI1);
                            cumulativeGTI2.push(weatherStationSummary.value[0].cumulativeGTI2);
                            i++;
                        }
                        else
                        {
                            deviceName.push(element.name);
                            cumulativeGHI.push(element.capacity);
                            cumulativeGTI1.push(null);
                            cumulativeGTI2.push(null);
                        }
                    }
                    else
                    {
                        deviceName.push(element.name);
                        cumulativeGHI.push(element.capacity);
                        cumulativeGTI1.push(null);
                        cumulativeGTI2.push(null);
                    } 
                });
            }
              
            workbook.addWorksheet('WeatherStation Summary');
            
            plantProfile[0].weatherStation.details.forEach(element => {
                workbook.addWorksheet(element.name);
            });
            
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:Z2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('E1').value = "Site: "+ plantName;
                worksheet.getCell('G1').value = "Site Capacity: "+plantCapacity;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"]

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
           
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 }];

                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });

            worksheet = workbook.getWorksheet('WeatherStation Summary');

            worksheet.getCell('A3').value = 'Device Name';
            worksheet.getCell('B3').value = 'Cumulative GHI (kWh/m2)';
            worksheet.getCell('C3').value = 'Cumulative GTI (kWh/m2)';
            worksheet.getCell('D3').value = 'Cumulative GTI1 (kWh/m2)';
            worksheet.getCell('E3').value = 'Cumulative GTI2 (kWh/m2)';
            worksheet.getCell('F3').value = 'Cumulative GTI3 (kWh/m2)';
            worksheet.getCell('G3').value = 'Cumulative GTI4 (kWh/m2)';

            for(let i=0,j=4; i<deviceName.length;i++)
            {
                worksheet.getCell('A'+j).value = deviceName[i];
                worksheet.getCell('B'+j).value = cumulativeGHI[i];
                worksheet.getCell('C'+j).value = cumulativeGTI1[i];
                worksheet.getCell('D'+j).value = cumulativeGTI2[i];
                worksheet.getCell('E'+j).value = cumulativeGTI3[i];
                worksheet.getCell('F'+j).value = cumulativeGTI4[i];
                worksheet.getCell('G'+j).value = cumulativeGTI5[i];
                j++;
            }

            for(let i=0,k=0; i<plantProfile[0].weatherStation.details.length; i++)
            {
                let j=4;
                worksheet = workbook.worksheets[i+1];
                worksheet.getCell('A3').value = 'Timestamp (HH:MM:SS)';
                worksheet.getCell('B3').value = 'GHI (W/m2)';
                worksheet.getCell('C3').value = 'Cum. GHI (kWh/m2)';
                worksheet.getCell('D3').value = 'GTI (W/m2)';
                worksheet.getCell('E3').value = 'Cum. GTI (kWh/m2)';
                worksheet.getCell('F3').value = 'GTI1 (W/m2)';
                worksheet.getCell('G3').value = 'Cum. GTI1 (kWh/m2)';
                worksheet.getCell('H3').value = 'GTI2 (W/m2)';
                worksheet.getCell('I3').value = 'Cum. GTI2 (kWh/m2)';
                worksheet.getCell('J3').value = 'GTI3 (W/m2)';
                worksheet.getCell('K3').value = 'Cum. GTI3 (kWh/m2)';
                worksheet.getCell('L3').value = 'GTI4 (W/m2)';
                worksheet.getCell('M3').value = 'Cum. GTI4 (kWh/m2)';
                worksheet.getCell('N3').value = 'Ambient Temp. (°C)';
                worksheet.getCell('O3').value = 'Module Temp. (°C)';
                worksheet.getCell('P3').value = 'Module Temp.1 (°C)';
                worksheet.getCell('Q3').value = 'Module Temp.2 (°C)';
                worksheet.getCell('R3').value = 'Module Temp.3 (°C)';
                worksheet.getCell('S3').value = 'Module Temp.4 (°C)';
                worksheet.getCell('T3').value = 'Wind Speed (m/s)';
                worksheet.getCell('U3').value = 'Wind Direction (°)';
                worksheet.getCell('V3').value = 'Relative Humidity (%)';
                worksheet.getCell('W3').value = 'Rainfall (mm)';

                while(k<=logWeatherStation.value.length)
                {
                    if(typeof logWeatherStation.value[k] != 'undefined')
                    {
                        if(plantProfile[0].weatherStation.details[i].id == logWeatherStation.value[k].deviceNo)
                        {
                            if(logWeatherStation.value[k].timestamp)
                            {
                                let temp = new Date(logWeatherStation.value[k].timestamp);
                                worksheet.getCell('A'+j).value = temp.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                            }

                            if(logWeatherStation.value[k].GHI || logWeatherStation.value[k].GHI == 0)
                                worksheet.getCell('B'+j).value = logWeatherStation.value[k].GHI;  
                            
                            if(logWeatherStation.value[k].cumulativeGHI || logWeatherStation.value[k].cumulativeGHI == 0)
                                worksheet.getCell('C'+j).value = logWeatherStation.value[k].cumulativeGHI;    
                            
                            if(logWeatherStation.value[k].GTI1 || logWeatherStation.value[k].GTI1 == 0)
                                worksheet.getCell('D'+j).value = logWeatherStation.value[k].GTI1;

                            if(logWeatherStation.value[k].cumulativeGTI1 || logWeatherStation.value[k].cumulativeGTI1 == 0)
                                worksheet.getCell('E'+j).value = logWeatherStation.value[k].cumulativeGTI1;
                            
                            if(logWeatherStation.value[k].GTI2 || logWeatherStation.value[k].GTI2 == 0)
                                worksheet.getCell('F'+j).value = logWeatherStation.value[k].GTI2;

                            if(logWeatherStation.value[k].cumulativeGTI2 || logWeatherStation.value[k].cumulativeGTI2 == 0)
                                worksheet.getCell('G'+j).value = logWeatherStation.value[k].cumulativeGTI2;

                            if(logWeatherStation.value[k].GTI3 || logWeatherStation.value[k].GTI3 == 0)
                                worksheet.getCell('H'+j).value = logWeatherStation.value[k].GTI3;

                            if(logWeatherStation.value[k].cumulativeGTI3 || logWeatherStation.value[k].cumulativeGTI3 == 0)
                                worksheet.getCell('I'+j).value = logWeatherStation.value[k].cumulativeGTI3;

                            if(logWeatherStation.value[k].GTI4 || logWeatherStation.value[k].GTI4 == 0)
                                worksheet.getCell('J'+j).value = logWeatherStation.value[k].GTI4;

                            if(logWeatherStation.value[k].cumulativeGTI4 || logWeatherStation.value[k].cumulativeGTI4 == 0)
                                worksheet.getCell('K'+j).value = logWeatherStation.value[k].cumulativeGTI4;
                                
                            if(logWeatherStation.value[k].GTI5 || logWeatherStation.value[k].GTI5 == 0)
                                worksheet.getCell('L'+j).value = logWeatherStation.value[k].GTI5;
      
                            if(logWeatherStation.value[k].cumulativeGTI5 || logWeatherStation.value[k].cumulativGTI5 == 0)
                                worksheet.getCell('M'+j).value = logWeatherStation.value[k].cumulativeGTI5;

                            if(logWeatherStation.value[k].ambientTemperature || logWeatherStation.value[k].ambientTemperature == 0)
                                worksheet.getCell('N'+j).value = logWeatherStation.value[k].ambientTemperature;    

                            if(logWeatherStation.value[k].moduleTemperature1 || logWeatherStation.value[k].moduleTemperature1 == 0)
                                worksheet.getCell('O'+j).value = logWeatherStation.value[k].moduleTemperature1;

                            if(logWeatherStation.value[k].moduleTemperature2 || logWeatherStation.value[k].moduleTemperature2 == 0)
                                worksheet.getCell('P'+j).value = logWeatherStation.value[k].moduleTemperature2;

                            if(logWeatherStation.value[k].moduleTemperature3 || logWeatherStation.value[k].moduleTemperature3 == 0)
                                worksheet.getCell('Q'+j).value = logWeatherStation.value[k].moduleTemperature3;

                            if(logWeatherStation.value[k].moduleTemperature4 || logWeatherStation.value[k].moduleTemperature4 == 0)
                                worksheet.getCell('R'+j).value = logWeatherStation.value[k].moduleTemperature4;

                            if(logWeatherStation.value[k].moduleTemperature5 || logWeatherStation.value[k].moduleTemperature5 == 0)
                                worksheet.getCell('S'+j).value = logWeatherStation.value[k].moduleTemperature5;

                            if(logWeatherStation.value[k].windSpeed || logWeatherStation.value[k].windSpeed == 0)
                                worksheet.getCell('T'+j).value = logWeatherStation.value[k].windSpeed;

                            if(logWeatherStation.value[k].windDirection || logWeatherStation.value[k].windDirection == 0)
                                worksheet.getCell('U'+j).value = logWeatherStation.value[k].windDirection;

                            if(logWeatherStation.value[k].relativeHumidity || logWeatherStation.value[k].relativeHumidity == 0)
                                worksheet.getCell('V'+j).value = logWeatherStation.value[k].relativeHumidity;

                            if(logWeatherStation.value[k].rainGauge || logWeatherStation.value[k].rainGauge == 0)
                                worksheet.getCell('W'+j).value = logWeatherStation.value[k].rainGauge;


                            j++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    
                    k++;
                }
            }
        }
        else if(device == 'Meter')
        {
            let query = [

                //Meter Inverter logs
                Meter.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                          '$lte': new Date(GMTDateLT1), 
                          '$gte': new Date(GMTDateGT1)
                        }, 
                        'plantId': plantId,
                        'errorFlag': 0,
                        'solutionFlag':'MFM'
                      }
                    }, {
                      '$sort': {
                        'deviceNo': 1, 
                        'timestamp': 1
                      }
                    }
                ])
            ]

            //Execute Queries
            let [ logMeter ] = await Promise.allSettled(query);

            let clientName;
            let plantName;
            let plantCapacity;
 
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';

            plantProfile[0].meter.details.forEach(element => {
                workbook.addWorksheet(element.name);
            });
            
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:D2');
                worksheet.mergeCells('E1:F2');
                worksheet.mergeCells('G1:H2');
                worksheet.mergeCells('I1:J2');
                worksheet.mergeCells('K1:BZ2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                let tempDate = new Date(GMTDateGT);
                worksheet.getCell('C1').value = 'Date: '+ tempDate.toLocaleDateString("en-IN", {dateStyle:"medium"});;
                worksheet.getCell('I1').value = "Client: "+clientName;

                let columns =["A1","C1","E1","G1","I1","K1"]

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
            
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3",
                "AA3","AB3","AC3","AD3","AE3","AF3","AG3","AH3","AI3","AJ3","AK3","AL3","AM3","AN3","AO3","AP3","AQ3","AR3","AS3","AT3","AU3","AV3","AW3","AX3","AY3","AZ3",
                "BA3","BB3","BC3","BD3","BE3","BF3","BG3","BH3","BI3","BJ3","BK3","BL3","BM3","BN3","BO3","BP3","BQ3","BR3","BS3","BT3","BU3","BV3","BW3","BX3","BY3","BZ3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 }];
            
                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });

            for(let i=0,k=0; i<plantProfile[0].meter.details.length; i++)
            {
                let j=4;

                worksheet = workbook.worksheets[i];
                worksheet.getCell('E1').value = plantProfile[0].meter.details[i].building+' '+plantProfile[0].meter.details[i].name;
                worksheet.getCell('G1').value = "Site: "+ plantName;
                worksheet.getCell('A3').value = 'Timestamp (HH:MM:SS)';
                worksheet.getCell('B3').value = 'Voltage R (V)';
                worksheet.getCell('C3').value = 'Voltage Y (V)';
                worksheet.getCell('D3').value = 'Voltage B (V)';
                worksheet.getCell('E3').value = 'Voltage Avg (V)';
                worksheet.getCell('F3').value = 'Current R (A)';
                worksheet.getCell('G3').value = 'Current Y (A)';
                worksheet.getCell('H3').value = 'Current B (A)';
                worksheet.getCell('I3').value = 'Current N (A)';
                worksheet.getCell('J3').value = 'Active Power R (kW)';
                worksheet.getCell('K3').value = 'Active Power Y (kW)';
                worksheet.getCell('L3').value = 'Active Power B (kW)';
                worksheet.getCell('M3').value = 'Active Power (kW)';
                worksheet.getCell('N3').value = 'Reactive Power R (kW)';
                worksheet.getCell('O3').value = 'Reactive Power Y (kW)';
                worksheet.getCell('P3').value = 'Reactive Power B (kW)';
                worksheet.getCell('Q3').value = 'Reactive Power (kW)';
                worksheet.getCell('R3').value = 'PowerFactor R';
                worksheet.getCell('S3').value = 'PowerFactor Y';
                worksheet.getCell('T3').value = 'PowerFactor B';
                worksheet.getCell('U3').value = 'PowerFactor';
                worksheet.getCell('V3').value = 'Frequency (Hz)';
                worksheet.getCell('W3').value = 'Active Energy Import (kWh)';
                worksheet.getCell('X3').value = 'Active Energy Export (kWh)';
                worksheet.getCell('Y3').value = 'Net Active Energy (kWh)';
                worksheet.getCell('Z3').value = 'Reactive Energy Import (kWh)';
                worksheet.getCell('AA3').value = 'Reactive Energy Export (kWh)';
                worksheet.getCell('AB3').value = 'Net Reactive Energy (kWh)';
                // worksheet.getCell('AC3').value = 'Voltage MPPT7 (V)';
                // worksheet.getCell('AD3').value = 'Voltage MPPT8 (V)';
                // worksheet.getCell('AE3').value = 'Current MPPT1 (A)';
                // worksheet.getCell('AF3').value = 'Current MPPT2 (A)';
                // worksheet.getCell('AG3').value = 'Current MPPT3 (A)';
                // worksheet.getCell('AH3').value = 'Current MPPT4 (A)';
                // worksheet.getCell('AI3').value = 'Current MPPT5 (A)';
                // worksheet.getCell('AJ3').value = 'Current MPPT6 (A)';
                // worksheet.getCell('AK3').value = 'Current MPPT7 (A)';
                // worksheet.getCell('AL3').value = 'Current MPPT8 (A)';
                // worksheet.getCell('AM3').value = 'Power MPPT1 (kW)';
                // worksheet.getCell('AN3').value = 'Power MPPT2 (kW)';
                // worksheet.getCell('AO3').value = 'Power MPPT3 (kW)';
                // worksheet.getCell('AP3').value = 'Power MPPT4 (kW)';
                // worksheet.getCell('AQ3').value = 'Power MPPT5 (kW)';
                // worksheet.getCell('AR3').value = 'Power MPPT6 (kW)';
                // worksheet.getCell('AS3').value = 'Power MPPT7 (kW)';
                // worksheet.getCell('AT3').value = 'Power MPPT8 (kW)';
                // worksheet.getCell('AU3').value = 'String 1 (A)';
                // worksheet.getCell('AV3').value = 'String 2 (A)';
                // worksheet.getCell('AW3').value = 'String 3 (A)';
                // worksheet.getCell('AX3').value = 'String 4 (A)';
                // worksheet.getCell('AY3').value = 'String 5 (A)';
                // worksheet.getCell('AZ3').value = 'String 6 (A)';
                // worksheet.getCell('BA3').value = 'String 7 (A)';
                // worksheet.getCell('BB3').value = 'String 8 (A)';
                // worksheet.getCell('BC3').value = 'String 9 (A)';
                // worksheet.getCell('BD3').value = 'String 10 (A)';
                // worksheet.getCell('BE3').value = 'String 11 (A)';
                // worksheet.getCell('BF3').value = 'String 12 (A)';
                // worksheet.getCell('BG3').value = 'String 13 (A)';
                // worksheet.getCell('BH3').value = 'String 14 (A)';
                // worksheet.getCell('BI3').value = 'String 15 (A)';
                // worksheet.getCell('BJ3').value = 'String 16 (A)';
                // worksheet.getCell('BK3').value = 'String 17 (A)';
                // worksheet.getCell('BL3').value = 'String 18 (A)';
                // worksheet.getCell('BM3').value = 'String 19 (A)';
                // worksheet.getCell('BN3').value = 'String 20 (A)';
                // worksheet.getCell('BO3').value = 'String 21 (A)';
                // worksheet.getCell('BP3').value = 'String 22 (A)';
                // worksheet.getCell('BQ3').value = 'String 23 (A)';
                // worksheet.getCell('BR3').value = 'String 24 (A)';

                while(k<=logMeter.value.length)
                {
                    if(typeof logMeter.value[k] != 'undefined')
                    {
                        if(plantProfile[0].meter.details[i].id == logMeter.value[k].deviceNo)
                        {
                            if(logMeter.value[k].timestamp)
                            {
                                let temp = new Date(logMeter.value[k].timestamp);
                                worksheet.getCell('A'+j).value = temp.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                            }

                            if(logMeter.value[k].voltagePhaseR)
                                worksheet.getCell('B'+j).value = logMeter.value[k].voltagePhaseR;
                            
                            if(logMeter.value[k].voltagePhaseY)
                                worksheet.getCell('C'+j).value = logMeter.value[k].voltagePhaseY;    
                            
                            if(logMeter.value[k].voltagePhaseB)
                                worksheet.getCell('D'+j).value = logMeter.value[k].voltagePhaseB;

                            if(logMeter.value[k].voltageAvg)
                                worksheet.getCell('E'+j).value = logMeter.value[k].voltageAvg;
                            
                            if(logMeter.value[k].currentPhaseR)
                                worksheet.getCell('F'+j).value = logMeter.value[k].currentPhaseR;

                            if(logMeter.value[k].currentPhaseY)
                                worksheet.getCell('G'+j).value = logMeter.value[k].currentPhaseY;

                            if(logMeter.value[k].currentPhaseB)
                                worksheet.getCell('H'+j).value = logMeter.value[k].currentPhaseB;

                            if(logMeter.value[k].currentPhaseN)
                                worksheet.getCell('I'+j).value = logMeter.value[k].currentPhaseN;

                            if(logMeter.value[k].activePowerPhaseR)
                                worksheet.getCell('J'+j).value = logMeter.value[k].activePowerPhaseR;

                            if(logMeter.value[k].activePowerPhaseY)
                                worksheet.getCell('K'+j).value = logMeter.value[k].activePowerPhaseY;
                                
                            if(logMeter.value[k].activePowerPhaseB)
                                worksheet.getCell('L'+j).value = logMeter.value[k].activePowerPhaseB;    

                            if(logMeter.value[k].activePower)
                                worksheet.getCell('M'+j).value = logMeter.value[k].activePower;

                            if(logMeter.value[k].reactivePowerPhaseR)
                                worksheet.getCell('N'+j).value = logMeter.value[k].reactivePowerPhaseR;

                            if(logMeter.value[k].reactivePowerPhaseY)
                                worksheet.getCell('O'+j).value = logMeter.value[k].reactivePowerPhaseY;

                            if(logMeter.value[k].reactivePowerPhaseB)
                                worksheet.getCell('P'+j).value = logMeter.value[k].reactivePowerPhaseB;

                            if(logMeter.value[k].reactivePower)
                                worksheet.getCell('Q'+j).value = logMeter.value[k].reactivePower;

                            if(logMeter.value[k].powerFactorPhaseR)
                                worksheet.getCell('R'+j).value = logMeter.value[k].powerFactorPhaseR;

                            if(logMeter.value[k].powerFactorPhaseY)
                                worksheet.getCell('S'+j).value = logMeter.value[k].powerFactorPhaseY;

                            if(logMeter.value[k].powerFactorPhaseB)
                                worksheet.getCell('T'+j).value = logMeter.value[k].powerFactorPhaseB;

                            if(logMeter.value[k].powerFactor)
                                worksheet.getCell('U'+j).value = logMeter.value[k].powerFactor;

                            if(logMeter.value[k].frequency)
                                worksheet.getCell('V'+j).value = logMeter.value[k].frequency;

                            if(logMeter.value[k].activeEnergyImport)
                                worksheet.getCell('W'+j).value = logMeter.value[k].activeEnergyImport;

                            if(logMeter.value[k].activeEnergyExport)
                                worksheet.getCell('X'+j).value = logMeter.value[k].activeEnergyExport;

                            if(logMeter.value[k].netActiveEnergy)
                                worksheet.getCell('Y'+j).value = logMeter.value[k].netActiveEnergy;

                            if(logMeter.value[k].reactiveEnergyImport)
                                worksheet.getCell('Z'+j).value = logMeter.value[k].reactiveEnergyImport;

                            if(logMeter.value[k].reactiveEnergyExport)
                                worksheet.getCell('AA'+j).value = logMeter.value[k].reactiveEnergyExport;

                            if(logMeter.value[k].netReactiveEnergy)
                                worksheet.getCell('AB'+j).value = logMeter.value[k].netReactiveEnergy;

                            // if(logStringInverter.value[k].voltageMPPT7)
                            //     worksheet.getCell('AC'+j).value = logStringInverter.value[k].voltageMPPT7;

                            // if(logStringInverter.value[k].voltageMPPT8)
                            //     worksheet.getCell('AD'+j).value = logStringInverter.value[k].voltageMPPT8;
                            
                            // if(logStringInverter.value[k].currentMPPT1)
                            //     worksheet.getCell('AE'+j).value = logStringInverter.value[k].currentMPPT1;
                                
                            // if(logStringInverter.value[k].currentMPPT2)
                            //     worksheet.getCell('AF'+j).value = logStringInverter.value[k].currentMPPT2;
                            
                            // if(logStringInverter.value[k].currentMPPT3)
                            //     worksheet.getCell('AG'+j).value = logStringInverter.value[k].currentMPPT3;

                            // if(logStringInverter.value[k].currentMPPT4)
                            //     worksheet.getCell('AH'+j).value = logStringInverter.value[k].currentMPPT4;
                            
                            // if(logStringInverter.value[k].currentMPPT5)
                            //     worksheet.getCell('AI'+j).value = logStringInverter.value[k].currentMPPT5;
                                
                            // if(logStringInverter.value[k].currentMPPT6)
                            //     worksheet.getCell('AJ'+j).value = logStringInverter.value[k].currentMPPT6;
                            
                            // if(logStringInverter.value[k].currentMPPT7)
                            //     worksheet.getCell('AK'+j).value = logStringInverter.value[k].currentMPPT7;
                                
                            // if(logStringInverter.value[k].currentMPPT8)
                            //     worksheet.getCell('AL'+j).value = logStringInverter.value[k].currentMPPT8;

                            // if(logStringInverter.value[k].powerMPPT1)
                            //     worksheet.getCell('AM'+j).value = logStringInverter.value[k].powerMPPT1;

                            // if(logStringInverter.value[k].powerMPPT2)
                            //     worksheet.getCell('AN'+j).value = logStringInverter.value[k].powerMPPT2;

                            // if(logStringInverter.value[k].powerMPPT3)
                            //     worksheet.getCell('AO'+j).value = logStringInverter.value[k].powerMPPT3;

                            // if(logStringInverter.value[k].powerMPPT4)
                            //     worksheet.getCell('AP'+j).value = logStringInverter.value[k].powerMPPT4;

                            // if(logStringInverter.value[k].powerMPPT5)
                            //     worksheet.getCell('AQ'+j).value = logStringInverter.value[k].powerMPPT5;

                            // if(logStringInverter.value[k].powerMPPT6)
                            //     worksheet.getCell('AR'+j).value = logStringInverter.value[k].powerMPPT6;

                            // if(logStringInverter.value[k].powerMPPT7)
                            //     worksheet.getCell('AS'+j).value = logStringInverter.value[k].powerMPPT7;

                            // if(logStringInverter.value[k].powerMPPT8)
                            //     worksheet.getCell('AT'+j).value = logStringInverter.value[k].powerMPPT8;

                            // if(logStringInverter.value[k].currentString1)
                            //     worksheet.getCell('AU'+j).value = logStringInverter.value[k].currentString1;

                            // if(logStringInverter.value[k].currentString2)
                            //     worksheet.getCell('AV'+j).value = logStringInverter.value[k].currentString2;

                            // if(logStringInverter.value[k].currentString3)
                            //     worksheet.getCell('AW'+j).value = logStringInverter.value[k].currentString3;

                            // if(logStringInverter.value[k].currentString4)
                            //     worksheet.getCell('AX'+j).value = logStringInverter.value[k].currentString4;

                            // if(logStringInverter.value[k].currentString5)
                            //     worksheet.getCell('AY'+j).value = logStringInverter.value[k].currentString5;

                            // if(logStringInverter.value[k].currentString6)
                            //     worksheet.getCell('AZ'+j).value = logStringInverter.value[k].currentString6;

                            // if(logStringInverter.value[k].currentString7)
                            //     worksheet.getCell('BA'+j).value = logStringInverter.value[k].currentString7;

                            // if(logStringInverter.value[k].currentString8)
                            //     worksheet.getCell('BB'+j).value = logStringInverter.value[k].currentString8;

                            // if(logStringInverter.value[k].currentString9)
                            //     worksheet.getCell('BC'+j).value = logStringInverter.value[k].currentString9;

                            // if(logStringInverter.value[k].currentString10)
                            //     worksheet.getCell('BD'+j).value = logStringInverter.value[k].currentString10;

                            // if(logStringInverter.value[k].currentString11)
                            //     worksheet.getCell('BE'+j).value = logStringInverter.value[k].currentString11;

                            // if(logStringInverter.value[k].currentString12)
                            //     worksheet.getCell('BF'+j).value = logStringInverter.value[k].currentString12;

                            // if(logStringInverter.value[k].currentString13)
                            //     worksheet.getCell('BG'+j).value = logStringInverter.value[k].currentString13;

                            // if(logStringInverter.value[k].currentString14)
                            //     worksheet.getCell('BH'+j).value = logStringInverter.value[k].currentString14;

                            // if(logStringInverter.value[k].currentString15)
                            //     worksheet.getCell('BI'+j).value = logStringInverter.value[k].currentString15;

                            // if(logStringInverter.value[k].currentString16)
                            //     worksheet.getCell('BJ'+j).value = logStringInverter.value[k].currentString16;

                            // if(logStringInverter.value[k].currentString17)
                            //     worksheet.getCell('BK'+j).value = logStringInverter.value[k].currentString17;

                            // if(logStringInverter.value[k].currentString18)
                            //     worksheet.getCell('BL'+j).value = logStringInverter.value[k].currentString18;

                            // if(logStringInverter.value[k].currentString19)
                            //     worksheet.getCell('BM'+j).value = logStringInverter.value[k].currentString19;

                            // if(logStringInverter.value[k].currentString20)
                            //     worksheet.getCell('BN'+j).value = logStringInverter.value[k].currentString20;

                            // if(logStringInverter.value[k].currentString21)
                            //     worksheet.getCell('BO'+j).value = logStringInverter.value[k].currentString21;

                            // if(logStringInverter.value[k].currentString22)
                            //     worksheet.getCell('BP'+j).value = logStringInverter.value[k].currentString22;

                            // if(logStringInverter.value[k].currentString23)
                            //     worksheet.getCell('BQ'+j).value = logStringInverter.value[k].currentString23;

                            // if(logStringInverter.value[k].currentString24)
                            //     worksheet.getCell('BR'+j).value = logStringInverter.value[k].currentString24;

                            j++;
                        }
                        else
                        {
                            break;
                        }
                    }
                    
                    k++;
                }
            }
        }
          
       return  { status:true, response:workbook };
    }
    catch(err){
        console.log(err);
        const response ={
            status: false,
            message: err.message
        }
        return response;
    }
}

exports.reportDurationService = async(username, plantIds, timestampRaw1, timestampRaw2)=>{

    const plantId = Math.sqrt(plantIds);
    const timestampNumber1 = Number(timestampRaw1);
    const timestampNumber2 = Number(timestampRaw2);
    let user;

    let d = new Date(timestampNumber1);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDateGT = new Date(d).toUTCString();

    let dt = new Date(timestampNumber2);
    dt.setHours(23);
    dt.setMinutes(59);
    dt.setSeconds(59);
    dt.setMilliseconds(59);
    const GMTDateLT = new Date(dt).toUTCString();

    let d1 = new Date(timestampNumber1);
    d1.setHours(04);
    d1.setMinutes(30);
    d1.setSeconds(00);
    d1.setMilliseconds(00);
    const GMTDateGT1 = new Date(d1).toUTCString();

    let dt1 = new Date(timestampNumber2);
    dt1.setHours(20);
    dt1.setMinutes(00);
    dt1.setSeconds(00);
    dt1.setMilliseconds(00);
    const GMTDateLT1 = new Date(dt1).toUTCString();

    let getCell_Front = (worksheet, cellValue, size, color)=>{
        worksheet.getCell(cellValue).font = {
            size: size,
            color: { argb: color },
            bold: true,
        };
    };
    
    let getCell_Fill = (worksheet, cellValue, type, pattern, color)=>{
        worksheet.getCell(cellValue).fill = {
            type: type,
            pattern: pattern,
            fgColor: { argb: color }
        };
    };

    const workbook = new Excel.Workbook();
    workbook.creator = 'Holmium Technologies Pvt. Ltd.';
    workbook.created = new Date();
   
    try{

        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
            user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
    
        const  plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }
        ]);

        if(plantProfile[0] == undefined){
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }

        let query = [ 
            
            // Plant Analysis Query
            PlantAnalysis.aggregate([
                {
                '$match': {
                    'timestamp': {
                    '$lte': new Date(GMTDateLT), 
                    '$gte': new Date(GMTDateGT)
                    }, 
                    'plantId': plantId, 
                }
                }, {
                '$sort': {
                    'timestamp': 1
                }
                }
            ]),

            //String Inverter Daily Energy
            StringInverter.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$lte': new Date(GMTDateLT1), 
                      '$gte': new Date(GMTDateGT1)
                    }, 
                    'plantId': plantId, 
                    'errorFlag': 0,
                    'dailyEnergy': {
                        "$ne": 0
                    }
                  }
                }, {
                  '$group': {
                    '_id': {
                      'year': {
                        '$year': '$timestamp'
                      }, 
                      'month': {
                        '$month': '$timestamp'
                      }, 
                      'day': {
                        '$dayOfMonth': '$timestamp'
                      }, 
                      'deviceNo': '$deviceNo'
                    }, 
                    'dailyEnergy': {
                      '$last': '$dailyEnergy'
                    }
                  }
                }, {
                  '$addFields': {
                    'year': '$_id.year', 
                    'month': '$_id.month', 
                    'day': '$_id.day', 
                    'deviceNo': '$_id.deviceNo', 
                    'dailyEnergy': {
                      '$round': [
                        '$dailyEnergy', 2
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'timestamp': {
                      '$dateFromParts': {
                        'year': '$year', 
                        'month': '$month', 
                        'day': '$day'
                      }
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'timestamp': 1, 
                    'deviceNo': 1, 
                    'dailyEnergy': 1
                  }
                }, {
                  '$sort': {
                    'timestamp': 1, 
                    'deviceNo': 1
                  }
                }
            ]),

            //Centralized Inverter Daily Energy
            CentralizedInverter.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$lte': new Date(GMTDateLT1), 
                      '$gte': new Date(GMTDateGT1)
                    }, 
                    'plantId': plantId, 
                    'errorFlag': 0,
                    'masterFlag': 0,
                    'dailyEnergy': {"$ne":0}
                  }
                }, {
                  '$group': {
                    '_id': {
                      'year': {
                        '$year': '$timestamp'
                      }, 
                      'month': {
                        '$month': '$timestamp'
                      }, 
                      'day': {
                        '$dayOfMonth': '$timestamp'
                      }, 
                      'deviceNo': '$deviceNo'
                    }, 
                    'dailyEnergy': {
                      '$last': '$dailyEnergy'
                    }
                  }
                }, {
                  '$addFields': {
                    'year': '$_id.year', 
                    'month': '$_id.month', 
                    'day': '$_id.day', 
                    'deviceNo': '$_id.deviceNo', 
                    'dailyEnergy': {
                      '$round': [
                        '$dailyEnergy', 2
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'timestamp': {
                      '$dateFromParts': {
                        'year': '$year', 
                        'month': '$month', 
                        'day': '$day'
                      }
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0, 
                    'timestamp': 1, 
                    'deviceNo': 1, 
                    'dailyEnergy': 1
                  }
                }, {
                  '$sort': {
                    'timestamp': 1, 
                    'deviceNo': 1
                  }
                }
            ])

        ]

            //Execute Queries
            let [ plantAnalyticsRecord, dailyEnergyStringInverter, dailyEnergyCentralizedInverter ] = await Promise.allSettled(query);

            let from = new Date(GMTDateGT);
            let to = new Date(GMTDateLT);
            let clientName;
            let plantName;
            let plantCapacity;
         
            clientName = user.clientName;
            plantName = plantProfile[0].plantName;
            plantCapacity = plantProfile[0].plantCapacity;
            if(plantCapacity>9999)
                plantCapacity=(plantCapacity/1000).toFixed(2) + ' MW';
            else
                plantCapacity=parseInt(plantCapacity) + ' kW';
            
            workbook.addWorksheet('Site Analysis');
            workbook.addWorksheet('Inverters Daily Yield (kW)');
    
            workbook.eachSheet(function(worksheet, sheetId) {
                //    const imageId1 = workbook.addImage({
                //        filename: './icons/default/vivaansolar.png',
                //        extension: 'png',
                //    });
            
                //   worksheet.addImage(imageId1, 'A1:E6');
            
                worksheet.mergeCells('A1:B2');
                worksheet.mergeCells('C1:E2');
                worksheet.mergeCells('F1:G2');
                worksheet.mergeCells('H1:I2');
                worksheet.mergeCells('J1:K2');
                worksheet.mergeCells('L1:AG2');
            
                worksheet.getCell('A1').value = 'Holmium Technologies';
                worksheet.getCell('C1').value = 'From: '+ from.toLocaleDateString("en-IN", {dateStyle:"medium"})+
                                                '     To: '+ to.toLocaleDateString("en-IN", {dateStyle:"medium"});
                worksheet.getCell('F1').value = "Site: "+ plantName;
                worksheet.getCell('H1').value = "Site Capacity: "+plantCapacity;
                worksheet.getCell('J1').value = "Client: "+clientName;

                let columns =["A1","C1","F1","H1","J1","L1"];

                for(let i=0; i<columns.length;i++)
                {
                    worksheet.getCell(columns[i]).alignment = { vertical: 'middle', horizontal: 'center' }
                    getCell_Front( worksheet, columns[i], 14, 'FFFFFFFF');
                    //getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF172B4D');
                    getCell_Fill( worksheet, columns[i], 'pattern', 'solid', 'FF0073AE');
                }
           
                let columnsFormat= ["A3","B3","C3","D3","E3","F3","G3","H3","I3","J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3",
                "AA3","AB3","AC3","AD3","AE3","AF3","AG3"]

                for(let i=0; i<columnsFormat.length;i++)
                {
                    getCell_Front( worksheet, columnsFormat[i], 11, 'FFFFFFFF');
                    //getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFf27c47');
                    getCell_Fill( worksheet,columnsFormat[i], 'pattern', 'solid', 'FFDB5A23');
                    
                }
                
                worksheet.columns = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, 
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 },{ width: 20 },{ width: 20 },
                    { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }];

                worksheet.views = [
                    {state: 'frozen', xSplit: 1, ySplit: 3,  activeCell: 'undefined'}
                    ];
            });
            
        
            let worksheet = workbook.getWorksheet('Site Analysis');
         
            worksheet.getCell('A3').value = 'Date (DD-MM-YYYY)';
            worksheet.getCell('B3').value = 'Start Time (HH:MM:SS)';
            worksheet.getCell('C3').value = 'Stop Time (HH:MM:SS)';
            worksheet.getCell('D3').value = 'Generation Time (HH:MM)';
            worksheet.getCell('E3').value = 'Max Output Power (kW)';
            worksheet.getCell('F3').value = 'Daily Yield (kWh)';
            worksheet.getCell('G3').value = 'Specific Yield (kWh/m2)';
            worksheet.getCell('H3').value = 'Total Yield (MWh)';
            worksheet.getCell('I3').value = 'CUF (%)';

            let l=0;
            let columnId = ["J3","K3","L3","M3","N3","O3","P3","Q3","R3","S3","T3","U3","V3","W3","X3","Y3","Z3"];
            
            if(plantProfile[0].weatherStation.isActive)
            {
                worksheet.getCell(columnId[l]).value = 'PR (%)';
                l++;
                worksheet.getCell(columnId[l]).value = 'Cumulative GHI (kWh/m2)';
                l++;
                worksheet.getCell(columnId[l]).value = 'Cumulative GTI (kWh/m2)';
                l++;
            }

            if(typeof plantAnalyticsRecord.value != 'undefined')
            {
               
                for(let i=0,j=4; i<plantAnalyticsRecord.value.length;i++)
                {
                    let m=0;
                    let columnIdData = ["J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

                    worksheet.getCell('A'+j).value = plantAnalyticsRecord.value[i].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                    
                    let plantStartTime = plantAnalyticsRecord.value[i].plantStartTime;
                    if(plantStartTime == 'NA')
                        worksheet.getCell('B'+j).value =plantStartTime;
                    else
                    {
                        plantStartTime = new Date(plantStartTime);
                        worksheet.getCell('B'+j).value = plantStartTime.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                    }

                    let plantStopTime = plantAnalyticsRecord.value[i].plantStopTime;
                    if(plantStopTime == 'NA')
                        worksheet.getCell('C'+j).value = plantStopTime;
                    else
                    {
                        plantStopTime = new Date(plantStopTime);
                        worksheet.getCell('C'+j).value = plantStopTime.toLocaleTimeString("en-IN", {hourCycle:"h23"});
                    }

                    let plantGenerationTime = plantAnalyticsRecord.value[i].plantGenerationTime;
                    if(plantGenerationTime == 0)
                        worksheet.getCell('D'+j).value = plantGenerationTime;
                    else
                    {
                        let hour = parseInt(plantGenerationTime / 60); 
                        plantGenerationTime %= 60;
                        let minute =  parseInt(plantGenerationTime); 
        
                        if(hour<10)
                            hour = "0"+hour;
                        if(minute == 0)
                            minute = "0"+minute;
                        worksheet.getCell('D'+j).value = hour+":"+minute;
                    }

                    let maxActivePower = plantAnalyticsRecord.value[i].maxActivePower;
                    if( maxActivePower == 0)
                        worksheet.getCell('E'+j).value = 'NA';
                    else
                        worksheet.getCell('E'+j).value =  maxActivePower;
    
                    worksheet.getCell('F'+j).value =  plantAnalyticsRecord.value[i].dailyEnergy;
                    worksheet.getCell('G'+j).value =  plantAnalyticsRecord.value[i].specificEnergy;
                    worksheet.getCell('H'+j).value =  parseFloat((plantAnalyticsRecord.value[i].totalEnergy/1000).toFixed(2));
                    worksheet.getCell('I'+j).value =  plantAnalyticsRecord.value[i].CUF;

                    if(plantProfile[0].weatherStation.isActive)
                    {
                        worksheet.getCell(columnIdData[m]+j).value = plantAnalyticsRecord.value[i].PR;
                        m++;
                        worksheet.getCell(columnIdData[m]+j).value =  plantAnalyticsRecord.value[i].cumulativeGHI;
                        m++;
                        worksheet.getCell(columnIdData[m]+j).value = plantAnalyticsRecord.value[i].cumulativeGTI1;
                        m++;
                    }
                    j++;
                }
            }

            worksheet = workbook.getWorksheet('Inverters Daily Yield (kW)');

            if(plantProfile[0].stringInverter.isActive)
            {
                let i = 4;
                let flag = true;
                let columnId = ["C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG"];

                worksheet.getCell('A3').value = 'Device Name';
                worksheet.getCell('B3').value = 'Capacity (kW)';
                
                plantProfile[0].stringInverter.details.forEach(element => {
                    worksheet.getCell('A'+i).value = element.building+' '+element.name;
                    worksheet.getCell('B'+i).value = element.capacity;
                    i++;
                });

                console.log( dailyEnergyStringInverter.value)
                if(typeof dailyEnergyStringInverter.value != 'undefined')
                {
                    for(let j=0, k=0, l=3; j < dailyEnergyStringInverter.value.length; j++)
                    {
                    
                        if(typeof dailyEnergyStringInverter.value[j+1] != 'undefined')
                        {
                            console.log(dailyEnergyStringInverter.value[j].timestamp.getDate() == dailyEnergyStringInverter.value[j+1].timestamp.getDate())
                            console.log(dailyEnergyStringInverter.value[j].timestamp.getDate())
                            console.log(dailyEnergyStringInverter.value[j+1].timestamp.getDate())
                            if(dailyEnergyStringInverter.value[j].timestamp.getDate() == dailyEnergyStringInverter.value[j+1].timestamp.getDate())
                            {
                                if(flag)
                                {
                                    worksheet.getCell(columnId[k]+l).value = dailyEnergyStringInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                                    flag = false;
                                }
                                let deviceNo = l+Number(dailyEnergyStringInverter.value[j].deviceNo);
                                worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyStringInverter.value[j].dailyEnergy;
                            }
                            else
                            {
                                worksheet.getCell(columnId[k]+l).value = dailyEnergyStringInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                                let deviceNo = l+Number(dailyEnergyStringInverter.value[j].deviceNo);
                                worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyStringInverter.value[j].dailyEnergy;
                                flag = true;
                                k++;
                            }
                        }
                        else
                        {
                            worksheet.getCell(columnId[k]+l).value = dailyEnergyStringInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                            let deviceNo = l+Number(dailyEnergyStringInverter.value[j].deviceNo);
                            worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyStringInverter.value[j].dailyEnergy;
                        }
                      
                    }
                    
                }
            }

            if(plantProfile[0].centralizedInverter.isActive)
            {
                let i = 4;
                let flag = true;
                let columnId = ["C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG"];

                worksheet.getCell('A3').value = 'Device Name';
                worksheet.getCell('B3').value = 'Capacity (kW)';
                
                plantProfile[0].centralizedInverter.details.forEach(element => {
                    worksheet.getCell('A'+i).value = element.building+' '+element.name;
                    worksheet.getCell('B'+i).value = element.capacity;
                    i++;
                });

                if(typeof dailyEnergyCentralizedInverter.value != 'undefined')
                {
                    for(let j=0, k=0, l=3; j < dailyEnergyCentralizedInverter.value.length; j++)
                    {
                    
                        if(typeof  dailyEnergyCentralizedInverter.value[j+1] != 'undefined')
                        {
                            if(dailyEnergyCentralizedInverter.value[j].timestamp.getDate() == dailyEnergyCentralizedInverter.value[j+1].timestamp.getDate())
                            {
                                if(flag)
                                {
                                    worksheet.getCell(columnId[k]+l).value = dailyEnergyCentralizedInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                                    flag = false;
                                }
                                let deviceNo = l+Number(dailyEnergyCentralizedInverter.value[j].deviceNo);
                                worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyCentralizedInverter.value[j].dailyEnergy;
                            }
                            else
                            {
                                worksheet.getCell(columnId[k]+l).value = dailyEnergyCentralizedInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                                let deviceNo = l+Number(dailyEnergyCentralizedInverter.value[j].deviceNo);
                                worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyCentralizedInverter.value[j].dailyEnergy;
                                flag = true;
                                k++;
                            }
                        }
                        else
                        {
                            worksheet.getCell(columnId[k]+l).value = dailyEnergyCentralizedInverter.value[j].timestamp.toLocaleDateString("en-IN", {dateStyle:"medium"});
                            let deviceNo = l+Number(dailyEnergyCentralizedInverter.value[j].deviceNo);
                            worksheet.getCell(columnId[k]+deviceNo).value = dailyEnergyCentralizedInverter.value[j].dailyEnergy;
                        }
                      
                    }
                    
                }
            }
          
       return  { status:true, response:workbook };
    }
    catch(err){
        console.log(err);
        const response ={
            status: false,
            message: err.message
        }
        return response;
    }
}

exports.emailReportDailyService = async(username, plantIds, timestampRaw, emailid) =>{
    
    const plantId = Math.sqrt(plantIds);
    const timestampNumber = Number(timestampRaw);
    const emailId = emailid;
    let user;

    let d = new Date(timestampNumber);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDateGT = new Date(d).toUTCString();

    let dt = new Date(timestampNumber);
    dt.setHours(23);
    dt.setMinutes(59);
    dt.setSeconds(59);
    dt.setMilliseconds(59);
    const GMTDateLT = new Date(dt).toUTCString();

    try{

        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
             user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
    
        const  plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }
        ]);

        if(plantProfile[0] == undefined){
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }

        let query = [ 
            
            // Plant Analysis Query
            PlantAnalysis.aggregate([
                {
                '$match': {
                    'timestamp': {
                    '$lte': new Date(GMTDateLT), 
                    '$gte': new Date(GMTDateGT)
                    }, 
                    'plantId': plantId, 
                }
                }, {
                '$sort': {
                    'timestamp': 1
                }
                }
            ])

        ]

        //Execute Queries
        let [ plantAnalyticsRecord ] = await Promise.allSettled(query);

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'holmium.emonitoring@gmail.com',
                pass: 'Holmium@monitoring1'
            }
        });

        let mailOptions = {
            from: 'holmiumtechnologies18@gmail.com',
            to: emailId,
            subject: 'Site Analysis Report'+' ('+ d.toLocaleDateString("en-IN", {dateStyle:"medium"}) +') || '+plantProfile[0].plantName+', '+plantProfile[0].location.name
        };

        let capacity = plantProfile[0].plantCapacity;
        if(capacity >= 10000)
            capacity = (capacity / 1000).toFixed(2) +' MW';
        else
            capacity = capacity + ' kW';
        
        let startTime = 'NA';

        if(plantAnalyticsRecord.value[0].plantStartTime != 'NA')
        {
            startTime = new Date(plantAnalyticsRecord.value[0].plantStartTime);
            startTime = startTime.toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short", hourCycle:"h23"});
        }

        let stopTime = 'NA';

        if(plantAnalyticsRecord.value[0].plantStopTime != 'NA')
        {
            stopTime = new Date(plantAnalyticsRecord.value[0].plantStopTime);
            stopTime = stopTime.toLocaleString("en-IN", {dateStyle:"medium", timeStyle:"short", hourCycle:"h23"});
        }

        let generationTime = plantAnalyticsRecord.value[0].plantGenerationTime;

        if(generationTime != 0)
        {
            let hour = parseInt(generationTime / 60); 
            generationTime %= 60;
            let minute =  parseInt(generationTime); 

            if(hour<10)
                hour = "0"+hour;
            if(minute == 0)
                minute = "0"+minute;
            generationTime = hour+" Hours "+minute+" Minutes"
        }
        else
        {
            generationTime='NA';
        }
        
        let dailyEnergy = 'NA';
        if(typeof plantAnalyticsRecord.value[0].dailyEnergy != 'undefined')
        {
            dailyEnergy = plantAnalyticsRecord.value[0].dailyEnergy;
            if(dailyEnergy >= 10000)
                dailyEnergy = (dailyEnergy / 1000).toFixed(2) +' MW';
            else
                dailyEnergy = dailyEnergy + ' kW';
        }

        let specificEnergy = 'NA';
        if(typeof plantAnalyticsRecord.value[0].specificEnergy != 'undefined')
        {
            specificEnergy = plantAnalyticsRecord.value[0].specificEnergy;
        }

        let totalEnergy = 'NA';
        if(typeof plantAnalyticsRecord.value[0].totalEnergy != 'undefined')
        {
            totalEnergy = plantAnalyticsRecord.value[0].totalEnergy;
            if(totalEnergy >= 10000)
                totalEnergy = (totalEnergy / 1000).toFixed(2) +' MW';
            else
                totalEnergy = totalEnergy + ' kW';
        }

        let CUF = 'NA';
        if(typeof plantAnalyticsRecord.value[0].CUF != 'undefined')
        {
            CUF = plantAnalyticsRecord.value[0].CUF+ ' %';
        }
        
        let table  = `<table><tr><th>Parameters</th><th>Value</th></tr>
        <tr><td>Start Time</td><td>`+startTime+`</td></tr>
        <tr><td>Stop Time</td><td>`+stopTime+`</td></tr>
        <tr><td>Generation Time</td><td>`+generationTime+`</td></tr>
        <tr><td>Daily Yield</td><td>`+dailyEnergy+`</td></tr>
        <tr><td>Specific Yield</td><td>`+specificEnergy+`</td></tr>
        <tr><td>Total Yield</td><td>`+totalEnergy+`</td></tr>
        <tr><td>CUF</td><td>`+CUF+`</td></tr>`
        
        if(plantProfile[0].weatherStation.isActive)
        {
            let PR = 'NA';
            if(typeof plantAnalyticsRecord.value[0].PR != 'undefined')
            {
                PR = plantAnalyticsRecord.value[0].PR+ ' %';
            }

            table = table + `<tr><td>PR</td><td>`+PR+`</td></tr>`;

            if(plantAnalyticsRecord.value[0].cumulativeGHI != 'NA')
            {
                let cumulativeGHI = (Number(plantAnalyticsRecord.value[0].cumulativeGHI)).toFixed(2);
                table = table + `<tr><td>Cumulative GHI</td><td>`+cumulativeGHI+`</td></tr>`;
            }
                
            if(plantAnalyticsRecord.value[0].cumulativeGTI1 != 'NA')
            {
                let cumulativeGTI1 = (Number(plantAnalyticsRecord.value[0].cumulativeGTI1)).toFixed(2);
                table = table + `<tr><td>Cumulative GTI</td><td>`+cumulativeGTI1+`</td></tr>`;
            }
               
        }
        
       table = table +  `</table>`;
    
       mailOptions.html =`
        <html>
        <head>
            <style>
                body {
                font-family: arial, sans-serif;
                color:#1B2631;
                }
                table {
                  font-family: arial, sans-serif;
                  border-collapse: collapse;
                  width:75%;
                }
                th {
                  background-color: #2A648B;
                  color: white;
                  text-align: left;
                  width:425px;
                }
                td {
                  text-align: left;
                  width:275px;
                }
                td, th {
                border: 1px solid #ddd;
                padding: 3px 8px;
                }
                caption{
                background-color: #FFFFFF;
                text-align: left;
                }
                span {
                color:#2A648B;
                }
                </style>
        </head>
        <body>
                <p>Dear User,<p>
                <p><b>Site Name:- <span>`+ plantProfile[0].plantName+', '+plantProfile[0].location.name+`</span><br> Capacity:- <span>`+ capacity+`</span></b></p>
                <p><b>Site Analysis</b></p>
                `+table+`
                
                <p>With Regards <br> Holmium Technologies Pvt. Ltd.</p>
                
                <p><b>Note: This is an automated e-mail and the reported values may be susceptible to machine errors / communication failures. For clarification please visit <a href='www.holmiumtechnologies.com'> Holmium Technologies</a> or contact info@holmiumtechnologies.com</b></p>
            </body>
        </html>`;

        const sendmail = await transporter.sendMail(mailOptions);

        let response ;
       
        if(sendmail.messageId)
            response = "Email Send Successfully"
        else        
            response = "Email Sending Failed"
      
        return  { status:true, response: response};
    }
    catch(err){
        //console.log(err);
        const response ={
            status: false,
            message: err.message
        }
        return response;
    }
}