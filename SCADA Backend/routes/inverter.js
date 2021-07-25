const express = require('express');
const router = express.Router();

const Inverter = require('../controllers/inverterController');

router.use("/stringInverterCard", Inverter.stringInverterCardController);
router.use("/stringInverterCurve", Inverter.stringInverterCurveController);
router.use("/stringInverterParameter", Inverter.stringInverterParameterController);

router.use("/centralizedInverterCard", Inverter.centralizedInverterCardController);
router.use("/centralizedInverterCurve", Inverter.centralizedInverterCurveController);
router.use("/centralizedInverterParameter", Inverter.centralizedInverterParameterController);

module.exports=router;