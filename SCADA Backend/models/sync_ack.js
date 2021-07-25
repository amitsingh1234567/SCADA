const mongoose = require('mongoose');

exports.SyncAck=mongoose.model('SyncAck',new mongoose.Schema({
    
    timestamp:{type:Date, required:true},
    plantId:{type:Number, required:true, min:1, max: 1000},
    deviceType:{type:String, required:true},
    statusCode:{type:Number, required:true},
    foreignId:mongoose.Schema.Types.ObjectId,
    timestampData:{type:Date, required:true},

}));