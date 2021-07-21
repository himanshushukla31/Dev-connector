const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const config = require('config') //It is an external package
const jwt = require('jsonwebtoken')

//@route GET api/auth
//@Access Public
//@desc Test
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password') //Remove password field
    res.json(user)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server Error')
  }
})

//@route POST api/auth
//@Access Public
//@desc handle login and create token

//Handle the login route
router.post(
  '/',
  [
    body('email', 'Please Enter a valid email'),
    body('password', 'Enter a valid password'),
  ],
  async (req, res) => {
    //validate email and password
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { email, password } = req.body

    //check if the user exits
    try {
      const user = await User.findOne({ email })

      //if no user
      if (!user) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      //if user exits compare password
      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      //create a jwt
      const payload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err
          }
          res.json({ token })
        }
      )
    } catch (err) {
      console.log(err.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
