const {SCB} = require('../models/scb'); 
const { PlantProfile } = require('../models/plantProfile');

//Various functions For Data Parseing
const unsigned16Bit_8Bit=(...args)=>{
    return args[0]<<8|args[1];
};

const unsigned32Bit_8Bit=(...args)=>{
    return (args[2]<<8|args[3])<<16|(args[0]<<8|args[1]);
};

const unsigned32Bit_16Bit=(...args)=>{
    return (args[1]<<16|args[0])
};

const reverseUnsigned32Bit_16Bit=(...args)=>{
    return (args[0]<<16|args[1])
};

const reverseUnsigned32Bit_8Bit=(...args)=>{
    return (args[0]<<8|args[1])<<16|(args[2]<<8|args[3]);  
};

const signed16Bit_8Bit=(...args)=>{
    let bin16bit;
    let joinArray;
    let bin=[];
    let reverseArray=[];
   
    for(i in args){
    bin[i] =  (args[i] >>> 0).toString(2);
    bin[i] = "00000000".substr(bin[i].length) + bin[i];
    if (typeof bin16bit === "undefined")bin16bit =  bin[i];
    else bin16bit +=  bin[i];
    }
    
    if(bin16bit[0]==1){
        splitString = bin16bit.split("");
        for (i in  splitString)
        {
        reverseArray[i] = (splitString[i] == "1") ? "0" : "1";
        }
        joinArray = reverseArray.join("");
        bin16bit = (parseInt(joinArray, 2)+1)*(-1);
    }
    else{
        bin16bit = parseInt(bin16bit, 2);
    }
    return bin16bit;
};

const signed16Bit_16Bit=(...args)=>{
    let bin16bit;
    let joinArray;
    let bin=[];
    let reverseArray=[];
   
    for(i in args){
    bin[i] =  (args[i] >>> 0).toString(2);
    bin[i] = "0000000000000000".substr(bin[i].length) + bin[i];
    if (typeof bin16bit === "undefined")bin16bit =  bin[i];
    else bin16bit +=  bin[i];
    }
    
    if(bin16bit[0]==1){
        splitString = bin16bit.split("");
        for (i in  splitString)
        {
        reverseArray[i] = (splitString[i] == "1") ? "0" : "1";
        }
        joinArray = reverseArray.join("");
        bin16bit = (parseInt(joinArray, 2)+1)*(-1);
    }
    else{
        bin16bit = parseInt(bin16bit, 2);
    }
    return bin16bit;
};

const signed32Bit=(...args)=>{

    let bin32bit;
    let joinArray;
    let bin=[];
    let reverseArray=[];
   
    for(i in args){
    bin[i] =  (args[i] >>> 0).toString(2);
    bin[i] = "00000000".substr(bin[i].length) + bin[i];
    if (typeof bin32bit === "undefined")bin32bit =  bin[i];
    else bin32bit +=  bin[i];
    }
    
    if(bin32bit[0]==1){
        splitString = bin32bit.split("");
        for (i in  splitString)
        {
        reverseArray[i] = (splitString[i] == "1") ? "0" : "1";
        }
        joinArray = reverseArray.join("");
        bin32bit = (parseInt(joinArray, 2)+1)*(-1);
    }
    else{
        bin32bit = parseInt(bin32bit, 2);
    }
    return bin32bit;
};

const add=(...args)=>{
    let add=0;
    for(i in args){
        add += args[i];
        }
    return (Number(add)).toFixed(2);
};

const addString=(...args)=>{
    let addString='';
    for(i in args){
        addString += args[i];
        }
 return addString.replace(/,\s*$/, "");
};

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

