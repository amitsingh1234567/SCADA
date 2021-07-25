const {StringInverter} = require('../models/stringinverter'); 
const { PlantProfile } = require('../models/plantProfile');

//Various functions For Data Parseing
const unsigned16Bit=(...args)=>{
    return args[0]<<8|args[1];
};

const unsigned32Bit=(...args)=>{
    return (args[2]<<8|args[3])<<16|(args[0]<<8|args[1]);
};

const unsigned32Bit_16Bit=(...args)=>{
    return (args[1]<<16|args[0])
};

const reverseUnsigned32Bit_16Bit=(...args)=>{
    return (args[0]<<16|args[1])
};

const reverseUnsigned32Bit=(...args)=>{
    return (args[0]<<8|args[1])<<16|(args[2]<<8|args[3]);  
};

const signed16Bit=(...args)=>{
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

const signed16by16Bit=(...args)=>{
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

const signed32by16Bit=(...args)=>{

    let bin32bit;
    let joinArray;
    let bin=[];
    let reverseArray=[];
   
    for(i in args){
    bin[i] =  (args[i] >>> 0).toString(2);
    bin[i] = "0000000000000000".substr(bin[i].length) + bin[i];
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

const calculateEfficiency=(...args)=>{
    let efficiency;
    if(args[1]!=0){
        efficiency=(args[0]/args[1])*100;
        if(efficiency>99.8)
        efficiency=99.0;
    }else
        efficiency=0;
 return efficiency.toFixed(2);
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

const HexToFloat32 = (...args) => {

    for(i in args){
       args[i] = Number(args[i]).toString(16);
       if(args.length==4)
       args[i]="00".substr(args[i].length)+ args[i];
       else if(args.length==2)
       args[i]="0000".substr(args[i].length)+ args[i];
        }
       
    let str=''
    if(args.length==4)
    str = args[2]+args[3]+args[0]+args[1];
    else if(args.length==2)
    str = args[1]+args[0];

    let int = parseInt(str, 16);
    if (int > 0 || int < 0) {
        let sign = (int >>> 31) ? -1 : 1;
        let exp = (int >>> 23 & 0xff) - 127;
        let mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        let float32 = 0
        for (i = 0; i < mantissa.length; i += 1) { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
        return float32 * sign;
    } else return 0
}

//String inverter service
exports.stringInverter = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new StringInverter({
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
       
        const inverterProfile = await PlantProfile.aggregate([
            {
              '$match': {
                'plantId': Data.plantId, 
                'stringInverter.details.id': Data.deviceNo
              }
            }, {
              '$project': {
                'inverter': {
                  '$filter': {
                    'input': '$stringInverter.details', 
                    'as': 'inverters', 
                    'cond': {
                      '$eq': [
                        '$$inverters.id', Data.deviceNo
                      ]
                    }
                  }
                }, 
                '_id': 0
              }
            }
        ]);

        if(inverterProfile[0] == undefined){
            throw new Error("Inverter Not Found, Please contact to Holmium Technologies!"); 
        }

        switch(Data.deviceType){

            case 1:   //Sungrow Without String
                parametersCount=23;

                if(dataLength==54)  //Sungrow V1.0 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<19){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=19 && i<23){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[16]==0)
                    parsedData[16]='Running';
                    else if(parsedData[16]==32768)
                    parsedData[16]='Stop';
                    else if(parsedData[16]==4864)
                    parsedData[16]='Key Stop';
                    else if(parsedData[16]==5376)
                    parsedData[16]='Emergency Stop';
                    else if(parsedData[16]==5120)
                    parsedData[16]='Standby';
                    else if(parsedData[16]==4608)
                    parsedData[16]='Initial Standby';
                    else if(parsedData[16]==5632)
                    parsedData[16]='Starting';
                    else if(parsedData[16]==37120)
                    parsedData[16]='Alarm Run';
                    else if(parsedData[16]==33024)
                    parsedData[16]='Derating Run';
                    else if(parsedData[16]==33280)
                    parsedData[16]='Dispatch Run';
                    else if(parsedData[16]==21760)
                    parsedData[16]='Fault';
                    else if(parsedData[16]==9472)
                    parsedData[16]='Communicate Fault';
                    else
                    parsedData[16]=undefined;

                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                        parsedData[2]=0;
                        parsedData[3]=0;
                    }
                    if(parsedData[4]==65535 && parsedData[5]==65535){
                        parsedData[4]=0;
                        parsedData[5]=0;
                    }
                    if(parsedData[6]==65535 && parsedData[7]==65535){
                        parsedData[6]=0;
                        parsedData[7]=0;
                    }
                    if(parsedData[17]==65535 && parsedData[18]==65535){
                        parsedData[17]=0;
                        parsedData[18]=0;
                    }
                        
                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[22]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[17]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4);
                   Data.inputPower=(parsedData[21]/1000).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[19]*1);
                   Data.totalRuntime=parseInt(parsedData[20]);
                }
                else if(dataLength==88)  //Sungrow With String V1.2 8-Bit
                {
                    parametersCount=40;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<36){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=36 && i<40){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                     //Status Conversion
                     if(parsedData[16]==0)
                     parsedData[16]='Running';
                     else if(parsedData[16]==32768)
                     parsedData[16]='Stop';
                     else if(parsedData[16]==4864)
                     parsedData[16]='Key Stop';
                     else if(parsedData[16]==5376)
                     parsedData[16]='Emergency Stop';
                     else if(parsedData[16]==5120)
                     parsedData[16]='StandBy';
                     else if(parsedData[16]==4608)
                     parsedData[16]='Initial Standby';
                     else if(parsedData[16]==5632)
                     parsedData[16]='Starting';
                     else if(parsedData[16]==37120)
                     parsedData[16]='Alarm Run';
                     else if(parsedData[16]==33024)
                     parsedData[16]='Derating Run';
                     else if(parsedData[16]==33280)
                     parsedData[16]='Dispatch Run';
                     else if(parsedData[16]==21760)
                     parsedData[16]='Fault';
                     else if(parsedData[16]==9472)
                     parsedData[16]='Communicate Fault';
                     else
                     parsedData[16]=undefined;
 

                     //Fault and Alarm
                     let fault1=parsedData[17];
                     let parseFault1="";

                     if(fault1==2)
                        parseFault1="Grid Overvoltage";
                     if(fault1==3)
                        parseFault1="Grid Transient Overvoltage";
                     if(fault1==4)
                        parseFault1="Grid Undervoltage";
                     if(fault1==5)
                        parseFault1="Grid Lowvoltage";
                     if(fault1==7)
                        parseFault1="AC Instantaneous Overcurrent";
                     if(fault1==8)
                        parseFault1="Grid Overfrequency";
                     if(fault1==9)
                        parseFault1="Grid Underfrequency";
                     if(fault1==10)
                        parseFault1="Grid Power Outage";
                     if(fault1==11)
                        parseFault1="Device Abnormal";
                     if(fault1==12)
                        parseFault1="Excessive Leakage Current";
                     if(fault1==13)
                        parseFault1="Grid Abnormal";
                     if(fault1==14)
                        parseFault1="10-Mint Grid Overvoltage";
                     if(fault1==15)
                        parseFault1="Grid High Voltage";
                     if(fault1==16)
                        parseFault1="Output Overload";
                     if(fault1==17)
                        parseFault1="Grid Voltage Unbalance";
                     if(fault1==19)
                        parseFault1="Device Abnormal";
                     if(fault1==20)
                        parseFault1="Device Abnormal";
                     if(fault1==21)
                        parseFault1="Device Abnormal";
                     if(fault1==22)
                        parseFault1="Device Abnormal";
                     if(fault1==23)
                        parseFault1="PV Connection Fault";
                     if(fault1==24)
                        parseFault1="Device Abnormal";
                     if(fault1==25)
                        parseFault1="Device Abnormal";
                     if(fault1==30) 
                        parseFault1="Device Abnormal";
                     if(fault1==31)
                        parseFault1="Device Abnormal";
                     if(fault1==32)
                        parseFault1="Device Abnormal";
                     if(fault1==33)
                        parseFault1="Device Abnormal";
                     if(fault1==34)
                        parseFault1="Device Abnormal";
                     if(fault1==36)
                        parseFault1="Excessively High Module Temperture";
                     if(fault1==37)
                        parseFault1="Excessively High Ambient Temperture";
                     if(fault1==38)
                        parseFault1="Device Abnormal";
                     if(fault1==39)
                        parseFault1="Low System Insulation Resistance";
                     if(fault1==40)
                        parseFault1="Device Abnormal";
                     if(fault1==41)
                        parseFault1="Device Abnormal";
                     if(fault1==42)
                        parseFault1="Device Abnormal";
                     if(fault1==43)
                        parseFault1="Low Ambient Temperture";
                     if(fault1==44)
                        parseFault1="Device Abnormal";
                     if(fault1==45)
                        parseFault1="Device Abnormal";
                     if(fault1==46) 
                        parseFault1="Device Abnormal";
                     if(fault1==47)
                        parseFault1="PV Input Configuration Abnormal";
                     if(fault1==48)
                        parseFault1="Device Abnormal";
                     if(fault1==49)
                        parseFault1="Device Abnormal";
                     if(fault1==50)
                        parseFault1="Device Abnormal";
                     if(fault1==53)
                        parseFault1="Device Abnormal";
                     if(fault1==54)
                        parseFault1="Device Abnormal";
                     if(fault1==55)
                        parseFault1="Device Abnormal";
                     if(fault1==56)
                        parseFault1="Device Abnormal";
                     if(fault1==60)
                        parseFault1="Device Abnormal";
                     if(fault1==88)
                        parseFault1="Electric Are Fault";
                     if(fault1==105)
                        parseFault1="Grid-Side Protection Self- Check Failure";
                     if(fault1==106)
                        parseFault1="Grounding Cable Fault";
                     if(fault1==116)
                        parseFault1="Device Abnormal";
                     if(fault1==117)
                        parseFault1="Device Abnormal";
                     if(fault1==448)
                        parseFault1="String 1 Reverse Connection Fault";
                     if(fault1==449)
                        parseFault1="String 2 Reverse Connection Fault";
                     if(fault1==450)
                        parseFault1="String 3 Reverse Connection Fault";
                     if(fault1==451)
                        parseFault1="String 4 Reverse Connection Fault";
                     if(fault1==452)
                        parseFault1="String 5 Reverse Connection Fault";
                     if(fault1==453)
                        parseFault1="String 6 Reverse Connection Fault";
                     if(fault1==454)
                        parseFault1="String 7 Reverse Connection Fault";
                     if(fault1==455)
                        parseFault1="String 8 Reverse Connection Fault";
                     if(fault1==456)
                        parseFault1="String 9 Reverse Connection Fault";
                     if(fault1==457)
                        parseFault1="String 10 Reverse Connection Fault";
                     if(fault1==458)
                        parseFault1="String 11 Reverse Connection Fault";
                     if(fault1==459)
                        parseFault1="String 12 Reverse Connection Fault";
                     if(fault1==460)
                        parseFault1="String 13 Reverse Connection Fault";
                     if(fault1==461)
                        parseFault1="String 14 Reverse Connection Fault";
                     if(fault1==462)
                        parseFault1="String 15 Reverse Connection Fault";
                     if(fault1==463)
                        parseFault1="String 16 Reverse Connection Fault";
                     if(fault1==464)
                        parseFault1="String 17 Reverse Connection Fault";
                     if(fault1==465)
                        parseFault1="String 18 Reverse Connection Fault";
                     if(fault1==466)
                        parseFault1="String 19 Reverse Connection Fault";
                     if(fault1==467)
                        parseFault1="String 20 Reverse Connection Fault";
                     if(fault1==468)
                        parseFault1="String 21 Reverse Connection Fault";
                     if(fault1==469)
                        parseFault1="String 22 Reverse Connection Fault";
                     if(fault1==470)
                        parseFault1="String 23 Reverse Connection Fault";
                     if(fault1==471)
                        parseFault1="String 24 Reverse Connection Fault";
                         
                     let alarm1=parsedData[17];
                     let parseAlarm1="";
                     
                     if(alarm1==59)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==70)
                        parseAlarm1="Fan Alarm";
                     if(alarm1==71)
                        parseAlarm1="AC-Side SPD Alarm";
                     if(alarm1==72)
                        parseAlarm1="DC-Side SPD Alarm";
                     if(alarm1==74)
                        parseAlarm1="Communication Alarm";
                     if(alarm1==76)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==78)
                         parseAlarm1="PV1 Abnormal";
                     if(alarm1==79)
                        parseAlarm1="PV2 Abnormal";
                     if(alarm1==80)
                        parseAlarm1="PV3 Abnormal";
                     if(alarm1==81)
                        parseAlarm1="PV4 Abnormal";
                     if(alarm1==87)
                        parseAlarm1="Electric Are Detection Module Abnormal";
                     if(alarm1==88)
                        parseAlarm1="Electric Are Fault";
                     if(alarm1==89)
                        parseAlarm1="Electric Are Detection Disabled";
                     if(alarm1==105)
                        parseAlarm1="Grid-Side Protection Self-Check Failure";
                     if(alarm1==106)
                         parseAlarm1="Grounding Cable Fault";
                     if(alarm1==116)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==117)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==220)
                        parseAlarm1="PV5 Abnormal";
                     if(alarm1==221)
                        parseAlarm1="PV6 Abnormal";
                     if(alarm1==222)
                        parseAlarm1="PV7 Abnormal}";
                     if(alarm1==223)
                        parseAlarm1="PV8 Abnormal";
                     if(alarm1==224)
                        parseAlarm1="PV9 Abnormal";
                     if(alarm1==225)
                        parseAlarm1="PV10 Abnormal}";
                     if(alarm1==226)
                        parseAlarm1="PV11 Abnormal";
                     if(alarm1==227)
                        parseAlarm1="PV12 Abnormal";
                     if(alarm1==514)
                        parseAlarm1="Meter Communication Abnormal Alarm";
                     if(alarm1==532)
                        parseAlarm1="String 1 Reverse Connection Alarm";
                     if(alarm1==533)
                        parseAlarm1="String 2 Reverse Connection Alarm";
                     if(alarm1==534)
                        parseAlarm1="String 3 Reverse Connection Alarm";
                     if(alarm1==535)
                        parseAlarm1="String 4 Reverse Connection Alarm";
                     if(alarm1==536)
                        parseAlarm1="String 5 Reverse Connection Alarm";
                     if(alarm1==537)
                        parseAlarm1="String 6 Reverse Connection Alarm";
                     if(alarm1==538)
                        parseAlarm1="String 7 Reverse Connection Alarm";
                     if(alarm1==539)
                        parseAlarm1="String 8 Reverse Connection Alarm";
                     if(alarm1==540)
                        parseAlarm1="String 9 Reverse Connection Alarm";
                     if(alarm1==541)
                        parseAlarm1="String 10 Reverse Connection Alarm";
                     if(alarm1==542)
                        parseAlarm1="String 11 Reverse Connection Alarm";
                     if(alarm1==543)
                        parseAlarm1="String 12 Reverse Connection Alarm";
                     if(alarm1==544)
                        parseAlarm1="String 13 Reverse Connection Alarm";
                     if(alarm1==545)
                        parseAlarm1="String 14 Reverse Connection Alarm";
                     if(alarm1==546)
                        parseAlarm1="String 15 Reverse Connection Alarm";
                     if(alarm1==547)
                        parseAlarm1="String 16 Reverse Connection Alarm";
                     if(alarm1==564)
                        parseAlarm1="String 17 Reverse Connection Alarm";
                     if(alarm1==565)
                        parseAlarm1="String 18 Reverse Connection Alarm";
                     if(alarm1==566)
                        parseAlarm1="String 19 Reverse Connection Alarm";
                     if(alarm1==567)
                        parseAlarm1="String 20 Reverse Connection Alarm";
                     if(alarm1==568)
                        parseAlarm1="String 21 Reverse Connection Alarm";
                     if(alarm1==569)
                        parseAlarm1="String 22 Reverse Connection Alarm";
                     if(alarm1==570)
                        parseAlarm1="String 23 Reverse Connection Alarm";
                     if(alarm1==571)
                        parseAlarm1="String 24 Reverse Connection Alarm";
                     if(alarm1==548)
                        parseAlarm1="String 1 Abnormal Alarm";
                     if(alarm1==549)
                        parseAlarm1="String 2 Abnormal Alarm";
                     if(alarm1==550)
                        parseAlarm1="String 3 Abnormal Alarm";
                     if(alarm1==551)
                        parseAlarm1="String 4 Abnormal Alarm";
                     if(alarm1==552)
                        parseAlarm1="String 5 Abnormal Alarm";
                     if(alarm1==553)
                        parseAlarm1="String 6 Abnormal Alarm";
                     if(alarm1==554)
                        parseAlarm1="String 7 Abnormal Alarm";
                     if(alarm1==555)
                        parseAlarm1="String 8 Abnormal Alarm";
                     if(alarm1==556)
                        parseAlarm1="String 9 Abnormal Alarm";
                     if(alarm1==557)
                        parseAlarm1="String 10 Abnormal Alarm";
                     if(alarm1==558)
                        parseAlarm1="String 11 Abnormal Alarm";
                     if(alarm1==559)
                        parseAlarm1="String 12 Abnormal Alarm";
                     if(alarm1==560)
                        parseAlarm1="String 13 Abnormal Alarm";
                     if(alarm1==561)
                        parseAlarm1="String 14 Abnormal Alarm";
                     if(alarm1==562)
                        parseAlarm1="String 15 Abnormal Alarm";
                     if(alarm1==563)
                        parseAlarm1="String 16 Abnormal Alarm";
                     if(alarm1==580)
                        parseAlarm1="String 17 Abnormal Alarm";
                     if(alarm1==581)
                        parseAlarm1="String 18 Abnormal Alarm";
                     if(alarm1==582)
                        parseAlarm1="String 19 Abnormal Alarm";
                     if(alarm1==583)
                        parseAlarm1="String 20 Abnormal Alarm";
                     if(alarm1==584)
                        parseAlarm1="String 21 Abnormal Alarm";
                     if(alarm1==585)
                        parseAlarm1="String 22 Abnormal Alarm";
                     if(alarm1==586)
                        parseAlarm1="String 23 Abnormal Alarm";
                     if(alarm1==587)
                        parseAlarm1="String 24 Abnormal Alarm";
                      
                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                         parsedData[2]=0;
                         parsedData[3]=0;
                    }

                    if(parsedData[4]==65535 && parsedData[5]==65535){
                         parsedData[4]=0;
                         parsedData[5]=0;
                    }

                    if(parsedData[6]==65535 && parsedData[7]==65535){
                         parsedData[6]=0;
                         parsedData[7]=0;
                    }

                    if(parsedData[18]==65535 && parsedData[19]==65535){
                         parsedData[18]=0;
                         parsedData[19]=0;
                    }

                    if(parsedData[20]==65535 && parsedData[21]==65535){
                        parsedData[20]=0;
                        parsedData[21]=0;
                    }

                    if(parsedData[22]==65535 && parsedData[23]==65535){
                        parsedData[22]=0;
                        parsedData[23]=0;
                    }

                    if(parsedData[24]==65535 && parsedData[25]==65535){
                        parsedData[24]=0;
                        parsedData[25]=0;
                    }

                    if(parsedData[26]==65535 && parsedData[27]==65535){
                        parsedData[26]=0;
                        parsedData[27]=0;
                    }

                    if(parsedData[28]==65535 && parsedData[29]==65535){
                        parsedData[28]=0;
                        parsedData[29]=0;
                    }

                    if(parsedData[30]==65535 && parsedData[31]==65535){
                        parsedData[30]=0;
                        parsedData[31]=0;
                    }

                    if(parsedData[32]==65535 && parsedData[33]==65535){
                        parsedData[32]=0;
                        parsedData[33]=0;
                    }

                    if(parsedData[34]==65535 && parsedData[35]==65535){
                        parsedData[34]=0;
                        parsedData[35]=0;
                    }

                   //Efficiency Check
                   if(parsedData[15] > 100)
                        parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[39]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[20]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[22]*0.1).toFixed(2);
                   Data.voltageMPPT7=(parsedData[24]*0.1).toFixed(2);
                   Data.voltageMPPT8=(parsedData[26]*0.1).toFixed(2);
                   Data.voltageMPPT9=(parsedData[28]*0.1).toFixed(2);
                   Data.voltageMPPT10=(parsedData[30]*0.1).toFixed(2);
                   Data.voltageMPPT11=(parsedData[32]*0.1).toFixed(2);
                   Data.voltageMPPT12=(parsedData[34]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.currentMPPT5=(parsedData[21]*0.1).toFixed(2);
                   Data.currentMPPT6=(parsedData[23]*0.1).toFixed(2);
                   Data.currentMPPT7=(parsedData[25]*0.1).toFixed(2);
                   Data.currentMPPT8=(parsedData[27]*0.1).toFixed(2);
                   Data.currentMPPT9=(parsedData[29]*0.1).toFixed(2);
                   Data.currentMPPT10=(parsedData[31]*0.1).toFixed(2);
                   Data.currentMPPT11=(parsedData[33]*0.1).toFixed(2);
                   Data.currentMPPT12=(parsedData[35]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.powerMPPT7=((parseFloat(Data.voltageMPPT7)*parseFloat(Data.currentMPPT7))/1000).toFixed(2);
                   Data.powerMPPT8=((parseFloat(Data.voltageMPPT8)*parseFloat(Data.currentMPPT8))/1000).toFixed(2);
                   Data.powerMPPT9=((parseFloat(Data.voltageMPPT9)*parseFloat(Data.currentMPPT9))/1000).toFixed(2);
                   Data.powerMPPT10=((parseFloat(Data.voltageMPPT10)*parseFloat(Data.currentMPPT10))/1000).toFixed(2);
                   Data.powerMPPT11=((parseFloat(Data.voltageMPPT11)*parseFloat(Data.currentMPPT11))/1000).toFixed(2);
                   Data.powerMPPT12=((parseFloat(Data.voltageMPPT12)*parseFloat(Data.currentMPPT12))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6,
                    Data.currentMPPT7,Data.currentMPPT8,Data.currentMPPT9,Data.currentMPPT10,Data.currentMPPT11,Data.currentMPPT12);
                   Data.inputPower=(parsedData[38]/1000).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[36]*1);
                   Data.totalRuntime=parseInt(parsedData[37]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                }
                else{
                    return "Conflict";
                }

            break;

            case 2:     //growatt v1.0

                parametersCount=24;
            
                if(dataLength==68)
                {
                    for(let i=0,m=0;i<parametersCount;i++){
                        if(i>=0 && i<14){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=14 && i<24){
                            parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Waiting';
                    else if(parsedData[0]==1)
                    parsedData[0]='Running';
                    else if(parsedData[0]==3)
                    parsedData[0]='Fault';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=parsedData[13];
                    let parseFault1="";

                    if(fault1==24)
                        parseFault1='Auto Test Falied';
                    else if(fault1==25)
                        parseFault1='No AC Connection';
                    else if(fault1==26)
                        parseFault1='PV Isolation Low';
                    else if(fault1==27)
                        parseFault1='Residual I High';
                    else if(fault1==28)
                        parseFault1='Output High DCI';
                    else if(fault1==29)
                        parseFault1='PV Voltage High';
                    else if(fault1==30)
                        parseFault1='AC V Outrange';
                    else if(fault1==31)
                        parseFault1='AC F Outrange';
                    else if(fault1==32)
                        parseFault1='Module Hot';
                    else
                        parseFault1='Error: 99+x';
                    
                    parsedData[13] = parseFault1;

                    //Add data to mongoose object for Database
                   Data.status=(parsedData[0]);
                   Data.temperature=(parsedData[12]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[6]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[7]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[11]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[18]/10000).toFixed(2);
                   Data.powerPhaseY=(parsedData[19]/10000).toFixed(2);
                   Data.powerPhaseB=(parsedData[20]/10000).toFixed(2);
                   Data.activePower=(parsedData[17]/10000).toFixed(2);
                   Data.frequency=(parsedData[5]*0.01).toFixed(2);
                   Data.voltageMPPT1=(parsedData[1]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.powerMPPT1=(parsedData[15]/10000).toFixed(2);
                   Data.powerMPPT2=(parsedData[16]/10000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=(parsedData[14]/10000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[21]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[22]*0.1);
                   Data.totalRuntime=parseInt((parsedData[23]*0.5)/3600);
                   Data.fault=(parsedData[13]);
                }
                else{
                    return "Conflict";
                }

                break;

            case 3:       //Sungrow With String

                if(dataLength==86)      //Sungrow With String V1.0 8-Bit
                {
                    parametersCount=39; 

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<19){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=19 && i<23){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                        else{
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[16]==0)
                    parsedData[16]='Running';
                    else if(parsedData[16]==32768)
                    parsedData[16]='Stop';
                    else if(parsedData[16]==4864)
                    parsedData[16]='Key Stop';
                    else if(parsedData[16]==5376)
                    parsedData[16]='Emergency Stop';
                    else if(parsedData[16]==5120)
                    parsedData[16]='StandBy';
                    else if(parsedData[16]==4608)
                    parsedData[16]='Initial Standby';
                    else if(parsedData[16]==5632)
                    parsedData[16]='Starting';
                    else if(parsedData[16]==37120)
                    parsedData[16]='Alarm Run';
                    else if(parsedData[16]==33024)
                    parsedData[16]='Derating Run';
                    else if(parsedData[16]==33280)
                    parsedData[16]='Dispatch Run';
                    else if(parsedData[16]==21760)
                    parsedData[16]='Fault';
                    else if(parsedData[16]==9472)
                    parsedData[16]='Communicate Fault';
                    else
                    parsedData[16]=undefined;

                    //Remove Strings garbage values
                    if(parsedData[23]==65535)
                        parsedData[23]=0;
                    if(parsedData[24]==65535)
                        parsedData[24]=0;
                    if(parsedData[25]==65535)
                        parsedData[25]=0;
                    if(parsedData[26]==65535)
                        parsedData[26]=0;
                    if(parsedData[27]==65535)
                        parsedData[27]=0;
                    if(parsedData[28]==65535)
                        parsedData[28]=0;
                    if(parsedData[29]==65535)
                        parsedData[29]=0;
                    if(parsedData[30]==65535)
                        parsedData[30]=0;
                    if(parsedData[31]==65535)
                        parsedData[31]=0;
                    if(parsedData[32]==65535)
                        parsedData[32]=0;
                    if(parsedData[33]==65535)
                        parsedData[33]=0;
                    if(parsedData[34]==65535)
                        parsedData[34]=0;
                    if(parsedData[35]==65535)
                        parsedData[35]=0;
                    if(parsedData[36]==65535)
                        parsedData[36]=0;
                    if(parsedData[37]==65535)
                        parsedData[37]=0;
                    if(parsedData[38]==65535)
                        parsedData[38]=0;

                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                        parsedData[2]=0;
                        parsedData[3]=0;
                    }
                    if(parsedData[4]==65535 && parsedData[5]==65535){
                        parsedData[4]=0;
                        parsedData[5]=0;
                    }
                    if(parsedData[6]==65535 && parsedData[7]==65535){
                        parsedData[6]=0;
                        parsedData[7]=0;
                    }
                    if(parsedData[17]==65535 && parsedData[18]==65535){
                        parsedData[17]=0;
                        parsedData[18]=0;
                    }
                    
                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
                        parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                   Data.activePower=(parsedData[22]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[17]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4);
                   Data.inputPower=(parsedData[21]/1000).toFixed(2);
                   Data.currentString1=(parsedData[23]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[24]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[25]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[26]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[27]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[28]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[29]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[30]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[31]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[32]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[38]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[19]*1);
                   Data.totalRuntime=parseInt(parsedData[20]);
                  
                }
                else if(dataLength==100)  //Sungrow With String V1.1.0 8-Bit
                {
                    parametersCount=46; 

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<20){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=20 && i<24){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                        else{
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    ///Status Conversion
                    if(parsedData[16]==0)
                    parsedData[16]='Running';
                    else if(parsedData[16]==32768)
                    parsedData[16]='Stop';
                    else if(parsedData[16]==4864)
                    parsedData[16]='Key Stop';
                    else if(parsedData[16]==5376)
                    parsedData[16]='Emergency Stop';
                    else if(parsedData[16]==5120)
                    parsedData[16]='StandBy';
                    else if(parsedData[16]==4608)
                    parsedData[16]='Initial Standby';
                    else if(parsedData[16]==5632)
                    parsedData[16]='Starting';
                    else if(parsedData[16]==37120)
                    parsedData[16]='Alarm Run';
                    else if(parsedData[16]==33024)
                    parsedData[16]='Derating Run';
                    else if(parsedData[16]==33280)
                    parsedData[16]='Dispatch Run';
                    else if(parsedData[16]==21760)
                    parsedData[16]='Fault';
                    else if(parsedData[16]==9472)
                    parsedData[16]='Communicate Fault';
                    else
                    parsedData[16]=undefined;


                    //Fault and Alarm
                    let fault1=parsedData[17];
                    let parseFault1="";

                    if(fault1==2)
                       parseFault1="Grid Overvoltage";
                    if(fault1==3)
                       parseFault1="Grid Transient Overvoltage";
                    if(fault1==4)
                       parseFault1="Grid Undervoltage";
                    if(fault1==5)
                       parseFault1="Grid Lowvoltage";
                    if(fault1==7)
                       parseFault1="AC Instantaneous Overcurrent";
                    if(fault1==8)
                       parseFault1="Grid Overfrequency";
                    if(fault1==9)
                       parseFault1="Grid Underfrequency";
                    if(fault1==10)
                       parseFault1="Grid Power Outage";
                    if(fault1==11)
                       parseFault1="Device Abnormal";
                    if(fault1==12)
                       parseFault1="Excessive Leakage Current";
                    if(fault1==13)
                       parseFault1="Grid Abnormal";
                    if(fault1==14)
                       parseFault1="10-Mint Grid Overvoltage";
                    if(fault1==15)
                       parseFault1="Grid High Voltage";
                    if(fault1==16)
                       parseFault1="Output Overload";
                    if(fault1==17)
                       parseFault1="Grid Voltage Unbalance";
                    if(fault1==19)
                       parseFault1="Device Abnormal";
                    if(fault1==20)
                       parseFault1="Device Abnormal";
                    if(fault1==21)
                       parseFault1="Device Abnormal";
                    if(fault1==22)
                       parseFault1="Device Abnormal";
                    if(fault1==23)
                       parseFault1="PV Connection Fault";
                    if(fault1==24)
                       parseFault1="Device Abnormal";
                    if(fault1==25)
                       parseFault1="Device Abnormal";
                    if(fault1==30) 
                       parseFault1="Device Abnormal";
                    if(fault1==31)
                       parseFault1="Device Abnormal";
                    if(fault1==32)
                       parseFault1="Device Abnormal";
                    if(fault1==33)
                       parseFault1="Device Abnormal";
                    if(fault1==34)
                       parseFault1="Device Abnormal";
                    if(fault1==36)
                       parseFault1="Excessively High Module Temperture";
                    if(fault1==37)
                       parseFault1="Excessively High Ambient Temperture";
                    if(fault1==38)
                       parseFault1="Device Abnormal";
                    if(fault1==39)
                       parseFault1="Low System Insulation Resistance";
                    if(fault1==40)
                       parseFault1="Device Abnormal";
                    if(fault1==41)
                       parseFault1="Device Abnormal";
                    if(fault1==42)
                       parseFault1="Device Abnormal";
                    if(fault1==43)
                       parseFault1="Low Ambient Temperture";
                    if(fault1==44)
                       parseFault1="Device Abnormal";
                    if(fault1==45)
                       parseFault1="Device Abnormal";
                    if(fault1==46) 
                       parseFault1="Device Abnormal";
                    if(fault1==47)
                       parseFault1="PV Input Configuration Abnormal";
                    if(fault1==48)
                       parseFault1="Device Abnormal";
                    if(fault1==49)
                       parseFault1="Device Abnormal";
                    if(fault1==50)
                       parseFault1="Device Abnormal";
                    if(fault1==53)
                       parseFault1="Device Abnormal";
                    if(fault1==54)
                       parseFault1="Device Abnormal";
                    if(fault1==55)
                       parseFault1="Device Abnormal";
                    if(fault1==56)
                       parseFault1="Device Abnormal";
                    if(fault1==60)
                       parseFault1="Device Abnormal";
                    if(fault1==88)
                       parseFault1="Electric Are Fault";
                    if(fault1==105)
                       parseFault1="Grid-Side Protection Self- Check Failure";
                    if(fault1==106)
                       parseFault1="Grounding Cable Fault";
                    if(fault1==116)
                       parseFault1="Device Abnormal";
                    if(fault1==117)
                       parseFault1="Device Abnormal";
                    if(fault1==448)
                       parseFault1="String 1 Reverse Connection Fault";
                    if(fault1==449)
                       parseFault1="String 2 Reverse Connection Fault";
                    if(fault1==450)
                       parseFault1="String 3 Reverse Connection Fault";
                    if(fault1==451)
                       parseFault1="String 4 Reverse Connection Fault";
                    if(fault1==452)
                       parseFault1="String 5 Reverse Connection Fault";
                    if(fault1==453)
                       parseFault1="String 6 Reverse Connection Fault";
                    if(fault1==454)
                       parseFault1="String 7 Reverse Connection Fault";
                    if(fault1==455)
                       parseFault1="String 8 Reverse Connection Fault";
                    if(fault1==456)
                       parseFault1="String 9 Reverse Connection Fault";
                    if(fault1==457)
                       parseFault1="String 10 Reverse Connection Fault";
                    if(fault1==458)
                       parseFault1="String 11 Reverse Connection Fault";
                    if(fault1==459)
                       parseFault1="String 12 Reverse Connection Fault";
                    if(fault1==460)
                       parseFault1="String 13 Reverse Connection Fault";
                    if(fault1==461)
                       parseFault1="String 14 Reverse Connection Fault";
                    if(fault1==462)
                       parseFault1="String 15 Reverse Connection Fault";
                    if(fault1==463)
                       parseFault1="String 16 Reverse Connection Fault";
                    if(fault1==464)
                       parseFault1="String 17 Reverse Connection Fault";
                    if(fault1==465)
                       parseFault1="String 18 Reverse Connection Fault";
                    if(fault1==466)
                       parseFault1="String 19 Reverse Connection Fault";
                    if(fault1==467)
                       parseFault1="String 20 Reverse Connection Fault";
                    if(fault1==468)
                       parseFault1="String 21 Reverse Connection Fault";
                    if(fault1==469)
                       parseFault1="String 22 Reverse Connection Fault";
                    if(fault1==470)
                       parseFault1="String 23 Reverse Connection Fault";
                    if(fault1==471)
                       parseFault1="String 24 Reverse Connection Fault";
                        
                    let alarm1=parsedData[17];
                    let parseAlarm1="";
                    
                    if(alarm1==59)
                       parseAlarm1="Device Abnormal";
                    if(alarm1==70)
                       parseAlarm1="Fan Alarm";
                    if(alarm1==71)
                       parseAlarm1="AC-Side SPD Alarm";
                    if(alarm1==72)
                       parseAlarm1="DC-Side SPD Alarm";
                    if(alarm1==74)
                       parseAlarm1="Communication Alarm";
                    if(alarm1==76)
                       parseAlarm1="Device Abnormal";
                    if(alarm1==78)
                        parseAlarm1="PV1 Abnormal";
                    if(alarm1==79)
                       parseAlarm1="PV2 Abnormal";
                    if(alarm1==80)
                       parseAlarm1="PV3 Abnormal";
                    if(alarm1==81)
                       parseAlarm1="PV4 Abnormal";
                    if(alarm1==87)
                       parseAlarm1="Electric Are Detection Module Abnormal";
                    if(alarm1==88)
                       parseAlarm1="Electric Are Fault";
                    if(alarm1==89)
                       parseAlarm1="Electric Are Detection Disabled";
                    if(alarm1==105)
                       parseAlarm1="Grid-Side Protection Self-Check Failure";
                    if(alarm1==106)
                        parseAlarm1="Grounding Cable Fault";
                    if(alarm1==116)
                       parseAlarm1="Device Abnormal";
                    if(alarm1==117)
                       parseAlarm1="Device Abnormal";
                    if(alarm1==220)
                       parseAlarm1="PV5 Abnormal";
                    if(alarm1==221)
                       parseAlarm1="PV6 Abnormal";
                    if(alarm1==222)
                       parseAlarm1="PV7 Abnormal}";
                    if(alarm1==223)
                       parseAlarm1="PV8 Abnormal";
                    if(alarm1==224)
                       parseAlarm1="PV9 Abnormal";
                    if(alarm1==225)
                       parseAlarm1="PV10 Abnormal}";
                    if(alarm1==226)
                       parseAlarm1="PV11 Abnormal";
                    if(alarm1==227)
                       parseAlarm1="PV12 Abnormal";
                    if(alarm1==514)
                       parseAlarm1="Meter Communication Abnormal Alarm";
                    if(alarm1==532)
                       parseAlarm1="String 1 Reverse Connection Alarm";
                    if(alarm1==533)
                       parseAlarm1="String 2 Reverse Connection Alarm";
                    if(alarm1==534)
                       parseAlarm1="String 3 Reverse Connection Alarm";
                    if(alarm1==535)
                       parseAlarm1="String 4 Reverse Connection Alarm";
                    if(alarm1==536)
                       parseAlarm1="String 5 Reverse Connection Alarm";
                    if(alarm1==537)
                       parseAlarm1="String 6 Reverse Connection Alarm";
                    if(alarm1==538)
                       parseAlarm1="String 7 Reverse Connection Alarm";
                    if(alarm1==539)
                       parseAlarm1="String 8 Reverse Connection Alarm";
                    if(alarm1==540)
                       parseAlarm1="String 9 Reverse Connection Alarm";
                    if(alarm1==541)
                       parseAlarm1="String 10 Reverse Connection Alarm";
                    if(alarm1==542)
                       parseAlarm1="String 11 Reverse Connection Alarm";
                    if(alarm1==543)
                       parseAlarm1="String 12 Reverse Connection Alarm";
                    if(alarm1==544)
                       parseAlarm1="String 13 Reverse Connection Alarm";
                    if(alarm1==545)
                       parseAlarm1="String 14 Reverse Connection Alarm";
                    if(alarm1==546)
                       parseAlarm1="String 15 Reverse Connection Alarm";
                    if(alarm1==547)
                       parseAlarm1="String 16 Reverse Connection Alarm";
                    if(alarm1==564)
                       parseAlarm1="String 17 Reverse Connection Alarm";
                    if(alarm1==565)
                       parseAlarm1="String 18 Reverse Connection Alarm";
                    if(alarm1==566)
                       parseAlarm1="String 19 Reverse Connection Alarm";
                    if(alarm1==567)
                       parseAlarm1="String 20 Reverse Connection Alarm";
                    if(alarm1==568)
                       parseAlarm1="String 21 Reverse Connection Alarm";
                    if(alarm1==569)
                       parseAlarm1="String 22 Reverse Connection Alarm";
                    if(alarm1==570)
                       parseAlarm1="String 23 Reverse Connection Alarm";
                    if(alarm1==571)
                       parseAlarm1="String 24 Reverse Connection Alarm";
                    if(alarm1==548)
                       parseAlarm1="String 1 Abnormal Alarm";
                    if(alarm1==549)
                       parseAlarm1="String 2 Abnormal Alarm";
                    if(alarm1==550)
                       parseAlarm1="String 3 Abnormal Alarm";
                    if(alarm1==551)
                       parseAlarm1="String 4 Abnormal Alarm";
                    if(alarm1==552)
                       parseAlarm1="String 5 Abnormal Alarm";
                    if(alarm1==553)
                       parseAlarm1="String 6 Abnormal Alarm";
                    if(alarm1==554)
                       parseAlarm1="String 7 Abnormal Alarm";
                    if(alarm1==555)
                       parseAlarm1="String 8 Abnormal Alarm";
                    if(alarm1==556)
                       parseAlarm1="String 9 Abnormal Alarm";
                    if(alarm1==557)
                       parseAlarm1="String 10 Abnormal Alarm";
                    if(alarm1==558)
                       parseAlarm1="String 11 Abnormal Alarm";
                    if(alarm1==559)
                       parseAlarm1="String 12 Abnormal Alarm";
                    if(alarm1==560)
                       parseAlarm1="String 13 Abnormal Alarm";
                    if(alarm1==561)
                       parseAlarm1="String 14 Abnormal Alarm";
                    if(alarm1==562)
                       parseAlarm1="String 15 Abnormal Alarm";
                    if(alarm1==563)
                       parseAlarm1="String 16 Abnormal Alarm";
                    if(alarm1==580)
                       parseAlarm1="String 17 Abnormal Alarm";
                    if(alarm1==581)
                       parseAlarm1="String 18 Abnormal Alarm";
                    if(alarm1==582)
                       parseAlarm1="String 19 Abnormal Alarm";
                    if(alarm1==583)
                       parseAlarm1="String 20 Abnormal Alarm";
                    if(alarm1==584)
                       parseAlarm1="String 21 Abnormal Alarm";
                    if(alarm1==585)
                       parseAlarm1="String 22 Abnormal Alarm";
                    if(alarm1==586)
                       parseAlarm1="String 23 Abnormal Alarm";
                    if(alarm1==587)
                       parseAlarm1="String 24 Abnormal Alarm";

                    //Remove Strings garbage values
                    if(parsedData[24]==65535)
                        parsedData[24]=0;
                    if(parsedData[25]==65535)
                        parsedData[25]=0;
                    if(parsedData[26]==65535)
                        parsedData[26]=0;
                    if(parsedData[27]==65535)
                        parsedData[27]=0;
                    if(parsedData[28]==65535)
                        parsedData[28]=0;
                    if(parsedData[29]==65535)
                        parsedData[29]=0;
                    if(parsedData[30]==65535)
                        parsedData[30]=0;
                    if(parsedData[31]==65535)
                        parsedData[31]=0;
                    if(parsedData[32]==65535)
                        parsedData[32]=0;
                    if(parsedData[33]==65535)
                        parsedData[33]=0;
                    if(parsedData[34]==65535)
                        parsedData[34]=0;
                    if(parsedData[35]==65535)
                        parsedData[35]=0;
                    if(parsedData[36]==65535)
                        parsedData[36]=0;
                    if(parsedData[37]==65535)
                        parsedData[37]=0;
                    if(parsedData[38]==65535)
                        parsedData[38]=0;
                    if(parsedData[39]==65535)
                        parsedData[39]=0;
                    if(parsedData[40]==65535)
                        parsedData[40]=0;
                    if(parsedData[41]==65535)
                        parsedData[41]=0;
                    if(parsedData[42]==65535)
                        parsedData[42]=0;
                    if(parsedData[43]==65535)
                        parsedData[43]=0;
                    if(parsedData[44]==65535)
                        parsedData[44]=0;
                    if(parsedData[45]==65535)
                        parsedData[45]=0;

                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                        parsedData[2]=0;
                        parsedData[3]=0;
                    }
                    if(parsedData[4]==65535 && parsedData[5]==65535){
                        parsedData[4]=0;
                        parsedData[5]=0;
                    }
                    if(parsedData[6]==65535 && parsedData[7]==65535){
                        parsedData[6]=0;
                        parsedData[7]=0;
                    }
                    if(parsedData[17]==65535 && parsedData[18]==65535){
                        parsedData[17]=0;
                        parsedData[18]=0;
                    }

                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
                        parsedData[15] = 0;
                        
                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                   Data.activePower=(parsedData[23]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4);
                   Data.inputPower=(parsedData[22]/1000).toFixed(2);
                   Data.currentString1=(parsedData[24]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[25]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[26]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[27]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[28]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[29]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[30]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[31]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[32]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[38]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[39]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[45]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[20]*1);
                   Data.totalRuntime=parseInt(parsedData[21]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                  
                }
                else if(dataLength==128)  //Sungrow With String V1.2 8-Bit 20 Strings
                {
                    parametersCount=60;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<36){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=36 && i<40){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                        else{
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                     //Status Conversion
                     if(parsedData[16]==0)
                     parsedData[16]='Running';
                     else if(parsedData[16]==32768)
                     parsedData[16]='Stop';
                     else if(parsedData[16]==4864)
                     parsedData[16]='Key Stop';
                     else if(parsedData[16]==5376)
                     parsedData[16]='Emergency Stop';
                     else if(parsedData[16]==5120)
                     parsedData[16]='StandBy';
                     else if(parsedData[16]==4608)
                     parsedData[16]='Initial Standby';
                     else if(parsedData[16]==5632)
                     parsedData[16]='Starting';
                     else if(parsedData[16]==37120)
                     parsedData[16]='Alarm Run';
                     else if(parsedData[16]==33024)
                     parsedData[16]='Derating Run';
                     else if(parsedData[16]==33280)
                     parsedData[16]='Dispatch Run';
                     else if(parsedData[16]==21760)
                     parsedData[16]='Fault';
                     else if(parsedData[16]==9472)
                     parsedData[16]='Communicate Fault';
                     else
                     parsedData[16]=undefined;
 

                     //Fault and Alarm
                     let fault1=parsedData[17];
                     let parseFault1="";

                     if(fault1==2)
                        parseFault1="Grid Overvoltage";
                     if(fault1==3)
                        parseFault1="Grid Transient Overvoltage";
                     if(fault1==4)
                        parseFault1="Grid Undervoltage";
                     if(fault1==5)
                        parseFault1="Grid Lowvoltage";
                     if(fault1==7)
                        parseFault1="AC Instantaneous Overcurrent";
                     if(fault1==8)
                        parseFault1="Grid Overfrequency";
                     if(fault1==9)
                        parseFault1="Grid Underfrequency";
                     if(fault1==10)
                        parseFault1="Grid Power Outage";
                     if(fault1==11)
                        parseFault1="Device Abnormal";
                     if(fault1==12)
                        parseFault1="Excessive Leakage Current";
                     if(fault1==13)
                        parseFault1="Grid Abnormal";
                     if(fault1==14)
                        parseFault1="10-Mint Grid Overvoltage";
                     if(fault1==15)
                        parseFault1="Grid High Voltage";
                     if(fault1==16)
                        parseFault1="Output Overload";
                     if(fault1==17)
                        parseFault1="Grid Voltage Unbalance";
                     if(fault1==19)
                        parseFault1="Device Abnormal";
                     if(fault1==20)
                        parseFault1="Device Abnormal";
                     if(fault1==21)
                        parseFault1="Device Abnormal";
                     if(fault1==22)
                        parseFault1="Device Abnormal";
                     if(fault1==23)
                        parseFault1="PV Connection Fault";
                     if(fault1==24)
                        parseFault1="Device Abnormal";
                     if(fault1==25)
                        parseFault1="Device Abnormal";
                     if(fault1==30) 
                        parseFault1="Device Abnormal";
                     if(fault1==31)
                        parseFault1="Device Abnormal";
                     if(fault1==32)
                        parseFault1="Device Abnormal";
                     if(fault1==33)
                        parseFault1="Device Abnormal";
                     if(fault1==34)
                        parseFault1="Device Abnormal";
                     if(fault1==36)
                        parseFault1="Excessively High Module Temperture";
                     if(fault1==37)
                        parseFault1="Excessively High Ambient Temperture";
                     if(fault1==38)
                        parseFault1="Device Abnormal";
                     if(fault1==39)
                        parseFault1="Low System Insulation Resistance";
                     if(fault1==40)
                        parseFault1="Device Abnormal";
                     if(fault1==41)
                        parseFault1="Device Abnormal";
                     if(fault1==42)
                        parseFault1="Device Abnormal";
                     if(fault1==43)
                        parseFault1="Low Ambient Temperture";
                     if(fault1==44)
                        parseFault1="Device Abnormal";
                     if(fault1==45)
                        parseFault1="Device Abnormal";
                     if(fault1==46) 
                        parseFault1="Device Abnormal";
                     if(fault1==47)
                        parseFault1="PV Input Configuration Abnormal";
                     if(fault1==48)
                        parseFault1="Device Abnormal";
                     if(fault1==49)
                        parseFault1="Device Abnormal";
                     if(fault1==50)
                        parseFault1="Device Abnormal";
                     if(fault1==53)
                        parseFault1="Device Abnormal";
                     if(fault1==54)
                        parseFault1="Device Abnormal";
                     if(fault1==55)
                        parseFault1="Device Abnormal";
                     if(fault1==56)
                        parseFault1="Device Abnormal";
                     if(fault1==60)
                        parseFault1="Device Abnormal";
                     if(fault1==88)
                        parseFault1="Electric Are Fault";
                     if(fault1==105)
                        parseFault1="Grid-Side Protection Self- Check Failure";
                     if(fault1==106)
                        parseFault1="Grounding Cable Fault";
                     if(fault1==116)
                        parseFault1="Device Abnormal";
                     if(fault1==117)
                        parseFault1="Device Abnormal";
                     if(fault1==448)
                        parseFault1="String 1 Reverse Connection Fault";
                     if(fault1==449)
                        parseFault1="String 2 Reverse Connection Fault";
                     if(fault1==450)
                        parseFault1="String 3 Reverse Connection Fault";
                     if(fault1==451)
                        parseFault1="String 4 Reverse Connection Fault";
                     if(fault1==452)
                        parseFault1="String 5 Reverse Connection Fault";
                     if(fault1==453)
                        parseFault1="String 6 Reverse Connection Fault";
                     if(fault1==454)
                        parseFault1="String 7 Reverse Connection Fault";
                     if(fault1==455)
                        parseFault1="String 8 Reverse Connection Fault";
                     if(fault1==456)
                        parseFault1="String 9 Reverse Connection Fault";
                     if(fault1==457)
                        parseFault1="String 10 Reverse Connection Fault";
                     if(fault1==458)
                        parseFault1="String 11 Reverse Connection Fault";
                     if(fault1==459)
                        parseFault1="String 12 Reverse Connection Fault";
                     if(fault1==460)
                        parseFault1="String 13 Reverse Connection Fault";
                     if(fault1==461)
                        parseFault1="String 14 Reverse Connection Fault";
                     if(fault1==462)
                        parseFault1="String 15 Reverse Connection Fault";
                     if(fault1==463)
                        parseFault1="String 16 Reverse Connection Fault";
                     if(fault1==464)
                        parseFault1="String 17 Reverse Connection Fault";
                     if(fault1==465)
                        parseFault1="String 18 Reverse Connection Fault";
                     if(fault1==466)
                        parseFault1="String 19 Reverse Connection Fault";
                     if(fault1==467)
                        parseFault1="String 20 Reverse Connection Fault";
                     if(fault1==468)
                        parseFault1="String 21 Reverse Connection Fault";
                     if(fault1==469)
                        parseFault1="String 22 Reverse Connection Fault";
                     if(fault1==470)
                        parseFault1="String 23 Reverse Connection Fault";
                     if(fault1==471)
                        parseFault1="String 24 Reverse Connection Fault";
                         
                     let alarm1=parsedData[17];
                     let parseAlarm1="";
                     
                     if(alarm1==59)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==70)
                        parseAlarm1="Fan Alarm";
                     if(alarm1==71)
                        parseAlarm1="AC-Side SPD Alarm";
                     if(alarm1==72)
                        parseAlarm1="DC-Side SPD Alarm";
                     if(alarm1==74)
                        parseAlarm1="Communication Alarm";
                     if(alarm1==76)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==78)
                         parseAlarm1="PV1 Abnormal";
                     if(alarm1==79)
                        parseAlarm1="PV2 Abnormal";
                     if(alarm1==80)
                        parseAlarm1="PV3 Abnormal";
                     if(alarm1==81)
                        parseAlarm1="PV4 Abnormal";
                     if(alarm1==87)
                        parseAlarm1="Electric Are Detection Module Abnormal";
                     if(alarm1==88)
                        parseAlarm1="Electric Are Fault";
                     if(alarm1==89)
                        parseAlarm1="Electric Are Detection Disabled";
                     if(alarm1==105)
                        parseAlarm1="Grid-Side Protection Self-Check Failure";
                     if(alarm1==106)
                         parseAlarm1="Grounding Cable Fault";
                     if(alarm1==116)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==117)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==220)
                        parseAlarm1="PV5 Abnormal";
                     if(alarm1==221)
                        parseAlarm1="PV6 Abnormal";
                     if(alarm1==222)
                        parseAlarm1="PV7 Abnormal}";
                     if(alarm1==223)
                        parseAlarm1="PV8 Abnormal";
                     if(alarm1==224)
                        parseAlarm1="PV9 Abnormal";
                     if(alarm1==225)
                        parseAlarm1="PV10 Abnormal}";
                     if(alarm1==226)
                        parseAlarm1="PV11 Abnormal";
                     if(alarm1==227)
                        parseAlarm1="PV12 Abnormal";
                     if(alarm1==514)
                        parseAlarm1="Meter Communication Abnormal Alarm";
                     if(alarm1==532)
                        parseAlarm1="String 1 Reverse Connection Alarm";
                     if(alarm1==533)
                        parseAlarm1="String 2 Reverse Connection Alarm";
                     if(alarm1==534)
                        parseAlarm1="String 3 Reverse Connection Alarm";
                     if(alarm1==535)
                        parseAlarm1="String 4 Reverse Connection Alarm";
                     if(alarm1==536)
                        parseAlarm1="String 5 Reverse Connection Alarm";
                     if(alarm1==537)
                        parseAlarm1="String 6 Reverse Connection Alarm";
                     if(alarm1==538)
                        parseAlarm1="String 7 Reverse Connection Alarm";
                     if(alarm1==539)
                        parseAlarm1="String 8 Reverse Connection Alarm";
                     if(alarm1==540)
                        parseAlarm1="String 9 Reverse Connection Alarm";
                     if(alarm1==541)
                        parseAlarm1="String 10 Reverse Connection Alarm";
                     if(alarm1==542)
                        parseAlarm1="String 11 Reverse Connection Alarm";
                     if(alarm1==543)
                        parseAlarm1="String 12 Reverse Connection Alarm";
                     if(alarm1==544)
                        parseAlarm1="String 13 Reverse Connection Alarm";
                     if(alarm1==545)
                        parseAlarm1="String 14 Reverse Connection Alarm";
                     if(alarm1==546)
                        parseAlarm1="String 15 Reverse Connection Alarm";
                     if(alarm1==547)
                        parseAlarm1="String 16 Reverse Connection Alarm";
                     if(alarm1==564)
                        parseAlarm1="String 17 Reverse Connection Alarm";
                     if(alarm1==565)
                        parseAlarm1="String 18 Reverse Connection Alarm";
                     if(alarm1==566)
                        parseAlarm1="String 19 Reverse Connection Alarm";
                     if(alarm1==567)
                        parseAlarm1="String 20 Reverse Connection Alarm";
                     if(alarm1==568)
                        parseAlarm1="String 21 Reverse Connection Alarm";
                     if(alarm1==569)
                        parseAlarm1="String 22 Reverse Connection Alarm";
                     if(alarm1==570)
                        parseAlarm1="String 23 Reverse Connection Alarm";
                     if(alarm1==571)
                        parseAlarm1="String 24 Reverse Connection Alarm";
                     if(alarm1==548)
                        parseAlarm1="String 1 Abnormal Alarm";
                     if(alarm1==549)
                        parseAlarm1="String 2 Abnormal Alarm";
                     if(alarm1==550)
                        parseAlarm1="String 3 Abnormal Alarm";
                     if(alarm1==551)
                        parseAlarm1="String 4 Abnormal Alarm";
                     if(alarm1==552)
                        parseAlarm1="String 5 Abnormal Alarm";
                     if(alarm1==553)
                        parseAlarm1="String 6 Abnormal Alarm";
                     if(alarm1==554)
                        parseAlarm1="String 7 Abnormal Alarm";
                     if(alarm1==555)
                        parseAlarm1="String 8 Abnormal Alarm";
                     if(alarm1==556)
                        parseAlarm1="String 9 Abnormal Alarm";
                     if(alarm1==557)
                        parseAlarm1="String 10 Abnormal Alarm";
                     if(alarm1==558)
                        parseAlarm1="String 11 Abnormal Alarm";
                     if(alarm1==559)
                        parseAlarm1="String 12 Abnormal Alarm";
                     if(alarm1==560)
                        parseAlarm1="String 13 Abnormal Alarm";
                     if(alarm1==561)
                        parseAlarm1="String 14 Abnormal Alarm";
                     if(alarm1==562)
                        parseAlarm1="String 15 Abnormal Alarm";
                     if(alarm1==563)
                        parseAlarm1="String 16 Abnormal Alarm";
                     if(alarm1==580)
                        parseAlarm1="String 17 Abnormal Alarm";
                     if(alarm1==581)
                        parseAlarm1="String 18 Abnormal Alarm";
                     if(alarm1==582)
                        parseAlarm1="String 19 Abnormal Alarm";
                     if(alarm1==583)
                        parseAlarm1="String 20 Abnormal Alarm";
                     if(alarm1==584)
                        parseAlarm1="String 21 Abnormal Alarm";
                     if(alarm1==585)
                        parseAlarm1="String 22 Abnormal Alarm";
                     if(alarm1==586)
                        parseAlarm1="String 23 Abnormal Alarm";
                     if(alarm1==587)
                        parseAlarm1="String 24 Abnormal Alarm";

                     //Remove Strings garbage values
                     if(parsedData[40]==65535)
                         parsedData[40]=0;
                     if(parsedData[41]==65535)
                         parsedData[41]=0;
                     if(parsedData[42]==65535)
                         parsedData[42]=0;
                     if(parsedData[43]==65535)
                         parsedData[43]=0;
                     if(parsedData[44]==65535)
                         parsedData[44]=0;
                     if(parsedData[45]==65535)
                         parsedData[45]=0;
                     if(parsedData[46]==65535)
                         parsedData[46]=0;
                     if(parsedData[47]==65535)
                         parsedData[47]=0;
                     if(parsedData[48]==65535)
                         parsedData[48]=0;
                     if(parsedData[49]==65535)
                         parsedData[49]=0;
                     if(parsedData[50]==65535)
                         parsedData[50]=0;
                     if(parsedData[51]==65535)
                         parsedData[51]=0;
                     if(parsedData[52]==65535)
                         parsedData[52]=0;
                     if(parsedData[53]==65535)
                         parsedData[53]=0;
                     if(parsedData[54]==65535)
                         parsedData[54]=0;
                     if(parsedData[55]==65535)
                         parsedData[55]=0;
                     if(parsedData[56]==65535)
                         parsedData[56]=0;
                     if(parsedData[57]==65535)
                         parsedData[57]=0;
                     if(parsedData[58]==65535)
                         parsedData[58]=0;
                     if(parsedData[59]==65535)
                         parsedData[59]=0;
                      
                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                         parsedData[2]=0;
                         parsedData[3]=0;
                    }

                    if(parsedData[4]==65535 && parsedData[5]==65535){
                         parsedData[4]=0;
                         parsedData[5]=0;
                    }

                    if(parsedData[6]==65535 && parsedData[7]==65535){
                         parsedData[6]=0;
                         parsedData[7]=0;
                    }

                    if(parsedData[18]==65535 && parsedData[19]==65535){
                         parsedData[18]=0;
                         parsedData[19]=0;
                    }

                    if(parsedData[20]==65535 && parsedData[21]==65535){
                        parsedData[20]=0;
                        parsedData[21]=0;
                    }

                    if(parsedData[22]==65535 && parsedData[23]==65535){
                        parsedData[22]=0;
                        parsedData[23]=0;
                    }

                    if(parsedData[24]==65535 && parsedData[25]==65535){
                        parsedData[24]=0;
                        parsedData[25]=0;
                    }

                    if(parsedData[26]==65535 && parsedData[27]==65535){
                        parsedData[26]=0;
                        parsedData[27]=0;
                    }

                    if(parsedData[28]==65535 && parsedData[29]==65535){
                        parsedData[28]=0;
                        parsedData[29]=0;
                    }

                    if(parsedData[30]==65535 && parsedData[31]==65535){
                        parsedData[30]=0;
                        parsedData[31]=0;
                    }

                    if(parsedData[32]==65535 && parsedData[33]==65535){
                        parsedData[32]=0;
                        parsedData[33]=0;
                    }

                    if(parsedData[34]==65535 && parsedData[35]==65535){
                        parsedData[34]=0;
                        parsedData[35]=0;
                    }

                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
						parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[39]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[20]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[22]*0.1).toFixed(2);
                   Data.voltageMPPT7=(parsedData[24]*0.1).toFixed(2);
                   Data.voltageMPPT8=(parsedData[26]*0.1).toFixed(2);
                   Data.voltageMPPT9=(parsedData[28]*0.1).toFixed(2);
                   Data.voltageMPPT10=(parsedData[30]*0.1).toFixed(2);
                   Data.voltageMPPT11=(parsedData[32]*0.1).toFixed(2);
                   Data.voltageMPPT12=(parsedData[34]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.currentMPPT5=(parsedData[21]*0.1).toFixed(2);
                   Data.currentMPPT6=(parsedData[23]*0.1).toFixed(2);
                   Data.currentMPPT7=(parsedData[25]*0.1).toFixed(2);
                   Data.currentMPPT8=(parsedData[27]*0.1).toFixed(2);
                   Data.currentMPPT9=(parsedData[29]*0.1).toFixed(2);
                   Data.currentMPPT10=(parsedData[31]*0.1).toFixed(2);
                   Data.currentMPPT11=(parsedData[33]*0.1).toFixed(2);
                   Data.currentMPPT12=(parsedData[35]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.powerMPPT7=((parseFloat(Data.voltageMPPT7)*parseFloat(Data.currentMPPT7))/1000).toFixed(2);
                   Data.powerMPPT8=((parseFloat(Data.voltageMPPT8)*parseFloat(Data.currentMPPT8))/1000).toFixed(2);
                   Data.powerMPPT9=((parseFloat(Data.voltageMPPT9)*parseFloat(Data.currentMPPT9))/1000).toFixed(2);
                   Data.powerMPPT10=((parseFloat(Data.voltageMPPT10)*parseFloat(Data.currentMPPT10))/1000).toFixed(2);
                   Data.powerMPPT11=((parseFloat(Data.voltageMPPT11)*parseFloat(Data.currentMPPT11))/1000).toFixed(2);
                   Data.powerMPPT12=((parseFloat(Data.voltageMPPT12)*parseFloat(Data.currentMPPT12))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6,
                    Data.currentMPPT7,Data.currentMPPT8,Data.currentMPPT9,Data.currentMPPT10,Data.currentMPPT11,Data.currentMPPT12);
                   Data.inputPower=(parsedData[38]/1000).toFixed(2);
                   Data.currentString1=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[47]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[48]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[49]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[50]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[51]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[52]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[53]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[54]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[55]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[56]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[57]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[58]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[59]*0.01).toFixed(2);
                    //Data.currentString21=(parsedData[60]*0.01).toFixed(2);
                    //Data.currentString22=(parsedData[61]*0.01).toFixed(2);
                    //Data.currentString23=(parsedData[62]*0.01).toFixed(2);
                    //Data.currentString24=(parsedData[63]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[36]*1);
                   Data.totalRuntime=parseInt(parsedData[37]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                }
                else if(dataLength==136)  //Sungrow With String V1.2 8-Bit 24 Strings
                {
                    parametersCount=64;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<36){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=36 && i<40){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                        else{
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                     //Status Conversion
                     if(parsedData[16]==0)
                     parsedData[16]='Running';
                     else if(parsedData[16]==32768)
                     parsedData[16]='Stop';
                     else if(parsedData[16]==4864)
                     parsedData[16]='Key Stop';
                     else if(parsedData[16]==5376)
                     parsedData[16]='Emergency Stop';
                     else if(parsedData[16]==5120)
                     parsedData[16]='StandBy';
                     else if(parsedData[16]==4608)
                     parsedData[16]='Initial Standby';
                     else if(parsedData[16]==5632)
                     parsedData[16]='Starting';
                     else if(parsedData[16]==37120)
                     parsedData[16]='Alarm Run';
                     else if(parsedData[16]==33024)
                     parsedData[16]='Derating Run';
                     else if(parsedData[16]==33280)
                     parsedData[16]='Dispatch Run';
                     else if(parsedData[16]==21760)
                     parsedData[16]='Fault';
                     else if(parsedData[16]==9472)
                     parsedData[16]='Communicate Fault';
                     else
                     parsedData[16]=undefined;
 

                     //Fault and Alarm
                     let fault1=parsedData[17];
                     let parseFault1="";

                     if(fault1==2)
                        parseFault1="Grid Overvoltage";
                     if(fault1==3)
                        parseFault1="Grid Transient Overvoltage";
                     if(fault1==4)
                        parseFault1="Grid Undervoltage";
                     if(fault1==5)
                        parseFault1="Grid Lowvoltage";
                     if(fault1==7)
                        parseFault1="AC Instantaneous Overcurrent";
                     if(fault1==8)
                        parseFault1="Grid Overfrequency";
                     if(fault1==9)
                        parseFault1="Grid Underfrequency";
                     if(fault1==10)
                        parseFault1="Grid Power Outage";
                     if(fault1==11)
                        parseFault1="Device Abnormal";
                     if(fault1==12)
                        parseFault1="Excessive Leakage Current";
                     if(fault1==13)
                        parseFault1="Grid Abnormal";
                     if(fault1==14)
                        parseFault1="10-Mint Grid Overvoltage";
                     if(fault1==15)
                        parseFault1="Grid High Voltage";
                     if(fault1==16)
                        parseFault1="Output Overload";
                     if(fault1==17)
                        parseFault1="Grid Voltage Unbalance";
                     if(fault1==19)
                        parseFault1="Device Abnormal";
                     if(fault1==20)
                        parseFault1="Device Abnormal";
                     if(fault1==21)
                        parseFault1="Device Abnormal";
                     if(fault1==22)
                        parseFault1="Device Abnormal";
                     if(fault1==23)
                        parseFault1="PV Connection Fault";
                     if(fault1==24)
                        parseFault1="Device Abnormal";
                     if(fault1==25)
                        parseFault1="Device Abnormal";
                     if(fault1==30) 
                        parseFault1="Device Abnormal";
                     if(fault1==31)
                        parseFault1="Device Abnormal";
                     if(fault1==32)
                        parseFault1="Device Abnormal";
                     if(fault1==33)
                        parseFault1="Device Abnormal";
                     if(fault1==34)
                        parseFault1="Device Abnormal";
                     if(fault1==36)
                        parseFault1="Excessively High Module Temperture";
                     if(fault1==37)
                        parseFault1="Excessively High Ambient Temperture";
                     if(fault1==38)
                        parseFault1="Device Abnormal";
                     if(fault1==39)
                        parseFault1="Low System Insulation Resistance";
                     if(fault1==40)
                        parseFault1="Device Abnormal";
                     if(fault1==41)
                        parseFault1="Device Abnormal";
                     if(fault1==42)
                        parseFault1="Device Abnormal";
                     if(fault1==43)
                        parseFault1="Low Ambient Temperture";
                     if(fault1==44)
                        parseFault1="Device Abnormal";
                     if(fault1==45)
                        parseFault1="Device Abnormal";
                     if(fault1==46) 
                        parseFault1="Device Abnormal";
                     if(fault1==47)
                        parseFault1="PV Input Configuration Abnormal";
                     if(fault1==48)
                        parseFault1="Device Abnormal";
                     if(fault1==49)
                        parseFault1="Device Abnormal";
                     if(fault1==50)
                        parseFault1="Device Abnormal";
                     if(fault1==53)
                        parseFault1="Device Abnormal";
                     if(fault1==54)
                        parseFault1="Device Abnormal";
                     if(fault1==55)
                        parseFault1="Device Abnormal";
                     if(fault1==56)
                        parseFault1="Device Abnormal";
                     if(fault1==60)
                        parseFault1="Device Abnormal";
                     if(fault1==88)
                        parseFault1="Electric Are Fault";
                     if(fault1==105)
                        parseFault1="Grid-Side Protection Self- Check Failure";
                     if(fault1==106)
                        parseFault1="Grounding Cable Fault";
                     if(fault1==116)
                        parseFault1="Device Abnormal";
                     if(fault1==117)
                        parseFault1="Device Abnormal";
                     if(fault1==448)
                        parseFault1="String 1 Reverse Connection Fault";
                     if(fault1==449)
                        parseFault1="String 2 Reverse Connection Fault";
                     if(fault1==450)
                        parseFault1="String 3 Reverse Connection Fault";
                     if(fault1==451)
                        parseFault1="String 4 Reverse Connection Fault";
                     if(fault1==452)
                        parseFault1="String 5 Reverse Connection Fault";
                     if(fault1==453)
                        parseFault1="String 6 Reverse Connection Fault";
                     if(fault1==454)
                        parseFault1="String 7 Reverse Connection Fault";
                     if(fault1==455)
                        parseFault1="String 8 Reverse Connection Fault";
                     if(fault1==456)
                        parseFault1="String 9 Reverse Connection Fault";
                     if(fault1==457)
                        parseFault1="String 10 Reverse Connection Fault";
                     if(fault1==458)
                        parseFault1="String 11 Reverse Connection Fault";
                     if(fault1==459)
                        parseFault1="String 12 Reverse Connection Fault";
                     if(fault1==460)
                        parseFault1="String 13 Reverse Connection Fault";
                     if(fault1==461)
                        parseFault1="String 14 Reverse Connection Fault";
                     if(fault1==462)
                        parseFault1="String 15 Reverse Connection Fault";
                     if(fault1==463)
                        parseFault1="String 16 Reverse Connection Fault";
                     if(fault1==464)
                        parseFault1="String 17 Reverse Connection Fault";
                     if(fault1==465)
                        parseFault1="String 18 Reverse Connection Fault";
                     if(fault1==466)
                        parseFault1="String 19 Reverse Connection Fault";
                     if(fault1==467)
                        parseFault1="String 20 Reverse Connection Fault";
                     if(fault1==468)
                        parseFault1="String 21 Reverse Connection Fault";
                     if(fault1==469)
                        parseFault1="String 22 Reverse Connection Fault";
                     if(fault1==470)
                        parseFault1="String 23 Reverse Connection Fault";
                     if(fault1==471)
                        parseFault1="String 24 Reverse Connection Fault";
                         
                     let alarm1=parsedData[17];
                     let parseAlarm1="";
                     
                     if(alarm1==59)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==70)
                        parseAlarm1="Fan Alarm";
                     if(alarm1==71)
                        parseAlarm1="AC-Side SPD Alarm";
                     if(alarm1==72)
                        parseAlarm1="DC-Side SPD Alarm";
                     if(alarm1==74)
                        parseAlarm1="Communication Alarm";
                     if(alarm1==76)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==78)
                         parseAlarm1="PV1 Abnormal";
                     if(alarm1==79)
                        parseAlarm1="PV2 Abnormal";
                     if(alarm1==80)
                        parseAlarm1="PV3 Abnormal";
                     if(alarm1==81)
                        parseAlarm1="PV4 Abnormal";
                     if(alarm1==87)
                        parseAlarm1="Electric Are Detection Module Abnormal";
                     if(alarm1==88)
                        parseAlarm1="Electric Are Fault";
                     if(alarm1==89)
                        parseAlarm1="Electric Are Detection Disabled";
                     if(alarm1==105)
                        parseAlarm1="Grid-Side Protection Self-Check Failure";
                     if(alarm1==106)
                         parseAlarm1="Grounding Cable Fault";
                     if(alarm1==116)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==117)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==220)
                        parseAlarm1="PV5 Abnormal";
                     if(alarm1==221)
                        parseAlarm1="PV6 Abnormal";
                     if(alarm1==222)
                        parseAlarm1="PV7 Abnormal}";
                     if(alarm1==223)
                        parseAlarm1="PV8 Abnormal";
                     if(alarm1==224)
                        parseAlarm1="PV9 Abnormal";
                     if(alarm1==225)
                        parseAlarm1="PV10 Abnormal}";
                     if(alarm1==226)
                        parseAlarm1="PV11 Abnormal";
                     if(alarm1==227)
                        parseAlarm1="PV12 Abnormal";
                     if(alarm1==514)
                        parseAlarm1="Meter Communication Abnormal Alarm";
                     if(alarm1==532)
                        parseAlarm1="String 1 Reverse Connection Alarm";
                     if(alarm1==533)
                        parseAlarm1="String 2 Reverse Connection Alarm";
                     if(alarm1==534)
                        parseAlarm1="String 3 Reverse Connection Alarm";
                     if(alarm1==535)
                        parseAlarm1="String 4 Reverse Connection Alarm";
                     if(alarm1==536)
                        parseAlarm1="String 5 Reverse Connection Alarm";
                     if(alarm1==537)
                        parseAlarm1="String 6 Reverse Connection Alarm";
                     if(alarm1==538)
                        parseAlarm1="String 7 Reverse Connection Alarm";
                     if(alarm1==539)
                        parseAlarm1="String 8 Reverse Connection Alarm";
                     if(alarm1==540)
                        parseAlarm1="String 9 Reverse Connection Alarm";
                     if(alarm1==541)
                        parseAlarm1="String 10 Reverse Connection Alarm";
                     if(alarm1==542)
                        parseAlarm1="String 11 Reverse Connection Alarm";
                     if(alarm1==543)
                        parseAlarm1="String 12 Reverse Connection Alarm";
                     if(alarm1==544)
                        parseAlarm1="String 13 Reverse Connection Alarm";
                     if(alarm1==545)
                        parseAlarm1="String 14 Reverse Connection Alarm";
                     if(alarm1==546)
                        parseAlarm1="String 15 Reverse Connection Alarm";
                     if(alarm1==547)
                        parseAlarm1="String 16 Reverse Connection Alarm";
                     if(alarm1==564)
                        parseAlarm1="String 17 Reverse Connection Alarm";
                     if(alarm1==565)
                        parseAlarm1="String 18 Reverse Connection Alarm";
                     if(alarm1==566)
                        parseAlarm1="String 19 Reverse Connection Alarm";
                     if(alarm1==567)
                        parseAlarm1="String 20 Reverse Connection Alarm";
                     if(alarm1==568)
                        parseAlarm1="String 21 Reverse Connection Alarm";
                     if(alarm1==569)
                        parseAlarm1="String 22 Reverse Connection Alarm";
                     if(alarm1==570)
                        parseAlarm1="String 23 Reverse Connection Alarm";
                     if(alarm1==571)
                        parseAlarm1="String 24 Reverse Connection Alarm";
                     if(alarm1==548)
                        parseAlarm1="String 1 Abnormal Alarm";
                     if(alarm1==549)
                        parseAlarm1="String 2 Abnormal Alarm";
                     if(alarm1==550)
                        parseAlarm1="String 3 Abnormal Alarm";
                     if(alarm1==551)
                        parseAlarm1="String 4 Abnormal Alarm";
                     if(alarm1==552)
                        parseAlarm1="String 5 Abnormal Alarm";
                     if(alarm1==553)
                        parseAlarm1="String 6 Abnormal Alarm";
                     if(alarm1==554)
                        parseAlarm1="String 7 Abnormal Alarm";
                     if(alarm1==555)
                        parseAlarm1="String 8 Abnormal Alarm";
                     if(alarm1==556)
                        parseAlarm1="String 9 Abnormal Alarm";
                     if(alarm1==557)
                        parseAlarm1="String 10 Abnormal Alarm";
                     if(alarm1==558)
                        parseAlarm1="String 11 Abnormal Alarm";
                     if(alarm1==559)
                        parseAlarm1="String 12 Abnormal Alarm";
                     if(alarm1==560)
                        parseAlarm1="String 13 Abnormal Alarm";
                     if(alarm1==561)
                        parseAlarm1="String 14 Abnormal Alarm";
                     if(alarm1==562)
                        parseAlarm1="String 15 Abnormal Alarm";
                     if(alarm1==563)
                        parseAlarm1="String 16 Abnormal Alarm";
                     if(alarm1==580)
                        parseAlarm1="String 17 Abnormal Alarm";
                     if(alarm1==581)
                        parseAlarm1="String 18 Abnormal Alarm";
                     if(alarm1==582)
                        parseAlarm1="String 19 Abnormal Alarm";
                     if(alarm1==583)
                        parseAlarm1="String 20 Abnormal Alarm";
                     if(alarm1==584)
                        parseAlarm1="String 21 Abnormal Alarm";
                     if(alarm1==585)
                        parseAlarm1="String 22 Abnormal Alarm";
                     if(alarm1==586)
                        parseAlarm1="String 23 Abnormal Alarm";
                     if(alarm1==587)
                        parseAlarm1="String 24 Abnormal Alarm";

                     //Remove Strings garbage values
                     if(parsedData[40]==65535)
                         parsedData[40]=0;
                     if(parsedData[41]==65535)
                         parsedData[41]=0;
                     if(parsedData[42]==65535)
                         parsedData[42]=0;
                     if(parsedData[43]==65535)
                         parsedData[43]=0;
                     if(parsedData[44]==65535)
                         parsedData[44]=0;
                     if(parsedData[45]==65535)
                         parsedData[45]=0;
                     if(parsedData[46]==65535)
                         parsedData[46]=0;
                     if(parsedData[47]==65535)
                         parsedData[47]=0;
                     if(parsedData[48]==65535)
                         parsedData[48]=0;
                     if(parsedData[49]==65535)
                         parsedData[49]=0;
                     if(parsedData[50]==65535)
                         parsedData[50]=0;
                     if(parsedData[51]==65535)
                         parsedData[51]=0;
                     if(parsedData[52]==65535)
                         parsedData[52]=0;
                     if(parsedData[53]==65535)
                         parsedData[53]=0;
                     if(parsedData[54]==65535)
                         parsedData[54]=0;
                     if(parsedData[55]==65535)
                         parsedData[55]=0;
                     if(parsedData[56]==65535)
                         parsedData[56]=0;
                     if(parsedData[57]==65535)
                         parsedData[57]=0;
                     if(parsedData[58]==65535)
                         parsedData[58]=0;
                     if(parsedData[59]==65535)
                         parsedData[59]=0;
                     if(parsedData[60]==65535)
                         parsedData[60]=0;
                     if(parsedData[61]==65535)
                         parsedData[61]=0;
                     if(parsedData[62]==65535)
                         parsedData[62]=0;
                     if(parsedData[63]==65535)
                         parsedData[63]=0;
                      
                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                         parsedData[2]=0;
                         parsedData[3]=0;
                    }

                    if(parsedData[4]==65535 && parsedData[5]==65535){
                         parsedData[4]=0;
                         parsedData[5]=0;
                    }

                    if(parsedData[6]==65535 && parsedData[7]==65535){
                         parsedData[6]=0;
                         parsedData[7]=0;
                    }

                    if(parsedData[18]==65535 && parsedData[19]==65535){
                         parsedData[18]=0;
                         parsedData[19]=0;
                    }

                    if(parsedData[20]==65535 && parsedData[21]==65535){
                        parsedData[20]=0;
                        parsedData[21]=0;
                    }

                    if(parsedData[22]==65535 && parsedData[23]==65535){
                        parsedData[22]=0;
                        parsedData[23]=0;
                    }

                    if(parsedData[24]==65535 && parsedData[25]==65535){
                        parsedData[24]=0;
                        parsedData[25]=0;
                    }

                    if(parsedData[26]==65535 && parsedData[27]==65535){
                        parsedData[26]=0;
                        parsedData[27]=0;
                    }

                    if(parsedData[28]==65535 && parsedData[29]==65535){
                        parsedData[28]=0;
                        parsedData[29]=0;
                    }

                    if(parsedData[30]==65535 && parsedData[31]==65535){
                        parsedData[30]=0;
                        parsedData[31]=0;
                    }

                    if(parsedData[32]==65535 && parsedData[33]==65535){
                        parsedData[32]=0;
                        parsedData[33]=0;
                    }

                    if(parsedData[34]==65535 && parsedData[35]==65535){
                        parsedData[34]=0;
                        parsedData[35]=0;
                    }

                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
						parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[39]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[20]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[22]*0.1).toFixed(2);
                   Data.voltageMPPT7=(parsedData[24]*0.1).toFixed(2);
                   Data.voltageMPPT8=(parsedData[26]*0.1).toFixed(2);
                   Data.voltageMPPT9=(parsedData[28]*0.1).toFixed(2);
                   Data.voltageMPPT10=(parsedData[30]*0.1).toFixed(2);
                   Data.voltageMPPT11=(parsedData[32]*0.1).toFixed(2);
                   Data.voltageMPPT12=(parsedData[34]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.currentMPPT5=(parsedData[21]*0.1).toFixed(2);
                   Data.currentMPPT6=(parsedData[23]*0.1).toFixed(2);
                   Data.currentMPPT7=(parsedData[25]*0.1).toFixed(2);
                   Data.currentMPPT8=(parsedData[27]*0.1).toFixed(2);
                   Data.currentMPPT9=(parsedData[29]*0.1).toFixed(2);
                   Data.currentMPPT10=(parsedData[31]*0.1).toFixed(2);
                   Data.currentMPPT11=(parsedData[33]*0.1).toFixed(2);
                   Data.currentMPPT12=(parsedData[35]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.powerMPPT7=((parseFloat(Data.voltageMPPT7)*parseFloat(Data.currentMPPT7))/1000).toFixed(2);
                   Data.powerMPPT8=((parseFloat(Data.voltageMPPT8)*parseFloat(Data.currentMPPT8))/1000).toFixed(2);
                   Data.powerMPPT9=((parseFloat(Data.voltageMPPT9)*parseFloat(Data.currentMPPT9))/1000).toFixed(2);
                   Data.powerMPPT10=((parseFloat(Data.voltageMPPT10)*parseFloat(Data.currentMPPT10))/1000).toFixed(2);
                   Data.powerMPPT11=((parseFloat(Data.voltageMPPT11)*parseFloat(Data.currentMPPT11))/1000).toFixed(2);
                   Data.powerMPPT12=((parseFloat(Data.voltageMPPT12)*parseFloat(Data.currentMPPT12))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6,
                    Data.currentMPPT7,Data.currentMPPT8,Data.currentMPPT9,Data.currentMPPT10,Data.currentMPPT11,Data.currentMPPT12);
                   Data.inputPower=(parsedData[38]/1000).toFixed(2);
                   Data.currentString1=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[47]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[48]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[49]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[50]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[51]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[52]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[53]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[54]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[55]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[56]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[57]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[58]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[59]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[60]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[61]*0.01).toFixed(2);
                   Data.currentString23=(parsedData[62]*0.01).toFixed(2);
                   Data.currentString24=(parsedData[63]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[36]*1);
                   Data.totalRuntime=parseInt(parsedData[37]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                }
                else if(dataLength==52)  //Sungrow With String V1.1.1 16-Bit
                {
                    parametersCount=48;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<20){
                            parsedData[i]=data[m];
                            m++;
                        }
                        else if(i>=20 && i<24){
                            parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else{
                            parsedData[i]=data[m];
                            m++;
                        }
                    }

                     //Status Conversion
                     if(parsedData[16]==0)
                     parsedData[16]='Running';
                     else if(parsedData[16]==32768)
                     parsedData[16]='Stop';
                     else if(parsedData[16]==4864)
                     parsedData[16]='Key Stop';
                     else if(parsedData[16]==5376)
                     parsedData[16]='Emergency Stop';
                     else if(parsedData[16]==5120)
                     parsedData[16]='StandBy';
                     else if(parsedData[16]==4608)
                     parsedData[16]='Initial Standby';
                     else if(parsedData[16]==5632)
                     parsedData[16]='Starting';
                     else if(parsedData[16]==37120)
                     parsedData[16]='Alarm Run';
                     else if(parsedData[16]==33024)
                     parsedData[16]='Derating Run';
                     else if(parsedData[16]==33280)
                     parsedData[16]='Dispatch Run';
                     else if(parsedData[16]==21760)
                     parsedData[16]='Fault';
                     else if(parsedData[16]==9472)
                     parsedData[16]='Communicate Fault';
                     else
                     parsedData[16]=undefined;
 

                     //Fault and Alarm
                     let fault1=parsedData[17];
                     let parseFault1="";

                     if(fault1==2)
                        parseFault1="Grid Overvoltage";
                     if(fault1==3)
                        parseFault1="Grid Transient Overvoltage";
                     if(fault1==4)
                        parseFault1="Grid Undervoltage";
                     if(fault1==5)
                        parseFault1="Grid Lowvoltage";
                     if(fault1==7)
                        parseFault1="AC Instantaneous Overcurrent";
                     if(fault1==8)
                        parseFault1="Grid Overfrequency";
                     if(fault1==9)
                        parseFault1="Grid Underfrequency";
                     if(fault1==10)
                        parseFault1="Grid Power Outage";
                     if(fault1==11)
                        parseFault1="Device Abnormal";
                     if(fault1==12)
                        parseFault1="Excessive Leakage Current";
                     if(fault1==13)
                        parseFault1="Grid Abnormal";
                     if(fault1==14)
                        parseFault1="10-Mint Grid Overvoltage";
                     if(fault1==15)
                        parseFault1="Grid High Voltage";
                     if(fault1==16)
                        parseFault1="Output Overload";
                     if(fault1==17)
                        parseFault1="Grid Voltage Unbalance";
                     if(fault1==19)
                        parseFault1="Device Abnormal";
                     if(fault1==20)
                        parseFault1="Device Abnormal";
                     if(fault1==21)
                        parseFault1="Device Abnormal";
                     if(fault1==22)
                        parseFault1="Device Abnormal";
                     if(fault1==23)
                        parseFault1="PV Connection Fault";
                     if(fault1==24)
                        parseFault1="Device Abnormal";
                     if(fault1==25)
                        parseFault1="Device Abnormal";
                     if(fault1==30) 
                        parseFault1="Device Abnormal";
                     if(fault1==31)
                        parseFault1="Device Abnormal";
                     if(fault1==32)
                        parseFault1="Device Abnormal";
                     if(fault1==33)
                        parseFault1="Device Abnormal";
                     if(fault1==34)
                        parseFault1="Device Abnormal";
                     if(fault1==36)
                        parseFault1="Excessively High Module Temperture";
                     if(fault1==37)
                        parseFault1="Excessively High Ambient Temperture";
                     if(fault1==38)
                        parseFault1="Device Abnormal";
                     if(fault1==39)
                        parseFault1="Low System Insulation Resistance";
                     if(fault1==40)
                        parseFault1="Device Abnormal";
                     if(fault1==41)
                        parseFault1="Device Abnormal";
                     if(fault1==42)
                        parseFault1="Device Abnormal";
                     if(fault1==43)
                        parseFault1="Low Ambient Temperture";
                     if(fault1==44)
                        parseFault1="Device Abnormal";
                     if(fault1==45)
                        parseFault1="Device Abnormal";
                     if(fault1==46) 
                        parseFault1="Device Abnormal";
                     if(fault1==47)
                        parseFault1="PV Input Configuration Abnormal";
                     if(fault1==48)
                        parseFault1="Device Abnormal";
                     if(fault1==49)
                        parseFault1="Device Abnormal";
                     if(fault1==50)
                        parseFault1="Device Abnormal";
                     if(fault1==53)
                        parseFault1="Device Abnormal";
                     if(fault1==54)
                        parseFault1="Device Abnormal";
                     if(fault1==55)
                        parseFault1="Device Abnormal";
                     if(fault1==56)
                        parseFault1="Device Abnormal";
                     if(fault1==60)
                        parseFault1="Device Abnormal";
                     if(fault1==88)
                        parseFault1="Electric Are Fault";
                     if(fault1==105)
                        parseFault1="Grid-Side Protection Self- Check Failure";
                     if(fault1==106)
                        parseFault1="Grounding Cable Fault";
                     if(fault1==116)
                        parseFault1="Device Abnormal";
                     if(fault1==117)
                        parseFault1="Device Abnormal";
                     if(fault1==448)
                        parseFault1="String 1 Reverse Connection Fault";
                     if(fault1==449)
                        parseFault1="String 2 Reverse Connection Fault";
                     if(fault1==450)
                        parseFault1="String 3 Reverse Connection Fault";
                     if(fault1==451)
                        parseFault1="String 4 Reverse Connection Fault";
                     if(fault1==452)
                        parseFault1="String 5 Reverse Connection Fault";
                     if(fault1==453)
                        parseFault1="String 6 Reverse Connection Fault";
                     if(fault1==454)
                        parseFault1="String 7 Reverse Connection Fault";
                     if(fault1==455)
                        parseFault1="String 8 Reverse Connection Fault";
                     if(fault1==456)
                        parseFault1="String 9 Reverse Connection Fault";
                     if(fault1==457)
                        parseFault1="String 10 Reverse Connection Fault";
                     if(fault1==458)
                        parseFault1="String 11 Reverse Connection Fault";
                     if(fault1==459)
                        parseFault1="String 12 Reverse Connection Fault";
                     if(fault1==460)
                        parseFault1="String 13 Reverse Connection Fault";
                     if(fault1==461)
                        parseFault1="String 14 Reverse Connection Fault";
                     if(fault1==462)
                        parseFault1="String 15 Reverse Connection Fault";
                     if(fault1==463)
                        parseFault1="String 16 Reverse Connection Fault";
                     if(fault1==464)
                        parseFault1="String 17 Reverse Connection Fault";
                     if(fault1==465)
                        parseFault1="String 18 Reverse Connection Fault";
                     if(fault1==466)
                        parseFault1="String 19 Reverse Connection Fault";
                     if(fault1==467)
                        parseFault1="String 20 Reverse Connection Fault";
                     if(fault1==468)
                        parseFault1="String 21 Reverse Connection Fault";
                     if(fault1==469)
                        parseFault1="String 22 Reverse Connection Fault";
                     if(fault1==470)
                        parseFault1="String 23 Reverse Connection Fault";
                     if(fault1==471)
                        parseFault1="String 24 Reverse Connection Fault";
                         
                     let alarm1=parsedData[17];
                     let parseAlarm1="";
                     
                     if(alarm1==59)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==70)
                        parseAlarm1="Fan Alarm";
                     if(alarm1==71)
                        parseAlarm1="AC-Side SPD Alarm";
                     if(alarm1==72)
                        parseAlarm1="DC-Side SPD Alarm";
                     if(alarm1==74)
                        parseAlarm1="Communication Alarm";
                     if(alarm1==76)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==78)
                         parseAlarm1="PV1 Abnormal";
                     if(alarm1==79)
                        parseAlarm1="PV2 Abnormal";
                     if(alarm1==80)
                        parseAlarm1="PV3 Abnormal";
                     if(alarm1==81)
                        parseAlarm1="PV4 Abnormal";
                     if(alarm1==87)
                        parseAlarm1="Electric Are Detection Module Abnormal";
                     if(alarm1==88)
                        parseAlarm1="Electric Are Fault";
                     if(alarm1==89)
                        parseAlarm1="Electric Are Detection Disabled";
                     if(alarm1==105)
                        parseAlarm1="Grid-Side Protection Self-Check Failure";
                     if(alarm1==106)
                         parseAlarm1="Grounding Cable Fault";
                     if(alarm1==116)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==117)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==220)
                        parseAlarm1="PV5 Abnormal";
                     if(alarm1==221)
                        parseAlarm1="PV6 Abnormal";
                     if(alarm1==222)
                        parseAlarm1="PV7 Abnormal}";
                     if(alarm1==223)
                        parseAlarm1="PV8 Abnormal";
                     if(alarm1==224)
                        parseAlarm1="PV9 Abnormal";
                     if(alarm1==225)
                        parseAlarm1="PV10 Abnormal}";
                     if(alarm1==226)
                        parseAlarm1="PV11 Abnormal";
                     if(alarm1==227)
                        parseAlarm1="PV12 Abnormal";
                     if(alarm1==514)
                        parseAlarm1="Meter Communication Abnormal Alarm";
                     if(alarm1==532)
                        parseAlarm1="String 1 Reverse Connection Alarm";
                     if(alarm1==533)
                        parseAlarm1="String 2 Reverse Connection Alarm";
                     if(alarm1==534)
                        parseAlarm1="String 3 Reverse Connection Alarm";
                     if(alarm1==535)
                        parseAlarm1="String 4 Reverse Connection Alarm";
                     if(alarm1==536)
                        parseAlarm1="String 5 Reverse Connection Alarm";
                     if(alarm1==537)
                        parseAlarm1="String 6 Reverse Connection Alarm";
                     if(alarm1==538)
                        parseAlarm1="String 7 Reverse Connection Alarm";
                     if(alarm1==539)
                        parseAlarm1="String 8 Reverse Connection Alarm";
                     if(alarm1==540)
                        parseAlarm1="String 9 Reverse Connection Alarm";
                     if(alarm1==541)
                        parseAlarm1="String 10 Reverse Connection Alarm";
                     if(alarm1==542)
                        parseAlarm1="String 11 Reverse Connection Alarm";
                     if(alarm1==543)
                        parseAlarm1="String 12 Reverse Connection Alarm";
                     if(alarm1==544)
                        parseAlarm1="String 13 Reverse Connection Alarm";
                     if(alarm1==545)
                        parseAlarm1="String 14 Reverse Connection Alarm";
                     if(alarm1==546)
                        parseAlarm1="String 15 Reverse Connection Alarm";
                     if(alarm1==547)
                        parseAlarm1="String 16 Reverse Connection Alarm";
                     if(alarm1==564)
                        parseAlarm1="String 17 Reverse Connection Alarm";
                     if(alarm1==565)
                        parseAlarm1="String 18 Reverse Connection Alarm";
                     if(alarm1==566)
                        parseAlarm1="String 19 Reverse Connection Alarm";
                     if(alarm1==567)
                        parseAlarm1="String 20 Reverse Connection Alarm";
                     if(alarm1==568)
                        parseAlarm1="String 21 Reverse Connection Alarm";
                     if(alarm1==569)
                        parseAlarm1="String 22 Reverse Connection Alarm";
                     if(alarm1==570)
                        parseAlarm1="String 23 Reverse Connection Alarm";
                     if(alarm1==571)
                        parseAlarm1="String 24 Reverse Connection Alarm";
                     if(alarm1==548)
                        parseAlarm1="String 1 Abnormal Alarm";
                     if(alarm1==549)
                        parseAlarm1="String 2 Abnormal Alarm";
                     if(alarm1==550)
                        parseAlarm1="String 3 Abnormal Alarm";
                     if(alarm1==551)
                        parseAlarm1="String 4 Abnormal Alarm";
                     if(alarm1==552)
                        parseAlarm1="String 5 Abnormal Alarm";
                     if(alarm1==553)
                        parseAlarm1="String 6 Abnormal Alarm";
                     if(alarm1==554)
                        parseAlarm1="String 7 Abnormal Alarm";
                     if(alarm1==555)
                        parseAlarm1="String 8 Abnormal Alarm";
                     if(alarm1==556)
                        parseAlarm1="String 9 Abnormal Alarm";
                     if(alarm1==557)
                        parseAlarm1="String 10 Abnormal Alarm";
                     if(alarm1==558)
                        parseAlarm1="String 11 Abnormal Alarm";
                     if(alarm1==559)
                        parseAlarm1="String 12 Abnormal Alarm";
                     if(alarm1==560)
                        parseAlarm1="String 13 Abnormal Alarm";
                     if(alarm1==561)
                        parseAlarm1="String 14 Abnormal Alarm";
                     if(alarm1==562)
                        parseAlarm1="String 15 Abnormal Alarm";
                     if(alarm1==563)
                        parseAlarm1="String 16 Abnormal Alarm";
                     if(alarm1==580)
                        parseAlarm1="String 17 Abnormal Alarm";
                     if(alarm1==581)
                        parseAlarm1="String 18 Abnormal Alarm";
                     if(alarm1==582)
                        parseAlarm1="String 19 Abnormal Alarm";
                     if(alarm1==583)
                        parseAlarm1="String 20 Abnormal Alarm";
                     if(alarm1==584)
                        parseAlarm1="String 21 Abnormal Alarm";
                     if(alarm1==585)
                        parseAlarm1="String 22 Abnormal Alarm";
                     if(alarm1==586)
                        parseAlarm1="String 23 Abnormal Alarm";
                     if(alarm1==587)
                        parseAlarm1="String 24 Abnormal Alarm";

                     //Remove Strings garbage values
                     if(parsedData[24]==65535)
                         parsedData[24]=0;
                     if(parsedData[25]==65535)
                         parsedData[25]=0;
                     if(parsedData[26]==65535)
                         parsedData[26]=0;
                     if(parsedData[27]==65535)
                         parsedData[27]=0;
                     if(parsedData[28]==65535)
                         parsedData[28]=0;
                     if(parsedData[29]==65535)
                         parsedData[29]=0;
                     if(parsedData[30]==65535)
                         parsedData[30]=0;
                     if(parsedData[31]==65535)
                         parsedData[31]=0;
                     if(parsedData[32]==65535)
                         parsedData[32]=0;
                     if(parsedData[33]==65535)
                         parsedData[33]=0;
                     if(parsedData[34]==65535)
                         parsedData[34]=0;
                     if(parsedData[35]==65535)
                         parsedData[35]=0;
                     if(parsedData[36]==65535)
                         parsedData[36]=0;
                     if(parsedData[37]==65535)
                         parsedData[37]=0;
                     if(parsedData[38]==65535)
                         parsedData[38]=0;
                     if(parsedData[39]==65535)
                         parsedData[39]=0;
                     if(parsedData[40]==65535)
                         parsedData[40]=0;
                     if(parsedData[41]==65535)
                         parsedData[41]=0;
                     if(parsedData[42]==65535)
                         parsedData[42]=0;
                     if(parsedData[43]==65535)
                         parsedData[43]=0;
                     if(parsedData[44]==65535)
                         parsedData[44]=0;
                     if(parsedData[45]==65535)
                         parsedData[45]=0;
                     if(parsedData[46]==65535)
                         parsedData[46]=0;
                     if(parsedData[47]==65535)
                         parsedData[47]=0;
                      
                     //Remove MPPT garbage values
                     if(parsedData[2]==65535 && parsedData[3]==65535){
                         parsedData[2]=0;
                         parsedData[3]=0;
                     }
                     if(parsedData[4]==65535 && parsedData[5]==65535){
                         parsedData[4]=0;
                         parsedData[5]=0;
                     }
                     if(parsedData[6]==65535 && parsedData[7]==65535){
                         parsedData[6]=0;
                         parsedData[7]=0;
                     }
                     if(parsedData[18]==65535 && parsedData[19]==65535){
                         parsedData[18]=0;
                         parsedData[19]=0;
                     }

                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
						parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[23]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4);
                   Data.inputPower=(parsedData[22]/1000).toFixed(2);
                   Data.currentString1=(parsedData[24]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[25]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[26]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[27]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[28]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[29]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[30]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[31]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[32]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[38]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[39]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString23=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString24=(parsedData[47]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[20]*1);
                   Data.totalRuntime=parseInt(parsedData[21]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                }
                else if(dataLength==68)  //Sungrow With String V1.1.2 16-Bit
                {
                    parametersCount=64;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<36){
                            parsedData[i]=data[m];
                            m++;
                        }
                        else if(i>=36 && i<40){
                            parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else{
                            parsedData[i]=data[m];
                            m++;
                        }
                    }

                     //Status Conversion
                     //Status Conversion
                     if(parsedData[16]==0)
                     parsedData[16]='Running';
                     else if(parsedData[16]==32768)
                     parsedData[16]='Stop';
                     else if(parsedData[16]==4864)
                     parsedData[16]='Key Stop';
                     else if(parsedData[16]==5376)
                     parsedData[16]='Emergency Stop';
                     else if(parsedData[16]==5120)
                     parsedData[16]='StandBy';
                     else if(parsedData[16]==4608)
                     parsedData[16]='Initial Standby';
                     else if(parsedData[16]==5632)
                     parsedData[16]='Starting';
                     else if(parsedData[16]==37120)
                     parsedData[16]='Alarm Run';
                     else if(parsedData[16]==33024)
                     parsedData[16]='Derating Run';
                     else if(parsedData[16]==33280)
                     parsedData[16]='Dispatch Run';
                     else if(parsedData[16]==21760)
                     parsedData[16]='Fault';
                     else if(parsedData[16]==9472)
                     parsedData[16]='Communicate Fault';
                     else
                     parsedData[16]=undefined;
 

                     //Fault and Alarm
                     let fault1=parsedData[17];
                     let parseFault1="";

                     if(fault1==2)
                        parseFault1="Grid Overvoltage";
                     if(fault1==3)
                        parseFault1="Grid Transient Overvoltage";
                     if(fault1==4)
                        parseFault1="Grid Undervoltage";
                     if(fault1==5)
                        parseFault1="Grid Lowvoltage";
                     if(fault1==7)
                        parseFault1="AC Instantaneous Overcurrent";
                     if(fault1==8)
                        parseFault1="Grid Overfrequency";
                     if(fault1==9)
                        parseFault1="Grid Underfrequency";
                     if(fault1==10)
                        parseFault1="Grid Power Outage";
                     if(fault1==11)
                        parseFault1="Device Abnormal";
                     if(fault1==12)
                        parseFault1="Excessive Leakage Current";
                     if(fault1==13)
                        parseFault1="Grid Abnormal";
                     if(fault1==14)
                        parseFault1="10-Mint Grid Overvoltage";
                     if(fault1==15)
                        parseFault1="Grid High Voltage";
                     if(fault1==16)
                        parseFault1="Output Overload";
                     if(fault1==17)
                        parseFault1="Grid Voltage Unbalance";
                     if(fault1==19)
                        parseFault1="Device Abnormal";
                     if(fault1==20)
                        parseFault1="Device Abnormal";
                     if(fault1==21)
                        parseFault1="Device Abnormal";
                     if(fault1==22)
                        parseFault1="Device Abnormal";
                     if(fault1==23)
                        parseFault1="PV Connection Fault";
                     if(fault1==24)
                        parseFault1="Device Abnormal";
                     if(fault1==25)
                        parseFault1="Device Abnormal";
                     if(fault1==30) 
                        parseFault1="Device Abnormal";
                     if(fault1==31)
                        parseFault1="Device Abnormal";
                     if(fault1==32)
                        parseFault1="Device Abnormal";
                     if(fault1==33)
                        parseFault1="Device Abnormal";
                     if(fault1==34)
                        parseFault1="Device Abnormal";
                     if(fault1==36)
                        parseFault1="Excessively High Module Temperture";
                     if(fault1==37)
                        parseFault1="Excessively High Ambient Temperture";
                     if(fault1==38)
                        parseFault1="Device Abnormal";
                     if(fault1==39)
                        parseFault1="Low System Insulation Resistance";
                     if(fault1==40)
                        parseFault1="Device Abnormal";
                     if(fault1==41)
                        parseFault1="Device Abnormal";
                     if(fault1==42)
                        parseFault1="Device Abnormal";
                     if(fault1==43)
                        parseFault1="Low Ambient Temperture";
                     if(fault1==44)
                        parseFault1="Device Abnormal";
                     if(fault1==45)
                        parseFault1="Device Abnormal";
                     if(fault1==46) 
                        parseFault1="Device Abnormal";
                     if(fault1==47)
                        parseFault1="PV Input Configuration Abnormal";
                     if(fault1==48)
                        parseFault1="Device Abnormal";
                     if(fault1==49)
                        parseFault1="Device Abnormal";
                     if(fault1==50)
                        parseFault1="Device Abnormal";
                     if(fault1==53)
                        parseFault1="Device Abnormal";
                     if(fault1==54)
                        parseFault1="Device Abnormal";
                     if(fault1==55)
                        parseFault1="Device Abnormal";
                     if(fault1==56)
                        parseFault1="Device Abnormal";
                     if(fault1==60)
                        parseFault1="Device Abnormal";
                     if(fault1==88)
                        parseFault1="Electric Are Fault";
                     if(fault1==105)
                        parseFault1="Grid-Side Protection Self- Check Failure";
                     if(fault1==106)
                        parseFault1="Grounding Cable Fault";
                     if(fault1==116)
                        parseFault1="Device Abnormal";
                     if(fault1==117)
                        parseFault1="Device Abnormal";
                     if(fault1==448)
                        parseFault1="String 1 Reverse Connection Fault";
                     if(fault1==449)
                        parseFault1="String 2 Reverse Connection Fault";
                     if(fault1==450)
                        parseFault1="String 3 Reverse Connection Fault";
                     if(fault1==451)
                        parseFault1="String 4 Reverse Connection Fault";
                     if(fault1==452)
                        parseFault1="String 5 Reverse Connection Fault";
                     if(fault1==453)
                        parseFault1="String 6 Reverse Connection Fault";
                     if(fault1==454)
                        parseFault1="String 7 Reverse Connection Fault";
                     if(fault1==455)
                        parseFault1="String 8 Reverse Connection Fault";
                     if(fault1==456)
                        parseFault1="String 9 Reverse Connection Fault";
                     if(fault1==457)
                        parseFault1="String 10 Reverse Connection Fault";
                     if(fault1==458)
                        parseFault1="String 11 Reverse Connection Fault";
                     if(fault1==459)
                        parseFault1="String 12 Reverse Connection Fault";
                     if(fault1==460)
                        parseFault1="String 13 Reverse Connection Fault";
                     if(fault1==461)
                        parseFault1="String 14 Reverse Connection Fault";
                     if(fault1==462)
                        parseFault1="String 15 Reverse Connection Fault";
                     if(fault1==463)
                        parseFault1="String 16 Reverse Connection Fault";
                     if(fault1==464)
                        parseFault1="String 17 Reverse Connection Fault";
                     if(fault1==465)
                        parseFault1="String 18 Reverse Connection Fault";
                     if(fault1==466)
                        parseFault1="String 19 Reverse Connection Fault";
                     if(fault1==467)
                        parseFault1="String 20 Reverse Connection Fault";
                     if(fault1==468)
                        parseFault1="String 21 Reverse Connection Fault";
                     if(fault1==469)
                        parseFault1="String 22 Reverse Connection Fault";
                     if(fault1==470)
                        parseFault1="String 23 Reverse Connection Fault";
                     if(fault1==471)
                        parseFault1="String 24 Reverse Connection Fault";
                         
                     let alarm1=parsedData[17];
                     let parseAlarm1="";
                     
                     if(alarm1==59)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==70)
                        parseAlarm1="Fan Alarm";
                     if(alarm1==71)
                        parseAlarm1="AC-Side SPD Alarm";
                     if(alarm1==72)
                        parseAlarm1="DC-Side SPD Alarm";
                     if(alarm1==74)
                        parseAlarm1="Communication Alarm";
                     if(alarm1==76)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==78)
                         parseAlarm1="PV1 Abnormal";
                     if(alarm1==79)
                        parseAlarm1="PV2 Abnormal";
                     if(alarm1==80)
                        parseAlarm1="PV3 Abnormal";
                     if(alarm1==81)
                        parseAlarm1="PV4 Abnormal";
                     if(alarm1==87)
                        parseAlarm1="Electric Are Detection Module Abnormal";
                     if(alarm1==88)
                        parseAlarm1="Electric Are Fault";
                     if(alarm1==89)
                        parseAlarm1="Electric Are Detection Disabled";
                     if(alarm1==105)
                        parseAlarm1="Grid-Side Protection Self-Check Failure";
                     if(alarm1==106)
                         parseAlarm1="Grounding Cable Fault";
                     if(alarm1==116)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==117)
                        parseAlarm1="Device Abnormal";
                     if(alarm1==220)
                        parseAlarm1="PV5 Abnormal";
                     if(alarm1==221)
                        parseAlarm1="PV6 Abnormal";
                     if(alarm1==222)
                        parseAlarm1="PV7 Abnormal}";
                     if(alarm1==223)
                        parseAlarm1="PV8 Abnormal";
                     if(alarm1==224)
                        parseAlarm1="PV9 Abnormal";
                     if(alarm1==225)
                        parseAlarm1="PV10 Abnormal}";
                     if(alarm1==226)
                        parseAlarm1="PV11 Abnormal";
                     if(alarm1==227)
                        parseAlarm1="PV12 Abnormal";
                     if(alarm1==514)
                        parseAlarm1="Meter Communication Abnormal Alarm";
                     if(alarm1==532)
                        parseAlarm1="String 1 Reverse Connection Alarm";
                     if(alarm1==533)
                        parseAlarm1="String 2 Reverse Connection Alarm";
                     if(alarm1==534)
                        parseAlarm1="String 3 Reverse Connection Alarm";
                     if(alarm1==535)
                        parseAlarm1="String 4 Reverse Connection Alarm";
                     if(alarm1==536)
                        parseAlarm1="String 5 Reverse Connection Alarm";
                     if(alarm1==537)
                        parseAlarm1="String 6 Reverse Connection Alarm";
                     if(alarm1==538)
                        parseAlarm1="String 7 Reverse Connection Alarm";
                     if(alarm1==539)
                        parseAlarm1="String 8 Reverse Connection Alarm";
                     if(alarm1==540)
                        parseAlarm1="String 9 Reverse Connection Alarm";
                     if(alarm1==541)
                        parseAlarm1="String 10 Reverse Connection Alarm";
                     if(alarm1==542)
                        parseAlarm1="String 11 Reverse Connection Alarm";
                     if(alarm1==543)
                        parseAlarm1="String 12 Reverse Connection Alarm";
                     if(alarm1==544)
                        parseAlarm1="String 13 Reverse Connection Alarm";
                     if(alarm1==545)
                        parseAlarm1="String 14 Reverse Connection Alarm";
                     if(alarm1==546)
                        parseAlarm1="String 15 Reverse Connection Alarm";
                     if(alarm1==547)
                        parseAlarm1="String 16 Reverse Connection Alarm";
                     if(alarm1==564)
                        parseAlarm1="String 17 Reverse Connection Alarm";
                     if(alarm1==565)
                        parseAlarm1="String 18 Reverse Connection Alarm";
                     if(alarm1==566)
                        parseAlarm1="String 19 Reverse Connection Alarm";
                     if(alarm1==567)
                        parseAlarm1="String 20 Reverse Connection Alarm";
                     if(alarm1==568)
                        parseAlarm1="String 21 Reverse Connection Alarm";
                     if(alarm1==569)
                        parseAlarm1="String 22 Reverse Connection Alarm";
                     if(alarm1==570)
                        parseAlarm1="String 23 Reverse Connection Alarm";
                     if(alarm1==571)
                        parseAlarm1="String 24 Reverse Connection Alarm";
                     if(alarm1==548)
                        parseAlarm1="String 1 Abnormal Alarm";
                     if(alarm1==549)
                        parseAlarm1="String 2 Abnormal Alarm";
                     if(alarm1==550)
                        parseAlarm1="String 3 Abnormal Alarm";
                     if(alarm1==551)
                        parseAlarm1="String 4 Abnormal Alarm";
                     if(alarm1==552)
                        parseAlarm1="String 5 Abnormal Alarm";
                     if(alarm1==553)
                        parseAlarm1="String 6 Abnormal Alarm";
                     if(alarm1==554)
                        parseAlarm1="String 7 Abnormal Alarm";
                     if(alarm1==555)
                        parseAlarm1="String 8 Abnormal Alarm";
                     if(alarm1==556)
                        parseAlarm1="String 9 Abnormal Alarm";
                     if(alarm1==557)
                        parseAlarm1="String 10 Abnormal Alarm";
                     if(alarm1==558)
                        parseAlarm1="String 11 Abnormal Alarm";
                     if(alarm1==559)
                        parseAlarm1="String 12 Abnormal Alarm";
                     if(alarm1==560)
                        parseAlarm1="String 13 Abnormal Alarm";
                     if(alarm1==561)
                        parseAlarm1="String 14 Abnormal Alarm";
                     if(alarm1==562)
                        parseAlarm1="String 15 Abnormal Alarm";
                     if(alarm1==563)
                        parseAlarm1="String 16 Abnormal Alarm";
                     if(alarm1==580)
                        parseAlarm1="String 17 Abnormal Alarm";
                     if(alarm1==581)
                        parseAlarm1="String 18 Abnormal Alarm";
                     if(alarm1==582)
                        parseAlarm1="String 19 Abnormal Alarm";
                     if(alarm1==583)
                        parseAlarm1="String 20 Abnormal Alarm";
                     if(alarm1==584)
                        parseAlarm1="String 21 Abnormal Alarm";
                     if(alarm1==585)
                        parseAlarm1="String 22 Abnormal Alarm";
                     if(alarm1==586)
                        parseAlarm1="String 23 Abnormal Alarm";
                     if(alarm1==587)
                        parseAlarm1="String 24 Abnormal Alarm";

                     //Remove Strings garbage values
                     if(parsedData[40]==65535)
                         parsedData[40]=0;
                     if(parsedData[41]==65535)
                         parsedData[41]=0;
                     if(parsedData[42]==65535)
                         parsedData[42]=0;
                     if(parsedData[43]==65535)
                         parsedData[43]=0;
                     if(parsedData[44]==65535)
                         parsedData[44]=0;
                     if(parsedData[45]==65535)
                         parsedData[45]=0;
                     if(parsedData[46]==65535)
                         parsedData[46]=0;
                     if(parsedData[47]==65535)
                         parsedData[47]=0;
                     if(parsedData[48]==65535)
                         parsedData[48]=0;
                     if(parsedData[49]==65535)
                         parsedData[49]=0;
                     if(parsedData[50]==65535)
                         parsedData[50]=0;
                     if(parsedData[51]==65535)
                         parsedData[51]=0;
                     if(parsedData[52]==65535)
                         parsedData[52]=0;
                     if(parsedData[53]==65535)
                         parsedData[53]=0;
                     if(parsedData[54]==65535)
                         parsedData[54]=0;
                     if(parsedData[55]==65535)
                         parsedData[55]=0;
                     if(parsedData[56]==65535)
                         parsedData[56]=0;
                     if(parsedData[57]==65535)
                         parsedData[57]=0;
                     if(parsedData[58]==65535)
                         parsedData[58]=0;
                     if(parsedData[59]==65535)
                         parsedData[59]=0;
                     if(parsedData[60]==65535)
                         parsedData[60]=0;
                     if(parsedData[61]==65535)
                         parsedData[61]=0;
                     if(parsedData[62]==65535)
                         parsedData[62]=0;
                     if(parsedData[63]==65535)
                         parsedData[63]=0;
                      
                    //Remove MPPT garbage values
                    if(parsedData[2]==65535 && parsedData[3]==65535){
                         parsedData[2]=0;
                         parsedData[3]=0;
                    }

                    if(parsedData[4]==65535 && parsedData[5]==65535){
                         parsedData[4]=0;
                         parsedData[5]=0;
                    }

                    if(parsedData[6]==65535 && parsedData[7]==65535){
                         parsedData[6]=0;
                         parsedData[7]=0;
                    }

                    if(parsedData[18]==65535 && parsedData[19]==65535){
                         parsedData[18]=0;
                         parsedData[19]=0;
                    }

                    if(parsedData[20]==65535 && parsedData[21]==65535){
                        parsedData[20]=0;
                        parsedData[21]=0;
                    }

                    if(parsedData[22]==65535 && parsedData[23]==65535){
                        parsedData[22]=0;
                        parsedData[23]=0;
                    }

                    if(parsedData[24]==65535 && parsedData[25]==65535){
                        parsedData[24]=0;
                        parsedData[25]=0;
                    }

                    if(parsedData[26]==65535 && parsedData[27]==65535){
                        parsedData[26]=0;
                        parsedData[27]=0;
                    }

                    if(parsedData[28]==65535 && parsedData[29]==65535){
                        parsedData[28]=0;
                        parsedData[29]=0;
                    }

                    if(parsedData[30]==65535 && parsedData[31]==65535){
                        parsedData[30]=0;
                        parsedData[31]=0;
                    }

                    if(parsedData[32]==65535 && parsedData[33]==65535){
                        parsedData[32]=0;
                        parsedData[33]=0;
                    }

                    if(parsedData[34]==65535 && parsedData[35]==65535){
                        parsedData[34]=0;
                        parsedData[35]=0;
                    }

                    //Efficiency Check
                    if(parsedData[15] > 100)
                        parsedData[15] = parsedData[15]*0.1;

                    if(parsedData[15] > 100)
						parsedData[15] = 0;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[16]);
                   Data.temperature=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[11]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[12]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.activePower=(parsedData[39]/1000).toFixed(2);
                   Data.frequency=(parsedData[14]*0.1).toFixed(2);
                   Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[18]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[20]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[22]*0.1).toFixed(2);
                   Data.voltageMPPT7=(parsedData[24]*0.1).toFixed(2);
                   Data.voltageMPPT8=(parsedData[26]*0.1).toFixed(2);
                   Data.voltageMPPT9=(parsedData[28]*0.1).toFixed(2);
                   Data.voltageMPPT10=(parsedData[30]*0.1).toFixed(2);
                   Data.voltageMPPT11=(parsedData[32]*0.1).toFixed(2);
                   Data.voltageMPPT12=(parsedData[34]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                   Data.currentMPPT4=(parsedData[19]*0.1).toFixed(2);
                   Data.currentMPPT5=(parsedData[21]*0.1).toFixed(2);
                   Data.currentMPPT6=(parsedData[23]*0.1).toFixed(2);
                   Data.currentMPPT7=(parsedData[25]*0.1).toFixed(2);
                   Data.currentMPPT8=(parsedData[27]*0.1).toFixed(2);
                   Data.currentMPPT9=(parsedData[29]*0.1).toFixed(2);
                   Data.currentMPPT10=(parsedData[31]*0.1).toFixed(2);
                   Data.currentMPPT11=(parsedData[33]*0.1).toFixed(2);
                   Data.currentMPPT12=(parsedData[35]*0.1).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.powerMPPT7=((parseFloat(Data.voltageMPPT7)*parseFloat(Data.currentMPPT7))/1000).toFixed(2);
                   Data.powerMPPT8=((parseFloat(Data.voltageMPPT8)*parseFloat(Data.currentMPPT8))/1000).toFixed(2);
                   Data.powerMPPT9=((parseFloat(Data.voltageMPPT9)*parseFloat(Data.currentMPPT9))/1000).toFixed(2);
                   Data.powerMPPT10=((parseFloat(Data.voltageMPPT10)*parseFloat(Data.currentMPPT10))/1000).toFixed(2);
                   Data.powerMPPT11=((parseFloat(Data.voltageMPPT11)*parseFloat(Data.currentMPPT11))/1000).toFixed(2);
                   Data.powerMPPT12=((parseFloat(Data.voltageMPPT12)*parseFloat(Data.currentMPPT12))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6,
                    Data.currentMPPT7,Data.currentMPPT8,Data.currentMPPT9,Data.currentMPPT10,Data.currentMPPT11,Data.currentMPPT12);
                   Data.inputPower=(parsedData[38]/1000).toFixed(2);
                   Data.currentString1=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[47]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[48]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[49]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[50]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[51]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[52]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[53]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[54]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[55]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[56]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[57]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[58]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[59]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[60]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[61]*0.01).toFixed(2);
                   Data.currentString23=(parsedData[62]*0.01).toFixed(2);
                   Data.currentString24=(parsedData[63]*0.01).toFixed(2);
                   Data.efficiency=(parsedData[15]*0.1).toFixed(2);
                   Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[36]*1);
                   Data.totalRuntime=parseInt(parsedData[37]);
                   Data.fault=addString(parseFault1);
                   Data.warning=addString(parseAlarm1);
                }
                else{
                    return"Conflict";
                }

            break;

            case 4:         //kirlosker

                parametersCount=24;
            
                if(dataLength==68)
                {
                    for(let i=0,m=0;i<parametersCount;i++){
                        if(i>=0 && i<14){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=14 && i<24){
                            parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Waiting';
                    else if(parsedData[0]==1)
                    parsedData[0]='Running';
                    else if(parsedData[0]==3)
                    parsedData[0]='Fault';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=parsedData[13];
                    let parseFault1="";

                    if(fault1==24)
                        parseFault1='Auto Test Falied';
                    else if(fault1==25)
                        parseFault1='No AC Connection';
                    else if(fault1==26)
                        parseFault1='PV Isolation Low';
                    else if(fault1==27)
                        parseFault1='Residual I High';
                    else if(fault1==28)
                        parseFault1='Output High DCI';
                    else if(fault1==29)
                        parseFault1='PV Voltage High';
                    else if(fault1==30)
                        parseFault1='AC V Outrange';
                    else if(fault1==31)
                        parseFault1='AC F Outrange';
                    else if(fault1==32)
                        parseFault1='Module Hot';
                    else
                        parseFault1='Error: 99+x';
                    
                    parsedData[13] = parseFault1;

                    //Add data to mongoose object for Database
                   Data.status=(parsedData[0]);
                   Data.temperature=(parsedData[12]*0.1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[6]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[8]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[10]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[7]*0.1).toFixed(2);
                   Data.currentPhaseY=(parsedData[9]*0.1).toFixed(2);
                   Data.currentPhaseB=(parsedData[11]*0.1).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[18]/10000).toFixed(2);
                   Data.powerPhaseY=(parsedData[19]/10000).toFixed(2);
                   Data.powerPhaseB=(parsedData[20]/10000).toFixed(2);
                   Data.activePower=(parsedData[17]/10000).toFixed(2);
                   Data.frequency=(parsedData[5]*0.01).toFixed(2);
                   Data.voltageMPPT1=(parsedData[1]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[3]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[2]*0.1).toFixed(2);
                   Data.currentMPPT2=(parsedData[3]*0.1).toFixed(2);
                   Data.powerMPPT1=(parsedData[15]/10000).toFixed(2);
                   Data.powerMPPT2=(parsedData[16]/10000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=(parsedData[14]/10000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[21]*0.1).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[22]*0.1);
                   Data.totalRuntime=parseInt((parsedData[23]*0.5)/3600);
                   Data.fault=(parsedData[13]);

                }
                else{
                    return "Conflict";
                }       

            break;
            
            case 5:         //Chint 15kW

                parametersCount=29;
            
                if(dataLength==82)
                {
                    for(let i=0,m=0;i<parametersCount;i++){
                        if(i>=0 && i<17){
                            if(i==14 || i==15){
                                parsedData[i]=signed16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                        else if(i>=17 && i<29){
                            parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Initial Mode';
                    else if(parsedData[0]==1)
                    parsedData[0]='Standby Mode';
                    else if(parsedData[0]==3)
                    parsedData[0]='Running';
                    else if(parsedData[0]==5)
                    parsedData[0]='Fault Code';
                    else if(parsedData[0]==9)
                    parsedData[0]='Shutdown Mode';
                    else
                    parsedData[0]=undefined;
                    
                    //Error and Fault conversion
                    let error1=dectobin32Bit(parsedData[22]);
                    let parseError1="";
                    let parseFault1="";

                    if(error1[0]==1)
                        parseError1='Grid AC Over Voltage, ';
                    if(error1[1]==1)
                        parseError1+='Grid AC Under Voltage, ';
                    if(error1[2]==1)
                        parseError1+='Grid AC Absent, ';
                    if(error1[3]==1)
                        parseError1+='Grid AC Over Frequency, ';
                    if(error1[4]==1)
                        parseError1+='Grid AC Under Frequency, ';
                    if(error1[5]==1)
                        parseError1+='PV DC Over Voltage, ';
                    if(error1[6]==1)
                        parseError1+='PV Insulation Abnormal, ';
                    if(error1[7]==1)
                        parseError1+='Leakage Current Abnormal, ';
                    if(error1[8]==1)
                        parseError1+='Grid AC Voltage Higher Than Bus, ';
                    if(error1[9]==1)
                        parseFault1+='Control power Low, ';
                    if(error1[10]==1)
                        parseError1+='PV String Abnormal, ';
                    if(error1[11]==1)
                        parseError1+='PV DC Under Voltage, ';
                    if(error1[12]==1)
                        parseError1+='PV Irradiation Weak, ';
                    if(error1[13]==1)
                        parseError1+='Grid Type Unknown, ';
                    if(error1[14]==1)
                        parseFault1+='Arc Fault Unknown, ';
                    if(error1[15]==1)
                        parseError1+='Ground Current > 300mA, ';
                    if(error1[16]==1)
                        parseError1+='Output DC Over Voltage, ';
                    if(error1[17]==1)
                        parseFault1+='Inverter Relay Abnormal, ';
                    if(error1[18]==1)
                        parseFault1+='Output DC Sensor Failed, ';
                    if(error1[19]==1)
                        parseError1+='Inverter Over Temperature, ';
                    if(error1[20]==1)
                        parseFault1+='Leakage Current HCT Abnormal, ';
                    if(error1[21]==1)
                        parseError1+='PV String Reverse, ';
                    if(error1[22]==1)
                        parseFault1+='System Type Error, ';
                    if(error1[23]==1)
                        parseError1+='Fan Lock, ';
                    if(error1[24]==1)
                        parseError1+='Bus Under Voltage, ';
                    if(error1[25]==1)
                        parseError1+='Bus Over Voltage, ';
                    if(error1[26]==1)
                        parseFault1+='Internal Communication Error, ';
                    if(error1[27]==1)
                        parseFault1+='Software Incompatibility, ';
                    if(error1[28]==1)
                        parseFault1+='EEPROM Error, ';
                    if(error1[29]==1)
                        parseFault1+='Consistent Warning, ';
                    if(error1[30]==1)
                        parseFault1+='Inverter Abnormal, ';
                    if(error1[31]==1)
                        parseFault1+='Boost Abnormal, ';
                    
                    parsedData[22] = parseError1;
                    
                    // Extra faults due to merge with errors 
                    parsedData[29] = parseFault1;
                    
                    //Add data to mongoose object for Database
                   Data.status=(parsedData[0]);
                   Data.temperature=(parsedData[14]*1).toFixed(2);
                   Data.voltagePhaseR=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[4]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[7]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[2]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[5]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[8]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[17]/10000).toFixed(2);
                   Data.powerPhaseY=(parsedData[18]/10000).toFixed(2);
                   Data.powerPhaseB=(parsedData[19]/10000).toFixed(2);
                   Data.activePower=(parsedData[26]/10000).toFixed(2);
                   Data.reactivePower=(parsedData[27]/10000).toFixed(2);
                   Data.powerFactor=(parsedData[15]*0.001).toFixed(3);
                   Data.frequency=(parsedData[3]*0.01).toFixed(2);
                   Data.voltageMPPT1=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[12]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[11]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[13]*0.01).toFixed(2);
                   Data.powerMPPT1=(parsedData[20]/10000).toFixed(2);
                   Data.powerMPPT2=(parsedData[21]/10000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=add(Data.powerMPPT1,Data.powerMPPT2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[25]/1000).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[23]*1);
                   Data.totalRuntime=parseInt(parsedData[24]*1);
                   Data.error=addString(parsedData[22]);
                   Data.fault=addString(parsedData[29]);
                }
                else{
                    return "Conflict";
                } 
                
            break;

            case 6:         //Delta V1.0

                parametersCount=32;
            
                if(dataLength==72)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<28){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=28 && i<32){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==1)
                    parsedData[0]='Countdown';
                    else if(parsedData[0]==2)
                    parsedData[0]='Running';
                    else if(parsedData[0]==3)
                    parsedData[0]='No DC';
                    else if(parsedData[0]==4)
                    parsedData[0]='Fault';
                    else
                    parsedData[0]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[19]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[19]=parseError1;

                    let error2=dectobin16Bit(parsedData[20]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[20]=parseError2;

                    let error3=dectobin16Bit(parsedData[21]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[21] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[25]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[25] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[26]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[26] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[27]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[27] = parseFault3;

                    //Add data to mongoose object for Database
                   Data.status=(parsedData[0]);
                   //Data.temperature=;
                   Data.voltagePhaseR=(parsedData[1]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[5]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[9]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[2]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[6]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[10]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[3]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[7]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[11]/1000).toFixed(2);
                   Data.activePower=add(Data.powerPhaseR,Data.powerPhaseY,Data.powerPhaseB);
                   Data.frequency=(parsedData[12]*0.01).toFixed(2);
                   Data.voltageMPPT1=(parsedData[13]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[16]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[14]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[17]*0.01).toFixed(2);
                   Data.powerMPPT1=(parsedData[15]/1000).toFixed(2);
                   Data.powerMPPT2=(parsedData[18]/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=add(Data.powerMPPT1,Data.powerMPPT2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[28]*0.01).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[30]*0.01);
                   Data.dailyRuntime=parseInt(parsedData[29]/3600);
                   Data.totalRuntime=parseInt(parsedData[31]/3600);
                   Data.error=addString(parsedData[19],parsedData[20],parsedData[21]);
                   Data.fault=addString(parsedData[25],parsedData[26],parsedData[27]);
                }
                else{
                    return "Conflict";
                }
                break;

            case 8:        //Delta With String V2.0

                parametersCount=49;
            
                if(dataLength==106)     //Delta V2.0 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<45){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=45 && i<49){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[23]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[23]=parseError1;

                    let error2=dectobin16Bit(parsedData[24]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[24]=parseError2;

                    let error3=dectobin16Bit(parsedData[25]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[25] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[26]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[26] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[27]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[27] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[28]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[28] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[15]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[46]/3600);
                   Data.totalRuntime=parseInt(parsedData[48]/3600);
                   Data.error=addString(parsedData[23],parsedData[24],parsedData[25]);
                   Data.fault=addString(parsedData[26],parsedData[27],parsedData[28]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[12]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[16]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[19]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[13]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[17]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[20]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[14]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[18]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[21]/1000).toFixed(2);
                   Data.activePower=(parsedData[22]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[4]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[6]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=(parsedData[11]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[45]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[47]/100);
                   Data.currentString1=(parsedData[29]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[30]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[31]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[32]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[38]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[39]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[44]*0.01).toFixed(2);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*0.01).toFixed(2);
                        Data.currentString1=(parsedData[29]*0.01).toFixed(2);
                        Data.currentString2=(parsedData[30]*0.01).toFixed(2);
                        Data.currentString3=(parsedData[31]*0.01).toFixed(2);
                        Data.currentString4=(parsedData[32]*0.01).toFixed(2);
                        Data.currentString5=(parsedData[33]*0.01).toFixed(2);
                        Data.currentString6=(parsedData[34]*0.01).toFixed(2);
                        Data.currentString7=(parsedData[35]*0.01).toFixed(2);
                        Data.currentString8=(parsedData[36]*0.01).toFixed(2);
                        Data.currentString9=(parsedData[37]*0.01).toFixed(2);
                        Data.currentString10=(parsedData[38]*0.01).toFixed(2);
                        Data.currentString11=(parsedData[39]*0.01).toFixed(2);
                        Data.currentString12=(parsedData[40]*0.01).toFixed(2);
                        Data.currentString13=(parsedData[41]*0.01).toFixed(2);
                        Data.currentString14=(parsedData[42]*0.01).toFixed(2);
                        Data.currentString15=(parsedData[43]*0.01).toFixed(2);
                        Data.currentString16=(parsedData[44]*0.01).toFixed(2); 	 
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*0.1).toFixed(2);
                        Data.currentString1=(parsedData[29]*0.1).toFixed(2);
                        Data.currentString2=(parsedData[30]*0.1).toFixed(2);
                        Data.currentString3=(parsedData[31]*0.1).toFixed(2);
                        Data.currentString4=(parsedData[32]*0.1).toFixed(2);
                        Data.currentString5=(parsedData[33]*0.1).toFixed(2);
                        Data.currentString6=(parsedData[34]*0.1).toFixed(2);
                        Data.currentString7=(parsedData[35]*0.1).toFixed(2);
                        Data.currentString8=(parsedData[36]*0.1).toFixed(2);
                        Data.currentString9=(parsedData[37]*0.1).toFixed(2);
                        Data.currentString10=(parsedData[38]*0.1).toFixed(2);
                        Data.currentString11=(parsedData[39]*0.1).toFixed(2);
                        Data.currentString12=(parsedData[40]*0.1).toFixed(2);
                        Data.currentString13=(parsedData[41]*0.1).toFixed(2);
                        Data.currentString14=(parsedData[42]*0.1).toFixed(2);
                        Data.currentString15=(parsedData[43]*0.1).toFixed(2);
                        Data.currentString16=(parsedData[44]*0.1).toFixed(2); 
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*1).toFixed(2);
                        Data.currentString1=(parsedData[29]*1).toFixed(2);
                        Data.currentString2=(parsedData[30]*1).toFixed(2);
                        Data.currentString3=(parsedData[31]*1).toFixed(2);
                        Data.currentString4=(parsedData[32]*1).toFixed(2);
                        Data.currentString5=(parsedData[33]*1).toFixed(2);
                        Data.currentString6=(parsedData[34]*1).toFixed(2);
                        Data.currentString7=(parsedData[35]*1).toFixed(2);
                        Data.currentString8=(parsedData[36]*1).toFixed(2);
                        Data.currentString9=(parsedData[37]*1).toFixed(2);
                        Data.currentString10=(parsedData[38]*1).toFixed(2);
                        Data.currentString11=(parsedData[39]*1).toFixed(2);
                        Data.currentString12=(parsedData[40]*1).toFixed(2);
                        Data.currentString13=(parsedData[41]*1).toFixed(2);
                        Data.currentString14=(parsedData[42]*1).toFixed(2);
                        Data.currentString15=(parsedData[43]*1).toFixed(2);
                        Data.currentString16=(parsedData[44]*1).toFixed(2); 	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
                    if(SF_W==1){
                        Data.powerPhaseR=(parsedData[14]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/10000).toFixed(2);
                        Data.activePower=(parsedData[22]/10000).toFixed(2);
                        Data.inputPower=(parsedData[11]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[14]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/1000).toFixed(2);
                        Data.activePower=(parsedData[22]/1000).toFixed(2);
                        Data.inputPower=(parsedData[11]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[14]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/100).toFixed(2);
                        Data.activePower=(parsedData[22]/100).toFixed(2);
                        Data.inputPower=(parsedData[11]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[14]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/10).toFixed(2);
                        Data.activePower=(parsedData[22]/10).toFixed(2);
                        Data.inputPower=(parsedData[11]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[14]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]*1).toFixed(2);
                        Data.activePower=(parsedData[22]*1).toFixed(2);
                        Data.inputPower=(parsedData[11]*1).toFixed(2);
					}
                    
                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[45]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[47]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[45]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[47]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[45]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[47]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[45]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[47]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[45]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[47]/1).toFixed(2);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[13]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[13]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[13]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[12]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[12]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[12]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);

                   }
                }
                else if(dataLength==130)   //Delta V2.1 8-Bit
                {
                    parametersCount=61;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<57){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=57 && i<61){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[27]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[27]=parseError1;

                    let error2=dectobin16Bit(parsedData[28]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[28]=parseError2;

                    let error3=dectobin16Bit(parsedData[29]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[29] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[30]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[30] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[31]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[31] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[32]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[32] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[20]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[58]/3600);
                   Data.totalRuntime=parseInt(parsedData[60]/3600);
                   Data.error=addString(parsedData[27],parsedData[28],parsedData[29]);
                   Data.fault=addString(parsedData[30],parsedData[31],parsedData[32]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                   Data.activePower=(parsedData[16]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                   Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                   Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                   Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                   Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                   Data.inputPower=(parsedData[3]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[57]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[59]/100);
                   Data.currentString1=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[38]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[39]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[47]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[48]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[49]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[50]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[51]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[52]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[53]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[54]*0.01).toFixed(2);
                   Data.currentString23=(parsedData[55]*0.01).toFixed(2);
                   Data.currentString24=(parsedData[56]*0.01).toFixed(2);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                        Data.currentString1=(parsedData[33]*0.01).toFixed(2);
                        Data.currentString2=(parsedData[34]*0.01).toFixed(2);
                        Data.currentString3=(parsedData[35]*0.01).toFixed(2);
                        Data.currentString4=(parsedData[36]*0.01).toFixed(2);
                        Data.currentString5=(parsedData[37]*0.01).toFixed(2);
                        Data.currentString6=(parsedData[38]*0.01).toFixed(2);
                        Data.currentString7=(parsedData[39]*0.01).toFixed(2);
                        Data.currentString8=(parsedData[40]*0.01).toFixed(2);
                        Data.currentString9=(parsedData[41]*0.01).toFixed(2);
                        Data.currentString10=(parsedData[42]*0.01).toFixed(2);
                        Data.currentString11=(parsedData[43]*0.01).toFixed(2);
                        Data.currentString12=(parsedData[44]*0.01).toFixed(2);
                        Data.currentString13=(parsedData[45]*0.01).toFixed(2);
                        Data.currentString14=(parsedData[46]*0.01).toFixed(2);
                        Data.currentString15=(parsedData[47]*0.01).toFixed(2);
                        Data.currentString16=(parsedData[48]*0.01).toFixed(2);
                        Data.currentString17=(parsedData[49]*0.01).toFixed(2);
                        Data.currentString18=(parsedData[50]*0.01).toFixed(2);
                        Data.currentString19=(parsedData[51]*0.01).toFixed(2);
                        Data.currentString20=(parsedData[52]*0.01).toFixed(2);
                        Data.currentString21=(parsedData[53]*0.01).toFixed(2);
                        Data.currentString22=(parsedData[54]*0.01).toFixed(2);
                        Data.currentString23=(parsedData[55]*0.01).toFixed(2);
                        Data.currentString24=(parsedData[56]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[5]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.1).toFixed(2);
                        Data.currentString1=(parsedData[33]*0.1).toFixed(2);
                        Data.currentString2=(parsedData[34]*0.1).toFixed(2);
                        Data.currentString3=(parsedData[35]*0.1).toFixed(2);
                        Data.currentString4=(parsedData[36]*0.1).toFixed(2);
                        Data.currentString5=(parsedData[37]*0.1).toFixed(2);
                        Data.currentString6=(parsedData[38]*0.1).toFixed(2);
                        Data.currentString7=(parsedData[39]*0.1).toFixed(2);
                        Data.currentString8=(parsedData[40]*0.1).toFixed(2);
                        Data.currentString9=(parsedData[41]*0.1).toFixed(2);
                        Data.currentString10=(parsedData[42]*0.1).toFixed(2);
                        Data.currentString11=(parsedData[43]*0.1).toFixed(2);
                        Data.currentString12=(parsedData[44]*0.1).toFixed(2);
                        Data.currentString13=(parsedData[45]*0.1).toFixed(2);
                        Data.currentString14=(parsedData[46]*0.1).toFixed(2);
                        Data.currentString15=(parsedData[47]*0.1).toFixed(2);
                        Data.currentString16=(parsedData[48]*0.1).toFixed(2);
                        Data.currentString17=(parsedData[49]*0.1).toFixed(2);
                        Data.currentString18=(parsedData[50]*0.1).toFixed(2);
                        Data.currentString19=(parsedData[51]*0.1).toFixed(2);
                        Data.currentString20=(parsedData[52]*0.1).toFixed(2);
                        Data.currentString21=(parsedData[53]*0.1).toFixed(2);
                        Data.currentString22=(parsedData[54]*0.1).toFixed(2);
                        Data.currentString23=(parsedData[55]*0.1).toFixed(2);
                        Data.currentString24=(parsedData[56]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[5]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*1).toFixed(2);
                        Data.currentString1=(parsedData[33]*1).toFixed(2);
                        Data.currentString2=(parsedData[34]*1).toFixed(2);
                        Data.currentString3=(parsedData[35]*1).toFixed(2);
                        Data.currentString4=(parsedData[36]*1).toFixed(2);
                        Data.currentString5=(parsedData[37]*1).toFixed(2);
                        Data.currentString6=(parsedData[38]*1).toFixed(2);
                        Data.currentString7=(parsedData[39]*1).toFixed(2);
                        Data.currentString8=(parsedData[40]*1).toFixed(2);
                        Data.currentString9=(parsedData[41]*1).toFixed(2);
                        Data.currentString10=(parsedData[42]*1).toFixed(2);
                        Data.currentString11=(parsedData[43]*1).toFixed(2);
                        Data.currentString12=(parsedData[44]*1).toFixed(2);
                        Data.currentString13=(parsedData[45]*1).toFixed(2);
                        Data.currentString14=(parsedData[46]*1).toFixed(2);
                        Data.currentString15=(parsedData[47]*1).toFixed(2);
                        Data.currentString16=(parsedData[48]*1).toFixed(2);
                        Data.currentString17=(parsedData[49]*1).toFixed(2);
                        Data.currentString18=(parsedData[50]*1).toFixed(2);
                        Data.currentString19=(parsedData[51]*1).toFixed(2);
                        Data.currentString20=(parsedData[52]*1).toFixed(2);
                        Data.currentString21=(parsedData[53]*1).toFixed(2);
                        Data.currentString22=(parsedData[54]*1).toFixed(2);
                        Data.currentString23=(parsedData[55]*1).toFixed(2);
                        Data.currentString24=(parsedData[56]*1).toFixed(2);	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
					if(SF_W==1){
                        Data.powerPhaseR=(parsedData[19]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10000).toFixed(2);
                        Data.activePower=(parsedData[16]/10000).toFixed(2);
                        Data.inputPower=(parsedData[3]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                        Data.activePower=(parsedData[16]/1000).toFixed(2);
                        Data.inputPower=(parsedData[3]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[19]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/100).toFixed(2);
                        Data.activePower=(parsedData[16]/100).toFixed(2);
                        Data.inputPower=(parsedData[3]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[19]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10).toFixed(2);
                        Data.activePower=(parsedData[16]/10).toFixed(2);
                        Data.inputPower=(parsedData[3]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[19]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]*1).toFixed(2);
                        Data.activePower=(parsedData[16]*1).toFixed(2);
                        Data.inputPower=(parsedData[3]*1).toFixed(2);
					}

                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[57]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[57]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[57]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[57]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[57]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/1);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[18]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[18]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.01).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.01).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.01).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.01).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                    Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                }
                else if(dataLength==65)   //Delta V2.1 16-Bit
                {
                    parametersCount=61;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<57){
                            parsedData[i]=data[m];
                            m++;
                        }
                        else if(i>=57 && i<61){
                            parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[27]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[27]=parseError1;

                    let error2=dectobin16Bit(parsedData[28]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[28]=parseError2;

                    let error3=dectobin16Bit(parsedData[29]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[29] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[30]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[30] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[31]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[31] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[32]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[32] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[20]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[58]/3600);
                   Data.totalRuntime=parseInt(parsedData[60]/3600);
                   Data.error=addString(parsedData[27],parsedData[28],parsedData[29]);
                   Data.fault=addString(parsedData[30],parsedData[31],parsedData[32]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                   Data.activePower=(parsedData[16]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                   Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                   Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                   Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                   Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                   Data.inputPower=(parsedData[3]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[57]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[59]/100);
                   Data.currentString1=(parsedData[33]*0.01).toFixed(2);
                   Data.currentString2=(parsedData[34]*0.01).toFixed(2);
                   Data.currentString3=(parsedData[35]*0.01).toFixed(2);
                   Data.currentString4=(parsedData[36]*0.01).toFixed(2);
                   Data.currentString5=(parsedData[37]*0.01).toFixed(2);
                   Data.currentString6=(parsedData[38]*0.01).toFixed(2);
                   Data.currentString7=(parsedData[39]*0.01).toFixed(2);
                   Data.currentString8=(parsedData[40]*0.01).toFixed(2);
                   Data.currentString9=(parsedData[41]*0.01).toFixed(2);
                   Data.currentString10=(parsedData[42]*0.01).toFixed(2);
                   Data.currentString11=(parsedData[43]*0.01).toFixed(2);
                   Data.currentString12=(parsedData[44]*0.01).toFixed(2);
                   Data.currentString13=(parsedData[45]*0.01).toFixed(2);
                   Data.currentString14=(parsedData[46]*0.01).toFixed(2);
                   Data.currentString15=(parsedData[47]*0.01).toFixed(2);
                   Data.currentString16=(parsedData[48]*0.01).toFixed(2);
                   Data.currentString17=(parsedData[49]*0.01).toFixed(2);
                   Data.currentString18=(parsedData[50]*0.01).toFixed(2);
                   Data.currentString19=(parsedData[51]*0.01).toFixed(2);
                   Data.currentString20=(parsedData[52]*0.01).toFixed(2);
                   Data.currentString21=(parsedData[53]*0.01).toFixed(2);
                   Data.currentString22=(parsedData[54]*0.01).toFixed(2);
                   Data.currentString23=(parsedData[55]*0.01).toFixed(2);
                   Data.currentString24=(parsedData[56]*0.01).toFixed(2);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                        Data.currentString1=(parsedData[33]*0.01).toFixed(2);
                        Data.currentString2=(parsedData[34]*0.01).toFixed(2);
                        Data.currentString3=(parsedData[35]*0.01).toFixed(2);
                        Data.currentString4=(parsedData[36]*0.01).toFixed(2);
                        Data.currentString5=(parsedData[37]*0.01).toFixed(2);
                        Data.currentString6=(parsedData[38]*0.01).toFixed(2);
                        Data.currentString7=(parsedData[39]*0.01).toFixed(2);
                        Data.currentString8=(parsedData[40]*0.01).toFixed(2);
                        Data.currentString9=(parsedData[41]*0.01).toFixed(2);
                        Data.currentString10=(parsedData[42]*0.01).toFixed(2);
                        Data.currentString11=(parsedData[43]*0.01).toFixed(2);
                        Data.currentString12=(parsedData[44]*0.01).toFixed(2);
                        Data.currentString13=(parsedData[45]*0.01).toFixed(2);
                        Data.currentString14=(parsedData[46]*0.01).toFixed(2);
                        Data.currentString15=(parsedData[47]*0.01).toFixed(2);
                        Data.currentString16=(parsedData[48]*0.01).toFixed(2);
                        Data.currentString17=(parsedData[49]*0.01).toFixed(2);
                        Data.currentString18=(parsedData[50]*0.01).toFixed(2);
                        Data.currentString19=(parsedData[51]*0.01).toFixed(2);
                        Data.currentString20=(parsedData[52]*0.01).toFixed(2);
                        Data.currentString21=(parsedData[53]*0.01).toFixed(2);
                        Data.currentString22=(parsedData[54]*0.01).toFixed(2);
                        Data.currentString23=(parsedData[55]*0.01).toFixed(2);
                        Data.currentString24=(parsedData[56]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[5]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.1).toFixed(2);
                        Data.currentString1=(parsedData[33]*0.1).toFixed(2);
                        Data.currentString2=(parsedData[34]*0.1).toFixed(2);
                        Data.currentString3=(parsedData[35]*0.1).toFixed(2);
                        Data.currentString4=(parsedData[36]*0.1).toFixed(2);
                        Data.currentString5=(parsedData[37]*0.1).toFixed(2);
                        Data.currentString6=(parsedData[38]*0.1).toFixed(2);
                        Data.currentString7=(parsedData[39]*0.1).toFixed(2);
                        Data.currentString8=(parsedData[40]*0.1).toFixed(2);
                        Data.currentString9=(parsedData[41]*0.1).toFixed(2);
                        Data.currentString10=(parsedData[42]*0.1).toFixed(2);
                        Data.currentString11=(parsedData[43]*0.1).toFixed(2);
                        Data.currentString12=(parsedData[44]*0.1).toFixed(2);
                        Data.currentString13=(parsedData[45]*0.1).toFixed(2);
                        Data.currentString14=(parsedData[46]*0.1).toFixed(2);
                        Data.currentString15=(parsedData[47]*0.1).toFixed(2);
                        Data.currentString16=(parsedData[48]*0.1).toFixed(2);
                        Data.currentString17=(parsedData[49]*0.1).toFixed(2);
                        Data.currentString18=(parsedData[50]*0.1).toFixed(2);
                        Data.currentString19=(parsedData[51]*0.1).toFixed(2);
                        Data.currentString20=(parsedData[52]*0.1).toFixed(2);
                        Data.currentString21=(parsedData[53]*0.1).toFixed(2);
                        Data.currentString22=(parsedData[54]*0.1).toFixed(2);
                        Data.currentString23=(parsedData[55]*0.1).toFixed(2);
                        Data.currentString24=(parsedData[56]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[5]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*1).toFixed(2);
                        Data.currentString1=(parsedData[33]*1).toFixed(2);
                        Data.currentString2=(parsedData[34]*1).toFixed(2);
                        Data.currentString3=(parsedData[35]*1).toFixed(2);
                        Data.currentString4=(parsedData[36]*1).toFixed(2);
                        Data.currentString5=(parsedData[37]*1).toFixed(2);
                        Data.currentString6=(parsedData[38]*1).toFixed(2);
                        Data.currentString7=(parsedData[39]*1).toFixed(2);
                        Data.currentString8=(parsedData[40]*1).toFixed(2);
                        Data.currentString9=(parsedData[41]*1).toFixed(2);
                        Data.currentString10=(parsedData[42]*1).toFixed(2);
                        Data.currentString11=(parsedData[43]*1).toFixed(2);
                        Data.currentString12=(parsedData[44]*1).toFixed(2);
                        Data.currentString13=(parsedData[45]*1).toFixed(2);
                        Data.currentString14=(parsedData[46]*1).toFixed(2);
                        Data.currentString15=(parsedData[47]*1).toFixed(2);
                        Data.currentString16=(parsedData[48]*1).toFixed(2);
                        Data.currentString17=(parsedData[49]*1).toFixed(2);
                        Data.currentString18=(parsedData[50]*1).toFixed(2);
                        Data.currentString19=(parsedData[51]*1).toFixed(2);
                        Data.currentString20=(parsedData[52]*1).toFixed(2);
                        Data.currentString21=(parsedData[53]*1).toFixed(2);
                        Data.currentString22=(parsedData[54]*1).toFixed(2);
                        Data.currentString23=(parsedData[55]*1).toFixed(2);
                        Data.currentString24=(parsedData[56]*1).toFixed(2);	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
					if(SF_W==1){
                        Data.powerPhaseR=(parsedData[19]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10000).toFixed(2);
                        Data.activePower=(parsedData[16]/10000).toFixed(2);
                        Data.inputPower=(parsedData[3]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                        Data.activePower=(parsedData[16]/1000).toFixed(2);
                        Data.inputPower=(parsedData[3]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[19]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/100).toFixed(2);
                        Data.activePower=(parsedData[16]/100).toFixed(2);
                        Data.inputPower=(parsedData[3]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[19]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10).toFixed(2);
                        Data.activePower=(parsedData[16]/10).toFixed(2);
                        Data.inputPower=(parsedData[3]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[19]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]*1).toFixed(2);
                        Data.activePower=(parsedData[16]*1).toFixed(2);
                        Data.inputPower=(parsedData[3]*1).toFixed(2);
					}

                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[57]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[57]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[57]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[57]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[57]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[59]/1);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[18]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[18]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.01).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.01).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.01).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.01).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                    Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                }
                else{
                    return "Conflict";
                }
                
            break;

            case 9:        //Delta Without String

                if(dataLength==74)      //Delta V2.0 8-Bit
                {
                    parametersCount=33;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<29){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=29 && i<34){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[23]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[23]=parseError1;

                    let error2=dectobin16Bit(parsedData[24]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[24]=parseError2;

                    let error3=dectobin16Bit(parsedData[25]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[25] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[26]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[26] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[27]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[27] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[28]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[28] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[15]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[30]/3600);
                   Data.totalRuntime=parseInt(parsedData[32]/3600);
                   Data.error=addString(parsedData[23],parsedData[24],parsedData[25]);
                   Data.fault=addString(parsedData[26],parsedData[27],parsedData[28]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[12]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[16]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[19]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[13]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[17]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[20]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[14]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[18]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[21]/1000).toFixed(2);
                   Data.activePower=(parsedData[22]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[3]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[5]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[4]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[6]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                   Data.inputPower=(parsedData[11]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[29]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[31]/100);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[6]*1).toFixed(2);	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
					if(SF_W==1){
                        Data.powerPhaseR=(parsedData[14]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/10000).toFixed(2);
                        Data.activePower=(parsedData[22]/10000).toFixed(2);
                        Data.inputPower=(parsedData[11]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[14]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/1000).toFixed(2);
                        Data.activePower=(parsedData[22]/1000).toFixed(2);
                        Data.inputPower=(parsedData[11]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[14]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/100).toFixed(2);
                        Data.activePower=(parsedData[22]/100).toFixed(2);
                        Data.inputPower=(parsedData[11]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[14]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]/10).toFixed(2);
                        Data.activePower=(parsedData[22]/10).toFixed(2);
                        Data.inputPower=(parsedData[11]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[14]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[18]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[21]*1).toFixed(2);
                        Data.activePower=(parsedData[22]*1).toFixed(2);
                        Data.inputPower=(parsedData[11]*1).toFixed(2);
					}

                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[29]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[31]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[29]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[31]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[29]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[31]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[29]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[31]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[29]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[31]/1);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[13]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[13]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[13]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[17]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[20]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[12]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[12]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[12]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[16]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[19]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[3]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[5]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                  
                }
                else if(dataLength==82)   //Delta V2.1 8-Bit
                {
                    parametersCount=37;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<33){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=33 && i<37){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[27]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[27]=parseError1;

                    let error2=dectobin16Bit(parsedData[28]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[28]=parseError2;

                    let error3=dectobin16Bit(parsedData[29]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[29] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[30]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[30] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[31]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[31] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[32]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[32] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[20]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[34]/3600);
                   Data.totalRuntime=parseInt(parsedData[36]/3600);
                   Data.error=addString(parsedData[27],parsedData[28],parsedData[29]);
                   Data.fault=addString(parsedData[30],parsedData[31],parsedData[32]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                   Data.activePower=(parsedData[16]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                   Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                   Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                   Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                   Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                   Data.inputPower=(parsedData[3]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[35]/100);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[5]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[5]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*1).toFixed(2);	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
					if(SF_W==1){
                        Data.powerPhaseR=(parsedData[19]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10000).toFixed(2);
                        Data.activePower=(parsedData[16]/10000).toFixed(2);
                        Data.inputPower=(parsedData[3]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                        Data.activePower=(parsedData[16]/1000).toFixed(2);
                        Data.inputPower=(parsedData[3]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[19]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/100).toFixed(2);
                        Data.activePower=(parsedData[16]/100).toFixed(2);
                        Data.inputPower=(parsedData[3]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[19]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10).toFixed(2);
                        Data.activePower=(parsedData[16]/10).toFixed(2);
                        Data.inputPower=(parsedData[3]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[19]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]*1).toFixed(2);
                        Data.activePower=(parsedData[16]*1).toFixed(2);
                        Data.inputPower=(parsedData[3]*1).toFixed(2);
					}

                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[33]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[33]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/1);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[18]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[18]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.01).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.01).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.01).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.01).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                    Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                }
                else if(dataLength==41)  // Delta V2.1 16-Bit
                {
                    parametersCount=37;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<33){
                            parsedData[i]=data[m];
                            m++;
                        }
                        else if(i>=33 && i<37){
                            parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[1]==0)
                    parsedData[1]='Standby';
                    else if(parsedData[1]==1)
                    parsedData[1]='Countdown';
                    else if(parsedData[1]==2)
                    parsedData[1]='Running';
                    else if(parsedData[1]==3)
                    parsedData[1]='No DC';
                    else if(parsedData[1]==4)
                    parsedData[1]='Alarm';
                    else
                    parsedData[1]=undefined;
                    
                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[27]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1='AC Freq High, ';
                    if(error1[2]==1)
                        parseError1+='AC Freq Low, ';
                    if(error1[7]==1)
                        parseError1+='AC Quality, ';
                    if(error1[8]==1)
                        parseError1+='HW Phase Seq, ';
                    if(error1[9]==1)
                        parseError1+='No Grid, ';
                    if(error1[10]==1 || error1[15]==1)
                        parseError1+='AC Volt Low, ';
                    if(error1[11]==1)
                        parseError1+='AC Volt High, ';
                    if(error1[13]==1)
                        parseError1+='SL AC Volt High,';
                    
                    parsedData[27]=parseError1;

                    let error2=dectobin16Bit(parsedData[28]);
                    let parseError2="";
                    
                    if(error2[0]==1 || error2[5]==1)
                        parseError2='AC Volt High, ';
                    if(error2[2]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[4]==1)
                        parseError2+='AC Volt Low, ';
                    if(error2[7]==1)
                        parseError2+='SL AC Volt High, ';
                    if(error2[14]==1)
                        parseError2+='Sol1 High, ';
                    if(error2[15]==1)
                        parseError2+='Sol2 High, ';
                    
                    parsedData[28]=parseError2;

                    let error3=dectobin16Bit(parsedData[29]);
                    let parseError3="";
                    
                    if(error3[2]==1)
                    parseError3='Insulation';

                    parsedData[29] = parseError3;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[30]);
                    let parseFault1="";

                    if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                        parseFault1='HW DC Inject, ';
                    if(fault1[5]==1 || fault1[7]==1)
                        parseFault1+='Temperature, ';
                    if(fault1[6]==1)
                        parseFault1+='HW NTC1, ';
                    if(fault1[8]==1)
                        parseFault1+='HW NTC2, ';
                    if(fault1[9]==1)
                        parseFault1+='HW NTC3, ';
                    if(fault1[10]==1 )
                        parseFault1+='HW NTC4, ';
                    if(fault1[13]==1  )
                        parseFault1+='HW Relay, ';
                    if(fault1[15]==1 )
                        parseFault1+='HW DSP ADC1, ';

                    parsedData[30] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[31]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='HW DSP ADC2, ';
                    if(fault2[1]==1)
                        parseFault2+='HW DSP ADC3, ';
                    if(fault2[2]==1)
                        parseFault2+='HW RED ADC1, ';
                    if(fault2[3]==1)
                        parseFault2+='HW RED ADC2, ';
                    if(fault2[4]==1)
                        parseFault2+='HW Efficiency, ';
                    if(fault2[6]==1)
                        parseFault2+='HW COMM2, ';
                    if(fault2[7]==1)
                        parseFault2+='HW COMM1, ';
                    if(fault2[8]==1)
                        parseFault2+='Ground Leakage, ';
                    if(fault2[9]==1)
                        parseFault2+='Insulation, ';
                    if(fault2[10]==1)
                        parseFault2+='HW Int Wire, ';
                    if(fault2[11]==1)
                        parseFault1+='HW RCMU, ';
                    if(fault2[12]==1)
                        parseFault2+='HW Relay Short, ';
                    if(fault2[13]==1)
                        parseFault2+='HW Relay Open, ';
                    if(fault2[14]==1)
                        parseFault2+='HW Bus Unbalance, ';
                    if(fault2[15]==1)
                        parseFault2+='HW Bus OVR Plus, ';
                        
                    parsedData[31] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[32]);
                    let parseFault3="";

                    if(fault3[1]==1)
                        parseFault3='HW Bus OVR Min, ';
                    if(fault3[3]==1)
                        parseFault3+='HW Bus OVR, ';
                    if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                        parseFault3+='AC TR OCR, ';
                    if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                        parseFault3+='AC OCR, ';
                    if(fault3[10]==1)
                        parseFault3+='HW CTA, ';
                    if(fault3[11]==1)
                        parseFault3+='HW CTB, ';
                    if(fault3[12]==1)
                        parseFault3+='HW CTC, ';
                    if(fault3[13]==1)
                        parseFault3+='HW AC OCR';

                    parsedData[32] = parseFault3;

                   //Add data to mongoose object for Database
                   Data.status=(parsedData[1]);
                   Data.temperature=(parsedData[2]);
                   Data.frequency=(parsedData[20]/100).toFixed(2);
                   Data.dailyRuntime=parseInt(parsedData[34]/3600);
                   Data.totalRuntime=parseInt(parsedData[36]/3600);
                   Data.error=addString(parsedData[27],parsedData[28],parsedData[29]);
                   Data.fault=addString(parsedData[30],parsedData[31],parsedData[32]);
                
                    //Scale factor for multiplers
                   const scaleFactor =dectobin16Bit(parsedData[0]);

                   if(scaleFactor[0]==1){
                   Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                   Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                   Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                   Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                   Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                   Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                   Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
                   Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                   Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                   Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                   Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                   Data.activePower=(parsedData[16]/1000).toFixed(2);
                   Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                   Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                   Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
                   Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                   Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                   Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                   Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                   Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                   Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                   Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                   Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                   Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                   Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                   Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                   Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,
                    Data.currentMPPT5,Data.currentMPPT6);
                   Data.inputPower=(parsedData[3]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[35]/100);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentMPPT1=(parsedData[5]*0.1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*0.1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*0.1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*0.1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*0.1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentMPPT1=(parsedData[5]*1).toFixed(2);
                        Data.currentMPPT2=(parsedData[7]*1).toFixed(2);
                        Data.currentMPPT3=(parsedData[9]*1).toFixed(2);
                        Data.currentMPPT4=(parsedData[11]*1).toFixed(2);
                        Data.currentMPPT5=(parsedData[13]*1).toFixed(2);
                        Data.currentMPPT6=(parsedData[15]*1).toFixed(2);	
                    }
                    
                    const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
					if(SF_W==1){
                        Data.powerPhaseR=(parsedData[19]/10000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10000).toFixed(2);
                        Data.activePower=(parsedData[16]/10000).toFixed(2);
                        Data.inputPower=(parsedData[3]/10000).toFixed(2);
					}
					else if(SF_W==2 || SF_W==0){
                        Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                        Data.activePower=(parsedData[16]/1000).toFixed(2);
                        Data.inputPower=(parsedData[3]/1000).toFixed(2);
					}
					else if(SF_W==3){
                        Data.powerPhaseR=(parsedData[19]/100).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/100).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/100).toFixed(2);
                        Data.activePower=(parsedData[16]/100).toFixed(2);
                        Data.inputPower=(parsedData[3]/100).toFixed(2);
					}
					else if(SF_W==4){
                        Data.powerPhaseR=(parsedData[19]/10).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]/10).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]/10).toFixed(2);
                        Data.activePower=(parsedData[16]/10).toFixed(2);
                        Data.inputPower=(parsedData[3]/10).toFixed(2);
					}
					else if(SF_W==5){
                        Data.powerPhaseR=(parsedData[19]*1).toFixed(2);
                        Data.powerPhaseY=(parsedData[23]*1).toFixed(2);
                        Data.powerPhaseB=(parsedData[26]*1).toFixed(2);
                        Data.activePower=(parsedData[16]*1).toFixed(2);
                        Data.inputPower=(parsedData[3]*1).toFixed(2);
					}

                    const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
					if(SF_Wh==0){
                        Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/100);
					}
					else if(SF_Wh==4){
                        Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/1000);
					}
					else if(SF_Wh==5){
                        Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/100);
					}
					else if(SF_Wh==6){
                        Data.dailyEnergy=(parsedData[33]/10).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/10);
					}
					else if(SF_Wh==7){
                        Data.dailyEnergy=(parsedData[33]/1).toFixed(2);
                        Data.totalEnergy=parseInt(parsedData[35]/1);
					}

                    const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
					if(SF_Iac==0 || SF_Iac==1){
                        Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
					}
					else if(SF_Iac==2){
                        Data.currentPhaseR=(parsedData[18]*0.1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*0.1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*0.1).toFixed(2);
					}
					else if(SF_Iac==3){
                        Data.currentPhaseR=(parsedData[18]*1).toFixed(2);
                        Data.currentPhaseY=(parsedData[22]*1).toFixed(2);
                        Data.currentPhaseB=(parsedData[25]*1).toFixed(2);
					}
					
					const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
					if(SF_V==0 || SF_V==2){
                        Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*0.01).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*0.01).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*0.01).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*0.01).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*0.01).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                        Data.voltageMPPT1=(parsedData[4]*1).toFixed(2);
                        Data.voltageMPPT2=(parsedData[6]*1).toFixed(2);
                        Data.voltageMPPT3=(parsedData[8]*1).toFixed(2);
                        Data.voltageMPPT4=(parsedData[10]*1).toFixed(2);
                        Data.voltageMPPT5=(parsedData[12]*1).toFixed(2);
                        Data.voltageMPPT6=(parsedData[14]*1).toFixed(2);
					}

                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                    Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,
                        Data.currentMPPT5,Data.currentMPPT6);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                  
                }
                else{
                    return "Conflict";
                }
                
            break;

            case 10:      // Huawei 50kW

                parametersCount=35;
            
                if(dataLength==86)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<27){
                            if(i==0 || i==16 || i==17 || i==18 || i==20 || i==21 || i==22 || i==23 || i==24 || i==25 || i==26){
                                parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=signed16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                        else if(i>=27 && i<35){
                            if(i==33 || i==34){
                                parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            }
                            else{
                                parsedData[i]=signed32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            }
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Idle: Initializing';
                    else if(parsedData[0]==1)
                    parsedData[0]='Idle: Detecting ISO';
                    else if(parsedData[0]==2)
                    parsedData[0]='Idle: Dectecting Irradiation';
                    else if(parsedData[0]==3)
                    parsedData[0]='Idle: Grid Detecting';
                    else if(parsedData[0]==256)
                    parsedData[0]='Starting';
                    else if(parsedData[0]==512)
                    parsedData[0]='Running';
                    else if(parsedData[0]==513)
                    parsedData[0]='On-grid: Power Limit';
                    else if(parsedData[0]==514)
                    parsedData[0]='On Grid: Self Derating';
                    else if(parsedData[0]==768)
                    parsedData[0]='Shutdown: Fault';
                    else if(parsedData[0]==769)
                    parsedData[0]='Shutdown: Command';
                    else if(parsedData[0]==770)
                    parsedData[0]='Shutdown: OVGR';
                    else if(parsedData[0]==771)
                    parsedData[0]='Shutdown: Communication Disconnected';
                    else if(parsedData[0]==772)
                    parsedData[0]='Shutdown: Power Limit';
                    else if(parsedData[0]==773)
                    parsedData[0]='Shutdown: Start Manually';
                    else if(parsedData[0]==774)
                    parsedData[0]='Shutdown: DC Switch OFF';
                    else if(parsedData[0]==1025)
                    parsedData[0]='Grid Dispatch: P Curve';
                    else if(parsedData[0]==1026)
                    parsedData[0]='Grid Dispatch: Q U Curve';
                    else if(parsedData[0]==40960)
                    parsedData[0]='Idle: No Irradiation';
                    else if(parsedData[0]==1280)
                    parsedData[0]='Spot Check';
                    else if(parsedData[0]==1281)
                    parsedData[0]='Spot Checking';
                    else if(parsedData[0]==1536)
                    parsedData[0]='Inspecting';
                    else if(parsedData[0]==1792)
                    parsedData[0]='AFCI Self-Chek';
                    else if(parsedData[0]==2048)
                    parsedData[0]='IV Scanning';
                    else if(parsedData[0]==2304)
                    parsedData[0]='DC Input Detection';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[23]);
                    let parseFault1="";
                    let parseWarning1="";

                    if(fault1[0]==1)
                        parseFault1='High String Voltage, ';
                    if(fault1[1]==1)
                        parseFault1+='DC Arc Fault, ';
                    if(fault1[2]==1)
                        parseFault1+='String Reversed, ';
                    if(fault1[3]==1)
                        parseWarning1+='PV String Backfeed, ';
                    if(fault1[4]==1)
                        parseWarning1+='Abnormal String, ';
                    if(fault1[5]==1)
                        parseFault1+='AFCI Self-test Failed, ';
                    if(fault1[6]==1)
                        parseFault1+='Short Circuit b/w Phase to PE, ';
                    if(fault1[7]==1)
                        parseFault1+='Power Grid Failure, ';
                    if(fault1[8]==1)
                        parseFault1+='Grid Undervoltage, ';
                    if(fault1[9]==1)
                        parseFault1+='Grid Overvoltage, ';
                    if(fault1[10]==1)
                        parseFault1+='Unbalanced Grid Voltage, ';
                    if(fault1[11]==1)
                        parseFault1+='Grid Overfrequency, ';
                    if(fault1[12]==1)
                        parseFault1+='Grid Underfrequency, ';
                    if(fault1[13]==1)
                        parseFault1+='Grid Frequency Instability, ';
                    if(fault1[14]==1)
                        parseFault1+='Output Overcurrent, ';
                    if(fault1[15]==1)
                        parseFault1+='Large DC of Output Current, ';

                    parsedData[23] = parseFault1;
                    parsedData[36] = parseWarning1;

                    let fault2=dectobin16Bit(parsedData[24]);
                    let parseFault2="";
                    let parseWarning2="";
                  
                    if(fault2[0]==1)
                        parseFault2='Abnoraml Leakage Current, ';
                    if(fault2[1]==1)
                        parseFault2+='Abnormal Ground, ';
                    if(fault2[2]==1)
                        parseFault2+='Low Insulation Res., ';
                    if(fault2[3]==1)
                        parseFault2+='High Temperature, ';
                    if(fault2[4]==1)
                        parseFault2+='Abnormal Equipment, ';
                    if(fault2[5]==1)
                        parseWarning2+='Upgrade failed, ';
                    if(fault2[6]==1)
                        parseWarning2+='License Expired, ';
                    if(fault2[7]==1)
                        parseWarning2+='Abnormal Monitor Unit, ';

                    parsedData[24] = parseFault2;
                    parsedData[37] = parseWarning2;

                    let fault3=dectobin16Bit(parsedData[25]);
                    let parseFault3="";

                    if(fault3[2]==1)
                        parseFault3='High String Voltage to Ground, ';

                    parsedData[25] = parseFault3;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[22]/10).toFixed(2);
                    Data.voltagePhaseR=(parsedData[16]/10).toFixed(2);
                    Data.voltagePhaseY=(parsedData[17]/10).toFixed(2);
                    Data.voltagePhaseB=(parsedData[18]/10).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[28]/1000).toFixed(2);
                    Data.currentPhaseY=(parsedData[29]/1000).toFixed(2);
                    Data.currentPhaseB=(parsedData[30]/1000).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[31]/1000).toFixed(2);
                    Data.reactivePower=(parsedData[34]/1000).toFixed(2);
                    Data.frequency=(parsedData[20]/100).toFixed(2);
                    Data.powerFactor=(parsedData[19]/1000).toFixed(3);
                    Data.currentString1=(parsedData[2]/100).toFixed(2);
                    Data.currentString2=(parsedData[4]/100).toFixed(2);
                    Data.currentString3=(parsedData[6]/100).toFixed(2);
                    Data.currentString4=(parsedData[7]/100).toFixed(2);
                    Data.currentString5=(parsedData[8]/100).toFixed(2);
                    Data.currentString6=(parsedData[9]/100).toFixed(2);
                    Data.currentString7=(parsedData[10]/100).toFixed(2);
                    Data.currentString8=(parsedData[11]/100).toFixed(2);
                    Data.currentString9=(parsedData[12]/100).toFixed(2);
                    Data.currentString10=(parsedData[13]/100).toFixed(2);
                    Data.currentString11=(parsedData[14]/100).toFixed(2);
                    Data.currentString12=(parsedData[15]/100).toFixed(2);
                    Data.inputCurrent=add(Data.currentString1,Data.currentString2,Data.currentString3,Data.currentString4,Data.currentString5,Data.currentString6,
                                            Data.currentString7,Data.currentString8,Data.currentString9,Data.currentString10,Data.currentString11,Data.currentString12);
                    Data.inputPower=(parsedData[27]/1000).toFixed(2);
                    Data.efficiency=(parsedData[21]/100).toFixed(2);
                    Data.dailyEnergy=(parsedData[34]/100).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[33]/100);
                    Data.warning=addString(parsedData[36],parsedData[37]);
                    Data.error=addString(parsedData[23],parsedData[24],parsedData[25]); //Parsed as fault change later

                }
                else{
                    return "Conflict";
                }

            break;

            case 12:      // Tbea

                parametersCount=39;
            
                if(dataLength==80)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<38){
                            if(i==0 || i==1 || i==17 || i==18 || i==19 || i==20){
                                parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=signed16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                        else if(i>=38 && i<39){
                                parsedData[i]= reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==128)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==192)
                    parsedData[0]='Standby: Fault';
                    else if(parsedData[0]==160)
                    parsedData[0]='Standby: Grid-connection Waiting Restorartion';
                    else if(parsedData[0]==224)
                    parsedData[0]='Standby: Alarm; Grid-connection Waiting Restorartion';
                    else if(parsedData[0]==4224)
                    parsedData[0]='Standby: Unauthorised by the System';
                    else if(parsedData[0]==4096)
                    parsedData[0]='Standby: Fault; Unauthorised by the System';
                    else if(parsedData[0]==4)
                    parsedData[0]='Start';
                    else if(parsedData[0]==1028)
                    parsedData[0]='Start: Alarm';
                    else if(parsedData[0]==8)
                    parsedData[0]='Running';
                    else if(parsedData[0]==72)
                    parsedData[0]='Grid-connection: Alarm';
                    else if(parsedData[0]==24)
                    parsedData[0]='Grid-connection: Dispatching';
                    else if(parsedData[0]==264)
                    parsedData[0]='Running';
                    else if(parsedData[0]==2056)
                    parsedData[0]='Running';
                    else if(parsedData[0]==280)
                    parsedData[0]='Grid-connection: Dispatching';
                    else if(parsedData[0]==2072)
                    parsedData[0]='Grid-connection: Dispatching';
                    else if(parsedData[0]==2328)
                    parsedData[0]='Grid-connection: Dispatching';
                    else if(parsedData[0]==2312)
                    parsedData[0]='Running';
                    else if(parsedData[0]==1032)
                    parsedData[0]='Running';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[1]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Resonant Shutdown, ';
                    if(fault1[1]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[2]==1)
                        parseFault1+='Abnormal 12V Power Supply, ';
                    if(fault1[3]==1)
                        parseFault1+='Bus Overvoltage Protection, ';
                    if(fault1[4]==1)
                        parseFault1+='Islanding Protection, ';
                    if(fault1[5]==1)
                        parseFault1+='Leak Current Protection, ';
                    if(fault1[6]==1)
                        parseFault1+='DC Component Protection, ';
                    if(fault1[7]==1)
                        parseFault1+='Under Power Protection, ';
                    if(fault1[8]==1)
                        parseFault1+='Over Temperature Shutdown, ';
                    if(fault1[9]==1)
                        parseFault1+='Output Overcurrent, ';
                    if(fault1[10]==1)
                        parseFault1+='High Line Frequency, ';
                    if(fault1[11]==1)
                        parseFault1+='Low Line Frequency, ';
                    if(fault1[12]==1)
                        parseFault1+='High Grid Voltage, ';
                    if(fault1[13]==1)
                        parseFault1+='Low Grid Voltage, ';
                    if(fault1[14]==1)
                        parseFault1+='Abnormal PV Voltage, ';
                    if(fault1[15]==1)
                        parseFault1+='Human Shutdown, ';

                    parsedData[1] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[18]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='Frequency High Abnormal, ';
                    if(fault2[1]==1)
                        parseFault2+='Frequency Low Abnormal, ';
                    if(fault2[2]==1)
                        parseFault2+='Line CA Voltage High Abnormal, ';
                    if(fault2[3]==1)
                        parseFault2+='Line CA Voltage Low Abnormal, ';
                    if(fault2[4]==1)
                        parseFault2+='Line BC Voltage High Abnormal, ';
                    if(fault2[5]==1)
                        parseFault2+='Line BC Voltage Low Abnormal, ';
                    if(fault2[6]==1)
                        parseFault2+='Line AB Voltage High Abnormal, ';
                    if(fault2[7]==1)
                        parseFault2+='Line AB Voltage Low Abnormal, ';
                    if(fault2[8]==1)
                        parseFault2+='PV4 Working Voltage Abnormal, ';
                    if(fault2[9]==1)
                        parseFault2+='PV3 Working Voltage Abnormal, ';
                    if(fault2[10]==1)
                        parseFault2+='PV2 Working Voltage Abnormal, ';
                    if(fault2[11]==1)
                        parseFault2+='PV1 Working Voltage Abnormal, ';
                    if(fault2[12]==1)
                        parseFault2+='PV4 Start Voltage Abnormal, ';
                    if(fault2[13]==1)
                        parseFault2+='PV3 Start Voltage Abnormal, ';
                    if(fault2[14]==1)
                        parseFault2+='PV2 Start Voltage Abnormal, ';
                    if(fault2[15]==1)
                        parseFault2+='PV1 Start Voltage Abnormal, ';

                    parsedData[18] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[19]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3+='Bus Voltage Low Abnormal, ';
                    if(fault3[1]==1)
                        parseFault3+='Bus Voltage Low Abnormal, ';
                    if(fault3[2]==1)
                        parseFault3+='Leak Current Fault, ';
                    if(fault3[3]==1)
                        parseFault3+='Output Overcurrent Protection, ';
                    if(fault3[4]==1)
                        parseFault3+='Insulation Resistance Protection, ';
                    if(fault3[5]==1)
                        parseFault3+='Internal Communication Fault, ';
                    if(fault3[6]==1)
                        parseFault3+='Under power Self-protection, ';
                    if(fault3[7]==1)
                        parseFault3+='Grid Reconnection Restoration, ';
                    if(fault3[8]==1)
                        parseFault3+='DC Component Fault, ';
                    if(fault3[9]==1)
                        parseFault3+='Ambient Over Temperature, ';
                    if(fault3[10]==1)
                        parseFault3+='Inverting Phase-C Voltage High Abnormal, ';
                    if(fault3[11]==1)
                        parseFault3+='Inverting Phase-C Voltage Low Abnormal, ';
                    if(fault3[12]==1)
                        parseFault3+='Inverting Phase-B Voltage High Abnormal, ';
                    if(fault3[13]==1)
                        parseFault3+='Inverting Phase-B Voltage Low Abnormal, ';
                    if(fault3[14]==1)
                        parseFault3+='Inverting Phase-A Voltage High Abnormal, ';
                    if(fault3[15]==1)
                        parseFault3+='Inverting Phase-A Voltage Low Abnormal, ';

                    parsedData[19] = parseFault3;

                    let fault4=dectobin16Bit(parsedData[20]);
                    let parseFault4="";

                    if(fault4[0]==1)
                        parseFault4='Communication Board Flash Fault, ';
                    if(fault4[1]==1)
                        parseFault4+='Communication Board RTC Fault, ';
                    if(fault4[2]==1)
                        parseFault4+='Bus Soft Start Fault, ';
                    if(fault4[3]==1)
                        parseFault4+='Inspection Fault, ';
                    if(fault4[4]==1)
                        parseFault4+='Start Grid Fault, ';
                    if(fault4[5]==1)
                        parseFault4+='Inverting Soft Start Fault, ';
                    if(fault4[6]==1)
                        parseFault4+='Phase Lock Fault, ';
                    if(fault4[7]==1)
                        parseFault4+='Relay Fault, ';
                    if(fault4[8]==1)
                        parseFault4+='EEPROM Fault, ';
                    if(fault4[9]==1)
                        parseFault4+='IGBT Over Temperature, ';
                    if(fault4[10]==1)
                        parseFault4+='DC SPD Fault, ';
                    if(fault4[11]==1)
                        parseFault4+='Reserved, ';
                    if(fault4[12]==1)
                        parseFault4+='Fan Fault, ';
                    if(fault4[13]==1)
                        parseFault4+='12V Abnormal, ';
                    if(fault4[14]==1)
                        parseFault4+='Bus Overvoltage, ';
                    if(fault4[15]==1)
                        parseFault4+='AC SPD Fault, ';

                    parsedData[20] = parseFault4;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[16]*0.01).toFixed(2);
                    Data.voltagePhaseR=(parsedData[5]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[6]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[7]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[8]*0.01).toFixed(2);
                    Data.currentPhaseY=(parsedData[9]*0.01).toFixed(2);
                    Data.currentPhaseB=(parsedData[10]*0.01).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[12]/100).toFixed(2);
                    Data.reactivePower=(parsedData[14]/100).toFixed(2);
                    Data.apparentpower=(parsedData[13]/100).toFixed(2);
                    Data.frequency=(parsedData[11]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[15]*0.001).toFixed(3);
                    Data.currentString1=(parsedData[22]*0.01).toFixed(2);
                    Data.currentString2=(parsedData[23]*0.01).toFixed(2);
                    Data.currentString3=(parsedData[24]*0.01).toFixed(2);
                    Data.currentString4=(parsedData[25]*0.01).toFixed(2);
                    Data.currentString5=(parsedData[26]*0.01).toFixed(2);
                    Data.currentString6=(parsedData[27]*0.01).toFixed(2);
                    Data.currentString7=(parsedData[28]*0.01).toFixed(2);
                    Data.currentString8=(parsedData[29]*0.01).toFixed(2);
                    Data.currentString9=(parsedData[30]*0.01).toFixed(2);
                    Data.currentString10=(parsedData[31]*0.01).toFixed(2);
                    Data.currentString11=(parsedData[32]*0.01).toFixed(2);
                    Data.currentString12=(parsedData[33]*0.01).toFixed(2);
                    Data.currentString13=(parsedData[34]*0.01).toFixed(2);
                    Data.currentString14=(parsedData[35]*0.01).toFixed(2);
                    Data.currentString15=(parsedData[36]*0.01).toFixed(2);
                    Data.currentString16=(parsedData[37]*0.01).toFixed(2);
                    Data.inputVoltage=(parsedData[2]*0.1).toFixed(2);
                    Data.inputCurrent=(parsedData[3]*0.01).toFixed(2);
                    Data.inputPower=(parsedData[4]/100).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[17]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[38]*0.1);
                    Data.fault=addString(parsedData[1],parsedData[18],parsedData[19],parsedData[20]);
                }
                else{
                    return "Conflict";
                }

            break;

            case 13:      // Chint 14-36kW

                parametersCount=23;
            
                if(dataLength==48)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<22){
                            if(i==3 || i==15){
                                parsedData[i]=signed16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                        else if(i>=22 && i<23){
                                parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==32768)
                    parsedData[0]='Fault';
                    else if(parsedData[0]==16384)
                    parsedData[0]='Check';
                    else if(parsedData[0]==8192)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==4096)
                    parsedData[0]='Running';
                    else if(parsedData[0]==2048)
                    parsedData[0]='Derating';
                    else
                    parsedData[0]=undefined;
                    
                    //Remove Strings garbage values
                    if(parsedData[10]==65535)
                    parsedData[10]=0;
                    if(parsedData[11]==65535)
                    parsedData[11]=0;
                    if(parsedData[12]==65535)
                    parsedData[12]=0;
                    if(parsedData[13]==65535)
                    parsedData[13]=0;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[16]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Bus(sum) Over Voltage Fault, ';
                    if(fault1[1]==1)
                        parseFault1+='Bus(sum) Over Voltage, ';
                    if(fault1[2]==1)
                        parseFault1+='Bus Imbalance Fault, ';
                    if(fault1[3]==1)
                        parseFault1+='Grid Relay fault, ';
                    if(fault1[4]==1)
                        parseFault1+='Static GFCI Fault, ';
                    if(fault1[5]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[6]==1)
                        parseFault1+='DCI Fault, ';
                    if(fault1[7]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[8]==1)
                        parseFault1+='Hardware Over-current Fault, ';
                    if(fault1[9]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[10]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[11]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[12]==1)
                        parseFault1+='power Module Fault, ';
                    if(fault1[13]==1)
                        parseFault1+='Internal Hardware Fault, ';
                    if(fault1[14]==1)
                        parseFault1+='Inverter Open-loop Self-test Fault, ';
                    if(fault1[15]==1)
                        parseFault1+='15V of Control Board Low Fault, ';

                    parsedData[16] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[18]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='Bus(sum) Over Voltage (firmware), ';
                    if(fault2[1]==1)
                        parseFault2+='Bus(sum) Low Voltage, ';
                    if(fault2[2]==1)
                        parseFault2+='Bus Imbalance, ';
                    if(fault2[3]==1)
                        parseFault2+='Bus Soft Start Timeout, ';
                    if(fault2[4]==1)
                        parseFault2+='Inverter Soft Start Timeout, ';
                    if(fault2[5]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[6]==1)
                        parseFault2+='PV1 Over Current, ';
                    if(fault2[7]==1)
                        parseFault2+='Grid Line Voltage Out of Range, ';
                    if(fault2[8]==1)
                        parseFault2+='Grid Phase Voltage Out of Range, ';
                    if(fault2[9]==1)
                        parseFault2+='Inverter Over Current, ';
                    if(fault2[10]==1)
                        parseFault2+='Grid Over Frequency, ';
                    if(fault2[11]==1)
                        parseFault2+='Grid Under Frequency, ';
                    if(fault2[12]==1)
                        parseFault2+='Loss of Main, ';
                    if(fault2[13]==1)
                        parseFault2+='Grid Relay Error, ';
                    if(fault2[14]==1)
                        parseFault2+='Over-Temperature Protection, ';
                    if(fault2[15]==1)
                        parseFault2+='Sampling Offset of Output Current Error, ';

                    parsedData[18] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[19]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='Inverter Voltage Offset Error, ';
                    if(fault3[1]==1)
                        parseFault3+='DCI Offset Error, ';
                    if(fault3[2]==1)
                        parseFault3+='DCI High, ';
                    if(fault3[3]==1)
                        parseFault3+='Insulation Resistance Low, ';
                    if(fault3[4]==1)
                        parseFault3+='Dynamic Leakage Current High, ';
                    if(fault3[5]==1)
                        parseFault3+='Frequency Detection Fault, ';
                    if(fault3[6]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[7]==1)
                        parseFault3+='MCU Protection, ';
                    if(fault3[8]==1)
                        parseFault3+='Inverter Hardware Over Current, ';
                    if(fault3[9]==1)
                        parseFault3+='Grid Voltage Imbalance, ';
                    if(fault3[10]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[11]==1)
                        parseFault3+='Inverter Current Imbalance, ';
                    if(fault3[12]==1)
                        parseFault3+='power Module Protection, ';
                    if(fault3[13]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[14]==1)
                        parseFault3+='Bus Overvoltage (hardware) ';
                    if(fault3[15]==1)
                        parseFault3+='Leakage Current Sensor Error, ';

                    parsedData[19] = parseFault3;

                    let fault4=dectobin16Bit(parsedData[20]);
                    let parseFault4="";

                    if(fault4[0]==1)
                        parseFault4='Reserved, ';
                    if(fault4[1]==1)
                        parseFault4+='Internal hardware Error, ';
                    if(fault4[2]==1)
                        parseFault4+='Input and Output power Mismatch , ';
                    if(fault4[3]==1)
                        parseFault4+='PV2 Input Reverse Connection, ';
                    if(fault4[4]==1)
                        parseFault4+='PV2 Over Current, ';
                    if(fault4[5]==1)
                        parseFault4+='PV2 Over Voltage, ';
                    if(fault4[6]==1)
                        parseFault4+='PV Abnormal Input, ';
                    if(fault4[7]==1)
                        parseFault4+='Inverter Open-loop Self-test Error, ';
                    if(fault4[8]==1)
                        parseFault4+='Reserved, ';
                    if(fault4[9]==1)
                        parseFault4+='PV1 Input Reverse Connection, ';
                    if(fault4[10]==1)
                        parseFault4+='PV1 Over Voltage, ';
                    if(fault4[11]==1)
                        parseFault4+='Reserved, ';
                    if(fault4[12]==1)
                        parseFault4+='Reserved, ';
                    if(fault4[13]==1)
                        parseFault4+='Arcboard Abnormal, ';
                    if(fault4[14]==1)
                        parseFault4+='Static GFI Protect, ';
                    if(fault4[15]==1)
                        parseFault4+='Arc Protection, ';

                    parsedData[20] = parseFault4;

                    //Warning conversion
                    let warning1=dectobin16Bit(parsedData[17]);
                    let parseWarning1="";

                    if(warning1[0]==1)
                        parseWarning1='External Fan Error, ';
                    if(warning1[1]==1)
                        parseWarning1+='Internal Fan Error, ';
                    if(warning1[2]==1)
                        parseWarning1+='Internal Communication Failed , ';
                    if(warning1[3]==1)
                        parseWarning1+='DSP EEPROM Fault, ';
                    if(warning1[4]==1)
                        parseWarning1+='Not Used, ';
                    if(warning1[5]==1)
                        parseWarning1+='Temperature Sensor Fault, ';
                    if(warning1[6]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[7]==1)
                        parseWarning1+='Not Used, ';
                    if(warning1[8]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[9]==1)
                        parseWarning1+='LCD EEPROM Fault, ';
                    if(warning1[10]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[11]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[12]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[13]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[14]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[15]==1)
                        parseWarning1+='Reserved, ';

                    parsedData[17] = parseWarning1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[15]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[4]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[5]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[6]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[7]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[8]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[9]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[1]/10).toFixed(2);
                    Data.apparentpower=(parsedData[2]/10).toFixed(2);
                    Data.frequency=(parsedData[14]*0.1).toFixed(2);
                    Data.powerFactor=(parsedData[3]*0.001).toFixed(3);
                    Data.voltageMPPT1=(parsedData[10]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[12]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[11]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[13]*0.1).toFixed(2);
                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1, Data.currentMPPT2);
                    Data.inputPower=add(Data.powerMPPT1, Data.powerMPPT2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[21]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[22]*1);
                    Data.warning=addString(parsedData[17]);
                    Data.fault=addString(parsedData[16],parsedData[18],parsedData[19],parsedData[20]);
                }
                else{
                    return "Conflict";
                }

            break;

            case 14:      // Ksolare

                parametersCount=31;
            
                if(dataLength==72)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<26){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=26 && i<31){
                                parsedData[i]=unsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==1)
                    parsedData[0]='Running';
                    else if(parsedData[0]==2)
                    parsedData[0]='Self-test';
                    else if(parsedData[0]==3)
                    parsedData[0]='Failure';
                    else if(parsedData[0]==4)
                    parsedData[0]='Alarm';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[20]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='DC Inversed Failure, ';
                    if(fault1[1]==1)
                        parseFault1+='DC Insulation Failure, ';
                    if(fault1[2]==1)
                        parseFault1+='GFDI Failure, ';
                    if(fault1[3]==1)
                        parseFault1+='GFDI Ground Failure, ';
                    if(fault1[4]==1)
                        parseFault1+='EEPROM Read Failure, ';
                    if(fault1[5]==1)
                        parseFault1+='EEPROM Write Failure, ';
                    if(fault1[6]==1)
                        parseFault1+='GFDI Fuse Failure, ';
                    if(fault1[7]==1)
                        parseFault1+='GFDI Relay Faliure, ';
                    if(fault1[8]==1)
                        parseFault1+='IGBT Failure, ';
                    if(fault1[9]==1)
                        parseFault1+='Aux power Board Failure, ';
                    if(fault1[10]==1)
                        parseFault1+='AC Main Contactor Failure, ';
                    if(fault1[11]==1)
                        parseFault1+='AC Slave Contactor Failure, ';
                    if(fault1[12]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[13]==1)
                        parseFault1+='DC Over Current Failure, ';
                    if(fault1[14]==1)
                        parseFault1+='AC Over Current Failure, ';
                    if(fault1[15]==1)
                        parseFault1+='GFCI Failure, ';

                    parsedData[20] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[21]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='Phase Current & Overcurrent, ';
                    if(fault2[1]==1)
                        parseFault2+='Hardware AC Overcurrent, ';
                    if(fault2[2]==1)
                        parseFault2+='Integrated Fault, ';
                    if(fault2[3]==1)
                        parseFault2+='DC Hardware Overcurrent, ';
                    if(fault2[4]==1)
                        parseFault2+='DC Leakage Current Overcurrent, ';
                    if(fault2[5]==1)
                        parseFault2+='Emergency Stop, ';
                    if(fault2[6]==1)
                        parseFault2+='GFCI Overcurrent, ';
                    if(fault2[7]==1)
                        parseFault2+='DC Insulation, ';
                    if(fault2[8]==1)
                        parseFault2+='DC Feedback, ';
                    if(fault2[9]==1)
                        parseFault2+='DC Bus Unbalanced, ';
                    if(fault2[10]==1)
                        parseFault2+='DC Insulation, ';
                    if(fault2[11]==1)
                        parseFault2+='DCI Over M1 Fault, ';
                    if(fault2[12]==1)
                        parseFault2+='AC Air Switch, ';
                    if(fault2[13]==1)
                        parseFault2+='AC Main Contactor, ';
                    if(fault2[14]==1)
                        parseFault2+='AC Slave Contactor, ';
                    if(fault2[15]==1)
                        parseFault2+='DCI Over M2 Fault, ';

                    parsedData[21] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[22]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='AC Over Current, ';
                    if(fault3[1]==1)
                        parseFault3+='AC Overload, ';
                    if(fault3[2]==1)
                        parseFault3+='AC No Utility, ';
                    if(fault3[3]==1)
                        parseFault3+='AC Grid Phase Sequence, ';
                    if(fault3[4]==1)
                        parseFault3+='AC Voltage Unbalance, ';
                    if(fault3[5]==1)
                        parseFault3+='AC Current Unbalance, ';
                    if(fault3[6]==1)
                        parseFault3+='INT AC Overcurrent, ';
                    if(fault3[7]==1)
                        parseFault3+='INT DC Overcurrent, ';
                    if(fault3[8]==1)
                        parseFault3+='AC Line WU Overvoltage, ';
                    if(fault3[9]==1)
                        parseFault3+='AC Line WU Undervoltage, ';
                    if(fault3[10]==1)
                        parseFault3+='AC Line VW Overvoltage, ';
                    if(fault3[11]==1)
                        parseFault3+='AC Line VW Undervoltage, ';
                    if(fault3[12]==1)
                        parseFault3+='AC Line UV Overvoltage, ';
                    if(fault3[13]==1)
                        parseFault3+='AC Line UV Undervoltage, ';
                    if(fault3[14]==1)
                        parseFault3+='AC Over Frequency, ';
                    if(fault3[15]==1)
                        parseFault3+='AC Under Frequency, ';

                    parsedData[22] = parseFault3;

                    let fault4=dectobin16Bit(parsedData[23]);
                    let parseFault4="";

                    if(fault4[0]==1)
                        parseFault4='AC U Grid Current DC High, ';
                    if(fault4[1]==1)
                        parseFault4+='AC V Grid Current DC High, ';
                    if(fault4[2]==1)
                        parseFault4+='AC W Grid Current DC High, ';
                    if(fault4[3]==1)
                        parseFault4+='AC A Induct Current DC High, ';
                    if(fault4[4]==1)
                        parseFault4+='AC B Induct Current DC High, ';
                    if(fault4[5]==1)
                        parseFault4+='AC C Induct Current DC High, ';
                    if(fault4[6]==1)
                        parseFault4+='DC High Voltage, ';
                    if(fault4[7]==1)
                        parseFault4+='DC Low Voltage, ';
                    if(fault4[8]==1)
                        parseFault4+='AC Backfeed, ';
                    if(fault4[9]==1)
                        parseFault4+='AC U Grid Current High, ';
                    if(fault4[10]==1)
                        parseFault4+='AC V Grid Current High, ';
                    if(fault4[11]==1)
                        parseFault4+='AC W Grid Current High, ';
                    if(fault4[12]==1)
                        parseFault4+='AC A Induct Current High, ';
                    if(fault4[13]==1)
                        parseFault4+='AC B Induct Current High, ';
                    if(fault4[14]==1)
                        parseFault4+='AC C Induct Current High, ';
                    if(fault4[15]==1)
                        parseFault4+='Heatsink Low Temperature, ';

                    parsedData[23] = parseFault4;

                    //Warning conversion
                    let warning1=dectobin16Bit(parsedData[18]);
                    let parseWarning1="";

                    if(warning1[0]==1)
                        parseWarning1='DC Insulation, ';
                    if(warning1[1]==1)
                        parseWarning1+='LCD Loose, ';
                    if(warning1[2]==1)
                        parseWarning1+='LVRT Fault Warning, ';
                    if(warning1[3]==1)
                        parseWarning1+='Fan Fault Warning, ';
                    if(warning1[4]==1)
                        parseWarning1+='DC Air Switch Open, ';
                    if(warning1[5]==1)
                        parseWarning1+='Fault Feedback Warning, ';
                    if(warning1[6]==1)
                        parseWarning1+='AC Voltage Unbalance, ';
                    if(warning1[7]==1)
                        parseWarning1+='AC PLL Warning, ';
                    if(warning1[8]==1)
                        parseWarning1+='DC Thunder, ';
                    if(warning1[9]==1)
                        parseWarning1+='AC Thunder, ';
                    if(warning1[10]==1)
                        parseWarning1+='Smoke Detect, ';
                    if(warning1[11]==1)
                        parseWarning1+='power Derating, ';
                    if(warning1[12]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[13]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[14]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[15]==1)
                        parseWarning1+='Reserved, ';

                    parsedData[18] = parseWarning1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=((parsedData[2]-1000)*0.1).toFixed(2);
                    if(Data.temperature>100)
                    Data.temperature=(Data.temperature*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[3]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[4]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[5]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[6]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[7]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[8]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[28]/10000).toFixed(2);
                    Data.reactivePower=(parsedData[29]).toFixed(2);
                    Data.apparentpower=(parsedData[27]/10000).toFixed(2);
                    Data.frequency=(parsedData[9]*0.01).toFixed(2);
                    Data.voltageMPPT1=(parsedData[10]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[12]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[14]*0.1).toFixed(2);
                    Data.voltageMPPT4=(parsedData[16]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[11]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[13]*0.1).toFixed(2);
                    Data.currentMPPT3=(parsedData[15]*0.1).toFixed(2);
                    Data.currentMPPT4=(parsedData[17]*0.1).toFixed(2);
                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.inputCurrent=add( Data.currentMPPT1, Data.currentMPPT2, Data.currentMPPT3, Data.currentMPPT4);
                    Data.inputPower=(parsedData[26]/10000).toFixed(2);
                    Data.efficiency=(parsedData[1]*0.1).toFixed(2);
                    Data.dailyEnergy=(parsedData[24]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[30]*0.1);
                    Data.totalRuntime=parseInt(parsedData[25]/3600)
                    Data.warning=addString(parsedData[18]);
                    Data.fault=addString(parsedData[20],parsedData[21],parsedData[22],parsedData[23]);
                }
                else{
                    return "Conflict";
                }

            break;

            case 15:      // Kstar
            case 16:      // powerOne
                
                parametersCount=25;
            
                if(dataLength==66)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<17){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=17 && i<25){
                            if(i==23 || i==24){
                                parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            }
                            else{
                                parsedData[i]=signed32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            }
                            m+=4;
                        }
                    }

                    //Status Conversion "data type is U8 so we use unparsed data"
                    if(data[0]==0)
                    parsedData[0]='System Initialization';
                    else if(data[0]==1)
                    parsedData[0]='Waiting';
                    else if(data[0]==2)
                    parsedData[0]='Pre-detedtion';
                    else if(data[0]==3)
                    parsedData[0]='Running';
                    else if(data[0]==4)
                    parsedData[0]='Error';
                    else if(data[0]==5)
                    parsedData[0]='Permanent Error';
                    else if(data[0]==6)
                    parsedData[0]='Aging';
                    else if(data[0]==7)
                    parsedData[0]='DSP Burning';
                    else if(data[0]==8)
                    parsedData[0]='ARM Burning';
                    else
                    parsedData[0]=undefined;
                    
                    //Error conversion
                    let error1=dectobin32Bit(parsedData[23]);
                    let parseError1="";

                    if(error1[0]==1)
                        parseError1='Grid Voltage Low, ';
                    if(error1[1]==1)
                        parseError1+='Grid Voltage High, ';
                    if(error1[2]==1)
                        parseError1+='Grid Frequency Low, ';
                    if(error1[3]==1)
                        parseError1+='Grid Frequency High, ';
                    if(error1[4]==1)
                        parseError1+='Bus Voltage Low, ';
                    if(error1[5]==1)
                        parseError1+='Bus Voltage High, ';
                    if(error1[6]==1)
                        parseError1+='Bus Voltage Unbalance, ';
                    if(error1[7]==1)
                        parseError1+='Isolation Fault, ';
                    if(error1[8]==1)
                        parseError1+='PV Current High, ';
                    if(error1[9]==1)
                        parseError1+='Hard Inverter Current Over, ';
                    if(error1[10]==1)
                        parseError1+='Inverter Current Over, ';
                    if(error1[11]==1)
                        parseError1+='Inverter DC Current Over, ';
                    if(error1[12]==1)
                        parseError1+='Ambient Temperature Over, ';
                    if(error1[13]==1)
                        parseError1+='Sink Temperature Over, ';
                    if(error1[14]==1)
                        parseError1+='AC Relay Fault, ';
                    if(error1[15]==1)
                        parseError1+='Reserved, ';
                    if(error1[16]==1)
                        parseError1+='Remote OFF, ';
                    if(error1[17]==1)
                        parseError1+='Reserved, ';
                    if(error1[18]==1)
                        parseError1+='SPI Communication Fault, ';
                    if(error1[19]==1)
                        parseError1+='Reserved, ';
                    if(error1[20]==1)
                        parseError1+='GFCI Over Fault, ';
                    if(error1[21]==1)
                        parseError1+='GFCI Device Fault, ';
                    if(error1[22]==1)
                        parseError1+='Voltage Consistent Fault, ';
                    if(error1[23]==1)
                        parseError1+='Frequency Consistent Fault, ';
                    if(error1[24]==1)
                        parseError1+='Reserved, ';
                    if(error1[25]==1)
                        parseError1+='Reserved, ';
                    if(error1[26]==1)
                        parseError1+='Reserved, ';
                    if(error1[27]==1)
                        parseError1+='Reserved, ';
                    if(error1[28]==1)
                        parseError1+='Reserved, ';
                    if(error1[29]==1)
                        parseError1+='Reserved, ';
                    if(error1[30]==1)
                        parseError1+='Reserved, ';
                    if(error1[31]==1)
                        parseError1+='Reserved, ';
                    
                    parsedData[23] = parseError1;
                    
                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[1]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[2]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[3]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[4]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[5]*0.01).toFixed(2);
                    Data.currentPhaseY=(parsedData[6]*0.01).toFixed(2);
                    Data.currentPhaseB=(parsedData[7]*0.01).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[17]/1000).toFixed(2);
                    Data.reactivePower=(parsedData[19]/1000).toFixed(2);
                    Data.apparentpower=(parsedData[18]/1000).toFixed(2);
                    Data.frequency=(parsedData[8]*0.01).toFixed(2);
                    Data.voltageMPPT1=(parsedData[10]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[11]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[12]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[13]*0.01).toFixed(2);
                    Data.currentMPPT2=(parsedData[14]*0.01).toFixed(2);
                    Data.currentMPPT3=(parsedData[15]*0.01).toFixed(2);
                    Data.powerMPPT1=(parsedData[20]/1000).toFixed(2);
                    Data.powerMPPT2=(parsedData[21]/1000).toFixed(2);
                    Data.powerMPPT3=(parsedData[22]/1000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1, Data.currentMPPT2, Data.currentMPPT3);
                    Data.inputPower=add(Data.powerMPPT1, Data.powerMPPT2, Data.powerMPPT3);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[16]*1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[24]*0.1);
                    Data.error=addString(parsedData[23]);
                    if(parsedData[9]>=10800)
						Data.powerFactor=((parsedData[9]-10000)*0.001).toFixed(3);
					else
                        Data.powerFactor=(parsedData[9]*0.001).toFixed(3);
                }
                else{
                    return "Conflict";
                }

            break;

            case 17:      //growatt v1.05 without string

                parametersCount=38;
            
                if(dataLength==108)
                {
                    for(let i=0,m=0;i<parametersCount;i++){
                        if(i>=0 && i<22){
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=22 && i<38){
                            parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Waiting';
                    else if(parsedData[0]==1)
                    parsedData[0]='Running';
                    else if(parsedData[0]==3)
                    parsedData[0]='Fault';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=parsedData[21];
                    let parseFault1="";

                    if(fault1==24)
                        parseFault1='Auto Test Falied, ';
                    else if(fault1==25)
                        parseFault1='No AC Connection, ';
                    else if(fault1==26)
                        parseFault1='PV Isolation Low, ';
                    else if(fault1==27)
                        parseFault1='Residual I High, ';
                    else if(fault1==28)
                        parseFault1='Output High DCI, ';
                    else if(fault1==29)
                        parseFault1='PV Voltage High, ';
                    else if(fault1==30)
                        parseFault1='AC V Outrange, ';
                    else if(fault1==31)
                        parseFault1='AC F Outrange, ';
                    else if(fault1==32)
                        parseFault1='Module Hot, ';
                    else
                        parseFault1='Error: 99+x, ';
                    
                    parsedData[21] = parseFault1;

                    //Fault coversion
                    let fault2=parsedData[33];
                    let parseFault2="";

                    if(fault2==2)
                        parseFault2='Communication Error';
                    else if(fault2==8)
                        parseFault2='Str Reversed or Str Short Fault';
                    else if(fault2==16)
                        parseFault2='Model Init Fault';
                    else if(fault2==32)
                        parseFault2='Grid Voltage Sample Different';
                    else if(fault2==64)
                        parseFault2='ISO Sample Different';
                    else if(fault2==128)
                        parseFault2='GFCI Sample Different';
                    else if(fault2==4096)
                        parseFault2='AFCI Fault';
                    else if(fault2==16384)
                        parseFault2='AFCI Module Fault';
                    else if(fault2==131072)
                        parseFault2='Relay Check Fault';
                    else if(fault2==2097152)
                        parseFault2='Communication Error';
                    else if(fault2==4194304)
                        parseFault2='Bus Voltage Error';
                    else if(fault2==8388608)
                        parseFault2='Auto Test Fail';
                    else if(fault2==16777216)
                        parseFault2='No Utility';
                    else if(fault2==33554432)
                        parseFault2='PV Isolation Low';
                    else if(fault2==67108864)
                        parseFault2='Residual I High';
                    else if(fault2==134217728)
                        parseFault2='Output High DCI';
                    else if(fault2==268435456)
                        parseFault2='PV Voltage High';
                    else if(fault2==536870912)
                        parseFault2='AC Voltage Outrange';
                    else if(fault2==1073741824)
                        parseFault2='AC Frequency Outrange';
                    else if(fault2==2147483648)
                        parseFault2='Temperature High';
                    
                    parsedData[33] = parseFault2;

                    //Warning coversion
                    let warning1=parsedData[34];
                    let parseWarning1="";

                    if(warning1==1)
                        parseWarning1='Fan Warning';
                    else if(warning1==2)
                        parseWarning1='String Communication Abnormal';
                    else if(warning1==4)
                        parseWarning1='Str PID Config Warning';
                    else if(warning1==16)
                        parseWarning1='DSP & COM Firmware Unmatch';
                    else if(warning1==64)
                        parseWarning1='SPD Abnormal';
                    else if(warning1==128)
                        parseWarning1='GND & N Connect Abnormal';
                    else if(warning1==256)
                        parseWarning1='PV1 or PV2 Circuit Short';
                    else if(warning1==512)
                        parseWarning1='PV1 or PV2 Boost Driver Broken';
                
                    parsedData[34] = parseWarning1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[20]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[14]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[16]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[18]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[15]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[17]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[19]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.powerPhaseR=(parsedData[30]/10000).toFixed(2);
                    Data.powerPhaseY=(parsedData[31]/10000).toFixed(2);
                    Data.powerPhaseB=(parsedData[32]/10000).toFixed(2);
                    Data.activePower=(parsedData[29]/10000).toFixed(2);
                    Data.frequency=(parsedData[13]*0.01).toFixed(2);
                    Data.voltageMPPT1=(parsedData[1]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[3]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[5]*0.1).toFixed(2);
                    Data.voltageMPPT4=(parsedData[7]*0.1).toFixed(2);
                    Data.voltageMPPT5=(parsedData[9]*0.1).toFixed(2);
                    Data.voltageMPPT6=(parsedData[11]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[2]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[4]*0.1).toFixed(2);
                    Data.currentMPPT3=(parsedData[6]*0.1).toFixed(2);
                    Data.currentMPPT4=(parsedData[8]*0.1).toFixed(2);
                    Data.currentMPPT5=(parsedData[10]*0.1).toFixed(2);
                    Data.currentMPPT6=(parsedData[12]*0.1).toFixed(2);
                    Data.powerMPPT1=(parsedData[23]/10000).toFixed(2);
                    Data.powerMPPT2=(parsedData[24]/10000).toFixed(2);
                    Data.powerMPPT3=(parsedData[25]/10000).toFixed(2);
                    Data.powerMPPT4=(parsedData[26]/10000).toFixed(2);
                    Data.powerMPPT5=(parsedData[27]/10000).toFixed(2);
                    Data.powerMPPT6=(parsedData[28]/10000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,Data.currentMPPT5,Data.currentMPPT6);
                    Data.inputPower=(parsedData[22]/10000).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[35]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[36]*0.1);
                    Data.totalRuntime=parseInt((parsedData[37]*0.5)/3600);
                    Data.warning=addString(parsedData[34]);
                    Data.fault=addString(parsedData[21],parsedData[33]);
                    
                }
                else{
                    return "Conflict";
                }

            break;

            case 18:    //SMA Solid Q 50

            parametersCount=35;

            if(dataLength==80)
            {
                for(let i=0,m=0;i<parametersCount;i++)
                {
                    if(i>=0 && i<30){
                        if(i==1 || i==15)
                            parsedData[i]=signed16Bit(data[m],data[m+1]);
                        else
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                    }
                    else {
                        parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                }

                //Status Conversion
                if(parsedData[0]==0)
                parsedData[0]='Wait';
                else if(parsedData[0]==1)
                parsedData[0]='Running';
                else if(parsedData[0]==2)
                parsedData[0]='Fault';

                //Warning Conversion
                let warning1=parsedData[16];
                let parseWarning1="";
               
                if(warning1==30)
                    parseWarning1='Recovered from warning';
                else if(warning1==151)
                    parseWarning1='SPD Warning';
                else if(warning1==156)
                    parseWarning1='Internal fan abnormal';
                else if(warning1==157)
                    parseWarning1='External fan 1 abnormal';
                else if(warning1==158)
                    parseWarning1='External fan 2 abnormal';
                else if(warning1==161)
                    parseWarning1='Fuse abnormal';
                else if(warning1==163)
                    parseWarning1='PV string current abnormal';
                else if(warning1==166)
                    parseWarning1='CPU selftest warning - register abnormal';
                else if(warning1==167)
                    parseWarning1='CPU selftest warning - RAM abnormal';
                else if(warning1==168)
                    parseWarning1='CPU selftest warning - ROM abnormal';
         
                warning1 = parseWarning1;

                //Fault coversion
                let fault1=parsedData[16];
                let parseFault1="";

                if(fault1==1)
                    parseFault1='Internal communication failure';
                else if(fault1==2)
                    parseFault1='EEPROM R/W failure';
                else if(fault1==3)
                    parseFault1='Relay Check failure';
                else if(fault1==4)
                    parseFault1='DC injection to High';
                else if(fault1==8)
                    parseFault1='AC HCT failure';
                else if(fault1==9)
                    parseFault1='Residual current too high';
                else if(fault1==11)
                    parseFault1='Internal software mismatch';
                else if(fault1==33)
                    parseFault1='F,ac out of range';
                else if(fault1==34)
                    parseFault1='V,ac out of range';
                else if(fault1==35)
                    parseFault1='Utility Loss';
                else if(fault1==36)
                    parseFault1='Residual current too high';
                else if(fault1==37)
                    parseFault1='V,pv overvoltage';
                else if(fault1==38)
                    parseFault1='Isolaion Fault';
                else if(fault1==40)
                    parseFault1='Overtemperature';
                else if(fault1==41)
                    parseFault1='Consistant fault: Vac different';
                else if(fault1==42)
                    parseFault1='Consistant fault: Fac different';
                else if(fault1==43)
                    parseFault1='Consistant Fault: Residual current different';
                else if(fault1==44)
                    parseFault1='Consistant Fault: DC injection different';
                else if(fault1==46)
                    parseFault1='Too high DC bus voltage';
                else if(fault1==48)
                    parseFault1='Average volt of ten minute out of range';
                
                fault1 = parseFault1;

                //Add data to mongoose object for Database
                Data.status=(parsedData[0]);
                Data.temperature=(parsedData[1]*0.1).toFixed(2);
                Data.voltagePhaseR=(parsedData[8]*0.1).toFixed(2);
                Data.voltagePhaseY=(parsedData[10]*0.1).toFixed(2);
                Data.voltagePhaseB=(parsedData[12]*0.1).toFixed(2);
                Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                Data.currentPhaseR=(parsedData[9]*0.1).toFixed(2);
                Data.currentPhaseY=(parsedData[11]*0.1).toFixed(2);
                Data.currentPhaseB=(parsedData[13]*0.1).toFixed(2);
                Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                Data.powerPhaseR=((Data.voltagePhaseR*Data.currentPhaseR)/1000).toFixed(2);
                Data.powerPhaseY=((Data.voltagePhaseY*Data.currentPhaseY)/1000).toFixed(2);
                Data.powerPhaseB=((Data.voltagePhaseB*Data.currentPhaseB)/1000).toFixed(2);
                Data.activePower=(parsedData[30]/1000).toFixed(2);
                Data.reactivePower=(parsedData[31]/1000).toFixed(2);
                Data.frequency=(parsedData[14]*0.01).toFixed(2);
                Data.powerFactor=(parsedData[15]*0.01).toFixed(2);
                Data.voltageMPPT1=(parsedData[2]*0.1).toFixed(2);
                Data.currentMPPT1=(parsedData[3]*0.1).toFixed(2);
                Data.powerMPPT1=((Data.voltageMPPT1*Data.currentMPPT1)/1000).toFixed(2);
                Data.voltageMPPT2=(parsedData[4]*0.1).toFixed(2);
                Data.currentMPPT2=(parsedData[5]*0.1).toFixed(2);
                Data.powerMPPT2=((Data.voltageMPPT2*Data.currentMPPT2)/1000).toFixed(2);
                Data.voltageMPPT3=(parsedData[6]*0.1).toFixed(2);
                Data.currentMPPT3=(parsedData[7]*0.1).toFixed(2);
                Data.powerMPPT3=((Data.voltageMPPT3*Data.currentMPPT3)/1000).toFixed(2);
                Data.inputCurrent=(add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3)*1).toFixed(2);
                Data.inputPower=(add(Data.powerMPPT1,Data.powerMPPT2,Data.powerMPPT3)*1).toFixed(2);
                Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                Data.dailyEnergy=(parsedData[32]*0.1).toFixed(2);
                Data.totalEnergy=(parsedData[33]*0.1).toFixed(2);
                Data.dailyRuntime=parseInt(parsedData[17]/3600);
                Data.totalRuntime=parseInt(parsedData[34]*1);
                Data.currentString1=(parsedData[18]*0.1).toFixed(2);
                Data.currentString2=(parsedData[19]*0.1).toFixed(2);
                Data.currentString3=(parsedData[20]*0.1).toFixed(2);
                Data.currentString4=(parsedData[21]*0.1).toFixed(2);
                Data.currentString5=(parsedData[22]*0.1).toFixed(2);
                Data.currentString6=(parsedData[23]*0.1).toFixed(2);
                Data.currentString7=(parsedData[24]*0.1).toFixed(2);
                Data.currentString8=(parsedData[25]*0.1).toFixed(2);
                Data.currentString9=(parsedData[26]*0.1).toFixed(2);
                Data.currentString10=(parsedData[27]*0.1).toFixed(2);
                Data.currentString11=(parsedData[28]*0.1).toFixed(2);
                Data.currentString12=(parsedData[29]*0.1).toFixed(2);
                Data.warning=warning1;
                Data.fault=fault1;

            }
            else{
                return "Conflict";
            }

            break;
            
            case 19:      //Solar Edge
             
            parametersCount=32;
            
            if(dataLength==66)
            {
                for(let i=0,m=0;i<parametersCount;i++)
                {
                    if(i>=0 && i<31){
                        if(i==0 || i==1 || i==3 || i==4 || i==6 || i==7 || i==8 || i==12 || i==20 || i==21 || i==23 || i==29 || i==30)
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        else
                            parsedData[i]=signed16Bit(data[m],data[m+1]);
                            m+=2;
                    }
                    else if(i>=31 && i<32){
                        parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                }

                //Status Conversion
                if(parsedData[29]==1)
                parsedData[29]='Off';
                else if(parsedData[29]==2)
                parsedData[29]='Sleeping';
                else if(parsedData[29]==3)
                parsedData[29]='Wake-up';
                else if(parsedData[29]==4)
                parsedData[29]='Running';
                else if(parsedData[29]==5)
                parsedData[29]='Production(curtailed)';
                else if(parsedData[29]==6)
                parsedData[29]='Shutting down';
                else if(parsedData[29]==7)
                parsedData[29]='Fault';
                else if(parsedData[29]==8)
                parsedData[29]='Maintenance/setup';

                //Add data to mongoose object for Database
                Data.status=(parsedData[29]);
                Data.temperature=(parsedData[27]* Math.pow(10, parsedData[28])).toFixed(2);
                Data.voltagePhaseR=(parsedData[6]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.voltagePhaseY=(parsedData[7]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.voltagePhaseB=(parsedData[8]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                Data.currentPhaseR=(parsedData[2]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.currentPhaseY=(parsedData[3]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.currentPhaseB=(parsedData[4]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                Data.powerPhaseR=((Data.voltagePhaseR*Data.currentPhaseR)/1000).toFixed(2);
                Data.powerPhaseY=((Data.voltagePhaseY*Data.currentPhaseY)/1000).toFixed(2);
                Data.powerPhaseB=((Data.voltagePhaseB*Data.currentPhaseB)/1000).toFixed(2);
                Data.activePower=((parsedData[10]* Math.pow(10, parsedData[11]))/1000).toFixed(2);
                Data.reactivePower=((parsedData[16]* Math.pow(10, parsedData[17]))/1000).toFixed(2);
                Data.apparentpower=((parsedData[14]* Math.pow(10, parsedData[15]))/1000).toFixed(2);
                Data.frequency=(parsedData[12]* Math.pow(10, parsedData[13])).toFixed(2);
                Data.powerFactor=((parsedData[18]* Math.pow(10, parsedData[19]))/100).toFixed(2);
                Data.voltageMPPT1=(parsedData[23]* Math.pow(10, parsedData[24])).toFixed(2);
                Data.currentMPPT1=(parsedData[21]* Math.pow(10, parsedData[22])).toFixed(2);
                Data.powerMPPT1=((parsedData[25]* Math.pow(10, parsedData[26]))/1000).toFixed(2);
                Data.inputCurrent=Data.currentMPPT1;
                Data.inputPower=Data.powerMPPT1;
                Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                Data.totalEnergy=((parsedData[31]* Math.pow(10, parsedData[20]))/1000).toFixed(2);
                
                const lastestRecord = await StringInverter.aggregate([
                    {
                      '$match': {
                        'plantId': Data.plantId, 
                        'deviceNo': Data.deviceNo, 
                        'timestamp': {
                          '$gte': new Date(GMTDate)
                        },
                        'errorFlag': 0
                      }
                    }, {
                      '$sort': {
                        'timestamp': 1
                      }
                    }, {
                      '$limit': 1
                    }
                  ]);
                
                  if(typeof lastestRecord[0] != 'undefined')
                  {
                      if(isFinite(lastestRecord[0].totalEnergy))
                      {
                          Data.dailyEnergy=parseInt(Data.totalEnergy - lastestRecord[0].totalEnergy);
                      }
                      else
                          Data.dailyEnergy=0;
                  }
                  else
                      Data.dailyEnergy=0;
                      
                  if(Data.dailyEnergy < 0)
                      Data.dailyEnergy=0;
            }
            else if(dataLength==33)
            {
                for(let i=0,m=0;i<parametersCount;i++)
                {
                    if(i>=0 && i<31){
                        if(i==0 || i==1 || i==3 || i==4 || i==6 || i==7 || i==8 || i==12 || i==20 || i==21 || i==23 || i==29 || i==30)
                            parsedData[i]=data[m];
                        else
                            parsedData[i]=signed16by16Bit(data[m]);
                            m++;
                    }
                    else if(i>=31 && i<32){
                        parsedData[i]=reverseUnsigned32Bit_16Bit(data[m],data[m+1]);
                        m+=2;
                    }
                }

                //Status Conversion
                if(parsedData[29]==1)
                parsedData[29]='Off';
                else if(parsedData[29]==2)
                parsedData[29]='Sleeping';
                else if(parsedData[29]==3)
                parsedData[29]='Wake-up';
                else if(parsedData[29]==4)
                parsedData[29]='Running';
                else if(parsedData[29]==5)
                parsedData[29]='Production(curtailed)';
                else if(parsedData[29]==6)
                parsedData[29]='Shutting down';
                else if(parsedData[29]==7)
                parsedData[29]='Fault';
                else if(parsedData[29]==8)
                parsedData[29]='Maintenance/setup';

                //Add data to mongoose object for Database
                Data.status=(parsedData[29]);
                Data.temperature=(parsedData[27]* Math.pow(10, parsedData[28])).toFixed(2);
                Data.voltagePhaseR=(parsedData[6]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.voltagePhaseY=(parsedData[7]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.voltagePhaseB=(parsedData[8]* Math.pow(10, parsedData[9])).toFixed(2);
                Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                Data.currentPhaseR=(parsedData[2]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.currentPhaseY=(parsedData[3]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.currentPhaseB=(parsedData[4]* Math.pow(10, parsedData[5])).toFixed(2);
                Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                Data.powerPhaseR=((Data.voltagePhaseR*Data.currentPhaseR)/1000).toFixed(2);
                Data.powerPhaseY=((Data.voltagePhaseY*Data.currentPhaseY)/1000).toFixed(2);
                Data.powerPhaseB=((Data.voltagePhaseB*Data.currentPhaseB)/1000).toFixed(2);
                Data.activePower=((parsedData[10]* Math.pow(10, parsedData[11]))/1000).toFixed(2);
                Data.reactivePower=((parsedData[16]* Math.pow(10, parsedData[17]))/1000).toFixed(2);
                Data.apparentpower=((parsedData[14]* Math.pow(10, parsedData[15]))/1000).toFixed(2);
                Data.frequency=(parsedData[12]* Math.pow(10, parsedData[13])).toFixed(2);
                Data.powerFactor=((parsedData[18]* Math.pow(10, parsedData[19]))/100).toFixed(2);
                Data.voltageMPPT1=(parsedData[23]* Math.pow(10, parsedData[24])).toFixed(2);
                Data.currentMPPT1=(parsedData[21]* Math.pow(10, parsedData[22])).toFixed(2);
                Data.powerMPPT1=((parsedData[25]* Math.pow(10, parsedData[26]))/1000).toFixed(2);
                Data.inputCurrent=Data.currentMPPT1;
                Data.inputPower=Data.powerMPPT1;
                Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                Data.totalEnergy=((parsedData[31]* Math.pow(10, parsedData[20]))/1000).toFixed(2);
                
                const lastestRecord = await StringInverter.aggregate([
                    {
                      '$match': {
                        'plantId': Data.plantId, 
                        'deviceNo': Data.deviceNo, 
                        'timestamp': {
                          '$gte': new Date(GMTDate)
                        },
                        'errorFlag': 0
                      }
                    }, {
                      '$sort': {
                        'timestamp': 1
                      }
                    }, {
                      '$limit': 1
                    }
                  ]);
                
                if(typeof lastestRecord[0] != 'undefined')
                {
                    if(isFinite(lastestRecord[0].totalEnergy))
                    {
                        Data.dailyEnergy=parseInt(Data.totalEnergy - lastestRecord[0].totalEnergy);
                    }
                    else
                        Data.dailyEnergy=0;
                }
                else
                    Data.dailyEnergy=0;
                    
                if(Data.dailyEnergy < 0)
                    Data.dailyEnergy=0;
            }
            else{
                return "Conflict";
            }
            
            break;

            case 20:      //SAJ
            
            parametersCount = 37
            
            if(dataLength==78)
            {
                for(let i=0,m=0;i<parametersCount;i++)
                {
                    if(i>=0 && i<34)
                    {
                        if(i==17 || i==19 || i==20)
                            parsedData[i]=signed16Bit(data[m],data[m+1]);
                        else
                            parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            m+=2;
                    }
                    else if(i==34 || i==36)
                    {
                        parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                    else
                    {
                        parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                        m+=2;
                    }
                }

                //Status Conversion
                if(parsedData[0]==1)
                parsedData[0]='Wait';
                else if(parsedData[0]==2)
                parsedData[0]='Running';
                else if(parsedData[0]==3)
                parsedData[0]='Fault';
                else if(parsedData[0]==4)
                parsedData[0]='Update';

                //Add data to mongoose object for Database
                Data.status=(parsedData[0]);
                Data.voltageMPPT1=(parsedData[7]*0.1).toFixed(2);
                Data.voltageMPPT2=(parsedData[10]*0.1).toFixed(2);
                Data.voltageMPPT3=(parsedData[13]*0.1).toFixed(2);
                Data.currentMPPT1=(parsedData[8]*0.01).toFixed(2);
                Data.currentMPPT2=(parsedData[11]*0.01).toFixed(2);
                Data.currentMPPT3=(parsedData[14]*0.01).toFixed(2);
                Data.powerMPPT1=(parsedData[9]/1000).toFixed(2);
                Data.powerMPPT2=(parsedData[12]/1000).toFixed(2);
                Data.powerMPPT3=(parsedData[15]/1000).toFixed(2);
                Data.inputVoltage= (parsedData[16]*0.1).toFixed(2);
                Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3);
                Data.inputPower=add(Data.powerMPPT1,Data.powerMPPT2,Data.powerMPPT3);
                Data.temperature=(parsedData[17]*0.1).toFixed(2);
                Data.voltagePhaseR=(parsedData[21]*0.1).toFixed(2);
                Data.voltagePhaseY=(parsedData[25]*0.1).toFixed(2);
                Data.voltagePhaseB=(parsedData[29]*0.1).toFixed(2);
                Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                Data.currentPhaseR=(parsedData[22]*0.01).toFixed(2);
                Data.currentPhaseY=(parsedData[26]*0.01).toFixed(2);
                Data.currentPhaseB=(parsedData[30]*0.01).toFixed(2);
                Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                Data.powerPhaseR=(parsedData[24]/1000).toFixed(2);
                Data.powerPhaseY=(parsedData[28]/1000).toFixed(2);
                Data.powerPhaseB=(parsedData[32]/1000).toFixed(2);
                Data.activePower=(parsedData[18]/1000).toFixed(2);
                Data.reactivePower=(parsedData[19]/1000).toFixed(2);
                Data.frequency=(parsedData[23]*0.01).toFixed(2);
                Data.powerFactor=(parsedData[20]*0.001).toFixed(2);
                Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                Data.dailyEnergy =(parsedData[33]*0.01).toFixed(2);
                Data.dailyRuntime=parseInt(parsedData[35]*0.1);
                Data.totalEnergy=parseInt(parsedData[34]* 0.01);
                Data.dailyRuntime=parseInt(parsedData[36]*0.1);
            }
			else{
                return "Conflict";
            }

            break;

            case 21:      //ABB Trio 50

            if(dataLength==42)  //ABB Trio V1.0 16-Bit
            {
                parametersCount=23;

                for(let i=0,m=0; i<parametersCount;i++){
                    if(i>=0 && i<4){
                        parsedData[i]=data[m];
                        m++;
                    }
                    else if(i>=4 && i<23)
                    {
                        if(i==4 || i==5)
                            parsedData[i]=unsigned32Bit_16Bit(data[m+1],data[m]);
                        else
                            parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                }

                //Status Conversion
                if(parsedData[0]==0)
                parsedData[0]='Initializing (Configuring power control)';
                else if(parsedData[0]==1)
                parsedData[0]='Waiting sun & grid';
                else if(parsedData[0]==2)
                parsedData[0]='Connecting to grid';
                else if(parsedData[0]==3)
                parsedData[0]='Initializing (System startup)';
                else if(parsedData[0]==4)
                parsedData[0]='Connecting to grid (switching-on DC/DC)';
                else if(parsedData[0]==5)
                parsedData[0]='Connecting to grid (switching-on DC/AC)';
                else if(parsedData[0]==6)
                parsedData[0]='Running';
                else if(parsedData[0]==7)
                parsedData[0]='Post-alarm actions (recovery)';
                else if(parsedData[0]==8)
                parsedData[0]='Post-alarm actions (pause)';
                else if(parsedData[0]==9)
                parsedData[0]='Ground fault';
                else if(parsedData[0]==10)
                parsedData[0]='Over-temperature fault';
                else if(parsedData[0]==12)
                parsedData[0]='Connecting to grid (grid protection interface self-test)';
                else if(parsedData[0]==13)
                parsedData[0]='Grid protection interface self-test fault';
                else if(parsedData[0]==14)
                parsedData[0]='Connection to grid (Safety checks)';
                else if(parsedData[0]==15)
                parsedData[0]='Leakage Fault';
                else if(parsedData[0]==24)
                parsedData[0]='Under-temperature fault';
                else if(parsedData[0]==25)
                parsedData[0]='Interlock (Remote off)';
                else if(parsedData[0]==26)
                parsedData[0]='Interlock (Emergency off)';
                else if(parsedData[0]==27)
                parsedData[0]='Executing auto-test';
                else if(parsedData[0]==29)
                parsedData[0]='Grounding-kit fault';
                else if(parsedData[0]==30)
                parsedData[0]='SW bundle not valid fault';
                else if(parsedData[0]==41)
                parsedData[0]='Temperature sensors fault';
                else if(parsedData[0]==42)
                parsedData[0]='Grid sequence fault';
                else if(parsedData[0]==51)
                parsedData[0]='Arc fault';
                else if(parsedData[0]==53)
                parsedData[0]='Arc detector self-test fault';
                else if(parsedData[0]==116)
                parsedData[0]='Power stage off-line';
                else if(parsedData[0]==118)
                parsedData[0]='Arc detector wrong configuration fault';
                else if(parsedData[0]==119)
                parsedData[0]='Arc detector self-test';
                else if(parsedData[0]==120)
                parsedData[0]='Configuration fault (Bad model)';
                else if(parsedData[0]==124)
                parsedData[0]='Latch with "Reset by hand"';
                else if(parsedData[0]==150)
                parsedData[0]='Power stage communication fault';
                else if(parsedData[0]==151)
                parsedData[0]='Configuration fault (Bad Global-settings)';
                else if(parsedData[0]==200)
                parsedData[0]='Programming power stage';

                //Fault and Alarm
                let fault1=parsedData[1];
                let parseFault1="";

                if(fault1==1)
                parseFault1="Input OC";
                if(fault1==4)
                parseFault1="Input OV";
                if(fault1==6)
                parseFault1="No pars (DSP)";
                if(fault1==7)
                parseFault1="Bulk OV";
                if(fault1==8)
                parseFault1="Internal Error";
                if(fault1==9)
                parseFault1="Output OC";
                if(fault1==10)
                parseFault1="IGBT Sat.";
                if(fault1==12)
                parseFault1="Internal Error";
                if(fault1==14)
                parseFault1="Bulk UV";
                if(fault1==15)
                parseFault1="Ramp Fault";
                if(fault1==16)
                parseFault1="Internal Error";
                if(fault1==19)
                parseFault1="Over Temperatuture";
                if(fault1==20)
                parseFault1="Cap. Fault";
                if(fault1==21)
                parseFault1="Internal Error";
                if(fault1==22)
                parseFault1="Internal Error";
                if(fault1==23)
                parseFault1="Leak Fault";
                if(fault1==24)
                parseFault1="Internal Error";
                if(fault1==25)
                parseFault1="Internal Error";
                if(fault1==26)
                parseFault1="Internal Error";
                if(fault1==27)
                parseFault1="Internal Error";
                if(fault1==28)
                parseFault1="Internal Error";
                if(fault1==29)
                parseFault1="Internal Error";
                if(fault1==30) 
                parseFault1="Internal Error";
                if(fault1==31)
                parseFault1="DC Injection";
                if(fault1==38)
                parseFault1="Riso Low";
                if(fault1==42)
                parseFault1="Mid Bulk OV";
                if(fault1==44)
                parseFault1="Internal Error";
                if(fault1==45)
                parseFault1="Internal Error";
                if(fault1==48)
                parseFault1="Under Temperature";
                if(fault1==49)
                parseFault1="IGBT Not Ready";
                if(fault1==50)
                parseFault1="Remote Off";
                if(fault1==51)
                parseFault1="Internal Error";
                if(fault1==54)
                parseFault1="Riso Low";
                if(fault1==78)
                parseFault1="Riso Test Fail";
                if(fault1==79)
                parseFault1="AFDD Activated";
                if(fault1==82)
                parseFault1="AFDD Fault";
                if(fault1==85)
                parseFault1="AFDD Wrong Conf.";
                if(fault1==91)
                parseFault1="Internal Error";
                if(fault1==96)
                parseFault1="Latch-Manual Ent";
                if(fault1==152)
                parseFault1="Wrong Sequence";
                if(fault1==156)
                parseFault1="Backfeed OC";

                let alarm1=parsedData[1];
                let parseAlarm1="";
                
                if(alarm1==3)
                parseAlarm1="Input UV";
                if(alarm1==5)
                parseAlarm1="Sun Low";
                if(alarm1==11)
                parseAlarm1="Bulk UV";
                if(alarm1==32)
                parseAlarm1="Grid OV";
                if(alarm1==33)
                parseAlarm1="Grid UV";
                if(alarm1==34)
                parseAlarm1="Grid OF";
                if(alarm1==35)
                parseAlarm1="Grid UF";
                if(alarm1==47)
                parseAlarm1="Fan Fault";
                if(alarm1==52)
                parseAlarm1="Battery Low";
                if(alarm1==53)
                parseAlarm1="Clock Fault";
                if(alarm1==62)
                parseAlarm1="Island. Detected";
                if(alarm1==64)
                parseAlarm1="Jbox Fault";
                if(alarm1==70)
                parseAlarm1="DC SPD Tripped";
                if(alarm1==71)
                parseAlarm1="AC SPD Tripped";
                if(alarm1==75)
                parseAlarm1="Q-mode Change";
                if(alarm1==76)
                parseAlarm1="Date/Time Mod.";
                if(alarm1==77)
                parseAlarm1="Energy Data Rst.";
                if(alarm1==84)
                parseAlarm1="AFDD User Reset";
                if(alarm1==89)
                parseAlarm1="Latch-Manual Rst.";
                if(alarm1==90)
                parseAlarm1="Periodic Grid Off";
                if(alarm1==95)
                parseAlarm1="Grid Conn. Fault";
                if(alarm1==144)
                parseAlarm1="HW Module Swap";
                if(alarm1==150)
                parseAlarm1="Update Incomplete";
                if(alarm1==151)
                parseAlarm1="Globel-Settings Event";
                if(alarm1==160)
                parseAlarm1="ID Data Was Set";

                //Add data to mongoose object for Database
                Data.status=(parsedData[0]);
                Data.temperature=(parsedData[18]*1).toFixed(2);
                Data.outputVoltage=(parsedData[6]*1).toFixed(2);
                Data.outputCurrent=(parsedData[7]*1).toFixed(2);
                Data.activePower=(parsedData[8]/1000).toFixed(2);
                Data.reactivePower=(parsedData[9]/1000).toFixed(2);
                Data.powerFactor=(parsedData[10]*1).toFixed(2);
                Data.frequency=(parsedData[11]*1).toFixed(2);
                Data.voltageMPPT1=(parsedData[13]*1).toFixed(2);
                Data.voltageMPPT2=(parsedData[16]*1).toFixed(2);
                Data.voltageMPPT3=(parsedData[21]*1).toFixed(2);
                Data.currentMPPT1=(parsedData[14]*1).toFixed(2);
                Data.currentMPPT2=(parsedData[17]*1).toFixed(2);
                Data.currentMPPT3=(parsedData[22]*1).toFixed(2);
                Data.powerMPPT1=(parsedData[12]/1000).toFixed(2);
                Data.powerMPPT2=(parsedData[15]/1000).toFixed(2);
                Data.powerMPPT3=(parsedData[20]/1000).toFixed(2);
                Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3);
                Data.inputPower=add(Data.powerMPPT1,Data.powerMPPT2,Data.powerMPPT3);
                Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                Data.dailyEnergy=(parsedData[4]/1000).toFixed(2);
                Data.totalEnergy=parseInt(parsedData[5]/1000);
                Data.fault=addString(parseFault1);
                Data.warning=addString(parseAlarm1);

                if(Data.efficiency < 0)
                    Data.efficiency = 0;
                
            }
            else{
                return "Conflict";
            }

            break;

            case 22:      //Hitachi
            
                parametersCount = 45
                
                if(dataLength==47)  //Hitachi 1.0 16-Bit
                {
                    for(let i=0,m=0;i<parametersCount;i++)
                    {
                        if(i>=0 && i<43)
                        {
                            if(i>=0 && i<31)
                            {
                                if(i == 16)
                                    parsedData[i]=signed16by16Bit(data[m]);
                                else
                                    parsedData[i]=(data[m]);
                            }
                            else
                                parsedData[i]=signed16by16Bit(data[m]);
                            m++;
                        }
                        else
                        {
                            parsedData[i]=unsigned32Bit_16Bit(data[m+1],data[m]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                        parsedData[0]='Wait';
                    else if(parsedData[0]==1)
                        parsedData[0]='Check';
                    else if(parsedData[0]==2)
                        parsedData[0]='Running';
                    else if(parsedData[0]==3)
                        parsedData[0]='Fault';
                    else if(parsedData[0]==4)
                        parsedData[0]='Permanent';

                    //Alarm Conversion
                    
                    let error1=dectobin16Bit(parsedData[29]);
                    let parseError1="";

                    if(error1[0]==1)
                        parseError1+='Fan 1 Alarm, ';
                    if(error1[1]==1)
                        parseError1+='Fan 2 Alarm, ';
                    if(error1[2]==1)
                        parseError1+='Lightning protection Alarm, ';
                    if(error1[3]==1)
                        parseError1+='Software version not Consistent, ';
                    if(error1[4]==1)
                        parseError1+='Communication Board EEPROM Fault, ';
                    if(error1[5]==1)
                        parseError1+='RTC Clock Chip Anomaly, ';
                    if(error1[6]==1)
                        parseError1+='Invalid Country ';
                    if(error1[7]==1)
                        parseError1+='SD Card Fault, ';
                    if(error1[8]==1)
                        parseError1+='Fan 3 Alarm, ';
                    if(error1[9]==1)
                        parseError1+='WiFi Fault, ';
                    if(error1[10]==1)
                        parseError1+='Fan 4 Alarm, ';
                    if(error1[11]==1)
                        parseError1+='Fan 5 Alarm, ';
                    
                    parsedData[29] = parseError1;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[1]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Grid Over Voltage Protection, ';
                    if(fault1[1]==1)
                        parseFault1+='Grid Under Voltage Protection, ';
                    if(fault1[2]==1)
                        parseFault1+='Grid Over Frequency Protection, ';
                    if(fault1[3]==1 )
                        parseFault1+='Grid Under Frequency Protection, ';
                    if(fault1[4]==1 )
                        parseFault1+='PV Under Voltage Protection, ';
                    if(fault1[5]==1 )
                        parseFault1+='Grid Low Voltage Ride Through, ';
                    if(fault1[8]==1)
                        parseFault1+='PV Over Voltage Protection, ';
                    if(fault1[9]==1)
                        parseFault1+='PV Input Current Unbalance, ';
                    if(fault1[10]==1 )
                        parseFault1+='PV Input Mode Configure Wrong, ';
                    if(fault1[11]==1 )
                        parseFault1+='Ground Fault Circuit Interrupters Fault, ';
                    if(fault1[12]==1 )
                        parseFault1+='Grid Fault, '
                    if(fault1[13]==1  )
                        parseFault1+='HW Boost Over Current Protection, ';
                    if(fault1[14]==1  )
                        parseFault1+='HW AC Over Current Protection, ';
                    if(fault1[15]==1 )
                        parseFault1+='Grid Current too High, ';

                    parsedData[1] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[2]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='Grid Current Sampling Error, ';
                    if(fault2[1]==1)
                        parseFault2+='DCI Sampling Error, ';
                    if(fault2[2]==1)
                        parseFault2+='Grid Voltage Sampling Error, ';
                    if(fault2[3]==1)
                        parseFault2+='GFCI Device Sampling Error, ';
                    if(fault2[4]==1)
                        parseFault2+='Main Chip Fault, ';
                    if(fault2[5]==1)
                        parseFault2+='HW Auxiliary Power Fault, ';
                    if(fault2[6]==1)
                        parseFault2+='Bus Voltage Zero Fault, ';
                    if(fault2[7]==1)
                        parseFault2+='Output Current Unbalanced, ';
                    if(fault2[8]==1)
                        parseFault2+='Bus Under Voltage Protection, ';
                    if(fault2[9]==1)
                        parseFault2+='Bus Over Voltage Protection, ';
                    if(fault2[10]==1)
                        parseFault2+='Bus Voltage Unbalance, ';
                    if(fault2[11]==1)
                        parseFault1+='DCI too High, ';
                    if(fault2[12]==1)
                        parseFault2+='Grid Current too High, ';
                    if(fault2[13]==1)
                        parseFault2+='Input Current too High, ';
                        
                    parsedData[2] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[4]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='Consistent Fault Voltage Grid, ';
                    if(fault3[1]==1)
                        parseFault3+='Consistent Fault Frequency Grid, ';
                    if(fault3[2]==1)
                        parseFault3+='Consistent Fault DCI, ';
                    if(fault3[3]==1)
                        parseFault3+='Consistent Fault GFCI, ';
                    if(fault3[4]==1)
                        parseFault3+='Communication B/W Master & Slave DSP Fail, ';
                    if(fault3[5]==1)
                        parseFault3+='Communication B/W Slave & Board Fail, ';
                    if(fault3[6]==1)
                        parseFault3+='Relay Test Fail, ';
                    if(fault3[7]==1)
                        parseFault3+='PV Insulation Fault, ';
                    if(fault3[8]==1)
                        parseFault3+='Inverter Temp too High, ';
                    if(fault3[9]==1)
                        parseFault3+='Boost Temp too High, ';
                    if(fault3[10]==1)
                        parseFault3+='Equipment Temp too High, ';
                    if(fault3[11]==1)
                        parseFault3+='PE Connect Fault, ';

                    parsedData[4] = parseFault3;

                    let fault4=dectobin16Bit(parsedData[5]);
                    let parseFault4="";

                    if(fault4[0]==1)
                        parseFault4='Unrecoverable Fault - Grid Current too High, ';
                    if(fault4[1]==1)
                        parseFault4+='Unrecoverable Fault - Bus Voltage too High, ';
                    if(fault4[2]==1)
                        parseFault4+='Unrecoverable Fault - Grid Current Unbalance, ';
                    if(fault4[3]==1)
                        parseFault4+='Unrecoverable Fault - Input Current Unbalance, ';
                    if(fault4[4]==1)
                        parseFault4+='Unrecoverable Fault - Bus Voltage Unbalance, ';
                    if(fault4[5]==1)
                        parseFault4+='Unrecoverable Fault - Grid Current too High, ';
                    if(fault4[6]==1)
                        parseFault4+='Unrecoverable Fault - PV Input Mode Configure Wrong, ';
                    if(fault4[9]==1)
                        parseFault4+='Unrecoverable Fault - Input Current too High, ';
                    if(fault4[10]==1)
                        parseFault4+='Unrecoverable Fault - Write EEPROM Fault, ';
                    if(fault4[11]==1)
                        parseFault4+='Unrecoverable Fault - Read EEPROM Fault, ';
                    if(fault4[12]==1)
                        parseFault4+='Unrecoverable Fault - Relay Fail, ';

                    parsedData[5] = parseFault4;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.voltageMPPT1=(parsedData[6]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[8]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[10]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[7]*0.01).toFixed(2);
                    Data.currentMPPT2=(parsedData[9]*0.01).toFixed(2);
                    Data.currentMPPT3=(parsedData[11]*0.01).toFixed(2);
                    Data.powerMPPT1=(parsedData[12]*0.01).toFixed(2);
                    Data.powerMPPT2=(parsedData[13]*0.01).toFixed(2);
                    Data.powerMPPT3=(parsedData[14]*0.01).toFixed(2);
                    Data.inputVoltage=(parsedData[28]*0.1).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3);
                    Data.inputPower=add(Data.powerMPPT1,Data.powerMPPT2,Data.powerMPPT3);
                    Data.temperature=(parsedData[27]*1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[18]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[20]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[22]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[19]*0.01).toFixed(2);
                    Data.currentPhaseY=(parsedData[21]*0.01).toFixed(2);
                    Data.currentPhaseB=(parsedData[23]*0.01).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[15]*0.01).toFixed(2);
                    Data.reactivePower=(parsedData[16]*0.01).toFixed(2);
                    Data.frequency=(parsedData[17]*0.01).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy =(parsedData[24]*0.1).toFixed(2);
                    Data.dailyRuntime=parseInt(parsedData[25]/60);
                    Data.totalEnergy=parseInt(parsedData[43]* 1);
                    Data.totalRuntime=parseInt(parsedData[44]*1);
                    Data.fault=addString(parsedData[1],parsedData[2],parsedData[4],parsedData[5]);
                    Data.error=addString(parsedData[29]);
                    Data.currentString1=(parsedData[31]*0.01).toFixed(2);
                    Data.currentString2=(parsedData[32]*0.01).toFixed(2);
                    Data.currentString3=(parsedData[33]*0.01).toFixed(2);
                    Data.currentString4=(parsedData[34]*0.01).toFixed(2);
                    Data.currentString5=(parsedData[35]*0.01).toFixed(2);
                    Data.currentString6=(parsedData[36]*0.01).toFixed(2);
                    Data.currentString7=(parsedData[37]*0.01).toFixed(2);
                    Data.currentString8=(parsedData[38]*0.01).toFixed(2);
                    Data.currentString9=(parsedData[39]*0.01).toFixed(2);
                    Data.currentString10=(parsedData[40]*0.01).toFixed(2);
                    Data.currentString11=(parsedData[41]*0.01).toFixed(2);
                    Data.currentString12=(parsedData[42]*0.01).toFixed(2);
                }
                else
                    return "Conflict";
            break;

            case 23:      //Luminous

                parametersCount=25;
            
                if(dataLength==60) // 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<20){
                            if(i==18){
                                parsedData[i]=signed16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=unsigned16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                        else if(i>=20 && i<25){
                                parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1],data[m+2],data[m+3]);
                            m+=4;
                        }
                    }

                    //Status Conversion
                    if(parsedData[17]==0)
                    parsedData[17]='Waiting';
                    else if(parsedData[17]==1)
                    parsedData[17]='OpenRun';
                    else if(parsedData[17]==2)
                    parsedData[17]='SoftRun';
                    else if(parsedData[17]==3)
                    parsedData[17]='Running';
                    else if(parsedData[17]==4100)
                    parsedData[17]='Control Stop';
                    else if(parsedData[17]==4112)
                    parsedData[17]='Grid Over Voltage';
                    else if(parsedData[17]==4113)
                    parsedData[17]='Grid Under Voltage';
                    else if(parsedData[17]==4114)
                    parsedData[17]='Grid Over Frequency';
                    else if(parsedData[17]==4115)
                    parsedData[17]='Grid Under Frequency';
                    else if(parsedData[17]==4116)
                    parsedData[17]='Grid Impedence Over';
                    else if(parsedData[17]==4117)
                    parsedData[17]='No Grid';
                    else if(parsedData[17]==4118)
                    parsedData[17]='Grid Unbalance';
                    else if(parsedData[17]==4119)
                    parsedData[17]='Grid Frequency Fluctuation';
                    else if(parsedData[17]==4120)
                    parsedData[17]='Gid Over Current';
                    else if(parsedData[17]==4121)
                    parsedData[17]='Grid Current Tracking Fault';
                    else if(parsedData[17]==4128)
                    parsedData[17]='DC Over Voltage';
                    else if(parsedData[17]==4129)
                    parsedData[17]='DC Bus Over Voltage';
                    else if(parsedData[17]==4130)
                    parsedData[17]='DC Bus Unbalance';
                    else if(parsedData[17]==4131)
                    parsedData[17]='DC Bus Under Voltage';
                    else if(parsedData[17]==4132)
                    parsedData[17]='DC Bus Unbalance 2';
                    else if(parsedData[17]==4133)
                    parsedData[17]='DC (CH A) Over Current';
                    else if(parsedData[17]==4134)
                    parsedData[17]='DC (CH B) Over Current';
                    else if(parsedData[17]==4135)
                    parsedData[17]='DC Over Current';
                    else if(parsedData[17]==4144)
                    parsedData[17]='Grid Interfereence Protectin';
                    else if(parsedData[17]==4145)
                    parsedData[17]='DSP Initial Protection';
                    else if(parsedData[17]==4146)
                    parsedData[17]='Temperature Protection';
                    else if(parsedData[17]==4147)
                    parsedData[17]='Ground Fault';
                    else if(parsedData[17]==4148)
                    parsedData[17]='Leakage Current Protection';
                    else if(parsedData[17]==4149)
                    parsedData[17]='Relay Protection';
                    else if(parsedData[17]==4150)
                    parsedData[17]='DSP_B Protection';
                    else if(parsedData[17]==4151)
                    parsedData[17]='DC Injection Protection';
                    else if(parsedData[17]==4152)
                    parsedData[17]='12V Under Voltage Faulty';
                    else if(parsedData[17]==4153)
                    parsedData[17]='Leakage Current Check Protection';
                    else if(parsedData[17]==4160)
                    parsedData[17]='AFCI Check Fault';
                    else if(parsedData[17]==4161)
                    parsedData[17]='AFCI Fault';
                    else if(parsedData[17]==4162)
                    parsedData[17]='DSP Chip SRAM Fault';
                    else if(parsedData[17]==4163)
                    parsedData[17]='DSP Chip Flash Fault';
                    else if(parsedData[17]==4164)
                    parsedData[17]='DSP Chip PC Pointer Fault';
                    else if(parsedData[17]==4165)
                    parsedData[17]='DSP Chip Register Fault';
                    else if(parsedData[17]==4166)
                    parsedData[17]='Grid interference 2 Protection';
                    else if(parsedData[17]==4167)
                    parsedData[17]='Grid Current Sampling Error';
                    else if(parsedData[17]==4168)
                    parsedData[17]='IGBT Over Current';

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[17]);
                    Data.temperature=(parsedData[15]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[9]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[10]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[11]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[12]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[13]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[14]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[20]*0.001).toFixed(2);
                    Data.reactivePower=(parsedData[23]*0.001).toFixed(2);
                    Data.apparentpower=(parsedData[24]*0.001).toFixed(2);
                    Data.frequency=(parsedData[16]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[19]*0.001).toFixed(3);
                    Data.voltageMPPT1=(parsedData[1]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[3]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[5]*0.1).toFixed(2);
                    Data.voltageMPPT4=(parsedData[7]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[2]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[4]*0.1).toFixed(2);
                    Data.currentMPPT3=(parsedData[6]*0.1).toFixed(2);
                    Data.currentMPPT4=(parsedData[8]*0.1).toFixed(2);
                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1, Data.currentMPPT2, Data.currentMPPT3, Data.currentMPPT4);
                    Data.inputPower=(parsedData[21]*0.001).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[22]*1);
        
                }
                else if(dataLength==30) // 16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<20){
                            if(i==18){
                                parsedData[i]=signed16Bit(data[m]);
                            }
                            else{
                                parsedData[i]=data[m];
                            }
                            m++;
                        }
                        else {
                            parsedData[i]=reverseUnsigned32Bit_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[17]==0)
                    parsedData[17]='Waiting';
                    else if(parsedData[17]==1)
                    parsedData[17]='OpenRun';
                    else if(parsedData[17]==2)
                    parsedData[17]='SoftRun';
                    else if(parsedData[17]==3)
                    parsedData[17]='Running';
                    else if(parsedData[17]==4100)
                    parsedData[17]='Control Stop';
                    else if(parsedData[17]==4112)
                    parsedData[17]='Grid Over Voltage';
                    else if(parsedData[17]==4113)
                    parsedData[17]='Grid Under Voltage';
                    else if(parsedData[17]==4114)
                    parsedData[17]='Grid Over Frequency';
                    else if(parsedData[17]==4115)
                    parsedData[17]='Grid Under Frequency';
                    else if(parsedData[17]==4116)
                    parsedData[17]='Grid Impedence Over';
                    else if(parsedData[17]==4117)
                    parsedData[17]='No Grid';
                    else if(parsedData[17]==4118)
                    parsedData[17]='Grid Unbalance';
                    else if(parsedData[17]==4119)
                    parsedData[17]='Grid Frequency Fluctuation';
                    else if(parsedData[17]==4120)
                    parsedData[17]='Gid Over Current';
                    else if(parsedData[17]==4121)
                    parsedData[17]='Grid Current Tracking Fault';
                    else if(parsedData[17]==4128)
                    parsedData[17]='DC Over Voltage';
                    else if(parsedData[17]==4129)
                    parsedData[17]='DC Bus Over Voltage';
                    else if(parsedData[17]==4130)
                    parsedData[17]='DC Bus Unbalance';
                    else if(parsedData[17]==4131)
                    parsedData[17]='DC Bus Under Voltage';
                    else if(parsedData[17]==4132)
                    parsedData[17]='DC Bus Unbalance 2';
                    else if(parsedData[17]==4133)
                    parsedData[17]='DC (CH A) Over Current';
                    else if(parsedData[17]==4134)
                    parsedData[17]='DC (CH B) Over Current';
                    else if(parsedData[17]==4135)
                    parsedData[17]='DC Over Current';
                    else if(parsedData[17]==4144)
                    parsedData[17]='Grid Interfereence Protectin';
                    else if(parsedData[17]==4145)
                    parsedData[17]='DSP Initial Protection';
                    else if(parsedData[17]==4146)
                    parsedData[17]='Temperature Protection';
                    else if(parsedData[17]==4147)
                    parsedData[17]='Ground Fault';
                    else if(parsedData[17]==4148)
                    parsedData[17]='Leakage Current Protection';
                    else if(parsedData[17]==4149)
                    parsedData[17]='Relay Protection';
                    else if(parsedData[17]==4150)
                    parsedData[17]='DSP_B Protection';
                    else if(parsedData[17]==4151)
                    parsedData[17]='DC Injection Protection';
                    else if(parsedData[17]==4152)
                    parsedData[17]='12V Under Voltage Faulty';
                    else if(parsedData[17]==4153)
                    parsedData[17]='Leakage Current Check Protection';
                    else if(parsedData[17]==4160)
                    parsedData[17]='AFCI Check Fault';
                    else if(parsedData[17]==4161)
                    parsedData[17]='AFCI Fault';
                    else if(parsedData[17]==4162)
                    parsedData[17]='DSP Chip SRAM Fault';
                    else if(parsedData[17]==4163)
                    parsedData[17]='DSP Chip Flash Fault';
                    else if(parsedData[17]==4164)
                    parsedData[17]='DSP Chip PC Pointer Fault';
                    else if(parsedData[17]==4165)
                    parsedData[17]='DSP Chip Register Fault';
                    else if(parsedData[17]==4166)
                    parsedData[17]='Grid interference 2 Protection';
                    else if(parsedData[17]==4167)
                    parsedData[17]='Grid Current Sampling Error';
                    else if(parsedData[17]==4168)
                    parsedData[17]='IGBT Over Current';

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[17]);
                    Data.temperature=(parsedData[15]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[9]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[10]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[11]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[12]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[13]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[14]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[20]*0.001).toFixed(2);
                    Data.reactivePower=(parsedData[23]*0.001).toFixed(2);
                    Data.apparentpower=(parsedData[24]*0.001).toFixed(2);
                    Data.frequency=(parsedData[16]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[19]*0.001).toFixed(3);
                    Data.voltageMPPT1=(parsedData[1]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[3]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[5]*0.1).toFixed(2);
                    Data.voltageMPPT4=(parsedData[7]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[2]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[4]*0.1).toFixed(2);
                    Data.currentMPPT3=(parsedData[6]*0.1).toFixed(2);
                    Data.currentMPPT4=(parsedData[8]*0.1).toFixed(2);
                    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1, Data.currentMPPT2, Data.currentMPPT3, Data.currentMPPT4);
                    Data.inputPower=(parsedData[21]*0.001).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[0]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[22]*1);
        
                }
                else{
                    return "Conflict";
                }

            break;
			
			case 24:      // Huawei 80kW

                parametersCount=42;
            
                if(dataLength==50 || dataLength==51)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<34){
                            if(i==0 || i==24 || i==25 || i==26 || i==28 || i==29 || i==30 || i==31 || i==32 || i==33){
                                parsedData[i]=data[m];
                            }
                            else{
                                parsedData[i]=signed16by16Bit(data[m]);
                            }
                            m++;
                        }
                        else if(i>=34 && i<42){
                            if(i==40 || i==41){
                                parsedData[i]=reverseUnsigned32Bit_16Bit(data[m],data[m+1]);
                            }
                            else{
                                parsedData[i]=signed32by16Bit(data[m],data[m+1]);
                            }
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Idle: Initializing';
                    else if(parsedData[0]==1)
                    parsedData[0]='Idle: Detecting ISO';
                    else if(parsedData[0]==2)
                    parsedData[0]='Idle: Dectecting Irradiation';
                    else if(parsedData[0]==3)
                    parsedData[0]='Idle: Grid Detecting';
                    else if(parsedData[0]==256)
                    parsedData[0]='Starting';
                    else if(parsedData[0]==512)
                    parsedData[0]='Running';
                    else if(parsedData[0]==513)
                    parsedData[0]='On-grid: Power Limit';
                    else if(parsedData[0]==514)
                    parsedData[0]='On Grid: Self Derating';
                    else if(parsedData[0]==768)
                    parsedData[0]='Shutdown: Fault';
                    else if(parsedData[0]==769)
                    parsedData[0]='Shutdown: Command';
                    else if(parsedData[0]==770)
                    parsedData[0]='Shutdown: OVGR';
                    else if(parsedData[0]==771)
                    parsedData[0]='Shutdown: Communication Disconnected';
                    else if(parsedData[0]==772)
                    parsedData[0]='Shutdown: Power Limit';
                    else if(parsedData[0]==773)
                    parsedData[0]='Shutdown: Start Manually';
                    else if(parsedData[0]==774)
                    parsedData[0]='Shutdown: DC Switch OFF';
                    else if(parsedData[0]==1025)
                    parsedData[0]='Grid Dispatch: P Curve';
                    else if(parsedData[0]==1026)
                    parsedData[0]='Grid Dispatch: Q U Curve';
                    else if(parsedData[0]==40960)
                    parsedData[0]='Idle: No Irradiation';
                    else if(parsedData[0]==1280)
                    parsedData[0]='Spot Check';
                    else if(parsedData[0]==1281)
                    parsedData[0]='Spot Checking';
                    else if(parsedData[0]==1536)
                    parsedData[0]='Inspecting';
                    else if(parsedData[0]==1792)
                    parsedData[0]='AFCI Self-Chek';
                    else if(parsedData[0]==2048)
                    parsedData[0]='IV Scanning';
                    else if(parsedData[0]==2304)
                    parsedData[0]='DC Input Detection';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[31]);
                    let parseFault1="";
                    let parseWarning1="";

                    if(fault1[0]==1)
                        parseFault1='High String Voltage, ';
                    if(fault1[1]==1)
                        parseFault1+='DC Arc Fault, ';
                    if(fault1[2]==1)
                        parseFault1+='String Reversed, ';
                    if(fault1[3]==1)
                        parseWarning1+='PV String Backfeed, ';
                    if(fault1[4]==1)
                        parseWarning1+='Abnormal String, ';
                    if(fault1[5]==1)
                        parseFault1+='AFCI Self-test Failed, ';
                    if(fault1[6]==1)
                        parseFault1+='Short Circuit b/w Phase to PE, ';
                    if(fault1[7]==1)
                        parseFault1+='Power Grid Failure, ';
                    if(fault1[8]==1)
                        parseFault1+='Grid Undervoltage, ';
                    if(fault1[9]==1)
                        parseFault1+='Grid Overvoltage, ';
                    if(fault1[10]==1)
                        parseFault1+='Unbalanced Grid Voltage, ';
                    if(fault1[11]==1)
                        parseFault1+='Grid Overfrequency, ';
                    if(fault1[12]==1)
                        parseFault1+='Grid Underfrequency, ';
                    if(fault1[13]==1)
                        parseFault1+='Grid Frequency Instability, ';
                    if(fault1[14]==1)
                        parseFault1+='Output Overcurrent, ';
                    if(fault1[15]==1)
                        parseFault1+='Large DC of Output Current, ';

                    parsedData[31] = parseFault1;
                    parsedData[42] = parseWarning1;

                    let fault2=dectobin16Bit(parsedData[32]);
                    let parseFault2="";
                    let parseWarning2="";
                
                    if(fault2[0]==1)
                        parseFault2='Abnoraml Leakage Current, ';
                    if(fault2[1]==1)
                        parseFault2+='Abnormal Ground, ';
                    if(fault2[2]==1)
                        parseFault2+='Low Insulation Res., ';
                    if(fault2[3]==1)
                        parseFault2+='High Temperature, ';
                    if(fault2[4]==1)
                        parseFault2+='Abnormal Equipment, ';
                    if(fault2[5]==1)
                        parseWarning2+='Upgrade failed, ';
                    if(fault2[6]==1)
                        parseWarning2+='License Expired, ';
                    if(fault2[7]==1)
                        parseWarning2+='Abnormal Monitor Unit, ';

                    parsedData[32] = parseFault2;
                    parsedData[43] = parseWarning2;

                    let fault3=dectobin16Bit(parsedData[33]);
                    let parseFault3="";

                    if(fault3[2]==1)
                        parseFault3='High String Voltage to Ground, ';

                    parsedData[33] = parseFault3;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[30]/10).toFixed(2);
                    Data.voltagePhaseR=(parsedData[24]/10).toFixed(2);
                    Data.voltagePhaseY=(parsedData[25]/10).toFixed(2);
                    Data.voltagePhaseB=(parsedData[26]/10).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[35]/1000).toFixed(2);
                    Data.currentPhaseY=(parsedData[36]/1000).toFixed(2);
                    Data.currentPhaseB=(parsedData[37]/1000).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[38]/1000).toFixed(2);
                    Data.reactivePower=(parsedData[39]/1000).toFixed(2);
                    Data.frequency=(parsedData[28]/100).toFixed(2);
                    Data.powerFactor=(parsedData[27]/1000).toFixed(3);
                    Data.currentString1=(parsedData[2]/100).toFixed(2);
                    Data.currentString2=(parsedData[4]/100).toFixed(2);
                    Data.currentString3=(parsedData[6]/100).toFixed(2);
                    Data.currentString4=(parsedData[7]/100).toFixed(2);
                    Data.currentString5=(parsedData[8]/100).toFixed(2);
                    Data.currentString6=(parsedData[9]/100).toFixed(2);
                    Data.currentString7=(parsedData[10]/100).toFixed(2);
                    Data.currentString8=(parsedData[11]/100).toFixed(2);
                    Data.currentString9=(parsedData[12]/100).toFixed(2);
                    Data.currentString10=(parsedData[13]/100).toFixed(2);
                    Data.currentString11=(parsedData[14]/100).toFixed(2);
                    Data.currentString12=(parsedData[15]/100).toFixed(2);
                    Data.currentString13=(parsedData[16]/100).toFixed(2);
                    Data.currentString14=(parsedData[17]/100).toFixed(2);
                    Data.currentString15=(parsedData[18]/100).toFixed(2);
                    Data.currentString16=(parsedData[19]/100).toFixed(2);
                    Data.currentString17=(parsedData[20]/100).toFixed(2);
                    Data.currentString18=(parsedData[21]/100).toFixed(2);
                    Data.currentString19=(parsedData[22]/100).toFixed(2);
                    Data.currentString20=(parsedData[23]/100).toFixed(2);
                    Data.inputCurrent=add(Data.currentString1,Data.currentString2,Data.currentString3,Data.currentString4,Data.currentString5,Data.currentString6,
                                            Data.currentString7,Data.currentString8,Data.currentString9,Data.currentString10,Data.currentString11,Data.currentString12,
                                            Data.currentString13,Data.currentString14,Data.currentString15,Data.currentString16,Data.currentString17,Data.currentString18,
                                            Data.currentString19,Data.currentString20);
                    Data.inputPower=(parsedData[34]/1000).toFixed(2);
                    Data.efficiency=(parsedData[29]/100).toFixed(2);
                    Data.dailyEnergy=(parsedData[41]/100).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[40]/100);
                    Data.warning=addString(parsedData[42],parsedData[43]);
                    Data.error=addString(parsedData[31],parsedData[32],parsedData[33]); //Parsed as fault change later

                }
                else{
                    return "Conflict";
                }

            break;

            case 25:      // powerOne 80kW
                
                parametersCount=34;
            
                if(dataLength==40)      //16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<28)
                        {
                            if(i==1){
                                parsedData[i]=signed16by16Bit(data[m]);
                            }
                            else{
                                parsedData[i]=data[m]; 
                            }
                            m++;
                        }
                        else if(i>=28 && i<40)
                        {
                            if(i==28){
                                parsedData[i]=signed32by16Bit(data[m+1],data[m]);
                            }
                            else{
                                parsedData[i]=unsigned32Bit_16Bit(data[m],data[m+1]);   
                            }
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==1)
                    parsedData[0]='Running';
                    else if(parsedData[0]==2)
                    parsedData[0]='Running';
                    else if(parsedData[0]==3)
                    parsedData[0]='Failure';
                    else if(parsedData[0]==4)
                    parsedData[0]='Alarm';
                    else
                    parsedData[0]=undefined;
                    
                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[16]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='DC Inversed Failure, ';
                    if(fault1[1]==1)
                        parseFault1+='DC Insulation Failure, ';
                    if(fault1[2]==1)
                        parseFault1+='GFDI Failure, ';
                    if(fault1[3]==1)
                        parseFault1+='GFDI Ground Failure, ';
                    if(fault1[4]==1)
                        parseFault1+='EEPROM Read Failure, ';
                    if(fault1[5]==1)
                        parseFault1+='EEPROM Write Failure, ';
                    if(fault1[6]==1)
                        parseFault1+='GFDI Fuse Failure, ';
                    if(fault1[7]==1)
                        parseFault1+='GFDI Relay Faliure, ';
                    if(fault1[8]==1)
                        parseFault1+='IGBT Failure, ';
                    if(fault1[9]==1)
                        parseFault1+='Aux power Board Failure, ';
                    if(fault1[10]==1)
                        parseFault1+='AC Main Contactor Failure, ';
                    if(fault1[11]==1)
                        parseFault1+='AC Slave Contactor Failure, ';
                    if(fault1[12]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[13]==1)
                        parseFault1+='DC Over Current Failure, ';
                    if(fault1[14]==1)
                        parseFault1+='AC Over Current Failure, ';
                    if(fault1[15]==1)
                        parseFault1+='GFCI Failure, ';

                    parsedData[16] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[17]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='Phase Current & Overcurrent, ';
                    if(fault2[1]==1)
                        parseFault2+='Hardware AC Overcurrent, ';
                    if(fault2[2]==1)
                        parseFault2+='Integrated Fault, ';
                    if(fault2[3]==1)
                        parseFault2+='DC Hardware Overcurrent, ';
                    if(fault2[4]==1)
                        parseFault2+='DC Leakage Current Overcurrent, ';
                    if(fault2[5]==1)
                        parseFault2+='Emergency Stop, ';
                    if(fault2[6]==1)
                        parseFault2+='GFCI Overcurrent, ';
                    if(fault2[7]==1)
                        parseFault2+='DC Insulation, ';
                    if(fault2[8]==1)
                        parseFault2+='DC Feedback, ';
                    if(fault2[9]==1)
                        parseFault2+='DC Bus Unbalanced, ';
                    if(fault2[10]==1)
                        parseFault2+='DC Insulation, ';
                    if(fault2[11]==1)
                        parseFault2+='DCI Over M1 Fault, ';
                    if(fault2[12]==1)
                        parseFault2+='AC Air Switch, ';
                    if(fault2[13]==1)
                        parseFault2+='AC Main Contactor, ';
                    if(fault2[14]==1)
                        parseFault2+='AC Slave Contactor, ';
                    if(fault2[15]==1)
                        parseFault2+='DCI Over M2 Fault, ';

                    parsedData[17] = parseFault2;

                    let fault3=dectobin16Bit(parsedData[18]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='AC Over Current, ';
                    if(fault3[1]==1)
                        parseFault3+='AC Overload, ';
                    if(fault3[2]==1)
                        parseFault3+='AC No Utility, ';
                    if(fault3[3]==1)
                        parseFault3+='AC Grid Phase Sequence, ';
                    if(fault3[4]==1)
                        parseFault3+='AC Voltage Unbalance, ';
                    if(fault3[5]==1)
                        parseFault3+='AC Current Unbalance, ';
                    if(fault3[6]==1)
                        parseFault3+='INT AC Overcurrent, ';
                    if(fault3[7]==1)
                        parseFault3+='INT DC Overcurrent, ';
                    if(fault3[8]==1)
                        parseFault3+='AC Line WU Overvoltage, ';
                    if(fault3[9]==1)
                        parseFault3+='AC Line WU Undervoltage, ';
                    if(fault3[10]==1)
                        parseFault3+='AC Line VW Overvoltage, ';
                    if(fault3[11]==1)
                        parseFault3+='AC Line VW Undervoltage, ';
                    if(fault3[12]==1)
                        parseFault3+='AC Line UV Overvoltage, ';
                    if(fault3[13]==1)
                        parseFault3+='AC Line UV Undervoltage, ';
                    if(fault3[14]==1)
                        parseFault3+='AC Over Frequency, ';
                    if(fault3[15]==1)
                        parseFault3+='AC Under Frequency, ';

                    parsedData[18] = parseFault3;

                    let fault4=dectobin16Bit(parsedData[19]);
                    let parseFault4="";

                    if(fault4[0]==1)
                        parseFault4='AC U Grid Current DC High, ';
                    if(fault4[1]==1)
                        parseFault4+='AC V Grid Current DC High, ';
                    if(fault4[2]==1)
                        parseFault4+='AC W Grid Current DC High, ';
                    if(fault4[3]==1)
                        parseFault4+='AC A Induct Current DC High, ';
                    if(fault4[4]==1)
                        parseFault4+='AC B Induct Current DC High, ';
                    if(fault4[5]==1)
                        parseFault4+='AC C Induct Current DC High, ';
                    if(fault4[6]==1)
                        parseFault4+='DC High Voltage, ';
                    if(fault4[7]==1)
                        parseFault4+='DC Low Voltage, ';
                    if(fault4[8]==1)
                        parseFault4+='AC Backfeed, ';
                    if(fault4[9]==1)
                        parseFault4+='AC U Grid Current High, ';
                    if(fault4[10]==1)
                        parseFault4+='AC V Grid Current High, ';
                    if(fault4[11]==1)
                        parseFault4+='AC W Grid Current High, ';
                    if(fault4[12]==1)
                        parseFault4+='AC A Induct Current High, ';
                    if(fault4[13]==1)
                        parseFault4+='AC B Induct Current High, ';
                    if(fault4[14]==1)
                        parseFault4+='AC C Induct Current High, ';
                    if(fault4[15]==1)
                        parseFault4+='Heatsink Low Temperature, ';

                    parsedData[19] = parseFault4;

                    //Warning conversion
                    let warning1=dectobin16Bit(parsedData[14]);
                    let parseWarning1="";

                    if(warning1[0]==1)
                        parseWarning1='DC Insulation, ';
                    if(warning1[1]==1)
                        parseWarning1+='LCD Loose, ';
                    if(warning1[2]==1)
                        parseWarning1+='LVRT Fault Warning, ';
                    if(warning1[3]==1)
                        parseWarning1+='Fan Fault Warning, ';
                    if(warning1[4]==1)
                        parseWarning1+='DC Air Switch Open, ';
                    if(warning1[5]==1)
                        parseWarning1+='Fault Feedback Warning, ';
                    if(warning1[6]==1)
                        parseWarning1+='AC Voltage Unbalance, ';
                    if(warning1[7]==1)
                        parseWarning1+='AC PLL Warning, ';
                    if(warning1[8]==1)
                        parseWarning1+='DC Thunder, ';
                    if(warning1[9]==1)
                        parseWarning1+='AC Thunder, ';
                    if(warning1[10]==1)
                        parseWarning1+='Smoke Detect, ';
                    if(warning1[11]==1)
                        parseWarning1+='power Derating, ';
                    if(warning1[12]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[13]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[14]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[15]==1)
                        parseWarning1+='Reserved, ';

                    parsedData[14] = parseWarning1;
                    
                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=((parsedData[11]-1000)*0.1).toFixed(2);
                    if(Data.temperature<-20)
                        Data.temperature=0;
                    Data.voltagePhaseR=(parsedData[4]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[5]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[6]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[7]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[8]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[9]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[32]/10000).toFixed(2);
                    Data.reactivePower=(parsedData[33]/10000).toFixed(2);
                    Data.apparentpower=(parsedData[31]/10000).toFixed(2);
                    Data.frequency=(parsedData[10]*0.01).toFixed(2);
                    Data.voltageMPPT1=(parsedData[20]*0.1).toFixed(2);
                    Data.voltageMPPT2=(parsedData[22]*0.1).toFixed(2);
                    Data.voltageMPPT3=(parsedData[24]*0.1).toFixed(2);
                    Data.voltageMPPT4=(parsedData[26]*0.1).toFixed(2);
                    Data.currentMPPT1=(parsedData[21]*0.1).toFixed(2);
                    Data.currentMPPT2=(parsedData[23]*0.1).toFixed(2);
                    Data.currentMPPT3=(parsedData[25]*0.1).toFixed(2);
                    Data.currentMPPT4=(parsedData[27]*0.1).toFixed(2);
                    Data.powerMPPT1=((Data.voltageMPPT1*Data.currentMPPT1)/1000).toFixed(2);
                    Data.powerMPPT2=((Data.voltageMPPT2*Data.currentMPPT2)/1000).toFixed(2);
                    Data.powerMPPT3=((Data.voltageMPPT3*Data.currentMPPT3)/1000).toFixed(2);
                    Data.powerMPPT4=((Data.voltageMPPT4*Data.currentMPPT4)/1000).toFixed(2);
                    Data.inputCurrent=add(Data.currentMPPT1, Data.currentMPPT2, Data.currentMPPT3, Data.currentMPPT4);
                    //Data.inputPower=add(Data.powerMPPT1, Data.powerMPPT2, Data.powerMPPT3, Data.powerMPPT4);
                    Data.inputPower = (parsedData[30]/10000).toFixed(2);
                    Data.efficiency=(parsedData[3]*0.1).toFixed(2);
                    Data.dailyEnergy=(parsedData[1]*0.1).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[28]*0.1);
                    Data.dailyRuntime=parseInt(parsedData[2]/60);
                    Data.totalRuntime=parseInt(parsedData[29]*0.1);
                    Data.warning=addString(parsedData[14]);
                    Data.fault=addString(parsedData[16],parsedData[17],parsedData[18],parsedData[19]);
                    
                    if(parsedData[13]>1000)
                        Data.powerFactor=((1000-parsedData[13])*0.001).toFixed(3);	
					else
                        Data.powerFactor=((parsedData[13])*0.001).toFixed(3);
                }
                else{
                    return "Conflict";
                }

            break;

            default:
                 return "Conflict";
            break; 
        }

        switch(Data.plantId){
            
            case 105:

                if(Data.deviceNo == 7)
                {
                    Data.dailyEnergy = parseFloat((Data.dailyEnergy/100).toFixed(2));
                    Data.totalEnergy= parseFloat((Data.totalEnergy/10).toFixed(2));
                }
                if(Data.deviceNo == 14)
                {
                    Data.dailyEnergy = parseFloat((Data.dailyEnergy/100).toFixed(2));
                    Data.totalEnergy= parseFloat((Data.totalEnergy/10).toFixed(2));
                }
                if(Data.deviceNo == 20)
                {
                    Data.dailyEnergy = parseFloat((Data.dailyEnergy/10).toFixed(2));
                }

            break;

            case 106:

                if(Data.deviceNo == 2)
                {
                    Data.dailyEnergy = parseFloat((Data.dailyEnergy/10).toFixed(2))
                }
                if(Data.deviceNo == 34)
                {
                    Data.dailyEnergy = parseFloat((Data.dailyEnergy/10).toFixed(2));
                }

            break;

            default:

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

exports.syncStringInverter = async(data)=>{

    //Initialize mongoose object for Database
    const Data = new StringInverter({
        timestamp:data.timestamp,
        loggerNo:data.loggerNo,
        plantId:data.plantId,
        deviceType:data.deviceType,
        deviceNo:data.deviceNo,
        errorFlag:data.errorFlag,
    });

    if(Data.errorFlag==0){
        
        Data.status=(data.status);
        Data.temperature=(data.temperature);
        Data.efficiency=(data.efficiency);
        Data.voltagePhaseR=(data.voltagePhaseR);
        Data.voltagePhaseY=(data.voltagePhaseY);
        Data.voltagePhaseB=(data.voltagePhaseB);
        Data.outputVoltage=(data.outputVoltage);
        Data.currentPhaseR=(data.currentPhaseR);
        Data.currentPhaseY=(data.currentPhaseY);
        Data.currentPhaseB=(data.currentPhaseB);
        Data.outputCurrent=(data.outputCurrent);
        Data.powerPhaseR=(data.powerPhaseR);
        Data.powerPhaseY=(data.powerPhaseY);
        Data.powerPhaseB=(data.powerPhaseB);
        Data.activePower=(data.activePower);
        Data.reactivePower=(data.reactivePower);
        Data.apparentpower=(data.apparentpower);
        Data.powerFactor=(data.powerFactor);
        Data.frequency=(data.frequency);
        Data.voltageMPPT1=(data.voltageMPPT1);
        Data.voltageMPPT2=(data.voltageMPPT2);
        Data.voltageMPPT3=(data.voltageMPPT3);
        Data.voltageMPPT4=(data.voltageMPPT4);
        Data.voltageMPPT5=(data.voltageMPPT5);
        Data.voltageMPPT6=(data.voltageMPPT6);
        Data.voltageMPPT7=(data.voltageMPPT7);
        Data.voltageMPPT8=(data.voltageMPPT8);
        Data.voltageMPPT9=(data.voltageMPPT9);
        Data.voltageMPPT10=(data.voltageMPPT10);
        Data.voltageMPPT11=(data.voltageMPPT11);
        Data.voltageMPPT12=(data.voltageMPPT12);
        Data.voltageMPPT13=(data.voltageMPPT13);
        Data.voltageMPPT14=(data.voltageMPPT14);
        Data.voltageMPPT15=(data.voltageMPPT15);
        Data.currentMPPT1=(data.currentMPPT1);
        Data.currentMPPT2=(data.currentMPPT2);
        Data.currentMPPT3=(data.currentMPPT3);
        Data.currentMPPT4=(data.currentMPPT4);
        Data.currentMPPT5=(data.currentMPPT5);
        Data.currentMPPT6=(data.currentMPPT6);
        Data.currentMPPT7=(data.currentMPPT7);
        Data.currentMPPT8=(data.currentMPPT8);
        Data.currentMPPT9=(data.currentMPPT9);
        Data.currentMPPT10=(data.currentMPPT10);
        Data.currentMPPT11=(data.currentMPPT11);
        Data.currentMPPT12=(data.currentMPPT12);
        Data.currentMPPT13=(data.currentMPPT13);
        Data.currentMPPT14=(data.currentMPPT14);
        Data.currentMPPT15=(data.currentMPPT15);
        Data.powerMPPT1=(data.powerMPPT1);
        Data.powerMPPT2=(data.powerMPPT2);
        Data.powerMPPT3=(data.powerMPPT3);
        Data.powerMPPT4=(data.powerMPPT4);
        Data.powerMPPT5=(data.powerMPPT5);
        Data.powerMPPT6=(data.powerMPPT6);
        Data.powerMPPT7=(data.powerMPPT7);
        Data.powerMPPT8=(data.powerMPPT8);
        Data.powerMPPT9=(data.powerMPPT9);
        Data.powerMPPT10=(data.powerMPPT10);
        Data.powerMPPT11=(data.powerMPPT11);
        Data.powerMPPT12=(data.powerMPPT12);
        Data.powerMPPT13=(data.powerMPPT13);
        Data.powerMPPT14=(data.powerMPPT14);
        Data.powerMPPT15=(data.powerMPPT15);
        Data.currentString1=(data.currentString1);
        Data.currentString2=(data.currentString2);
        Data.currentString3=(data.currentString3);
        Data.currentString4=(data.currentString4);
        Data.currentString5=(data.currentString5);
        Data.currentString6=(data.currentString6);
        Data.currentString7=(data.currentString7);
        Data.currentString8=(data.currentString8);
        Data.currentString9=(data.currentString9);
        Data.currentString10=(data.currentString10);
        Data.currentString11=(data.currentString11);
        Data.currentString12=(data.currentString12);
        Data.currentString13=(data.currentString13);
        Data.currentString14=(data.currentString14);
        Data.currentString15=(data.currentString15);
        Data.currentString16=(data.currentString16);
        Data.currentString17=(data.currentString17);
        Data.currentString18=(data.currentString18);
        Data.currentString19=(data.currentString19);
        Data.currentString20=(data.currentString20);
        Data.currentString21=(data.currentString21);
        Data.currentString22=(data.currentString22);
        Data.currentString23=(data.currentString23);
        Data.currentString24=(data.currentString24);
        Data.currentString25=(data.currentString25);
        Data.currentString26=(data.currentString26);
        Data.currentString27=(data.currentString27);
        Data.currentString28=(data.currentString28);
        Data.currentString29=(data.currentString29);
        Data.currentString30=(data.currentString30);
        Data.inputVoltage=(data.inputVoltage);
        Data.inputCurrent=(data.inputCurrent);
        Data.inputPower=(data.inputPower);
        Data.dailyEnergy=(data.dailyEnergy);
        Data.totalEnergy=(data.totalEnergy);
        Data.dailyRuntime=(data.dailyRuntime);
        Data.totalRuntime=(data.totalRuntime);
        //Data.deratingPercent=(data.deratingPercent);
        Data.error=(data.error);
        Data.warning=(data.warning);
        Data.fault=(data.fault);

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