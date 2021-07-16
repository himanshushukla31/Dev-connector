const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI') //Directly get the file from config folder

//Seperate file to handle connection with mongoDB

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to mongoose successfully!')
  } catch (err) {
    console.error(err.message)
    //exits the function
    process.exit(1)
  }
}

module.exports = connectDB