exports.scb = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new SCB({
        timestamp:args[5],
        loggerNo:args[0],
        plantId:args[1],
        deviceType:args[2],
        deviceNo:args[3],
        errorFlag:args[4],
    });
  
    //Date Calculation For Previous Data
    let d = new Date(Data.timestamp);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDate = new Date(d).toUTCString();

    if(Data.errorFlag==0){
        
        const dataLength = data.length;
        const parsedData = [];
        let parametersCount;
       
        // const inverterProfile = await PlantProfile.aggregate([
        //     {
        //       '$match': {
        //         'plantId': Data.plantId, 
        //         'stringInverter.details.id': Data.deviceNo
        //       }
        //     }, {
        //       '$project': {
        //         'inverter': {
        //           '$filter': {
        //             'input': '$stringInverter.details', 
        //             'as': 'inverters', 
        //             'cond': {
        //               '$eq': [
        //                 '$$inverters.id', Data.deviceNo
        //               ]
        //             }
        //           }
        //         }, 
        //         '_id': 0
        //       }
        //     }
        // ]);

        // if(inverterProfile[0] == undefined){
        //     throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
        // }

        switch(Data.deviceType){

            case 202:   //Kernal Sistemi SCB 24 String
                parametersCount=29;

                if(dataLength==30)  //16 bit parsing
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<28){
                            parsedData[i]=(data[m]);
                            m++;
                        }
                        else if(i>=28 && i<29){
                            parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                   //Add data to mongoose object for Database
                   Data.currentString1=(parsedData[0]*0.001).toFixed(2);
                   Data.currentString2=(parsedData[1]*0.001).toFixed(2);
                   Data.currentString3=(parsedData[2]*0.001).toFixed(2);
                   Data.currentString4=(parsedData[3]*0.001).toFixed(2);
                   Data.currentString5=(parsedData[4]*0.001).toFixed(2);
                   Data.currentString6=(parsedData[5]*0.001).toFixed(2);
                   Data.currentString7=(parsedData[6]*0.001).toFixed(2);
                   Data.currentString8=(parsedData[7]*0.001).toFixed(2);
                   Data.currentString9=(parsedData[8]*0.001).toFixed(2);
                   Data.currentString10=(parsedData[9]*0.001).toFixed(2);
                   Data.currentString11=(parsedData[10]*0.001).toFixed(2);
                   Data.currentString12=(parsedData[11]*0.001).toFixed(2);
                   Data.currentString13=(parsedData[12]*0.001).toFixed(2);
                   Data.currentString14=(parsedData[13]*0.001).toFixed(2);
                   Data.currentString15=(parsedData[14]*0.001).toFixed(2);
                   Data.currentString16=(parsedData[15]*0.001).toFixed(2);
                   Data.currentString17=(parsedData[16]*0.001).toFixed(2);
                   Data.currentString18=(parsedData[17]*0.001).toFixed(2);
                   Data.currentString19=(parsedData[18]*0.001).toFixed(2);
                   Data.currentString20=(parsedData[19]*0.001).toFixed(2);
                   Data.currentString21=(parsedData[20]*0.001).toFixed(2);
                   Data.currentString22=(parsedData[21]*0.001).toFixed(2);
                   Data.currentString23=(parsedData[22]*0.001).toFixed(2);
                   Data.currentString24=(parsedData[23]*0.001).toFixed(2);
				   Data.voltage=(parsedData[24]*1).toFixed(2);
                   Data.temperature=(parsedData[26]*1).toFixed(2);
                   //Data.temperature1=(parsedData[26]*1).toFixed(2);
                   Data.current=(parsedData[27]*0.1).toFixed(2);
                   Data.power=(parsedData[28]/1000).toFixed(2);

                }
                else{
                    return "Conflict";
                }

            break;

            case 204:   //Statcon SCB 24 String
                parametersCount=31;

                if(dataLength==31)  //16 bit parsing
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        parsedData[i]=signed16Bit_16Bit(data[m]);
                        m++;
                    }

                   //Add data to mongoose object for Database
                   Data.currentString1=(parsedData[0]*0.001).toFixed(2);
                   Data.currentString2=(parsedData[1]*0.001).toFixed(2);
                   Data.currentString3=(parsedData[2]*0.001).toFixed(2);
                   Data.currentString4=(parsedData[3]*0.001).toFixed(2);
                   Data.currentString5=(parsedData[4]*0.001).toFixed(2);
                   Data.currentString6=(parsedData[5]*0.001).toFixed(2);
                   Data.currentString7=(parsedData[6]*0.001).toFixed(2);
                   Data.currentString8=(parsedData[7]*0.001).toFixed(2);
                   Data.currentString9=(parsedData[8]*0.001).toFixed(2);
                   Data.currentString10=(parsedData[9]*0.001).toFixed(2);
                   Data.currentString11=(parsedData[10]*0.001).toFixed(2);
                   Data.currentString12=(parsedData[11]*0.001).toFixed(2);
                   Data.currentString13=(parsedData[12]*0.001).toFixed(2);
                   Data.currentString14=(parsedData[13]*0.001).toFixed(2);
                   Data.currentString15=(parsedData[14]*0.001).toFixed(2);
                   Data.currentString16=(parsedData[15]*0.001).toFixed(2);
                   Data.currentString17=(parsedData[16]*0.001).toFixed(2);
                   Data.currentString18=(parsedData[17]*0.001).toFixed(2);
                   Data.currentString19=(parsedData[18]*0.001).toFixed(2);
                   Data.currentString20=(parsedData[19]*0.001).toFixed(2);
                   Data.currentString21=(parsedData[20]*0.001).toFixed(2);
                   Data.currentString22=(parsedData[21]*0.001).toFixed(2);
                   Data.currentString23=(parsedData[22]*0.001).toFixed(2);
                   Data.currentString24=(parsedData[23]*0.001).toFixed(2);
                   Data.temperature=(parsedData[24]*0.1).toFixed(2);
				   Data.voltage=(parsedData[26]*1).toFixed(2);
                   Data.current=(parsedData[27]*0.1).toFixed(2);
                   Data.power=(parsedData[30]/1000).toFixed(2);

                }
                else{
                    return "Conflict";
                }

            break;

            case 205:   //Trinity Touch SCB 24 String
                parametersCount=31;

                if(dataLength==32)  //16 bit parsing
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<30){
                            parsedData[i]=(data[m]);
                            m++;
                        }
                        else if(i>=30 && i<31){
                            parsedData[i]=reverseUnsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                   //Add data to mongoose object for Database
                   Data.currentString1=(parsedData[1]*0.001).toFixed(2);
                   Data.currentString2=(parsedData[2]*0.001).toFixed(2);
                   Data.currentString3=(parsedData[3]*0.001).toFixed(2);
                   Data.currentString4=(parsedData[4]*0.001).toFixed(2);
                   Data.currentString5=(parsedData[5]*0.001).toFixed(2);
                   Data.currentString6=(parsedData[6]*0.001).toFixed(2);
                   Data.currentString7=(parsedData[7]*0.001).toFixed(2);
                   Data.currentString8=(parsedData[8]*0.001).toFixed(2);
                   Data.currentString9=(parsedData[9]*0.001).toFixed(2);
                   Data.currentString10=(parsedData[10]*0.001).toFixed(2);
                   Data.currentString11=(parsedData[11]*0.001).toFixed(2);
                   Data.currentString12=(parsedData[12]*0.001).toFixed(2);
                   Data.currentString13=(parsedData[13]*0.001).toFixed(2);
                   Data.currentString14=(parsedData[14]*0.001).toFixed(2);
                   Data.currentString15=(parsedData[15]*0.001).toFixed(2);
                   Data.currentString16=(parsedData[16]*0.001).toFixed(2);
                   Data.currentString17=(parsedData[17]*0.001).toFixed(2);
                   Data.currentString18=(parsedData[18]*0.001).toFixed(2);
                   Data.currentString19=(parsedData[19]*0.001).toFixed(2);
                   Data.currentString20=(parsedData[20]*0.001).toFixed(2);
                   Data.currentString21=(parsedData[21]*0.001).toFixed(2);
                   Data.currentString22=(parsedData[22]*0.001).toFixed(2);
                   Data.currentString23=(parsedData[23]*0.001).toFixed(2);
                   Data.currentString24=(parsedData[24]*0.001).toFixed(2);
				   Data.voltage=(parsedData[25]*1).toFixed(2);
                   Data.temperature=(parsedData[26]*1).toFixed(2);
                   Data.temperature1=(parsedData[27]*1).toFixed(2);
                   Data.temperature2=(parsedData[28]*1).toFixed(2);
                   Data.current=(parsedData[29]*1).toFixed(2);
                   Data.power=(parsedData[30]/1000).toFixed(2);

                   if(Data.temperature1 == 90)
                    Data.temperature1=0;
                   if(Data.temperature2 == 90)
                    Data.temperature2=0;
                }
                else{
                    return "Conflict";
                }

            break;

            default:
                 return "Conflict";
            break; 
        }

        try{
            await Data.save();
            return "OK";
        }
        catch (err){err.message
            return err.message;
           //return "Conflict";
        } 
    }
    else{

        try{
            await Data.save();
            return "OK";
        }
        catch (err){err.message
            return err.message;
            //return "Conflict";
        } 
    }
};