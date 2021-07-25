const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');

exports.siteNavigationService = async(username, plantIdS)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);

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
                'zeroExport': '$zeroExport.isActive'
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
                'zeroExport': 1
              }
            }
          ])
       
          response.siteName = plantProfile[0].plantName;
          response.dashboard = true;
          if(user.userType == 'client')
            response.analytics = false;
          else
            response.analytics = true;
          response.D_LOG = plantProfile[0].dataLogger;
          if(typeof plantProfile[0].scb != 'undefined')
            response.scb = plantProfile[0].scb;
          response.stringInverter = plantProfile[0].stringInverter;
          response.centralizedInverter = plantProfile[0].centralizedInverter;
          response.weatherStation = plantProfile[0].weatherStation;
          response.meter = plantProfile[0].meter;
          response.PV_DGSync = plantProfile[0].dieselGenerator;
          response.zeroExport = plantProfile[0].zeroExport;
          if(user.userType == 'client')
          response.alarm = false;
          else
          response.alarm = true;
          if(user.userType == 'client')
          response.calendar = false;
          else
          response.calendar = false;
          response.report = true;
          response.information = true;
          
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

exports.siteDeviceService = async(username, plantIdS)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);

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
            'scb': '$scb.details', 
            'stringInverter': '$stringInverter.details', 
            'centralizedInverter': '$centralizedInverter.details', 
            'weatherStation': '$weatherStation.details', 
            'meter': '$meter.details',
            'panelMeter': '$panelMeter.details',
            'dieselGenerator': '$dieselGenerator.details', 
            'zeroExport': '$zeroExport.details',
            'dataLogger': '$dataLogger.details',
          }
        }, {
          '$project': {
            '_id': 0,
            'scb': 1,
            'stringInverter': 1, 
            'centralizedInverter': 1, 
            'weatherStation': 1, 
            'meter': 1,
            'panelMeter': 1,
            'dieselGenerator': 1, 
            'zeroExport': 1,
            'dataLogger': 1
          }
        }
      ])

      if(typeof(plantProfile[0]) == 'undefined'){
        throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
      }

      if(typeof plantProfile[0].scb != 'undefined')
        response.scb = plantProfile[0].scb;
      response.stringInverter = plantProfile[0].stringInverter;
      response.centralizedInverter = plantProfile[0].centralizedInverter;
      response.weatherStation = plantProfile[0].weatherStation;
      response.meter = plantProfile[0].meter;
      response.dgMeter = [];
      response.zeMeter = [];

      if( plantProfile[0].panelMeter != undefined)
      {
        for(let i=0;i<plantProfile[0].panelMeter.length;i++)
        {
          if(plantProfile[0].panelMeter[i].solution == 'DG')
          {
            response.dgMeter.push(plantProfile[0].panelMeter[i]);
          }
          else if(plantProfile[0].panelMeter[i].solution == 'ZE')
          {
            response.zeMeter.push(plantProfile[0].panelMeter[i]);
          }
        }
      }
      
      response.PV_DGSync = plantProfile[0].dieselGenerator;
      response.zeroExport = plantProfile[0].zeroExport;
      response.D_LOG = plantProfile[0].dataLogger;

     return  { status:true, response:response };
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