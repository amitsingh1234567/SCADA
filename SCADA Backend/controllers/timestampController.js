const TimestampService=require('../services/timestampService');

exports.timestampController = async(req,res,next)=>{
    TimestampService.timestampService()
    .then((response)=>{  
        res.status(200).send(response.response)
    })
    .catch((err)=>{
        //console.log(err);
        res.status(401).send(err.message)
    }) 
};