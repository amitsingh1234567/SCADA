const express = require('express');
const router = express.Router();

const InformationController = require('../controllers/informationController');

router.use("/card", InformationController.informationCardController);
router.use("/profile", InformationController.informationProfileController);

module.exports=router;