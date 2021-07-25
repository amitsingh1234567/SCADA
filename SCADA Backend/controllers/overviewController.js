const url = require('url');
const overviewService=require('../services/overviewService');

exports.overviewCardController = (req,res,next)=>{
    overviewService.overviewCardService(req.query.username)
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

exports.overviewSiteController = (req,res,next)=>{
    overviewService.overviewSiteService(req.query.username)
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