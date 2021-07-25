const NavbarService=require('../services/navbarService');

exports.navbarCardController = (req,res,next)=>{
    NavbarService.navbarCardService(req.query.username,req.query.siteid)
    .then((response)=>{
        if(!response.status){
            throw new Error(response.message); 
        }     
        res.status(200).json({
            message: true,
            response: response.response
        })
    })
    .catch((err)=>{
        console.log(err);
        res.status(401).json({
            status: false,
            message: err.message
        });
    });
}