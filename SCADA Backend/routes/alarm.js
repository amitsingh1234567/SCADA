const express = require('express');
const router = express.Router();

const AlarmController = require('../controllers/alarmController');

router.use("/notification", AlarmController.alarmNotificationController);
router.use("/detail", AlarmController.alarmDetailController);

module.exports=router;