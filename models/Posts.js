const mongoose = require('mongoose')

const PostsSchema = new mongoose.Schema({
    authorid: { type: String },
    authorname: { type: String },
    bd: { type: String },
    title: { 
        type: String, 
        required: [true, 'Title is required'],
        maxlength: [60, 'Your title cannot be this way'] 
    },
    text: { 
        type: String, 
        required: [true, 'Text is required'],
        maxlength: [1500, 'Your text cannot be this way'] 
    },
    liked: [String],
    dislikes: [String],
    comments: [
        {
            authorid: String,
            authorname: String,
            text: {
                type: String,
                maxlength: [1500, 'Your text cannot be this way'] 
            },
            likes: [String],
            dislikes: [String]
        }
    ]
})

module.exports = mongoose.model('Posts', PostsSchema)