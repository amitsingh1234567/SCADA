const url = require('url');
const MyProfileService=require('../services/myProfileService');

exports.myProfileCardController = (req,res,next)=>{
    MyProfileService.profileCardService(req.query.username)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        res.status(200).json({
            message: true,
            response: response.response
        })
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        })
    }) 
}

exports.myProfileSiteController = (req,res,next)=>{
    MyProfileService.profileSiteService(req.query.username)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        res.status(200).json({
            message: true,
            response: response.response
        })
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        })
    }) 
}