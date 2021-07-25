const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { WeatherStation } = require('../models/weatherstation');

exports.cardService = async(username, plantIdS, weatherStationIds)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const weatherStationId = Number(weatherStationIds);
    
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
       
        const weatherStationProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'weatherStation.details.id': weatherStationId
              }
            }, {
              '$project': {
                'weatherStation': {
                  '$filter': {
                    'input': '$weatherStation.details', 
                    'as': 'weatherStations', 
                    'cond': {
                      '$eq': [
                        '$$weatherStations.id', weatherStationId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(weatherStationProfile[0] == undefined){
            throw new Error("WeatherStation Not Found, Please contact to Holmium Technologies!"); 
        }

        const weatherStation = await WeatherStation.aggregate([
          {
            '$match': {
              'timestamp': {
                '$gte': new Date('GMTDate')
              }, 
              'plantId': plantId, 
              'deviceNo': weatherStationId, 
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

        const weatherStationStatus = await WeatherStation.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'deviceNo': weatherStationId
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

        if(typeof(weatherStationStatus[0]) != 'undefined'){
          if(weatherStationStatus[0].duration<=600){
              if(weatherStationStatus[0].errorFlag == 0)
                  response.status = "Online";
              else
                  response.status='No-Data';  
          }
          else{
              response.status = "Offline";
          }
          let timestamp = new Date(weatherStationStatus[0].timestamp);
          response.timestamp = timestamp.toLocaleString('en-IN',{hourCycle:"h23"});
        }
        else{
            response.status = "Offline";
            response.timestamp = "--";
        }
        
        if(typeof(weatherStation[0]) != 'undefined'){

          if(weatherStation[0].duration<=900)
          {
            if(weatherStation[0].GTI1 != undefined)
              response.GTI1 = weatherStation[0].GTI1+ ' W/m2';
            else
              response.GTI1 = 'NA';

            if(weatherStation[0].GTI2 != undefined)
              response.GTI2 = weatherStation[0].GTI2+ ' W/m2';
            else
              response.GTI2 = 'NA';

            if(weatherStation[0].GTI3 != undefined)
              response.GTI3 = weatherStation[0].GTI3+ ' W/m2';
            else
              response.GTI3 = 'NA';

            if(weatherStation[0].GTI4 != undefined)
              response.GTI4 = weatherStation[0].GTI4+ ' W/m2';
            else
              response.GTI4 = 'NA';

            if(weatherStation[0].GTI5 != undefined)
              response.GTI5 = weatherStation[0].GTI5+ ' W/m2';
            else
              response.GTI5 = 'NA';

            if(weatherStation[0].GHI != undefined)
              response.GHI = weatherStation[0].GHI + ' W/m2';
            else
              response.GHI = 'NA';

            // if(weatherStation[0].cumulativeGTI1 != undefined)
            //   response.cumulativeGTI = weatherStation[0].cumulativeGTI1+ ' W/m2';
            // else
            //   response.cumulativeGTI = 'NA';

            if(weatherStation[0].ambientTemperature != undefined)
              response.ambientTemperature = weatherStation[0].ambientTemperature+ ' °C';
            else
              response.ambientTemperature = 'NA';

            if(weatherStation[0].moduleTemperature1 != undefined)
              response.moduleTemperature1 = weatherStation[0].moduleTemperature1+ ' °C';
            else
              response.moduleTemperature1 = 'NA';

            if(weatherStation[0].moduleTemperature2 != undefined)
              response.moduleTemperature2 = weatherStation[0].moduleTemperature2+ ' °C';
            else
              response.moduleTemperature2 = 'NA';

            if(weatherStation[0].moduleTemperature3 != undefined)
              response.moduleTemperature3 = weatherStation[0].moduleTemperature3+ ' °C';
            else
              response.moduleTemperature3 = 'NA';

            if(weatherStation[0].moduleTemperature4 != undefined)
              response.moduleTemperature4 = weatherStation[0].moduleTemperature4+ ' °C';
            else
              response.moduleTemperature4 = 'NA';

            if(weatherStation[0].moduleTemperature5 != undefined)
              response.moduleTemperature5 = weatherStation[0].moduleTemperature5+ ' °C';
            else
              response.moduleTemperature5 = 'NA';

            if(weatherStation[0].windSpeed != undefined)
              response.windSpeed = weatherStation[0].windSpeed+ ' m/s';
            else
              response.windSpeed = 'NA';

            if(weatherStation[0].windDirection != undefined)
            {
              response.windDirection = weatherStation[0].windDirection;

              if(response.windDirection > 348.75 && response.windDirection <= 11.25)
                response.windDirection = 'N';
              else if(response.windDirection > 11.25 && response.windDirection <= 33.75)
                response.windDirection = 'NNE';
              else if(response.windDirection > 33.75 && response.windDirection <= 56.25)
                response.windDirection = 'NE';
              else if(response.windDirection > 56.25 && response.windDirection <= 78.75)
                response.windDirection = 'ENE';
              else if(response.windDirection > 78.75 && response.windDirection <= 101.25)
                response.windDirection = 'E';
              else if(response.windDirection > 101.25 && response.windDirection <= 123.75)
                response.windDirection = 'ESE';
              else if(response.windDirection > 123.75 && response.windDirection <= 146.25)
                response.windDirection = 'SE';
              else if(response.windDirection > 146.25 && response.windDirection <= 168.75)
                response.windDirection = 'SSE';
              else if(response.windDirection > 168.75 && response.windDirection <= 191.25)
                response.windDirection = 'S';
              else if(response.windDirection > 191.25 && response.windDirection <= 213.75)
                response.windDirection = 'SSW';
              else if(response.windDirection > 213.75 && response.windDirection <= 236.25)
                response.windDirection = 'SW';
              else if(response.windDirection > 236.25 && response.windDirection <= 258.75)
                response.windDirection = 'WSW';
              else if(response.windDirection > 258.75 && response.windDirection <= 281.25)
                response.windDirection = 'W';
              else if(response.windDirection > 281.25 && response.windDirection <= 303.75)
                response.windDirection = 'WNW';
              else if(response.windDirection > 303.75 && response.windDirection <= 326.25)
                response.windDirection = 'NW';
              else if(response.windDirection > 326.25 && response.windDirection <= 348.75)
                response.windDirection = 'NNW';
            }
            else
              response.windDirection = 'NA';

            if(weatherStation[0].relativeHumidity != undefined)
              response.relativeHumidity = weatherStation[0].relativeHumidity+ ' %';
            else
              response.relativeHumidity = 'NA';

            if(weatherStation[0].rainGauge != undefined)
              response.rainGauge = weatherStation[0].rainGauge+ ' mm';
            else
              response.rainGauge = 'NA';
          }
          else
          {
            response.GTI1 = 'NA';
            response.GTI2 = 'NA';
            response.GTI3 = 'NA';
            response.GTI4 = 'NA';
            response.GTI5 = 'NA';
            response.GHI = 'NA';
            //response.cumulativeGTI = 'NA';
            response.ambientTemperature = 'NA';
            response.moduleTemperature1 = 'NA';
            response.moduleTemperature2 = 'NA';
            response.moduleTemperature3 = 'NA';
            response.moduleTemperature4 = 'NA';
            response.moduleTemperature5 = 'NA';
            response.windSpeed = 'NA';
            response.windDirection = 'NA';
            response.relativeHumidity = 'NA';
            response.rainGauge = 'NA';
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

exports.curveService = async(username, plantIdS, weatherStationIds, timestamp)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const weatherStationId = Number(weatherStationIds);
  const timestampTemp = Number(timestamp);

  let d1 = new Date(timestampTemp);
  d1.setHours(00);
  d1.setMinutes(00);
  d1.setSeconds(00);
  d1.setMilliseconds(00);
  const GMTDateGT1= new Date(d1).toUTCString();

  let dt1 = new Date(timestampTemp);
  dt1.setHours(23);
  dt1.setMinutes(59);
  dt1.setSeconds(59);
  dt1.setMilliseconds(00);
  const GMTDateLT1 = new Date(dt1).toUTCString();

  let d2 = new Date(timestampTemp);
  d2.setHours(00);
  d2.setMinutes(30);
  d2.setSeconds(00);
  d2.setMilliseconds(00);
  const GMTDateGT2 = new Date(d2).toUTCString();

  let dt2 = new Date(timestampTemp);
  dt2.setHours(23);
  dt2.setMinutes(59);
  dt2.setSeconds(59);
  dt2.setMilliseconds(00);
  const GMTDateLT2 = new Date(dt2).toUTCString();

  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const weatherStationProfile = await PlantProfile.aggregate([
          {
            '$match': {
              'plantId': plantId, 
              'weatherStation.details.id': weatherStationId
            }
          }, {
            '$project': {
              'weatherStation': {
                '$filter': {
                  'input': '$weatherStation.details', 
                  'as': 'weatherStations', 
                  'cond': {
                    '$eq': [
                      '$$weatherStations.id', weatherStationId
                    ]
                  }
                }
              }, 
              '_id': 0
            }
          }
      ]);

      if(weatherStationProfile[0] == undefined){
          throw new Error("WeatherStation Not Found, Please contact to Holmium Technologies!"); 
      }

      let queries = [

        await WeatherStation.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT1), 
                '$gte': new Date(GMTDateGT1)
              }, 
              'plantId': plantId, 
              'deviceNo': weatherStationId
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
              'timestamp': {
                '$first': '$timestamp'
              }, 
              'GHI': {
                '$first': '$GHI'
              }, 
              'GTI1': {
                '$first': '$GTI1'
              }, 
              'GTI2': {
                '$first': '$GTI2'
              }, 
              'GTI3': {
                '$first': '$GTI3'
              }, 
              'GTI4': {
                '$first': '$GTI4'
              }, 
              'GTI5': {
                '$first': '$GTI5'
              }, 
              'ambientTemperature': {
                '$first': '$ambientTemperature'
              }, 
              'moduleTemperature1': {
                '$first': '$moduleTemperature1'
              }, 
              'moduleTemperature2': {
                '$first': '$moduleTemperature2'
              }, 
              'moduleTemperature3': {
                '$first': '$moduleTemperature3'
              }, 
              'moduleTemperature4': {
                '$first': '$moduleTemperature4'
              }, 
              'moduleTemperature5': {
                '$first': '$moduleTemperature5'
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
        ]),

        await WeatherStation.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT2), 
                '$gte': new Date(GMTDateGT2)
              }, 
              'plantId': plantId, 
              'deviceNo': weatherStationId
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
                        }, 60
                      ]
                    }
                  ]
                }
              }, 
              'timestamp': {
                '$first': '$timestamp'
              }, 
              'windSpeed': {
                '$avg': '$windSpeed'
              }, 
              'windDirection': {
                '$avg': '$windDirection'
              }, 
              'relativeHumidity': {
                '$avg': '$relativeHumidity'
              }, 
              'rainGauge': {
                '$avg': '$rainGauge'
              }
            }
          }, {
            '$addFields': {
              'time': {
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
            '$project': {
              '_id': 0, 
              'time': {
                '$dateToString': {
                  'format': '%H:%M', 
                  'date': '$time', 
                  'timezone': 'Asia/Kolkata'
                }
              }, 
              'timestamp': 1, 
              'windSpeed': {
                '$round': [
                  '$windSpeed', 2
                ]
              }, 
              'windDirection': {
                '$round': [
                  '$windDirection', 2
                ]
              }, 
              'relativeHumidity': {
                '$round': [
                  '$relativeHumidity', 2
                ]
              }, 
              'rainGauge': {
                '$round': [
                  '$rainGauge', 2
                ]
              }
            }
          }, {
            '$sort': {
              'timestamp': 1
            }
          }
        ])
      ];

      //Execute Queries
      let [weatherStationCurve1, weatherStationCurve2] = await Promise.allSettled(queries);

      let GHI = false;
      let GTI1 = false;
      let GTI2 = false;
      let GTI3 = false;
      let GTI4 = false;
      let GTI5 = false;
      let ambientTemperature = false; 
      let moduleTemperature1 = false;
      let moduleTemperature2 = false; 
      let moduleTemperature3 = false; 
      let moduleTemperature4 = false;
      let moduleTemperature5 = false;

      let windSpeed = false;
      let windDirection = false;
      let relativeHumidity = false;
      let rainGauge = false;
     
      weatherStationCurve1.value.forEach(element => {
        if(element.GHI != null && !GHI)
          GHI = true;
        if(element.GTI1 != null && !GTI1)
          GTI1 = true;
        if(element.GTI2 != null && !GTI2)
          GTI2 = true;
        if(element.GTI3 != null && !GTI3)
          GTI3 = true;
        if(element.GTI4 != null && !GTI4)
          GTI4 = true;
        if(element.GTI5 != null && !GTI5)
          GTI5 = true;
        if(element.ambientTemperature != null && !ambientTemperature)
          ambientTemperature = true;
        if(element.moduleTemperature1 != null && !moduleTemperature1)
          moduleTemperature1 = true;
        if(element.moduleTemperature2 != null && !moduleTemperature2)
          moduleTemperature2 = true;
        if(element.moduleTemperature3 != null && !moduleTemperature3)
          moduleTemperature3 = true;
        if(element.moduleTemperature4 != null && !moduleTemperature4)
          moduleTemperature4 = true;
        if(element.moduleTemperature5 != null && !moduleTemperature5)
          moduleTemperature5 = true;    
      });

      weatherStationCurve2.value.forEach(element => {
        if(element.windSpeed != null && !windSpeed)
          windSpeed = true;
        if(element.windDirection != null && !windDirection)
          windDirection = true;
        if(element.relativeHumidity != null && !relativeHumidity)
          relativeHumidity = true;
        if(element.rainGauge != null && !rainGauge)
          rainGauge = true; 
       });

      response.timestamp1=[];
      if(GHI)
        response.GHI=[];
      if(GTI1)
        response.GTI1=[];
      if(GTI2)
        response.GTI2=[];
      if(GTI3)
        response.GTI3=[];
      if(GTI4)
        response.GTI4=[];
      if(GTI5)
        response.GTI5=[];
      if(ambientTemperature)
        response.ambientTemperature=[];
      if(moduleTemperature1)
        response.moduleTemperature1=[];
      if(moduleTemperature2)
        response.moduleTemperature2=[];
      if(moduleTemperature3)
        response.moduleTemperature3=[];
      if(moduleTemperature4)
        response.moduleTemperature4=[];
      if(moduleTemperature5)
        response.moduleTemperature5=[];

      response.timestamp2=[];
      if(windSpeed)
        response.windSpeed=[];
      if(windDirection)
        response.windDirection=[];
      if(relativeHumidity)
        response.relativeHumidity=[];
      if(rainGauge)
        response.rainGauge=[];

      let range = 0;
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
        counter=288;

      for (let i=0, j=0; i<counter; i++)
      {
        if(typeof weatherStationCurve1.value[j] != 'undefined')
        {
          if(range <= weatherStationCurve1.value[j].minute && weatherStationCurve1.value[j].minute < range +5)
          {
            response.timestamp1.push(weatherStationCurve1.value[j].time);
            if(GHI)
              response.GHI.push(weatherStationCurve1.value[j].GHI);
            if(GTI1)
              response.GTI1.push(weatherStationCurve1.value[j].GTI1);
            if(GTI2)
              response.GTI2.push(weatherStationCurve1.value[j].GTI2);
            if(GTI3)
              response.GTI3.push(weatherStationCurve1.value[j].GTI3);
            if(GTI4)
              response.GTI4.push(weatherStationCurve1.value[j].GTI4);
            if(GTI5)
              response.GTI5.push(weatherStationCurve1.value[j].GTI5);
            if(ambientTemperature)
              response.ambientTemperature.push(weatherStationCurve1.value[j].ambientTemperature);
            if(moduleTemperature1)
              response.moduleTemperature1.push(weatherStationCurve1.value[j].moduleTemperature1);
            if(moduleTemperature2)
              response.moduleTemperature2.push(weatherStationCurve1.value[j].moduleTemperature2);
            if(moduleTemperature3)
              response.moduleTemperature3.push(weatherStationCurve1.value[j].moduleTemperature3);
            if(moduleTemperature4)
              response.moduleTemperature4.push(weatherStationCurve1.value[j].moduleTemperature4);
            if(moduleTemperature5)
              response.moduleTemperature5.push(weatherStationCurve1.value[j].moduleTemperature5);

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
                response.timestamp1.push(hour + ":00");
              else
                response.timestamp1.push(hour + ":" + minutes);
            }
            else
            {
              if(minutes == 0)
                response.timestamp1.push("0"+hour + ":00");
              else
                response.timestamp1.push("0"+hour + ":" + minutes);
            }

            if(GHI)
              response.GHI.push(null);
            if(GTI1)
              response.GTI1.push(null);
            if(GTI2)
              response.GTI2.push(null);
            if(GTI3)
              response.GTI3.push(null);
            if(GTI4)
              response.GTI4.push(null);
            if(GTI5)
              response.GTI5.push(null);
            if(ambientTemperature)
              response.ambientTemperature.push(null);
            if(moduleTemperature1)
              response.moduleTemperature1.push(null);
            if(moduleTemperature2)
              response.moduleTemperature2.push(null);
            if(moduleTemperature3)
              response.moduleTemperature3.push(null);
            if(moduleTemperature4)
              response.moduleTemperature4.push(null);
            if(moduleTemperature5)
              response.moduleTemperature5.push(null);

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
              response.timestamp1.push(hour + ":00");
            else
              response.timestamp1.push(hour + ":" + minutes);
          }
          else
          {
            if(minutes == 0)
              response.timestamp1.push("0"+hour + ":00");
            else
              response.timestamp1.push("0"+hour + ":" + minutes);
          }

          if(GHI)
            response.GHI.push(null);
          if(GTI1)
            response.GTI1.push(null);
          if(GTI2)
            response.GTI2.push(null);
          if(GTI3)
            response.GTI3.push(null);
          if(GTI4)
            response.GTI4.push(null);
          if(GTI5)
            response.GTI5.push(null);
          if(ambientTemperature)
            response.ambientTemperature.push(null);
          if(moduleTemperature1)
            response.moduleTemperature1.push(null);
          if(moduleTemperature2)
            response.moduleTemperature2.push(null);
          if(moduleTemperature3)
            response.moduleTemperature3.push(null);
          if(moduleTemperature4)
            response.moduleTemperature4.push(null);
          if(moduleTemperature5)
            response.moduleTemperature5.push(null);
        }
        range = range+5;
      }

      weatherStationCurve2.value.forEach(element => {
        response.timestamp2.push(element.time);
        if(windSpeed)
          response.windSpeed.push(element.windSpeed);
        if(windDirection)
          response.windDirection.push(element.windDirection);
        if(relativeHumidity)
          response.relativeHumidity.push(element.relativeHumidity);
        if(rainGauge)
          response.rainGauge.push(element.rainGauge);
      });

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