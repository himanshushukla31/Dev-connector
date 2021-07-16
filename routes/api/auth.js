const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')

//@route GET api/auth
//@Access Public
//@desc Test
router.get('/', auth, async (req, res) => {
  try {
    const userData = await User.findById(req.user.id).select('-password')
    res.json(userData)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
