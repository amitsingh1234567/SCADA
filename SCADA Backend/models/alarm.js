const mongoose = require('mongoose');

exports.Alarm=mongoose.model('Alarm',new mongoose.Schema({
    
    timestamp:{type:Date, required:true},
    plantId:{type:Number, required:true, min:1, max: 1000},
    deviceType:{type:String, required:true},
    deviceNo:{type:Number, required:true},
    deviceName:{type:String, required:true},
    status:{type:String, required:true},
    operatingState:{type:String, required:true},
    warning:{type:String},
    error:{type:String},
    fault:{type:String},
    from:{type:Date},
    to:{type:Date},
    duration:{type:Number},
    priority:{type:Number},
    acknowledgement:{type:Boolean},
    comment:{type:String}

}));
