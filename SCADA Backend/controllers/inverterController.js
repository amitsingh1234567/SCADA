const url = require('url');
const inverterService=require('../services/inverterService');

exports.stringInverterCardController = (req,res,next)=>{
    inverterService.stringInverterCardService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.stringInverterCurveController = (req,res,next)=>{
    inverterService.stringInverterCurveService(req.query.username,req.query.siteid,req.query.deviceid,req.query.timestamp)
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

exports.stringInverterParameterController = (req,res,next)=>{
    inverterService.stringInverterParamerterService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.centralizedInverterCardController = (req,res,next)=>{
    inverterService.centralizedInverterCardService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.centralizedInverterCurveController = (req,res,next)=>{
    inverterService.centralizedInverterCurveService(req.query.username,req.query.siteid,req.query.deviceid,req.query.timestamp)
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

exports.centralizedInverterParameterController = (req,res,next)=>{
    inverterService.centralizedInverterParamerterService(req.query.username,req.query.siteid,req.query.deviceid)
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