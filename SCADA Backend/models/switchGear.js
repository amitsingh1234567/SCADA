const mongoose = require('mongoose');

exports.SwitchGear=mongoose.model('SwitchGear',new mongoose.Schema({
    timestamp:{type:Date, required:true},
    loggerNo:{type:Number, required:true, min:1, max: 25},
    plantId:{type:Number, required:true, min:1, max: 1000},
    //deviceType:{type:Number, required:true, min:226, max: 240},
    deviceNo:{type:Number, required:true, min:0, max: 10},
    //errorFlag:{type:Number, required:true, min:0, max: 1},
  
    breakerOn: {type:Boolean},
    breakerOff:  {type:Boolean},
    springCharge:  {type:Boolean},
    buchholzTrip:  {type:Boolean},
    buchholzAlarm:  {type:Boolean},
    WTITrip:  {type:Boolean},
    WTIAlarm:  {type:Boolean},
    WTI1:{type:Number, min:-45, max: 1000},
    WTI2:{type:Number, min:-45, max: 1000},
    MOGTrip:  {type:Boolean},
    MOGAlarm:  {type:Boolean},
    OTITrip:  {type:Boolean},
    OTIAlarm:  {type:Boolean},
    OTI: {type:Number, min:-45, max: 1000},
    lowOilLevelAlarm:  {type:Boolean},
    PRVTrip:  {type:Boolean},
    PRVAlarm:  {type:Boolean},
    OVTrip:  {type:Boolean},
    OCTrip:  {type:Boolean},
    EFTrip:  {type:Boolean},

}));