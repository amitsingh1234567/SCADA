const express = require('express');
const router = express.Router();

router.use((req,res)=>{
return res.status(404).send("Page Not Fond");
});

module.exports=router;