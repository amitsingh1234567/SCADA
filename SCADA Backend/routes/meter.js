const express = require('express');
const router = express.Router();

const Meter = require('../controllers/meterController');

router.use("/Card", Meter.meterCardController);
router.use("/Curve", Meter.meterCurveController);
router.use("/Parameter", Meter.meterParameterController);

module.exports=router;