const express = require('express');
const router = express.Router();

const TimestampController = require('../controllers/timestampController');

router.use("/sync", TimestampController.timestampController);

module.exports=router;