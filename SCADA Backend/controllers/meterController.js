const url = require('url');
const meterService=require('../services/meterService');

exports.meterCardController = (req,res,next)=>{
    meterService.meterCardService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.meterCurveController = (req,res,next)=>{
    meterService.meterCurveService(req.query.username,req.query.siteid,req.query.deviceid,req.query.timestamp)
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

exports.meterParameterController = (req,res,next)=>{
    meterService.meterParamerterService(req.query.username,req.query.siteid,req.query.deviceid)
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