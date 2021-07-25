const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { StringInverter } = require('../models/stringinverter'); 
const { CentralizedInverter } = require('../models/centralizedinverter');

exports.stringInverterCardService = async(username, plantIdS, inverterIds)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const inverterId = Number(inverterIds);
    
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

        const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

        if(user == null){
            throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
        }
       
        const inverterProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'stringInverter.details.id': inverterId
              }
            }, {
              '$project': {
                'inverter': {
                  '$filter': {
                    'input': '$stringInverter.details', 
                    'as': 'inverters', 
                    'cond': {
                      '$eq': [
                        '$$inverters.id', inverterId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(inverterProfile[0] == undefined){
            throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
        }

        let query = [
            StringInverter.aggregate([
              {
                '$match': {
                  'plantId': plantId, 
                  'deviceNo': inverterId
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
          ]),

            StringInverter.aggregate([
              {
                '$match': {
                  'timestamp': { 
                      $gte: new Date(GMTDate)
                  },
                  'plantId': plantId,
                  'deviceNo': inverterId,
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
          ]),
          
            StringInverter.aggregate([
              {
                '$match': {
                  'timestamp': {
                    '$gte': new Date(GMTDate)
                  }, 
                  'plantId': plantId, 
                  'deviceNo': inverterId, 
                  'errorFlag': 0
                }
              }, {
                '$sort': {
                  'activePower': -1
                }
              }, {
                '$limit': 1
              }, {
                '$project': {
                  'activePower': 1, 
                  'timestamp': 1
                }
              }
          ]),

            StringInverter.aggregate([
            {
              '$match': {
                'timestamp': {
                  '$gte': new Date(GMTDate)
                }, 
                'plantId': plantId, 
                'deviceNo': inverterId, 
                'errorFlag': 0
              }
            }, {
              '$sort': {
                'activePower': -1
              }
            }, {
              '$limit': 1
            }, {
              '$project': {
                'activePower': 1, 
                'timestamp': 1
              }
            }
          ])
        ];

        //Execute Queries
        let [inverterStatus, inverter, inverterPeakOutputPower, inverterTotalEnergy] = await Promise.allSettled(query);

        if(typeof(inverterStatus.value[0]) != 'undefined'){
            if(inverterStatus.value[0].duration<=600){
                if(inverterStatus.value[0].errorFlag == 0)
                    response.status = inverterStatus.value[0].status.substr(0, 14);
                else
                    response.status='No-Data';  
            }
            else{
                response.status = "Offline";
            }
            let timestamp = new Date(inverterStatus.value[0].timestamp);
            response.timestamp = timestamp.toLocaleString('en-IN',{hourCycle:"h23"});
        }
        else{
            response.status = "Offline";
            response.timestamp = "--";
        }
        
        if(typeof(inverter.value[0]) != 'undefined'){
            response.todayYield = inverter.value[0].dailyEnergy;
            response.totalYield = inverter.value[0].totalEnergy;
            response.specificYield = (inverter.value[0].dailyEnergy / inverterProfile[0].inverter[0].capacity).toFixed(2);
            response.capacity = inverterProfile[0].inverter[0].capacity;
        
            if(inverter.value[0].duration<=600){
                response.outputPower = inverter.value[0].activePower;
                response.inputPower = inverter.value[0].inputPower;
                response.specificPower = (inverter.value[0].activePower / inverterProfile[0].inverter[0].capacity).toFixed(2);
                response.temperature = inverter.value[0].temperature;
                response.efficiency = inverter.value[0].efficiency;
            }
            else{
                response.outputPower = 0;
                response.inputPower = 0;
                response.specificPower = 0;
                response.efficiency = 0;
                response.temperature = 0;
            }
        }
        else{
            response.todayYield = 0;
            response.outputPower = 0;
            response.inputPower = 0; 
            response.specificYield = 0;
            response.specificPower = 0;
            response.efficiency = 0;
            response.capacity = inverterProfile[0].inverter[0].capacity;

            if(typeof(inverterTotalEnergy.value[0]) != 'undefined')
                response.totalYield = inverterTotalEnergy.value[0].totalEnergy;
            else
                response.totalYield = 0;
        }
        
        if(typeof(inverterPeakOutputPower.value[0]) != 'undefined'){
            response.peakOutputPower = inverterPeakOutputPower.value[0].activePower;
            let peakOutputPowertimestamp = new Date(inverterPeakOutputPower.value[0].timestamp);
            response.peakOutputPowerTimestamp = peakOutputPowertimestamp.toLocaleString('en-IN',{hourCycle:"h23"});
        }
        else{
            response.peakOutputPower = 0;
            response.peakOutputPowerTimestamp = 'NA';
        }
        
        if(response.todayYield>9999)
            response.todayYield = (response.todayYield/1000).toFixed(2)+' MWh';
        else
            response.todayYield = response.todayYield+' kWh';
        
        if(response.totalYield>9999)
            response.totalYield = (response.totalYield/1000).toFixed(2)+' MWh';
        else
            response.totalYield =response.totalYield+' kWh';
        
        if(response.outputPower>9999)
            response.outputPower = (response.outputPower/1000).toFixed(2)+' MW';
        else
            response.outputPower = response.outputPower+' kW';

        if(response.inputPower>9999)
            response.inputPower = (response.inputPower/1000).toFixed(2)+' MW';
        else
            response.inputPower = response.inputPower+' kW';

        if(response.peakOutputPower>9999)
            response.peakOutputPower = (response.peakOutputPower/1000).toFixed(2)+' MW';
        else
            response.peakOutputPower = response.peakOutputPower+' kW';
       
        response.efficiency = response.efficiency+' %';

        if(typeof response.temperature != 'undefined')
            response.temperature = response.temperature+' °C';
        else
            response.temperature = '0 °C';

        if(response.capacity>9999)
            response.capacity = (response.capacity/1000).toFixed(2)+' MW';
        else
            response.capacity =response.capacity+' kW';

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

exports.stringInverterCurveService = async(username, plantIdS, inverterIds, timestamp)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const inverterId = Number(inverterIds);
  const timestampTemp = Number(timestamp);
 
  let d = new Date(timestampTemp);
  d.setHours(05);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(00);
  const GMTDateGT = new Date(d).toUTCString();

  let dt = new Date(timestampTemp);
  dt.setHours(20);
  dt.setMinutes(00);
  dt.setSeconds(00);
  dt.setMilliseconds(00);
  const GMTDateLT = new Date(dt).toUTCString();
  
  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const inverterProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'stringInverter.details.id': inverterId
            }
          }, {
            '$project': {
              'inverter': {
                '$filter': {
                  'input': '$stringInverter.details', 
                  'as': 'inverters', 
                  'cond': {
                    '$eq': [
                      '$$inverters.id', inverterId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(inverterProfile[0] == undefined){
          throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
      }

      const inverter = await StringInverter.aggregate([
        {
          '$match': {
            'timestamp': {
              '$lte': new Date(GMTDateLT), 
              '$gte': new Date(GMTDateGT)
            }, 
            'plantId': plantId, 
            'deviceNo': inverterId
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
            'efficiency': {
              '$first': '$efficiency'
            }, 
            'temperature': {
              '$first': '$temperature'
            }, 
            'outputCurrent': {
              '$first': '$outputCurrent'
            }, 
            'inputCurrent': {
              '$first': '$inputCurrent'
            }, 
            'activePower': {
              '$first': '$activePower'
            }, 
            'inputPower': {
              '$first': '$inputPower'
            }, 
            'dailyEnergy': {
              '$first': '$dailyEnergy'
            }, 
            'totalEnergy': {
              '$first': '$totalEnergy'
            }, 
            'currentMPPT1': {
              '$first': '$currentMPPT1'
            }, 
            'currentMPPT2': {
              '$first': '$currentMPPT2'
            }, 
            'currentMPPT3': {
              '$first': '$currentMPPT3'
            }, 
            'currentMPPT4': {
              '$first': '$currentMPPT4'
            }, 
            'currentMPPT5': {
              '$first': '$currentMPPT5'
            }, 
            'currentMPPT6': {
              '$first': '$currentMPPT6'
            }, 
            'currentMPPT7': {
              '$first': '$currentMPPT7'
            }, 
            'currentMPPT8': {
              '$first': '$currentMPPT8'
            }, 
            'currentMPPT9': {
              '$first': '$currentMPPT9'
            }, 
            'currentMPPT10': {
              '$first': '$currentMPPT10'
            }, 
            'currentMPPT11': {
              '$first': '$currentMPPT11'
            }, 
            'currentMPPT12': {
              '$first': '$currentMPPT12'
            }, 
            'currentMPPT13': {
              '$first': '$currentMPPT13'
            }, 
            'currentMPPT14': {
              '$first': '$currentMPPT14'
            }, 
            'currentMPPT15': {
              '$first': '$currentMPPT15'
            }, 
            'powerMPPT1': {
              '$first': '$powerMPPT1'
            }, 
            'powerMPPT2': {
              '$first': '$powerMPPT2'
            }, 
            'powerMPPT3': {
              '$first': '$powerMPPT3'
            }, 
            'powerMPPT4': {
              '$first': '$powerMPPT4'
            }, 
            'powerMPPT5': {
              '$first': '$powerMPPT5'
            }, 
            'powerMPPT6': {
              '$first': '$powerMPPT6'
            }, 
            'powerMPPT7': {
              '$first': '$powerMPPT7'
            }, 
            'powerMPPT8': {
              '$first': '$powerMPPT8'
            }, 
            'powerMPPT9': {
              '$first': '$powerMPPT9'
            }, 
            'powerMPPT10': {
              '$first': '$powerMPPT10'
            }, 
            'powerMPPT11': {
              '$first': '$powerMPPT11'
            }, 
            'powerMPPT12': {
              '$first': '$powerMPPT12'
            }, 
            'powerMPPT13': {
              '$first': '$powerMPPT13'
            }, 
            'powerMPPT14': {
              '$first': '$powerMPPT14'
            }, 
            'powerMPPT15': {
              '$first': '$powerMPPT15'
            }, 
            'currentString1': {
              '$first': '$currentString1'
            }, 
            'currentString2': {
              '$first': '$currentString2'
            }, 
            'currentString3': {
              '$first': '$currentString3'
            }, 
            'currentString4': {
              '$first': '$currentString4'
            }, 
            'currentString5': {
              '$first': '$currentString5'
            }, 
            'currentString6': {
              '$first': '$currentString6'
            }, 
            'currentString7': {
              '$first': '$currentString7'
            }, 
            'currentString8': {
              '$first': '$currentString8'
            }, 
            'currentString9': {
              '$first': '$currentString9'
            }, 
            'currentString10': {
              '$first': '$currentString10'
            }, 
            'currentString11': {
              '$first': '$currentString11'
            }, 
            'currentString12': {
              '$first': '$currentString12'
            }, 
            'currentString13': {
              '$first': '$currentString13'
            }, 
            'currentString14': {
              '$first': '$currentString14'
            }, 
            'currentString15': {
              '$first': '$currentString15'
            }, 
            'currentString16': {
              '$first': '$currentString16'
            }, 
            'currentString17': {
              '$first': '$currentString17'
            }, 
            'currentString18': {
              '$first': '$currentString18'
            }, 
            'currentString19': {
              '$first': '$currentString19'
            }, 
            'currentString20': {
              '$first': '$currentString20'
            }, 
            'currentString21': {
              '$first': '$currentString21'
            }, 
            'currentString22': {
              '$first': '$currentString22'
            }, 
            'currentString23': {
              '$first': '$currentString23'
            }, 
            'currentString24': {
              '$first': '$currentString24'
            }, 
            'currentString25': {
              '$first': '$currentString25'
            }, 
            'currentString26': {
              '$first': '$currentString26'
            }, 
            'currentString27': {
              '$first': '$currentString27'
            }, 
            'currentString28': {
              '$first': '$currentString28'
            }, 
            'currentString29': {
              '$first': '$currentString29'
            }, 
            'currentString30': {
              '$first': '$currentString30'
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

      let currentMPPT1 = false;
      let currentMPPT2 = false;
      let currentMPPT3 = false;
      let currentMPPT4 = false;
      let currentMPPT5 = false;
      let currentMPPT6 = false;
      let currentMPPT7 = false;
      let currentMPPT8 = false;
      let currentMPPT9 = false;
      let currentMPPT10 = false;
      let currentMPPT11 = false;
      let currentMPPT12 = false;
      let currentMPPT13 = false;
      let currentMPPT14 = false; 
      let currentMPPT15 = false;
      let powerMPPT1 = false;
      let powerMPPT2 = false;
      let powerMPPT3 = false; 
      let powerMPPT4 = false;
      let powerMPPT5 = false;
      let powerMPPT6 = false;
      let powerMPPT7 = false;
      let powerMPPT8 = false;
      let powerMPPT9 = false;
      let powerMPPT10 = false;
      let powerMPPT11 = false;
      let powerMPPT12 = false;
      let powerMPPT13 = false;
      let powerMPPT14 = false;
      let powerMPPT15 = false;
      let currentString1 = false;
      let currentString2 = false;
      let currentString3 = false;
      let currentString4 = false;
      let currentString5 = false; 
      let currentString6 = false; 
      let currentString7 = false;
      let currentString8 = false;
      let currentString9 = false;
      let currentString10 = false; 
      let currentString11 = false;
      let currentString12 = false;
      let currentString13 = false;
      let currentString14 = false;
      let currentString15 = false;
      let currentString16 = false;
      let currentString17 = false;
      let currentString18 = false;
      let currentString19 = false;
      let currentString20 = false;
      let currentString21 = false;
      let currentString22 = false;
      let currentString23 = false;
      let currentString24 = false; 
      let currentString25 = false; 
      let currentString26 = false;
      let currentString27 = false; 
      let currentString28 = false;
      let currentString29 = false;
      let currentString30 = false;

      inverter.forEach(element => {
        if(element.currentMPPT1 != null && element.currentMPPT1 != 0 && !currentMPPT1)
          currentMPPT1 = true;
        if(element.currentMPPT2 != null && element.currentMPPT2 != 0 && !currentMPPT2)
          currentMPPT2 = true;
        if(element.currentMPPT3 != null && element.currentMPPT3 != 0 && !currentMPPT3)
          currentMPPT3 = true;
        if(element.currentMPPT4 != null && element.currentMPPT4 != 0 && !currentMPPT4)
          currentMPPT4 = true;
        if(element.currentMPPT5 != null && element.currentMPPT5 != 0 && !currentMPPT5)
          currentMPPT5 = true;
        if(element.currentMPPT6 != null && element.currentMPPT6 != 0 && !currentMPPT6)
          currentMPPT6 = true;
        if(element.currentMPPT7 != null && element.currentMPPT7 != 0 && !currentMPPT7)
          currentMPPT7 = true;
        if(element.currentMPPT8 != null && element.currentMPPT8 != 0 && !currentMPPT8)
          currentMPPT8 = true;
        if(element.currentMPPT9 != null && element.currentMPPT9 != 0 && !currentMPPT9)
          currentMPPT9 = true;
        if(element.currentMPPT10 != null && element.currentMPPT10 != 0 && !currentMPPT10)
          currentMPPT10 = true;
        if(element.currentMPPT11 != null && element.currentMPPT11 != 0 && !currentMPPT11)
          currentMPPT11 = true;
        if(element.currentMPPT12 != null && element.currentMPPT12 != 0 && !currentMPPT12)
          currentMPPT12 = true;
        if(element.currentMPPT13 != null && element.currentMPPT13 != 0 && !currentMPPT13)
          currentMPPT13 = true;
        if(element.currentMPPT14 != null && element.currentMPPT14 != 0 && !currentMPPT14)
          currentMPPT14 = true;
        if(element.currentMPPT15 != null && element.currentMPPT15 != 0 && !currentMPPT15)
          currentMPPT15 = true;

        if(element.powerMPPT1 != null && element.powerMPPT1 != 0 && !powerMPPT1)
          powerMPPT1 = true;
        if(element.powerMPPT2 != null && element.powerMPPT2 != 0 && !powerMPPT2)
          powerMPPT2 = true;
        if(element.powerMPPT3 != null && element.powerMPPT3 != 0 && !powerMPPT3)
          powerMPPT3 = true;
        if(element.powerMPPT4 != null && element.powerMPPT4 != 0 && !powerMPPT4)
          powerMPPT4 = true;
        if(element.powerMPPT5 != null && element.powerMPPT5 != 0 && !powerMPPT5)
          powerMPPT5 = true;
        if(element.powerMPPT6 != null && element.powerMPPT6 != 0 && !powerMPPT6)
          powerMPPT6 = true;
        if(element.powerMPPT7 != null && element.powerMPPT7 != 0 && !powerMPPT7)
          powerMPPT7 = true;
        if(element.powerMPPT8 != null && element.powerMPPT8 != 0 && !powerMPPT8)
          powerMPPT8 = true;
        if(element.powerMPPT9 != null && element.powerMPPT9 != 0 && !powerMPPT9)
          powerMPPT9 = true;
        if(element.powerMPPT10 != null && element.powerMPPT10 != 0 && !powerMPPT10)
          powerMPPT10 = true;
        if(element.powerMPPT11 != null && element.powerMPPT11 != 0 && !powerMPPT11)
          powerMPPT11 = true;
        if(element.powerMPPT12 != null && element.powerMPPT12 != 0 && !powerMPPT12)
          powerMPPT12 = true;
        if(element.powerMPPT13 != null && element.powerMPPT13 != 0 && !powerMPPT13)
          powerMPPT13 = true;
        if(element.powerMPPT14 != null && element.powerMPPT14 != 0 && !powerMPPT14)
          powerMPPT14 = true;
        if(element.powerMPPT15 != null && element.powerMPPT15 != 0 && !powerMPPT15)
          powerMPPT15 = true;

        if(element.currentString1 != null && element.currentString1 != 0 && !currentString1)
          currentString1 = true;
        if(element.currentString2 != null && element.currentString2 != 0 && !currentString2)
          currentString2 = true;
        if(element.currentString3 != null && element.currentString3 != 0 && !currentString3)
          currentString3 = true;
        if(element.currentString4 != null && element.currentString4 != 0 && !currentString4)
          currentString4 = true;
        if(element.currentString5 != null && element.currentString5 != 0 && !currentString5)
          currentString5 = true;
        if(element.currentString6 != null && element.currentString6 != 0 && !currentString6)
          currentString6 = true;
        if(element.currentString7 != null && element.currentString7 != 0 && !currentString7)
          currentString7 = true;
        if(element.currentString8 != null && element.currentString8 != 0 && !currentString8)
          currentString8 = true;
        if(element.currentString9 != null && element.currentString9 != 0 && !currentString9)
          currentString9 = true;
        if(element.currentString10 != null && element.currentString10 != 0 && !currentString10)
          currentString10 = true;
        if(element.currentString11 != null && element.currentString11 != 0 && !currentString11)
          currentString11 = true;
        if(element.currentString12 != null && element.currentString12 != 0 && !currentString12)
          currentString12 = true;
        if(element.currentString13 != null && element.currentString13 != 0 && !currentString13)
          currentString13 = true;
        if(element.currentString14 != null && element.currentString14 != 0 && !currentString14)
          currentString14 = true;
        if(element.currentString15 != null && element.currentString15 != 0 && !currentString15)
          currentString15 = true;
        if(element.currentString16 != null && element.currentString16 != 0 && !currentString16)
          currentString16 = true;
        if(element.currentString17 != null && element.currentString17 != 0 && !currentString17)
          currentString17 = true;
        if(element.currentString18 != null && element.currentString18 != 0 && !currentString18)
          currentString18 = true;
        if(element.currentString19 != null && element.currentString19 != 0 && !currentString19)
          currentString19 = true;
        if(element.currentString20 != null && element.currentString20 != 0 && !currentString20)
          currentString20 = true;
        if(element.currentString21 != null && element.currentString21 != 0 && !currentString21)
          currentString21 = true;
        if(element.currentString22 != null && element.currentString22 != 0 && !currentString22)
          currentString22 = true;
        if(element.currentString23 != null && element.currentString23 != 0 && !currentString23)
          currentString23 = true;
        if(element.currentString24 != null && element.currentString24 != 0 && !currentString24)
          currentString24 = true;
        if(element.currentString25 != null && element.currentString25 != 0 && !currentString25)
          currentString25 = true;
        if(element.currentString26 != null && element.currentString26 != 0 && !currentString26)
          currentString26 = true;
        if(element.currentString27 != null && element.currentString27 != 0 && !currentString27)
          currentString27 = true;
        if(element.currentString28 != null && element.currentString28 != 0 && !currentString28)
          currentString28 = true;
        if(element.currentString29 != null && element.currentString29 != 0 && !currentString29)
          currentString29 = true;
        if(element.currentString30 != null && element.currentString30 != 0 && !currentString30)
          currentString30 = true;
      });
     
      response.time=[];
      response.dailyYield=[];
      response.totalYield=[];
      response.outputCurrent=[];
      response.inputCurrent=[];
      response.outputPower=[];
      response.inputPower=[];
      response.temperature=[];
      response.efficiency=[];
      
      if(currentMPPT1)
      response.currentMPPT1=[];
      if(currentMPPT2)
      response.currentMPPT2=[];
      if(currentMPPT3)
      response.currentMPPT3=[];
      if(currentMPPT4)
      response.currentMPPT4=[];
      if(currentMPPT5)
      response.currentMPPT5=[];
      if(currentMPPT6)
      response.currentMPPT6=[];
      if(currentMPPT7)
      response.currentMPPT7=[];
      if(currentMPPT8)
      response.currentMPPT8=[];
      if(currentMPPT9)
      response.currentMPPT9=[];
      if(currentMPPT10)
      response.currentMPPT10=[];
      if(currentMPPT11)
      response.currentMPPT11=[];
      if(currentMPPT12)
      response.currentMPPT12=[];
      if(currentMPPT13)
      response.currentMPPT13=[];
      if(currentMPPT14)
      response.currentMPPT14=[];
      if(currentMPPT15)
      response.currentMPPT15=[];
      
      if(powerMPPT1)
      response.powerMPPT1=[];
      if(powerMPPT2)
      response.powerMPPT2=[];
      if(powerMPPT3)
      response.powerMPPT3=[];
      if(powerMPPT4)
      response.powerMPPT4=[];
      if(powerMPPT5)
      response.powerMPPT5=[];
      if(powerMPPT6)
      response.powerMPPT6=[];
      if(powerMPPT7)
      response.powerMPPT7=[];
      if(powerMPPT8)
      response.powerMPPT8=[];
      if(powerMPPT9)
      response.powerMPPT9=[];
      if(powerMPPT10)
      response.powerMPPT10=[];
      if(powerMPPT11)
      response.powerMPPT11=[];
      if(powerMPPT12)
      response.powerMPPT12=[];
      if(powerMPPT13)
      response.powerMPPT13=[];
      if(powerMPPT14)
      response.powerMPPT14=[];
      if(powerMPPT15)
      response.powerMPPT15=[];

      if(currentString1)
      response.currentString1=[];
      if(currentString2)
      response.currentString2=[];
      if(currentString3)
      response.currentString3=[];
      if(currentString4)
      response.currentString4=[];
      if(currentString5)
      response.currentString5=[];
      if(currentString6)
      response.currentString6=[];
      if(currentString7)
      response.currentString7=[];
      if(currentString8)
      response.currentString8=[];
      if(currentString9)
      response.currentString9=[];
      if(currentString10)
      response.currentString10=[];
      if(currentString11)
      response.currentString11=[];
      if(currentString12)
      response.currentString12=[];
      if(currentString13)
      response.currentString13=[];
      if(currentString14)
      response.currentString14=[];
      if(currentString15)
      response.currentString15=[];
      if(currentString16)
      response.currentString16=[];
      if(currentString17)
      response.currentString17=[];
      if(currentString18)
      response.currentString18=[];
      if(currentString19)
      response.currentString19=[];
      if(currentString20)
      response.currentString20=[];
      if(currentString21)
      response.currentString21=[];
      if(currentString22)
      response.currentString22=[];
      if(currentString23)
      response.currentString23=[];
      if(currentString24)
      response.currentString24=[];
      if(currentString25)
      response.currentString25=[];
      if(currentString26)
      response.currentString26=[];
      if(currentString27)
      response.currentString27=[];
      if(currentString28)
      response.currentString28=[];
      if(currentString29)
      response.currentString29=[];
      if(currentString30)
      response.currentString30=[];

      let range = 300;
      let counter = 0;
      let tempD = new Date();
      tempD.setHours(00);
      tempD.setMinutes(00);
      tempD.setSeconds(01);
      tempD.setMilliseconds(00);
      const tempDate = tempD.getTime();

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
        counter=180;
    
      for (let i=0, j=0; i<=counter; i++)
      {
        if(typeof inverter[j] != 'undefined')
        {
          if(range <= inverter[j].minute && inverter[j].minute < range +5)
          {
            response.time.push(inverter[j].time);
            response.dailyYield.push(inverter[j].dailyEnergy);
            response.totalYield.push(inverter[j].totalEnergy);
            response.outputCurrent.push(inverter[j].outputCurrent);
            response.inputCurrent.push(inverter[j].inputCurrent);
            response.outputPower.push(inverter[j].activePower);
            response.inputPower.push(inverter[j].inputPower);
            response.temperature.push(inverter[j].temperature);
            response.efficiency.push(inverter[j].efficiency);
    
            if(currentMPPT1)
            response.currentMPPT1.push(inverter[j].currentMPPT1);
            if(currentMPPT2)
            response.currentMPPT2.push(inverter[j].currentMPPT2);
            if(currentMPPT3)
            response.currentMPPT3.push(inverter[j].currentMPPT3);
            if(currentMPPT4)
            response.currentMPPT4.push(inverter[j].currentMPPT4);
            if(currentMPPT5)
            response.currentMPPT5.push(inverter[j].currentMPPT5);
            if(currentMPPT6)
            response.currentMPPT6.push(inverter[j].currentMPPT6);
            if(currentMPPT7)
            response.currentMPPT7.push(inverter[j].currentMPPT7);
            if(currentMPPT8)
            response.currentMPPT8.push(inverter[j].currentMPPT8);
            if(currentMPPT9)
            response.currentMPPT9.push(inverter[j].currentMPPT9);
            if(currentMPPT10)
            response.currentMPPT10.push(inverter[j].currentMPPT10);
            if(currentMPPT11)
            response.currentMPPT11.push(inverter[j].currentMPPT11);
            if(currentMPPT12)
            response.currentMPPT12.push(inverter[j].currentMPPT12);
            if(currentMPPT13)
            response.currentMPPT13.push(inverter[j].currentMPPT13);
            if(currentMPPT14)
            response.currentMPPT14.push(inverter[j].currentMPPT14);
            if(currentMPPT15)
            response.currentMPPT15.push(inverter[j].currentMPPT15);
    
            if(powerMPPT1)
            response.powerMPPT1.push(inverter[j].powerMPPT1);
            if(powerMPPT2)
            response.powerMPPT2.push(inverter[j].powerMPPT2);
            if(powerMPPT3)
            response.powerMPPT3.push(inverter[j].powerMPPT3);
            if(powerMPPT4)
            response.powerMPPT4.push(inverter[j].powerMPPT4);
            if(powerMPPT5)
            response.powerMPPT5.push(inverter[j].powerMPPT5);
            if(powerMPPT6)
            response.powerMPPT6.push(inverter[j].powerMPPT6);
            if(powerMPPT7)
            response.powerMPPT7.push(inverter[j].powerMPPT7);
            if(powerMPPT8)
            response.powerMPPT8.push(inverter[j].powerMPPT8);
            if(powerMPPT9)
            response.powerMPPT9.push(inverter[j].powerMPPT9);
            if(powerMPPT10)
            response.powerMPPT10.push(inverter[j].powerMPPT10);
            if(powerMPPT11)
            response.powerMPPT11.push(inverter[j].powerMPPT11);
            if(powerMPPT12)
            response.powerMPPT12.push(inverter[j].powerMPPT12);
            if(powerMPPT13)
            response.powerMPPT13.push(inverter[j].powerMPPT13);
            if(powerMPPT14)
            response.powerMPPT14.push(inverter[j].powerMPPT14);
            if(powerMPPT15)
            response.powerMPPT15.push(inverter[j].powerMPPT15);
    
            if(currentString1)
            response.currentString1.push(inverter[j].currentString1);
            if(currentString2)
            response.currentString2.push(inverter[j].currentString2);
            if(currentString3)
            response.currentString3.push(inverter[j].currentString3);
            if(currentString4)
            response.currentString4.push(inverter[j].currentString4);
            if(currentString5)
            response.currentString5.push(inverter[j].currentString5);
            if(currentString6)
            response.currentString6.push(inverter[j].currentString6);
            if(currentString7)
            response.currentString7.push(inverter[j].currentString7);
            if(currentString8)
            response.currentString8.push(inverter[j].currentString8);
            if(currentString9)
            response.currentString9.push(inverter[j].currentString9);
            if(currentString10)
            response.currentString10.push(inverter[j].currentString10);
            if(currentString11)
            response.currentString11.push(inverter[j].currentString11);
            if(currentString12)
            response.currentString12.push(inverter[j].currentString12);
            if(currentString13)
            response.currentString13.push(inverter[j].currentString13);
            if(currentString14)
            response.currentString14.push(inverter[j].currentString14);
            if(currentString15)
            response.currentString15.push(inverter[j].currentString15);
            if(currentString16)
            response.currentString16.push(inverter[j].currentString16);
            if(currentString17)
            response.currentString17.push(inverter[j].currentString17);
            if(currentString18)
            response.currentString18.push(inverter[j].currentString18);
            if(currentString19)
            response.currentString19.push(inverter[j].currentString19);
            if(currentString20)
            response.currentString20.push(inverter[j].currentString20);
            if(currentString21)
            response.currentString21.push(inverter[j].currentString21);
            if(currentString22)
            response.currentString22.push(inverter[j].currentString22);
            if(currentString23)
            response.currentString23.push(inverter[j].currentString23);
            if(currentString24)
            response.currentString24.push(inverter[j].currentString24);
            if(currentString25)
            response.currentString25.push(inverter[j].currentString25);
            if(currentString26)
            response.currentString26.push(inverter[j].currentString26);
            if(currentString27)
            response.currentString27.push(inverter[j].currentString27);
            if(currentString28)
            response.currentString28.push(inverter[j].currentString28);
            if(currentString29)
            response.currentString29.push(inverter[j].currentString29);
            if(currentString30)
            response.currentString30.push(inverter[j].currentString30);
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

            response.dailyYield.push(null);
            response.totalYield.push(null);
            response.outputCurrent.push(null);
            response.inputCurrent.push(null);
            response.outputPower.push(null);
            response.inputPower.push(null);
            response.temperature.push(null);
            response.efficiency.push(null);

            if(currentMPPT1)
            response.currentMPPT1.push(null);
            if(currentMPPT2)
            response.currentMPPT2.push(null);
            if(currentMPPT3)
            response.currentMPPT3.push(null);
            if(currentMPPT4)
            response.currentMPPT4.push(null);
            if(currentMPPT5)
            response.currentMPPT5.push(null);
            if(currentMPPT6)
            response.currentMPPT6.push(null);
            if(currentMPPT7)
            response.currentMPPT7.push(null);
            if(currentMPPT8)
            response.currentMPPT8.push(null);
            if(currentMPPT9)
            response.currentMPPT9.push(null);
            if(currentMPPT10)
            response.currentMPPT10.push(null);
            if(currentMPPT11)
            response.currentMPPT11.push(null);
            if(currentMPPT12)
            response.currentMPPT12.push(null);
            if(currentMPPT13)
            response.currentMPPT13.push(null);
            if(currentMPPT14)
            response.currentMPPT14.push(null);
            if(currentMPPT15)
            response.currentMPPT15.push(null);
    
            if(powerMPPT1)
            response.powerMPPT1.push(null);
            if(powerMPPT2)
            response.powerMPPT2.push(null);
            if(powerMPPT3)
            response.powerMPPT3.push(null);
            if(powerMPPT4)
            response.powerMPPT4.push(null);
            if(powerMPPT5)
            response.powerMPPT5.push(null);
            if(powerMPPT6)
            response.powerMPPT6.push(null);
            if(powerMPPT7)
            response.powerMPPT7.push(null);
            if(powerMPPT8)
            response.powerMPPT8.push(null);
            if(powerMPPT9)
            response.powerMPPT9.push(null);
            if(powerMPPT10)
            response.powerMPPT10.push(null);
            if(powerMPPT11)
            response.powerMPPT11.push(null);
            if(powerMPPT12)
            response.powerMPPT12.push(null);
            if(powerMPPT13)
            response.powerMPPT13.push(null);
            if(powerMPPT14)
            response.powerMPPT14.push(null);
            if(powerMPPT15)
            response.powerMPPT15.push(null);
    
            if(currentString1)
            response.currentString1.push(null);
            if(currentString2)
            response.currentString2.push(null);
            if(currentString3)
            response.currentString3.push(null);
            if(currentString4)
            response.currentString4.push(null);
            if(currentString5)
            response.currentString5.push(null);
            if(currentString6)
            response.currentString6.push(null);
            if(currentString7)
            response.currentString7.push(null);
            if(currentString8)
            response.currentString8.push(null);
            if(currentString9)
            response.currentString9.push(null);
            if(currentString10)
            response.currentString10.push(null);
            if(currentString11)
            response.currentString11.push(null);
            if(currentString12)
            response.currentString12.push(null);
            if(currentString13)
            response.currentString13.push(null);
            if(currentString14)
            response.currentString14.push(null);
            if(currentString15)
            response.currentString15.push(null);
            if(currentString16)
            response.currentString16.push(null);
            if(currentString17)
            response.currentString17.push(null);
            if(currentString18)
            response.currentString18.push(null);
            if(currentString19)
            response.currentString19.push(null);
            if(currentString20)
            response.currentString20.push(null);
            if(currentString21)
            response.currentString21.push(null);
            if(currentString22)
            response.currentString22.push(null);
            if(currentString23)
            response.currentString23.push(null);
            if(currentString24)
            response.currentString24.push(null);
            if(currentString25)
            response.currentString25.push(null);
            if(currentString26)
            response.currentString26.push(null);
            if(currentString27)
            response.currentString27.push(null);
            if(currentString28)
            response.currentString28.push(null);
            if(currentString29)
            response.currentString29.push(null);
            if(currentString30)
            response.currentString30.push(null);

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
        }
        range = range+5;
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

exports.stringInverterParamerterService = async(username, plantIdS, inverterIds)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const inverterId = Number(inverterIds);
  
  let d = new Date();
  const GMTDateLT = new Date(d).toUTCString();

  let dt = new Date();
  let min = dt.getMinutes() - 15;
  dt.setMinutes(min);
  const GMTDateGT = new Date(dt).toUTCString();

  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const inverterProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'stringInverter.details.id': inverterId
            }
          }, {
            '$project': {
              'inverter': {
                '$filter': {
                  'input': '$stringInverter.details', 
                  'as': 'inverters', 
                  'cond': {
                    '$eq': [
                      '$$inverters.id', inverterId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(inverterProfile[0] == undefined){
          throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
      }

      let query = [

        StringInverter.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT), 
                '$gt': new Date(GMTDateGT)
              }, 
              'plantId': plantId, 
              'deviceNo': inverterId, 
              'errorFlag': 0
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
              'timestamp': 1, 
              'plantId': 1, 
              'deviceNo': 1, 
              'inputVoltage': 1, 
              'inputCurrent': 1, 
              'inputPower': 1, 
              'voltagePhaseR': 1, 
              'voltagePhaseY': 1, 
              'voltagePhaseB': 1, 
              'currentPhaseR': 1, 
              'currentPhaseY': 1, 
              'currentPhaseB': 1, 
              'powerPhaseR': 1, 
              'powerPhaseY': 1, 
              'powerPhaseB': 1, 
              'activePower': 1, 
              'reactivePower': 1, 
              'apparentPower': 1
            }
          }, {
            '$addFields': {
              'localTimestamp': {
                '$dateToString': {
                  'format': '%Y/%m/%d %H:%M:%S', 
                  'date': '$timestamp', 
                  'timezone': '+05:30'
                }
              }, 
              'period': {
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
        ])
      ];

    //Execute Queries
    let [stringInverterParamerter] = await Promise.allSettled(query);

      if(typeof(stringInverterParamerter.value[0]) != 'undefined')
      {
        if(stringInverterParamerter.value[0].period<=600)
        {
          if(stringInverterParamerter.value[0].inputVoltage)
            response.inputVoltage=stringInverterParamerter.value[0].inputVoltage.toFixed(1)+ ' V';
          else
            response.inputVoltage='-';

          if(stringInverterParamerter.value[0].inputCurrent)
            response.inputCurrent=stringInverterParamerter.value[0].inputCurrent.toFixed(1)+ ' A';
          else
            response.inputCurrent='-';

          if(stringInverterParamerter.value[0].inputPower)
            response.inputPower=stringInverterParamerter.value[0].inputPower.toFixed(1)+ ' kW';
          else
            response.inputPower='-';

          if(stringInverterParamerter.value[0].voltagePhaseR)
            response.voltagePhaseR=stringInverterParamerter.value[0].voltagePhaseR.toFixed(1)+ ' V';
          else
            response.voltagePhaseR='-';

          if(stringInverterParamerter.value[0].voltagePhaseY)
            response.voltagePhaseY=stringInverterParamerter.value[0].voltagePhaseY.toFixed(1)+ ' V';
          else
            response.voltagePhaseY='-';

          if(stringInverterParamerter.value[0].voltagePhaseB)
            response.voltagePhaseB=stringInverterParamerter.value[0].voltagePhaseB.toFixed(1)+ ' V';
          else
            response.voltagePhaseB='-';

          if(stringInverterParamerter.value[0].currentPhaseR)
            response.currentPhaseR=stringInverterParamerter.value[0].currentPhaseR.toFixed(1)+ ' A';
          else
            response.currentPhaseR='-';

          if(stringInverterParamerter.value[0].currentPhaseY)
            response.currentPhaseY=stringInverterParamerter.value[0].currentPhaseY.toFixed(1)+ ' A';
          else
            response.currentPhaseY='-';

          if(stringInverterParamerter.value[0].currentPhaseB)
            response.currentPhaseB=stringInverterParamerter.value[0].currentPhaseB.toFixed(1)+ ' A';
          else
            response.currentPhaseB='-';

          if(stringInverterParamerter.value[0].powerPhaseR)
            response.powerPhaseR=stringInverterParamerter.value[0].powerPhaseR.toFixed(1)+ ' kW';
          else
            response.powerPhaseR='-';
          
          if(stringInverterParamerter.value[0].powerPhaseY)
            response.powerPhaseY=stringInverterParamerter.value[0].powerPhaseY.toFixed(1)+ ' kW';
          else
            response.powerPhaseY='-';

          if(stringInverterParamerter.value[0].powerPhaseB)
            response.powerPhaseB=stringInverterParamerter.value[0].powerPhaseB.toFixed(1)+ ' kW';
          else
            response.powerPhaseB='-';

          if(stringInverterParamerter.value[0].activePower)
            response.activePower=stringInverterParamerter.value[0].activePower.toFixed(1)+ ' kW';
          else
            response.activePower='-';

          if(stringInverterParamerter.value[0].reactivePower)
            response.reactivePower=stringInverterParamerter.value[0].reactivePower.toFixed(1)+ ' KVAr';
          else
            response.reactivePower='-';

          if(stringInverterParamerter.value[0].apparentPower)
            response.apparentPower=stringInverterParamerter.value[0].apparentPower.toFixed(1)+ ' KVA';
          else
            response.apparentPower='-';
        }
        else
        {
          response.inputVoltage= '-', 
          response.inputCurrent= '-', 
          response.inputPower= '-', 
          response.voltagePhaseR= '-', 
          response.voltagePhaseY= '-', 
          response.voltagePhaseB= '-', 
          response.currentPhaseR= '-', 
          response.currentPhaseY= '-', 
          response.currentPhaseB= '-', 
          response.powerPhaseR= '-', 
          response.powerPhaseY= '-', 
          response.powerPhaseB= '-', 
          response.activePower= '-', 
          response.reactivePower= '-', 
          response.apparentPower= '-'
        }   
      }
      else
      {
        response.inputVoltage= '-', 
        response.inputCurrent= '-', 
        response.inputPower= '-', 
        response.voltagePhaseR= '-', 
        response.voltagePhaseY= '-', 
        response.voltagePhaseB= '-', 
        response.currentPhaseR= '-', 
        response.currentPhaseY= '-', 
        response.currentPhaseB= '-', 
        response.powerPhaseR= '-', 
        response.powerPhaseY= '-', 
        response.powerPhaseB= '-', 
        response.activePower= '-', 
        response.reactivePower= '-', 
        response.apparentPower= '-'
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

exports.centralizedInverterCardService = async(username, plantIdS, inverterIds)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const inverterId = Number(inverterIds);
  
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

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const inverterProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'centralizedInverter.details.id': inverterId
            }
          }, {
            '$project': {
              'inverter': {
                '$filter': {
                  'input': '$centralizedInverter.details', 
                  'as': 'inverters', 
                  'cond': {
                    '$eq': [
                      '$$inverters.id', inverterId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(inverterProfile[0] == undefined){
          throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
      }

      let query = [

        CentralizedInverter.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'deviceNo': inverterId,
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
        ]),

        CentralizedInverter.aggregate([
          {
            '$match': {
              'timestamp': { 
                  $gte: new Date(GMTDate)
              },
              'plantId': plantId,
              'deviceNo': inverterId,
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
        ]),

        CentralizedInverter.aggregate([
          {
            '$match': {
              'timestamp': {
                '$gte': new Date(GMTDate)
              }, 
              'plantId': plantId, 
              'deviceNo': inverterId, 
              'errorFlag': 0,
              'masterFlag': 0
            }
          }, {
            '$sort': {
              'activePower': -1
            }
          }, {
            '$limit': 1
          }, {
            '$project': {
              'activePower': 1, 
              'timestamp': 1
            }
          }
        ]),

        CentralizedInverter.aggregate([
          {
            '$match': {
              'plantId': plantId,
              'deviceNo': inverterId,
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
              '$project': {
                'totalEnergy': 1
            }
          }
        ])
      ];

      //Execute Queries
      let [inverterStatus, inverter, inverterPeakOutputPower, inverterTotalEnergy] = await Promise.allSettled(query);

      if(typeof(inverterStatus.value[0]) != 'undefined'){
          if(inverterStatus.value[0].duration<=600){
              if(inverterStatus.value[0].errorFlag == 0)
                  response.status = inverterStatus.value[0].status.substr(0, 14);
              else
                  response.status='No-Data';  
          }
          else{
              response.status = "Offline";
          }
          let timestamp = new Date(inverterStatus.value[0].timestamp);
          response.timestamp = timestamp.toLocaleString('en-IN',{hourCycle:"h23"});
      }
      else{
          response.status = "Offline";
          response.timestamp = "--";
      }
      
      if(typeof(inverter.value[0]) != 'undefined'){
          response.todayYield = inverter.value[0].dailyEnergy;
          response.totalYield = inverter.value[0].totalEnergy;
          response.specificYield = (inverter.value[0].dailyEnergy / inverterProfile[0].inverter[0].capacity).toFixed(2);
          response.capacity = inverterProfile[0].inverter[0].capacity;
      
          if(inverter.value[0].duration<=600){
              response.outputPower = inverter.value[0].activePower;
              response.inputPower = inverter.value[0].inputPower;
              response.specificPower = (inverter.value[0].activePower / inverterProfile[0].inverter[0].capacity).toFixed(2);
              response.temperature = inverter.value[0].temperature;
              response.efficiency = inverter.value[0].efficiency;
          }
          else{
              response.outputPower = 0;
              response.inputPower = 0;
              response.specificPower = 0;
              response.efficiency = 0;
              response.temperature = 0;
          }
      }
      else{
          response.todayYield = 0;
          response.outputPower = 0;
          response.inputPower = 0; 
          response.specificYield = 0;
          response.specificPower = 0;
          response.efficiency = 0;
          response.capacity = inverterProfile[0].inverter[0].capacity;

          if(typeof(inverterTotalEnergy.value[0]) != 'undefined')
              response.totalYield = inverterTotalEnergy.value[0].totalEnergy;
          else
              response.totalYield = 0;
      }
      
      if(typeof(inverterPeakOutputPower.value[0]) != 'undefined'){
          response.peakOutputPower = inverterPeakOutputPower.value[0].activePower;
          let peakOutputPowertimestamp = new Date(inverterPeakOutputPower.value[0].timestamp);
          response.peakOutputPowerTimestamp = peakOutputPowertimestamp.toLocaleString('en-IN',{hourCycle:"h23"});
      }
      else{
          response.peakOutputPower = 0;
          response.peakOutputPowerTimestamp = '--';
      }
      
      if(response.todayYield>9999)
          response.todayYield = (response.todayYield/1000).toFixed(2)+' MWh';
      else
          response.todayYield = response.todayYield+' kWh';
      
      if(response.totalYield>9999)
          response.totalYield = (response.totalYield/1000).toFixed(2)+' MWh';
      else
          response.totalYield =response.totalYield+' kWh';
      
      if(response.outputPower>9999)
          response.outputPower = (response.outputPower/1000).toFixed(2)+' MW';
      else
          response.outputPower = response.outputPower+' kW';

      if(response.inputPower>9999)
          response.inputPower = (response.inputPower/1000).toFixed(2)+' MW';
      else
          response.inputPower = response.inputPower+' kW';

      if(response.peakOutputPower>9999)
          response.peakOutputPower = (response.peakOutputPower/1000).toFixed(2)+' MW';
      else
          response.peakOutputPower = response.peakOutputPower+' kW';
     
      response.efficiency = response.efficiency+' %';

      if(typeof response.temperature != 'undefined')
          response.temperature = response.temperature+' °C';
      else
          response.temperature = '0 °C';

      if(response.capacity>9999)
          response.capacity = (response.capacity/1000).toFixed(2)+' MW';
      else
          response.capacity =response.capacity+' kW';

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

exports.centralizedInverterCurveService = async(username, plantIdS, inverterIds, timestamp)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const inverterId = Number(inverterIds);
  const timestampTemp = Number(timestamp);
 
  let d = new Date(timestampTemp);
  d.setHours(05);
  d.setMinutes(00);
  d.setSeconds(00);
  d.setMilliseconds(00);
  const GMTDateGT = new Date(d).toUTCString();

  let dt = new Date(timestampTemp);
  dt.setHours(20);
  dt.setMinutes(00);
  dt.setSeconds(00);
  dt.setMilliseconds(00);
  const GMTDateLT = new Date(dt).toUTCString();
  
  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const inverterProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'centralizedInverter.details.id': inverterId
            }
          }, {
            '$project': {
              'inverter': {
                '$filter': {
                  'input': '$centralizedInverter.details', 
                  'as': 'inverters', 
                  'cond': {
                    '$eq': [
                      '$$inverters.id', inverterId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(inverterProfile[0] == undefined){
          throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
      }

      const inverter = await CentralizedInverter.aggregate([
        {
          '$match': {
            'timestamp': {
              '$lte': new Date(GMTDateLT), 
              '$gte': new Date(GMTDateGT)
            }, 
            'plantId': plantId, 
            'deviceNo': inverterId,
            'masterFlag': 0
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
            'efficiency': {
              '$first': '$efficiency'
            }, 
            'temperature': {
              '$first': '$temperature'
            }, 
            'outputCurrent': {
              '$first': '$outputCurrent'
            }, 
            'inputCurrent': {
              '$first': '$inputCurrent'
            }, 
            'activePower': {
              '$first': '$activePower'
            }, 
            'inputPower': {
              '$first': '$inputPower'
            }, 
            'dailyEnergy': {
              '$first': '$dailyEnergy'
            }, 
            'totalEnergy': {
              '$first': '$totalEnergy'
            }, 
            'currentUnit1': {
              '$first': '$currentUnit1'
            }, 
            'currentUnit2': {
              '$first': '$currentUnit2'
            }, 
            'currentUnit3': {
              '$first': '$currentUnit3'
            }, 
            'currentUnit4': {
              '$first': '$currentUnit4'
            }, 
            'currentUnit5': {
              '$first': '$currentUnit5'
            }, 
            'currentUnit6': {
              '$first': '$currentUnit6'
            }, 
            'currentUnit7': {
              '$first': '$currentUnit7'
            }, 
            'currentUnit8': {
              '$first': '$currentUnit8'
            }, 
            'currentUnit9': {
              '$first': '$currentUnit9'
            }, 
            'currentUnit10': {
              '$first': '$currentUnit10'
            }, 
            'currentUnit11': {
              '$first': '$currentUnit11'
            }, 
            'currentUnit12': {
              '$first': '$currentUnit12'
            }, 
            'powerUnit1': {
              '$first': '$powerUnit1'
            }, 
            'powerUnit2': {
              '$first': '$powerUnit2'
            }, 
            'powerUnit3': {
              '$first': '$powerUnit3'
            }, 
            'powerUnit4': {
              '$first': '$powerUnit4'
            }, 
            'powerUnit5': {
              '$first': '$powerUnit5'
            }, 
            'powerUnit6': {
              '$first': '$powerUnit6'
            }, 
            'powerUnit7': {
              '$first': '$powerUnit7'
            }, 
            'powerUnit8': {
              '$first': '$powerUnit8'
            }, 
            'powerUnit9': {
              '$first': '$powerUnit9'
            }, 
            'powerUnit10': {
              '$first': '$powerUnit10'
            }, 
            'powerUnit11': {
              '$first': '$powerUnit11'
            }, 
            'powerUnit12': {
              '$first': '$powerUnit12'
            },
            'currentInput1': {
              '$first': '$currentInput1'
            }, 
            'currentInput2': {
              '$first': '$currentInput2'
            }, 
            'currentInput3': {
              '$first': '$currentInput3'
            }, 
            'currentInput4': {
              '$first': '$currentInput4'
            }, 
            'currentInput5': {
              '$first': '$currentInput5'
            }, 
            'currentInput6': {
              '$first': '$currentInput6'
            }, 
            'currentInput7': {
              '$first': '$currentInput7'
            }, 
            'currentInput8': {
              '$first': '$currentInput8'
            }, 
            'currentInput9': {
              '$first': '$currentInput9'
            }, 
            'currentInput10': {
              '$first': '$currentInput10'
            }, 
            'currentInput11': {
              '$first': '$currentInput11'
            }, 
            'currentInput12': {
              '$first': '$currentInput12'
            }, 
            'currentInput13': {
              '$first': '$currentInput13'
            }, 
            'currentInput14': {
              '$first': '$currentInput14'
            }, 
            'currentInput15': {
              '$first': '$currentInput15'
            }, 
            'currentInput16': {
              '$first': '$currentInput16'
            }, 
            'currentInput17': {
              '$first': '$currentInput17'
            }, 
            'currentInput18': {
              '$first': '$currentInput18'
            }, 
            'currentInput19': {
              '$first': '$currentInput19'
            }, 
            'currentInput20': {
              '$first': '$currentInput20'
            }, 
            'currentInput21': {
              '$first': '$currentInput21'
            }, 
            'currentInput22': {
              '$first': '$currentInput22'
            }, 
            'currentInput23': {
              '$first': '$currentInput23'
            }, 
            'currentInput24': {
              '$first': '$currentInput24'
            }, 
            'currentInput25': {
              '$first': '$currentInput25'
            }, 
            'currentInput26': {
              '$first': '$currentInput26'
            }, 
            'currentInput27': {
              '$first': '$currentInput27'
            }, 
            'currentInput28': {
              '$first': '$currentInput28'
            }, 
            'currentInput29': {
              '$first': '$currentInput29'
            }, 
            'currentInput30': {
              '$first': '$currentInput30'
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

      let currentUnit1 = false;
      let currentUnit2 = false;
      let currentUnit3 = false;
      let currentUnit4 = false;
      let currentUnit5 = false;
      let currentUnit6 = false;
      let currentUnit7 = false;
      let currentUnit8 = false;
      let currentUnit9 = false;
      let currentUnit10 = false;
      let currentUnit11 = false;
      let currentUnit12 = false;
      let powerUnit1 = false;
      let powerUnit2 = false;
      let powerUnit3 = false; 
      let powerUnit4 = false;
      let powerUnit5 = false;
      let powerUnit6 = false;
      let powerUnit7 = false;
      let powerUnit8 = false;
      let powerUnit9 = false;
      let powerUnit10 = false;
      let powerUnit11 = false;
      let powerUnit12 = false;
      let currentInput1 = false;
      let currentInput2 = false;
      let currentInput3 = false;
      let currentInput4 = false;
      let currentInput5 = false; 
      let currentInput6 = false; 
      let currentInput7 = false;
      let currentInput8 = false;
      let currentInput9 = false;
      let currentInput10 = false; 
      let currentInput11 = false;
      let currentInput12 = false;
      let currentInput13 = false;
      let currentInput14 = false;
      let currentInput15 = false;
      let currentInput16 = false;
      let currentInput17 = false;
      let currentInput18 = false;
      let currentInput19 = false;
      let currentInput20 = false;
      let currentInput21 = false;
      let currentInput22 = false;
      let currentInput23 = false;
      let currentInput24 = false; 
      let currentInput25 = false; 
      let currentInput26 = false;
      let currentInput27 = false; 
      let currentInput28 = false;
      let currentInput29 = false;
      let currentInput30 = false;

      inverter.forEach(element => {
        if(element.currentUnit1 != null && element.currentUnit1 != 0 && !currentUnit1)
          currentUnit1 = true;
        if(element.currentUnit2 != null && element.currentUnit2 != 0 && !currentUnit2)
          currentUnit2 = true;
        if(element.currentUnit3 != null && element.currentUnit3 != 0 && !currentUnit3)
          currentUnit3 = true;
        if(element.currentUnit4 != null && element.currentUnit4 != 0 && !currentUnit4)
          currentUnit4 = true;
        if(element.currentUnit5 != null && element.currentUnit5 != 0 && !currentUnit5)
          currentUnit5 = true;
        if(element.currentUnit6 != null && element.currentUnit6 != 0 && !currentUnit6)
          currentUnit6 = true;
        if(element.currentUnit7 != null && element.currentUnit7 != 0 && !currentUnit7)
          currentUnit7 = true;
        if(element.currentUnit8 != null && element.currentUnit8 != 0 && !currentUnit8)
          currentUnit8 = true;
        if(element.currentUnit9 != null && element.currentUnit9 != 0 && !currentUnit9)
          currentUnit9 = true;
        if(element.currentUnit10 != null && element.currentUnit10 != 0 && !currentUnit10)
          currentUnit10 = true;
        if(element.currentUnit11 != null && element.currentUnit11 != 0 && !currentUnit11)
          currentUnit11 = true;
        if(element.currentUnit12 != null && element.currentUnit12 != 0 && !currentUnit12)
          currentUnit12 = true;
        // if(element.currentUnit13 != null && element.currentUnit13 != 0 && !currentUnit13)
        //   currentUnit13 = true;
        // if(element.currentUnit14 != null && element.currentUnit14 != 0 && !currentUnit14)
        //   currentUnit14 = true;
        // if(element.currentUnit15 != null && element.currentUnit15 != 0 && !currentUnit15)
        //   currentUnit15 = true;

        if(element.powerUnit1 != null && element.powerUnit1 != 0 && !powerUnit1)
          powerUnit1 = true;
        if(element.powerUnit2 != null && element.powerUnit2 != 0 && !powerUnit2)
          powerUnit2 = true;
        if(element.powerUnit3 != null && element.powerUnit3 != 0 && !powerUnit3)
          powerUnit3 = true;
        if(element.powerUnit4 != null && element.powerUnit4 != 0 && !powerUnit4)
          powerUnit4 = true;
        if(element.powerUnit5 != null && element.powerUnit5 != 0 && !powerUnit5)
          powerUnit5 = true;
        if(element.powerUnit6 != null && element.powerUnit6 != 0 && !powerUnit6)
          powerUnit6 = true;
        if(element.powerUnit7 != null && element.powerUnit7 != 0 && !powerUnit7)
          powerUnit7 = true;
        if(element.powerUnit8 != null && element.powerUnit8 != 0 && !powerUnit8)
          powerUnit8 = true;
        if(element.powerUnit9 != null && element.powerUnit9 != 0 && !powerUnit9)
          powerUnit9 = true;
        if(element.powerUnit10 != null && element.powerUnit10 != 0 && !powerUnit10)
          powerUnit10 = true;
        if(element.powerUnit11 != null && element.powerUnit11 != 0 && !powerUnit11)
          powerUnit11 = true;
        if(element.powerUnit12 != null && element.powerUnit12 != 0 && !powerUnit12)
          powerUnit12 = true;
        // if(element.powerUnit13 != null && element.powerUnit13 != 0 && !powerUnit13)
        //   powerUnit13 = true;
        // if(element.powerUnit14 != null && element.powerUnit14 != 0 && !powerUnit14)
        //   powerUnit14 = true;
        // if(element.powerUnit15 != null && element.powerUnit15 != 0 && !powerUnit15)
        //   powerUnit15 = true;

        if(element.currentInput1 != null && element.currentInput1 != 0 && !currentInput1)
          currentInput1 = true;
        if(element.currentInput2 != null && element.currentInput2 != 0 && !currentInput2)
          currentInput2 = true;
        if(element.currentInput3 != null && element.currentInput3 != 0 && !currentInput3)
          currentInput3 = true;
        if(element.currentInput4 != null && element.currentInput4 != 0 && !currentInput4)
          currentInput4 = true;
        if(element.currentInput5 != null && element.currentInput5 != 0 && !currentInput5)
          currentInput5 = true;
        if(element.currentInput6 != null && element.currentInput6 != 0 && !currentInput6)
          currentInput6 = true;
        if(element.currentInput7 != null && element.currentInput7 != 0 && !currentInput7)
          currentInput7 = true;
        if(element.currentInput8 != null && element.currentInput8 != 0 && !currentInput8)
          currentInput8 = true;
        if(element.currentInput9 != null && element.currentInput9 != 0 && !currentInput9)
          currentInput9 = true;
        if(element.currentInput10 != null && element.currentInput10 != 0 && !currentInput10)
          currentInput10 = true;
        if(element.currentInput11 != null && element.currentInput11 != 0 && !currentInput11)
          currentInput11 = true;
        if(element.currentInput12 != null && element.currentInput12 != 0 && !currentInput12)
          currentInput12 = true;
        if(element.currentInput13 != null && element.currentInput13 != 0 && !currentInput13)
          currentInput13 = true;
        if(element.currentInput14 != null && element.currentInput14 != 0 && !currentInput14)
          currentInput14 = true;
        if(element.currentInput15 != null && element.currentInput15 != 0 && !currentInput15)
          currentInput15 = true;
        if(element.currentInput16 != null && element.currentInput16 != 0 && !currentInput16)
          currentInput16 = true;
        if(element.currentInput17 != null && element.currentInput17 != 0 && !currentInput17)
          currentInput17 = true;
        if(element.currentInput18 != null && element.currentInput18 != 0 && !currentInput18)
          currentInput18 = true;
        if(element.currentInput19 != null && element.currentInput19 != 0 && !currentInput19)
          currentInput19 = true;
        if(element.currentInput20 != null && element.currentInput20 != 0 && !currentInput20)
          currentInput20 = true;
        if(element.currentInput21 != null && element.currentInput21 != 0 && !currentInput21)
          currentInput21 = true;
        if(element.currentInput22 != null && element.currentInput22 != 0 && !currentInput22)
          currentInput22 = true;
        if(element.currentInput23 != null && element.currentInput23 != 0 && !currentInput23)
          currentInput23 = true;
        if(element.currentInput24 != null && element.currentInput24 != 0 && !currentInput24)
          currentInput24 = true;
        if(element.currentInput25 != null && element.currentInput25 != 0 && !currentInput25)
          currentInput25 = true;
        if(element.currentInput26 != null && element.currentInput26 != 0 && !currentInput26)
          currentInput26 = true;
        if(element.currentInput27 != null && element.currentInput27 != 0 && !currentInput27)
          currentInput27 = true;
        if(element.currentInput28 != null && element.currentInput28 != 0 && !currentInput28)
          currentInput28 = true;
        if(element.currentInput29 != null && element.currentInput29 != 0 && !currentInput29)
          currentInput29 = true;
        if(element.currentInput30 != null && element.currentInput30 != 0 && !currentInput30)
          currentInput30 = true;
      });
     
      response.time=[];
      response.dailyYield=[];
      response.totalYield=[];
      response.outputCurrent=[];
      response.inputCurrent=[];
      response.outputPower=[];
      response.inputPower=[];
      response.temperature=[];
      response.efficiency=[];
      
      if(currentUnit1)
      response.currentUnit1=[];
      if(currentUnit2)
      response.currentUnit2=[];
      if(currentUnit3)
      response.currentUnit3=[];
      if(currentUnit4)
      response.currentUnit4=[];
      if(currentUnit5)
      response.currentUnit5=[];
      if(currentUnit6)
      response.currentUnit6=[];
      if(currentUnit7)
      response.currentUnit7=[];
      if(currentUnit8)
      response.currentUnit8=[];
      if(currentUnit9)
      response.currentUnit9=[];
      if(currentUnit10)
      response.currentUnit10=[];
      if(currentUnit11)
      response.currentUnit11=[];
      if(currentUnit12)
      response.currentUnit12=[];
      // if(currentUnit13)
      // response.currentUnit13=[];
      // if(currentUnit14)
      // response.currentUnit14=[];
      // if(currentUnit15)
      // response.currentUnit15=[];
      
      if(powerUnit1)
      response.powerUnit1=[];
      if(powerUnit2)
      response.powerUnit2=[];
      if(powerUnit3)
      response.powerUnit3=[];
      if(powerUnit4)
      response.powerUnit4=[];
      if(powerUnit5)
      response.powerUnit5=[];
      if(powerUnit6)
      response.powerUnit6=[];
      if(powerUnit7)
      response.powerUnit7=[];
      if(powerUnit8)
      response.powerUnit8=[];
      if(powerUnit9)
      response.powerUnit9=[];
      if(powerUnit10)
      response.powerUnit10=[];
      if(powerUnit11)
      response.powerUnit11=[];
      if(powerUnit12)
      response.powerUnit12=[];
      // if(powerUnit13)
      // response.powerUnit13=[];
      // if(powerUnit14)
      // response.powerUnit14=[];
      // if(powerUnit15)
      // response.powerUnit15=[];

      if(currentInput1)
      response.currentInput1=[];
      if(currentInput2)
      response.currentInput2=[];
      if(currentInput3)
      response.currentInput3=[];
      if(currentInput4)
      response.currentInput4=[];
      if(currentInput5)
      response.currentInput5=[];
      if(currentInput6)
      response.currentInput6=[];
      if(currentInput7)
      response.currentInput7=[];
      if(currentInput8)
      response.currentInput8=[];
      if(currentInput9)
      response.currentInput9=[];
      if(currentInput10)
      response.currentInput10=[];
      if(currentInput11)
      response.currentInput11=[];
      if(currentInput12)
      response.currentInput12=[];
      if(currentInput13)
      response.currentInput13=[];
      if(currentInput14)
      response.currentInput14=[];
      if(currentInput15)
      response.currentInput15=[];
      if(currentInput16)
      response.currentInput16=[];
      if(currentInput17)
      response.currentInput17=[];
      if(currentInput18)
      response.currentInput18=[];
      if(currentInput19)
      response.currentInput19=[];
      if(currentInput20)
      response.currentInput20=[];
      if(currentInput21)
      response.currentInput21=[];
      if(currentInput22)
      response.currentInput22=[];
      if(currentInput23)
      response.currentInput23=[];
      if(currentInput24)
      response.currentInput24=[];
      if(currentInput25)
      response.currentInput25=[];
      if(currentInput26)
      response.currentInput26=[];
      if(currentInput27)
      response.currentInput27=[];
      if(currentInput28)
      response.currentInput28=[];
      if(currentInput29)
      response.currentInput29=[];
      if(currentInput30)
      response.currentInput30=[];

      let range = 300;
      let counter = 0;
      let tempD = new Date();
      tempD.setHours(00);
      tempD.setMinutes(00);
      tempD.setSeconds(01);
      tempD.setMilliseconds(00);
      const tempDate = tempD.getTime();

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
        counter=180;
    
      for (let i=0, j=0; i<=counter; i++)
      {
        if(typeof inverter[j] != 'undefined')
        {
          if(range <= inverter[j].minute && inverter[j].minute < range +5)
          {
            response.time.push(inverter[j].time);
            response.dailyYield.push(inverter[j].dailyEnergy);
            response.totalYield.push(inverter[j].totalEnergy);
            response.outputCurrent.push(inverter[j].outputCurrent);
            response.inputCurrent.push(inverter[j].inputCurrent);
            response.outputPower.push(inverter[j].activePower);
            response.inputPower.push(inverter[j].inputPower);
            response.temperature.push(inverter[j].temperature);
            response.efficiency.push(inverter[j].efficiency);
    
            if(currentUnit1)
            response.currentUnit1.push(inverter[j].currentUnit1);
            if(currentUnit2)
            response.currentUnit2.push(inverter[j].currentUnit2);
            if(currentUnit3)
            response.currentUnit3.push(inverter[j].currentUnit3);
            if(currentUnit4)
            response.currentUnit4.push(inverter[j].currentUnit4);
            if(currentUnit5)
            response.currentUnit5.push(inverter[j].currentUnit5);
            if(currentUnit6)
            response.currentUnit6.push(inverter[j].currentUnit6);
            if(currentUnit7)
            response.currentUnit7.push(inverter[j].currentUnit7);
            if(currentUnit8)
            response.currentUnit8.push(inverter[j].currentUnit8);
            if(currentUnit9)
            response.currentUnit9.push(inverter[j].currentUnit9);
            if(currentUnit10)
            response.currentUnit10.push(inverter[j].currentUnit10);
            if(currentUnit11)
            response.currentUnit11.push(inverter[j].currentUnit11);
            if(currentUnit12)
            response.currentUnit12.push(inverter[j].currentUnit12);
            // if(currentUnit13)
            // response.currentUnit13.push(inverter[j].currentUnit13);
            // if(currentUnit14)
            // response.currentUnit14.push(inverter[j].currentUnit14);
            // if(currentUnit15)
            // response.currentUnit15.push(inverter[j].currentUnit15);
    
            if(powerUnit1)
            response.powerUnit1.push(inverter[j].powerUnit1);
            if(powerUnit2)
            response.powerUnit2.push(inverter[j].powerUnit2);
            if(powerUnit3)
            response.powerUnit3.push(inverter[j].powerUnit3);
            if(powerUnit4)
            response.powerUnit4.push(inverter[j].powerUnit4);
            if(powerUnit5)
            response.powerUnit5.push(inverter[j].powerUnit5);
            if(powerUnit6)
            response.powerUnit6.push(inverter[j].powerUnit6);
            if(powerUnit7)
            response.powerUnit7.push(inverter[j].powerUnit7);
            if(powerUnit8)
            response.powerUnit8.push(inverter[j].powerUnit8);
            if(powerUnit9)
            response.powerUnit9.push(inverter[j].powerUnit9);
            if(powerUnit10)
            response.powerUnit10.push(inverter[j].powerUnit10);
            if(powerUnit11)
            response.powerUnit11.push(inverter[j].powerUnit11);
            if(powerUnit12)
            response.powerUnit12.push(inverter[j].powerUnit12);
            // if(powerUnit13)
            // response.powerUnit13.push(inverter[j].powerUnit13);
            // if(powerUnit14)
            // response.powerUnit14.push(inverter[j].powerUnit14);
            // if(powerUnit15)
            // response.powerUnit15.push(inverter[j].powerUnit15);
    
            if(currentInput1)
            response.currentInput1.push(inverter[j].currentInput1);
            if(currentInput2)
            response.currentInput2.push(inverter[j].currentInput2);
            if(currentInput3)
            response.currentInput3.push(inverter[j].currentInput3);
            if(currentInput4)
            response.currentInput4.push(inverter[j].currentInput4);
            if(currentInput5)
            response.currentInput5.push(inverter[j].currentInput5);
            if(currentInput6)
            response.currentInput6.push(inverter[j].currentInput6);
            if(currentInput7)
            response.currentInput7.push(inverter[j].currentInput7);
            if(currentInput8)
            response.currentInput8.push(inverter[j].currentInput8);
            if(currentInput9)
            response.currentInput9.push(inverter[j].currentInput9);
            if(currentInput10)
            response.currentInput10.push(inverter[j].currentInput10);
            if(currentInput11)
            response.currentInput11.push(inverter[j].currentInput11);
            if(currentInput12)
            response.currentInput12.push(inverter[j].currentInput12);
            if(currentInput13)
            response.currentInput13.push(inverter[j].currentInput13);
            if(currentInput14)
            response.currentInput14.push(inverter[j].currentInput14);
            if(currentInput15)
            response.currentInput15.push(inverter[j].currentInput15);
            if(currentInput16)
            response.currentInput16.push(inverter[j].currentInput16);
            if(currentInput17)
            response.currentInput17.push(inverter[j].currentInput17);
            if(currentInput18)
            response.currentInput18.push(inverter[j].currentInput18);
            if(currentInput19)
            response.currentInput19.push(inverter[j].currentInput19);
            if(currentInput20)
            response.currentInput20.push(inverter[j].currentInput20);
            if(currentInput21)
            response.currentInput21.push(inverter[j].currentInput21);
            if(currentInput22)
            response.currentInput22.push(inverter[j].currentInput22);
            if(currentInput23)
            response.currentInput23.push(inverter[j].currentInput23);
            if(currentInput24)
            response.currentInput24.push(inverter[j].currentInput24);
            if(currentInput25)
            response.currentInput25.push(inverter[j].currentInput25);
            if(currentInput26)
            response.currentInput26.push(inverter[j].currentInput26);
            if(currentInput27)
            response.currentInput27.push(inverter[j].currentInput27);
            if(currentInput28)
            response.currentInput28.push(inverter[j].currentInput28);
            if(currentInput29)
            response.currentInput29.push(inverter[j].currentInput29);
            if(currentInput30)
            response.currentInput30.push(inverter[j].currentInput30);
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
            
            response.dailyYield.push(null);
            response.totalYield.push(null);
            response.outputCurrent.push(null);
            response.inputCurrent.push(null);
            response.outputPower.push(null);
            response.inputPower.push(null);
            response.temperature.push(null);
            response.efficiency.push(null);

            if(currentUnit1)
            response.currentUnit1.push(null);
            if(currentUnit2)
            response.currentUnit2.push(null);
            if(currentUnit3)
            response.currentUnit3.push(null);
            if(currentUnit4)
            response.currentUnit4.push(null);
            if(currentUnit5)
            response.currentUnit5.push(null);
            if(currentUnit6)
            response.currentUnit6.push(null);
            if(currentUnit7)
            response.currentUnit7.push(null);
            if(currentUnit8)
            response.currentUnit8.push(null);
            if(currentUnit9)
            response.currentUnit9.push(null);
            if(currentUnit10)
            response.currentUnit10.push(null);
            if(currentUnit11)
            response.currentUnit11.push(null);
            if(currentUnit12)
            response.currentUnit12.push(null);
            // if(currentUnit13)
            // response.currentUnit13.push(null);
            // if(currentUnit14)
            // response.currentUnit14.push(null);
            // if(currentUnit15)
            // response.currentUnit15.push(null);
    
            if(powerUnit1)
            response.powerUnit1.push(null);
            if(powerUnit2)
            response.powerUnit2.push(null);
            if(powerUnit3)
            response.powerUnit3.push(null);
            if(powerUnit4)
            response.powerUnit4.push(null);
            if(powerUnit5)
            response.powerUnit5.push(null);
            if(powerUnit6)
            response.powerUnit6.push(null);
            if(powerUnit7)
            response.powerUnit7.push(null);
            if(powerUnit8)
            response.powerUnit8.push(null);
            if(powerUnit9)
            response.powerUnit9.push(null);
            if(powerUnit10)
            response.powerUnit10.push(null);
            if(powerUnit11)
            response.powerUnit11.push(null);
            if(powerUnit12)
            response.powerUnit12.push(null);
            // if(powerUnit13)
            // response.powerUnit13.push(null);
            // if(powerUnit14)
            // response.powerUnit14.push(null);
            // if(powerUnit15)
            // response.powerUnit15.push(null);
    
            if(currentInput1)
            response.currentInput1.push(null);
            if(currentInput2)
            response.currentInput2.push(null);
            if(currentInput3)
            response.currentInput3.push(null);
            if(currentInput4)
            response.currentInput4.push(null);
            if(currentInput5)
            response.currentInput5.push(null);
            if(currentInput6)
            response.currentInput6.push(null);
            if(currentInput7)
            response.currentInput7.push(null);
            if(currentInput8)
            response.currentInput8.push(null);
            if(currentInput9)
            response.currentInput9.push(null);
            if(currentInput10)
            response.currentInput10.push(null);
            if(currentInput11)
            response.currentInput11.push(null);
            if(currentInput12)
            response.currentInput12.push(null);
            if(currentInput13)
            response.currentInput13.push(null);
            if(currentInput14)
            response.currentInput14.push(null);
            if(currentInput15)
            response.currentInput15.push(null);
            if(currentInput16)
            response.currentInput16.push(null);
            if(currentInput17)
            response.currentInput17.push(null);
            if(currentInput18)
            response.currentInput18.push(null);
            if(currentInput19)
            response.currentInput19.push(null);
            if(currentInput20)
            response.currentInput20.push(null);
            if(currentInput21)
            response.currentInput21.push(null);
            if(currentInput22)
            response.currentInput22.push(null);
            if(currentInput23)
            response.currentInput23.push(null);
            if(currentInput24)
            response.currentInput24.push(null);
            if(currentInput25)
            response.currentInput25.push(null);
            if(currentInput26)
            response.currentInput26.push(null);
            if(currentInput27)
            response.currentInput27.push(null);
            if(currentInput28)
            response.currentInput28.push(null);
            if(currentInput29)
            response.currentInput29.push(null);
            if(currentInput30)
            response.currentInput30.push(null);

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
        }
        range = range+5;
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

exports.centralizedInverterParamerterService = async(username, plantIdS, inverterIds)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const inverterId = Number(inverterIds);
  
  let d = new Date();
  const GMTDateLT = new Date(d).toUTCString();

  let dt = new Date();
  let min = dt.getMinutes() - 15;
  dt.setMinutes(min);
  const GMTDateGT = new Date(dt).toUTCString();

  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const inverterProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'centralizedInverter.details.id': inverterId
            }
          }, {
            '$project': {
              'inverter': {
                '$filter': {
                  'input': '$centralizedInverter.details', 
                  'as': 'inverters', 
                  'cond': {
                    '$eq': [
                      '$$inverters.id', inverterId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(inverterProfile[0] == undefined){
          throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
      }

      let query = [

        CentralizedInverter.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT), 
                '$gt': new Date(GMTDateGT)
              }, 
              'plantId': plantId, 
              'deviceNo': inverterId, 
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
            '$project': {
              '_id': 0, 
              'timestamp': 1, 
              'plantId': 1, 
              'deviceNo': 1, 
              'inputVoltage': 1, 
              'inputCurrent': 1, 
              'inputPower': 1, 
              'voltagePhaseR': 1, 
              'voltagePhaseY': 1, 
              'voltagePhaseB': 1, 
              'currentPhaseR': 1, 
              'currentPhaseY': 1, 
              'currentPhaseB': 1, 
              'powerPhaseR': 1, 
              'powerPhaseY': 1, 
              'powerPhaseB': 1, 
              'activePower': 1, 
              'reactivePower': 1, 
              'apparentPower': 1
            }
          }, {
            '$addFields': {
              'localTimestamp': {
                '$dateToString': {
                  'format': '%Y/%m/%d %H:%M:%S', 
                  'date': '$timestamp', 
                  'timezone': '+05:30'
                }
              }, 
              'period': {
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
        ])
      ];

    //Execute Queries
    let [centralizedInverterParamerter] = await Promise.allSettled(query);

      if(typeof(centralizedInverterParamerter.value[0]) != 'undefined')
      {
        if(centralizedInverterParamerter.value[0].period<=600)
        {
          if(centralizedInverterParamerter.value[0].inputVoltage)
            response.inputVoltage=centralizedInverterParamerter.value[0].inputVoltage.toFixed(1)+ ' V';
          else
            response.inputVoltage='-';

          if(centralizedInverterParamerter.value[0].inputCurrent)
            response.inputCurrent=centralizedInverterParamerter.value[0].inputCurrent.toFixed(1)+ ' A';
          else
            response.inputCurrent='-';

          if(centralizedInverterParamerter.value[0].inputPower)
            response.inputPower=centralizedInverterParamerter.value[0].inputPower.toFixed(1)+ ' kW';
          else
            response.inputPower='-';

          if(centralizedInverterParamerter.value[0].voltagePhaseR)
            response.voltagePhaseR=centralizedInverterParamerter.value[0].voltagePhaseR.toFixed(1)+ ' V';
          else
            response.voltagePhaseR='-';

          if(centralizedInverterParamerter.value[0].voltagePhaseY)
            response.voltagePhaseY=centralizedInverterParamerter.value[0].voltagePhaseY.toFixed(1)+ ' V';
          else
            response.voltagePhaseY='-';

          if(centralizedInverterParamerter.value[0].voltagePhaseB)
            response.voltagePhaseB=centralizedInverterParamerter.value[0].voltagePhaseB.toFixed(1)+ ' V';
          else
            response.voltagePhaseB='-';

          if(centralizedInverterParamerter.value[0].currentPhaseR)
            response.currentPhaseR=centralizedInverterParamerter.value[0].currentPhaseR.toFixed(1)+ ' A';
          else
            response.currentPhaseR='-';

          if(centralizedInverterParamerter.value[0].currentPhaseY)
            response.currentPhaseY=centralizedInverterParamerter.value[0].currentPhaseY.toFixed(1)+ ' A';
          else
            response.currentPhaseY='-';

          if(centralizedInverterParamerter.value[0].currentPhaseB)
            response.currentPhaseB=centralizedInverterParamerter.value[0].currentPhaseB.toFixed(1)+ ' A';
          else
            response.currentPhaseB='-';

          if(centralizedInverterParamerter.value[0].powerPhaseR)
            response.powerPhaseR=centralizedInverterParamerter.value[0].powerPhaseR.toFixed(1)+ ' kW';
          else
            response.powerPhaseR='-';
          
          if(centralizedInverterParamerter.value[0].powerPhaseY)
            response.powerPhaseY=centralizedInverterParamerter.value[0].powerPhaseY.toFixed(1)+ ' kW';
          else
            response.powerPhaseY='-';

          if(centralizedInverterParamerter.value[0].powerPhaseB)
            response.powerPhaseB=centralizedInverterParamerter.value[0].powerPhaseB.toFixed(1)+ ' kW';
          else
            response.powerPhaseB='-';

          if(centralizedInverterParamerter.value[0].activePower)
            response.activePower=centralizedInverterParamerter.value[0].activePower.toFixed(1)+ ' kW';
          else
            response.activePower='-';

          if(centralizedInverterParamerter.value[0].reactivePower)
            response.reactivePower=centralizedInverterParamerter.value[0].reactivePower.toFixed(1)+ ' KVAr';
          else
            response.reactivePower='-';

          if(centralizedInverterParamerter.value[0].apparentPower)
            response.apparentPower=centralizedInverterParamerter.value[0].apparentPower.toFixed(1)+ ' KVA';
          else
            response.apparentPower='-';
        }
        else
        {
          response.inputVoltage= '-', 
          response.inputCurrent= '-', 
          response.inputPower= '-', 
          response.voltagePhaseR= '-', 
          response.voltagePhaseY= '-', 
          response.voltagePhaseB= '-', 
          response.currentPhaseR= '-', 
          response.currentPhaseY= '-', 
          response.currentPhaseB= '-', 
          response.powerPhaseR= '-', 
          response.powerPhaseY= '-', 
          response.powerPhaseB= '-', 
          response.activePower= '-', 
          response.reactivePower= '-', 
          response.apparentPower= '-'
        }   
      }
      else
      {
        response.inputVoltage= '-', 
        response.inputCurrent= '-', 
        response.inputPower= '-', 
        response.voltagePhaseR= '-', 
        response.voltagePhaseY= '-', 
        response.voltagePhaseB= '-', 
        response.currentPhaseR= '-', 
        response.currentPhaseY= '-', 
        response.currentPhaseB= '-', 
        response.powerPhaseR= '-', 
        response.powerPhaseY= '-', 
        response.powerPhaseB= '-', 
        response.activePower= '-', 
        response.reactivePower= '-', 
        response.apparentPower= '-'
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