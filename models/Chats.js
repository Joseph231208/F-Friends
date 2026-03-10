const mongoose = require('mongoose')

const Chats = new mongoose.Schema({
    first_user: String,
    second_user: String,
    last_update: String,
    messages: [
        {
            text: String,
            author: String,
            send_date: String,
            status: String,
        }
    ],
    first_user_status: String,
    second_user_status: String,
})

module.exports = mongoose.model('Chats', Chats)