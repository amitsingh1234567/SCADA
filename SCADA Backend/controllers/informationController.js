const url = require('url');
const informationService=require('../services/informationService');

exports.informationCardController = (req,res,next)=>{
    informationService.informationCardService(req.query.username,req.query.siteid)
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

exports.informationProfileController = (req,res,next)=>{
    informationService.informationProfileService(req.query.username,req.query.siteid, req.query.device, req.query.state, req.query.timestamp)
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