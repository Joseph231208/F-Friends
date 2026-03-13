const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Chats = require('../models/Chats')
const { TokenCheck } = require('./auth.js');
const jwt = require('jsonwebtoken')

const FIVE_MINUTES = 5 * 60 * 1000;
var limit = 0

setInterval(clearlimit, FIVE_MINUTES)

function checklimit(){
    if (limit > 100){
        return false
    } else return true
}

function addlimit(){
    limit = limit + 1;
}

function clearlimit(){
    limit = 0
}

router.post('/createchat', TokenCheck, async (req, res) => {

    let today = new Date().toISOString().split("T")[0];

    let user1 = await User.findById(req.body.token.id)
    let user2 = await User.findById(req.body.id)

    if (!user1 || !user2) {
        return res.status(404).json({ error: "User not found" })
    }

    let us1_status = user1.friends.find(f => f.friendId == req.body.id)
    let us2_status = user2.friends.find(f => f.friendId == req.body.token.id)

    if (!us1_status || !us2_status) {
        return res.status(403).json({ error: "Users are not friends" })
    }

    if (us1_status.status === "friended" && us2_status.status === "friended") {

        let exist = await Chats.findOne({
            $or: [
                { first_user: req.body.token.id, second_user: req.body.id },
                { first_user: req.body.id, second_user: req.body.token.id }
            ]
        })

        if (exist) {
            exist.first_user_status = "active"
            exist.second_user_status = "active"
            await exist.save()

            return res.json({ exist: true })
        }

        const chat = new Chats({
            first_user: req.body.token.id,
            second_user: req.body.id,
            last_update: today,
            first_user_status: "active",
            second_user_status: "active"
        })

        await chat.save()

        return res.json({ exist: false })
    }

    res.status(403).json({ error: "Users are not friends" })
})

router.post('/deletechat',TokenCheck , async (req, res) => {
    let x = await Chats.findOne({ _id: req.body.chatid })
    if (req.body.token.id == x.first_user){
        x.first_user_status = "deleted"
    } else {
        x.second_user_status = "deleted"
    }
    await x.save()
    res.json({ message: "success" })
})

router.post('/mylists',TokenCheck , async(req, res) => {
    let x = await Chats.find({
        $or: [
            {
            first_user: req.body.token.id,
            first_user_status: "active"
            },{
            second_user: req.body.token.id,
            second_user_status: "active"
            }
        ]
    })
    let data = []
    for (let y of x){
        let Name
        if (y.first_user == req.body.token.id){
            let he = await User.findOne({ _id: y.second_user })
            Name = he.name
            HisId = he.id
        } else {
            let he = await User.findOne({ _id: y.first_user })
            Name = he.name
            HisId = he.id
        }
        let user = {
            towho: Name,
            towhosId: HisId,
            chatid: y.id,
            lu: y.last_update
        }
        data.push(user)
    }
    res.json(data)
})

router.post('/loadalldata', TokenCheck ,  async (req, res) => {
    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    await nonew(req.body.token.id, req.body.Towhoid)
    let towho = await User.findOne({ _id: req.body.Towhoid })
    let messages = x.messages.slice(-100)
    let data = {
        name: towho.name,
        userid: req.body.Towhoid,
        messages: messages,
        error: 'notfriended'
    }
    let me = await User.findOne({ _id: req.body.token.id })
    if (await friendscheck(req.body.Towhoid, req.body.token.id)){
        data.error = ""
    }
    return res.json(data)
    
})

async function friendscheck(x, y){
    let x1 = await User.findOne({ _id: x })
    let y1 = await User.findOne({ _id: y })
    if (!x1 || !y1){ return false }
    let secondcheck = x1.friends.find(el => el.friendId == y)
    let firstcheck = y1.friends.find(lu => lu.friendId == x)
    if (!secondcheck || !firstcheck){ return false }
    if (secondcheck.status == "friended" && firstcheck.status == "friended"){
        return true
    } else { return false }
}

router.post('/getlast', TokenCheck, async (req, res) => {
    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    let allnewones = 0
    for (h of x.messages){
        if (h.author != req.body.token.id && h.second_user_status == "unread"){
            allnewones ++;
        }

    }
    if (allnewones == 0){ allnewones = "" }
    if (!x.messages){ return res.json({ }) }
    let theindex = x.messages.length
    let answer = x.messages[theindex - 1]
    res.json({
        text: answer,
        newones: allnewones
    })
})

