const { User } = require('../models/user');
const { Alarm } = require('../models/alarm');

const addString=(...args)=>{
  let addString='';
  for(i in args){
      addString += args[i];
      }
return addString.replace(/,\s*$/, "");
};

exports.alarmNotificationService = async(username, plantIdS)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);
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
            throw new Error("User does not have access privileges for this site monitoring, Please contact to Holmium Technologies!"); 
        }
       
        const alarm = await Alarm.aggregate([
            {
              '$match': {
                'plantId': plantId, 
                'status': 'Open', 
                'timestamp': {
                  '$gte': new Date(GMTDateTime)
                }
              }
            }, {
              '$project': {
                '_id': 0, 
                'deviceNo': 0, 
                'deviceType': 0, 
                'plantId': 0
              }
            }, {
              '$sort': {
                'timestamp': -1
              }
            }
          ])

          alarm.forEach(alarm =>{
              if(isFinite(alarm.duration))
              {
                let n = alarm.duration;
                let day = parseInt(n / (24 * 60)); 
                n = n % (24 * 60); 
                let hour = parseInt(n / 60); 
                n %= 60; 
                let minutes = parseInt(n) ; 
  
                alarm.duration = day + " Days " + hour + " hours " + minutes + " mins";
              }
              else
              alarm.duration = '';
          });
          
          response.alarms = alarm;

       return  { status:true, response:response };
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

exports.alarmDetailService = async(username, plantIdS, device, state, timestamp)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);
  const timestampTemp = Number(timestamp);

  let d = new Date(timestampTemp);
  d.setHours(00);
  d.setMinutes(00);
  d.setSeconds(01);
  d.setMilliseconds(00);
  const GMTDateGT = new Date(d).toUTCString();

  let dt = new Date(timestampTemp);
  dt.setHours(23);
  dt.setMinutes(59);
  dt.setSeconds(59);
  dt.setMilliseconds(00);
  const GMTDateLT = new Date(dt).toUTCString();

  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for this site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      let alarm = [];

      if(state == 'Open')
      {
        alarm = await Alarm.aggregate([
          {
            '$match': {
              'plantId': plantId,
              'status': state
            }
          }, {
            '$project': {
              "_id": 0,
              "deviceNo":1,
              "unit": "$deviceName",
              "state":"$status",
              "operatingStatus": "$operatingState",
              "fault": "$fault",
              "warning": "$warning",
              "error": "$error",
              "from": { 
                  $dateToString: { 
                    format: "%d/%m/%Y %H:%M", 
                    date:"$from", 
                    timezone: "Asia/Kolkata"
                  } 
                },
              "to": { 
                $dateToString: { 
                  format: "%d/%m/%Y %H:%M", 
                  date:"$to", 
                  timezone: "Asia/Kolkata"
                  } 
                },
              "duration":1
            }
          }, {
            '$sort': {
              'timestamp': -1
            }
          }
        ])
      }
      else
      {
        alarm = await Alarm.aggregate([
          {
            '$match': {
              'timestamp': {
                '$lte': new Date(GMTDateLT), 
                '$gte': new Date(GMTDateGT)
              }, 
              'plantId': plantId, 
              'status': state
            }
          }, {
            '$project': {
              "_id": 0,
              "deviceNo":1,
              "unit": "$deviceName",
              "state":"$status",
              "operatingStatus": "$operatingState",
              "fault": "$fault",
              "warning": "$warning",
              "error": "$error",
              "from": { 
                  $dateToString: { 
                    format: "%d/%m/%Y %H:%M", 
                    date:"$from", 
                    timezone: "Asia/Kolkata"
                  } 
                },
              "to": { 
                $dateToString: { 
                  format: "%d/%m/%Y %H:%M", 
                  date:"$to", 
                  timezone: "Asia/Kolkata"
                  } 
                },
              "duration":1
            }
          }, {
            '$sort': {
              'timestamp': -1
            }
          }
        ])
      }

      alarm.forEach(alarm =>{
        
        let fault="";
        let warning="";
        let error="";
  
        if(alarm.fault !== null && typeof alarm.fault != 'undefined')
          fault = alarm.fault;
        if(alarm.warning !== null && typeof alarm.warning != 'undefined')
          warning = alarm.warning;
        if(alarm.error !== null && typeof alarm.error != 'undefined')
          error = alarm.error;

        alarm.fault = addString(fault, warning, error);
        
        if(alarm.fault === "")
        alarm.fault = "NA";
  
        if(alarm.from == null)
          alarm.from = "-";
        if(alarm.to == null)
          alarm.to = "-";
        if(isFinite(alarm.duration))
        {
          let n = alarm.duration;
          let day = parseInt(n / (24 * 60)); 
          n = n % (24 * 60); 
          let hour = parseInt(n / 60); 
          n %= 60; 
          let minutes = parseInt(n) ; 

          alarm.duration = day + " Days " + hour + " hours " + minutes + " mins";
        }
        else
        alarm.duration = '-';
      });
      
      response.alarm = alarm;

    return  { status:true, response:response };
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