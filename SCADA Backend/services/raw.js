const {RawData} = require('../models/raw');

exports.rawData = async (args,raw)=>{
   
    //Change Timestamp to Indian time
    //args[5] = args[5].toLocaleString("en-IN");


    //Mongoose raw Dataobject for Database
    const rawData = new RawData({
        timestamp:new Date(args[5]),
        loggerNo:args[0],
        plantId:args[1],
        deviceType:args[2],
        deviceNo:args[3],
        errorFlag:args[4],
        request:args.toString(),
        data:raw
    });
    
    try{
        await rawData.save();
        //Set local variable for next middleware
        return "ConnectedOK";
    }
    catch (err){
        return err.message;
        //return "Bad Request";
    } 
};