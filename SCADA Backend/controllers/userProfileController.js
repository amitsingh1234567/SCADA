const url = require('url');
const UserProfile=require('../services/userProfileService');

exports.userProfile = (req,res,next)=>{
  
  UserProfile.userProfileService(req.query.username)
    .then(response=>{
        if(!response.status){
            throw new Error(response.message); 
        } 
       
        res.status(200).json({
            status: true,
            response: response.response
        });
    })
    .catch((err)=>{
        res.status(404).json({
            status: false,
            message: err.message
        })
        
    }) 
}