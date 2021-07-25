const url = require('url');
const siteService=require('../services/siteService');

exports.siteNavigationController = (req,res,next)=>{
    siteService.siteNavigationService(req.query.username,req.query.siteid)
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

exports.siteDeviceController = (req,res,next)=>{
    siteService.siteDeviceService(req.query.username,req.query.siteid)
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