const express = require('express')
const { body, validationResult } = require('express-validator') //import Express validator
const router = express.Router()
const gravatar = require('gravatar')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const normalize = require('normalize-url')

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
      let user = await User.findOne({ email })
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User Already exists' }] })
      }

      //Get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          s: '200', //size
          r: 'pg', //rating
          d: 'mm', //default picture
        }),
        { forceHttps: true }
      )

      //Create model
      user = new User({
        name,
        email,
        password,
        avatar,
      })

      //Salting and Hashing of password
      /**
       * @1 generate salt rounds
       * @2 get the hashed password using hash func
       */
      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(password, salt)

      //Save in Database
      await user.save()

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
