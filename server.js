const express = require('express')
const app = express()
const mongoose = require('mongoose')
const enterAccount = require('./routes/enter_account')
const enterUser = require('./routes/enter_user')
const changeUser = require('./routes/change_user')
const friendsRout = require('./routes/friends')
const user_chats = require('./routes/user_chat')
const posts = require('./routes/posts')

const jwt = require('jsonwebtoken')
const User = require('./models/User')

require('dotenv').config();

app.use(express.json());
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/mydatabase')
    .then(() => {
        console.log('MongoDB подключена')
    })
    .catch((err) => {
        console.log("Ошибка подключения: ", err)
    })

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/main/main.html')
})

app.post('/main_info', TokenCheck, async (req, res) => {
    let y = await User.findOne({ _id: req.body.token.id })
    res.json({
        name: y.name,
        id: req.body.token.id
    })
})

app.get('/user/:id', (req,res) => {
    res.sendFile(__dirname + '/public/user/user.html')
})

app.get('/active/:id', (req, res) => {
    res.sendFile(__dirname + '/public/chats/chat.html')
})

app.use('/posts', posts)
app.use('/enterapi', enterAccount)
app.use('/profileapi', enterUser)
app.use('/changeapi', TokenCheck, changeUser)
app.use('/sendreq', TokenCheck, friendsRout)
app.use('/chat', user_chats)

const PORT = 80

app.listen(PORT, () => {
    console.log('Server is working on http://localhost')
})

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