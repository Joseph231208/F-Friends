const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const Chats = require('../models/Chats.js')
const Posts = require('../models/Posts.js')
const { TokenCheck } = require('./auth.js');

const jwt = require('jsonwebtoken')

router.post('/Update_one', async (req, res) => {
    let post = await Posts.findOne({ _id: req.body.post_id })
    return res.json({ post })
})

router.post('/comment_edit', TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let c = x.comments.find(x => x.id == req.body.comment_id)
    if (c.authorid == req.body.token.id){

        await Posts.updateOne(
            { _id: req.body.post_id, "comments._id": req.body.comment_id },
            { $set: { "comments.$.text": req.body.text } }
        )
    }

    res.json({ message: "success" })
})

router.post('/react_to_comment', TokenCheck, async (req, res) => {
    let userid = req.body.token.id
    let post = await Posts.findOne({ _id: req.body.post_id })
    let comment = post.comments.find(v => v._id == req.body.comment_id )
    let type = null

    if (req.body.type == "like"){
        if (comment.likes.find( v => v == userid)){
            await Posts.updateOne(
                {
                    _id: req.body.post_id,
                    "comments._id": req.body.comment_id
                },
                {
                    $pull: {"comments.$.likes": userid}
                })
                type = "unlike"
        } else {
            await Posts.updateOne(
                {
                    _id: req.body.post_id,
                    "comments._id": req.body.comment_id
                },
                {
                    $addToSet: {"comments.$.likes": userid},
                    $pull: {"comments.$.dislikes": userid}
                })
                type = "like"
        }
    } else {
        if (comment.dislikes.find( v => v == userid)){
            await Posts.updateOne(
                {
                    _id: req.body.post_id,
                    "comments._id": req.body.comment_id
                },
                {
                    $pull: {"comments.$.dislikes": userid}
                })
                type = "undislike"
        } else {
            await Posts.updateOne(
                {
                    _id: req.body.post_id,
                    "comments._id": req.body.comment_id
                },
                {
                    $addToSet: {"comments.$.dislikes": userid},
                    $pull: {"comments.$.likes": userid}
                })
            type = "dislike"
        }
    }
    return res.json({
        message: true,
        type: type
    })
})

router.post('/comment_info', async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let c = x.comments.find (y => y._id == req.body.comment_id)
    res.json({c})
})

router.post('/react', TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let type = null

    const userId = req.body.token.id

    if (x.liked.includes(userId) && req.body.type === "liked"){
        x.liked.pull(userId)
        type = "unliked"
    } else if (x.liked.includes(userId) && req.body.type === "disliked"){
        x.liked.pull(userId)
        x.dislikes.push(userId)
        type = "disliked"
    } else if (x.dislikes.includes(userId) && req.body.type === "disliked"){
        x.dislikes.pull(userId)
        type = "undisliked"
    } else if (x.dislikes.includes(userId) && req.body.type === "liked"){
        x.dislikes.pull(userId)
        x.liked.push(userId)
        type = "liked"
    } else if (!x.liked.includes(userId) && !x.dislikes.includes(userId)){
        if (req.body.type === "liked"){
            x.liked.push(req.body.token.id)
            type = "liked"
        } else if (req.body.type === "disliked"){
            x.dislikes.push(req.body.token.id)
            type = "disliked"
        }
    }
    await x.save()
    return res.json({
        message: true,
        type: type
        })
})

router.post('/delete_comment',TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let y = x.comments.find(x => x._id == req.body.comment_id)
    if (y.authorid == req.body.token.id){
        await Posts.updateOne(
            { _id: req.body.post_id },
            { $pull: { comments: { _id: req.body.comment_id } } }
        )
        return res.json({ 
            message: "success",
            long: (x.comments.length -1)
        })
    }
    res.json({ error : "oh no" })
})

router.post('/create_comment', TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let y = await User.findOne({ _id: req.body.token.id })
    let data = {
        authorid: req.body.token.id,
        authorname: y.name,
        text: req.body.text
    }
    x.comments.push(data)
    let check = req.body.text.replaceAll(" ", "")
    if (check != "" && req.body.text.length < 300 && req.body.text.length > 1){
        await x.save()
    } else { return res.json({ error: "your comment cannot be this length" }) }
    
    res.json({ message: "success" })
})

router.post('/load_the_post', async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    res.json({x})
})

router.post('/create_post', TokenCheck, async (req, res) => {
    let now = new Date()
    let hour = String(now.getHours()).padStart(2, '0')
    let minutes = String(now.getMinutes()).padStart(2, '0')
    let authorname = await User.findOne({ _id: req.body.token.id })
    try {
        const post = new Posts({
            authorname: authorname.name, 
            authorid: req.body.token.id,
            bd: `${hour}:${minutes}`,
            title: req.body.title,
            text: req.body.text
        });   

        await post.save();

        return res.status(201).json({ success: true, post });

    } catch (err) {
        
        if (err.name === "ValidationError") {
            const errors = {};
            Object.keys(err.errors).forEach((key) => {
                errors[`${key}_error`] = err.errors[key].message;
            });
            console.log('[БЭКЕНД: РОУТЕР POSTS] Ошибка валидации:', errors);
            return res.status(400).json({ success: false, ...errors });
        }
    }
    
    console.log('[БЭКЕНД: РОУТЕР POSTS] Неизвестная ошибка сервера (500).');
    return res.status(500).json({ error: "Server error" });
})

router.post('/get_posts', async (req, res) => {
    console.log(req.body.skip)
    let x = await Posts.find({}).sort({ _id: -1 }).limit(5).skip(req.body.skip)
    res.json({x})
    })

router.post('/get_my_posts',  async (req, res) => {
    let x = await Posts.find({ authorid: req.body.me }).sort({ _id: -1 }).limit(5).skip(req.body.skip)
    res.json({x})
    })


router.post('/delete_post',TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    if (x.authorid == req.body.token.id){
        await Posts.deleteOne({ _id: req.body.post_id })
    }
    res.json({ message: "success" })
})

router.post('/edit_post_text', TokenCheck, async (req, res) => {
    let x = await Posts.findOne({ _id: req.body.post_id })
    let check1 = req.body.text.replaceAll(' ','')
    let check2 = req.body.title.replaceAll(' ','')
    if (check1 == "" || check2 == ""){
        return res.json({ error: true })
    }
    if (x.authorid == req.body.token.id){
        await Posts.updateOne(
            { _id: req.body.post_id },
            {
                $set: {
                    title: req.body.title,
                    text: req.body.text
                }
            }
            
        )
    }
    res.json({
        message: "success",
        title: req.body.title,
        text: req.body.text,
        error: false
        })
})

module.exports = router

// deletepost_trigger
// editpost_trigger