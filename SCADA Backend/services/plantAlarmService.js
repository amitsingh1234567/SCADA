const { Alarm } = require('../models/alarm');
const { PlantProfile } = require('../models/plantProfile');
const { RawData } = require('../models/raw');
const { SCB } = require('../models/scb');
const { StringInverter } = require('../models/stringinverter');
const { CentralizedInverter } = require('../models/centralizedinverter');
const { WeatherStation } = require('../models/weatherstation');
const { Meter } = require('../models/meter');
const { PlantAnalysis } = require('../models/plantanalysis');
let timeout = 300;

const alarmCreate = async(plantId, device, deviceType, operatingState, alarmRecordData, alarmDeviceData)=>{
  
  let deviceNo = device.id;
  let deviceName = device.name;
  let building;
  let timestamp;
  let from;

  if(device.building != undefined)
    building = device.building;
  else
    building = '';

  
  if(alarmDeviceData != undefined)
  {
    if(alarmDeviceData.timestamp != undefined)
    {
      timestamp = alarmDeviceData.timestamp;
      from = alarmDeviceData.timestamp;
    }
    else
    {
      timestamp = new Date();
      from = new Date();
    }
  }
  else
  {
    timestamp = new Date();
    from = new Date();
  }

  let alarm = new Alarm();

  if(deviceType == 'stringInverter' || deviceType == 'centralizedInverter')
  {
    alarm.timestamp = timestamp;
    alarm.plantId= plantId;
    alarm.deviceNo= deviceNo;
    alarm.deviceType= deviceType;
    alarm.deviceName= building+' '+deviceName;
    alarm.status='Open';
    alarm.operatingState= operatingState;
    alarm.from= from;
    alarm.acknowledgement= false;

    if(alarmDeviceData != undefined)
    {
      if(alarmDeviceData.warning != undefined && alarmDeviceData.warning != "")
        alarm.warning = alarmDeviceData.warning;

      if(alarmDeviceData.error != undefined && alarmDeviceData.error != "")
        alarm.error = alarmDeviceData.error;

      if(alarmDeviceData.fault != undefined && alarmDeviceData.fault != "")
        alarm.fault = alarmDeviceData.fault;
    }
  }
  else
  {
    alarm.timestamp = timestamp;
    alarm.plantId= plantId;
    alarm.deviceNo= deviceNo;
    alarm.deviceType= deviceType;
    alarm.deviceName= building+' '+deviceName;
    alarm.status='Open';
    alarm.operatingState= operatingState;
    alarm.from= from;
    alarm.acknowledgement= false;
  }

  // const alarm = new Alarm({
  //   timestamp: timestamp,
  //   plantId: plantId,
  //   deviceNo: deviceNo,
  //   deviceType: deviceType,
  //   deviceName: building+' '+deviceName,
  //   status:'Open',
  //   operatingState: operatingState,
  //   from: from,
  //   acknowledgement: false
  // });

  alarm.priority = await alarmPriority(alarm.operatingState);

  let response = await alarm.save();
  console.log("Create");
};

const alarmUpdate = async(alarmRecordData)=>{

  let update={
    duration:alarmRecordData.duration
  };

  let response = await Alarm.updateOne({_id:alarmRecordData._id},update);
  console.log("Update");
};

const alarmClose = async(alarmRecordData, alarmDeviceData)=>{
  
  const close={
    status:"Closed",
    to:alarmDeviceData.timestamp,
    duration:alarmRecordData.duration,
    acknowledgement: true
  };

let response = await Alarm.updateOne({_id:alarmRecordData._id},close);
console.log("Closed");
};

const alarmSkip = async()=>{
  console.log("Skip");
};

const alarmPriority = async(deviceStatus) =>{

  let priority;

  if(deviceStatus == 'Offline')
    priority = 7;
  else if (deviceStatus == 'No-Data')
    priority = 7;
  else if (deviceStatus == 'Fault')
    priority = 9;
  else
    priority = 7;

  return priority;
};

