const express = require('express');
const router = express.Router();

const Site = require('../controllers/siteController');

router.use("/navigation", Site.siteNavigationController);
router.use("/devices", Site.siteDeviceController);

module.exports=router;