const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const connectDB = require('./config/db')
const User = require('./model/user.model')
const Actress = require('./model/actress.model')

const app = express()
app.use(express.json())

/* =====================
   MongoDB CONNECT
===================== */
connectDB()

/* =====================
   AUTH – REGISTER
===================== */
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // 🔎 validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Barcha maydonlar shart' })
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ message: 'Email band' })
    }

    // 🔐 password hash
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).json({
      message: 'Ro‘yxatdan o‘tildi',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/* =====================
   AUTH – LOGIN
===================== */
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password shart' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email yoki password xato' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email yoki password xato' })
    }

    const token = jwt.sign(
      { id: user._id },
      'SECRET_KEY',
      { expiresIn: '1d' }
    )

    res.json({
      message: 'Login muvaffaqiyatli',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/* =====================
   ACTRESS GET
===================== */
app.get('/actresses', async (req, res) => {
  try {
    const actresses = await Actress.find()
    res.json(actresses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/* =====================
   ACTRESS POST
===================== */
app.post('/actresses', async (req, res) => {
  try {
    const actress = new Actress(req.body)
    const savedActress = await actress.save()
    res.status(201).json(savedActress)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

/* =====================
   SERVER START
===================== */
const PORT = 5000
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portda ishlayapti`)
})

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://sotimboyevbehruz85_db_user:NTt5xDwVfH7syal6@cluster0.qnok1cz.mongodb.net/')
    console.log('MongoDB ulandi ✅')
  } catch (error) {
    console.log('MongoDB error ❌', error.message)
    process.exit(1)
  }
}

module.exports = connectDB
    