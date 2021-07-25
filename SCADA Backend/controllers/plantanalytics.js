const cron = require('node-cron');
const PlantAnalytics = require('../services/plantanalytics');
   
// cron wont start automatically
//exports.task = cron.schedule('*/1 * * * *', () => {
exports.taskPlantAnalytics = cron.schedule('*/45 * * * * *', () => {
    try{
        PlantAnalytics.plantAnalytics();
    }
    catch(err){
        return err.message;
        //return "Bad Request";
    } 
});