const { SwitchGear } = require('../models/switchGear');
const { PlantProfile } = require('../models/plantProfile');

const dectobin16Bit=(...args)=>{
    let dectobin;
    dectobin =  (args[0] >>> 0).toString(2);
    dectobin = "0000000000000000".substr(dectobin.length)+ dectobin;
    dectobin = dectobin.split("");
    dectobin = dectobin.reverse();
    return dectobin;
};

const dectobin32Bit=(...args)=>{
    let dectobin;
    dectobin =  (args[0] >>> 0).toString(2);
    dectobin = "00000000000000000000000000000000".substr(dectobin.length)+ dectobin;
    dectobin = dectobin.split("");
    dectobin = dectobin.reverse();
    return dectobin;
};

const bintodec=(...args)=>{
    return parseInt(args[0], 2).toString(10);
};

const parsing = async(request, deviceProfile, switchGear) =>{

    if(request.errorFlag == 0)
    {
        const dataLength = data.length;
        const parsedData = [];
        let parametersCount;

        switch(request.deviceType)
        {
            case 226:   //VCB
                
                for(let i=0,m=0; i<parametersCount;i++)
                {
                    parsedData[i]=Number(data[m]);
                    m++;
                }
                
            break;

            default:
                return "Conflict";
            break;
        }
    }
    else
    {

    }


    let Data = await SwitchGear.aggregate([
        {
        '$match': {
            'plantId': request.plantId, 
            'deviceNo': deviceProfile[0].switchGear[0].id
        }
        }, {
        '$sort': {
            'timestamp': -1
        }
        }, {
        '$limit': 1
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

    if(Data[0] != undefined)
    {
        
    }
};


exports.insertData = async(args,data)=>{

    try
    {
        //Initialize mongoose object for Database
        const request = {
            timestamp:new Date(args[5]),
            loggerNo: Number(args[0]),
            plantId: Number(args[1]),
            deviceType: Number(args[2]),
            deviceNo: Number(args[3]),
            errorFlag: Number(args[4]),
        };

        //Date Calculation For Previous Data
        // let d = new Date(Data.timestamp);
        // d.setHours(00);
        // d.setMinutes(00);
        // d.setSeconds(00);
        // d.setMilliseconds(01);
        // const GMTDate = new Date(d).toUTCString();

        if(request.deviceType == 226 || request.deviceType == 227 || request.deviceType == 228)  //VCB
        {
            let deviceProfile  =  await PlantProfile.aggregate([
                {
                '$match': {
                    'plantId': request.plantId
                }
                }, {
                '$project': {
                    'switchGear': {
                    '$filter': {
                        'input': '$switchGear.details', 
                        'as': 'switchGears', 
                        'cond': {
                        '$eq': [
                            '$$switchGears.breaker.id', request.deviceNo
                        ]
                        }
                    }
                    }, 
                    '_id': 0
                }
                }
            ])

            console.log(deviceProfile[0].switchGear[0]);

            if(deviceProfile[0].switchGear[0] != undefined)
            {
                
                let switchGear = await SwitchGear.aggregate([
                    {
                    '$match': {
                        'plantId': request.plantId, 
                        'deviceNo': deviceProfile[0].switchGear[0].id
                    }
                    }, {
                    '$sort': {
                        'timestamp': -1
                    }
                    }, {
                    '$limit': 1
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
            
                //console.log(switchGear[0]);
                if(switchGear[0] != undefined)
                {
                    let Difference_In_Time = (request.timestamp - switchGear[0].timestamp)/1000;
                    
                    //console.log(Difference_In_Time)
                    if(Difference_In_Time >= 60)
                    {
                        const Data = new SwitchGear({
                            timestamp:request.timestamp,
                            loggerNo:request.loggerNo,
                            plantId:request.plantId,
                            //deviceType:request.deviceType,
                            deviceNo:request.deviceNo,
                            //errorFlag:request.errorFlag,
                        });

                        if(switchGear[0].breakerOn != undefined)
                            Data.breakerOn = switchGear[0].breakerOn;
                        if(switchGear[0].breakerOff != undefined)
                            Data.breakerOff = switchGear[0].breakerOff;
                        if(switchGear[0].springCharge != undefined)
                            Data.springCharge = switchGear[0].springCharge;
                        if(switchGear[0].buchholzTrip != undefined)
                            Data.buchholzTrip = switchGear[0].buchholzTrip;
                        if(switchGear[0].buchholzAlarm != undefined)
                            Data.buchholzAlarm = switchGear[0].buchholzAlarm;
                        if(switchGear[0].WTITrip != undefined)
                            Data.WTITrip = switchGear[0].WTITrip;
                        if(switchGear[0].WTIAlarm != undefined)
                            Data.WTIAlarm = switchGear[0].WTIAlarm;
                        if(switchGear[0].WTI1 != undefined)
                            Data.WTI1 = switchGear[0].WTI1;
                        if(switchGear[0].WTI2 != undefined)
                            Data.WTI2 = switchGear[0].WTI2;
                        if(switchGear[0].MOGTrip != undefined)
                            Data.MOGTrip = switchGear[0].MOGTrip;
                        if(switchGear[0].MOGAlarm != undefined)
                            Data.MOGAlarm = switchGear[0].MOGAlarm;
                        if(switchGear[0].OTITrip != undefined)
                            Data.OTITrip = switchGear[0].OTITrip;
                        if(switchGear[0].OTIAlarm != undefined)
                            Data.OTIAlarm = switchGear[0].OTIAlarm;
                        if(switchGear[0].OTI != undefined)
                            Data.OTI = switchGear[0].OTI;
                        if(switchGear[0].lowOilLevelAlarm != undefined)
                            Data.lowOilLevelAlarm = switchGear[0].lowOilLevelAlarm;
                        if(switchGear[0].PRVTrip != undefined)
                            Data.PRVTrip = switchGear[0].PRVTrip;
                        if(switchGear[0].PRVAlarm != undefined)
                            Data.PRVAlarm = switchGear[0].PRVAlarm;
                        if(switchGear[0].OVTrip != undefined)
                            Data.OVTrip = switchGear[0].OVTrip;
                        if(switchGear[0].OCTrip != undefined)
                            Data.OCTrip = switchGear[0].OCTrip;
                        if(switchGear[0].EFTrip != undefined)
                            Data.EFTrip = switchGear[0].EFTrip;
                        
                        await Data.save();
                        console.log("Created");
                    }
                    else
                    {
                        console.log("Skip");
                    }  
                }
                else
                {
                    const Data = new SwitchGear({
                        timestamp:request.timestamp,
                        loggerNo:request.loggerNo,
                        plantId:request.plantId,
                        //deviceType:request.deviceType,
                        deviceNo:request.deviceNo,
                        //errorFlag:request.errorFlag,
                    });
                    await Data.save();
                }

              
            }
            else
            {
                throw new Error("SwitchGear Not Found, Please contact to Holmium Technologies!"); 
            }
        }



        //for device profile
        // switch(Data.deviceType){

        //     case 226:   //VCB
        //     case 227:   
        //     case 228:

        
                
        //     break;

        //     case 229:   //Annunciator
        //     case 230:   
        //     case 231:
                
        //     break;

        //     case 232:   //Earth Fault Relay
        //     case 233:   
        //     case 234:
                
        //     break;

        //     case 235:   //Analog/Trafo
        //     case 236:   
        //     case 237:
                
        //     break;
        // }
    }
    catch (err){err.message
        console.log(err)
        return err.message;
    //return "Conflict";
    } 
};