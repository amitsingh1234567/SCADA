const mongoose = require('mongoose');

exports.PlantAnalysis=mongoose.model('Plantanalysis',new mongoose.Schema({
    
    timestamp:{type:Date},
    updatedAt:{type:Date},
    plantId:{type:Number, min:1, max: 1000},
    plantName:{type:String},
    totalCapacity:{type:Number},
    plantStartTime:{type:String},
    plantStopTime:{type:String},
    plantGenerationTime:{type:Number},
    maxActivePower:{type:Number},
    specificEnergy:{type:Number},
    dailyEnergy:{type:Number},
    totalEnergy:{type:Number},
    PR:{type:String},
    CUF:{type:String},
    cumulativeGHI:{type:String},
    cumulativeGTI1:{type:String},
    cumulativeGTI2:{type:String},
    cumulativeGTI3:{type:String},
    cumulativeGTI4:{type:String},
    cumulativeGTI5:{type:String},
    MFMEnergyExport:{type:String},
    MFMEnergyImport:{type:String},
    diesalGeneratorEnergyExport:{type:String},
    zeroExportActiveEnergyExport:{type:String},
    zeroExportActiveEnergyImport:{type:String}
}));