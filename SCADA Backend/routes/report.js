const express = require('express');
const router = express.Router();

const ReportController = require('../controllers/reportController');

router.use("/daily", ReportController.reportDailyController);
router.use("/duration", ReportController.reportDurationController);

router.use("/dailyemailreport", ReportController.emailReportDailyController);
module.exports=router;