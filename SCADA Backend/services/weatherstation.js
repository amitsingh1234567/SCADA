const {WeatherStation} = require('../models/weatherstation'); 

//Various functions For Data Parseing
const IsNaN=(...args)=>{
    let parameter=args[0];
    if(isNaN(parameter))
    parameter=0;
    return parameter;
};

const unsigned16Bit=(...args)=>{
    return args[0]<<8|args[1];
};

//Weather station service
exports.weatherStation = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new WeatherStation({
        timestamp:args[5],
        loggerNo:args[0],
        plantId:args[1],
        deviceType:args[2],
        deviceNo:args[3],
        errorFlag:args[4],
    });

    //Date Calculation For CummulativeGTI
    // let year = Data.timestamp.getFullYear();
    // let month = Data.timestamp.getMonth()+1;
    // let date = Data.timestamp.getDate();
    // if (date < 10)
    // date = '0' + date;
    // if (month < 10)
    // month = '0' + month;
    // const tempDate = (year+'-' + month + '-'+date);

    let d = new Date(Data.timestamp);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(00);
    const GMTDate = new Date(d).toUTCString();

    //Variables for Query of previous WS request
    // const filter = {
    // 'plantId':Data.plantId, 
    // 'deviceNo':Data.deviceNo, 
    // 'timestamp': {
    // '$gte': tempDate}
    // };
    // const projection = 
    // 'timestamp GTI cumulativeGTI' 
    // ;
    // const sort = {
    // '_id': -1
    // };
    // const limit = 1;
    
    //Case For Various WS
    if(Data.errorFlag==0){

        const dataLength = data.length;
        const parsedData = [];
        let parametersCount;

        switch(Data.deviceType){

            case 101:  //Sivara WMS
                
                parametersCount=(data.length/2);

                if(dataLength<=12)      //Sivara 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                    
                    if(typeof parsedData[1] != 'undefined')
                    {
                        Data.moduleTemperature1=(IsNaN(parsedData[1])*0.1).toFixed(2);
                        if(Data.moduleTemperature1>=100)
                        Data.moduleTemperature1=0;
                    }

                    if(typeof parsedData[2] != 'undefined')
                    {
                        Data.ambientTemperature=(IsNaN(parsedData[2])*0.1).toFixed(2);
                        if(Data.ambientTemperature>=100)
                        Data.ambientTemperature=0;
                    }
                   
                    if(typeof parsedData[3] != 'undefined')
                        Data.windSpeed=(IsNaN(parsedData[3])*0.2778).toFixed(2);
                   
                    if(typeof parsedData[4] != 'undefined')
                        Data.windDirection=(IsNaN(parsedData[4])*1).toFixed(2);
                    
                    if(typeof parsedData[5] != 'undefined')
                        Data.relativeHumidity=(IsNaN(parsedData[5])*0.1).toFixed(2);

                }
                else{
                    return ("Conflict");
                }

            break;

            case 102:  //Sivara WMS (Pyranometer)
                
                parametersCount=1;

                if(dataLength==2)      //Sivara 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                }
                else{
                    return ("Conflict");
                }

            break;

            case 103:  //Sivara WMS  (Pyranometer, Module temp, Ambient Temp., Windspeed)
                
                parametersCount=4;

                if(dataLength == 8)      //Sivara 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                    
                    if(typeof parsedData[1] != 'undefined')
                    {
                        Data.ambientTemperature=(IsNaN(parsedData[1])*0.1).toFixed(2);
                        if(Data.ambientTemperature>=100)
                        Data.ambientTemperature=0;
                    }

                    if(typeof parsedData[2] != 'undefined')
                    {
                        Data.moduleTemperature1=(IsNaN(parsedData[2])*0.1).toFixed(2);
                        if(Data.moduleTemperature1>=100)
                        Data.moduleTemperature1=0;
                    }
                   
                    if(typeof parsedData[3] != 'undefined')
                        Data.windSpeed=(IsNaN(parsedData[3])*0.2778).toFixed(2);

                }
                else{
                    return ("Conflict");
                }

            break;

            case 104:  //Sivara WMS (Pyranometer, Module temp, Ambient Temp., WindSpeed, WindDirection)
                
                parametersCount=5;

                if(dataLength==10)      //Sivara 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                    
                    if(typeof parsedData[1] != 'undefined')
                    {
                        Data.ambientTemperature=(IsNaN(parsedData[1])*0.1).toFixed(2);
                        if(Data.ambientTemperature>=100)
                        Data.ambientTemperature=0;
                    }

                    if(typeof parsedData[2] != 'undefined')
                    {
                        Data.moduleTemperature1=(IsNaN(parsedData[2])*0.1).toFixed(2);
                        if(Data.moduleTemperature1>=100)
                        Data.moduleTemperature1=0;
                    }
                   
                    if(typeof parsedData[3] != 'undefined')
                        Data.windSpeed=(IsNaN(parsedData[3])*0.2778).toFixed(2);
                   
                    if(typeof parsedData[4] != 'undefined')
                        Data.windDirection=(IsNaN(parsedData[4])*1).toFixed(2);
                    

                }
                else{
                    return ("Conflict");
                }

            break;

            case 105:  //Sivara WMS (Pyranometer, Module temp, Ambient Temp., WindSpeed, WindDirection, Relative Humidity)
                
                parametersCount=6;

                if(dataLength==12)      //Sivara WMS 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                    
                    if(typeof parsedData[1] != 'undefined')
                    {
                        Data.moduleTemperature1=(IsNaN(parsedData[1])*0.1).toFixed(2);
                        if(Data.moduleTemperature1>=100)
                        Data.moduleTemperature1=0;
                    }

                    if(typeof parsedData[2] != 'undefined')
                    {
                        Data.ambientTemperature=(IsNaN(parsedData[2])*0.1).toFixed(2);
                        if(Data.ambientTemperature>=100)
                        Data.ambientTemperature=0;
                    }
                   
                    if(typeof parsedData[3] != 'undefined')
                        Data.windSpeed=(IsNaN(parsedData[3])*0.2778).toFixed(2);
                   
                    if(typeof parsedData[4] != 'undefined')
                        Data.windDirection=(IsNaN(parsedData[4])*1).toFixed(2);
                    
                    if(typeof parsedData[5] != 'undefined')
                        Data.relativeHumidity=(IsNaN(parsedData[5])*0.1).toFixed(2);

                }
                else if(dataLength==6)  //Sivara WMS 16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]=(data[m]);
                        m++;
                    }
            
                    if(typeof parsedData[0] != 'undefined')
                        Data.GTI1=IsNaN(parsedData[0]);
                    
                    if(typeof parsedData[1] != 'undefined')
                    {
                        Data.ambientTemperature=(IsNaN(parsedData[1])*0.1).toFixed(2);
                        if(Data.ambientTemperature>=100)
                        Data.ambientTemperature=0;
                    }

                    if(typeof parsedData[2] != 'undefined')
                    {
                        Data.moduleTemperature1=(IsNaN(parsedData[2])*0.1).toFixed(2);
                        if(Data.moduleTemperature1>=100)
                        Data.moduleTemperature1=0;
                    }
                   
                    if(typeof parsedData[3] != 'undefined')
                        Data.windSpeed=(IsNaN(parsedData[3])*0.2778).toFixed(2);
                   
                    if(typeof parsedData[4] != 'undefined')
                        Data.windDirection=(IsNaN(parsedData[4])*1).toFixed(2);
                    
                    if(typeof parsedData[5] != 'undefined')
                        Data.relativeHumidity=(IsNaN(parsedData[5])*0.1).toFixed(2);

                }
                else{
                    return ("Conflict");
                }

            break;

            case 106:  //Kipp & Zonan  16 Bit 
                
                parametersCount=1;

                if(dataLength<=1){

                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]= data[m];
                        m+=1;
                    }
                    
                    Data.GTI1=IsNaN(parsedData[0]);
                    if(Data.GTI1>=1500)
                    Data.GTI1=0;
                   
                }
                else{
                    return ("Conflict");
                }

            break;

            case 107:  //Weather Station Meerut Rishabh Construction

            parametersCount=10;

                if(dataLength<=10){

                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]= data[m];
                        m+=1;
                    }
                    
                    Data.GHI=(parsedData[0]*0.1).toFixed(2);
                    if(Data.GHI>=1500)
                        Data.GHI=0;
					Data.GTI1=(parsedData[1]*0.1).toFixed(2);
                    if(Data.GTI1>=1500)
                        Data.GTI1=0;
                    Data.moduleTemperature1=(parsedData[6]*0.1).toFixed(2);
                    Data.moduleTemperature2=(parsedData[7]*0.1).toFixed(2);
                    Data.moduleTemperature3=(parsedData[8]*0.1).toFixed(2);
                    Data.moduleTemperature4=(parsedData[9]*0.1).toFixed(2);
                    Data.windSpeed=(parsedData[2]*0.1).toFixed(2);
                    Data.windDirection=(parsedData[3]*0.1).toFixed(2);
                    Data.ambientTemperature=(parsedData[4]*0.1).toFixed(2);
                    Data.relativeHumidity=(parsedData[5]*0.1).toFixed(2);
                   
                }
                else{
                    return ("Conflict");
                }

            break;

            case 108:  //Weather Station Kanchrapara West Bangal

            parametersCount=10;

                if(dataLength<=10){

                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]= data[m];
                        m+=1;
                    }
                    
                    Data.GHI=(parsedData[6]*1).toFixed(2);
                    if(Data.GHI>=1500)
                        Data.GHI=0;
					Data.GTI1=(parsedData[7]*1).toFixed(2);
                    if(Data.GTI1>=1500)
                        Data.GTI1=0;
                    Data.moduleTemperature1=(parsedData[0]*0.1).toFixed(2);
                    Data.moduleTemperature2=(parsedData[1]*0.1).toFixed(2);
                    Data.moduleTemperature3=(parsedData[2]*0.1).toFixed(2);
                    Data.moduleTemperature4=(parsedData[3]*0.1).toFixed(2);
                    Data.windSpeed=(parsedData[8]*0.1).toFixed(2);
                    Data.windDirection=(parsedData[9]*0.1).toFixed(2);
                    //Data.ambientTemperature=(parsedData[4]*0.1).toFixed(2);

                    //temp Solution
                    if(Data.moduleTemperature1 <= 25)
                        Data.ambientTemperature= Number(Data.moduleTemperature1);
                    else
                        Data.ambientTemperature=(parsedData[4]*0.1).toFixed(2);

                    Data.relativeHumidity=(parsedData[5]*0.1).toFixed(2);
                   
                }
                else{
                    return ("Conflict");
                }

            break;

            case 109:  //Weather Station Vivaan Bareilly

                parametersCount=10;

                if(dataLength<=10){

                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]= data[m];
                        m+=1;
                    }
                    
                    let GHI=parsedData[0];
					Data.GTI1=(GHI/0.8206).toFixed(2);
                    if(Data.GTI1>=1500)
                    Data.GTI1=0;
                    Data.moduleTemperature1=(parsedData[1]*0.1).toFixed(2);
                    Data.moduleTemperature2=(parsedData[2]*0.1).toFixed(2);
                    Data.moduleTemperature3=(parsedData[3]*0.1).toFixed(2);
                    Data.moduleTemperature4=(parsedData[4]*0.1).toFixed(2);
                    Data.windSpeed=(parsedData[5]*0.1).toFixed(2);
                    Data.windDirection=(parsedData[6]*0.1).toFixed(2);
                    Data.ambientTemperature=(parsedData[7]*0.1).toFixed(2);
                    Data.relativeHumidity=(parsedData[8]*0.1).toFixed(2);
                    Data.rainGauge=(parsedData[9]*1);
                   
                }
                else{
                    return ("Conflict");
                }

            break;

            case 110:  //Weather Station Roorke Vivaan Solar

                parametersCount=11;

                if(dataLength<=11){

                    for(let i=0,m=0; i<parametersCount;i++){   
                        parsedData[i]= data[m];
                        m+=1;
                    }
                    
                    Data.GHI=(parsedData[0]*0.1).toFixed(2);
                    if(Data.GHI>=1500)
                        Data.GHI=0;
					Data.GTI1=(parsedData[1]*0.1).toFixed(2);
                    if(Data.GTI1>=1500)
                        Data.GTI1=0;
                    Data.windSpeed=(parsedData[2]*0.1).toFixed(2);
                    Data.windDirection=(parsedData[3]*0.1).toFixed(2);
                    Data.ambientTemperature=(parsedData[4]*0.1).toFixed(2);
                    Data.relativeHumidity=(parsedData[5]*0.1).toFixed(2);
                    Data.moduleTemperature1=(parsedData[6]*0.1).toFixed(2);
                    Data.moduleTemperature2=(parsedData[7]*0.1).toFixed(2);
                    Data.moduleTemperature3=(parsedData[8]*0.1).toFixed(2);
                    Data.moduleTemperature4=(parsedData[9]*0.1).toFixed(2);
                    Data.moduleTemperature5=(parsedData[10]*0.1).toFixed(2);
                   
                }
                else{
                    return ("Conflict");
                }

            break;

            // case 150:  //For Old Pinetech Configuration
                
            //     parametersCount=3;

            //     if(dataLength<=3){
                   
            //         Data.GTI1=IsNaN(data[0]);
            //         Data.moduleTemperature1=(IsNaN(data[1]));
            //         Data.ambientTemperature=(IsNaN(data[2]));
                   
            //     }
            //     else{
            //         return ("Conflict");
            //     }

            // break;
            
            default:
                return ("Conflict");
            break; 
        }

       //Previous data of WMS and CumulativeGTI Calculation and Save Data to Database
        try{
            // await WeatherStation.find(filter,projection,  async(err, preWSData)=>{
            //     if (typeof  preWSeWSData[0].GTI === 'undefined')
            //             Data.cumulativeGTI=((((( Data.GTI)/2)* timeDiff)/(3600*1000))+preWSData[0].cumulativeGTI).toFixed(4);
            //         elseData !== 'undefined' &&  preWSData.length > 0) {
            //         const timeDiff=(new Date(Data.timestamp)-new Date(preWSData[0].timestamp))/1000;
            //         if (typeof pr
            //             Data.cumulativeGTI=((((( Data.GTI+preWSData[0].GTI)/2)* timeDiff)/(3600*1000))+preWSData[0].cumulativeGTI).toFixed(4); 
            //      }else 
            //         Data.cumulativeGTI=0;
            //     await Data.save();
            // }).sort(sort).limit(limit);


            const lastRecord = await  WeatherStation.aggregate([
                {
                  '$match': {
                    'plantId': Data.plantId, 
                    'deviceNo': Data.deviceNo, 
                    'timestamp': {
                      '$gte': new Date(GMTDate)
                    }
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$limit': 1
                }
              ]);

              if(typeof  lastRecord[0] != 'undefined')
              {
                const duration=(new Date(Data.timestamp)-new Date(lastRecord[0].timestamp))/1000;

                if(duration>0)
                {
                    if(typeof Data.GHI != 'undefined')
                    {
                        if (typeof lastRecord[0].GHI !== 'undefined' && typeof lastRecord[0].cumulativeGHI !== 'undefined')
                            Data.cumulativeGHI=((((( Data.GHI+lastRecord[0].GHI)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGHI).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGHI !== 'undefined')
                            Data.cumulativeGHI=((((( Data.GHI)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGHI).toFixed(4);
                        else
                            Data.cumulativeGHI=((((( Data.GHI)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGHI !== 'undefined')
                            Data.cumulativeGHI=lastRecord[0].cumulativeGHI.toFixed(4);
                    }
                    
                    if(typeof Data.GTI1 != 'undefined') 
                    {
                        if (typeof lastRecord[0].GTI1 != 'undefined' && typeof lastRecord[0].cumulativeGTI1 != 'undefined')
                            Data.cumulativeGTI1=((((( Data.GTI1+lastRecord[0].GTI1)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI1).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGTI1 != 'undefined')
                            Data.cumulativeGTI1=((((( Data.GTI1)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI1).toFixed(4);
                        else
                            Data.cumulativeGTI1=((((( Data.GTI1)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI1 !== 'undefined')
                            Data.cumulativeGTI1=lastRecord[0].cumulativeGTI1.toFixed(4);
                    }

                    if(typeof Data.GTI2 != 'undefined') 
                    {
                        if (typeof lastRecord[0].GTI2 != 'undefined' && typeof lastRecord[0].cumulativeGTI2 != 'undefined')
                            Data.cumulativeGTI2=((((( Data.GTI2+lastRecord[0].GTI2)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI2).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGTI2 != 'undefined')
                            Data.cumulativeGTI2=((((( Data.GTI2)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI2).toFixed(4);
                        else
                            Data.cumulativeGTI2=((((( Data.GTI2)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI2 !== 'undefined')
                            Data.cumulativeGTI2=lastRecord[0].cumulativeGTI2.toFixed(4);
                    }

                    if(typeof Data.GTI3 != 'undefined') 
                    {
                        if (typeof lastRecord[0].GTI3 != 'undefined' && typeof lastRecord[0].cumulativeGTI3 != 'undefined')
                            Data.cumulativeGTI3=((((( Data.GTI3+lastRecord[0].GTI3)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI3).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGTI3 != 'undefined')
                            Data.cumulativeGTI3=((((( Data.GTI3)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI3).toFixed(4);
                        else
                            Data.cumulativeGTI3=((((( Data.GTI3)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI3 !== 'undefined')
                            Data.cumulativeGTI3=lastRecord[0].cumulativeGTI3.toFixed(4);
                    }

                    if(typeof Data.GTI4 != 'undefined') 
                    {
                        if (typeof lastRecord[0].GTI4 != 'undefined' && typeof lastRecord[0].cumulativeGTI4 != 'undefined')
                            Data.cumulativeGTI4=((((( Data.GTI4+lastRecord[0].GTI4)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI4).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGTI4 != 'undefined')
                            Data.cumulativeGTI4=((((( Data.GTI4)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI4).toFixed(4);
                        else
                            Data.cumulativeGTI4=((((( Data.GTI4)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI4 !== 'undefined')
                            Data.cumulativeGTI4=lastRecord[0].cumulativeGTI4.toFixed(4);
                    }

                    if(typeof Data.GTI5 != 'undefined') 
                    {
                        if (typeof lastRecord[0].GTI5 != 'undefined' && typeof lastRecord[0].cumulativeGTI5 != 'undefined')
                            Data.cumulativeGTI5=((((( Data.GTI5+lastRecord[0].GTI5)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI5).toFixed(4);
                        else if (typeof lastRecord[0].cumulativeGTI5 != 'undefined')
                            Data.cumulativeGTI5=((((( Data.GTI5)/2)* duration)/(3600*1000))+lastRecord[0].cumulativeGTI5).toFixed(4);
                        else
                            Data.cumulativeGTI5=((((( Data.GTI5)/2)* duration)/(3600*1000))).toFixed(4);
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI5 !== 'undefined')
                            Data.cumulativeGTI5=lastRecord[0].cumulativeGTI5.toFixed(4);
                    }
                    await Data.save();
                }
              }
              else
              {
                await Data.save();
              }
             
            return ("OK");
        }
        catch (err){
            console.log(err)
            err.message
            return (err.message);
             //return ("Conflict");
        } 
    }
    else{

        //Previous data of WMS and CumulativeGTI Calculation and Save Data to Database
        try{
            // await WeatherStation.find(filter,projection, async(err, preWSData)=>{
            //     if (typeof  preWSData !== 'undefined' &&  preWSData.length > 0) {
            //         const timeDiff=(new Date(Data.timestamp)-new Date(preWSData[0].timestamp))/1000;
            //         if (typeof preWSData[0].GTI === 'undefined')
            //             Data.cumulativeGTI=(preWSData[0].cumulativeGTI).toFixed(4);
            //         else
            //             Data.cumulativeGTI=((((preWSData[0].GTI/2)* timeDiff)/(3600*1000))+preWSData[0].cumulativeGTI).toFixed(4);
            //     }else
            //       Data.cumulativeGTI=0;
            //     await Data.save();
            // }).sort(sort).limit(limit);

            const lastRecord = await  WeatherStation.aggregate([
                {
                  '$match': {
                    'plantId': Data.plantId, 
                    'deviceNo': Data.deviceNo, 
                    'timestamp': {
                      '$gte': new Date(GMTDate)
                    }
                  }
                }, {
                  '$sort': {
                    'timestamp': -1
                  }
                }, {
                  '$limit': 1
                }
              ]);

              if(typeof  lastRecord[0] != 'undefined')
              {
                const duration=(new Date(Data.timestamp)-new Date(lastRecord[0].timestamp))/1000;
               
                if(duration>0)
                {
                    if(typeof lastRecord[0].GHI !== 'undefined')
                    {
                        if (typeof lastRecord[0].cumulativeGHI !== 'undefined')
                            Data.cumulativeGHI=lastRecord[0].cumulativeGHI.toFixed(4);
                        else
                            Data.cumulativeGHI=0;
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGHI !== 'undefined')
                            Data.cumulativeGHI=lastRecord[0].cumulativeGHI.toFixed(4);
                    }
                    
                    if(typeof lastRecord[0].GTI1 != 'undefined') 
                    {
                        if (typeof lastRecord[0].cumulativeGTI1 != 'undefined')
                            Data.cumulativeGTI1=lastRecord[0].cumulativeGTI1.toFixed(4);
                        else
                            Data.cumulativeGTI1=0;
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI1 !== 'undefined')
                            Data.cumulativeGTI1=lastRecord[0].cumulativeGTI1.toFixed(4);
                    }
                
                    if(typeof lastRecord[0].GTI2 != 'undefined') 
                    {
                        if (typeof lastRecord[0].cumulativeGTI2 != 'undefined')
                            Data.cumulativeGTI2=lastRecord[0].cumulativeGTI2.toFixed(4);
                        else
                            Data.cumulativeGTI2=0;
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI2 !== 'undefined')
                            Data.cumulativeGTI2=lastRecord[0].cumulativeGTI2.toFixed(4);
                    }


                    if(typeof lastRecord[0].GTI3 != 'undefined') 
                    {
                        if (typeof lastRecord[0].cumulativeGTI3 != 'undefined')
                            Data.cumulativeGTI3=lastRecord[0].cumulativeGTI3.toFixed(4);
                        else
                            Data.cumulativeGTI3=0;
                    }

                    if(typeof lastRecord[0].GTI4 != 'undefined') 
                    {
                        if (typeof lastRecord[0].cumulativeGTI4 != 'undefined')
                            Data.cumulativeGTI4=lastRecord[0].cumulativeGTI4.toFixed(4);
                        else
                            Data.cumulativeGTI4=0;
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI4 !== 'undefined')
                            Data.cumulativeGTI4=lastRecord[0].cumulativeGTI4.toFixed(4);
                    }

                    if(typeof lastRecord[0].GTI5 != 'undefined') 
                    {
                        if (typeof lastRecord[0].cumulativeGTI5 != 'undefined')
                            Data.cumulativeGTI5=lastRecord[0].cumulativeGTI5.toFixed(4);
                        else
                            Data.cumulativeGTI5=0;
                    }
                    else
                    {
                        if (typeof lastRecord[0].cumulativeGTI5 !== 'undefined')
                            Data.cumulativeGTI5=lastRecord[0].cumulativeGTI5.toFixed(4);
                    }
                   
                    await Data.save();
                }
              }
              else
              {
                await Data.save();
              }
           
            return("OK");
        }
        catch (err){err.message
            return (err.message);
            //return ("Conflict");
        } 
    }
};

//Weather station sync service
exports.syncWeatherStation = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new WeatherStation({
        timestamp:data.timestamp,
        loggerNo:data.loggerNo,
        plantId:data.plantId,
        deviceType:data.deviceType,
        deviceNo:data.deviceNo,
        errorFlag:data.errorFlag,

        GTI1:data.GTI1,
        GTI2:data.GTI2,
        GTI3:data.GTI3,
        GTI4:data.GTI4,
        GTI5:data.GTI5,
        GHI:data.GHI,
        cumulativeGTI1:data.cumulativeGTI1,
        cumulativeGTI2:data.cumulativeGTI2,
        cumulativeGTI3:data.cumulativeGTI3,
        cumulativeGTI4:data.cumulativeGTI4,
        cumulativeGTI5:data.cumulativeGTI5,
        cumulativeGHI:data.cumulativeGHI,
        moduleTemperature1:data.moduleTemperature1,
        moduleTemperature2:data.moduleTemperature2,
        moduleTemperature3:data.moduleTemperature3,
        moduleTemperature4:data.moduleTemperature4,
        moduleTemperature5:data.moduleTemperature5,
        ambientTemperature:data.ambientTemperature,
        windSpeed:data.windSpeed,
        windDirection:data.windDirection,
        relativeHumidity:data.relativeHumidity
    });

    // //Date Calculation For CummulativeGTI
    // let year = Data.timestamp.getFullYear();
    // let month = Data.timestamp.getMonth()+1;
    // let date = Data.timestamp.getDate();
    // if (date < 10)
    // date = '0' + date;
    // if (month < 10)
    // month = '0' + month;
    // const tempDate = (year+'-' + month + '-'+date);
    
    //Save Data to Database
    try{
        await Data.save();
        return ("OK");
    }
    catch (err){
        err.message
        return (err.message);
            //return ("Conflict");
    } 
};
