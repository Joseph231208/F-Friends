const express = require('express')
const router = express.Router()
const User = require('../models/User')
    

router.get('/:id', async (req, res) => {
    let x = await User.findOne({ _id:req.params.id })
    if (x){
    res.json({
        name: x.name,
        bd: x.bd
    })
    } else {
        console.log("something went wrong")
        res.status(403).json({ error: 'error' })
    }
})


module.exports = router