const express = require('express')
const router = express.Router()

//@route GET api/post
//@Access Public
//@desc Test
router.get('/', (req, res) => res.send('Post route'))

module.exports = router
