const mongoose = require('mongoose');

exports.WeatherStation=mongoose.model('WeatherStation',new mongoose.Schema({
    timestamp:{type:Date, required:true},
    loggerNo:{type:Number, required:true, min:1, max: 25},
    plantId:{type:Number, required:true, min:1, max: 1000},
    deviceType:{type:Number, required:true, min:101, max: 150},
    deviceNo:{type:Number, required:true, min:0, max: 10},
    errorFlag:{type:Number, required:true, min:0, max: 1},
  
    GHI:{type:Number, min:0, max: 1500},
    cumulativeGHI:{type:Number, min:0, max: 10},
    GTI1:{type:Number, min:0, max: 1500},
    cumulativeGTI1:{type:Number, min:0, max: 10},
    GTI2:{type:Number, min:0, max: 1500},
    cumulativeGTI2:{type:Number, min:0, max: 10},
    GTI3:{type:Number, min:0, max: 1500},
    cumulativeGTI3:{type:Number, min:0, max: 10},
    GTI4:{type:Number, min:0, max: 1500},
    cumulativeGTI4:{type:Number, min:0, max: 10},
    GTI5:{type:Number, min:0, max: 1500},
    cumulativeGTI5:{type:Number, min:0, max: 10},
    ambientTemperature:{type:Number},
    moduleTemperature1:{type:Number},
    moduleTemperature2:{type:Number},
    moduleTemperature3:{type:Number},
    moduleTemperature4:{type:Number},
    moduleTemperature5:{type:Number},
    windSpeed:{type:Number},
    windDirection:{type:Number},
    relativeHumidity:{type:Number},
    rainGauge:{type:Number}
}));