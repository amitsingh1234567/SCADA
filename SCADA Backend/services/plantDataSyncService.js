const axios = require('axios');
const { Alarm } = require('../models/alarm');
const { PlantProfile } = require('../models/plantProfile');
const { RawData } = require('../models/raw');
const { SCB } = require('../models/scb');
const { StringInverter } = require('../models/stringinverter');
const { CentralizedInverter } = require('../models/centralizedinverter');
const { WeatherStation } = require('../models/weatherstation');
const { Meter } = require('../models/meter');
const { PlantAnalysis } = require('../models/plantanalysis');
const { SyncAck } = require('../models/sync_ack');
const URL = 'http://www.holmiumtechnologies.com/gm/api/syncdata';
const LIMIT = 100;
const timeout = 2500;

const syncAcknowledgement = async (plantProfile, deviceType) =>{
    try{
        const syncAck =  await SyncAck.aggregate([
            {
            '$match': {
                'plantId': plantProfile.plantId, 
                'deviceType': deviceType
            }
            }, {
            '$sort': {
                'foreignId':-1
            }
            }, {
            '$limit': 1
            }
        ]);
        return syncAck;
    }
    catch(err){
        console.log(err)
        return err;
    }
};

const syncStringInverter = async (plantProfile) =>{

    let deviceType = 'stringInverter';
    let syncAck = await syncAcknowledgement(plantProfile, deviceType);
    let ack = {};

    try{
        if(syncAck[0] != undefined)
        {
          let query;

            if(syncAck[0].statusCode == 201)
            {
              query = [{
                '$match':{
                  'plantId':plantProfile.plantId,
                  '_id':{"$gt":syncAck[0].foreignId}
                  }
                }, {
                    '$sort': {
                    'timestamp': 1
                    }
                }, {
                    '$limit': LIMIT
              }];
            }
            else
            {
              query = [{
                '$match':{
                  'plantId':plantProfile.plantId,
                  '_id':{"$gte":syncAck[0].foreignId}
                  }
                }, {
                    '$sort': {
                    'timestamp': 1
                    }
                }, {
                    '$limit': LIMIT
              }];
            }

            const data = await StringInverter.aggregate(query);

            if(typeof data[0] != 'undefined')
            {
                //Initialize for Loop
                let j = 0; 

                while(j<data.length)
                {
                    let requests = {
                    timestamp: data[j].timestamp,
                    loggerNo: data[j].loggerNo,
                    plantId: data[j].plantId,
                    deviceType: data[j].deviceType,
                    deviceNo: data[j].deviceNo,
                    errorFlag: data[j].errorFlag
                    }

                    let dataObject =  data[j];

                    ack.timestamp=new Date();
                    ack.plantId=data[j].plantId;
                    ack.deviceType=deviceType;
                    ack.foreignId=data[j]._id;
                    ack.timestampData = data[j].timestamp;

                    let config = {
                    method: 'post',
                    url: URL,
                    timeout: timeout,
                    headers: { 
                        'Content-Type': 'application/json'
                    },
                    data : {
                        request : JSON.stringify(requests),
                        data: JSON.stringify(dataObject)
                    }
                    };
                    
                    let response = await axios(config)
                    ack.statusCode=response.status;

                    j++;
                }

                const update={
                    timestamp:new Date(),
                    plantId:ack.plantId,
                    deviceType:ack.deviceType,
                    foreignId:ack.foreignId,
                    statusCode:ack.statusCode,
                    timestampData:ack.timestampData
                };
                
                await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
            else
            {
                const update={
                    timestamp:new Date(),
                    plantId:syncAck[0].plantId,
                    deviceType:syncAck[0].deviceType,
                    foreignId:syncAck[0].foreignId,
                    statusCode:syncAck[0].statusCode,
                    timestampData:syncAck[0].timestampData
                };
            
            await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
        }
        else
        {
            const data = await StringInverter.aggregate([
              {
                '$match':{
                  'plantId':plantProfile.plantId
                }
              }, {
                '$sort': {
                  'timestamp': 1
                }
              }, {
                '$limit': LIMIT
              }
            ]);

            if(typeof data[0] != 'undefined')
            {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                }

                let dataObject =  data[j];

                ack.timestamp=new Date();
                ack.plantId=data[j].plantId;
                ack.deviceType=deviceType;
                ack.foreignId=data[j]._id;
                ack.timestampData = data[j].timestamp;

                let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                    'Content-Type': 'application/json'
                  },
                  data : {
                    request : JSON.stringify(requests),
                    data: JSON.stringify(dataObject)
                  }
                };
                
                let response = await axios(config)
                ack.statusCode=response.status;

                j++;
              }

              const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
              });
        
              Ack.save();
            }
            else
            {
              //DO Nothing
            }
        }
    }
    catch(err){
        if(syncAck[0] != undefined)
        {
          const update={
            timestamp:new Date(),
            plantId:ack.plantId,
            deviceType:ack.deviceType,
            foreignId:ack.foreignId,
            statusCode:ack.statusCode,
            timestampData:ack.timestampData
          };
          
          if(update.statusCode == undefined)
            update.statusCode= 500;
    
          await SyncAck.updateOne({_id:syncAck[0]._id},update);
        }
        else
        {
            const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
            });
      
            if(Ack.statusCode == undefined)
                Ack.statusCode= 500;
        
            Ack.save();
        }
        //console.log(err);
        return err;
    }
}

