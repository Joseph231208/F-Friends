const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Chats = require('../models/Chats')
const Posts = require('../models/Posts')

const jwt = require('jsonwebtoken')

function TokenCheck(req, res, next) {
    if (!req.body.token) {
        return res.status(401).json({ error: "Нет токена"})
    }

    try {
        const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET)
        req.body.token = decoded
        next()
    } catch {
        return res.status(403).json({ error: "Неверный токен" })
    }
}

function lengthCheck(x ,length) {
    let check = x.replaceAll(' ','')
    if (x.length > length || x.length == 0 || check.length == 0){
        return false
    } else { return true }
}

router.post('/createpost', TokenCheck, async (req, res) => {
    console.log('trying')
    let error = {
        success: false,
        title_error: '',
        text_error: ''
    }
    const post = new Posts ({
        author: req.body.token.id,
        title: req.body.title,
        text: req.body.text
    })
    if (!lengthCheck(req.body.title, 40)){
        error.title_error = "Your title cannot be this way"
    }
    if (!lengthCheck(req.body.text, 200)){
        error.text_error = "Your text cannot be this way"
    }
    if (error.title_error == '' && error.text_error == ''){
        await post.save
        error.success = true
    }
    res.json(error)
})

module.exports = router