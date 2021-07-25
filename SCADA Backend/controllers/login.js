const { User } = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login= async(req,res,next)=>{
    User.findOne({username: req.body.username})
    .then(user=>{
        if(!user){
            return res.status(401).json({
                status: false,
                message: "Invalid Credentials, Please try again!"
            });
        }
        bcrypt.compare(req.body.password, user.password)
        .then(result=>{
            if(!result){
                return res.status(401).json({
                    status: false,
                    message: "Invalid Credentials, Please try again!"
                });
            }
            else{
                const token = jwt.sign({id: user._id, username: user.username, plantId: user.plantId}, 'secret', {expiresIn:'12h'});

                let plantIds = user.plants.id.split(",");
                let plantId = parseInt(plantIds[0])*parseInt(plantIds[0]);

                res.status(200).json({
                    status: true,
                    message: "Log In Successfully",
                    token: token,
                    username: user.username,
                    siteId: plantId,
                    expiresIn: 43200
                });
            }
        })
    })
    .catch(err =>{
        return res.status(401).json({
            message: "Authentication Failed"
        });
    });
};