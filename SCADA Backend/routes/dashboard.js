const express = require('express');
const router = express.Router();

const DashboardController = require('../controllers/dashboardController');

router.use("/card", DashboardController.dashboardCardController);
router.use("/status", DashboardController.dashboardSiteLevelStatusController);
router.use("/curve", DashboardController.dashboardCurveController);

module.exports=router;