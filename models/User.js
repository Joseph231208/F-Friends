const mongoose = require('mongoose')

const Users = new mongoose.Schema({
    name: String,
    email: String,
    bd: String,
    password: String,
    friends: [
        {
            friendId: String,
            status: String
        }
    ],
    activeGroups: [String]
})

module.exports = mongoose.model('User', Users);