const alarmRecord = async(plantId, device, deviceType, timestamp) =>{
    
  try{
     
      let alarm =  await Alarm.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id, 
            'deviceType': deviceType, 
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$addFields': {
            'duration': {
              '$toInt': {
                '$divide': [
                  {
                    '$subtract': [
                      new Date(), '$from'
                    ]
                  }, 60000
                ]
              }
            }
          }
        }
      ]);

      return alarm;
  }
  catch(err){
      console.log(err)
      return err;
  }
};

const alarmDevice = async(plantId, device, deviceType, timestamp) =>{
    
  let alarm = [];

  try{

    if(deviceType == 'D_LOG')
    {
      alarm =  await RawData.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'loggerNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'loggerNo': 1, 
            'errorFlag': 1
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    else if(deviceType == 'stringInverter')
    {
      alarm = await StringInverter.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'plantId': 1, 
            'deviceNo': 1, 
            'errorFlag': 1, 
            'status': 1, 
            'warning': 1, 
            'error': 1, 
            'fault': 1
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    else if(deviceType == 'centralizedInverter')
    {
      alarm =  await CentralizedInverter.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'plantId': 1, 
            'deviceNo': 1, 
            'errorFlag': 1, 
            'status': 1, 
            'warning': 1, 
            'error': 1, 
            'fault': 1
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    else if(deviceType == 'weatherStation')
    {
      alarm =  await WeatherStation.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'plantId': 1, 
            'deviceNo': 1, 
            'errorFlag': 1, 
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    else if(deviceType == 'SCB')
    {
      alarm =  await SCB.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'plantId': 1, 
            'deviceNo': 1, 
            'errorFlag': 1, 
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    else if(deviceType == 'meter')
    {
      alarm =  await Meter.aggregate([
        {
          '$match': {
            'plantId': plantId, 
            'deviceNo': device.id,
            'timestamp': {
              '$lte': new Date(timestamp)
            }
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$limit': 1
        }, {
          '$project': {
            '_id': 0, 
            'timestamp': 1, 
            'plantId': 1, 
            'deviceNo': 1, 
            'errorFlag': 1, 
          }
        }, {
          '$addFields': {
            'period': {
              '$divide': [
                {
                  '$subtract': [
                    new Date(), '$timestamp'
                  ]
                }, 1000
              ]
            }
          }
        }
      ]);
    }
    // else if(deviceType == 'panelMeter')
    // {
    //   alarm =  await Meter.aggregate([
    //     {
    //       '$match': {
    //         'plantId': plantId, 
    //         'deviceNo': device.id,
    //         'timestamp': {
    //           '$lte': new Date(timestamp)
    //         }
    //       }
    //     }, {
    //       '$sort': {
    //         'timestamp': -1
    //       }
    //     }, {
    //       '$limit': 1
    //     }, {
    //       '$project': {
    //         '_id': 0, 
    //         'timestamp': 1, 
    //         'plantId': 1, 
    //         'deviceNo': 1, 
    //         'errorFlag': 1, 
    //       }
    //     }, {
    //       '$addFields': {
    //         'period': {
    //           '$divide': [
    //             {
    //               '$subtract': [
    //                 new Date(), '$timestamp'
    //               ]
    //             }, 1000
    //           ]
    //         }
    //       }
    //     }
    //   ]);
    // }
    // else if(deviceType == 'dieselGenerator')
    // {

    // }
    // else if(deviceType == 'zeroExport')
    // {

    // }
     
    return alarm;
  }
  catch(err){
      console.log(err)
      return err;
  }
};

const alarmsD_LOG = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'D_LOG';

  try{

    if(plantProfile.dataLogger != undefined)
    {
      if(plantProfile.dataLogger.isActive)
        devices = plantProfile.dataLogger.details
    };
     
    for(const device of devices)
    {
      let alarmRecordData = await alarmRecord(plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice(plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            else
              await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
          }
          else
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0],alarmDeviceData[0]);
            else
              await alarmSkip();
          }
          else
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0],alarmDeviceData[0]);
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0],alarmDeviceData[0]);
          else
            await alarmSkip();
        }
        else
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0],alarmDeviceData[0]);
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

