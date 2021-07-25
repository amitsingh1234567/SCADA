const express = require('express');
const router = express.Router();

const Login = require('../controllers/login');
const UserProfile = require('../controllers/userProfileController');

router.use("/login", Login.login);
router.use("/profile", UserProfile.userProfile);

module.exports=router;