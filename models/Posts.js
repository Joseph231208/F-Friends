const mongoose = require('mongoose')

const Posts = new mongoose.Schema({
    author: String,
    title: String,
    text: String,
    liked: [
        {
            author: String
        }
    ],
    dislikes: [
        {
            author: String
        }
    ],
    comments: [
        {
            author: String,
            text: String,
            likes: Number,
            dislikes: Number
        }
    ]
})

module.exports = mongoose.model('Posts', Posts)