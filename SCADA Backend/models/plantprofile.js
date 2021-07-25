//const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

exports.PlantProfile=mongoose.model('PlantProfile',new mongoose.Schema({
   
    plantId:{type:Number, required:true, min:1, max: 1000},
    scb:{type:Object},
    stringInverter:{type:Object},
    centralizedInverter:{type:Object},
    meter:{type:Object},
    weatherStation:{type:Object},
    // panelMeter:{type:Object},
    // dieselGenerator:{type:Object},
    switchGear:{type:Object}
   
}));