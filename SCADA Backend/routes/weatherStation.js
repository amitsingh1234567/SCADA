const express = require('express');
const router = express.Router();

const WeatherStation = require('../controllers/weatherStationController');

router.use("/card", WeatherStation.weatherStationCardController);
router.use("/curve", WeatherStation.weatherStationCurveController);

module.exports=router;