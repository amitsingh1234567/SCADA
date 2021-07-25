const express = require('express');
const router = express.Router();
const insertData = require('../controllers/insertdata');

//Route to insert raw Data
router.get('/stringInverter/InsertData.php?', insertData.getData);
router.post('/stringInverter/InsertData.php?', insertData.getData);
router.get('/wms/InsertData.php?', insertData.getData);
router.post('/wms/InsertData.php?', insertData.getData);
router.get('/meter/InsertData.php?', insertData.getData);
router.post('/meter/InsertData.php?', insertData.getData);

router.get('/InsertData', insertData.getData);
router.post('/InsertData', insertData.getData);

module.exports=router;