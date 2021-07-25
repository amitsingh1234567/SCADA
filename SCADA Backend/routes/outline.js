const express = require('express');
const router = express.Router();

const overviewController = require('../controllers/overviewController');
const myProfileController = require('../controllers/myProfileController');

router.use("/overview/cards", overviewController.overviewCardController);
router.use("/overview/sites", overviewController.overviewSiteController);

router.use("/myprofile/cards", myProfileController.myProfileCardController);
router.use("/myprofile/sites", myProfileController.myProfileSiteController);

module.exports=router;