const alarmsStringInverter = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'stringInverter';

  try{

    if(plantProfile.stringInverter != undefined)
    {
      if(plantProfile.stringInverter.isActive)
        devices = plantProfile.stringInverter.details
    };
     
    for(const device of devices)
    {
      
      let alarmRecordData = await alarmRecord( plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice( plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  if(alarmDeviceData[0].status == alarmRecordData[0].operatingState)
                  {
                    await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                  }
                  else
                  {
                    await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                    await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                  }
                }
                else
                {
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
              else
              {
                if(alarmRecordData[0].operatingState != 'No-Data')
                { 
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                  await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
                }
                else
                {
                  await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
            }
          }
          else
          {
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
          }
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                }
                else
                {
                  await alarmSkip();
                }
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
            }
          }
          else
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
          else
          {
            if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                }
                else
                {
                  await alarmSkip();
                }
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
          }
        }
        else
        {
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
        }
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

const alarmsCentralizedInverter = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'centralizedInverter';

  try{

    if(plantProfile.centralizedInverter != undefined)
    {
      if(plantProfile.centralizedInverter.isActive)
        devices = plantProfile.centralizedInverter.details
    };
     
    for(const device of devices)
    {
      
      let alarmRecordData = await alarmRecord( plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice( plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  if(alarmDeviceData[0].status == alarmRecordData[0].operatingState)
                  {
                    await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                  }
                  else
                  {
                    await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                    await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                  }
                }
                else
                {
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
              else
              {
                if(alarmRecordData[0].operatingState != 'No-Data')
                { 
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                  await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
                }
                else
                {
                  await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
            }
          }
          else
          {
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
          }
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                }
                else
                {
                  await alarmSkip();
                }
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
            }
          }
          else
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
          else
          {
            if(alarmDeviceData[0].errorFlag == 0)
              {
                if(alarmDeviceData[0].status != 'Running')
                {
                  await alarmCreate(plantId, device, deviceType, alarmDeviceData[0].status, alarmRecordData[0], alarmDeviceData[0]);
                }
                else
                {
                  await alarmSkip();
                }
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
          }
        }
        else
        {
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
        }
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

const alarmsWeatherStation = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'weatherStation';

  try{

    if(plantProfile.weatherStation != undefined)
    {
      if(plantProfile.weatherStation.isActive)
        devices = plantProfile.weatherStation.details
    };
     
    for(const device of devices)
    {
      
      let alarmRecordData = await alarmRecord( plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice( plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
              }
              else
              {
                if(alarmRecordData[0].operatingState != 'No-Data')
                { 
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                  await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
                }
                else
                {
                  await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
            }
          }
          else
          {
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
          }
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmSkip();
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
            }
          }
          else
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
          else
          {
            if(alarmDeviceData[0].errorFlag == 0)
            {
              await alarmSkip();
            }
            else
            {
              await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
            }
          }
        }
        else
        {
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
        }
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

const alarmsSCB = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'SCB';

  try{

    if(plantProfile.scb != undefined)
    {
      if(plantProfile.scb.isActive)
        devices = plantProfile.scb.details
    };
     
    for(const device of devices)
    {
      
      let alarmRecordData = await alarmRecord( plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice( plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
              }
              else
              {
                if(alarmRecordData[0].operatingState != 'No-Data')
                { 
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                  await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
                }
                else
                {
                  await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
            }
          }
          else
          {
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
          }
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmSkip();
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
            }
          }
          else
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
          else
          {
            if(alarmDeviceData[0].errorFlag == 0)
            {
              await alarmSkip();
            }
            else
            {
              await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
            }
          }
        }
        else
        {
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
        }
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

const alarmsMeter = async(plantProfile, timestamp)=>{
    
  let devices;
  let plantId = plantProfile.plantId;
  let deviceType = 'meter';

  try{

    if(plantProfile.meter != undefined)
    {
      if(plantProfile.meter.isActive)
        devices = plantProfile.meter.details
    };
     
    for(const device of devices)
    {
      
      let alarmRecordData = await alarmRecord( plantId, device, deviceType, timestamp);
      let alarmDeviceData = await alarmDevice( plantId, device, deviceType, timestamp);

      if(alarmRecordData[0] != undefined)
      {
        if(alarmRecordData[0].status == 'Open')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
              }
              else
              {
                if(alarmRecordData[0].operatingState != 'No-Data')
                { 
                  await alarmClose(alarmRecordData[0],alarmDeviceData[0]);
                  await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
                }
                else
                {
                  await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
                }
              }
            }
          }
          else
          {
            await alarmUpdate(alarmRecordData[0],alarmDeviceData[0]);
          }
        }
        else if(alarmRecordData[0].status == 'Closed')
        {
          if(alarmDeviceData[0] != undefined)
          {
            if(alarmDeviceData[0].period > timeout)
            {
              await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
            }
            else
            {
              if(alarmDeviceData[0].errorFlag == 0)
              {
                await alarmSkip();
              }
              else
              {
                await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
              }
            }
          }
          else
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
        }
      }
      else
      {
        if(alarmDeviceData[0] != undefined)
        {
          if(alarmDeviceData[0].period > timeout)
          {
            await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
          }
          else
          {
            if(alarmDeviceData[0].errorFlag == 0)
            {
              await alarmSkip();
            }
            else
            {
              await alarmCreate(plantId, device, deviceType, "No-Data", alarmRecordData[0],alarmDeviceData[0]);
            }
          }
        }
        else
        {
          await alarmCreate(plantId, device, deviceType, "Offline", alarmRecordData[0], alarmDeviceData[0]);
        }
      }
    }
  }
  catch(err){
      console.error(err);
  }   
};

