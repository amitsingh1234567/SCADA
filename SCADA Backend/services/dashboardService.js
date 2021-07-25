const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { SCB } = require('../models/scb');
const { StringInverter } = require('../models/stringinverter'); 
const { CentralizedInverter } = require('../models/centralizedinverter');
const { Meter } = require('../models/meter');
const { PlantAnalysis } = require('../models/plantanalysis');
const { Alarm } = require('../models/alarm');

exports.dashboardSiteLevelStatusService = async(username, plantIdS)=>{

  plantId = Math.sqrt(plantIdS);

  const response = {
    inverter : [],
    scb : [],
    meter : [],
    weatherStation : [],
    plantParameters : {},
    todaysDay : {},
  };

  response.plantParameters = {
    instPower : null,
    totalExportEnergy: null,
    co2Saved: null,
    plantStartTime: null,
    plantStopTime: null,
    gridAvailability: null,
    gridDowntime: null,
    operationHours: null
  };

  let instPower = 0;
  let totalExportEnergy = 0;

  const scb = [];
  const inverter = [];
  //const meter = [];
  //onst weatherStation = [];
  
  let d = new Date();
  let minute = d.getMinutes();
  let date = d.getDate();
  let day = d.getDay();
  
  d.setMinutes(minute - 5);
  const todayTimestamp = new Date(d).toUTCString();
  
  d.setHours(00);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const todayStartDate = new Date(d).toUTCString();

  d.setHours(04);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const todayStartDateInv = new Date(d).toUTCString();

  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);
  d.setMilliseconds(59);
  const todayEndDate = new Date(d).toUTCString();

  d.setHours(20);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(00);
  const todayEndDateInv = new Date(d).toUTCString()

  d.setDate(date-1);
  d.setHours(00);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const yesterdayStartDate = new Date(d).toUTCString();

  d.setHours(04);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const yesterdayStartDateInv = new Date(d).toUTCString();

  d.setHours(20);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const yesterdayEndDateInv = new Date(d).toUTCString();
  
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);
  d.setMilliseconds(59);
  const yesterdayEndDate = new Date(d).toUTCString();

  d.setDate(date - (day - 1));
  d.setHours(00);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(01);
  const weekStartDate = new Date(d).toUTCString();

  d.setDate(date - (day - 1) + 6);
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);
  d.setMilliseconds(59);
  const weekEndDate = new Date(d).toUTCString();

  let monthDate = new Date(); 
  monthDate.setHours(00);
  monthDate.setMinutes(00);
  monthDate.setSeconds(00);
  monthDate.setMilliseconds(01);         
  let monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toUTCString();

  monthDate.setHours(23);
  monthDate.setMinutes(59);
  monthDate.setSeconds(59);
  monthDate.setMilliseconds(59); 
  let monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toUTCString(); 

  let yearDate = new Date();
  yearDate.setDate(01);
  yearDate.setMonth(00);
  yearDate.setHours(00);
  yearDate.setMinutes(00);
  yearDate.setSeconds(00);
  yearDate.setMilliseconds(01);
  let yearStartDate = new Date(yearDate).toUTCString();

  yearDate.setDate(31);
  yearDate.setMonth(11);
  yearDate.setHours(23);
  yearDate.setMinutes(59);
  yearDate.setSeconds(59);
  yearDate.setMilliseconds(59);
  let yearEndDate = new Date(yearDate).toUTCString();

    try{

        const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

        if(user == null){
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
     
        let queries = [

          PlantAnalysis.aggregate([
              {
                '$match': {
                  'timestamp': {
                    '$gte': new Date(todayStartDate),
                    '$lte': new Date(todayEndDate)
                  }, 
                  'plantId':  plantId
                }
              }, {
                '$sort': {
                  'timestamp': -1
                }
              }, {
                '$limit': 1
              }
          ])
        ]

        //Execute Queries
        let [today] = await Promise.allSettled(queries);
       
        if(today.value[0] != undefined)
        {
          if(today.value[0].totalEnergy != undefined)
            totalExportEnergy = (today.value[0].totalEnergy/1000);
          else
            totalExportEnergy = 'NA';

          if(today.value[0].plantStartTime != undefined)
          {
            if(today.value[0].plantStartTime != 'NA')
            {
              let timestampX1 = new Date(today.value[0].plantStartTime);
              response.plantParameters.plantStartTime =timestampX1.toLocaleString('en-IN',{hourCycle:"h23"});
            }
            else
              response.plantParameters.plantStartTime = today.value[0].plantStartTime;
          }
          else
            response.plantParameters.plantStartTime = 'NA';

          if(today.value[0].plantStopTime != undefined)
          {
            if(today.value[0].plantStopTime != 'NA')
            {
              let timestampX2 = new Date(today.value[0].plantStopTime);
              response.plantParameters.plantStopTime = timestampX2.toLocaleString('en-IN',{hourCycle:"h23"});
            }
            else
              response.plantParameters.plantStopTime = today.value[0].plantStopTime;
          } 
          else
            response.plantParameters.plantStopTime = 'NA';

          response.plantParameters.gridAvailability = 'NA';
          response.plantParameters.gridDowntime = 'NA';

          if(today.value[0].plantGenerationTime != undefined)
          {
            if(today.value[0].plantGenerationTime != 'NA')
            {
                let n = today.value[0].plantGenerationTime;
                let hour = parseInt(n / 60); 
                n %= 60; 
                let minutes = parseInt(n) ; 

                response.plantParameters.operationHours = hour + " Hours " + minutes + " Mins";
            }
            else
              response.plantParameters.operationHours = today.value[0].plantGenerationTime;
          }
          else
            response.plantParameters.operationHours = 'NA';
        }
        else
        {
          totalExportEnergy = 'NA';
          response.plantParameters.plantStartTime = 'NA';
          response.plantParameters.plantStopTime = 'NA';
          response.plantParameters.gridAvailability = 'NA';
          response.plantParameters.gridDowntime = 'NA';
          response.plantParameters.operationHours = 'NA';
        }
          

        if(plantProfile[0].stringInverter.isActive)
        {  
          for (const item of plantProfile[0].stringInverter.details)
          {
            query = [
            //String Inverter Status
            StringInverter.aggregate([
                {
                  '$match': {
                    'plantId': plantId,
                    'deviceNo': item.id,
                    'timestamp': { '$gte': new Date(todayStartDateInv)},
                    'errorFlag': 0
                    }
                  }, {
                  '$sort': {
                    'timestamp': -1
                    }
                  }, {
                  '$limit': 1
                  }, {
                  '$addFields': {
                      'duration': {
                          '$toInt': {
                              '$divide': [{
                                  '$subtract': [
                                      new Date(), '$timestamp'
                                  ]
                              }, 1000]
                          }
                      }
                    }
                  }
              ])
            ];

            //Execute Queries
            let [stringInverterStatus] = await Promise.allSettled(query);
            
            if(typeof stringInverterStatus.value[0] != 'undefined')
            {
              if(stringInverterStatus.value[0].duration <300)
              {
                inverter.push({name: item.name, capacity:item.capacity, status: stringInverterStatus.value[0].status,
                todayYield: stringInverterStatus.value[0].dailyEnergy, totalYield: stringInverterStatus.value[0].totalEnergy,
                outputPower: stringInverterStatus.value[0].activePower, inputPower: stringInverterStatus.value[0].inputPower,
                timestamp: stringInverterStatus.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
              }
              else
              {
                inverter.push({name: item.name, capacity:item.capacity,  status: "Offline", 
                todayYield: stringInverterStatus.value[0].todayEnergy, totalYield: stringInverterStatus.value[0].totalEnergy, 
                outputPower: 'NA', inputPower: 'NA', timestamp: stringInverterStatus.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
              }     
            }
            else
            {
              inverter.push({name: item.name, capacity:item.capacity, status: "Offline", todayYield: 'NA', totalYield: 'NA', outputPower: 'NA', 
              inputPower: 'NA', timestamp: 'NA'});
            } 
          }
        }

        if(plantProfile[0].centralizedInverter.isActive)
        {
          for (const item of plantProfile[0].centralizedInverter.details)
          {
            query = [
              //Centralized Inverter Status
              CentralizedInverter.aggregate([
                  {
                    '$match': {
                      'plantId': plantId,
                      'deviceNo': item.id,
                      'timestamp': { '$gte': new Date(todayStartDateInv)},
                      'errorFlag': 0,
                      'masterFlag': 0
                      }
                    }, {
                    '$sort': {
                      'timestamp': -1
                      }
                    }, {
                    '$limit': 1
                    }, {
                    '$addFields': {
                        'duration': {
                            '$toInt': {
                                '$divide': [{
                                    '$subtract': [
                                        new Date(), '$timestamp'
                                    ]
                                }, 1000]
                            }
                        }
                      }
                    }
              ]).allowDiskUse()
            ];

            //Execute Queries
            let [centralizedInverterStatus] = await Promise.allSettled(query);

            if(typeof centralizedInverterStatus.value[0] != 'undefined')
            {
              if(centralizedInverterStatus.value[0].duration <300)
              {
                inverter.push({name: item.name, capacity:item.capacity, status: centralizedInverterStatus.value[0].status,
                todayYield: centralizedInverterStatus.value[0].dailyEnergy, totalYield: centralizedInverterStatus.value[0].totalEnergy,
                outputPower: centralizedInverterStatus.value[0].activePower, inputPower: centralizedInverterStatus.value[0].inputPower,
                timestamp: centralizedInverterStatus.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
              }
              else
              {
                inverter.push({name: item.name, capacity:item.capacity,  status: "Offline", 
                todayYield: centralizedInverterStatus.value[0].todayEnergy, totalYield: centralizedInverterStatus.value[0].totalEnergy, 
                outputPower: 'NA', inputPower: 'NA', timestamp: centralizedInverterStatus.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
              }     
            }
            else
            {
              inverter.push({name: item.name, capacity:item.capacity, 
              status: "Offline", todayYield: 'NA', totalYield: 'NA', outputPower: 'NA', 
              inputPower: 'NA', timestamp: 'NA'});
            }  
          }
        }

        inverter.forEach(element => {

            if(element.status == "Running")
                element.statusClass="Green";
            else if(element.status == "Offline")
                element.statusClass="Orange";
            // else if(element.status == "No-Data")
            //     element.statusClass="Orange";
            else if(element.status == "Fault")
                element.statusClass="Red";
            else
                element.statusClass="Orange";

          if(element.status != 'Offline' && element.status != 'No-Data')
          {
            instPower = instPower + Number(element.outputPower);
          }

        });

        if(plantProfile[0].scb != undefined)
        {
          if(plantProfile[0].scb.isActive)
          {     
            for (const item of plantProfile[0].scb.details)
            {
              query = [
                //SCB Status
                SCB.aggregate([
                    {
                      '$match': {
                        'plantId': plantId,
                        'deviceNo': item.id,
                        'timestamp': {'$gte': new Date(todayStartDate)},
                        'errorFlag': 0
                        }
                      }, {
                      '$sort': {
                        'timestamp': -1
                        }
                      }, {
                      '$limit': 1
                      }, {
                      '$addFields': {
                          'duration': {
                              '$toInt': {
                                  '$divide': [{
                                      '$subtract': [
                                          new Date(), '$timestamp'
                                      ]
                                  }, 1000]
                              }
                          }
                        }
                      }
                ])
              ];

              //Execute Queries
              let [status] = await Promise.allSettled(query);

              if(typeof status.value[0] != 'undefined')
              {
                if(status.value[0].duration <300)
                {
                  scb.push({name: item.name, location: item.inverter, status: "Online", 
                  voltage: status.value[0].voltage, current: status.value[0].current,
                  power: status.value[0].power, temperature: status.value[0].temperature,
                  timestamp: status.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
                }
                else
                {
                  scb.push({name: item.name, location: item.inverter,
                  status: "Offline", voltage: 'NA', current: 'NA', power: 'NA', temperature: 'NA',
                  timestamp: status.value[0].timestamp.toLocaleString('en-IN',{hourCycle:"h23"})});
                }     
              }
              else
              {
                scb.push({name: item.name, location: item.inverter,
                status: "Offline", voltage: 'NA', current: 'NA', power: 'NA', temperature: 'NA', timestamp: "NA"});
              } 
            }

            scb.forEach(element => {
            
              // if(element.voltage != null && !isNaN(element.voltage))
              //   element.voltage = element.voltage +' V';
              // else
              //   element.voltage = 'NA';

              // if(element.current!= null && !isNaN(element.current))
              //   element.current = element.current +' A';
              // else
              //   element.current = 'NA';
  
              // if(element.power != null && !isNaN(element.power))
              //     element.power = element.power +' kW';
              // else
              //   element.power = 'NA';

              // if(element.temperature != null && !isNaN(element.temperature))
              //   element.temperature = element.temperature +' °C';
              // else
              //   element.temperature = 'NA';
  
              if(element.status == "Online")
                  element.statusClass="Green";
              else if(element.status == "Offline")
                  element.statusClass="Orange";
              else if(element.status == "No-Data")
                  element.statusClass="Orange";
              else if(element.status == "Fault")
                  element.statusClass="Red";
              else
                  element.statusClass="Orange";
            });
          }
        }

        if(plantProfile[0].meter != undefined)
        {
          if(plantProfile[0].meter.isActive)
          {
            if(plantProfile[0].meter.default != undefined)
            {
              let queries = [
                  Meter.aggregate([
                    {
                        '$match': {
                        'plantId': plantId, 
                        'deviceNo': plantProfile[0].meter.default, 
                        'solutionFlag': 'MFM',
                        'errorFlag': 0
                        }
                    }, {
                        '$sort': {
                        'timestamp': -1
                        }
                    }, {
                        '$limit': 1
                    }, {
                        '$addFields': {
                        'duration': {
                            '$toInt': {
                            '$divide': [
                                {
                                '$subtract': [
                                    new Date(), '$timestamp'
                                ]
                                }, 1000
                            ]
                            }
                        }
                        }
                    }, {
                        '$project': {
                        '_id': 0
                        }
                    }
                  ])
              ];

              //Execute Queries
              let [status] = await Promise.allSettled(queries);

              if(status.value[0] != undefined)
              {
                if(status.value[0].duration<=300)
                {
                  if(status.value[0].activePower != undefined)
                    response.plantParameters.instPower = parseInt(status.value[0].activePower);
                  else
                    response.plantParameters.instPower = 'NA'; 
                }
                else
                {
                  response.plantParameters.instPower = 'NA';
                }

                if(status.value[0].activeEnergyExport != undefined)
                {
                  response.plantParameters.totalExportEnergy= (status.value[0].activeEnergyExport/1000).toFixed(2);
                  response.plantParameters.co2Saved = (status.value[0].activeEnergyExport*0.008).toFixed(2);
                }
                else
                {
                  response.plantParameters.totalExportEnergy = 'NA';
                  response.plantParameters.co2Saved = 'NA';
                }
              }
            }
            else
            {
              response.plantParameters.instPower = instPower.toFixed(2);
              response.plantParameters.totalExportEnergy = totalExportEnergy;
              if(totalExportEnergy != 'NA')
                response.plantParameters.co2Saved = (Number(totalExportEnergy)*0.008).toFixed(2);
              else
                response.plantParameters.co2Saved = 'NA';
            }
          }
          else
          {
            response.plantParameters.instPower = instPower.toFixed(2);
            response.plantParameters.totalExportEnergy = totalExportEnergy;
            if(totalExportEnergy != 'NA')
                response.plantParameters.co2Saved = (Number(totalExportEnergy)*0.008).toFixed(2);
              else
                response.plantParameters.co2Saved = 'NA';
          }
        }

        response.inverter = inverter;
        response.scb = scb;

       return  {status:true, response:response };
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

exports.dashboardCurveService = async(username, plantIdS)=>{

    const response = {
      curve1 : {},
      curve2 : {}
    };

    response.curve1 = {
      timestamp : [],
      dailyYield : [],
      yesterdayYield : []
    };

    response.curve2 = {
      timestamp : [],
      PR : []
    };

    let todayEnergy = [];
    let yesterdayEnergy = [];
    const plantId = Math.sqrt(plantIdS);
    let timestamp = new Date();
  
    let d = new Date();
    d.setHours(04);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(00);
    GMTTodayGT = new Date(d).toUTCString();

    d.setDate(d.getDate()-1);
    d.setHours(04);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(00);
    GMTYesterdayGT = new Date(d).toUTCString();

    d.setDate(01);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    GMTMonthGT = new Date(d).toUTCString();

    let year = d.getFullYear();
    let month = d.getMonth();
    let date = new Date(year, month +1, 0).getDate();
    d.setDate(date);
    d.setHours(23);
    d.setMinutes(59);
    d.setSeconds(59);
    d.setMilliseconds(59);
    GMTMonthLT = new Date(d).toUTCString();

    try{

        const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

        if(user == null){
            throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
        }
       
        const  plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }
        ]);

        if(plantProfile[0] != undefined)
        {
          let query = [

            //Plant Analysis
            PlantAnalysis.aggregate([
              {
                '$match': {
                  'timestamp': {
                    '$gte': new Date(GMTMonthGT), 
                    '$lte': new Date(GMTMonthLT)
                  }, 
                  'plantId': plantProfile[0].plantId
                }
              }, {
                '$sort': {
                  'timestamp': 1
                }
              }, {
                '$addFields': {
                  'localeDate': {
                    '$dayOfMonth': {
                      'date': '$timestamp', 
                      'timezone': '+05:30'
                    }
                  }, 
                  'localeMonth': {
                    '$month': {
                      'date': '$timestamp', 
                      'timezone': '+05:30'
                    }
                  }, 
                  'localeYear': {
                    '$year': {
                      'date': '$timestamp', 
                      'timezone': '+05:30'
                    }
                  }
                }
              }, {
                '$sort': {
                  'localeDate': 1
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'timestamp': 0, 
                  'plantId': 0, 
                  'plantStartTime': 0, 
                  'plantStopTime': 0, 
                  'plantGenerationTime': 0, 
                  'maxActivePower': 0, 
                  'cumulativeGHI': 0, 
                  'cumulativeGTI1': 0, 
                  '__v': 0
                }
              }
            ])
          ];
  
          //Execute Queries
          let [plantAnalysis] = await Promise.allSettled(query);
  
          if(typeof plantAnalysis.value[0] != 'undefined')
          {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June","July", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let month = monthNames[timestamp.getMonth()];
            let monthLast = new Date(timestamp.getFullYear(), timestamp.getMonth() + 1, 0);
            let monthLastDay = monthLast.getDate();
            
            for(let i=0, j=0, date=1; i<monthLastDay; i++)
            {
              if(typeof plantAnalysis.value[j] != 'undefined')
              {
                if(date == plantAnalysis.value[j].localeDate)
                {
                  response.curve2.timestamp.push(date+' '+month);
                  response.curve2.PR.push(Number(plantAnalysis.value[j].PR));
                  j++;
                }
                else
                {
                  response.curve2.timestamp.push(date+' '+month);
                  response.curve2.PR.push(null);
                }
              }
              else
              {
                response.curve2.timestamp.push(date+' '+month);
                response.curve2.PR.push(null);
              }
              date++;
            }
          }

          if(plantProfile[0].stringInverter.isActive)
          {  
            const counter = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
            let h = 1;
            let hour = 4;

            //for(i=0, h=1, hour=4; i<16; i++)
            for(const i of counter)
            {
              let GMTTodayLTTemp = new Date(GMTTodayGT);
              GMTTodayLTTemp.setHours(GMTTodayLTTemp.getHours()+h);
              let GMTTodayLT = new Date(GMTTodayLTTemp).toUTCString();

              let GMTYesterdayLTTemp = new Date(GMTYesterdayGT);
              GMTYesterdayLTTemp.setHours(GMTYesterdayLTTemp.getHours()+h);
              let GMTYesterdayLT = new Date(GMTYesterdayLTTemp).toUTCString();
              
              let query = [
            
                //String Inverter Daily Energy
                StringInverter.aggregate([
                  {
                    '$match': {
                      'plantId': plantProfile[0].plantId, 
                      'timestamp': {
                        '$gte': new Date(GMTTodayGT), 
                        '$lt': new Date(GMTTodayLT)
                      }, 
                      'errorFlag': 0
                    }
                  }, {
                    '$sort': {
                      'timestamp': 1
                    }
                  }, {
                    '$group': {
                      '_id': {
                        'deviceNo': '$deviceNo'
                      }, 
                      'dailyEnergy': {
                        '$max': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$last': '$timestamp'
                      }
                    }
                  }, {
                    '$group': {
                      '_id': null, 
                      'dailyEnergy': {
                        '$sum': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$first': '$timestamp'
                      }
                    }
                  }, {
                    '$addFields': {
                      'localeHour': {
                        '$subtract': [
                          {
                            '$hour': {
                              'date': '$timestamp', 
                              'timezone': '+05:30'
                            }
                          }, {
                            '$mod': [
                              {
                                '$hour': {
                                  'date': '$timestamp', 
                                  'timezone': '+05:30'
                                }
                              }, 1
                            ]
                          }
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      '_id': 0
                    }
                  }
                ]),

                StringInverter.aggregate([
                  {
                    '$match': {
                      'plantId': plantProfile[0].plantId, 
                      'timestamp': {
                        '$gte': new Date(GMTYesterdayGT), 
                        '$lt': new Date(GMTYesterdayLT)
                      }, 
                      'errorFlag': 0
                    }
                  }, {
                    '$sort': {
                      'timestamp': 1
                    }
                  }, {
                    '$group': {
                      '_id': {
                        'deviceNo': '$deviceNo'
                      }, 
                      'dailyEnergy': {
                        '$max': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$last': '$timestamp'
                      }
                    }
                  }, {
                    '$group': {
                      '_id': null, 
                      'dailyEnergy': {
                        '$sum': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$first': '$timestamp'
                      }
                    }
                  }, {
                    '$addFields': {
                      'localeHour': {
                        '$subtract': [
                          {
                            '$hour': {
                              'date': '$timestamp', 
                              'timezone': '+05:30'
                            }
                          }, {
                            '$mod': [
                              {
                                '$hour': {
                                  'date': '$timestamp', 
                                  'timezone': '+05:30'
                                }
                              }, 1
                            ]
                          }
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      '_id': 0
                    }
                  }
                ]),
              ];

              //Execute Queries
              let [todayPerHourYield, yesterdayPerHourYield] = await Promise.allSettled(query);

              if(todayPerHourYield.value[0] != undefined)
                todayEnergy.push(todayPerHourYield.value[0].dailyEnergy);
              else
                todayEnergy.push(null);

              if(yesterdayPerHourYield.value[0] != undefined)
                yesterdayEnergy.push(yesterdayPerHourYield.value[0].dailyEnergy);
              else
                yesterdayEnergy.push(null);


              if(i!=0)
              {
                if(todayEnergy[i] !== null)
                  response.curve1.dailyYield[i]=parseInt(todayEnergy[i] - todayEnergy[i-1]);
                else
                  response.curve1.dailyYield[i]=null;

                if(yesterdayEnergy[i] !== null)
                  response.curve1.yesterdayYield[i]=parseInt(yesterdayEnergy[i] - yesterdayEnergy[i-1]);
                else
                  response.curve1.yesterdayYield[i]=null;
              }
              else
              {
                response.curve1.dailyYield[i] = todayEnergy[i];
                response.curve1.yesterdayYield[i] = yesterdayEnergy[i];
              }
              if(hour<10)
                response.curve1.timestamp[i] = '0'+hour+':00';
              else
                response.curve1.timestamp[i] = hour+':00';

              h++;
              hour++;
            }
          }

          if(plantProfile[0].centralizedInverter.isActive)
          {       
            const counter = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
            let h = 1;
            let hour = 4;

            //for(i=0, h=1, hour=4; i<16; i++)
            for(const i of counter)
            {
              let GMTTodayLTTemp = new Date(GMTTodayGT);
              GMTTodayLTTemp.setHours(GMTTodayLTTemp.getHours()+h);
              let GMTTodayLT = new Date(GMTTodayLTTemp).toUTCString();

              let GMTYesterdayLTTemp = new Date(GMTYesterdayGT);
              GMTYesterdayLTTemp.setHours(GMTYesterdayLTTemp.getHours()+h);
              let GMTYesterdayLT = new Date(GMTYesterdayLTTemp).toUTCString();
              
              let query = [
            
                //Centralized Inverter Daily Energy
                CentralizedInverter.aggregate([
                  {
                    '$match': {
                      'plantId': plantProfile[0].plantId, 
                      'timestamp': {
                        '$gte': new Date(GMTTodayGT), 
                        '$lt': new Date(GMTTodayLT)
                      }, 
                      'errorFlag': 0,
                      'masterFlag': 0
                    }
                  }, {
                    '$sort': {
                      'timestamp': 1
                    }
                  }, {
                    '$group': {
                      '_id': {
                        'deviceNo': '$deviceNo'
                      }, 
                      'dailyEnergy': {
                        '$max': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$last': '$timestamp'
                      }
                    }
                  }, {
                    '$group': {
                      '_id': null, 
                      'dailyEnergy': {
                        '$sum': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$first': '$timestamp'
                      }
                    }
                  }, {
                    '$addFields': {
                      'localeHour': {
                        '$subtract': [
                          {
                            '$hour': {
                              'date': '$timestamp', 
                              'timezone': '+05:30'
                            }
                          }, {
                            '$mod': [
                              {
                                '$hour': {
                                  'date': '$timestamp', 
                                  'timezone': '+05:30'
                                }
                              }, 1
                            ]
                          }
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      '_id': 0
                    }
                  }
                ]),

                CentralizedInverter.aggregate([
                  {
                    '$match': {
                      'plantId': plantProfile[0].plantId, 
                      'timestamp': {
                        '$gte': new Date(GMTYesterdayGT), 
                        '$lt': new Date(GMTYesterdayLT)
                      }, 
                      'errorFlag': 0,
                      'masterFlag': 0
                    }
                  }, {
                    '$sort': {
                      'timestamp': 1
                    }
                  }, {
                    '$group': {
                      '_id': {
                        'deviceNo': '$deviceNo'
                      }, 
                      'dailyEnergy': {
                        '$max': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$last': '$timestamp'
                      }
                    }
                  }, {
                    '$group': {
                      '_id': null, 
                      'dailyEnergy': {
                        '$sum': '$dailyEnergy'
                      }, 
                      'timestamp': {
                        '$first': '$timestamp'
                      }
                    }
                  }, {
                    '$addFields': {
                      'localeHour': {
                        '$subtract': [
                          {
                            '$hour': {
                              'date': '$timestamp', 
                              'timezone': '+05:30'
                            }
                          }, {
                            '$mod': [
                              {
                                '$hour': {
                                  'date': '$timestamp', 
                                  'timezone': '+05:30'
                                }
                              }, 1
                            ]
                          }
                        ]
                      }
                    }
                  }, {
                    '$project': {
                      '_id': 0
                    }
                  }
                ]),
              ];

              //Execute Queries
              let [todayPerHourYield, yesterdayPerHourYield] = await Promise.allSettled(query);

              if(todayPerHourYield.value[0] != undefined)
                todayEnergy.push(todayPerHourYield.value[0].dailyEnergy);
              else
                todayEnergy.push(null);

              if(yesterdayPerHourYield.value[0] != undefined)
                yesterdayEnergy.push(yesterdayPerHourYield.value[0].dailyEnergy);
              else
                yesterdayEnergy.push(null);


              if(i!=0)
              {
                if(todayEnergy[i] !== null)
                  response.curve1.dailyYield[i]=parseInt(todayEnergy[i] - todayEnergy[i-1]);
                else
                  response.curve1.dailyYield[i]=null;

                if(yesterdayEnergy[i] !== null)
                  response.curve1.yesterdayYield[i]=parseInt(yesterdayEnergy[i] - yesterdayEnergy[i-1]);
                else
                  response.curve1.yesterdayYield[i]=null;
              }
              else
              {
                response.curve1.dailyYield[i] = todayEnergy[i];
                response.curve1.yesterdayYield[i] = yesterdayEnergy[i];
              }
              
              if(hour<10)
                response.curve1.timestamp[i] = '0'+hour+':00';
              else
                response.curve1.timestamp[i] = hour+':00';

              h++;
              hour++;
            }
          }
        }
        else
        {
          throw new Error("Site Not Found, Please contact to Holmium Technologies!");
        }
        
       return  {status:true, response:response };
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