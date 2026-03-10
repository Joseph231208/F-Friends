const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/frommereq', async (req, res) => {
    let user = await User.findOne({ _id: req.body.token.id })
    let data = []
    if (user.friends.length < 1){ return res.json({ message: "emptpy" }) }
    for (const u of user.friends){
        let target = await User.findOne({ _id: u.friendId })
        let name = target.name
        let age = target.bd
        let status = u.status

        let user_target = {
            name: name,
            age: age,
            status: status,
            id: target.id
        }
        if(status == "sender"){
            data.push(user_target)
        }
        
    }
    res.json(data) 
})

router.post('/acreq', async (req, res) => {
    let user = await User.findOne({ _id: req.body.token.id })
    let target = await User.findOne({ _id: req.body.id })
    let status
    if (req.body.type == "accept"){
        status = "friended"
    } else {
        let result = await User.updateOne(
            { _id: req.body.token.id },
            { $pull: { friends: { friendId: req.body.id } } }
        )
        let result2 = await User.updateOne(
            { _id:   req.body.id },
            { $pull: { friends: { friendId: req.body.token.id} } }
        )   
    }

    let result = await User.updateOne(
        { _id: req.body.token.id, "friends.friendId": req.body.id },
        { $set: {"friends.$.status": status} }
    )

    let result2 = await User.updateOne(
        { _id:req.body.id , "friends.friendId":req.body.token.id  },
        { $set: {"friends.$.status": status} }
    )   

    res.json({ message: 'success' })

})

router.post('/deletefriend', async(req, res) => {
    try {
    await User.updateOne(
        { _id : req.body.token.id },
        { $pull: { friends: { friendId: req.body.id } } }
    ) 

    await User.updateOne(
        { _id:req.body.id },
        { $pull: { friends: { friendId: req.body.token.id } } }
    )
    } catch(err) {
        console.log(err)
    }
    res.json({ message: "success" })
})

router.post('/Myfriendlist', async (req, res) => {
    let user = await User.findOne({ _id: req.body.token.id })
    let data = []
    for (const u of user.friends){
        let target = await User.findOne({ _id: u.friendId })
        if (!target){
            return res.json({ message: "no friends :(" })
        }
        let name = target.name
        let age = target.bd
        let status = u.status

        let user_target = {
            name: name,
            age: age,
            status: status,
            id: target.id
        }
        if(status == "friended"){
            data.push(user_target)
        }
        
    }
    res.json(data)  
})

router.post('/finduser', async (req, res) => {
    let owner = await User.findOne ({ _id: req.body.token.id })
    if (req.body.id == req.body.token.id || req.body.name.toLowerCase() == owner.name.toLocaleLowerCase()){
        return res.json({ error: "its you" })
    }
    let NameUser = req.body.name
    let id = req.body.id
    let user
    let fromwho = await User.findOne({ _id: req.body.token.id })
    let friend
    try{
        user = await User.findOne(
            { name: req.body.name },
            null,
            {collation: {locale: 'en', strength: 2}}
        )
        friend = fromwho.friends.find(f => f.friendId == user.id)
        if (!friend){
            friend = {status: "none"}
        }

    } catch(err) {}
    try{
        user = await User.findOne(
            { _id: req.body.id},
            null,
            {collation: {locale: "en", strength: 2}}
        )
        friend = fromwho.friends.find(f => f.friendId == user.id)
        if (!friend){
            friend = {status: "none"}
        }
    } catch(err){}
    if (!user){
        return res.status(200).json({ error: 'no one found' })
    }

    res.json({
        id: user.id,
        name: user.name,
        age: user.bd,
        status: friend.status
    })
})





router.post('/data', async (req, res) => {
    let x = checkdata(req.body.data)
    console.log(x)
    if(x.valid){
        await User.findOneAndUpdate(
            { _id: req.body.token.id },
            { bd: req.body.data }
        )
        res.json({
            message: "success"
        })
    } else {
        res.status(402).json({ error: "Birth date is invalid" })
    }
})

router.post('/name', async (req, res) => {
    let x = checkname(req.body.name)
    console.log(x)
    if(x.valid){
        await User.findOneAndUpdate(
            { _id: req.body.token.id },
            { name: req.body.name }
        )
        res.json({
            message: "success"
        })
    } else {
        res.status(402).json({ error: x.error })
    }
})

function checkdata(day){
    if (day == ''){
        let data = {
            valid:false
        }
        return data
    }
    console.log(day)

    let novaday = new Date().toISOString().split("T")[0];
    let today = novaday.split('-')
    let bd = day.split("-")
    

    if (bd[0] > today[0]){
        let data = {
            valid:false
        }
        return data
    } if (bd[0] == today[0] && bd[1] > today[1]){
        let data = {
            valid:false
        }
        return data
    } if (bd[0] == today[0] && bd[1] > today[1] && bd[2] > today[2]){
        let data = {
            valid:false
        }
        return data
    } else {
        let data = {
            valid:true
        }
        return data
    }


}

function checkname(name){
    if (!/^[a-zA-Z0-9 ]+$/.test(name)){
        let data = {
            valid:false,
            error:"Your name cannot contain strange symbols"
        }
        return data
    }
    if (name.length < 3 || name.length > 20){
        let data = {
            valid:false,
            error:'Your name cannot be this length'
        }
        return data
    } else {
        let data = {
            valid:true,
            error:''
        }
        return data
    }
}

module.exports = router