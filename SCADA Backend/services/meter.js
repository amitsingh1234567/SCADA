const { Meter } = require('../models/meter');
const { PlantProfile } = require('../models/plantProfile');

//Various functions For Data Parseing
// const Float32ToHex = (float32) => {
//     const getHex = i => ('00' + i.toString(16)).slice(-2);
//     var view = new DataView(new ArrayBuffer(4))
//     view.setFloat32(0, float32);
//     return Array.apply(null, { length: 4 }).map((_, i) => getHex(view.getUint8(i))).join('');
// }

// const Float32ToBin = (float32) => {
//     const HexToBin = hex => (parseInt(hex, 16).toString(2)).padStart(32, '0');
//     const getHex = i => ('00' + i.toString(16)).slice(-2);
//     var view = new DataView(new ArrayBuffer(4))
//     view.setFloat32(0, float32);
//     return HexToBin(Array.apply(null, { length: 4 }).map((_, i) => getHex(view.getUint8(i))).join(''));
// }

// const BinToFloat32 = (str) => {
//     var int = parseInt(str, 2);
//     if (int > 0 || int < 0) {
//         var sign = (int >>> 31) ? -1 : 1;
//         var exp = (int >>> 23 & 0xff) - 127;
//         var mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
//         var float32 = 0
//         for (i = 0; i < mantissa.length; i += 1) { float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp-- }
//         return float32 * sign;
//     } else return 0
// }

