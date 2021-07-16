const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

//Load env vars
dotenv.config({ path: './config/config.env' })

const app = express()

//An alternative to bodyParser middleware
app.use(express.json({ extended: false }))

//Establish connection with mongoose
connectDB()

app.get('/', (req, res) => {
  res.send('API running')
})

//Define routes and their endpoints
app.use('/api/users', require('./routes/api/users'))
app.use('/api/post', require('./routes/api/post'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
/*All the above routes are managed separately in their respective locations */

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(
    `Successfully running server in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
)
