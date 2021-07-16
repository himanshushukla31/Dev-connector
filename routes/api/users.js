const express = require('express')
const { body, validationResult } = require('express-validator') //import Express validator
const router = express.Router()
const gravatar = require('gravatar')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

//@route POST api/users
//@Access Public
//@desc Register User
router.post(
  '/',
  [
    //Validator logic
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please Enter a valid email').isEmail(),
    body('password', 'Password length should be <=6').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    console.log(errors)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body

    try {
      //Check if user already exists
      let user = await User.findOne({ email: email })
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User Already exists' }] })
      }

      //Get users gravatar
      const Avatar = gravatar.url(email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mp', //default pic
      })

      //Create model
      user = new User({
        name,
        email,
        password,
        Avatar,
      })

      //Salting and Hashing of password
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      //Save in Database
      user.save()

      //Create JWT token
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
