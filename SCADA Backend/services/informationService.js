const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');

exports.informationCardService = async(username, plantIdS)=>{

    const response = {};
    const plantId = Math.sqrt(plantIdS);

    try{

        const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

        if(user == null){
            throw new Error("User does not have access privileges for this site monitoring, Please contact to Holmium Technologies!"); 
        }
       
        const plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': plantId
              }
            }, {
              '$project': {
                'plantName': 1, 
                'plantCapacity': 1, 
                'location': '$location.name', 
                'coordinates': '$location.coordinates', 
                'commissioningDate': 1, 
                'licenseExpiryDate': 1, 
                'owner': 1, 
                'unitPrice': 1, 
                'dataLogger': '$dataLogger.quantity', 
                'inverter': {
                  '$sum': [
                    '$stringInverter.quantity', '$centralizedInverter.quantity'
                  ]
                }, 
                'weatherStation': '$weatherStation.quantity', 
                'meter': '$meter.quantity', 
                'dieselGenerator': '$dieselGenerator.quantity', 
                'zeroExport': '$zeroExport.quantity', 
                'PVModulesQuantity': '$PVModules.quantity', 
                'PVModuleWattage': '$PVModules.wattage'
              }
            }
          ])

          response.siteName = plantProfile[0].plantName;
          response.capacity = plantProfile[0].plantCapacity;
          if(response.capacity>9999)
            response.capacity = (response.capacity/1000).toFixed(2) + " MW";
          else
            response.capacity = response.capacity + " kW"; 
          response.location = plantProfile[0].location.substr(0,30);
          response.coordinates = plantProfile[0].coordinates[0] +", "+ plantProfile[0].coordinates[1];
          response.commissioningDate = plantProfile[0].commissioningDate;
          response.portalLicenseDate = plantProfile[0].licenseExpiryDate;
          response.owner = plantProfile[0].owner;
          response.unitPrice = plantProfile[0].unitPrice;
          response.D_LOG = plantProfile[0].dataLogger;
          response.inverter = plantProfile[0].inverter;
          response.weatherStation = plantProfile[0].weatherStation;
          response.meter = plantProfile[0].meter;
          response.PV_DGSync = plantProfile[0].dieselGenerator;
          response.zeroExport = plantProfile[0].zeroExport;
          response.PVModuleQuantity = plantProfile[0].PVModulesQuantity;
          response.PVModuleWattage = plantProfile[0].PVModuleWattage;

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

exports.informationProfileService = async(username, plantIdS)=>{

  const response = {};
  const plantId = Math.sqrt(plantIdS);

  try{

      const user = await User.findOne({ 'username': username,"plants.id" : {$regex : ".*"+plantId+".*"}});

      if(user == null){
          throw new Error("User does not have access privileges for this site monitoring, Please contact to Holmium Technologies!"); 
      }
     
      const plantProfile = await PlantProfile.aggregate([
        {
          '$match': {
            'plantId': plantId
          }
        }, {
          '$project': {
            'dataLogger': 1, 
            'stringInverter': 1, 
            'centralizedInverter': 1, 
            'weatherStation': 1, 
            'meter': 1, 
            'dieselGenerator': 1
          }
        }
      ])

      if(plantProfile[0] == undefined){
        throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
      }

      if(plantProfile[0].stringInverter.isActive)
      {
        plantProfile[0].stringInverter.details.forEach(element => {
          if(element.capacity>9999)
            element.capacity = (element.capacity/1000).toFixed(2) + " MW";
          else
            element.capacity = element.capacity + " kW";
        });  
      }
      
      if(plantProfile[0].centralizedInverter.isActive)
      {
        plantProfile[0].centralizedInverter.details.forEach(element => {
          if(element.capacity>9999)
            element.capacity = (element.capacity/1000).toFixed(2) + " MW";
          else
            element.capacity = element.capacity + " kW";
        });
      }

      //if(plantProfile[0].dataLogger.isActive)
        response.D_LOG = plantProfile[0].dataLogger;

      //if(plantProfile[0].stringInverter.isActive) 
        response.stringInverter = plantProfile[0].stringInverter;
      
     // if(plantProfile[0].centralizedInverter.isActive)
        response.centralizedInverter = plantProfile[0].centralizedInverter;
      
      //if(plantProfile[0].weatherStation.isActive)
        response.weatherStation = plantProfile[0].weatherStation;
      
      //if(plantProfile[0].meter.isActive)
        response.meter = plantProfile[0].meter;

      //if(plantProfile[0].dieselGenerator.isActive)
        response.PV_DGSync = plantProfile[0].dieselGenerator;
        
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