const syncCentralizedInverter = async (plantProfile) =>{
    
    let deviceType = 'centralizedInverter';
    let syncAck = await syncAcknowledgement(plantProfile, deviceType);
    let ack = {};

    try{
        if(syncAck[0] != undefined)
        {
          let query;

          if(syncAck[0].statusCode == 201)
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gt":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }
          else
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gte":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }

          const data = await CentralizedInverter.aggregate(query);

          if(typeof data[0] != 'undefined')
          {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                  let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                  }

                  let dataObject =  data[j];

                  ack.timestamp=new Date();
                  ack.plantId=data[j].plantId;
                  ack.deviceType=deviceType;
                  ack.foreignId=data[j]._id;
                  ack.timestampData = data[j].timestamp;

                  let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                      'Content-Type': 'application/json'
                  },
                  data : {
                      request : JSON.stringify(requests),
                      data: JSON.stringify(dataObject)
                  }
                  };
                  
                  let response = await axios(config)
                  ack.statusCode=response.status;

                  j++;
                }

                const update={
                    timestamp:new Date(),
                    plantId:ack.plantId,
                    deviceType:ack.deviceType,
                    foreignId:ack.foreignId,
                    statusCode:ack.statusCode,
                    timestampData:ack.timestampData
                };
                
                await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
            else
            {
                const update={
                    timestamp:new Date(),
                    plantId:syncAck[0].plantId,
                    deviceType:syncAck[0].deviceType,
                    foreignId:syncAck[0].foreignId,
                    statusCode:syncAck[0].statusCode,
                    timestampData:syncAck[0].timestampData
                };
            
            await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
        }
        else
        {
            const data = await CentralizedInverter.aggregate([
              {
                '$match':{
                  'plantId':plantProfile.plantId
                }
              }, {
                '$sort': {
                  'timestamp': 1
                }
              }, {
                '$limit': LIMIT
              }
            ]);

            if(typeof data[0] != 'undefined')
            {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                }

                let dataObject =  data[j];

                ack.timestamp=new Date();
                ack.plantId=data[j].plantId;
                ack.deviceType=deviceType;
                ack.foreignId=data[j]._id;
                ack.timestampData = data[j].timestamp;

                let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                    'Content-Type': 'application/json'
                  },
                  data : {
                    request : JSON.stringify(requests),
                    data: JSON.stringify(dataObject)
                  }
                };
                
                let response = await axios(config)
                ack.statusCode=response.status;

                j++;
              }

              const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
              });
        
              Ack.save();
            }
            else
            {
              //DO Nothing
            }
        }
    }
    catch(err){
  
        if(syncAck[0] != undefined)
        {
          const update={
            timestamp:new Date(),
            plantId:ack.plantId,
            deviceType:ack.deviceType,
            foreignId:ack.foreignId,
            statusCode:ack.statusCode,
            timestampData:ack.timestampData
          };
          
          if(update.statusCode == undefined)
            update.statusCode= 500;
    
          await SyncAck.updateOne({_id:syncAck[0]._id},update);
        }
        else
        {
            const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
            });
      
            if(Ack.statusCode == undefined)
                Ack.statusCode= 500;
        
            Ack.save();
        }
        console.log(err);
        return err;
    }
}

