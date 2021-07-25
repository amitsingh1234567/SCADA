const url = require('url');
const reportService=require('../services/reportService');
const Excel = require('exceljs');

exports.reportDailyController = (req,res,next)=>{
    reportService.reportDailyService(req.query.username,req.query.siteid,req.query.device,req.query.timestamp)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        // res.status(200).json({
        //     message: true,
        //     response: response.response
        // })
        let workbook = new Excel.Workbook();
        workbook =  response.response;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + 'holmium_report.xlsx');
      workbook.xlsx.write(res);
     
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        });
    });
}

exports.reportDurationController = (req,res,next)=>{
    reportService.reportDurationService(req.query.username,req.query.siteid,req.query.timestamp1,req.query.timestamp2)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        // res.status(200).json({
        //     message: true,
        //     response: response.response
        // })
        let workbook = new Excel.Workbook();
        workbook =  response.response;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + 'holmium_report.xlsx');
      workbook.xlsx.write(res);
     
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        });
    });
}

exports.emailReportDailyController = (req,res,next)=>{
    reportService.emailReportDailyService(req.query.username,req.query.siteid,req.query.timestamp, req.query.emailid)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        res.status(200).json({
            message: true,
            response: response.response
        });
    //     let workbook = new Excel.Workbook();
    //     workbook =  response.response;
    //     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //     res.setHeader("Content-Disposition", "attachment; filename=" + 'holmium_report.xlsx');
    //   workbook.xlsx.write(res);
     
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        });
    });
}