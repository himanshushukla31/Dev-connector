const mongoose = require('mongoose')
//Create the database schema and export the model to use in other parts of the project
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  avatar: {
    type: String,
  },
})

module.exports = User = mongoose.model('user', UserSchema)
