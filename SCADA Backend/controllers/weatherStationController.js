const url = require('url');
const weatherStationService=require('../services/weatherStationService');

exports.weatherStationCardController = (req,res,next)=>{
    weatherStationService.cardService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.weatherStationCurveController = (req,res,next)=>{
    weatherStationService.curveService(req.query.username,req.query.siteid,req.query.deviceid,req.query.timestamp)
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