const syncWeatherStation = async (plantProfile) =>{
   
    let deviceType = 'weatherStation';
    let syncAck = await syncAcknowledgement(plantProfile, deviceType);
    let ack = {};

    try{
        if(syncAck[0] != undefined)
        {
          let query;

          if(syncAck[0].statusCode == 201)
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gt":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }
          else
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gte":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }

          const data = await WeatherStation.aggregate(query);

          if(typeof data[0] != 'undefined')
          {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                  let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                  }

                  let dataObject =  data[j];

                  ack.timestamp=new Date();
                  ack.plantId=data[j].plantId;
                  ack.deviceType=deviceType;
                  ack.foreignId=data[j]._id;
                  ack.timestampData = data[j].timestamp;

                  let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                      'Content-Type': 'application/json'
                  },
                  data : {
                      request : JSON.stringify(requests),
                      data: JSON.stringify(dataObject)
                  }
                  };
                  
                  let response = await axios(config)
                  ack.statusCode=response.status;

                  j++;
              }

              const update={
                  timestamp:new Date(),
                  plantId:ack.plantId,
                  deviceType:ack.deviceType,
                  foreignId:ack.foreignId,
                  statusCode:ack.statusCode,
                  timestampData:ack.timestampData
              };
              
              await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
            else
            {
                const update={
                    timestamp:new Date(),
                    plantId:syncAck[0].plantId,
                    deviceType:syncAck[0].deviceType,
                    foreignId:syncAck[0].foreignId,
                    statusCode:syncAck[0].statusCode,
                    timestampData:syncAck[0].timestampData
                };
            
            await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
        }
        else
        {
            const data = await WeatherStation.aggregate([
              {
                '$match':{
                  'plantId':plantProfile.plantId
                }
              }, {
                '$sort': {
                  'timestamp': 1
                }
              }, {
                '$limit': LIMIT
              }
            ]);

            if(typeof data[0] != 'undefined')
            {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                }

                let dataObject =  data[j];

                ack.timestamp=new Date();
                ack.plantId=data[j].plantId;
                ack.deviceType=deviceType;
                ack.foreignId=data[j]._id;
                ack.timestampData = data[j].timestamp;

                let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                    'Content-Type': 'application/json'
                  },
                  data : {
                    request : JSON.stringify(requests),
                    data: JSON.stringify(dataObject)
                  }
                };
                
                let response = await axios(config)
                ack.statusCode=response.status;

                j++;
              }

              const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
              });
        
              Ack.save();
            }
            else
            {
              //DO Nothing
            }
        }
    }
    catch(err){
  
        if(syncAck[0] != undefined)
        {
          const update={
            timestamp:new Date(),
            plantId:ack.plantId,
            deviceType:ack.deviceType,
            foreignId:ack.foreignId,
            statusCode:ack.statusCode,
            timestampData:ack.timestampData
          };
          
          if(update.statusCode == undefined)
            update.statusCode= 500;
    
          await SyncAck.updateOne({_id:syncAck[0]._id},update);
        }
        else
        {
            const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
            });
      
            if(Ack.statusCode == undefined)
                Ack.statusCode= 500;
        
            Ack.save();
        }
        console.log(err);
        return err;
    }
}

