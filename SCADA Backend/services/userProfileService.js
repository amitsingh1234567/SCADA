const { User } = require('../models/user');
const { PlantProfile } = require('../models/plantProfile');

exports.userProfileService = async(username)=>{

    const response = {};

    try {
            const user = await User.findOne({  'username': username });
          
            if(typeof(user) == 'undefined'){
                throw new Error("User Not Found, Please contact to Holmium Technologies!"); 
            }

            response.clientName=user.clientName;
            response.clientLogo=user.clientLogo;
            response.plantImages=user.plantImages;

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
                  'coordinates': '$location.coordinates'
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'plantId': 1, 
                  'plantName': 1, 
                  'plantCapacity': 1, 
                  'location': 1, 
                  'coordinates': 1, 
                  'licenseExpiryDate': 1
                }
              }, {
                '$sort': {
                  'plantId': 1
                }
              }
            ])

            if(typeof(plantProfile[0]) == 'undefined'){
                throw new Error("User Not Found, Please contact to Holmium Technologies!"); 
            }

            plantProfile.forEach((plantProfile) => {
                plantProfile.plantId= plantProfile.plantId * plantProfile.plantId;
            });

            response.plants =  plantProfile;
           
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
