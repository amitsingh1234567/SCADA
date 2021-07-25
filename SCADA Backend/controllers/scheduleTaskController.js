const cron = require('node-cron');
const TaskAlarm = require('../services/plantAlarmService');
const TaskAnalysis = require('../services/plantAnalysisService');
const TaskSync = require('../services/plantDataSyncService');
   
// cron wont start automatically

exports.thirtySecondTaskController = cron.schedule('*/30 * * * * *', () => {
    try{
	  TaskSync.syncPlantData();
    }
    catch(err){
        return err.message;
        //return "Bad Request";
    } 
});

exports.oneMinuteTaskController = cron.schedule('*/1 * * * *', () => {
    try{
	  TaskSync.syncPlantData();
    }
    catch(err){
        return err.message;
        //return "Bad Request";
    } 
});

exports.twoMintuteTaskController = cron.schedule('*/2 * * * *', () => {
    try{
      TaskAnalysis.plantAnalysisService();
    }
    catch(err){
        return err.message;
        //return "Bad Request";
    } 
});

// exports.fiveMintuteTaskController = cron.schedule('*/5 * * * *', () => {
//   try{
    
//   }
//   catch(err){
//       return err.message;
//       //return "Bad Request";
//   } 
// });

exports.twentyOneHourTaskController = cron.schedule('0 22 * * *', () => {
  try{
    TaskAnalysis.plantAnalysisCheckService();
  }
  catch(err){
      return err.message;
      //return "Bad Request";
  } 
});