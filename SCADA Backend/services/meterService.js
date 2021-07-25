const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { Meter } = require('../models/meter'); 

exports.meterCardService = async(username, plantIdS, meterIds)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const meterId = Number(meterIds);
    
    let d = new Date();
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(00);
    const GMTDate = new Date(d).toUTCString();

    let dt = new Date();
    let min = dt.getMinutes() - 15;
    dt.setMinutes(min);
    const GMTDateTime = new Date(dt).toUTCString();

    try{

        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
            const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
        
        const meterProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'meter.details.id': meterId
              }
            }, {
              '$project': {
                'meter': {
                  '$filter': {
                    'input': '$meter.details', 
                    'as': 'meters', 
                    'cond': {
                      '$eq': [
                        '$$meters.id', meterId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(meterProfile[0] == undefined){
            throw new Error("Meter Not Found, Please contact to Holmium Technologies!"); 
        }

        let query = [

            Meter.aggregate([
                {
                  '$match': {
                    'plantId': plantId, 
                    'deviceNo': meterId, 
                    'errorFlag': 0, 
                    'solutionFlag': 'MFM'
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$limit': 1
                }, {
                  '$project': {
                    '_id': 0, 
                    'activeEnergyExport': 1, 
                    'activeEnergyImport': 1
                  }
                }
            ]),

            Meter.aggregate([
            {
                '$match': {
                'plantId': plantId, 
                'deviceNo': meterId, 
                'solutionFlag': 'MFM'
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
                '_id': 0, 
                'timestamp': 1, 
                'errorFlag': 1, 
                'duration': 1, 
                'frequency': 1, 
                'powerFactor': 1,
                'voltagePhaseR': 1, 
                'voltagePhaseY': 1, 
                'voltagePhaseB': 1, 
                'currentPhaseR': 1, 
                'currentPhaseY': 1, 
                'currentPhaseB': 1, 
                'activePowerPhaseR': 1, 
                'activePowerPhaseY': 1, 
                'activePowerPhaseB': 1, 
                'activePower': 1, 
                'reactivePower': 1, 
                'apparentPower': 1,
                'powerFactorPhaseR':1,
                'powerFactorPhaseY':1,
                'powerFactorPhaseB':1
                }
            }
            ])
        ];

        //Execute Queries
        let [meterEnergy, meterStatus] = await Promise.allSettled(query);

        if(typeof(meterStatus.value[0]) != 'undefined')
        {
            if(meterStatus.value[0].duration<=300)
            {
                if(meterStatus.value[0].errorFlag == 0)
                {
                    response.status = "Online";

                    if(meterStatus.value[0].frequency != undefined)
                      response.frequency = meterStatus.value[0].frequency + ' Hz';
                    else
                      response.frequency = 'NA';

                    if(meterStatus.value[0].powerFactor != undefined)
                      response.powerFactor = meterStatus.value[0].powerFactor;
                    else
                      response.powerFactor = 'NA';

                    if(meterStatus.value[0].powerFactorPhaseR != undefined)
                      response.powerFactorPhaseR=meterStatus.value[0].powerFactorPhaseR.toFixed(2);
                    else
                      response.powerFactorPhaseR='NA';
          
                    if(meterStatus.value[0].powerFactorPhaseY != undefined)
                      response.powerFactorPhaseY=meterStatus.value[0].powerFactorPhaseY.toFixed(2);
                    else
                      response.powerFactorPhaseY='NA';
          
                    if(meterStatus.value[0].powerFactorPhaseB != undefined)
                      response.powerFactorPhaseB=meterStatus.value[0].powerFactorPhaseB.toFixed(2);
                    else
                      response.powerFactorPhaseB='NA';
          
                    if(meterStatus.value[0].voltagePhaseR != undefined)
                      response.voltagePhaseR=meterStatus.value[0].voltagePhaseR.toFixed(2)+ ' V';
                    else
                      response.voltagePhaseR='NA';
          
                    if(meterStatus.value[0].voltagePhaseY != undefined)
                      response.voltagePhaseY=meterStatus.value[0].voltagePhaseY.toFixed(2)+ ' V';
                    else
                      response.voltagePhaseY='NA';
          
                    if(meterStatus.value[0].voltagePhaseB != undefined)
                      response.voltagePhaseB=meterStatus.value[0].voltagePhaseB.toFixed(2)+ ' V';
                    else
                      response.voltagePhaseB='NA';
          
                    if(meterStatus.value[0].currentPhaseR != undefined)
                      response.currentPhaseR=meterStatus.value[0].currentPhaseR.toFixed(2)+ ' A';
                    else
                      response.currentPhaseR='NA';
          
                    if(meterStatus.value[0].currentPhaseY != undefined)
                      response.currentPhaseY=meterStatus.value[0].currentPhaseY.toFixed(2)+ ' A';
                    else
                      response.currentPhaseY='NA';
          
                    if(meterStatus.value[0].currentPhaseB != undefined)
                      response.currentPhaseB=meterStatus.value[0].currentPhaseB.toFixed(2)+ ' A';
                    else
                      response.currentPhaseB='NA';
          
                    if(meterStatus.value[0].activePowerPhaseR != undefined)
                      response.activePowerPhaseR=meterStatus.value[0].activePowerPhaseR.toFixed(2)+ ' kW';
                     else
                      response.powerPhaseR='NA';
                    
                    if(meterStatus.value[0].activePowerPhaseY != undefined)
                      response.activePowerPhaseY=meterStatus.value[0].activePowerPhaseY.toFixed(2)+ ' kW';
                    else
                      response.powerPhaseY='NA';
          
                    if(meterStatus.value[0].activePowerPhaseB != undefined)
                      response.activePowerPhaseB=meterStatus.value[0].activePowerPhaseB.toFixed(2)+ ' kW';
                    else
                      response.powerPhaseB='NA';
          
                    if(meterStatus.value[0].activePower != undefined)
                      response.activePower=meterStatus.value[0].activePower.toFixed(2)+ ' kW';
                    else
                      response.activePower='NA';
          
                    if(meterStatus.value[0].reactivePower != undefined)
                      response.reactivePower=meterStatus.value[0].reactivePower.toFixed(2)+ ' KVAr';
                     else
                      response.reactivePower='NA';
          
                    if(meterStatus.value[0].apparentPower != undefined)
                      response.apparentPower=meterStatus.value[0].apparentPower.toFixed(2)+ ' KVA';
                    else
                      response.apparentPower='NA';

                }  
                else
                {
                    response.status='No-Data'; 
                    response.frequency = 'NA';
                    response.powerFactor = 'NA';
                    response.powerFactorPhaseR= 'NA', 
                    response.powerFactorPhaseY= 'NA', 
                    response.powerFactorPhaseB= 'NA', 
                    response.voltagePhaseR= 'NA', 
                    response.voltagePhaseY= 'NA', 
                    response.voltagePhaseB= 'NA', 
                    response.currentPhaseR= 'NA', 
                    response.currentPhaseY= 'NA', 
                    response.currentPhaseB= 'NA', 
                    response.activePowerPhaseR= 'NA', 
                    response.activePowerPhaseY= 'NA', 
                    response.activePowerPhaseB= 'NA', 
                    response.activePower= 'NA', 
                    response.reactivePower= 'NA', 
                    response.apparentPower= 'NA'
                }
            }
            else
            {
                response.status = "Offline";
                response.frequency = 'NA';
                response.powerFactor = 'NA';
                response.powerFactorPhaseR= 'NA', 
                response.powerFactorPhaseY= 'NA', 
                response.powerFactorPhaseB= 'NA', 
                response.voltagePhaseR= 'NA', 
                response.voltagePhaseY= 'NA', 
                response.voltagePhaseB= 'NA', 
                response.currentPhaseR= 'NA', 
                response.currentPhaseY= 'NA', 
                response.currentPhaseB= 'NA', 
                response.activePowerPhaseR= 'NA', 
                response.activePowerPhaseY= 'NA', 
                response.activePowerPhaseB= 'NA', 
                response.activePower= 'NA', 
                response.reactivePower= 'NA', 
                response.apparentPower= 'NA'
            }
            let timestamp = new Date(meterStatus.value[0].timestamp);
            response.timestamp = timestamp.toLocaleString('en-IN',{hourCycle:"h23"});
        }
        else
        {
            response.status = "Offline";
            response.frequency = 'NA';
            response.powerFactor = 'NA';
            response.powerFactorPhaseR= 'NA', 
            response.powerFactorPhaseY= 'NA', 
            response.powerFactorPhaseB= 'NA', 
            response.voltagePhaseR= 'NA', 
            response.voltagePhaseY= 'NA', 
            response.voltagePhaseB= 'NA', 
            response.currentPhaseR= 'NA', 
            response.currentPhaseY= 'NA', 
            response.currentPhaseB= 'NA', 
            response.activePowerPhaseR= 'NA', 
            response.activePowerPhaseY= 'NA', 
            response.activePowerPhaseB= 'NA', 
            response.activePower= 'NA', 
            response.reactivePower= 'NA', 
            response.apparentPower= 'NA'
            response.timestamp = "--";
        }
       
        if(typeof(meterEnergy.value[0]) != 'undefined')
        {
            response.activeEnergyExport = meterEnergy.value[0].activeEnergyExport;
            if(response.activeEnergyExport > 9999)
                response.activeEnergyExport = (response.activeEnergyExport/1000).toFixed(2)+' MWh';
            else
                response.activeEnergyExport = parseInt(response.activeEnergyExport)+' kWh';

            if(typeof(meterEnergy.value[0].activeEnergyImport) != 'undefined')
            {
                response.activeEnergyImport = meterEnergy.value[0].activeEnergyImport;
                if(response.activeEnergyImport > 9999)
                    response.activeEnergyImport = (response.activeEnergyImport/1000).toFixed(2)+' MWh';
                else
                    response.activeEnergyImport = parseInt(response.activeEnergyImport)+' kWh';
            }
            else
            {
                response.activeEnergyImport ='NA';
            } 
        }
        else
        {
            response.activeEnergyExport = 'NA';
            response.activeEnergyImport = 'NA';
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

exports.meterCurveService = async(username, plantIdS, meterIds, timestamp)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const meterId = Number(meterIds);
    const timestampTemp = Number(timestamp);
   
    let d = new Date(timestampTemp);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDateGT = new Date(d).toUTCString();
  
    let dt = new Date(timestampTemp);
    dt.setHours(23);
    dt.setMinutes(59);
    dt.setSeconds(59);
    dt.setMilliseconds(59);
    const GMTDateLT = new Date(dt).toUTCString();
    
    try{
  
        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
            const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
       
        const meterProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'meter.details.id': meterId
              }
            }, {
              '$project': {
                'meter': {
                  '$filter': {
                    'input': '$meter.details', 
                    'as': 'meters', 
                    'cond': {
                      '$eq': [
                        '$$meters.id', meterId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);
  
        if(meterProfile[0] == undefined){
            throw new Error("Meter Not Found, Please contact to Holmium Technologies!"); 
        }
  
        const meter = await Meter.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT), 
                '$gte': new Date(GMTDateGT)
              }, 
              'plantId': plantId, 
              'deviceNo': meterId
            }
          }, {
            '$sort': {
              'timestamp': 1
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
                'hour': {
                  '$hour': '$timestamp'
                }, 
                'minute': {
                  '$subtract': [
                    {
                      '$minute': '$timestamp'
                    }, {
                      '$mod': [
                        {
                          '$minute': '$timestamp'
                        }, 5
                      ]
                    }
                  ]
                }
              }, 
              'activeEnergyImport': {
                '$first': '$activeEnergyImport'
              }, 
              'activeEnergyExport': {
                '$first': '$activeEnergyExport'
              }, 
              'voltagePhaseR': {
                '$first': '$voltagePhaseR'
              }, 
              'voltagePhaseY': {
                '$first': '$voltagePhaseY'
              }, 
              'voltagePhaseB': {
                '$first': '$voltagePhaseB'
              }, 
              'currentPhaseR': {
                '$first': '$currentPhaseR'
              }, 
              'currentPhaseY': {
                '$first': '$currentPhaseY'
              }, 
              'currentPhaseB': {
                '$first': '$currentPhaseB'
              }, 
              'activePowerPhaseR': {
                '$first': '$activePowerPhaseR'
              }, 
              'activePowerPhaseY': {
                '$first': '$activePowerPhaseY'
              }, 
              'activePowerPhaseB': {
                '$first': '$activePowerPhaseB'
              },
              'powerFactorPhaseR': {
                '$first': '$powerFactorPhaseR'
              }, 
              'powerFactorPhaseY': {
                '$first': '$powerFactorPhaseY'
              }, 
              'powerFactorPhaseB': {
                '$first': '$powerFactorPhaseB'
              },
              'frequency': {
                '$first': '$frequency'
              }
            }
          }, {
            '$addFields': {
              'timestamp': {
                '$dateFromParts': {
                  'year': '$_id.year', 
                  'month': '$_id.month', 
                  'day': '$_id.day', 
                  'hour': '$_id.hour', 
                  'minute': '$_id.minute'
                }
              }
            }
          }, {
            '$addFields': {
              'time': {
                '$dateToString': {
                  'format': '%H:%M', 
                  'date': '$timestamp', 
                  'timezone': 'Asia/Kolkata'
                }
              }, 
              'minute': {
                '$sum': [
                  {
                    '$multiply': [
                      {
                        '$hour': {
                          'date': '$timestamp', 
                          'timezone': 'Asia/Kolkata'
                        }
                      }, 60
                    ]
                  }, {
                    '$multiply': [
                      {
                        '$minute': {
                          'date': '$timestamp', 
                          'timezone': 'Asia/Kolkata'
                        }
                      }, 1
                    ]
                  }
                ]
              }
            }
          }, {
            '$sort': {
              'timestamp': 1
            }
          }
        ])
  
        let range = 0;
        let counter = 0;
        let tempD = new Date();
        tempD.setHours(00);
        tempD.setMinutes(00);
        tempD.setSeconds(0);
        tempD.setMilliseconds(01);
        const tempDate = tempD.getTime();
  
        response.time = [];
        response.activeEnergyExport = [];
        response.activeEnergyImport = [];
        response.voltagePhaseR = [];
        response.voltagePhaseY = [];
        response.voltagePhaseB = [];
        response.currentPhaseR = [];
        response.currentPhaseY = [];
        response.currentPhaseB = [];
        response.activePowerPhaseR = [];
        response.activePowerPhaseY = [];
        response.activePowerPhaseB = [];
        response.powerFactorPhaseR = [];
        response.powerFactorPhaseY = [];
        response.powerFactorPhaseB = [];
        response.frequency = [];

        if(timestampTemp >= tempDate)
        {
          const now = new Date (timestampTemp);
          const h = now.getHours();
          const m = now.getMinutes();
          counter = parseInt((((h*60) + m) - range ) / 5);
          if(counter < 0)
            counter = 0
        }
        else
          counter=288;
      
        for (let i=0, j=0; i<counter; i++)
        {
          if(typeof meter[j] != 'undefined')
          {
            if(range <= meter[j].minute && meter[j].minute < range +5)
            {
              response.time.push(meter[j].time);
              response.activeEnergyExport.push(meter[j].activeEnergyExport);
              response.activeEnergyImport.push(meter[j].activeEnergyImport);
              response.voltagePhaseR.push(meter[j].voltagePhaseR);
              response.voltagePhaseY.push(meter[j].voltagePhaseY);
              response.voltagePhaseB.push(meter[j].voltagePhaseB);
              response.currentPhaseR.push(meter[j].currentPhaseR);
              response.currentPhaseY.push(meter[j].currentPhaseY);
              response.currentPhaseB.push(meter[j].currentPhaseB);
              response.activePowerPhaseR.push(meter[j].activePowerPhaseR);
              response.activePowerPhaseY.push(meter[j].activePowerPhaseY);
              response.activePowerPhaseB.push(meter[j].activePowerPhaseB);
              response.powerFactorPhaseR.push(meter[j].powerFactorPhaseR);
              response.powerFactorPhaseY.push(meter[j].powerFactorPhaseY);
              response.powerFactorPhaseB.push(meter[j].powerFactorPhaseB);
              response.frequency.push(meter[j].frequency);
              j++;
            }
            else
            {
              let n = range;
              let hour = parseInt(n / 60); 
              n %= 60; 
              let minutes = parseInt(n) ;
  
              if(hour > 9)
              {
                if(minutes == 0)
                  response.time.push(hour + ":00");
                else
                  response.time.push(hour + ":" + minutes);
              }
              else
              {
                if(minutes == 0)
                  response.time.push("0"+hour + ":00");
                else
                  response.time.push("0"+hour + ":" + minutes);
              }
  
                response.activeEnergyExport.push(null);
                response.activeEnergyImport.push(null);
                response.voltagePhaseR.push(null);
                response.voltagePhaseY.push(null);
                response.voltagePhaseB.push(null);
                response.currentPhaseR.push(null);
                response.currentPhaseY.push(null);
                response.currentPhaseB.push(null);
                response.activePowerPhaseR.push(null);
                response.activePowerPhaseY.push(null);
                response.activePowerPhaseB.push(null);
                response.powerFactorPhaseR.push(null);
                response.powerFactorPhaseY.push(null);
                response.powerFactorPhaseB.push(null);
                response.frequency.push(null);  
            }
          }
          else
          {
            let n = range;
            let hour = parseInt(n / 60); 
            n %= 60; 
            let minutes = parseInt(n) ;
  
            if(hour > 9)
              {
                if(minutes == 0)
                  response.time.push(hour + ":00");
                else
                  response.time.push(hour + ":" + minutes);
              }
              else
              {
                if(minutes == 0)
                  response.time.push("0"+hour + ":00");
                else
                  response.time.push("0"+hour + ":" + minutes);
              }

              response.activeEnergyExport.push(null);
              response.activeEnergyImport.push(null);
              response.voltagePhaseR.push(null);
              response.voltagePhaseY.push(null);
              response.voltagePhaseB.push(null);
              response.currentPhaseR.push(null);
              response.currentPhaseY.push(null);
              response.currentPhaseB.push(null);
              response.activePowerPhaseR.push(null);
              response.activePowerPhaseY.push(null);
              response.activePowerPhaseB.push(null);
              response.powerFactorPhaseR.push(null);
              response.powerFactorPhaseY.push(null);
              response.powerFactorPhaseB.push(null);
              response.frequency.push(null);  
          }
          range = range+5;
        }
   
        response.todayActiveEnergyExport = [];
        response.todayActiveEnergyImport = [];

        if(Array.isArray(response.activeEnergyExport) && response.activeEnergyExport.length)
        {
            let activeEnergyExportMin = Math.min(...response.activeEnergyExport.filter(x => x !== null));
            
            for(let x=0; x<response.activeEnergyExport.length; x++)
            {
                if(response.activeEnergyExport[x])
                {
                    response.todayActiveEnergyExport.push(Number((response.activeEnergyExport[x]-activeEnergyExportMin).toFixed(2)));
                }
                else
                {
                    response.todayActiveEnergyExport.push(null);
                }
            }
        }

        if(Array.isArray(response.activeEnergyImport) && response.activeEnergyImport.length)
        {
            let activeEnergyImportMin = Math.min(...response.activeEnergyImport.filter(x => x !== null));
            
            for(let x=0; x<response.activeEnergyImport.length; x++)
            {
                if(response.activeEnergyImport[x])
                {
                    response.todayActiveEnergyImport.push(Number((response.activeEnergyImport[x]-activeEnergyImportMin).toFixed(2)));
                }
                else
                {
                    response.todayActiveEnergyImport.push(null);
                }
            }
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