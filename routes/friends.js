const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/sendfriendreq', async(req, res) => {
    let towho = req.body.name
    let fromwho = req.body.token.id
        await User.updateOne(
            { _id: towho },
            {
                $addToSet: {
                    friends: {
                        friendId: fromwho,
                        status: "request"
                    }
                }
            }
        )
        await User.updateOne(
            { _id: fromwho },
            {
                $addToSet: {
                    friends: {
                        friendId: towho,
                        status: "sender"
                    }
                }
            }
        )
        res.json({ message: 'success' })
})

router.post('/readfriendreq', async(req, res) => {
    let x = await User.findOne({ _id: req.body.token.id })

    let reqFriends = x.friends.filter(f => f.status == "request")
    res.json(reqFriends)
})



module.exports = router