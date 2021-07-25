const url = require('url');
const alarmService=require('../services/alarmService');

exports.alarmNotificationController = (req,res,next)=>{
   alarmService.alarmNotificationService(req.query.username,req.query.siteid)
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

exports.alarmDetailController = (req,res,next)=>{
    alarmService.alarmDetailService(req.query.username,req.query.siteid, req.query.device, req.query.state, req.query.timestamp)
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