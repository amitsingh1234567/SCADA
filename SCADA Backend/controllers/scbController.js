const SCBService=require('../services/scbService');

exports.SCBCardController = (req,res,next)=>{
    SCBService.SCBCardService(req.query.username,req.query.siteid,req.query.deviceid)
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

exports.SCBCurveController = (req,res,next)=>{
    SCBService.SCBCurveService(req.query.username,req.query.siteid,req.query.deviceid,req.query.timestamp)
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

exports.SCBStatusController = (req,res,next)=>{
    SCBService.SCBStatusService(req.query.username,req.query.siteid)
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
