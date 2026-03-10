const express = require('express')
const router = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const FIVE_MINUTES = 5 * 60 * 1000;
var limit = 0

setInterval(clearlimit, FIVE_MINUTES)

function checklimit(){
    if (limit > 50){
        return true
    } else return false
}

function addlimit(){
    limit = limit + 1;
}

function clearlimit(){
    limit = 0
}

router.post('/log', async (req, res) => {
    addlimit()
    if(checklimit()){ return res.json({ error: "stop trying to get it pls" }) }
    let x = await checkLogValue(req.body)
    if (x.valid){
        let y = await createToken(req.body.email)
        res.json({
            valid:true,
            table:x.table,
            token: y,
            id: x.id
        })
        
    } else {
        res.json({
            valid: false,
            table: x.table
        })
    }
})

async function checkLogValue(data){

    let error = {
        error1: "",
        error2: ""
    }

    const target = await User.findOne({ email: data.email })
    
    if (!target){
        error.error1 = "This account is not exist"
    }

    if (!data.email.includes('@')){
        error.error1 = 'Your email must contain "@" symbol'
    }

    if (data.email.length < 4 || data.email.length > 30){
        error.error1 = 'Your email cannot be this length'
    }

    if (!target || target.password !== data.password){
    error.error2 = "Password is wrong"
    }

    if (data.password.length < 4 || data.password.length > 20){
        error.error2 = 'Your password cannot be this long'
    }

    if(Object.values(error).every(items => items === "")){
        return {valid:true, table:error, id:target._id}
    } else { return {valid:false, table:error, id:"none"} }

}

router.post('/reg', async(req, res) => {
    addlimit()
    let x = await checkRegValue(req.body)
    if (x.valid){
        const user = new User ({
            name: req.body.name,
            email: req.body.email,
            bd: req.body.bd,
            password: req.body.p1,
        })

        if (checklimit()){
            return res.json ({ message: "out of limit"}) 
        } else {
            await user.save()
            }
        let y = await createToken(req.body.email)
        res.json({
            valid:true,
            table:x.table,
            token:y,
            id: user.id
        })
    } else {
        res.json({
            valid:false,
            table:x.table
        })
    }
})

async function checkRegValue(data){

    let error = {
        error1: "",
        error2: "",
        error3: "",
        error4: "",
        error5: "",
        error6: ""
    }

    let novaday = new Date().toISOString().split("T")[0];
    let today = novaday.split('-')

    const targetemail = await User.findOne({email: data.email})

    if (!/^[a-zA-Z0-9 ]+$/.test(data.name)){
        error.error1 = "Your name cannot contain strange symbols"
    }

    if (data.name.length < 3 || data.name.length > 20){
        error.error1 = 'Your name cannot be this length'
    }

    if (targetemail) {
        error.error2 = "This email is already taken"
    }
    
    if (!data.email.includes('@')){
        error.error2 = 'Your email must contain "@" symbol'
    }
    
    if (data.email.length < 4 || data.email.length > 30){
        error.error2 = 'Your email cannot be this length'
    }

    if (!data.bd){
        error.error3 = 'It`s shouldn`t be empty'
    }



    if (data.bd[0] > today[0]){
        error.error3 = 'You cannot be from the future'
    } if (data.bd[0] == today[0] && data.bd[1] > today[1]){
        error.error3 = 'You cannot be from the future'
    } if (data.bd[0] == today[0] && data.bd[1] > today[1] && data.bd[2] > today[2]){
        error.error3 = 'You cannot be from the future'
    }




    if (data.p1.length < 4 || data.p1.length > 20){
        error.error4 = 'Your password cannot be this long'
    }

    if (data.p1 != data.p2){
        error.error5 = "Passwords must match"
    }

    if (!data.l){
        error.error6 = "You cannot continue without this"
    }

    if (Object.values(error).every(items => items === "")){
        return  {valid:true, table:error}
    } else return {valid:false, table:error}
   
}

async function createToken(email){
    let x = await User.findOne({ email: email})
    const token = jwt.sign(
        { id: x.id },
        process.env.JWT_SECRET,
        { expiresIn: "3h" }
    )
    return token
}

module.exports = router