const add=(...args)=>{
let add=0;
    for(i in args){
        add += args[i];
        }
 return (Number(add)).toFixed(2);
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

//Meter service
exports.meter = async(args,data)=>{

    //Initialize mongoose object for Database
    const Data = new Meter({
        timestamp:args[5],
        loggerNo:args[0],
        plantId:args[1],
        deviceType:args[2],
        deviceNo:args[3],
        errorFlag:args[4]
    });

    const panelMeterProfile = await PlantProfile.aggregate([
        {
          '$match': {
            'plantId': Data.plantId, 
            'panelMeter.details.id': Data.deviceNo
          }
        }, {
          '$project': {
            'device': {
              '$filter': {
                'input': '$panelMeter.details', 
                'as': 'meters', 
                'cond': {
                  '$eq': [
                    '$$meters.id', Data.deviceNo
                  ]
                }
              }
            }, 
            '_id': 0
          }
        }
    ]);
    
    if(panelMeterProfile[0] == undefined)
        Data.solutionFlag = 'MFM';
    else
        Data.solutionFlag = panelMeterProfile[0].device[0].solution;

    if(Data.errorFlag==0){
        
        const dataLength = data.length;
        const parsedData = [];
        let parametersCount;
 
        switch(Data.deviceType){

            case 176:       // Secure Premier 300

                parametersCount=24;

                if(dataLength==48)     // Secure Premier 300 16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[5]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[6]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePower=(parsedData[7]*1).toFixed(2);
                    Data.reactivePower=(parsedData[9]*1).toFixed(2);
                    Data.apparantPower=(parsedData[10]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.powerFactor=(parsedData[15]*1).toFixed(2);
                    Data.frequency=(parsedData[11]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[16]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[17]*1).toFixed(2);
                    Data.netActiveEnergy=(parsedData[20]*1).toFixed(2);
                    Data.reactiveEnergyImport=(parsedData[21]*1).toFixed(2);
                    Data.reactiveEnergyExport=(parsedData[22]*1).toFixed(2);
                    Data.netReactiveEnergy=(parsedData[23]).toFixed(2);

                }
                else{
                    return "Conflict";
                }
            break;

            case 177:       // Elite 443 8-bit

                parametersCount=24;

                if(dataLength==96)
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]*1).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]*1).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]*1).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    //Data.activeEnergyImport=(parsedData[]).toFixed(2);
                    Data.activeEnergyExport=(parsedData[20]*1).toFixed(2);
                    Data.netActiveEnergy=Data.activeEnergyExport;
                    //Data.reactiveEnergyImport=(parsedData[]).toFixed(2);
                    Data.reactiveEnergyExport=((parsedData[22]*1)+(parsedData[23]*1)).toFixed(2);
                    Data.netReactiveEnergy= Data.reactiveEnergyExport;
                    //Data.apparentEnergyImport=(parsedData[]).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[21]*1).toFixed(2);
                    Data.netApparentEnergy=Data.apparentEnergyExport;

                }
                else if(dataLength==48)  //elite 443 16-bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]*1).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]*1).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]*1).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                   //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                   //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                   //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    //Data.activeEnergyImport=(parsedData[]).toFixed(2);
                    Data.activeEnergyExport=(parsedData[20]*1).toFixed(2);
                    Data.netActiveEnergy=Data.activeEnergyExport;
                    //Data.reactiveEnergyImport=(parsedData[]).toFixed(2);
                    Data.reactiveEnergyExport=((parsedData[22]*1)+(parsedData[23]*1)).toFixed(2);
                    Data.netReactiveEnergy= Data.reactiveEnergyExport;
                    //Data.apparentEnergyImport=(parsedData[]).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[21]*1).toFixed(2);
                    Data.netApparentEnergy=Data.apparentEnergyExport;

                }
                else{
                    return "Conflict";
                }
            break;

            case 178:       // Elite 446

                parametersCount=26;

                if(dataLength==104)     // Elite 446 8-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]*1).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]*1).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]*1).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[20]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]*1).toFixed(2);
                    Data.netActiveEnergy=(Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2);
                    Data.reactiveEnergyImport=(parsedData[22]*1).toFixed(2);
                    Data.reactiveEnergyExport=(parsedData[23]*1).toFixed(2);
                    Data.netReactiveEnergy=(Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2);
                    Data.apparentEnergyImport=(parsedData[24]*1).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[25]*1).toFixed(2);
                    Data.netApparentEnergy=(Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2);

                }
                else if(dataLength==52) // Elite 446 16 bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]*1).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]*1).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]*1).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[20]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]*1).toFixed(2);
                    Data.netActiveEnergy=((Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2));
                    Data.reactiveEnergyImport=(parsedData[22]*1).toFixed(2);
                    Data.reactiveEnergyExport=(parsedData[23]*1).toFixed(2);
                    Data.netReactiveEnergy=((Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2));
                    Data.apparentEnergyImport=(parsedData[24]*1).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[25]*1).toFixed(2);
                    Data.netApparentEnergy=((Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2));

                }
                else{
                    return "Conflict";
                }
            break;

            case 179:       // Elite 307

                parametersCount=26;

                if(dataLength==104) //Elite 307  8-bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]/1000).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]/1000).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]/1000).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]/1000).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]/1000).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]/1000).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]/1000).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]/1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]/1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]/1).toFixed(2);
                    Data.powerFactor=(parsedData[11]/1).toFixed(2);
                    Data.frequency=(parsedData[19]/1).toFixed(2);

                    Data.activeEnergyImport=(parsedData[20]/1000).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]/1000).toFixed(2);
                    Data.netActiveEnergy=(Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2);
                    Data.reactiveEnergyImport=(parsedData[22]/1000).toFixed(2);
                    Data.reactiveEnergyExport=(parsedData[23]/1000).toFixed(2);
                    Data.netReactiveEnergy=(Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2);
                    Data.apparentEnergyImport=(parsedData[24]/1000).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[25]/1000).toFixed(2);
                    Data.netApparentEnergy=(Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2);

                }
                else if(dataLength==52)  //elite 443 16-bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]/1000).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]/1000).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]/1000).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]/1000).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]/1000).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]/1000).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]/1000).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[20]/1000).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]/1000).toFixed(2);
                    Data.netActiveEnergy=(Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2);
                    Data.reactiveEnergyImport=(parsedData[22]/1000).toFixed(2);
                    Data.reactiveEnergyExport=(parsedData[23]/1000).toFixed(2);
                    Data.netReactiveEnergy=(Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2);
                    Data.apparentEnergyImport=(parsedData[24]/1000).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[25]/1000).toFixed(2);
                    Data.netApparentEnergy=(Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2);

                }
                else{
                    return "Conflict";
                }
            break;

            case 180:       //Schnieder EM6430

                parametersCount=33;

                if(dataLength==66)     //Schnieder EM6430 16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[5]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[6]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[7]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[1]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[2]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[3]*1).toFixed(2);
                    Data.activeCurrent=(parsedData[0]*1).toFixed(2);
                    Data.activePowerPhaseR=(parsedData[9]/1000).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[10]/1000).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[11]/1000).toFixed(2);
                    Data.activePower=(parsedData[8]/1000).toFixed(2);
                    Data.reactivePowerPhaseR=(parsedData[13]/1000).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[14]/1000).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[15]/1000).toFixed(2);
                    Data.reactivePower=(parsedData[12]/1000).toFixed(2);
                    Data.apparantPowerPhaseR=(parsedData[17]/1000).toFixed(2);
                    Data.apparantPowerPhaseY=(parsedData[18]/1000).toFixed(2);
                    Data.apparantPowerPhaseB=(parsedData[19]/1000).toFixed(2);
                    Data.apparantPower=(parsedData[16]/1000).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[21]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[22]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[23]*1).toFixed(2);
                    Data.powerFactor=(parsedData[20]*1).toFixed(2);
                    Data.frequency=(parsedData[24]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[30]/1000).toFixed(2);
                    Data.activeEnergyExport=(parsedData[26]/1000).toFixed(2);
                    Data.netActiveEnergy=(Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2);
                    Data.reactiveEnergyImport=((parsedData[31]/1000)+(parsedData[32]/1000)).toFixed(2);
                    Data.reactiveEnergyExport=((parsedData[27]/1000)+(parsedData[28]/1000)).toFixed(2);
                    Data.netReactiveEnergy=(Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2);
                    Data.apparentEnergyImport=(parsedData[29]/1000).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[25]/1000).toFixed(2);
                    Data.netApparentEnergy=(Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2);

                }
                else{
                    return "Conflict";
                }
            break;

            case 181:       // L&T 400

                parametersCount=23;

                if(dataLength==92) // L&T 400 8-bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1],data[m+2],data[m+3]);
                        m+=4;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.activePower=(parsedData[0]/1000).toFixed(2);
                    Data.activePowerPhaseR=(parsedData[1]/1000).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[2]/1000).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[3]/1000).toFixed(2);
                    Data.powerFactor=(parsedData[4]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[5]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[6]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[7]*1).toFixed(2);
                    Data.apparantPower=(parsedData[8]/1000).toFixed(2);
                    Data.apparantPowerPhaseR=(parsedData[9]/1000).toFixed(2);
                    Data.apparantPowerPhaseY=(parsedData[10]/1000).toFixed(2);
                    Data.apparantPowerPhaseB=(parsedData[11]/1000).toFixed(2);
                    Data.VoltageAvg=(parsedData[12]*1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[13]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[14]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[15]*1).toFixed(2);
                    Data.activeCurrent=(parsedData[16]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[17]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[18]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[19]*1).toFixed(2);
                    Data.frequency=(parsedData[20]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]/1000).toFixed(2);
                    Data.netActiveEnergy=Data.activeEnergyExport;
                    Data.apparentEnergyExport=(parsedData[22]/1000).toFixed(2);
                    Data.netApparentEnergy=Data.apparentEnergyExport;

                }
                else if(dataLength==46)   // L&T 400 16-bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.activePower=(parsedData[0]/1000).toFixed(2);
                    Data.activePowerPhaseR=(parsedData[1]/1000).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[2]/1000).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[3]/1000).toFixed(2);
                    Data.powerFactor=(parsedData[4]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[5]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[6]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[7]*1).toFixed(2);
                    Data.apparantPower=(parsedData[8]/1000).toFixed(2);
                    Data.apparantPowerPhaseR=(parsedData[9]/1000).toFixed(2);
                    Data.apparantPowerPhaseY=(parsedData[10]/1000).toFixed(2);
                    Data.apparantPowerPhaseB=(parsedData[11]/1000).toFixed(2);
                    Data.VoltageAvg=(parsedData[12]*1).toFixed(2);
                    Data.voltagePhaseR=(parsedData[13]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[14]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[15]*1).toFixed(2);
                    Data.activeCurrent=(parsedData[16]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[17]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[18]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[19]*1).toFixed(2);
                    Data.frequency=(parsedData[20]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]/1000).toFixed(2);
                    Data.netActiveEnergy=Data.activeEnergyExport;
                    Data.apparentEnergyExport=(parsedData[22]/1000).toFixed(2);
                    Data.netApparentEnergy=Data.apparentEnergyExport;

                }
                else{
                    return "Conflict";
                }
            break;

            case 182:       //Schnieder EM6433H

                parametersCount=6;

                if(dataLength==12)     //Schnieder EM6433H 16-Bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m+1],data[m]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    Data.currentPhaseR=(parsedData[1]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[2]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[3]*1).toFixed(2);
                    //Data.currentNeutral=(parsedData[6]*1).toFixed(2);
                    Data.activeCurrent=(parsedData[4]*1).toFixed(2);
                    // Data.activePowerPhaseR=(parsedData[8]*1).toFixed(2);
                    // Data.activePowerPhaseY=(parsedData[9]*1).toFixed(2);
                    // Data.activePowerPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.activePower=(parsedData[5]*1).toFixed(2);
                    // Data.reactivePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    // Data.reactivePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    // Data.reactivePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    // Data.reactivePower=(parsedData[15]*1).toFixed(2);
                    // Data.apparantPowerPhaseR=(parsedData[16]*1).toFixed(2);
                    // Data.apparantPowerPhaseY=(parsedData[17]*1).toFixed(2);
                    // Data.apparantPowerPhaseB=(parsedData[18]*1).toFixed(2);
                    // Data.apparantPower=(parsedData[19]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[0]*1).toFixed(2);
                    Data.netActiveEnergy=(Data.activeEnergyExport).toFixed(2);
                    // Data.reactiveEnergyExport=(parsedData[1]*1).toFixed(2);
                    // Data.netReactiveEnergy=(Data.reactiveEnergyExport).toFixed(2);
                    // Data.apparentEnergyExport=(parsedData[2]*1).toFixed(2);
                    // Data.netApparentEnergy=(Data.apparentEnergyExport).toFixed(2);

                }
                else{
                    return "Conflict";
                }
            break;

            case 183:       // Elite 445

                parametersCount=28;

                if(dataLength==56) // 16 bit
                {
                    for(let i=0,m=0; i<parametersCount;i++){

                        parsedData[i]=HexToFloat32(data[m],data[m+1]);
                        m+=2;
                    }
                
                    //Merter data object to save in database
                    //Data.temperature=(parsedData[]).toFixed(2);
                    Data.voltagePhaseR=(parsedData[0]*1).toFixed(2);
                    Data.voltagePhaseY=(parsedData[1]*1).toFixed(2);
                    Data.voltagePhaseB=(parsedData[2]*1).toFixed(2);
                    Data.VoltageAvg=(parsedData[3]*1).toFixed(2);
                    Data.currentPhaseR=(parsedData[4]*1).toFixed(2);
                    Data.currentPhaseY=(parsedData[5]*1).toFixed(2);
                    Data.currentPhaseB=(parsedData[6]*1).toFixed(2);
                    Data.currentNeutral=(parsedData[7]*1).toFixed(2);
                    Data.activeCurrent=add(Data.currentPhaseR,Data.currentPhaseY,Data.currentPhaseB);
                    Data.activePowerPhaseR=(parsedData[12]*1).toFixed(2);
                    Data.activePowerPhaseY=(parsedData[13]*1).toFixed(2);
                    Data.activePowerPhaseB=(parsedData[14]*1).toFixed(2);
                    Data.activePower=add(Data.activePowerPhaseR,Data.activePowerPhaseY,Data.activePowerPhaseB);
                    Data.reactivePowerPhaseR=(parsedData[15]*1).toFixed(2);
                    Data.reactivePowerPhaseY=(parsedData[16]*1).toFixed(2);
                    Data.reactivePowerPhaseB=(parsedData[17]*1).toFixed(2);
                    Data.reactivePower=add(Data.reactivePowerPhaseR,Data.reactivePowerPhaseY,Data.reactivePowerPhaseB);
                    //Data.apparantPowerPhaseR=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseY=(parsedData[]).toFixed(2);
                    //Data.apparantPowerPhaseB=(parsedData[]).toFixed(2);
                    Data.apparantPower=(parsedData[18]*1).toFixed(2);
                    Data.powerFactorPhaseR=(parsedData[8]*1).toFixed(2);
                    Data.powerFactorPhaseY=(parsedData[9]*1).toFixed(2);
                    Data.powerFactorPhaseB=(parsedData[10]*1).toFixed(2);
                    Data.powerFactor=(parsedData[11]*1).toFixed(2);
                    Data.frequency=(parsedData[19]*1).toFixed(2);
                    Data.activeEnergyImport=(parsedData[20]*1).toFixed(2);
                    Data.activeEnergyExport=(parsedData[21]*1).toFixed(2);
                    Data.netActiveEnergy=((Data.activeEnergyImport-Data.activeEnergyExport).toFixed(2));
                    Data.reactiveEnergyImport=((parsedData[22]*1)+(parsedData[24]*1)).toFixed(2);
                    Data.reactiveEnergyExport=((parsedData[23]*1)+(parsedData[25]*1)).toFixed(2);
                    Data.netReactiveEnergy=((Data.reactiveEnergyImport-Data.reactiveEnergyExport).toFixed(2));
                    Data.apparentEnergyImport=(parsedData[26]*1).toFixed(2);
                    Data.apparentEnergyExport=(parsedData[27]*1).toFixed(2);
                    Data.netApparentEnergy=((Data.apparentEnergyImport-Data.apparentEnergyExport).toFixed(2));

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
            console.log(err)
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

//Sync Meter service
exports.syncMeter = async(data)=>{

    //Initialize mongoose object for Database
    const Data = new Meter({
        timestamp:data.timestamp,
        loggerNo:data.loggerNo,
        plantId:data.plantId,
        deviceType:data.deviceType,
        deviceNo:data.deviceNo,
        errorFlag:data.errorFlag,
        solutionFlag:data.solutionFlag
    });

    if(Data.errorFlag==0){
        
        //Merter data object to save in database
        Data.temperature=(data.temperature);
        Data.voltagePhaseR=(data.voltagePhaseR);
        Data.voltagePhaseY=(data.voltagePhaseY);
        Data.voltagePhaseB=(data.voltagePhaseB);
        Data.VoltageAvg=(data.VoltageAvg);
        Data.currentPhaseR=(data.currentPhaseR);
        Data.currentPhaseY=(data.currentPhaseY);
        Data.currentPhaseB=(data.currentPhaseB);
        Data.currentNeutral=(data.currentNeutral);
        Data.activeCurrent=(data.activeCurrent);
        Data.activePowerPhaseR=(data.activePowerPhaseR);
        Data.activePowerPhaseY=(data.activePowerPhaseY);
        Data.activePowerPhaseB=(data.activePowerPhaseB);
        Data.activePower=(data.activePower);
        Data.reactivePowerPhaseR=(data.reactivePowerPhaseR);
        Data.reactivePowerPhaseY=(data.reactivePowerPhaseY);
        Data.reactivePowerPhaseB=(data.reactivePowerPhaseB);
        Data.reactivePower=(data.reactivePower);
        Data.apparantPowerPhaseR=(data.apparantPowerPhaseR);
        Data.apparantPowerPhaseY=(data.apparantPowerPhaseY);
        Data.apparantPowerPhaseB=(data.apparantPowerPhaseB);
        Data.apparantPower=(data.apparantPower);
        Data.powerFactorPhaseR=(data.powerFactorPhaseR);
        Data.powerFactorPhaseY=(data.powerFactorPhaseY);
        Data.powerFactorPhaseB=(data.powerFactorPhaseB);
        Data.powerFactor=(data.powerFactor);
        Data.frequency=(data.frequency);
        Data.activeEnergyImport=(data.activeEnergyImport);
        Data.activeEnergyExport=(data.activeEnergyExport);
        Data.netActiveEnergy=(data.netActiveEnergy);
        Data.reactiveEnergyImport=(data.reactiveEnergyImport);
        Data.reactiveEnergyExport=(data.reactiveEnergyExport);
        Data.netReactiveEnergy=(data.netReactiveEnergy);
        Data.apparentEnergyImport=(data.apparentEnergyImport);
        Data.apparentEnergyExport=(data.apparentEnergyExport);
        Data.netApparentEnergy=(data.netApparentEnergy);

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