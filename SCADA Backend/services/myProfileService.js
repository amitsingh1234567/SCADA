const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');

exports.profileCardService = async(username)=>{

    const response = {};

    try {
            const user = await User.findOne({  'username': username });
          
            if(typeof(user) == 'undefined'){
                throw new Error("User Not Found, Please contact to Holmium Technologies!"); 
            }

            response.clientName=user.clientName;
            response.totalSite=user.plants.quantity;

            const plantIds = user.plants.id.split(",").map(x=>+x);

            const profile = await PlantProfile.aggregate([
                {
                  '$match': {
                    'plantId': {
                      '$in': plantIds
                    }
                  }
                }, {
                  '$group': {
                    '_id': {
                      'plantId': {
                        '$and': '$plantId'
                      }
                    }, 
                    'totalCapacity': {
                      '$sum': '$plantCapacity'
                    }, 
                    'totalD_LOG': {
                      '$sum': '$dataLogger.quantity'
                    }, 
                    'totalStringInverter': {
                      '$sum': '$stringInverter.quantity'
                    }, 
                    'totalCentralizedInverter': {
                      '$sum': '$centralizedInverter.quantity'
                    }, 
                    'totalWeatherStation': {
                      '$sum': '$weatherStation.quantity'
                    }, 
                    'totalMeter': {
                      '$sum': '$meter.quantity'
                    }, 
                    'totalDieselGenerator': {
                      '$sum': '$dieselGenerator.quantity'
                    }, 
                    'totalZeroExport': {
                      '$sum': '$zeroExport.quantity'
                    }
                  }
                }, {
                  '$addFields': {
                    'totalInverter': {
                      '$sum': [
                        '$totalStringInverter', '$totalCentralizedInverter'
                      ]
                    }
                  }
                }, {
                  '$project': {
                    '_id': 1, 
                    'totalStringInverter': 0, 
                    'totalCentralizedInverter': 0
                  }
                }
              ])

            if(typeof(profile[0]) == 'undefined'){
                throw new Error("User Not Found, Please contact to Holmium Technologies!"); 
            }

            response.totalCapacity =  profile[0].totalCapacity;
            if(response.totalCapacity>9999)
            response.totalCapacity = (response.totalCapacity/1000).toFixed(2) + ' MW'
            else
            response.totalCapacity = response.totalCapacity + ' kW'

            response.totalD_LOG =  profile[0].totalD_LOG;
            response.totalInverter =  profile[0].totalInverter;
            response.totalWeatherStation =  profile[0].totalWeatherStation;
            response.totalMeter =  profile[0].totalMeter;
            response.totalPV_DGSync =  profile[0].totalDieselGenerator;
            response.totalZeroExport =  profile[0].totalZeroExport;
            
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

exports.profileSiteService = async(username)=>{

  const response = [];

  try {
          const user = await User.findOne({ 'username': username });
        
          if(typeof(user) == 'undefined'){
              throw new Error("User Not Found, Please contact to Holmium Technologies!"); 
          }

          response.clientName=user.clientName;

          const plantIds = user.plants.id.split(",").map(x=>+x);

          const plantProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': {
                  '$in': plantIds
                }
              }
            }, {
              '$addFields': {
                'location': '$location.name', 
                'D_LOG': '$dataLogger.quantity', 
                'inverter': {
                  '$sum': [
                    '$stringInverter.quantity', '$centralizedInverter.quantity'
                  ]
                }, 
                'weatherStation': '$weatherStation.quantity', 
                'meter': '$meter.quantity', 
                'dieselGenerator': '$dieselGenerator.quantity', 
                'zeroExport': '$zeroExport.quantity'
              }
            }, {
              '$project': {
                '_id': 0, 
                'owner': 0, 
                'plantId': 0, 
                'emailId': 0, 
                'mobileNo': 0, 
                'ownerLogo': 0, 
                'unitPrice': 0, 
                'PVModules': 0, 
                'stringInverter': 0, 
                'centralizedInverter': 0, 
                'dataLogger': 0
              }
            }, {
              '$sort': {
                'plantName': 1
              }
            }
          ])

          if(typeof(plantProfile[0]) == 'undefined'){
              throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
          }

          plantProfile.forEach((plantProfile) => {
            if(plantProfile.plantCapacity>9999)
              plantProfile.plantCapacity = (plantProfile.plantCapacity/1000).toFixed(2) + ' MW';
            else
              plantProfile.plantCapacity = plantProfile.plantCapacity + ' kW';
          });

          for(let i=0;i<plantProfile.length;i++)
          {
            response[i] = {};
            response[i].site = plantProfile[i].plantName;
            response[i].location = plantProfile[i].location;
            response[i].capacity = plantProfile[i].plantCapacity;
            response[i].D_LOG = plantProfile[i].D_LOG;
            response[i].inverter = plantProfile[i].inverter;
            response[i].weatherStation = plantProfile[i].weatherStation;
            response[i].meter = plantProfile[i].meter;
            response[i].PV_DGSync = plantProfile[i].dieselGenerator;
            response[i].zeroExport = plantProfile[i].zeroExport;
            response[i].commissioningDate = plantProfile[i].commissioningDate;
            response[i].portalExpiry = plantProfile[i].licenseExpiryDate;
          }

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