const syncMeter = async (plantProfile) =>{
    
    let deviceType = 'meter';
    let syncAck = await syncAcknowledgement(plantProfile, deviceType);
    let ack = {};

    try{
        if(syncAck[0] != undefined)
        {
          let query;

          if(syncAck[0].statusCode == 201)
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gt":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }
          else
          {
            query = [{
              '$match':{
                'plantId':plantProfile.plantId,
                '_id':{"$gte":syncAck[0].foreignId}
                }
              }, {
                  '$sort': {
                  'timestamp': 1
                  }
              }, {
                  '$limit': LIMIT
            }];
          }

          const data = await Meter.aggregate(query);

          if(typeof data[0] != 'undefined')
          {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                  let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                  }

                  let dataObject =  data[j];

                  ack.timestamp=new Date();
                  ack.plantId=data[j].plantId;
                  ack.deviceType=deviceType;
                  ack.foreignId=data[j]._id;
                  ack.timestampData = data[j].timestamp;

                  let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                      'Content-Type': 'application/json'
                  },
                  data : {
                      request : JSON.stringify(requests),
                      data: JSON.stringify(dataObject)
                  }
                  };
                  
                  let response = await axios(config)
                  ack.statusCode=response.status;

                  j++;
                }

                const update={
                  timestamp:new Date(),
                  plantId:ack.plantId,
                  deviceType:ack.deviceType,
                  foreignId:ack.foreignId,
                  statusCode:ack.statusCode,
                  timestampData:ack.timestampData
                };
                
                await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
            else
            {
                const update={
                    timestamp:new Date(),
                    plantId:syncAck[0].plantId,
                    deviceType:syncAck[0].deviceType,
                    foreignId:syncAck[0].foreignId,
                    statusCode:syncAck[0].statusCode,
                    timestampData:syncAck[0].timestampData
                };
            
            await SyncAck.updateOne({_id:syncAck[0]._id},update);
            }
        }
        else
        {
            const data = await Meter.aggregate([
              {
                '$match':{
                  'plantId':plantProfile.plantId
                }
              }, {
                '$sort': {
                  'timestamp': 1
                }
              }, {
                '$limit': LIMIT
              }
            ]);

            if(typeof data[0] != 'undefined')
            {
              //Initialize for Loop
              let j = 0; 

              while(j<data.length)
              {
                let requests = {
                  timestamp: data[j].timestamp,
                  loggerNo: data[j].loggerNo,
                  plantId: data[j].plantId,
                  deviceType: data[j].deviceType,
                  deviceNo: data[j].deviceNo,
                  errorFlag: data[j].errorFlag
                }

                let dataObject =  data[j];

                ack.timestamp=new Date();
                ack.plantId=data[j].plantId;
                ack.deviceType=deviceType;
                ack.foreignId=data[j]._id;
                ack.timestampData = data[j].timestamp;

                let config = {
                  method: 'post',
                  url: URL,
                  timeout: timeout,
                  headers: { 
                    'Content-Type': 'application/json'
                  },
                  data : {
                    request : JSON.stringify(requests),
                    data: JSON.stringify(dataObject)
                  }
                };
                
                let response = await axios(config)
                ack.statusCode=response.status;

                j++;
              }

              const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
              });
        
              Ack.save();
            }
            else
            {
              //DO Nothing
            }
        }
    }
    catch(err){
  
        if(syncAck[0] != undefined)
        {
          const update={
            timestamp:new Date(),
            plantId:ack.plantId,
            deviceType:ack.deviceType,
            foreignId:ack.foreignId,
            statusCode:ack.statusCode,
            timestampData:ack.timestampData
          };
          
          if(update.statusCode == undefined)
            update.statusCode= 500;
    
          await SyncAck.updateOne({_id:syncAck[0]._id},update);
        }
        else
        {
            const Ack = new SyncAck({
                timestamp:ack.timestamp,
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
            });
      
            if(Ack.statusCode == undefined)
                Ack.statusCode= 500;
        
            Ack.save();
        }
        //console.log(err);
        return err;
    }
}

