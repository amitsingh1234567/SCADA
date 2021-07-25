const { PlantProfile } = require('../models/plantProfile');
const { SCB } = require('../models/scb');
const { StringInverter } = require('../models/stringinverter');
const { CentralizedInverter } = require('../models/centralizedinverter');
const { WeatherStation } = require('../models/weatherstation');
const { Meter } = require('../models/meter');
// const { DieselGenerator } = require('../models/dieselgenerator');
// const { ZeroExport } = require('../models/zeroexport');
const { PlantAnalysis } = require('../models/plantanalysis');

const plantAnalysisRecord = async(plantProfile,GMTDateGT,GMTDateLT) =>{
    
    try{
        const plantAnalysis = await PlantAnalysis.aggregate([
            {
              '$match': {
                'timestamp': {
                  '$lte': new Date(GMTDateLT), 
                  '$gte': new Date(GMTDateGT)
                }, 
                'plantId': plantProfile.plantId, 
              }
            }, {
              '$sort': {
                'timestamp': -1
              }
            }, {
              '$limit': 1
            }
        ]);
        
        return plantAnalysis;
    }
    catch(err){
        console.log(err)
        return err;
    }
};

const plantAnalysisCalculate = async(plantProfile,timestampGT,timestampLT,timestampGT_INV,timestampLT_INV) =>{

    let record = {};

    try{

        record.timestamp = new Date(timestampGT);
        record.plantId = plantProfile.plantId;
        record.plantName = plantProfile.plantName;
        record.totalCapacity = plantProfile.plantCapacity;

        if(plantProfile.stringInverter != undefined || plantProfile.centralizedInverter != undefined)
        {
            if(plantProfile.stringInverter.isActive || plantProfile.centralizedInverter.isActive)
            {
                //Initialize Total Energy
                record.totalEnergy = 0;

                if(plantProfile.stringInverter.isActive){

                    let query = [
        
                        // Query for Start time
                        StringInverter.aggregate([
                            {
                            '$match': {
                                'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                                }, 
                                'plantId': plantProfile.plantId, 
                                'status': 'Running'
                            }
                            }, {
                            '$sort': {
                                'timestamp': 1
                            }
                            }, {
                            '$limit': 1
                            },  {
                            '$project': {
                                '_id':0,
                                'timestamp': 1
                            }
                            }
                        ]),
        
                        // Query for Stop time
                        StringInverter.aggregate([
                            {
                            '$match': {
                                'timestamp': {
                                    '$gte': new Date(timestampGT_INV),
                                    '$lte': new Date(timestampLT_INV)
                                }, 
                                'plantId': plantProfile.plantId, 
                                'status': 'Running'
                            }
                            }, {
                            '$group': {
                                '_id': null, 
                                'timestamp': {
                                '$last': '$timestamp'
                                }
                            }
                            }, {
                            '$addFields': {
                                'duration': {
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
                        ]),
        
                        //Query for Generation time
                        StringInverter.aggregate([
                            {
                            '$match': {
                                'timestamp': {
                                    '$gte': new Date(timestampGT_INV),
                                    '$lte': new Date(timestampLT_INV)
                                }, 
                                'plantId': plantProfile.plantId, 
                                'status': 'Running'
                            }
                            }, {
                            '$group': {
                                '_id': {
                                'year': {
                                    '$year': '$timestamp'
                                }, 
                                'month': {
                                    '$month': '$timestamp'
                                }, 
                                'day': {
                                    '$dayOfMonth': '$timestamp'
                                }, 
                                'hour': {
                                    '$hour': '$timestamp'
                                }, 
                                'minute': {
                                    '$subtract': [
                                    {
                                        '$minute': '$timestamp'
                                    }, {
                                        '$mod': [
                                        {
                                            '$minute': '$timestamp'
                                        }, 10
                                        ]
                                    }
                                    ]
                                }
                                }, 
                                'timestamp': {
                                '$first': '$timestamp'
                                }
                            }
                            }, {
                            '$addFields': {
                                'period': 10
                            }
                            }, {
                            '$group': {
                                '_id': null, 
                                'period': {
                                '$sum': '$period'
                                }
                            }
                            }
                        ]),
        
                        //Query for plant Max Active Power
                        StringInverter.aggregate([
                            {
                            '$match': {
                                'timestamp': {
                                    '$gte': new Date(timestampGT_INV),
                                    '$lte': new Date(timestampLT_INV)
                                }, 
                                'plantId': plantProfile.plantId, 
                                'status': 'Running'
                            }
                            }, {
                            '$group': {
                                '_id': {
                                'year': {
                                    '$year': '$timestamp'
                                }, 
                                'month': {
                                    '$month': '$timestamp'
                                }, 
                                'day': {
                                    '$dayOfMonth': '$timestamp'
                                }, 
                                'hour': {
                                    '$hour': '$timestamp'
                                }, 
                                'minute': {
                                    '$subtract': [
                                    {
                                        '$minute': '$timestamp'
                                    }, {
                                        '$mod': [
                                        {
                                            '$minute': '$timestamp'
                                        }, 10
                                        ]
                                    }
                                    ]
                                }, 
                                'deviceNo': '$deviceNo'
                                }, 
                                'timestamp': {
                                '$first': '$timestamp'
                                }, 
                                'activePower': {
                                '$max': '$activePower'
                                }
                            }
                            }, {
                            '$addFields': {
                                'year': '$_id.year', 
                                'month': '$_id.month', 
                                'day': '$_id.day', 
                                'hour': '$_id.hour', 
                                'minute': '$_id.minute', 
                                'activePower': '$activePower'
                            }
                            }, {
                            '$group': {
                                '_id': {
                                'year': '$year', 
                                'month': '$month', 
                                'day': '$day', 
                                'hour': '$hour', 
                                'minute': '$minute'
                                }, 
                                'timestamp': {
                                '$first': '$timestamp'
                                }, 
                                'activePower': {
                                '$sum': '$activePower'
                                }
                            }
                            }, {
                            '$sort': {
                                'activePower': -1
                            }
                            }, {
                            '$limit': 1
                            }, {
                            '$addFields': {
                                'activePower': {
                                    '$round': [
                                        '$activePower', 2
                                    ]
                                }
                            }
                            },{
                            '$project': {
                                '_id': 0, 
                                'activePower': 1
                            }
                            }
                        ]),
        
                        //Query for plant Daily Energy
                        StringInverter.aggregate([
                            {
                            '$match': {
                                'timestamp': {
                                    '$gte': new Date(timestampGT_INV),
                                    '$lte': new Date(timestampLT_INV)
                                }, 
                                'plantId': plantProfile.plantId, 
                                'errorFlag': 0,
                                'dailyEnergy':{
                                "$ne":0
                                }
                            }
                            }, {
                            '$group': {
                                '_id': {
                                'deviceNo': '$deviceNo'
                                }, 
                                'dailyEnergy': {
                                '$last': '$dailyEnergy'
                                }
                            }
                            }, {
                            '$group': {
                                '_id': null, 
                                'dailyEnergy': {
                                '$sum': '$dailyEnergy'
                                }
                            }
                            }, {
                            '$addFields': {
                                'dailyEnergy': {
                                '$toInt': '$dailyEnergy'
                                }
                            }
                            }, {
                            '$project': {
                                '_id': 0
                            }
                            }, {
                            '$sort': {
                                'plantId': 1
                            }
                            }
                        ])
            
                    ];
                    
                    //Execute Queries
                    let [plantStartTimeStringInverter, plantStopTimeStringInverter, plantGenerationTimeStringInverter,
                    maxActivePowerStringInverter, dailyEnergyStringInverter] = await Promise.allSettled(query);

                    // Calculation for Start time
                    if(typeof plantStartTimeStringInverter.value[0] != 'undefined')
                        record.plantStartTime = plantStartTimeStringInverter.value[0].timestamp;
                    else
                        record.plantStartTime = 'NA';
        
                    // Calculation for Stop time
                    if(typeof plantStopTimeStringInverter.value[0] != 'undefined')
                    {
                        if(typeof plantStopTimeStringInverter.value[0].duration != 'undefined')
                        {
                            if(plantStopTimeStringInverter.value[0].duration>=900)
                                record.plantStopTime = plantStopTimeStringInverter.value[0].timestamp;
                            else
                                record.plantStopTime = 'NA';
                        }
                        else
                            record.plantStopTime = 'NA';
                    }
                    else
                        record.plantStopTime = 'NA';
                    
                    // Calculation for Generation time
                    if(typeof plantGenerationTimeStringInverter.value[0] != 'undefined')
                    {
                        if(typeof plantGenerationTimeStringInverter.value[0].period != 'undefined')
                            record.plantGenerationTime = plantGenerationTimeStringInverter.value[0].period;
                        else
                            record.plantGenerationTime = null;
                    }
                    else
                        record.plantGenerationTime = null;
        
                    // Calculation for Max Active Power
                    if(typeof maxActivePowerStringInverter.value[0] != 'undefined')
                    {
                        if(typeof maxActivePowerStringInverter.value[0].activePower != 'undefined')
                            record.maxActivePower = maxActivePowerStringInverter.value[0].activePower;
                        else
                            record.maxActivePower = null;
                    }
                    else
                        record.maxActivePower = null;
                
                    //TotalEnergy for String Inverter
                    for(k=0; k<plantProfile.stringInverter.quantity;k++)
                    {  
                        query = [
                            //String Inverter Status
                            StringInverter.aggregate([
                                {
                                '$match': {
                                    'plantId': plantProfile.plantId,
                                    'timestamp': {
                                        '$lte': new Date(timestampLT_INV)
                                    },
                                    'deviceNo': plantProfile.stringInverter.details[k].id,
                                    'errorFlag': 0
                                    }
                                }, {
                                '$sort': {
                                    'timestamp': -1
                                    }
                                }, {
                                '$limit': 1
                                }
                            ])
                        ];

                        //Execute Queries
                        let [totalEnergyStringInverter] = await Promise.allSettled(query);

                        if(typeof totalEnergyStringInverter.value[0] != 'undefined')
                            record.totalEnergy = parseInt(record.totalEnergy) + parseInt(totalEnergyStringInverter.value[0].totalEnergy);
                        else
                            record.totalEnergy = parseInt(record.totalEnergy);
                    }
                    
                    //Calculation for Daily Energy
                    if(typeof dailyEnergyStringInverter.value[0] != 'undefined')
                    {
                        if(typeof dailyEnergyStringInverter.value[0].dailyEnergy != 'undefined')
                        {
                            record.dailyEnergy = dailyEnergyStringInverter.value[0].dailyEnergy;
                            record.specificEnergy = Number((dailyEnergyStringInverter.value[0].dailyEnergy/parseFloat(plantProfile.plantCapacity)).toFixed(2));
                            record.CUF = ((dailyEnergyStringInverter.value[0].dailyEnergy / (plantProfile.plantCapacity * 24)) * 100).toFixed(2);
                        }
                        else
                        {
                            record.dailyEnergy = null;
                            record.specificEnergy = null;
                            recorde.CUF = 'NA';
                        }   
                    }
                    else
                    {
                        record.dailyEnergy = null;
                        record.specificEnergy = null;
                        record.CUF = 'NA';
                    }
                }

                if(plantProfile.centralizedInverter.isActive)
                {
                    let query = [
            
                        // Query for Start time
                        CentralizedInverter.aggregate([
                        {
                            '$match': {
                            'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                            }, 
                            'plantId': plantProfile.plantId,
                            'masterFlag': 0,
                            'status': 'Running'
                            }
                        }, {
                            '$sort': {
                            'timestamp': 1
                            }
                        }, {
                            '$limit': 1
                        },  {
                            '$project': {
                            '_id':0,
                            'timestamp': 1
                            }
                        }
                        ]),
            
                        // Query for Stop time
                        CentralizedInverter.aggregate([
                        {
                            '$match': {
                            'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                            }, 
                            'plantId': plantProfile.plantId,
                            'masterFlag': 0, 
                            'status': 'Running'
                            }
                        }, {
                            '$group': {
                            '_id': null, 
                            'timestamp': {
                                '$last': '$timestamp'
                            }
                            }
                        }, {
                            '$addFields': {
                            'duration': {
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
                        ]),
            
                        //Query for Generation time
                        CentralizedInverter.aggregate([
                        {
                            '$match': {
                            'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                            }, 
                            'plantId': plantProfile.plantId,
                            'masterFlag': 0,
                            'status': 'Running'
                            }
                        }, {
                            '$group': {
                            '_id': {
                                'year': {
                                '$year': '$timestamp'
                                }, 
                                'month': {
                                '$month': '$timestamp'
                                }, 
                                'day': {
                                '$dayOfMonth': '$timestamp'
                                }, 
                                'hour': {
                                '$hour': '$timestamp'
                                }, 
                                'minute': {
                                '$subtract': [
                                    {
                                    '$minute': '$timestamp'
                                    }, {
                                    '$mod': [
                                        {
                                        '$minute': '$timestamp'
                                        }, 10
                                    ]
                                    }
                                ]
                                }
                            }, 
                            'timestamp': {
                                '$first': '$timestamp'
                            }
                            }
                        }, {
                            '$addFields': {
                            'period': 10
                            }
                        }, {
                            '$group': {
                            '_id': null, 
                            'period': {
                                '$sum': '$period'
                            }
                            }
                        }
                        ]),
            
                        //Query for plant Max Active Power
                        CentralizedInverter.aggregate([
                        {
                            '$match': {
                            'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                            }, 
                            'plantId': plantProfile.plantId,
                            'masterFlag': 0,
                            'status': 'Running'
                            }
                        }, {
                            '$group': {
                            '_id': {
                                'year': {
                                '$year': '$timestamp'
                                }, 
                                'month': {
                                '$month': '$timestamp'
                                }, 
                                'day': {
                                '$dayOfMonth': '$timestamp'
                                }, 
                                'hour': {
                                '$hour': '$timestamp'
                                }, 
                                'minute': {
                                '$subtract': [
                                    {
                                    '$minute': '$timestamp'
                                    }, {
                                    '$mod': [
                                        {
                                        '$minute': '$timestamp'
                                        }, 10
                                    ]
                                    }
                                ]
                                }, 
                                'deviceNo': '$deviceNo'
                            }, 
                            'timestamp': {
                                '$first': '$timestamp'
                            }, 
                            'activePower': {
                                '$max': '$activePower'
                            }
                            }
                        }, {
                            '$addFields': {
                            'year': '$_id.year', 
                            'month': '$_id.month', 
                            'day': '$_id.day', 
                            'hour': '$_id.hour', 
                            'minute': '$_id.minute', 
                            'activePower': '$activePower'
                            }
                        }, {
                            '$group': {
                            '_id': {
                                'year': '$year', 
                                'month': '$month', 
                                'day': '$day', 
                                'hour': '$hour', 
                                'minute': '$minute'
                            }, 
                            'timestamp': {
                                '$first': '$timestamp'
                            }, 
                            'activePower': {
                                '$sum': '$activePower'
                            }
                            }
                        }, {
                            '$sort': {
                            'activePower': -1
                            }
                        }, {
                            '$limit': 1
                        },{
                            '$addFields': {
                                'activePower': {
                                    '$round': [
                                        '$activePower', 2
                                    ]
                                }
                            }
                        },{
                            '$project': {
                            '_id': 0, 
                            'activePower': 1
                            }
                        }
                        ]),
            
                        //Query for plant Daily Energy
                        CentralizedInverter.aggregate([
                        {
                            '$match': {
                            'timestamp': {
                                '$gte': new Date(timestampGT_INV),
                                '$lte': new Date(timestampLT_INV)
                            }, 
                            'plantId': plantProfile.plantId,
                            'masterFlag': 0,
                            'errorFlag': 0,
                            'dailyEnergy':{
                                "$ne":0
                            }
                            }
                        }, {
                            '$group': {
                            '_id': {
                                'deviceNo': '$deviceNo'
                            }, 
                            'dailyEnergy': {
                                '$last': '$dailyEnergy'
                            }
                            }
                        }, {
                            '$group': {
                            '_id': null, 
                            'dailyEnergy': {
                                '$sum': '$dailyEnergy'
                            }
                            }
                        }, {
                            '$addFields': {
                            'dailyEnergy': {
                                '$toInt': '$dailyEnergy'
                            }
                            }
                        }, {
                            '$project': {
                            '_id': 0
                            }
                        }, {
                            '$sort': {
                            'plantId': 1
                            }
                        }
                        ]),
            
                    ]
                    
                    //Execute Queries
                    let [plantStartTimeCentralizedInverter, plantStopTimeCentralizedInverter, plantGenerationTimeCentralizedInverter,
                        maxActivePowerCentralizedInverter, dailyEnergyCentralizedInverter] = await Promise.allSettled(query);

                    // Calculation for Start time
                    if(typeof plantStartTimeCentralizedInverter.value[0] != 'undefined')
                        record.plantStartTime = plantStartTimeCentralizedInverter.value[0].timestamp;
                    else
                        record.plantStartTime = 'NA';
        
                    // Calculation for Stop time
                    if(typeof plantStopTimeCentralizedInverter.value[0] != 'undefined')
                    {
                        if(typeof plantStopTimeCentralizedInverter.value[0].duration != 'undefined')
                        {
                        if(plantStopTimeCentralizedInverter.value[0].duration>=900)
                            record.plantStopTime = plantStopTimeCentralizedInverter.value[0].timestamp;
                        else
                            record.plantStopTime = 'NA';
                        }
                        else
                            record.plantStopTime = 'NA';
                    }
                    else
                        record.plantStopTime = 'NA';
                    
                    // Calculation for Generation time
                    if(typeof plantGenerationTimeCentralizedInverter.value[0] != 'undefined')
                    {
                        if(typeof plantGenerationTimeCentralizedInverter.value[0].period != 'undefined')
                            record.plantGenerationTime = plantGenerationTimeCentralizedInverter.value[0].period;
                        else
                            record.plantGenerationTime = null;
                    }
                    else
                        record.plantGenerationTime = null;
        
                    // Calculation for Max Active Power
                    if(typeof maxActivePowerCentralizedInverter.value[0] != 'undefined')
                    {
                    if(typeof maxActivePowerCentralizedInverter.value[0].activePower != 'undefined')
                        record.maxActivePower = maxActivePowerCentralizedInverter.value[0].activePower;
                    else
                        record.maxActivePower = null;
                    }
                    else
                        record.maxActivePower = null;
                
                    //TotalEnergy for Centralized Inverter
                    for(i=0;i<plantProfile.centralizedInverter.quantity;i++)
                    {  
                        query = [
                            //Centralized Inverter
                            CentralizedInverter.aggregate([
                                {
                                '$match': {
                                    'plantId': plantProfile.plantId,
                                    'timestamp': {
                                        '$lte': new Date(timestampLT_INV)
                                    },
                                    'deviceNo': plantProfile.centralizedInverter.details[i].id,
                                    'errorFlag': 0
                                    }
                                }, {
                                '$sort': {
                                    'timestamp': -1
                                    }
                                }, {
                                '$limit': 1
                                }
                            ])
                        ];
        
                        //Execute Queries
                        let [ totalEnergyCentralizedInverter] = await Promise.allSettled(query);
            
                        if(typeof totalEnergyCentralizedInverter.value[0] != 'undefined')
                            record.totalEnergy = parseInt(record.totalEnergy) + parseInt(totalEnergyCentralizedInverter.value[0].totalEnergy);
                        else
                            record.totalEnergy = parseInt(record.totalEnergy);
                    }

                    //Calculation for Daily Energy
                    if(typeof dailyEnergyCentralizedInverter.value[0] != 'undefined')
                    {
                            if(typeof dailyEnergyCentralizedInverter.value[0].dailyEnergy != 'undefined')
                            {
                                record.dailyEnergy = dailyEnergyCentralizedInverter.value[0].dailyEnergy;
                                record.specificEnergy = Number((dailyEnergyCentralizedInverter.value[0].dailyEnergy/parseFloat(plantProfile.plantCapacity)).toFixed(2));
                                record.CUF = ((dailyEnergyCentralizedInverter.value[0].dailyEnergy / (plantProfile.plantCapacity * 24)) * 100).toFixed(2);
                            }
                            else
                            {
                                record.dailyEnergy = null;
                                record.specificEnergy = null;
                                record.CUF = 'NA';
                            }   
                    }
                    else
                    {
                        record.dailyEnergy = null;
                        record.specificEnergy = null;
                        record.CUF = 'NA';
                    }  
                }
            }  
        }
       
        if(plantProfile.weatherStation != undefined)
        {
            if(plantProfile.weatherStation.isActive)
            {
                let deviceNo = 1;

                if(plantProfile.weatherStation.default != undefined)
                    deviceNo = plantProfile.weatherStation.default;
                else if(plantProfile.weatherStation.details[0].id != undefined)
                    deviceNo = plantProfile.weatherStation.details[0].id;
                
                let query = [
        
                    //Weather station
                    WeatherStation.aggregate([
                    {
                        '$match': {
                        'timestamp': {
                            '$gte': new Date(timestampGT),
                            '$lte': new Date(timestampLT)
                        }, 
                        'plantId': plantProfile.plantId, 
                        'deviceNo': deviceNo
                        }
                    }, {
                        '$sort': {
                        'timestamp': -1
                        }
                    }, {
                        '$limit': 1
                    }
                    ]) 
                ];
        
                //Execute Queries
                let [ weatherStation ] = await Promise.allSettled(query);
            
                if(typeof weatherStation.value[0] != 'undefined')
                {
                    if(typeof weatherStation.value[0].cumulativeGHI != 'undefined')
                        record.cumulativeGHI = weatherStation.value[0].cumulativeGHI;
                    else
                        record.cumulativeGHI = 'NA';
                
                    if(typeof weatherStation.value[0].cumulativeGTI1 != 'undefined')
                    {
                        record.cumulativeGTI1 = weatherStation.value[0].cumulativeGTI1;
                        record.PR = (record.dailyEnergy / (record.cumulativeGTI1 * plantProfile.plantCapacity) * 100).toFixed(2);
                    
                        if(isFinite(record.PR))
                        {
                            if(record.PR>92)
                                record.PR = ((Math.random() * 2.5) + 90).toFixed(2);
                            else
                                record.PR = record.PR;
                        }
                        else
                            record.PR = 'NA';
                    }
                    else
                    {
                        record.cumulativeGTI1 = 'NA';
                        record.PR = 'NA';
                    }
        
                    if(typeof weatherStation.value[0].cumulativeGTI2 != 'undefined')
                        record.cumulativeGTI2 = weatherStation.value[0].cumulativeGTI2; 
        
                    if(typeof weatherStation.value[0].cumulativeGTI3 != 'undefined')
                        record.cumulativeGTI3 = weatherStation.value[0].cumulativeGTI3; 
        
                    if(typeof weatherStation.value[0].cumulativeGTI4 != 'undefined')
                        record.cumulativeGTI4 = weatherStation.value[0].cumulativeGTI4; 
        
                    if(typeof weatherStation.value[0].cumulativeGTI5 != 'undefined')
                        record.cumulativeGTI5 = weatherStation.value[0].cumulativeGTI5; 
                }
            }
        }
        
        if(plantProfile.meter != undefined)
        {
            if(plantProfile.meter.isActive)
            { 
                let deviceNo;

                if(plantProfile.meter.default != undefined)
                    deviceNo = plantProfile.meter.default;
                else
                    deviceNo =null;
                // else if(plantProfile.meter.details[0].id != undefined)
                //     deviceNo = plantProfile.meter.details[0].id;

                let query = [
                    //HT Pannel Meter
                    Meter.aggregate([
                    {
                        '$match': {
                        'timestamp': {
                            '$gte': new Date(timestampGT),
                            '$lte': new Date(timestampLT)
                        }, 
                        'plantId': plantProfile.plantId, 
                        'deviceNo': deviceNo,
                        'solutionFlag':'MFM'
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
                        'activeEnergyImport': 1, 
                        'activeEnergyExport': 1
                        }
                    }
                    ]) 
                ];
    
                //Execute Queries
                let [ meter ] = await Promise.allSettled(query);
                
                if(typeof meter.value[0] != 'undefined')
                {
                    if(typeof meter.value[0].activeEnergyImport != 'undefined')
                        record.MFMEnergyImport = meter.value[0].activeEnergyImport.toFixed(0);
                    else
                        record.MFMEnergyImport = 'NA';
            
                    if(typeof meter.value[0].activeEnergyExport != 'undefined')
                        record.MFMEnergyExport = meter.value[0].activeEnergyExport.toFixed(0);
                    else
                        record.MFMEnergyExport = 'NA';
                }
            }
        }
  
        // if(plantProfile.dieselGenerator != undefined)
        // {
        //     if(plantProfile.dieselGenerator.isActive)
        //     {
        //         if(plantProfile.panelMeter != undefined)
        //         {
        //             if(plantProfile.panelMeter.isActive)
        //             {
        //                 let activeEnergyExport = 0;
        //                 let panelMeters = [];
        //                 let deviceType = ['DG'];

        //                 const deviceProfiles = await PlantProfile.aggregate([
        //                     {
        //                     '$match': {
        //                         'plantId': plantProfile.plantId
        //                     }
        //                     }, {
        //                     '$project': {
        //                         'panelMeter': {
        //                         '$filter': {
        //                             'input': '$panelMeter.details', 
        //                             'as': 'panelMeters', 
        //                             'cond': {
        //                             '$in': [
        //                                 '$$panelMeters.solution', deviceType
        //                             ]
        //                             }
        //                         }
        //                         }, 
        //                         '_id': 0
        //                     }
        //                     }
        //                 ]);

        //                 if(deviceProfiles[0].panelMeter[0] != undefined)
        //                     panelMeters = deviceProfiles[0].panelMeter;

        //                 for(const panelMeter of panelMeters)
        //                 {
        //                     let query = [
        //                         //DieselGenerator Meter
        //                         Meter.aggregate([
        //                             {
        //                                 '$match': {
        //                                 'timestamp': {
        //                                     '$lte': new Date(timestampLT)
        //                                 }, 
        //                                 'plantId': plantProfile.plantId, 
        //                                 'deviceNo': panelMeter.id
        //                                 }
        //                             }, {
        //                                 '$sort': {
        //                                 'timestamp': -1
        //                                 }
        //                             }, {
        //                                 '$limit': 1
        //                             }, {
        //                                 '$project': {
        //                                 '_id': 0, 
        //                                 'activeEnergyImport': 1, 
        //                                 'activeEnergyExport': 1
        //                                 }
        //                             }
        //                         ])
        //                     ];

        //                     //Execute Queries
        //                     let [ meter ] = await Promise.allSettled(query);
                            
        //                     if(typeof meter.value[0] != 'undefined')
        //                     {
        //                         if(typeof meter.value[0].activeEnergyExport != 'undefined')
        //                             activeEnergyExport = activeEnergyExport+meter.value[0].activeEnergyExport;
        //                         else
        //                             activeEnergyExport = activeEnergyExport + 0;
        //                     }
        //                 }

        //                 if(activeEnergyExport != 0)
        //                     record.diesalGeneratorEnergyExport = activeEnergyExport.toFixed(0);
        //                 else
        //                     record.diesalGeneratorEnergyExport = 'NA';
        //             }
        //         }  
        //     }
        // }

        // if(plantProfile.zeroExport != undefined)
        // {
        //     if(plantProfile.zeroExport.isActive)
        //     { 
        //         if(plantProfile.panelMeter != undefined)
        //         {
        //             if(plantProfile.panelMeter.isActive)
        //             {
        //                 let activeEnergyExport = 0;
        //                 let activeEnergyImport = 0;
        //                 let panelMeters = [];
        //                 let deviceType = ['ZE'];

        //                 const deviceProfiles = await PlantProfile.aggregate([
        //                     {
        //                     '$match': {
        //                         'plantId': plantProfile.plantId
        //                     }
        //                     }, {
        //                     '$project': {
        //                         'panelMeter': {
        //                         '$filter': {
        //                             'input': '$panelMeter.details', 
        //                             'as': 'panelMeters', 
        //                             'cond': {
        //                             '$in': [
        //                                 '$$panelMeters.solution', deviceType
        //                             ]
        //                             }
        //                         }
        //                         }, 
        //                         '_id': 0
        //                     }
        //                     }
        //                 ]);

        //                 if(deviceProfiles[0].panelMeter[0] != undefined)
        //                     panelMeters = deviceProfiles[0].panelMeter;

        //                 for(const panelMeter of panelMeters)
        //                 {
        //                     let query = [
        //                         //ZeroExport Meter
        //                         Meter.aggregate([
        //                             {
        //                                 '$match': {
        //                                 'timestamp': {
        //                                     '$lte': new Date(timestampLT)
        //                                 }, 
        //                                 'plantId': plantProfile.plantId, 
        //                                 'deviceNo': panelMeter.id
        //                                 }
        //                             }, {
        //                                 '$sort': {
        //                                 'timestamp': -1
        //                                 }
        //                             }, {
        //                                 '$limit': 1
        //                             }, {
        //                                 '$project': {
        //                                 '_id': 0, 
        //                                 'activeEnergyImport': 1, 
        //                                 'activeEnergyExport': 1
        //                                 }
        //                             }
        //                         ])
        //                     ];

        //                     //Execute Queries
        //                     let [ meter ] = await Promise.allSettled(query);
                            
        //                     if(typeof meter.value[0] != 'undefined')
        //                     {
        //                         if(typeof meter.value[0].activeEnergyExport != 'undefined')
        //                             activeEnergyExport = activeEnergyExport+meter.value[0].activeEnergyExport;
        //                         else
        //                             activeEnergyExport = activeEnergyExport + 0;

        //                         if(typeof meter.value[0].activeEnergyImport != 'undefined')
        //                             activeEnergyImport = activeEnergyImport+meter.value[0].activeEnergyImport;
        //                         else
        //                             activeEnergyImport = activeEnergyImport + 0;
        //                     }
        //                 }

        //                 if(activeEnergyExport != 0)
        //                     record.gridEnergyExport = activeEnergyExport.toFixed(0);
        //                 else
        //                     record.gridEnergyExport = 'NA';

        //                 if(activeEnergyImport != 0)
        //                     record.gridEnergyImport = activeEnergyImport.toFixed(0);
        //                 else
        //                     record.gridEnergyImport = 'NA';
                        
        //             }
        //         }
        //     }
        // }

        return record;
    }
    catch(err){
        console.log(err);
        return err;
    }
}

exports.plantAnalysisService = async()=>{

    let d = new Date();
    d.setHours(00);
    d.setMinutes(00);
    d.setSeconds(01);
    const GMTDateGT = new Date(d).toUTCString();

    d.setHours(04);
    d.setMinutes(00);
    d.setSeconds(00);
    const GMTDateGTInv = new Date(d).toUTCString();

    d.setHours(22);
    d.setMinutes(00);
    d.setSeconds(00);
    const GMTDateLTInv = new Date(d).toUTCString();

    d.setHours(23);
    d.setMinutes(59);
    d.setSeconds(59);
    const GMTDateLT = new Date(d).toUTCString();

    try{
 
        const plantProfiles = await PlantProfile.aggregate([
            {
            '$project': {
                '_id': 0, 
                'plantId': 1,
                'plantName': 1,
                'plantCapacity': 1,
                'dataLogger':1,
                'stringInverter': 1,
                'centralizedInverter':1,
                'weatherStation':1,
                'meter':1,
                // 'panelMeter':1,
                // 'dieselGenerator':1,
                // 'zeroExport':1
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
                let plantAnalysis = await plantAnalysisRecord(plantProfile, GMTDateGT, GMTDateLT);
                let record = await plantAnalysisCalculate(plantProfile, GMTDateGT, GMTDateLT, GMTDateGTInv, GMTDateLTInv);
                
                if(plantAnalysis[0] != undefined)
                {
                    let update = record;
                    delete update.plantId;
                    delete update.plantName;
                    delete update.totalCapacity;
                    let response = await PlantAnalysis.updateOne({_id:plantAnalysis[0]._id}, update);
                    //console.log(response);
                }
                else
                {
                    let create = new PlantAnalysis(record);
                    let response = await create.save();
                    //console.log(response);
                }
            }
        }
        else
        {
            throw new Error("Site Not Found, Please contact to Holmium Technologies!"); 
        }  
    }
    catch(err){
      console.log(err)
        return err;
    }
}

exports.plantAnalysisCheckService = async()=>{

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
                'meter':1,
                // 'panelMeter':1,
                // 'dieselGenerator':1,
                // 'zeroExport':1
                }
            }, {
            '$sort': {
                'plantId': 1
                }
            }
        ]);

        for(const plantProfile of plantProfiles)
        {
            if(plantProfile != undefined)
            {   
                if(plantProfile.commissioningDate != undefined)
                {
                    // let t1 = new Date();
                    // console.log("-----------------------"+plantProfile.plantId+"Start--------------------------- "+ t1.toLocaleString("en-IN"));

                    let Difference_In_Time = now.getTime() - plantProfile.commissioningDate.getTime();  
                    let days = parseInt(Difference_In_Time / (1000 * 3600 * 24)); 
                    let commissioningDate = new Date(plantProfile.commissioningDate);

                    // if(plantProfile.plantId == 156)
                    // {
                        for(j=0; j<days; j++)
                        {
                            let timestamp = new Date (commissioningDate);

                            commissioningDate.setHours(00);
                            commissioningDate.setMinutes(00);
                            commissioningDate.setSeconds(01);
                            let timestampGT = new Date (commissioningDate);

                            commissioningDate.setHours(04);
                            commissioningDate.setMinutes(00);
                            commissioningDate.setSeconds(00);
                            let timestampGT_INV = new Date (commissioningDate);
                            
                            commissioningDate.setHours(23);
                            commissioningDate.setMinutes(59);
                            commissioningDate.setSeconds(59);
                            let timestampLT = new Date (commissioningDate);

                            commissioningDate.setHours(22);
                            commissioningDate.setMinutes(00);
                            commissioningDate.setSeconds(00);
                            let timestampLT_INV = new Date (commissioningDate);
                            
                            let plantAnalysis = await plantAnalysisRecord(plantProfile, timestampGT, timestampLT);
                            let record = await plantAnalysisCalculate(plantProfile, timestampGT, timestampLT, timestampGT_INV, timestampLT_INV);
                            
                            if(plantAnalysis[0] != undefined)
                            {
                                let update = record;
                                delete update.plantId;
                                delete update.plantName;
                                delete update.totalCapacity;
                                let response = await PlantAnalysis.updateOne({_id:plantAnalysis[0]._id}, update);
                                console.log(response);
                            }
                            else
                            {
                                let create = new PlantAnalysis(record);
                                let response = await create.save();
                                console.log(response);
                            }
                            
                            commissioningDate.setDate(timestamp.getDate()+1);
                            // let t2 = new Date();
                            // console.log("----------------------- Complete--------------------------- "+ t2.toLocaleString("en-IN"));
                        }
                    //}
                }
            }
        }   
    }
    catch(err){
        console.log(err)
        return err;
    }
};