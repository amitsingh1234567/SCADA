const express = require('express');
const router = express.Router();

const SCB = require('../controllers/scbController');

router.use("/card", SCB.SCBCardController);
router.use("/curve", SCB.SCBCurveController);
router.use("/status", SCB.SCBStatusController)

module.exports=router;