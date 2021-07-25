const {CentralizedInverter} = require('../models/centralizedinverter');

//Various functions For Data Parseing
const unsigned8_16Bit=(...args)=>{
    return args[0]<<8|args[1];
};

const unsigned8_32Bit=(...args)=>{
    return (args[2]<<8|args[3])<<16|(args[0]<<8|args[1]);
};

const unsigned32Bit=(...args)=>{
    return args[0]<<16|args[1];
};

const reverseUnsigned32Bit=(...args)=>{
    return args[1]<<16|args[0];
};

const signed16Bit=(...args)=>{
    let bin16bit;
    let joinArray;
    let bin=[];
    let reverseArray=[];
   
    for(i in args){
    bin[i] = (args[i] >>> 0).toString(2);
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
    dectobin = (args[0] >>> 0).toString(2);
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

//Centralized inverter service
exports.centralizedInverter = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new CentralizedInverter({
        timestamp:args[5],
        loggerNo:args[0],
        plantId:args[1],
        deviceType:args[2],
        deviceNo:args[3],
        errorFlag:args[4]
    });
  
    //Date Calculation For Previous Data
    let d = new Date(Data.timestamp);
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(00);
    d.setMilliseconds(01);
    const GMTDate = new Date(d).toUTCString();

    //Master flag setup
    if(Data.deviceNo>100){
        Data.masterFlag=1;
    }
    else{
        Data.masterFlag=0;
    }

    if(Data.errorFlag==0){
        
        const dataLength = data.length;
        const parsedData = [];
        let parametersCount;
 
        switch(Data.deviceType){

            case 51:          //Hitachi 16 bit

                parametersCount=21;

                if(dataLength==27)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<15){
                            parsedData[i]=signed16Bit(data[m]);
                            m+=1;
                        }
                        else if(i>=15 && i<21){
                            parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion
                    if(parsedData[0]==0)
                    parsedData[0]='PCS Waking UP';
                    else if(parsedData[0]==1)
                    parsedData[0]='Checking for The Control Supply healthy';
                    else if(parsedData[0]==10)
                    parsedData[0]='Waiting for 52M';
                    else if(parsedData[0]==20)
                    parsedData[0]='52M ON. Waiting for Start Command from User';
                    else if(parsedData[0]==30)
                    parsedData[0]='Waiting for Diode Pre-charge to complete';
                    else if(parsedData[0]==40)
                    parsedData[0]='Diode Pre-charge OK. Waiting for 42 to ON.';
                    else if(parsedData[0]==50)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==60)
                    parsedData[0]='Pre-charging Inverter';
                    else if(parsedData[0]==70)
                    parsedData[0]='Waiting for 72 to ON';
                    else if(parsedData[0]==80)
                    parsedData[0]='Waiting for Active Power to feed in Grid.';
                    else if(parsedData[0]==100)
                    parsedData[0]='Power is >1% of Rated Power';
                    else if(parsedData[0]==110)
                    parsedData[0]='Power is >20% of Rated Power achieved one time after Power On';
                    else if(parsedData[0]==120)
                    parsedData[0]='AC/DC Over Current Detected';
                    else if(parsedData[0]==130)
                    parsedData[0]='Over Current Restarting Operation time(1min)';
                    else if(parsedData[0]==145)
                    parsedData[0]='Restart Operation due to Low Power Feeding in Grid during 70/80 Operation status(42 remain ON)';
                    else if(parsedData[0]==155)
                    parsedData[0]='Waiting for 42OFF due to Low Power Feeding during 70/80 Operation status';
                    else if(parsedData[0]==160)
                    parsedData[0]='Delay time for re-staring inverter';
                    else if(parsedData[0]==165)
                    parsedData[0]='Waiting for DC Voltage to build up due to irradiation for Power Generation';
                    else if(parsedData[0]==170)
                    parsedData[0]='Stop Command To inverter/waiting for 72 to OFF';
                    else if(parsedData[0]==180)
                    parsedData[0]='Waiting for 42OFF after stop Command';
                    else if(parsedData[0]==190)
                    parsedData[0]='Waiting for discharging of DC Voltage upto 10V due to stop command';
                    else if(parsedData[0]==200)
                    parsedData[0]='Heavy Fail Detected and Waiting for 72 to OFF';
                    else if(parsedData[0]==210)
                    parsedData[0]='Heavy Fail Detected and Waiting for 42 to OFF after 72 to OFF';
                    else if(parsedData[0]==230)
                    parsedData[0]='Panel Stop in Heavy Fail* Fault';
                    else if(parsedData[0]==260)
                    parsedData[0]='System Abnormality** detected';
                    else if(parsedData[0]==270)
                    parsedData[0]='Waiting for 72 to OFF due to System Abnormality**';
                    else if(parsedData[0]==280)
                    parsedData[0]='Waiting for 42 to OFF after 72OFF due to System Abnormality**';
                    else if(parsedData[0]==290)
                    parsedData[0]='Waiting For system to become normal';
                    else if(parsedData[0]==290)
                    parsedData[0]='System is Normal. Delay time of 1min for inverter to restart';
                    else
                    parsedData[0]=undefined;

                    //Fault coversion
                    let fault1=dectobin32Bit(parsedData[17]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='AC Over Voltage, ';
                    if(fault1[1]==1)
                        parseFault1+='AC Under Voltage, ';
                    if(fault1[2]==1)
                        parseFault1+='Frequency High, ';
                    if(fault1[3]==1)
                        parseFault1+='Frequency Low, ';
                    if(fault1[4]==1)
                        parseFault1+='External System Abnormal, ';
                    if(fault1[5]==1)
                        parseFault1+='AC Over Current, ';
                    if(fault1[6]==1)
                        parseFault1+='DC Over Voltage Recovered, ';
                    if(fault1[7]==1)
                        parseFault1+='DC Low Voltage, ';
                    if(fault1[8]==1)
                        parseFault1+='DC Over Current, ';
                    if(fault1[9]==1)
                        parseFault1+='AC CT Feedback Fail, ';
                    if(fault1[10]==1)
                        parseFault1+='System to Trip, ';
                    if(fault1[11]==1)
                        parseFault1+='NEG Ground Fuse Fail, ';
                    if(fault1[12]==1)
                        parseFault1+='Inverter OL1, ';
                    if(fault1[13]==1)
                        parseFault1+='Inverter OL2, ';
                    if(fault1[14]==1)
                        parseFault1+='Inverter OL3, ';
                    if(fault1[15]==1)
                        parseFault1+='Inverter OL4, ';
                    if(fault1[16]==1)
                        parseFault1+='DC Earth Fault, ';
                    if(fault1[17]==1)
                        parseFault1+='DC Output Detection, ';
                    if(fault1[18]==1)
                        parseFault1+='Feedback Abnormal, ';
                    if(fault1[19]==1)
                        parseFault1+='AC CB ON Failure, ';
                    if(fault1[20]==1)
                        parseFault1+='AC CB ON Failure, ';
                    if(fault1[21]==1)
                        parseFault1+='DC Unbalance, ';
                    if(fault1[22]==1)
                        parseFault1+='IGBT SAT Trip, ';
                    if(fault1[23]==1)
                        parseFault1+='12V Supply Fail In HRD-468, ';
                    if(fault1[24]==1)
                        parseFault1+='24V Supply Fail, ';
                    if(fault1[25]==1)
                        parseFault1+='CPU Error, ';
                    if(fault1[26]==1)
                        parseFault1+='100V Supply fail, ';
                    if(fault1[27]==1)
                        parseFault1+='IGBT Heat Sink Over Temperature, ';
                    if(fault1[28]==1)
                        parseFault1+='Gate Drive Power Supply Fail, ';
                    if(fault1[29]==1)
                        parseFault1+='Relay Io card Comm Fail, ';
                    if(fault1[30]==1)
                        parseFault1+='Keypad Card Comm Fail, ';
                    if(fault1[31]==1)
                        parseFault1+='Precharge Fail, ';

                    parsedData[17] = parseFault1;

                    let fault2=dectobin32Bit(parsedData[18]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='6C Off Failure, ';
                    if(fault2[1]==1)
                        parseFault2+='AC CB Off Fail, ';
                    if(fault2[2]==1)
                        parseFault2+='DC CB Off Fail, ';
                    if(fault2[3]==1)
                        parseFault2+='Surge Suppressor Fail, ';
                    if(fault2[4]==1)
                        parseFault2+='Wrong Opration, ';
                    if(fault2[5]==1)
                        parseFault2+='Ambiant Temperature Fail, ';
                    if(fault2[6]==1)
                        parseFault2+='Auxilary Input1 Fail, ';
                    if(fault2[7]==1)
                        parseFault2+='Isolation Detection, ';
                    if(fault2[8]==1)
                        parseFault2+='DC Input Connection In Reverse Polarity, ';
                    if(fault2[9]==1)
                        parseFault2+='Auxilary input2 Fail, ';
                    if(fault2[10]==1)
                        parseFault2+='Auxilary input3 Fail, ';
                    if(fault2[11]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[12]==1)
                        parseFault2+='Auxilary input Heavy Fail, ';
                    if(fault2[13]==1)
                        parseFault2+='Neg Power Shutdown, ';
                    if(fault2[14]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[15]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[16]==1)
                        parseFault2='Reserved, ';
                    if(fault2[17]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[18]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[19]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[20]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[21]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[22]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[23]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[24]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[25]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[26]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[27]==1)
                        parseFault2+='Auxilary Input4 fail, ';
                    if(fault2[28]==1)
                        parseFault2+='Auxilary Input5 fail, ';
                    // if(fault2[29]==1)
                    //     parseFault2+='Auxilary Input5 Recover, ';
                    // if(fault2[30]==1)
                    //     parseFault2+='Auxilary Input5 Recover, ';
                    if(fault2[31]==1)
                        parseFault2+='Auxilary Input6 fail, ';

                    parsedData[18] = parseFault2;

                    let fault3=dectobin32Bit(parsedData[19]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='Auxilary Input7 fail, ';
                    // if(fault3[1]==1)
                    //     parseFault3+='Auxilary Input6 Recover, ';
                    // if(fault3[2]==1)
                    //     parseFault3+='Auxilary Input7 Recover, ';
                    if(fault3[3]==1)
                        parseFault3+='Emergancy Stop, ';
                    if(fault3[4]==1)
                        parseFault3+='Inverter Fuse Fail, ';
                    if(fault3[5]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[6]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[7]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[8]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[9]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[10]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[11]==1)
                        parseFault3+='Reserved ';
                    if(fault3[12]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[13]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[14]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[15]==1)
                        parseFault3+='Reserved, ';
                    if(fault3[16]==1)
                        parseFault3+='Fan Contactor Fail, ';

                    parsedData[19] = parseFault3;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[14]*1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[4]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[5]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[6]*1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[7]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[8]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[9]*1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[10]*1).toFixed(2);
                    Data.reactivePower=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[12]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[13]*0.01).toFixed(2);
                    Data.inputVoltage=(parsedData[1]*1).toFixed(2);
                    Data.inputCurrent=(parsedData[2]*1).toFixed(2);
                    Data.inputPower=(parsedData[3]*1).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[15]*1).toFixed(2);
                    Data.totalEnergy=(parsedData[16]*10).toFixed(2);
                    Data.error=addString(parsedData[17],parsedData[18],parsedData[19]);

                }
                else{
                    return "Conflict";
                }

            break;

            case 52:          //ABB PVS 800 16 bit

                parametersCount=23;

                if(dataLength==23)
                {
                    for(let i=0,m=0; i<parametersCount;i++){  
                        parsedData[i]=signed16Bit(data[m]);
                        m+=1;
                    }

                    //Status Conversion
                    if(parsedData[14]==1)
                    parsedData[14]='StandBy';
                    else if(parsedData[14]==2)
                    parsedData[14]='Sleep';
                    else if(parsedData[14]==3)
                    parsedData[14]='Start ISU';
                    else if(parsedData[14]==4)
                    parsedData[14]='Running';
                    else if(parsedData[14]==5)
                    parsedData[14]='ISU Local';
                    else if(parsedData[14]==6)
                    parsedData[14]='Fault';
                    else
                    parsedData[14]='';

                    //Fault coversion
                    // let fault1=dectobin16Bit(parsedData[1]);
                    // let parseFault1="";

                    // if(fault1[0]==1)
                    //     parseFault1='AC Under Voltage, ';
                    // if(fault1[1]==1)
                    //     parseFault1+='AC Over Voltage, ';
                    // if(fault1[2]==1)
                    //     parseFault1+='Under Frequency, ';
                    // if(fault1[3]==1)
                    //     parseFault1+='Over Frequency, ';
                    // if(fault1[4]==1)
                    //     parseFault1+='Phase Sequence, ';
                    // if(fault1[5]==1)
                    //     parseFault1+='Earth Fault, ';
                    // if(fault1[6]==1)
                    //     parseFault1+='AC Breaker Open, ';
                    // if(fault1[7]==1)
                    //     parseFault1+='AC Fuse Fault, ';
                    // if(fault1[8]==1)
                    //     parseFault1+='DC Fuse Fault, ';
                    // if(fault1[9]==1)
                    //     parseFault1+='Reserved, ';
                    // if(fault1[10]==1)
                    //     parseFault1+='Reserved, ';
                    // if(fault1[11]==1)
                    //     parseFault1+='PV Short Fault, ';
                    // if(fault1[12]==1)
                    //     parseFault1+='PV Insulation Resistance Fault, ';
                    // if(fault1[13]==1)
                    //     parseFault1+='PV Insulation Resistance Alarm, ';
                    // if(fault1[14]==1)
                    //     parseFault1+='PV Over Voltage, ';
                    // if(fault1[15]==1)
                    //     parseFault1+='PV Opposite, ';
                   
                    // parsedData[1] = parseFault1;

                    //Alarm Conversion
                    let alarm1=dectobin16Bit(parsedData[16]);
                    let parseAlarm1="";
                
                    if(alarm1[0]==1)
                        parseAlarm1='Alarm, ';

                    parsedData[16] = parseAlarm1;

                    //Add data to mongoose object for Database
                    Data.status=addString(parsedData[14],parsedData[16]);
                    Data.temperature=(parsedData[13]*1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[5]*1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[6]*0.1).toFixed(2);
                    Data.reactivePower=(parsedData[9]*0.1).toFixed(2);
                    //Data.apparantPower=(parsedData[16]*100).toFixed(2);
                    Data.frequency=(parsedData[7]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[8]*0.01).toFixed(2);
                    Data.inputVoltage=(parsedData[10]*1).toFixed(2);
                    Data.inputCurrent=(parsedData[11]*1).toFixed(2);
                    Data.inputPower=(parsedData[12]*1).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.totalEnergy=(parsedData[22]*1000000)+(parsedData[21]*1000)+(parsedData[20]*1);
                    //Data.dailyRuntime=parseInt(parsedData[20]/60);
                    Data.totalRuntime=parseInt(parsedData[18]);
                    //Data.fault=addString(parsedData[1],parsedData[2]);

                    const lastestRecord = await CentralizedInverter.aggregate([
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

            case 53:          //Tbea 16 bit

                parametersCount=24;

                if(dataLength==27)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<21){
                            if(i==0 || i==1 || i==2 || i==3 || i==4)
                            parsedData[i]=(data[m]);
                            else
                            parsedData[i]=signed16Bit(data[m]);
                            m+=1;
                        }
                        else if(i>=21 && i<24){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion "Only 5 bits are used for status rest removed"

                    let dec2bin=((parsedData[0] >>> 0).toString(2));
                    dec2bin = dec2bin.split("");
                    dec2bin.splice(0,11);
                    dec2bin = dectobin.join("");
                    parsedData[0] = parseInt(dec2bin, 2);

                    if(parsedData[0]==0)
                    parsedData[0]='Stop';
                    else if(parsedData[0]==1)
                    parsedData[0]='Check-self';
                    else if(parsedData[0]==2)
                    parsedData[0]='Standby';
                    else if(parsedData[0]==3)
                    parsedData[0]='Running';
                    else if(parsedData[0]==4)
                    parsedData[0]='Startup';
                    else if(parsedData[0]==5)
                    parsedData[0]='Shutdown';
                    else if(parsedData[0]==6)
                    parsedData[0]='Fault';
                    else if(parsedData[0]==7)
                    parsedData[0]='Dispatch';
                    else if(parsedData[0]==8)
                    parsedData[0]='Derating';
                    else if(parsedData[0]==9)
                    parsedData[0]='Independent INV';
                    else if(parsedData[0]==10)
                    parsedData[0]='MPPT.';
                    else if(parsedData[0]==11)
                    parsedData[0]='Contant Power';
                    else if(parsedData[0]==12)
                    parsedData[0]='Constant Voltage';
                    else if(parsedData[0]==13)
                    parsedData[0]='Constant Current';
                    else if(parsedData[0]==14)
                    parsedData[0]='SVG';
                    else if(parsedData[0]==15)
                    parsedData[0]='Voltage Source';
                    else
                    parsedData[0]=undefined;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[1]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='AC Under Voltage, ';
                    if(fault1[1]==1)
                        parseFault1+='AC Over Voltage, ';
                    if(fault1[2]==1)
                        parseFault1+='Under Frequency, ';
                    if(fault1[3]==1)
                        parseFault1+='Over Frequency, ';
                    if(fault1[4]==1)
                        parseFault1+='Phase Sequence, ';
                    if(fault1[5]==1)
                        parseFault1+='Earth Fault, ';
                    if(fault1[6]==1)
                        parseFault1+='AC Breaker Open, ';
                    if(fault1[7]==1)
                        parseFault1+='AC Fuse Fault, ';
                    if(fault1[8]==1)
                        parseFault1+='DC Fuse Fault, ';
                    if(fault1[9]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[10]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[11]==1)
                        parseFault1+='PV Short Fault, ';
                    if(fault1[12]==1)
                        parseFault1+='PV Insulation Resistance Fault, ';
                    if(fault1[13]==1)
                        parseFault1+='PV Insulation Resistance Alarm, ';
                    if(fault1[14]==1)
                        parseFault1+='PV Over Voltage, ';
                    if(fault1[15]==1)
                        parseFault1+='PV Opposite, ';
                   
                    parsedData[1] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[2]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='Emergancy, ';
                    if(fault2[1]==1)
                        parseFault2+='Run Switch stoped, ';
                    if(fault2[2]==1)
                        parseFault2+='Access Control Opened, ';
                    if(fault2[3]==1)
                        parseFault2+='FRD Alarm, ';
                    if(fault2[4]==1)
                        parseFault2+='DC SPD Fault, ';
                    if(fault2[5]==1)
                        parseFault2+='AC SPD Fault, ';
                    if(fault2[6]==1)
                        parseFault2+='AC SPD Breaker, ';
                    if(fault2[7]==1)
                        parseFault2+='Smoke Alarm, ';
                    if(fault2[8]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[9]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[10]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[11]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[12]==1)
                        parseFault2+='Humidity Control Fault, ';
                    if(fault2[13]==1)
                        parseFault2+='Low Ambient Temperature, ';
                    if(fault2[14]==1)
                        parseFault2+='High Ambient Temperature, ';
                    if(fault2[15]==1)
                        parseFault2+='Reserved, ';

                    parsedData[2] = parseFault2;

                    // let breaker1=dectobin16Bit(parsedData[3]);
                    // let parseBreaker1="";

                    // if(breaker1[0]==1)
                    //     parseBreaker1=', ';
                    // if(breaker1[1]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[2]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[3]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[4]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[5]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[6]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[7]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[8]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[9]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[10]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[11]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[12]==1)
                    //     parseBreaker1+=, ';
                    // if(breaker1[13]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[14]==1)
                    //     parseBreaker1+=', ';
                    // if(breaker1[15]==1)
                    //     parseBreaker1+=', ';
        
                    //parsedData[3] = parseBreaker1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[0]);
                    Data.temperature=(parsedData[5]*0.1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[6]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[7]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[8]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[9]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[10]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[11]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[14]*100).toFixed(2);
                    Data.reactivePower=(parsedData[15]*100).toFixed(2);
                    Data.apparantPower=(parsedData[16]*100).toFixed(2);
                    Data.frequency=(parsedData[13]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[12]*0.001).toFixed(2);
                    Data.inputVoltage=(parsedData[17]*0.1).toFixed(2);
                    Data.inputCurrent=(parsedData[18]*0.1).toFixed(2);
                    Data.inputPower=(parsedData[19]*100).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[22]*0.1).toFixed(2);
                    Data.totalEnergy=(parsedData[21]*1).toFixed(2);
                    Data.dailyRuntime=parseInt(parsedData[20]/60);
                    Data.totalRuntime=parseInt(parsedData[23]);
                    Data.fault=addString(parsedData[1],parsedData[2]);

                }
                else{
                    return "Conflict";
                }

            break;

            case 55:          //ABB-57B-1732kW 16 bit

                parametersCount=21;

                if(dataLength==23)
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<19){
                            if(i==0 || i==1 || i==3 || i==11 || i==12 ||i==13 || i==14)
                            parsedData[i]=signed16Bit(data[m]);
                            else
                            parsedData[i]=(data[m]);
                            m+=1;
                        }
                        else if(i>=19 && i<21){
                            parsedData[i]=unsigned32Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status Conversion "bitwise status"
                    let status=dectobin16Bit(parsedData[15]);
                   
                    if(status[0]==1)
                    parsedData[15]='Ready to Switch ON';
                    else if(status[1]==1)
                    parsedData[15]='Faulted';
                    else if(status[2]==1)
                    parsedData[15]='Warning';
                    else if(status[3]==1)
                    parsedData[15]='Running';
                    else if(status[4]==1)
                    parsedData[15]='Grid Stable';
                    else if(status[5]==1)
                    parsedData[15]='DC Voltage within Running Limits';
                    else if(status[6]==1)
                    parsedData[15]='Start Inhibited';
                    else if(status[7]==1)
                    parsedData[15]='Reduced Run';
                    else if(status[8]==1)
                    parsedData[15]='Redaudent Run';
                    else if(status[9]==1)
                    parsedData[15]='Q-Compensataion';
                    else if(status[10]==1)
                    parsedData[15]='Limited';
                    else if(status[11]==1)
                    parsedData[15]='Running';
                    else if(status[12]==1)
                    parsedData[15]='Not Used';
                    else if(status[13]==1)
                    parsedData[15]='Not Used';
                    else if(status[14]==1)
                    parsedData[15]='Not Used';
                    else if(status[15]==1)
                    parsedData[15]='Not Used';
                    else
                    parsedData[15]=undefined;

                    //Fault coversion
                    let fault1=dectobin16Bit(parsedData[16]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Fast Power Off, ';
                    if(fault1[1]==1)
                        parseFault1+='Ambient Situation Fault, ';
                    if(fault1[2]==1)
                        parseFault1+='Grounding Current, ';
                    if(fault1[3]==1)
                        parseFault1+='Insulation Resistance, ';
                    if(fault1[4]==1)
                        parseFault1+='Grounding Circuit Voltage, ';
                    if(fault1[5]==1)
                        parseFault1+='Reverse Current, ';
                    if(fault1[6]==1)
                        parseFault1+='Over Current, ';
                    if(fault1[7]==1)
                        parseFault1+='PLC Link Fault, ';
                    if(fault1[8]==1)
                        parseFault1+='FAN Fault, ';
                    if(fault1[9]==1)
                        parseFault1+='AC Contactor, ';
                    if(fault1[10]==1)
                        parseFault1+='DC Contactor, ';
                    if(fault1[11]==1)
                        parseFault1+='DC Switch Fault, ';
                    if(fault1[12]==1)
                        parseFault1+='Main Current SPD Fault, ';
                    if(fault1[13]==1)
                        parseFault1+='DC Input Fuse Fault, ';
                    if(fault1[14]==1)
                        parseFault1+='Reserved, ';
                    if(fault1[15]==1)
                        parseFault1+='Internal SW Fault, ';
                   
                    parsedData[16] = parseFault1;

                    let fault2=dectobin16Bit(parsedData[17]);
                    let parseFault2="";
                
                    if(fault2[0]==1)
                        parseFault2='48V Buffer Fault, ';
                    if(fault2[1]==1)
                        parseFault2+='24V Buffer Fault, ';
                    if(fault2[2]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[3]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[4]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[5]==1)
                        parseFault2+='AC Breaker Fault, ';
                    if(fault2[6]==1)
                        parseFault2+='AC Over Current, ';
                    if(fault2[7]==1)
                        parseFault2+='Short Circuit, ';
                    if(fault2[8]==1)
                        parseFault2+='BU Current Difference Fault, ';
                    if(fault2[9]==1)
                        parseFault2+='Input Phase Loss, ';
                    if(fault2[10]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[11]==1)
                        parseFault2+='IGBT Over Temperature, ';
                    if(fault2[12]==1)
                        parseFault2+='Reserved, ';
                    if(fault2[13]==1)
                        parseFault2+='LCL Section Over Temperature, ';
                    if(fault2[14]==1)
                        parseFault2+='Power Unit Lost, ';
                    if(fault2[15]==1)
                        parseFault2+='Internal SW Fault, ';

                    parsedData[17] = parseFault2;

                    let warning1=dectobin16Bit(parsedData[18]);
                    let parseWarning1="";

                    if(warning1[0]==1)
                        parseWarning1='Grounding Current Sudden Change, ';
                    if(warning1[1]==1)
                        parseWarning1+='Residual Current, ';
                    if(warning1[2]==1)
                        parseWarning1+='Grounding Current Over Voltage, ';
                    if(warning1[3]==1)
                        parseWarning1+='Insulation Resistance, ';
                    if(warning1[4]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[5]==1)
                        parseWarning1+='SCADA Input Data Out of Range, ';
                    if(warning1[6]==1)
                        parseWarning1+='DC Link Over Voltage, ';
                    if(warning1[7]==1)
                        parseWarning1+='DC Input Over Voltage, ';
                    if(warning1[8]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[9]==1)
                        parseWarning1+='Surge Protection Device (SPD) Alarm, ';
                    if(warning1[10]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[11]==1)
                        parseWarning1+='48V Buffer Alarm, ';
                    if(warning1[12]==1)
                        parseWarning1+='24V Buffer Alarm, ';
                    if(warning1[13]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[14]==1)
                        parseWarning1+='Reserved, ';
                    if(warning1[15]==1)
                        parseWarning1+='Reserved, ';
        
                    parsedData[18] = parseWarning1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[15]);
                    Data.temperature=Math.max((parsedData[11]*0.1).toFixed(2),(parsedData[12]*0.1).toFixed(2),(parsedData[13]*0.1).toFixed(2),(parsedData[14]*0.1).toFixed(2));
                    Data.voltagePhaseR=(parsedData[5]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[6]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[7]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(parsedData[8]*0.1).toFixed(2);
                    Data.activePower=(parsedData[0]*1).toFixed(2);
                    if(Data.activePower<0)
                    Data.activePower=0;
                    Data.reactivePower=(parsedData[1]*1).toFixed(2);
                    Data.frequency=(parsedData[2]*0.01).toFixed(2);
                    Data.powerFactor=(parsedData[3]*0.001).toFixed(3);
                    Data.inputVoltage=(parsedData[9]*0.1).toFixed(2);
                    Data.inputCurrent=(parsedData[10]*0.1).toFixed(2);
                    if(Data.inputCurrent>0)
                    Data.inputPower=((Data.inputVoltage*Data.inputCurrent)/1000).toFixed(2);
                    else
                    Data.inputPower=0;
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.dailyEnergy=(parsedData[19]*0.001).toFixed(2);
                    Data.totalEnergy=parseInt(parsedData[20]*1);
                    Data.warning=addString(parsedData[18]);
                    Data.fault=addString(parsedData[16],parsedData[17]);

                }
                else{
                    return "Conflict";
                }

            break;

            case 56:          //TMEIC 500kW Series

            parametersCount=25;

                if(dataLength==35)  //16bit Parsing
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<15){
                            if(i==1)
                            parsedData[i]=(data[m]);
                            else
                            parsedData[i]=signed16Bit(data[m]);
                            m+=1;
                        }
                        else if(i>=15 && i<25){
                            if(i==24)
                            parsedData[i]=signed32Bit(data[m],data[m+1]);
                            else
                            parsedData[i]=unsigned32Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status coversion
                    let status=dectobin16Bit(parsedData[1]);
                    let parseStatus="";

                    if(status[0]==1)
                        parseStatus='Major Fault, ';
                    if(status[1]==1)
                        parseStatus+='Grid Fault, ';
                    if(status[2]==1)
                        parseStatus+='Alarm, ';
                    if(status[3]==1)
                        parseStatus+='Minor Fault, ';

                    if (parseStatus === "" && parsedData[12] !=0)
                       parseStatus = "Running";
                    else
                       parseStatus = "Trip";
                   
                    parsedData[1] = addString(parseStatus);
                    
                    //Fault coversion
                    let fault1=dectobin32Bit(parsedData[16]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Control circuit error (WDT), ';
                    if(fault1[1]==1)
                        parseFault1+='Control circuit error (CLK), ';
                    if(fault1[3]==1)
                        parseFault1+='Control power supply undervoltage, ';

                    parsedData[16] = parseFault1;

                    let fault2=dectobin32Bit(parsedData[17]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='DC overvoltage, ';
                    if(fault2[1]==1)
                        parseFault2+='DC circuit abnormal, ';
                    if(fault2[2]==1)
                        parseFault2+='Control power abnormal, ';
                    if(fault2[3]==1)
                        parseFault2+='Control circuit error (AD), ';
                    if(fault2[4]==1)
                        parseFault2+='IGBT gate fault phase U, ';
                    if(fault2[5]==1)
                        parseFault2+='IGBT gate fault phase V, ';
                    if(fault2[6]==1)
                        parseFault2+='IGBT gate fault phase W, ';
                    if(fault2[7]==1)
                        parseFault2+='Zero phase overcurrent, ';
                    if(fault2[9]==1)
                        parseFault2+='DC overcurrent 1, ';
                    if(fault2[10]==1)
                        parseFault2+='DC overcurrent 2, ';
                    if(fault2[11]==1)
                        parseFault2+='DC overcurrent 3, ';
                    if(fault2[12]==1)
                        parseFault2+='Inverter overcurrent 1, ';
                    if(fault2[13]==1)
                        parseFault2+='Zero phase OC, ';
                    if(fault2[15]==1)
                        parseFault2+='DC current balance abnormal, ';
                    if(fault2[16]==1)
                        parseFault2+='DC current backflow 1 (CSG1), ';

                    parsedData[17] = parseFault2;

                    let fault3=dectobin32Bit(parsedData[18]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='Emergency stop, ';
                    if(fault3[1]==1)
                        parseFault3+='External trip, ';
                    if(fault3[2]==1)
                        parseFault3+='Inverter abnormal, ';
                    if(fault3[3]==1)
                        parseFault3+='Repeated fault, ';
                    if(fault3[4]==1)
                        parseFault3+='Repeated fault, ';
                    if(fault3[5]==1)
                        parseFault3+='Cooling fan abnormal, ';
                    if(fault3[15]==1)
                        parseFault3+='Flash memory error, ';
                    if(fault3[16]==1)
                        parseFault3+='Control circuit error (FPGA), ';
                    if(fault3[17]==1)
                        parseFault3+='DC ground fault (HCT), ';

                    parsedData[18] = parseFault3;

                    let fault4=dectobin32Bit(parsedData[19]);
                    let parseFault4="";

                    if(fault4[1]==1)
                        parseFault4+='DC undervoltage, ';
                    if(fault4[2]==1)
                        parseFault4+='8A Open, ';
                    if(fault4[3]==1)
                        parseFault4+='Control power supply abnormal (AC-UV), ';
                    if(fault4[4]==1)
                        parseFault4+='Control power supply abnormal (AC-OV), ';
                    if(fault4[5]==1)
                        parseFault4+='DC unbalance 1, ';

                    parsedData[19] = parseFault4;

                    let fault5=dectobin32Bit(parsedData[20]);
                    let parseFault5="";

                    if(fault5[0]==1)
                        parseFault5='Inveter OC, ';
                    if(fault5[1]==1)
                        parseFault5+='Inverter overcurrent, ';
                    if(fault5[2]==1)
                        parseFault5+='Ctrl. Circuit error, ';
                    if(fault5[4]==1)
                        parseFault5+='AC volatge sensor error, ';
                    if(fault5[5]==1)
                        parseFault5+='52R ON failure, ';
                    if(fault5[6]==1)
                        parseFault5+='52R OFF failure, ';
                    if(fault5[7]==1)
                        parseFault5+='Over temperature, ';
                    if(fault5[8]==1)
                        parseFault5+='External minor fault, ';
                    if(fault5[15]==1)
                        parseFault5+='Communication command timeout, ';
                    if(fault5[16]==1)
                        parseFault5+='Grid overvoltage (OV), ';
                    if(fault5[17]==1)
                        parseFault5+='Short time AC overvoltage, ';
                    if(fault5[18]==1)
                        parseFault5+='Grid undervoltage (UV), ';
                    if(fault5[19]==1)
                        parseFault5+='Short time AC undervoltage, ';
                    if(fault5[20]==1)
                        parseFault5+='Overfrequency, ';
                    if(fault5[21]==1)
                        parseFault5+='Underfrequency, ';
                    if(fault5[22]==1)
                        parseFault5+='Phase rotation error, ';
                    if(fault5[23]==1)
                        parseFault5+='Open phase, ';
                    if(fault5[24]==1)
                        parseFault5+='Voltage phase jump, ';
                    if(fault5[25]==1)
                        parseFault5+='Synchronization loss, ';
                    if(fault5[28]==1)
                        parseFault5+='External grid fault, ';

                    parsedData[20] = parseFault5;

                    // Error Conversion
                    let error1=dectobin32Bit(parsedData[22]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1+='Operation prohibation, ';
                    if(error1[2]==1)
                        parseError1+='72B open, ';
                    if(error1[3]==1)
                        parseError1+='DC-C abnormal, ';
                    if(error1[4]==1)
                        parseError1+='External alarm, ';
                    if(error1[5]==1)
                        parseError1+='DC ground fault (HCT), ';
                    if(error1[6]==1)
                        parseError1+='DC ground fault (Voltage divider), ';
                    if(error1[7]==1)
                        parseError1+='SPD error, ';
                    if(error1[8]==1)
                        parseError1+='Grid voltage rise, ';
                    if(error1[9]==1)
                        parseError1+='52R not charged, ';
                    if(error1[10]==1)
                        parseError1+='Ambient OT., ';

                    parsedData[22] = parseError1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[1]);
                    Data.voltagePhaseR=(parsedData[6]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[7]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[8]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[9]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[10]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[11]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[2]*0.1).toFixed(2);
                    if(Data.activePower<0)
                    Data.activePower=0;
                    Data.reactivePower=(parsedData[3]*0.1).toFixed(2);
                    Data.frequency=(parsedData[5]*0.1).toFixed(2);
                    Data.powerFactor=(parsedData[4]*0.01).toFixed(3);
                    Data.inputVoltage=(parsedData[13]*0.1).toFixed(2);
                    Data.inputCurrent=(parsedData[14]*0.1).toFixed(2);
                    Data.inputPower=(parsedData[12]*0.1).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.totalEnergy=parseInt(parsedData[24]*0.1);
                    Data.error=addString(parsedData[22]);
                    Data.fault=addString(parsedData[16],parsedData[17],parsedData[18],parsedData[19],parsedData[20]);

                    const lastestRecord = await CentralizedInverter.aggregate([
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

            break;

            case 57:          //Delta V2.0

                if(dataLength==82)  // Delta 2.1 8-bit
                {
                    parametersCount=37;

                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<33){
                            parsedData[i]=unsigned8_16Bit(data[m],data[m+1]);
                            m+=2;
                        }
                        else if(i>=33 && i<37){
                            parsedData[i]=unsigned8_32Bit(data[m],data[m+1],data[m+2],data[m+3]);
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
                   Data.voltageUnit1=(parsedData[4]*0.1).toFixed(2);
                   Data.voltageUnit2=(parsedData[6]*0.1).toFixed(2);
                   Data.voltageUnit3=(parsedData[8]*0.1).toFixed(2);
                   Data.voltageUnit4=(parsedData[10]*0.1).toFixed(2);
                   Data.voltageUnit5=(parsedData[12]*0.1).toFixed(2);
                   Data.voltageUnit6=(parsedData[14]*0.1).toFixed(2);
                   Data.currentUnit1=(parsedData[5]*0.01).toFixed(2);
                   Data.currentUnit2=(parsedData[7]*0.01).toFixed(2);
                   Data.currentUnit3=(parsedData[9]*0.01).toFixed(2);
                   Data.currentUnit4=(parsedData[11]*0.01).toFixed(2);
                   Data.currentUnit5=(parsedData[13]*0.01).toFixed(2);
                   Data.currentUnit6=(parsedData[15]*0.01).toFixed(2);
                   Data.powerUnit1=((parseFloat(Data.voltageUnit1)*parseFloat(Data.currentUnit1))/1000).toFixed(2);
                   Data.powerUnit2=((parseFloat(Data.voltageUnit2)*parseFloat(Data.currentUnit2))/1000).toFixed(2);
                   Data.powerUnit3=((parseFloat(Data.voltageUnit3)*parseFloat(Data.currentUnit3))/1000).toFixed(2);
                   Data.powerUnit4=((parseFloat(Data.voltageUnit4)*parseFloat(Data.currentUnit4))/1000).toFixed(2);
                   Data.powerUnit5=((parseFloat(Data.voltageUnit5)*parseFloat(Data.currentUnit5))/1000).toFixed(2);
                   Data.powerUnit6=((parseFloat(Data.voltageUnit6)*parseFloat(Data.currentUnit6))/1000).toFixed(2);
                   Data.inputCurrent=add(Data.currentUnit1,Data.currentUnit2,Data.currentUnit3,Data.currentUnit4,
                    Data.currentUnit5,Data.currentUnit6);
                   Data.inputPower=(parsedData[3]/1000).toFixed(2);
                   Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                   Data.totalEnergy=parseInt(parsedData[35]/100);
                   }
                   else{

                    const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                    if(SF_Idc==0 || SF_Idc==1){
                        Data.currentUnit1=(parsedData[5]*0.01).toFixed(2);
                        Data.currentUnit2=(parsedData[7]*0.01).toFixed(2);
                        Data.currentUnit3=(parsedData[9]*0.01).toFixed(2);
                        Data.currentUnit4=(parsedData[11]*0.01).toFixed(2);
                        Data.currentUnit5=(parsedData[13]*0.01).toFixed(2);
                        Data.currentUnit6=(parsedData[15]*0.01).toFixed(2);
                        }
					else if (SF_Idc==2){
                        Data.currentUnit1=(parsedData[5]*0.1).toFixed(2);
                        Data.currentUnit2=(parsedData[7]*0.1).toFixed(2);
                        Data.currentUnit3=(parsedData[9]*0.1).toFixed(2);
                        Data.currentUnit4=(parsedData[11]*0.1).toFixed(2);
                        Data.currentUnit5=(parsedData[13]*0.1).toFixed(2);
                        Data.currentUnit6=(parsedData[15]*0.1).toFixed(2);
					}
					else if (SF_Idc==3){
                        Data.currentUnit1=(parsedData[5]*1).toFixed(2);
                        Data.currentUnit2=(parsedData[7]*1).toFixed(2);
                        Data.currentUnit3=(parsedData[9]*1).toFixed(2);
                        Data.currentUnit4=(parsedData[11]*1).toFixed(2);
                        Data.currentUnit5=(parsedData[13]*1).toFixed(2);
                        Data.currentUnit6=(parsedData[15]*1).toFixed(2);	
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
                        Data.voltageUnit1=(parsedData[4]*0.1).toFixed(2);
                        Data.voltageUnit2=(parsedData[6]*0.1).toFixed(2);
                        Data.voltageUnit3=(parsedData[8]*0.1).toFixed(2);
                        Data.voltageUnit4=(parsedData[10]*0.1).toFixed(2);
                        Data.voltageUnit5=(parsedData[12]*0.1).toFixed(2);
                        Data.voltageUnit6=(parsedData[14]*0.1).toFixed(2);
					}
					else if(SF_V==1){
                        Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                        Data.voltageUnit1=(parsedData[4]*0.01).toFixed(2);
                        Data.voltageUnit2=(parsedData[6]*0.01).toFixed(2);
                        Data.voltageUnit3=(parsedData[8]*0.01).toFixed(2);
                        Data.voltageUnit4=(parsedData[10]*0.01).toFixed(2);
                        Data.voltageUnit5=(parsedData[12]*0.01).toFixed(2);
                        Data.voltageUnit6=(parsedData[14]*0.01).toFixed(2);
					}
					else if(SF_V==3){
                        Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                        Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                        Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                        Data.voltageUnit1=(parsedData[4]*1).toFixed(2);
                        Data.voltageUnit2=(parsedData[6]*1).toFixed(2);
                        Data.voltageUnit3=(parsedData[8]*1).toFixed(2);
                        Data.voltageUnit4=(parsedData[10]*1).toFixed(2);
                        Data.voltageUnit5=(parsedData[12]*1).toFixed(2);
                        Data.voltageUnit6=(parsedData[14]*1).toFixed(2);
					}

                    Data.powerUnit1=((parseFloat(Data.voltageUnit1)*parseFloat(Data.currentUnit1))/1000).toFixed(2);
                    Data.powerUnit2=((parseFloat(Data.voltageUnit2)*parseFloat(Data.currentUnit2))/1000).toFixed(2);
                    Data.powerUnit3=((parseFloat(Data.voltageUnit3)*parseFloat(Data.currentUnit3))/1000).toFixed(2);
                    Data.powerUnit4=((parseFloat(Data.voltageUnit4)*parseFloat(Data.currentUnit4))/1000).toFixed(2);
                    Data.powerUnit5=((parseFloat(Data.voltageUnit5)*parseFloat(Data.currentUnit5))/1000).toFixed(2);
                    Data.powerUnit6=((parseFloat(Data.voltageUnit6)*parseFloat(Data.currentUnit6))/1000).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.inputCurrent=add(Data.currentUnit1,Data.currentUnit2,Data.currentUnit3,Data.currentUnit4,
                        Data.currentUnit5,Data.currentUnit6);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                   }
                  
                }
                // else if(dataLength==41)  // Delta 2.1 16-bit
                // {
                //     parametersCount=37;

                //     for(let i=0,m=0; i<parametersCount;i++){
                //         if(i>=0 && i<33){
                //             parsedData[i]=data[m];
                //             m++;
                //         }
                //         else if(i>=33 && i<37){
                //             parsedData[i]=reverseUnsigned32Bit(data[m],data[m+1]);
                //             m+=2;
                //         }
                //     }

                //     //Status Conversion
                //     if(parsedData[1]==0)
                //     parsedData[1]='Standby';
                //     else if(parsedData[1]==1)
                //     parsedData[1]='Countdown';
                //     else if(parsedData[1]==2)
                //     parsedData[1]='Running';
                //     else if(parsedData[1]==3)
                //     parsedData[1]='No DC';
                //     else if(parsedData[1]==4)
                //     parsedData[1]='Alarm';
                //     else
                //     parsedData[1]=undefined;
                    
                //     //Alarm Conversion
                    
                //     let error1=dectobin16Bit(parsedData[27]);
                //     let parseError1="";

                //     if(error1[1]==1)
                //         parseError1='AC Freq High, ';
                //     if(error1[2]==1)
                //         parseError1+='AC Freq Low, ';
                //     if(error1[7]==1)
                //         parseError1+='AC Quality, ';
                //     if(error1[8]==1)
                //         parseError1+='HW Phase Seq, ';
                //     if(error1[9]==1)
                //         parseError1+='No Grid, ';
                //     if(error1[10]==1 || error1[15]==1)
                //         parseError1+='AC Volt Low, ';
                //     if(error1[11]==1)
                //         parseError1+='AC Volt High, ';
                //     if(error1[13]==1)
                //         parseError1+='SL AC Volt High,';
                    
                //     parsedData[27]=parseError1;

                //     let error2=dectobin16Bit(parsedData[28]);
                //     let parseError2="";
                    
                //     if(error2[0]==1 || error2[5]==1)
                //         parseError2='AC Volt High, ';
                //     if(error2[2]==1)
                //         parseError2+='SL AC Volt High, ';
                //     if(error2[4]==1)
                //         parseError2+='AC Volt Low, ';
                //     if(error2[7]==1)
                //         parseError2+='SL AC Volt High, ';
                //     if(error2[14]==1)
                //         parseError2+='Sol1 High, ';
                //     if(error2[15]==1)
                //         parseError2+='Sol2 High, ';
                    
                //     parsedData[28]=parseError2;

                //     let error3=dectobin16Bit(parsedData[29]);
                //     let parseError3="";
                    
                //     if(error3[2]==1)
                //     parseError3='Insulation';

                //     parsedData[29] = parseError3;

                //     //Fault coversion
                //     let fault1=dectobin16Bit(parsedData[30]);
                //     let parseFault1="";

                //     if(fault1[1]==1 || fault1[2]==1 || fault1[3]==1)
                //         parseFault1='HW DC Inject, ';
                //     if(fault1[5]==1 || fault1[7]==1)
                //         parseFault1+='Temperature, ';
                //     if(fault1[6]==1)
                //         parseFault1+='HW NTC1, ';
                //     if(fault1[8]==1)
                //         parseFault1+='HW NTC2, ';
                //     if(fault1[9]==1)
                //         parseFault1+='HW NTC3, ';
                //     if(fault1[10]==1 )
                //         parseFault1+='HW NTC4, ';
                //     if(fault1[13]==1  )
                //         parseFault1+='HW Relay, ';
                //     if(fault1[15]==1 )
                //         parseFault1+='HW DSP ADC1, ';

                //     parsedData[30] = parseFault1;

                //     let fault2=dectobin16Bit(parsedData[31]);
                //     let parseFault2="";

                //     if(fault2[0]==1)
                //         parseFault2='HW DSP ADC2, ';
                //     if(fault2[1]==1)
                //         parseFault2+='HW DSP ADC3, ';
                //     if(fault2[2]==1)
                //         parseFault2+='HW RED ADC1, ';
                //     if(fault2[3]==1)
                //         parseFault2+='HW RED ADC2, ';
                //     if(fault2[4]==1)
                //         parseFault2+='HW Efficiency, ';
                //     if(fault2[6]==1)
                //         parseFault2+='HW COMM2, ';
                //     if(fault2[7]==1)
                //         parseFault2+='HW COMM1, ';
                //     if(fault2[8]==1)
                //         parseFault2+='Ground Leakage, ';
                //     if(fault2[9]==1)
                //         parseFault2+='Insulation, ';
                //     if(fault2[10]==1)
                //         parseFault2+='HW Int Wire, ';
                //     if(fault2[11]==1)
                //         parseFault1+='HW RCMU, ';
                //     if(fault2[12]==1)
                //         parseFault2+='HW Relay Short, ';
                //     if(fault2[13]==1)
                //         parseFault2+='HW Relay Open, ';
                //     if(fault2[14]==1)
                //         parseFault2+='HW Bus Unbalance, ';
                //     if(fault2[15]==1)
                //         parseFault2+='HW Bus OVR Plus, ';
                        
                //     parsedData[31] = parseFault2;

                //     let fault3=dectobin16Bit(parsedData[32]);
                //     let parseFault3="";

                //     if(fault3[1]==1)
                //         parseFault3='HW Bus OVR Min, ';
                //     if(fault3[3]==1)
                //         parseFault3+='HW Bus OVR, ';
                //     if(fault3[4]==1 || fault3[6]==1 || fault3[8]==1)
                //         parseFault3+='AC TR OCR, ';
                //     if(fault3[5]==1 || fault3[7]==1 || fault3[9]==1)
                //         parseFault3+='AC OCR, ';
                //     if(fault3[10]==1)
                //         parseFault3+='HW CTA, ';
                //     if(fault3[11]==1)
                //         parseFault3+='HW CTB, ';
                //     if(fault3[12]==1)
                //         parseFault3+='HW CTC, ';
                //     if(fault3[13]==1)
                //         parseFault3+='HW AC OCR';

                //     parsedData[32] = parseFault3;

                //    //Add data to mongoose object for Database
                //    Data.status=(parsedData[1]);
                //    Data.temperature=(parsedData[2]);
                //    Data.frequency=(parsedData[20]/100).toFixed(2);
                //    Data.dailyRuntime=parseInt(parsedData[34]/3600);
                //    Data.totalRuntime=parseInt(parsedData[36]/3600);
                //    Data.error=addString(parsedData[27],parsedData[28],parsedData[29]);
                //    Data.fault=addString(parsedData[30],parsedData[31],parsedData[32]);
                
                //     //Scale factor for multiplers
                //    const scaleFactor =dectobin16Bit(parsedData[0]);

                //    if(scaleFactor[0]==1){
                //    Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                //    Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                //    Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                //    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                //    Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                //    Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                //    Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
                //    Data.outputCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                //    Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                //    Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                //    Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                //    Data.activePower=(parsedData[16]/1000).toFixed(2);
                //    Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                //    Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                //    Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                //    Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                //    Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                //    Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
                //    Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                //    Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                //    Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                //    Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                //    Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                //    Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                //    Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                //    Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                //    Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                //    Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                //    Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                //    Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                //    Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,
                //     Data.currentMPPT5,Data.currentMPPT6);
                //    Data.inputPower=(parsedData[3]/1000).toFixed(2);
                //    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                //    Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                //    Data.totalEnergy=parseInt(parsedData[35]/100);
                //    }
                //    else{

                //     const SF_Idc = bintodec(scaleFactor[2]+scaleFactor[1])

                //     if(SF_Idc==0 || SF_Idc==1){
                //         Data.currentMPPT1=(parsedData[5]*0.01).toFixed(2);
                //         Data.currentMPPT2=(parsedData[7]*0.01).toFixed(2);
                //         Data.currentMPPT3=(parsedData[9]*0.01).toFixed(2);
                //         Data.currentMPPT4=(parsedData[11]*0.01).toFixed(2);
                //         Data.currentMPPT5=(parsedData[13]*0.01).toFixed(2);
                //         Data.currentMPPT6=(parsedData[15]*0.01).toFixed(2);
                //         }
				// 	else if (SF_Idc==2){
                //         Data.currentMPPT1=(parsedData[5]*0.1).toFixed(2);
                //         Data.currentMPPT2=(parsedData[7]*0.1).toFixed(2);
                //         Data.currentMPPT3=(parsedData[9]*0.1).toFixed(2);
                //         Data.currentMPPT4=(parsedData[11]*0.1).toFixed(2);
                //         Data.currentMPPT5=(parsedData[13]*0.1).toFixed(2);
                //         Data.currentMPPT6=(parsedData[15]*0.1).toFixed(2);
				// 	}
				// 	else if (SF_Idc==3){
                //         Data.currentMPPT1=(parsedData[5]*1).toFixed(2);
                //         Data.currentMPPT2=(parsedData[7]*1).toFixed(2);
                //         Data.currentMPPT3=(parsedData[9]*1).toFixed(2);
                //         Data.currentMPPT4=(parsedData[11]*1).toFixed(2);
                //         Data.currentMPPT5=(parsedData[13]*1).toFixed(2);
                //         Data.currentMPPT6=(parsedData[15]*1).toFixed(2);	
                //     }
                    
                //     const SF_W = bintodec (scaleFactor[5]+scaleFactor[4]+scaleFactor[3]);
					
				// 	if(SF_W==1){
                //         Data.powerPhaseR=(parsedData[19]/10000).toFixed(2);
                //         Data.powerPhaseY=(parsedData[23]/10000).toFixed(2);
                //         Data.powerPhaseB=(parsedData[26]/10000).toFixed(2);
                //         Data.activePower=(parsedData[16]/10000).toFixed(2);
                //         Data.inputPower=(parsedData[3]/10000).toFixed(2);
				// 	}
				// 	else if(SF_W==2 || SF_W==0){
                //         Data.powerPhaseR=(parsedData[19]/1000).toFixed(2);
                //         Data.powerPhaseY=(parsedData[23]/1000).toFixed(2);
                //         Data.powerPhaseB=(parsedData[26]/1000).toFixed(2);
                //         Data.activePower=(parsedData[16]/1000).toFixed(2);
                //         Data.inputPower=(parsedData[3]/1000).toFixed(2);
				// 	}
				// 	else if(SF_W==3){
                //         Data.powerPhaseR=(parsedData[19]/100).toFixed(2);
                //         Data.powerPhaseY=(parsedData[23]/100).toFixed(2);
                //         Data.powerPhaseB=(parsedData[26]/100).toFixed(2);
                //         Data.activePower=(parsedData[16]/100).toFixed(2);
                //         Data.inputPower=(parsedData[3]/100).toFixed(2);
				// 	}
				// 	else if(SF_W==4){
                //         Data.powerPhaseR=(parsedData[19]/10).toFixed(2);
                //         Data.powerPhaseY=(parsedData[23]/10).toFixed(2);
                //         Data.powerPhaseB=(parsedData[26]/10).toFixed(2);
                //         Data.activePower=(parsedData[16]/10).toFixed(2);
                //         Data.inputPower=(parsedData[3]/10).toFixed(2);
				// 	}
				// 	else if(SF_W==5){
                //         Data.powerPhaseR=(parsedData[19]*1).toFixed(2);
                //         Data.powerPhaseY=(parsedData[23]*1).toFixed(2);
                //         Data.powerPhaseB=(parsedData[26]*1).toFixed(2);
                //         Data.activePower=(parsedData[16]*1).toFixed(2);
                //         Data.inputPower=(parsedData[3]*1).toFixed(2);
				// 	}

                //     const SF_Wh = bintodec (scaleFactor[9]+scaleFactor[8]+scaleFactor[7]+scaleFactor[6]);
					
				// 	if(SF_Wh==0){
                //         Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                //         Data.totalEnergy=parseInt(parsedData[35]/100);
				// 	}
				// 	else if(SF_Wh==4){
                //         Data.dailyEnergy=(parsedData[33]/1000).toFixed(2);
                //         Data.totalEnergy=parseInt(parsedData[35]/1000);
				// 	}
				// 	else if(SF_Wh==5){
                //         Data.dailyEnergy=(parsedData[33]/100).toFixed(2);
                //         Data.totalEnergy=parseInt(parsedData[35]/100);
				// 	}
				// 	else if(SF_Wh==6){
                //         Data.dailyEnergy=(parsedData[33]/10).toFixed(2);
                //         Data.totalEnergy=parseInt(parsedData[35]/10);
				// 	}
				// 	else if(SF_Wh==7){
                //         Data.dailyEnergy=(parsedData[33]/1).toFixed(2);
                //         Data.totalEnergy=parseInt(parsedData[35]/1);
				// 	}

                //     const SF_Iac = bintodec (scaleFactor[11]+scaleFactor[10]);
					
				// 	if(SF_Iac==0 || SF_Iac==1){
                //         Data.currentPhaseR=(parsedData[18]*0.01).toFixed(2);
                //         Data.currentPhaseY=(parsedData[22]*0.01).toFixed(2);
                //         Data.currentPhaseB=(parsedData[25]*0.01).toFixed(2);
				// 	}
				// 	else if(SF_Iac==2){
                //         Data.currentPhaseR=(parsedData[18]*0.1).toFixed(2);
                //         Data.currentPhaseY=(parsedData[22]*0.1).toFixed(2);
                //         Data.currentPhaseB=(parsedData[25]*0.1).toFixed(2);
				// 	}
				// 	else if(SF_Iac==3){
                //         Data.currentPhaseR=(parsedData[18]*1).toFixed(2);
                //         Data.currentPhaseY=(parsedData[22]*1).toFixed(2);
                //         Data.currentPhaseB=(parsedData[25]*1).toFixed(2);
				// 	}
					
				// 	const SF_V = bintodec (scaleFactor[13]+scaleFactor[12]);
					
				// 	if(SF_V==0 || SF_V==2){
                //         Data.voltagePhaseR=(parsedData[17]*0.1).toFixed(2);
                //         Data.voltagePhaseY=(parsedData[21]*0.1).toFixed(2);
                //         Data.voltagePhaseB=(parsedData[24]*0.1).toFixed(2);
                //         Data.voltageMPPT1=(parsedData[4]*0.1).toFixed(2);
                //         Data.voltageMPPT2=(parsedData[6]*0.1).toFixed(2);
                //         Data.voltageMPPT3=(parsedData[8]*0.1).toFixed(2);
                //         Data.voltageMPPT4=(parsedData[10]*0.1).toFixed(2);
                //         Data.voltageMPPT5=(parsedData[12]*0.1).toFixed(2);
                //         Data.voltageMPPT6=(parsedData[14]*0.1).toFixed(2);
				// 	}
				// 	else if(SF_V==1){
                //         Data.voltagePhaseR=(parsedData[17]*0.01).toFixed(2);
                //         Data.voltagePhaseY=(parsedData[21]*0.01).toFixed(2);
                //         Data.voltagePhaseB=(parsedData[24]*0.01).toFixed(2);
                //         Data.voltageMPPT1=(parsedData[4]*0.01).toFixed(2);
                //         Data.voltageMPPT2=(parsedData[6]*0.01).toFixed(2);
                //         Data.voltageMPPT3=(parsedData[8]*0.01).toFixed(2);
                //         Data.voltageMPPT4=(parsedData[10]*0.01).toFixed(2);
                //         Data.voltageMPPT5=(parsedData[12]*0.01).toFixed(2);
                //         Data.voltageMPPT6=(parsedData[14]*0.01).toFixed(2);
				// 	}
				// 	else if(SF_V==3){
                //         Data.voltagePhaseR=(parsedData[17]*1).toFixed(2);
                //         Data.voltagePhaseY=(parsedData[21]*1).toFixed(2);
                //         Data.voltagePhaseB=(parsedData[24]*1).toFixed(2);
                //         Data.voltageMPPT1=(parsedData[4]*1).toFixed(2);
                //         Data.voltageMPPT2=(parsedData[6]*1).toFixed(2);
                //         Data.voltageMPPT3=(parsedData[8]*1).toFixed(2);
                //         Data.voltageMPPT4=(parsedData[10]*1).toFixed(2);
                //         Data.voltageMPPT5=(parsedData[12]*1).toFixed(2);
                //         Data.voltageMPPT6=(parsedData[14]*1).toFixed(2);
				// 	}

                //     Data.powerMPPT1=((parseFloat(Data.voltageMPPT1)*parseFloat(Data.currentMPPT1))/1000).toFixed(2);
                //     Data.powerMPPT2=((parseFloat(Data.voltageMPPT2)*parseFloat(Data.currentMPPT2))/1000).toFixed(2);
                //     Data.powerMPPT3=((parseFloat(Data.voltageMPPT3)*parseFloat(Data.currentMPPT3))/1000).toFixed(2);
                //     Data.powerMPPT4=((parseFloat(Data.voltageMPPT4)*parseFloat(Data.currentMPPT4))/1000).toFixed(2);
                //     Data.powerMPPT5=((parseFloat(Data.voltageMPPT5)*parseFloat(Data.currentMPPT5))/1000).toFixed(2);
                //     Data.powerMPPT6=((parseFloat(Data.voltageMPPT6)*parseFloat(Data.currentMPPT6))/1000).toFixed(2);
                //     Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                //     Data.outputCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                //     Data.inputCurrent=add(Data.currentMPPT1,Data.currentMPPT2,Data.currentMPPT3,Data.currentMPPT4,
                //         Data.currentMPPT5,Data.currentMPPT6);
                //     Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                //    }
                  
                // }
                else{
                    return "Conflict";
                }
                
            break;

            case 58:          //TMEIC 1MW Series

            parametersCount=25;

                if(dataLength==35)  //16bit Parsing
                {
                    for(let i=0,m=0; i<parametersCount;i++){
                        if(i>=0 && i<15){
                            if(i==1)
                            parsedData[i]=(data[m]);
                            else
                            parsedData[i]=signed16Bit(data[m]);
                            m+=1;
                        }
                        else if(i>=15 && i<25){
                            if(i==24)
                            parsedData[i]=signed32Bit(data[m],data[m+1]);
                            else
                            parsedData[i]=unsigned32Bit(data[m],data[m+1]);
                            m+=2;
                        }
                    }

                    //Status coversion
                    let status=dectobin16Bit(parsedData[1]);
                    let parseStatus="";

                    if(status[0]==1)
                        parseStatus='Major Fault, ';
                    if(status[1]==1)
                        parseStatus+='Grid Fault, ';
                    if(status[2]==1)
                        parseStatus+='Alarm, ';
                    if(status[3]==1)
                        parseStatus+='Minor Fault, ';

                    if (parseStatus === "" && parsedData[12] !=0)
                       parseStatus = "Running";
                    else
                       parseStatus = "Trip";
                   
                    parsedData[1] = addString(parseStatus);
                    
                    //Fault coversion
                    let fault1=dectobin32Bit(parsedData[16]);
                    let parseFault1="";

                    if(fault1[0]==1)
                        parseFault1='Control circuit error (WDT), ';
                    if(fault1[1]==1)
                        parseFault1+='Control circuit error (CLK), ';
                    if(fault1[3]==1)
                        parseFault1+='Control power supply undervoltage, ';

                    parsedData[16] = parseFault1;

                    let fault2=dectobin32Bit(parsedData[17]);
                    let parseFault2="";

                    if(fault2[0]==1)
                        parseFault2='DC overvoltage, ';
                    if(fault2[1]==1)
                        parseFault2+='DC circuit abnormal, ';
                    if(fault2[2]==1)
                        parseFault2+='Control power abnormal, ';
                    if(fault2[3]==1)
                        parseFault2+='Control circuit error (AD), ';
                    if(fault2[4]==1)
                        parseFault2+='IGBT gate fault phase U, ';
                    if(fault2[5]==1)
                        parseFault2+='IGBT gate fault phase V, ';
                    if(fault2[6]==1)
                        parseFault2+='IGBT gate fault phase W, ';
                    if(fault2[7]==1)
                        parseFault2+='Zero phase overcurrent, ';
                    if(fault2[9]==1)
                        parseFault2+='DC overcurrent 1, ';
                    if(fault2[10]==1)
                        parseFault2+='DC overcurrent 2, ';
                    if(fault2[11]==1)
                        parseFault2+='DC overcurrent 3, ';
                    if(fault2[12]==1)
                        parseFault2+='Inverter overcurrent 1, ';
                    if(fault2[13]==1)
                        parseFault2+='Zero phase OC, ';
                    if(fault2[15]==1)
                        parseFault2+='DC current balance abnormal, ';
                    if(fault2[16]==1)
                        parseFault2+='DC current backflow 1 (CSG1), ';

                    parsedData[17] = parseFault2;

                    let fault3=dectobin32Bit(parsedData[18]);
                    let parseFault3="";

                    if(fault3[0]==1)
                        parseFault3='Emergency stop, ';
                    if(fault3[1]==1)
                        parseFault3+='External trip, ';
                    if(fault3[2]==1)
                        parseFault3+='Inverter abnormal, ';
                    if(fault3[3]==1)
                        parseFault3+='Repeated fault, ';
                    if(fault3[4]==1)
                        parseFault3+='Repeated fault, ';
                    if(fault3[5]==1)
                        parseFault3+='Cooling fan abnormal, ';
                    if(fault3[15]==1)
                        parseFault3+='Flash memory error, ';
                    if(fault3[16]==1)
                        parseFault3+='Control circuit error (FPGA), ';
                    if(fault3[17]==1)
                        parseFault3+='DC ground fault (HCT), ';

                    parsedData[18] = parseFault3;

                    let fault4=dectobin32Bit(parsedData[19]);
                    let parseFault4="";

                    if(fault4[1]==1)
                        parseFault4+='DC undervoltage, ';
                    if(fault4[2]==1)
                        parseFault4+='8A Open, ';
                    if(fault4[3]==1)
                        parseFault4+='Control power supply abnormal (AC-UV), ';
                    if(fault4[4]==1)
                        parseFault4+='Control power supply abnormal (AC-OV), ';
                    if(fault4[5]==1)
                        parseFault4+='DC unbalance 1, ';

                    parsedData[19] = parseFault4;

                    let fault5=dectobin32Bit(parsedData[20]);
                    let parseFault5="";

                    if(fault5[0]==1)
                        parseFault5='Inveter OC, ';
                    if(fault5[1]==1)
                        parseFault5+='Inverter overcurrent, ';
                    if(fault5[2]==1)
                        parseFault5+='Ctrl. Circuit error, ';
                    if(fault5[4]==1)
                        parseFault5+='AC volatge sensor error, ';
                    if(fault5[5]==1)
                        parseFault5+='52R ON failure, ';
                    if(fault5[6]==1)
                        parseFault5+='52R OFF failure, ';
                    if(fault5[7]==1)
                        parseFault5+='Over temperature, ';
                    if(fault5[8]==1)
                        parseFault5+='External minor fault, ';
                    if(fault5[15]==1)
                        parseFault5+='Communication command timeout, ';
                    if(fault5[16]==1)
                        parseFault5+='Grid overvoltage (OV), ';
                    if(fault5[17]==1)
                        parseFault5+='Short time AC overvoltage, ';
                    if(fault5[18]==1)
                        parseFault5+='Grid undervoltage (UV), ';
                    if(fault5[19]==1)
                        parseFault5+='Short time AC undervoltage, ';
                    if(fault5[20]==1)
                        parseFault5+='Overfrequency, ';
                    if(fault5[21]==1)
                        parseFault5+='Underfrequency, ';
                    if(fault5[22]==1)
                        parseFault5+='Phase rotation error, ';
                    if(fault5[23]==1)
                        parseFault5+='Open phase, ';
                    if(fault5[24]==1)
                        parseFault5+='Voltage phase jump, ';
                    if(fault5[25]==1)
                        parseFault5+='Synchronization loss, ';
                    if(fault5[28]==1)
                        parseFault5+='External grid fault, ';

                    parsedData[20] = parseFault5;

                    // Error Conversion
                    let error1=dectobin32Bit(parsedData[22]);
                    let parseError1="";

                    if(error1[1]==1)
                        parseError1+='Operation prohibation, ';
                    if(error1[2]==1)
                        parseError1+='72B open, ';
                    if(error1[3]==1)
                        parseError1+='DC-C abnormal, ';
                    if(error1[4]==1)
                        parseError1+='External alarm, ';
                    if(error1[5]==1)
                        parseError1+='DC ground fault (HCT), ';
                    if(error1[6]==1)
                        parseError1+='DC ground fault (Voltage divider), ';
                    if(error1[7]==1)
                        parseError1+='SPD error, ';
                    if(error1[8]==1)
                        parseError1+='Grid voltage rise, ';
                    if(error1[9]==1)
                        parseError1+='52R not charged, ';
                    if(error1[10]==1)
                        parseError1+='Ambient OT., ';

                    parsedData[22] = parseError1;

                    //Add data to mongoose object for Database
                    Data.status=(parsedData[1]);
                    Data.voltagePhaseR=(parsedData[6]*0.1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[7]*0.1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[8]*0.1).toFixed(2);
                    Data.outputVoltage=(add(Data.voltagePhaseR,Data.voltagePhaseY,Data.voltagePhaseB)/3).toFixed(2);
                    Data.currentPhaseR=(parsedData[9]*0.1).toFixed(2);
                    Data.currentPhaseY=(parsedData[10]*0.1).toFixed(2);
                    Data.currentPhaseB=(parsedData[11]*0.1).toFixed(2);
                    Data.outputCurrent=(add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB)/3).toFixed(2);
                    Data.activePower=(parsedData[2]*0.1).toFixed(2);
                    if(Data.activePower<0)
                    Data.activePower=0;
                    Data.reactivePower=(parsedData[3]*0.1).toFixed(2);
                    Data.frequency=(parsedData[5]*0.1).toFixed(2);
                    Data.powerFactor=(parsedData[4]*0.01).toFixed(3);
                    Data.inputVoltage=(parsedData[13]*0.1).toFixed(2);
                    Data.inputCurrent=(parsedData[14]*0.1).toFixed(2);
                    Data.inputPower=(parsedData[12]*0.1).toFixed(2);
                    Data.efficiency=calculateEfficiency(Data.activePower,Data.inputPower);
                    Data.totalEnergy=parseInt(parsedData[24]*1);
                    Data.error=addString(parsedData[22]);
                    Data.fault=addString(parsedData[16],parsedData[17],parsedData[18],parsedData[19],parsedData[20]);

                    const lastestRecord = await CentralizedInverter.aggregate([
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

            break;

            default:
                return "Conflict";
            break;
        }

        switch(Data.plantId){
            
            case 209:

                Data.dailyEnergy = parseFloat((Data.dailyEnergy*10).toFixed(2));
                Data.totalEnergy= parseInt(Data.totalEnergy*10);
                Data.inputPower = parseFloat((Data.inputPower*10).toFixed(2));
                Data.activePower = parseFloat((Data.activePower*10).toFixed(2));
               
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
    else
    {
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

//Sync Centralized inverter service
exports.syncCentralizedInverter = async(data)=>{

    //Initialize mongoose object for Database
    const Data = new CentralizedInverter({
        timestamp:data.timestamp,
        loggerNo:data.loggerNo,
        plantId:data.plantId,
        deviceType:data.deviceType,
        deviceNo:data.deviceNo,
        errorFlag:data.errorFlag,
        masterFlag:data.masterFlag
    });

    if(Data.errorFlag==0){
        Data.status=(data.status);
        Data.efficiency=(data.efficiency);
        Data.temperature=(data.temperature);
        //Data.transformerTemperature=(data.);
        Data.IGBTATemperature=(data.IGBTATemperature);
        Data.IGBTBTemperature=(data.IGBTBTemperature);
        Data.IGBTCTemperature=(data.IGBTCTemperature);
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
        Data.apparantPower=(data.apparantPower);
        Data.powerFactor=(data.powerFactor);
        Data.frequency=(data.frequency);
        Data.voltageUnit1=(data.voltageUnit1);
        Data.voltageUnit2=(data.voltageUnit2);
        Data.voltageUnit3=(data.voltageUnit3);
        Data.voltageUnit4=(data.voltageUnit4);
        Data.voltageUnit5=(data.voltageUnit5);
        Data.voltageUnit6=(data.voltageUnit6);
        Data.voltageUnit7=(data.voltageUnit7);
        Data.voltageUnit8=(data.voltageUnit8);
        Data.voltageUnit9=(data.voltageUnit9);
        Data.voltageUnit10=(data.voltageUnit10);
        Data.voltageUnit11=(data.voltageUnit11);
        Data.voltageUnit12=(data.voltageUnit12);
        Data.currentUnit1=(data.currentUnit1);
        Data.currentUnit2=(data.currentUnit2);
        Data.currentUnit3=(data.currentUnit3);
        Data.currentUnit4=(data.currentUnit4);
        Data.currentUnit5=(data.currentUnit5);
        Data.currentUnit6=(data.currentUnit6);
        Data.currentUnit7=(data.currentUnit7);
        Data.currentUnit8=(data.currentUnit8);
        Data.currentUnit9=(data.currentUnit9);
        Data.currentUnit10=(data.currentUnit10);
        Data.currentUnit11=(data.currentUnit11);
        Data.currentUnit12=(data.currentUnit12);
        Data.powerUnit1=(data.powerUnit1);
        Data.powerUnit2=(data.powerUnit2);
        Data.powerUnit3=(data.powerUnit3);
        Data.powerUnit4=(data.powerUnit4);
        Data.powerUnit5=(data.powerUnit5);
        Data.powerUnit6=(data.powerUnit6);
        Data.powerUnit7=(data.powerUnit7);
        Data.powerUnit8=(data.powerUnit8);
        Data.powerUnit9=(data.powerUnit9);
        Data.powerUnit10=(data.powerUnit10);
        Data.powerUnit11=(data.powerUnit11);
        Data.powerUnit12=(data.powerUnit12);
        Data.currentInput1=(data.currentInput1);
        Data.currentInput2=(data.currentInput2);
        Data.currentInput3=(data.currentInput3);
        Data.currentInput4=(data.currentInput4);
        Data.currentInput5=(data.currentInput5);
        Data.currentInput6=(data.currentInput6);
        Data.currentInput7=(data.currentInput7);
        Data.currentInput8=(data.currentInput8);
        Data.currentInput9=(data.currentInput9);
        Data.currentInput10=(data.currentInput10);
        Data.currentInput11=(data.currentInput11);
        Data.currentInput12=(data.currentInput12);
        Data.currentInput13=(data.currentInput13);
        Data.currentInput14=(data.currentInput14);
        Data.currentInput15=(data.currentInput15);
        Data.currentInput16=(data.currentInput16);
        Data.currentInput17=(data.currentInput17);
        Data.currentInput18=(data.currentInput18);
        Data.currentInput19=(data.currentInput19);
        Data.currentInput20=(data.currentInput20);
        Data.currentInput21=(data.currentInput21);
        Data.currentInput22=(data.currentInput22);
        Data.currentInput23=(data.currentInput23);
        Data.currentInput24=(data.currentInput24);
        Data.currentInput25=(data.currentInput25);
        Data.currentInput26=(data.currentInput26);
        Data.currentInput27=(data.currentInput27);
        Data.currentInput28=(data.currentInput28);
        Data.currentInput29=(data.currentInput29);
        Data.currentInput30=(data.currentInput30);
        Data.inputVoltage=(data.inputVoltage);
        Data.inputCurrent=(data.inputCurrent);
        Data.inputPower=(data.inputPower);
        Data.dailyEnergy=(data.dailyEnergy);
        Data.totalEnergy=(data.totalEnergy);
        Data.dailyRuntime=(data.dailyRuntime);
        Data.totalRuntime=(data.totalRuntime);
        Data.gridConnectionTime=(data.gridConnectionTime);
        Data.error=(data.error);
        Data.warning=(data.warning);
        Data.fault=(data.fault);
        Data.breakerStatus=(data.breakerStatus);

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