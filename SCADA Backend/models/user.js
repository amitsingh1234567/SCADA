const mongoose = require('mongoose');

exports.User=mongoose.model('user',new mongoose.Schema({

    username:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    clientName:{type:String, required:true},
    clientLogo:{type:String, required:true},
    plants:{type:Object, required:true},
    userType:{type:String},
    plantImages:{type:Object, required:true}
}));