const syncSCB = async (plantProfile) =>{
    
  let deviceType = 'SCB';
  let syncAck = await syncAcknowledgement(plantProfile, deviceType);
  let ack = {};

  try{
      if(syncAck[0] != undefined)
      {
        let query;

        if(syncAck[0].statusCode == 201)
        {
          query = [{
            '$match':{
              'plantId':plantProfile.plantId,
              '_id':{"$gt":syncAck[0].foreignId}
              }
            }, {
                '$sort': {
                'timestamp': 1
                }
            }, {
                '$limit': LIMIT
          }];
        }
        else
        {
          query = [{
            '$match':{
              'plantId':plantProfile.plantId,
              '_id':{"$gte":syncAck[0].foreignId}
              }
            }, {
                '$sort': {
                'timestamp': 1
                }
            }, {
                '$limit': LIMIT
          }];
        }

        const data = await SCB.aggregate(query);

        if(typeof data[0] != 'undefined')
        {
            //Initialize for Loop
            let j = 0; 

            while(j<data.length)
            {
                let requests = {
                timestamp: data[j].timestamp,
                loggerNo: data[j].loggerNo,
                plantId: data[j].plantId,
                deviceType: data[j].deviceType,
                deviceNo: data[j].deviceNo,
                errorFlag: data[j].errorFlag
                }

                let dataObject =  data[j];

                ack.timestamp=new Date();
                ack.plantId=data[j].plantId;
                ack.deviceType=deviceType;
                ack.foreignId=data[j]._id;
                ack.timestampData = data[j].timestamp;

                let config = {
                method: 'post',
                url: URL,
                timeout: timeout,
                headers: { 
                    'Content-Type': 'application/json'
                },
                data : {
                    request : JSON.stringify(requests),
                    data: JSON.stringify(dataObject)
                }
                };
                
                let response = await axios(config)
                ack.statusCode=response.status;

                j++;
              }

              const update={
                timestamp:new Date(),
                plantId:ack.plantId,
                deviceType:ack.deviceType,
                foreignId:ack.foreignId,
                statusCode:ack.statusCode,
                timestampData:ack.timestampData
              };
              
              await SyncAck.updateOne({_id:syncAck[0]._id},update);
          }
          else
          {
              const update={
                  timestamp:new Date(),
                  plantId:syncAck[0].plantId,
                  deviceType:syncAck[0].deviceType,
                  foreignId:syncAck[0].foreignId,
                  statusCode:syncAck[0].statusCode,
                  timestampData:syncAck[0].timestampData
              };
          
          await SyncAck.updateOne({_id:syncAck[0]._id},update);
          }
      }
      else
      {
          const data = await SCB.aggregate([
            {
              '$match':{
                'plantId':plantProfile.plantId
              }
            }, {
              '$sort': {
                'timestamp': 1
              }
            }, {
              '$limit': LIMIT
            }
          ]);

          if(typeof data[0] != 'undefined')
          {
            //Initialize for Loop
            let j = 0; 

            while(j<data.length)
            {
              let requests = {
                timestamp: data[j].timestamp,
                loggerNo: data[j].loggerNo,
                plantId: data[j].plantId,
                deviceType: data[j].deviceType,
                deviceNo: data[j].deviceNo,
                errorFlag: data[j].errorFlag
              }

              let dataObject =  data[j];

              ack.timestamp=new Date();
              ack.plantId=data[j].plantId;
              ack.deviceType=deviceType;
              ack.foreignId=data[j]._id;
              ack.timestampData = data[j].timestamp;

              let config = {
                method: 'post',
                url: URL,
                timeout: timeout,
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : {
                  request : JSON.stringify(requests),
                  data: JSON.stringify(dataObject)
                }
              };
              
              let response = await axios(config)
              ack.statusCode=response.status;

              j++;
            }

            const Ack = new SyncAck({
              timestamp:ack.timestamp,
              plantId:ack.plantId,
              deviceType:ack.deviceType,
              foreignId:ack.foreignId,
              statusCode:ack.statusCode,
              timestampData:ack.timestampData
            });
      
            Ack.save();
          }
          else
          {
            //DO Nothing
          }
      }
  }
  catch(err){

      if(syncAck[0] != undefined)
      {
        const update={
          timestamp:new Date(),
          plantId:ack.plantId,
          deviceType:ack.deviceType,
          foreignId:ack.foreignId,
          statusCode:ack.statusCode,
          timestampData:ack.timestampData
        };
        
        if(update.statusCode == undefined)
          update.statusCode= 500;
  
        await SyncAck.updateOne({_id:syncAck[0]._id},update);
      }
      else
      {
          const Ack = new SyncAck({
              timestamp:ack.timestamp,
              plantId:ack.plantId,
              deviceType:ack.deviceType,
              foreignId:ack.foreignId,
              statusCode:ack.statusCode,
              timestampData:ack.timestampData
          });
    
          if(Ack.statusCode == undefined)
              Ack.statusCode= 500;
      
          Ack.save();
      }
      //console.log(err);
      return err;
  }
}

exports.syncPlantData = async()=>{
  
    try{
  
        const plantProfiles = await PlantProfile.aggregate([
            {
            '$project': {
                '_id': 0, 
                'plantId': 1,
                'stringInverter': 1,
                'centralizedInverter':1,
                'weatherStation':1,
                'meter':1,
                'scb':1,
                'dieselGenerator':1,
                'zeroExport':1
            }
            }, {
            '$sort': {
                'plantId': 1
            }
            }
        ]);
    
        if(plantProfiles[0] != undefined)
        {
            for(const plantProfile of plantProfiles)
            {
                // if(plantProfile.plantId == 163)
                // {
                    if(typeof plantProfile.stringInverter != 'undefined')
                    {
                        if(plantProfile.stringInverter.isActive)
                        {
                            syncStringInverter(plantProfile);
                        }     
                    }
            
                    if(typeof plantProfile.centralizedInverter != 'undefined')
                    {
                        if(plantProfile.centralizedInverter.isActive)
                        { 
                            syncCentralizedInverter(plantProfile);
                        }
                    }
                
                    if(typeof plantProfile.weatherStation != 'undefined')
                    {
                        if(plantProfile.weatherStation.isActive)
                        { 
                            syncWeatherStation(plantProfile);
                        }
                    }
                
                    if(typeof plantProfile.meter != 'undefined')
                    {
                        if(plantProfile.meter.isActive)
                        { 
                            syncMeter(plantProfile);
                        }
                    }

                    if(typeof plantProfile.scb != 'undefined')
                    {
                        if(plantProfile.scb.isActive)
                        { 
                            syncSCB(plantProfile);
                        }
                    }
               // }
            }
        }
        else
        {
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }
    }
    catch(err){
        console.log(err);
        return err;
    }
}