const express = require('express');
const router = express.Router();

const NavbarController = require('../controllers/navbarController');

router.use("/card", NavbarController.navbarCardController);

module.exports=router;