const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');
const { SCB } = require('../models/scb');

exports.SCBCardService = async(username, plantIdS, SCBIds)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const SCBId = Number(SCBIds);
    
    let d = new Date();
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(01);
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
       
        const scbProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'scb.details.id': SCBId
              }
            }, {
              '$project': {
                'scb': {
                  '$filter': {
                    'input': '$scb.details', 
                    'as': 'scbs', 
                    'cond': {
                      '$eq': [
                        '$$scbs.id', SCBId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(scbProfile[0] == undefined){
            throw new Error("SCB Not Found, Please contact to Holmium Technologies!"); 
        }

        let query = [

            SCB.aggregate([
              {
                '$match': {
                  'plantId': plantId, 
                  'deviceNo': SCBId
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

            SCB.aggregate([
              {
                '$match': {
                  'timestamp': { 
                      $gte: new Date(GMTDate)
                  },
                  'plantId': plantId,
                  'deviceNo': SCBId,
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
        let [SCBStatus, SCBData] = await Promise.allSettled(query);

        if(typeof(SCBStatus.value[0]) != 'undefined')
        {
            if(SCBStatus.value[0].duration<=300)
            {
                if(SCBStatus.value[0].errorFlag == 0)
                    response.status = "Online";
                else
                    response.status='No-Data';  
            }
            else
            {
                response.status = "Offline";
            }
            let timestamp = new Date(SCBStatus.value[0].timestamp);
            response.timestamp = timestamp.toLocaleString('en-IN',{hourCycle:"h23"});
        }
        else{
            response.status = "Offline";
            response.timestamp = "--";
        }
        
        if(typeof(SCBData.value[0]) != 'undefined')
        {  
            if(SCBData.value[0].duration<=300)
            {   
                if(typeof SCBData.value[0].voltage != 'undefined')
                  response.voltage = SCBData.value[0].voltage.toFixed(2)+' V';
                else
                  response.voltage = 'NA';
                
                if(typeof SCBData.value[0].current != 'undefined')
                  response.current = SCBData.value[0].current.toFixed(2)+' A';
                else
                  response.current = 'NA';
                
                if(typeof SCBData.value[0].power != 'undefined')
                  response.power = SCBData.value[0].power.toFixed(2)+' kW';
                else
                  response.power = 'NA';
                
                if(typeof SCBData.value[0].temperature != 'undefined')
                  response.temperature = SCBData.value[0].temperature.toFixed(2)+' °C';
                else
                  response.temperature = 'NA';
                    
                if(typeof SCBData.value[0].currentString1 != 'undefined')
                  response.currentString1 = SCBData.value[0].currentString1.toFixed(1)+' A';
                else
                  response.currentString1 = 'NA';

                if(typeof SCBData.value[0].currentString2 != 'undefined')
                  response.currentString2 = SCBData.value[0].currentString2.toFixed(1)+' A';
                else
                  response.currentString2 = 'NA';

                if(typeof SCBData.value[0].currentString3 != 'undefined')
                  response.currentString3 = SCBData.value[0].currentString3.toFixed(1)+' A';
                else
                  response.currentString3 = 'NA';

                if(typeof SCBData.value[0].currentString4 != 'undefined')
                  response.currentString4 = SCBData.value[0].currentString4.toFixed(1)+' A';
                else
                  response.currentString4 = 'NA';

                if(typeof SCBData.value[0].currentString5 != 'undefined')
                  response.currentString5 = SCBData.value[0].currentString5.toFixed(1)+' A';
                else
                  response.currentString5 = 'NA';

                if(typeof SCBData.value[0].currentString6 != 'undefined')
                  response.currentString6 = SCBData.value[0].currentString6.toFixed(1)+' A';
                else
                  response.currentString6 = 'NA';

                if(typeof SCBData.value[0].currentString7 != 'undefined')
                  response.currentString7 = SCBData.value[0].currentString7.toFixed(1)+' A';
                else
                  response.currentString7 = 'NA';

                if(typeof SCBData.value[0].currentString8 != 'undefined')
                  response.currentString8 = SCBData.value[0].currentString8.toFixed(1)+' A';
                else
                  response.currentString8 = 'NA';

                if(typeof SCBData.value[0].currentString9 != 'undefined')
                  response.currentString9 = SCBData.value[0].currentString9.toFixed(1)+' A';
                else
                  response.currentString9 = 'NA';

                if(typeof SCBData.value[0].currentString10 != 'undefined')
                  response.currentString10 = SCBData.value[0].currentString10.toFixed(1)+' A';
                else
                  response.currentString10 = 'NA';

                if(typeof SCBData.value[0].currentString11 != 'undefined')
                  response.currentString11 = SCBData.value[0].currentString11.toFixed(1)+' A';
                else
                  response.currentString11 = 'NA';

                if(typeof SCBData.value[0].currentString12 != 'undefined')
                  response.currentString12 = SCBData.value[0].currentString12.toFixed(1)+' A';
                else
                  response.currentString12 = 'NA';

                if(typeof SCBData.value[0].currentString13 != 'undefined')
                  response.currentString13 = SCBData.value[0].currentString13.toFixed(1)+' A';
                else
                  response.currentString13 = 'NA';

                if(typeof SCBData.value[0].currentString14 != 'undefined')
                  response.currentString14 = SCBData.value[0].currentString14.toFixed(1)+' A';
                else
                  response.currentString14 = 'NA';

                if(typeof SCBData.value[0].currentString15 != 'undefined')
                  response.currentString15 = SCBData.value[0].currentString15.toFixed(1)+' A';
                else
                  response.currentString15 = 'NA';

                if(typeof SCBData.value[0].currentString16 != 'undefined')
                  response.currentString16 = SCBData.value[0].currentString16.toFixed(1)+' A';
                else
                  response.currentString16 = 'NA';

                if(typeof SCBData.value[0].currentString17 != 'undefined')
                  response.currentString17 = SCBData.value[0].currentString17.toFixed(1)+' A';
                else
                  response.currentString17 = 'NA';

                if(typeof SCBData.value[0].currentString18 != 'undefined')
                  response.currentString18 = SCBData.value[0].currentString18.toFixed(1)+' A';
                else
                  response.currentString18 = 'NA';

                if(typeof SCBData.value[0].currentString19 != 'undefined')
                  response.currentString19 = SCBData.value[0].currentString19.toFixed(1)+' A';
                else
                  response.currentString19 = 'NA';

                if(typeof SCBData.value[0].currentString20 != 'undefined')
                  response.currentString20 = SCBData.value[0].currentString20.toFixed(1)+' A';
                else
                  response.currentString20 = 'NA';

                if(typeof SCBData.value[0].currentString21 != 'undefined')
                  response.currentString21 = SCBData.value[0].currentString21.toFixed(1)+' A';
                else
                  response.currentString21 = 'NA';

                if(typeof SCBData.value[0].currentString22 != 'undefined')
                  response.currentString22 = SCBData.value[0].currentString22.toFixed(1)+' A';
                else
                  response.currentString22 = 'NA';

                if(typeof SCBData.value[0].currentString23 != 'undefined')
                  response.currentString23 = SCBData.value[0].currentString23.toFixed(1)+' A';
                else
                  response.currentString23 = 'NA';

                if(typeof SCBData.value[0].currentString24 != 'undefined')
                  response.currentString24 = SCBData.value[0].currentString24.toFixed(1)+' A';
                else
                  response.currentString24 = 'NA';
            }
            else
            {
                response.voltage = 'NA';
                response.current = 'NA';
                response.power = 'NA';
                response.temperature = 'NA';
                response.currentString1 = 'NA';
                response.currentString2 = 'NA';
                response.currentString3 = 'NA';
                response.currentString4 = 'NA';
                response.currentString5 = 'NA';
                response.currentString6 = 'NA';
                response.currentString7 = 'NA';
                response.currentString8 = 'NA';
                response.currentString9 = 'NA';
                response.currentString10 = 'NA';
                response.currentString11 = 'NA';
                response.currentString12 = 'NA';
                response.currentString13 = 'NA';
                response.currentString14 = 'NA';
                response.currentString15 = 'NA';
                response.currentString16 = 'NA';
                response.currentString17 = 'NA';
                response.currentString18 = 'NA';
                response.currentString19 = 'NA';
                response.currentString20 = 'NA';
                response.currentString21 = 'NA';
                response.currentString22 = 'NA';
                response.currentString23 = 'NA';
                response.currentString24 = 'NA';
            }
        }
        else
        {
            response.voltage = 'NA';
            response.current = 'NA';
            response.power = 'NA';
            response.temperature = 'NA';
            response.currentString1 = 'NA';
            response.currentString2 = 'NA';
            response.currentString3 = 'NA';
            response.currentString4 = 'NA';
            response.currentString5 = 'NA';
            response.currentString6 = 'NA';
            response.currentString7 = 'NA';
            response.currentString8 = 'NA';
            response.currentString9 = 'NA';
            response.currentString10 = 'NA';
            response.currentString11 = 'NA';
            response.currentString12 = 'NA';
            response.currentString13 = 'NA';
            response.currentString14 = 'NA';
            response.currentString15 = 'NA';
            response.currentString16 = 'NA';
            response.currentString17 = 'NA';
            response.currentString18 = 'NA';
            response.currentString19 = 'NA';
            response.currentString20 = 'NA';
            response.currentString21 = 'NA';
            response.currentString22 = 'NA';
            response.currentString23 = 'NA';
            response.currentString24 = 'NA';
        }

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

exports.SCBCurveService = async(username, plantIdS, SCBIds, timestamp)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
    const SCBId = Number(SCBIds);
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
  
        if(username != 'testing@holmium.com' && username != 'admin@holmium.com' )
        {
            const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

            if(user == null)
                throw new Error("User does not have access privileges for site monitoring, Please contact to Holmium Technologies!");
        }
       
        const scbProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'scb.details.id': SCBId
              }
            }, {
              '$project': {
                'scb': {
                  '$filter': {
                    'input': '$scb.details', 
                    'as': 'scbs', 
                    'cond': {
                      '$eq': [
                        '$$scbs.id', SCBId
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(scbProfile[0] == undefined){
            throw new Error("SCB Not Found, Please contact to Holmium Technologies!"); 
        }
  
        const SCBData = await SCB.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT), 
                '$gte': new Date(GMTDateGT)
              }, 
              'plantId': plantId, 
              'deviceNo': SCBId
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
              'voltage': {
                '$first': '$voltage'
              },
              'current': {
                '$first': '$current'
              }, 
              'power': {
                '$first': '$power'
              },
              'temperature': {
                '$first': '$temperature'
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
  
        SCBData.forEach(element => {
  
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
        });
       
        response.time=[];
        response.voltage=[];
        response.current=[];
        response.power=[];
        response.temperature=[];
  
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
          if(typeof SCBData[j] != 'undefined')
          {
            if(range <= SCBData[j].minute && SCBData[j].minute < range +5)
            {
              response.time.push(SCBData[j].time);
              response.voltage.push(SCBData[j].voltage);
              response.current.push(SCBData[j].current);
              response.power.push(SCBData[j].power);
              response.temperature.push(SCBData[j].temperature);
      
              if(currentString1)
              response.currentString1.push(SCBData[j].currentString1);
              if(currentString2)
              response.currentString2.push(SCBData[j].currentString2);
              if(currentString3)
              response.currentString3.push(SCBData[j].currentString3);
              if(currentString4)
              response.currentString4.push(SCBData[j].currentString4);
              if(currentString5)
              response.currentString5.push(SCBData[j].currentString5);
              if(currentString6)
              response.currentString6.push(SCBData[j].currentString6);
              if(currentString7)
              response.currentString7.push(SCBData[j].currentString7);
              if(currentString8)
              response.currentString8.push(SCBData[j].currentString8);
              if(currentString9)
              response.currentString9.push(SCBData[j].currentString9);
              if(currentString10)
              response.currentString10.push(SCBData[j].currentString10);
              if(currentString11)
              response.currentString11.push(SCBData[j].currentString11);
              if(currentString12)
              response.currentString12.push(SCBData[j].currentString12);
              if(currentString13)
              response.currentString13.push(SCBData[j].currentString13);
              if(currentString14)
              response.currentString14.push(SCBData[j].currentString14);
              if(currentString15)
              response.currentString15.push(SCBData[j].currentString15);
              if(currentString16)
              response.currentString16.push(SCBData[j].currentString16);
              if(currentString17)
              response.currentString17.push(SCBData[j].currentString17);
              if(currentString18)
              response.currentString18.push(SCBData[j].currentString18);
              if(currentString19)
              response.currentString19.push(SCBData[j].currentString19);
              if(currentString20)
              response.currentString20.push(SCBData[j].currentString20);
              if(currentString21)
              response.currentString21.push(SCBData[j].currentString21);
              if(currentString22)
              response.currentString22.push(SCBData[j].currentString22);
              if(currentString23)
              response.currentString23.push(SCBData[j].currentString23);
              if(currentString24)
              response.currentString24.push(SCBData[j].currentString24);

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
  
              response.voltage.push(null);
              response.current.push(null);
              response.power.push(null);
              response.temperature.push(null);
      
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

              response.voltage.push(null);
              response.current.push(null);
              response.power.push(null);
              response.temperature.push(null);
      
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