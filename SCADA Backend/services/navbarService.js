const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { PlantAnalysis } = require('../models/plantanalysis');
const { Alarm } = require('../models/alarm');
const { StringInverter } = require('../models/stringinverter');
const { CentralizedInverter } = require('../models/centralizedinverter');
const { WeatherStation } = require('../models/weatherstation');

exports.navbarCardService = async(username, plantId)=>{

    const response = {};
    plantId = Math.sqrt(plantId);
    
    let d = new Date();
    let date = d.getDate();
    let day = d.getDay();
    
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const todayStartDate = new Date(d).toUTCString();

    d.setHours(23);
    d.setMinutes(59);
    d.setSeconds(59);
    d.setMilliseconds(59);
    const todayEndDate = new Date(d).toUTCString();

    d.setDate(date-1);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const yesterdayStartDate = new Date(d).toUTCString();
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

    // console.log(yesterdayEndDate)
    // console.log(todayEndDate)
    // console.log(weekStartDate)
    // console.log(weekEndDate)
    // console.log(monthStartDate)
    // console.log(monthEndDate)
    // console.log(yearStartDate)
    // console.log(yearEndDate)

    try{

        const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

        if(user == null){
            throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
        }
       
        const plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }, {
              '$addFields': {
                'dataLogger': '$dataLogger.isActive',
                'scb': '$scb.isActive',
                'stringInverter': '$stringInverter.isActive',
                'centralizedInverter': '$centralizedInverter.isActive',
                'weatherStation': '$weatherStation.isActive', 
                'meter': '$meter.isActive', 
                'dieselGenerator': '$dieselGenerator.isActive', 
                'zeroExport': '$zeroExport.isActive',
                'totalDevice': {
                  '$sum': [
                    '$scb.quantity', '$stringInverter.quantity', '$centralizedInverter.quantity', '$weatherStation.quantity', '$meter.quantity', '$dieselGenerator.quantity', '$zeroExport.quantity'
                  ]
                }
              }
            }, {
              '$project': {
                '_id': 0, 
                'plantName': 1, 
                'dataLogger': 1,
                'scb': 1,
                'stringInverter': 1,
                'centralizedInverter': 1,
                'weatherStation': 1, 
                'meter': 1, 
                'dieselGenerator': 1, 
                'zeroExport': 1,
                'totalDevice': 1
              }
            }
        ]);
       
        if(plantProfile[0] == undefined){
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }

        let todayEnergy;
        let yesterdayEnergy;
        let weeklyEnergy;
        let monthlyEnergy;
        let yearlyEnergy;
        let irradiance;
        let cumulativeIrradiance;
        let moduleTemp;
        let ambientTemp;
        let windSpeed;
        let todayPR;
        let yesterdayPR;
        let todayCUF;
        let yesterdayCUF;
        let totalDevice;
        let normal = 0;
        let alarm = 0;
        let offline = 0;

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
                  '$limit':1
                }
            ]),

            PlantAnalysis.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$gte': new Date(yesterdayStartDate),
                      '$lte': new Date(yesterdayEndDate)
                    }, 
                    'plantId':  plantId
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$limit':1
                }
            ]),

            PlantAnalysis.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$gte': new Date(weekStartDate), 
                      '$lt': new Date(weekEndDate)
                    }, 
                    'plantId': plantId
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'dailyEnergy': {
                      '$sum': '$dailyEnergy'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0
                  }
                }
            ]),

            PlantAnalysis.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$gte': new Date(monthStartDate), 
                      '$lt': new Date(monthEndDate)
                    }, 
                    'plantId': plantId
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'dailyEnergy': {
                      '$sum': '$dailyEnergy'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0
                  }
                }
            ]),

            PlantAnalysis.aggregate([
                {
                  '$match': {
                    'timestamp': {
                      '$gte': new Date(yearStartDate), 
                      '$lt': new Date(yearEndDate)
                    }, 
                    'plantId': plantId
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$group': {
                    '_id': null, 
                    'dailyEnergy': {
                      '$sum': '$dailyEnergy'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0
                  }
                }
            ]),

            //Alarm 
            Alarm.aggregate([
              {
                '$match': {
                  'plantId': plantId, 
                  'status': 'Open', 
                  'deviceType': {
                    '$ne': 'D_LOG'
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'deviceNo': 0, 
                  'deviceType': 0, 
                  'plantId': 0
                }
              }
          ])
        ]

        //Execute Queries
        let [today, yesterday, week, month, year, alarms] = await Promise.allSettled(queries);
       
        if(today.value[0] != undefined)
        {
            if(today.value[0].dailyEnergy != undefined)
                todayEnergy = (today.value[0].dailyEnergy/1000);
            else
                todayEnergy = 'NA';

            if(today.value[0].PR != undefined)
            {
              if(today.value[0].PR != "NA")
                todayPR = (Number(today.value[0].PR).toFixed(1))+' %';
              else
                todayPR = today.value[0].PR;
            }   
            else
                todayPR = 'NA';

            if(today.value[0].CUF != undefined)
            {
              if(today.value[0].CUF != "NA")
                todayCUF = (Number(today.value[0].CUF).toFixed(1))+' %';
              else
                todayCUF = today.value[0].CUF;
            } 
            else
                todayCUF = 'NA';
        }
        else
        {
            todayEnergy = 'NA';
            todayPR = 'NA';
            todayCUF = 'NA';
        }

        if(yesterday.value[0] != undefined)
        {
            if(yesterday.value[0].dailyEnergy != undefined)
                yesterdayEnergy = (yesterday.value[0].dailyEnergy/1000);
            else
                yesterdayEnergy = 'NA';

            if(yesterday.value[0].PR != undefined)
            {
              if(yesterday.value[0].PR != "NA")
                yesterdayPR = (Number(yesterday.value[0].PR).toFixed(1))+' %';
              else
                yesterdayPR = yesterday.value[0].PR;
            }   
            else
              yesterdayPR = 'NA';

            if(yesterday.value[0].CUF != undefined)
            {
              if(yesterday.value[0].CUF != "NA")
                yesterdayCUF = (Number(yesterday.value[0].CUF).toFixed(1))+' %';
              else
                yesterdayCUF = yesterday.value[0].CUF;
            } 
            else
              yesterdayCUF = 'NA';
        }
        else
        {
            yesterdayEnergy = 'NA';
            yesterdayPR = 'NA';
            yesterdayCUF = 'NA';
        }

        if(week.value[0] != undefined)
        {
            if(week.value[0].dailyEnergy != undefined)
                weeklyEnergy = (week.value[0].dailyEnergy/1000).toFixed(2);
            else
                weeklyEnergy = 'NA';
        }
        else
        {
            weeklyEnergy = 'NA';
        }

        if(month.value[0] != undefined)
        {
            if(month.value[0].dailyEnergy != undefined)
                monthlyEnergy = (month.value[0].dailyEnergy/1000).toFixed(2);
            else
                monthlyEnergy = 'NA';
        }
        else
        {
            monthlyEnergy = 'NA';
        }

        if(year.value[0] != undefined)
        {
            if(year.value[0].dailyEnergy != undefined)
                yearlyEnergy = (year.value[0].dailyEnergy/1000).toFixed(2);
            else
                yearlyEnergy = 'NA';
        }
        else
        {
            yearlyEnergy = 'NA';
        }

        if(plantProfile[0].weatherStation)
        {
            let queries = [
                
                WeatherStation.aggregate([
                    {
                      '$match': {
                        'timestamp': {
                            '$gte': new Date(todayStartDate),
                            '$lte': new Date(todayEndDate)
                        }, 
                        'plantId': plantId, 
                        'deviceNo': 1, 
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
                ])
            ];

            //Execute Queries
            let [weatherStation] = await Promise.allSettled(queries);

            if(typeof(weatherStation.value[0]) != 'undefined')
            {
                if(weatherStation.value[0].duration<=900)
                {
                  if(weatherStation.value[0].GTI1 != undefined)
                    irradiance = parseInt(weatherStation.value[0].GTI1)+ ' W/m2';
                  else
                    irradiance = 'NA';

                  if(weatherStation.value[0].cumulativeGTI1 != undefined)
                    cumulativeIrradiance = weatherStation.value[0].cumulativeGTI1.toFixed(2)+ ' kWh/m2';
                  else
                    cumulativeIrradiance = 'NA';

                  if(weatherStation.value[0].ambientTemperature != undefined)
                    ambientTemp = weatherStation.value[0].ambientTemperature+ ' °C';
                  else
                    ambientTemp = 'NA';
      
                  if(weatherStation.value[0].moduleTemperature1 != undefined)
                    moduleTemp = weatherStation.value[0].moduleTemperature1+ ' °C';
                  else
                    moduleTemp = 'NA';
      
                  if(weatherStation.value[0].windSpeed != undefined)
                    windSpeed = weatherStation.value[0].windSpeed+ ' m/s';
                  else
                    windSpeed = 'NA';
                }
                else
                {
                  irradiance = 'NA';
                  cumulativeIrradiance = 'NA';
                  ambientTemp = 'NA';
                  moduleTemp = 'NA';
                  windSpeed = 'NA';
                }
            }
            else
            {
              irradiance = 'NA';
              cumulativeIrradiance = 'NA';
              ambientTemp = 'NA';
              moduleTemp = 'NA';
              windSpeed = 'NA';
            }
        }
        else
        {
            irradiance = 'NA';
            cumulativeIrradiance = 'NA';
            ambientTemp = 'NA';
            moduleTemp = 'NA';
            windSpeed = 'NA';
        }

        if(typeof plantProfile[0].totalDevice != 'undefined')
            totalDevice = plantProfile[0].totalDevice;

        if(typeof alarms.value[0] != 'undefined')
        {
            alarms.value.forEach(element => {
                if(element.operatingState == 'Offline')
                    offline++;
                if(element.operatingState != 'Offline')
                    alarm++;
            });
           normal = totalDevice - ( offline + alarm);
        }
        else
        {
            normal = totalDevice;
            alarm = 0;
            offline = 0;

        }
        
        response.totalDevice =totalDevice;
        response.normal= normal;
        response.alarm= alarm;
        response.offline= offline;
        response.todayEnergy = todayEnergy;
        response.yesterdayEnergy = yesterdayEnergy;
        response.weeklyEnergy = weeklyEnergy;
        response.monthlyEnergy = monthlyEnergy;
        response.yearlyEnergy = yearlyEnergy; 
        response.irradiance = irradiance; 
        response.cumulativeIrradiance = cumulativeIrradiance;
        response.moduleTemp = moduleTemp;
        response.ambientTemp = ambientTemp;
        response.windSpeed = windSpeed;
        response.todayPR = todayPR;
        response.yesterdayPR = yesterdayPR;
        response.todayCUF = todayCUF;
        response.yesterdayCUF = yesterdayCUF;

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