router.post('/sendmessage', TokenCheck, async (req, res) => {
    addlimit()
    if (req.body.text.length > 200){ return res.json({ error: "Хакер >:(" }) }
    if (!checklimit()){ return res.json({ error: "Не-а" })}
    let check = req.body.text.replaceAll(" ","")
    if(check == ""){
        return res.json({ message: "nope" })
    }

    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    let data = {
            text: req.body.text,
            author: req.body.token.id,
            send_date: req.body.send_date,
            sender_status: "sended",
            second_user_status: "unread"
        }
    if (await friendscheck(req.body.token.id, req.body.Towhoid)){
        await Chats.updateOne(
        { _id: x.id },
        { $push: { messages: data } })
        return res.json({ message: "success" })
    } else { res.json({ error: "Are you serious??" })}
    
    
})

router.post('/sendedittry', TokenCheck, async(req, res) => {
    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    themessage = x.messages.find(x => x._id == req.body.id)
    if (themessage.author != req.body.token.id || !themessage){ return res.json({ error: "none" }) }
    if (req.body.text.length > 200){ return res.json({ error: "хацкер" }) }
    let check = req.body.text.replaceAll(" ","")
    if(check == ""){ return res.json({ message: "nope" }) }
    await Chats.updateOne(
        { _id:x.id, "messages._id": req.body.id },
        { $set: { "messages.$.text": req.body.text } }
    )
    res.json({ message: "success" })
})

router.post ('/deletemessage', TokenCheck, async(req, res) => {
    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    themessage = x.messages.find(x => x._id == req.body.id)
    if (themessage.author != req.body.token.id || !themessage){ return res.json({ error: "none" }) }
    await Chats.updateOne(
        { _id: x.id },
        { $pull: { messages: { _id: req.body.id } } }
    )
    res.json({ message: "success" })
})

async function nonew(me, my){
    await Chats.updateOne(
    {
        $or: [
            {
                first_user: me,
                second_user: my
            },
            {
                first_user: my,
                second_user: me
            }
        ]
    },
    {
        $set: {
            "messages.$[elem].second_user_status": "read"
        }
    },
    {
        arrayFilters: [
            {
                "elem.author": my,
                "elem.second_user_status": "unread"

            }
        ]
    }
)
}

router.post('/loaddata', TokenCheck, async(req, res) => {
    let x = await Chats.findOne({
        $or: [
            {
                first_user: req.body.token.id,
                second_user: req.body.Towhoid
            }, {
                first_user: req.body.Towhoid,
                second_user: req.body.token.id
            }
        ]
    })
    if (!x) return res.json({ message: "chat not found" })
    let thelist = Array.from(x.messages)
    if (!thelist.length) return res.json({ message: "none" })
    lastmes2 = x.messages[x.messages.length - 1]
    await nonew(req.body.token.id, req.body.Towhoid)
    let newones = []
    if (req.body.lastmesid == null){
        for (let i = 0; i < thelist.length; i++){
            newones.push(thelist[i])
        }
        return res.json(newones)
    }
    if (req.body.lastmesid != lastmes2.id){
        let theone = thelist.find(x => x._id.toString() == req.body.lastmesid)
        if (!theone){ return res.json({ message: "deleted" }) }
        let theindex = thelist.indexOf(theone)
        for (let i = 1; (i + theindex) < thelist.length; i++){
            newones.push(thelist[i + theindex])
        }
        return res.json(newones)
    }

    res.json({ message: "none"})
})

router.post('/any_new',TokenCheck, async (req, res) => {
    let x = await Chats.find({$or: [
            {
                first_user: req.body.token.id,
            },
            {
                second_user: req.body.token.id
            }
        ]})
    let allnew = 0

    for (let chat of x) {
        for (let y of chat.messages){
        if (y.author != req.body.token.id && y.second_user_status == "unread"){
            allnew++
        }}}
    if (allnew == 0){ allnew = "" }
    res.json({ result: allnew})
})

module.exports = router