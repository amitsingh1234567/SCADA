const url = require('url');
const Raw=require('../services/raw');
const StringInverter=require('../services/stringinverter');
const CentralizedInverter=require('../services/centralizedinverter');
const WeatherStation=require('../services/weatherstation');
const Meter=require('../services/meter');
const SCB=require('../services/scb');
const SwitchGear=require('../services/switchGear');

exports.getData = async(req,res,next)=>{

    let urlParams = {};

    if(Object.keys(req.query).length !== 0)
        urlParams = req.query;
    else if(Object.keys(req.body).length !== 0 && typeof req.body === 'object')
        urlParams = req.body;
    else if(Object.keys(req.body).length !== 0 && typeof req.body === 'string')
    { 
        let tempUrlParams = req.body.split("&");
        tempUrlParams.forEach(element => {
            let temp = element.split("=");
            let key = temp[0];
            urlParams[key] = temp[1]; 
        });
    }

    //const urlParams = url.parse(req.url, true).query;

    if(urlParams.LD){
        const args = urlParams.LD.split(",");
        let rawData = '';
        let data = [];
   
        //Initialization Data
        if(urlParams.ID){
            rawData = urlParams.ID;
            data = urlParams.ID.split(",");
        }
        else if(urlParams.MD){
            rawData = urlParams.MD;
            data = urlParams.MD.split(",");
        }
        else if(urlParams.WD){
            rawData = urlParams.WD;
            data = urlParams.WD.split(",");
        }
       
        // Set timestamp if not availble
        if(typeof args[5] == 'undefined'){
            args[5]=new Date().toUTCString();
        }
        else
        {
            let length = args[5].length;

            if(length == 19)
                args[5] = new Date(args[5]).toUTCString();
            else if(length == 13)
                args[5] = new Date(Number(args[5])).toUTCString();
            else if(length == 10)
                args[5] = new Date(Number(args[5])*1000).toUTCString();
            else
                args[5] = new Date().toUTCString(); 
        }
      
        try{
            const response = await Raw.rawData (args,rawData);
        
            if(response =='ConnectedOK'){

                if(args[2]>=1 && args[2]<=50){
                    const insertFlag = await StringInverter.stringInverter (args,data);
                    return res.status(201).send(response+insertFlag);  
                }
                else if(args[2]>=51 && args[2]<=100){
                    const insertFlag = await CentralizedInverter.centralizedInverter (args,data);
                    return res.status(201).send(response+insertFlag);
                }
                else if(args[2]>=101 && args[2]<=150){
                    const insertFlag = await WeatherStation.weatherStation (args,data);
                    return res.status(201).send(response+insertFlag);
                }
                else if(args[2]>=176 && args[2]<=200){
                    const insertFlag = await Meter.meter (args,data);
                    return res.status(201).send(response+insertFlag);
                }
                else if(args[2]>=201 && args[2]<=225){
                    const insertFlag = await SCB.scb (args,data);
                    return res.status(201).send(response+insertFlag);
                }
                else if(args[2]>=226 && args[2]<=240){
                    const insertFlag = await SwitchGear.insertData (args,data);
                    return res.status(201).send(response+insertFlag);
                }
                else 
                {
                    return res.status(201).send(response);
                }
            }
            else
            {
                return res.status(400).send(response);
            }
        }
        catch (err){
            return res.status(400).send(err.message);
            //return res.status(500).send("Bad Request");
            } 
    }
    else if(req.body.ED){

        const args = req.body.ED.split(",");
        let rawData = '';
        let data={};
    
        //Initialization Data
        if(req.body.ID){
            rawData=JSON.stringify(req.body.ID);
            data = req.body.ID;
        }
        else if(req.body.MD){
            rawData=JSON.stringify(req.body.MD);
            data = req.body.MD;
        }
        else if(req.body.WD){
            rawData=JSON.stringify(req.body.WD);
            data = req.body.WD;
        }

        try{
            const response = await Raw.rawData (args,rawData);
        
                if(response =='ConnectedOK')
                {
                    if(args[2]>=1 && args[2]<=50){
                        console.log("inv");
                        const insertFlag = await StringInverter.syncStringInverter (args,data);
                        return res.status(201).send(response+insertFlag);  
                    }
                    else if(args[2]>=51 && args[2]<=100){ 
                        console.log("cen");
                        const insertFlag = await CentralizedInverter.syncCentralizedInverter (args,data);
                        return res.status(201).send(response+insertFlag);
                    }
                    else if(args[2]>=101 && args[2]<=150){ 
                        console.log("wms");
                        const insertFlag = await WeatherStation.syncWeatherStation (args,data);
                        return res.status(201).send(response+insertFlag);
                    }
                    else if(args[2]>=176 && args[2]<=200){
                        console.log("met");
                        const insertFlag = await SCB.syncSCB (args,data);
                        return res.status(201).send(response+insertFlag);
                    }
                    else if(args[2]>=201 && args[2]<=225){
                        console.log("scb");
                        const insertFlag = await Meter.syncMeter (args,data);
                        return res.status(201).send(response+insertFlag);
                    }
                    else 
                    {
                        return res.status(201).send(response);
                    }
                }
                else
                {
                    return res.status(400).send(response);
                }
               
            }
        catch (err){
            return res.status(400).send(err.message);
            //return res.status(500).send("Bad Request");
            } 
        }   
    else{
        return res.status(400).send("Bad Request");
    }
};