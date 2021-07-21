const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const config = require('config')
const { body, validationResult } = require('express-validator')
const { response } = require('express')
const axios = require('axios')
const request = require('request')

//@route GET api/profile/me
//@Access Private
//@desc To get the profile of the current logged in user
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name', 'avatar']
    )

    if (!profile) {
      return res.status(400).json({ msg: 'Profile is not yet created!' })
    }
    return res.json(profile)
  } catch (err) {
    if (err) {
      console.error(err.message)
    }
    res.status(500).json.send('Server errror')
  }
})

router.post(
  '/',
  [
    auth,
    [
      body('status', 'Status is required').notEmpty(),
      body('skills', 'Skill is required').notEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body

    let profileField = {}
    profileField.user = req.user.id
    if (company) profileField.company = company
    if (website) profileField.website = website
    if (location) profileField.location = location
    if (bio) profileField.bio = bio
    if (status) profileField.status = status
    if (githubusername) profileField.githubusername = githubusername
    if (skills)
      profileField.skills = skills.split(',').map((skill) => skill.trim()) //convert it into array of skill and remove spaces from every skill of the array by trim func

    //social skills
    profileField.social = {}
    if (youtube) profileField.social.youtube = youtube
    if (twitter) profileField.social.twitter = twitter
    if (facebook) profileField.social.facebook = facebook
    if (linkedin) profileField.social.linkedin = linkedin
    if (instagram) profileField.social.instagram = instagram

    try {
      let profile = await Profile.findOne({ user: req.user.id })
      if (profile) {
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileField },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        )
        return res.json(profile)
      }

      profile = new Profile(profileField)
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)
//@route GET api/profile
//@Access Public
//@desc To get all the profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route GET api/profile/user/userId
//@Access Public
//@desc To get the profile of users by id
router.get('/user/:userId', async (req, res) => {
  try {
    let profile = await Profile.findById(req.params.userId).populate('user', [
      'name',
      'avatar',
    ])

    if (!profile) {
      res.status(400).json({ msg: 'Profile Not found' })
    }
    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    if (err.kind == 'ObjectId') {
      res.status(400).json({ msg: 'Profile Not found' })
    }
    return res.status(500).send('Server Error')
  }
})

//@route DELETE api/profile
//@Access Private
//@desc To delete the current Profile, User and their posts

router.delete('/', auth, async (req, res) => {
  try {
    //Delete Profile
    await Profile.findOneAndRemove({ user: req.user.id })
    //Delete User
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ msg: 'Successfully deleted the user and profile' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route PUT api/profile/experience
//@Access Private
//@desc To Add experiences in the profile

router.put(
  '/experience',
  [
    auth,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('company', 'Company is required').not().isEmpty(),
      body('from', 'From Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { title, company, location, from, to, current, description } =
      req.body
    const experienceObj = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    }
    try {
      // const profile = await Profile.findOneAndUpdate(
      //   { user: req.user.id },
      //   { $push: { experience: experienceObj } }
      // )

      let profile = await Profile.findOne({ user: req.user.id })
      profile.experience.unshift(experienceObj) //unshift is same as using push just it pushes in front of the array
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

//@route DELETE api/profiles/experience:user_id
//@Access Private
//@desc To delete the particular experience in experience section

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    let removedIndx = -1
    const profile = await Profile.findOne({ user: req.user.id })
    for (let exp in profile.experience) {
      if (exp.id === req.params.exp_id) {
        removedIndx = profile.experience.indexOf(exp)
      }
    }
    profile.experience.splice(removedIndx, 1)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
//@route PUT api/profile/education
//@Access Private
//@desc To Add education in the profile

router.put(
  '/education',
  [
    auth,
    [
      body('school', 'School is required').not().isEmpty(),
      body('degree', 'Degree is required').not().isEmpty(),
      body('fieldofstudy', 'Field of study is required').not().isEmpty(),
      body('from', 'From is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body
    const educationObj = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id })
      profile.education.unshift(educationObj) //unshift is same as using push just it pushes in front of the array
      await profile.save()
      res.json(profile)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server Error')
    }
  }
)

//@route DELETE api/profiles/education:user_id
//@Access Private
//@desc To delete the particular education in education section

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    let removedIndx = -1
    const profile = await Profile.findOne({ user: req.user.id })
    for (let edu in profile.education) {
      if (edu.id === req.params.edu_id) {
        removedIndx = profile.education.indexOf(edu)
      }
    }
    profile.education.splice(removedIndx, 1)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route GET api/profile/github/:username
//@Access Public
//@desc get github repos of the username

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri:
        'https://api.github.com/users/' +
        req.params.username +
        '/repos?perpage=5&sort=created:asc&client_id=' +
        config.get('githubClientId') +
        '&client_secret=' +
        config.get('githubSecret'),
      method: 'GET',
      headers: {
        'user-agent': 'node.js',
      },
    }

    request(options, (error, response, body) => {
      //request module
      if (error) console.error(error.message)
      if (response.statusCode != 200) {
        return res.status(404).json({ msg: 'No github profile found' })
      }
      res.json(JSON.parse(body))
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
