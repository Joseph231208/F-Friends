const jwt = require('jsonwebtoken')

function TokenCheck(req, res, next) {
    
    if (!req.body.token) {
        return res.status(401).json({ error: "Нет токена"})
    }

    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
        req.body.token = decoded
        next()
    } catch (err) {
        return res.status(403).json({ error: "Неверный токен" })
    }
}


module.exports = {
    TokenCheck
};