exports.alarmService = async()=>{
  
  let now = new Date();

  try{
        
    const plantProfiles = await PlantProfile.aggregate([
        {
        '$project': {
            '_id': 0, 
            'plantId': 1,
            'plantName': 1,
            'plantCapacity': 1,
            "commissioningDate" : 1,
            'dataLogger':1,
            'scb':1,
            'stringInverter': 1,
            'centralizedInverter':1,
            'weatherStation':1,
            'meter':1
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
        // if(plantProfile.plantId == )
        // {
          if(typeof plantProfile.dataLogger != 'undefined')
          {
            if(plantProfile.dataLogger.isActive)
              alarmsD_LOG(plantProfile, now);     
          }

          if(typeof plantProfile.stringInverter != 'undefined')
          {
            if(plantProfile.stringInverter.isActive)
              alarmsStringInverter(plantProfile, now);     
          }

          if(typeof plantProfile.centralizedInverter != 'undefined')
          {
            if(plantProfile.centralizedInverter.isActive)
              alarmsCentralizedInverter(plantProfile, now);     
          }

          if(typeof plantProfile.weatherStation != 'undefined')
          {
            if(plantProfile.weatherStation.isActive)
              alarmsWeatherStation(plantProfile, now);     
          }

          if(typeof plantProfile.scb != 'undefined')
          {
            if(plantProfile.scb.isActive)
              alarmsSCB(plantProfile, now);     
          }

          if(typeof plantProfile.meter != 'undefined')
          {
            if(plantProfile.meter.isActive)
              alarmsMeter(plantProfile, now);     
          }
  
        //}
      }
    }
  }
  catch(err){
    console.log(err)
    return err;
  }
}