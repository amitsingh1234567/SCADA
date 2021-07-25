//const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

exports.RawData=mongoose.model('RawData',new mongoose.Schema({
    
    timestamp:{type:Date, required:true},
    loggerNo:{type:Number, required:true, min:1, max: 25},
    plantId:{type:Number, required:true, min:1, max: 1000},
    deviceType:{type:Number, required:true, min:0, max: 250},
    deviceNo:{type:Number, required:true, min:0, max: 2500},
    errorFlag:{type:Number, required:true, min:0, max: 2},
    request:{type:String, required:true, minlength:1, maxlength: 255},
    data:{
        type:String,
        required: function(){ return this.errorFlag==0}
     }
}));

// exports.validateRawData = (rawData)=>{
//     const schema =Joi.object({
//     timestamp:Joi.date().required(),
//     loggerNo:Joi.number().min(1).max(25).required(),
//     plantId:Joi.number().min(1).max(1000).required(),
//     deviceType:Joi.number().min(0).max(250).required(),
//     deviceNo:Joi.number().min(0).max(100).required(),
//     errorFlag:Joi.number().min(0).max(2).required(),
//     request:Joi.string().min(1).max(255).required(),
//     data:Joi.string().allow('')
//     });
  
//     return schema.validate(rawData);
//   };