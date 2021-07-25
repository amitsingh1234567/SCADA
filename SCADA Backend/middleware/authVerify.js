const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, 'secret', (err, tokendata) => {
            if (err) {
                return res.status(400).json({ msg: 'Unauthorized request' });
            }
            if (tokendata) {
                req.data = tokendata;
                next();
            }
        })
    } catch (error) {
        res.status(401).json({ msg: 'Authentication Failed' });
    }
}