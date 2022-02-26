const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const CreditCardSchema = new mongoose.Schema({
  expMonth: {
    type: String,
    required: true,
    trim: true
  },
  expYear: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  mask: {
    type: String,
    required: true,
    trim: true
  },
  tokenId: {
    type: String,
    required: true,
    trim: true
  },
})

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true
    },
    lastName: {
      type: String,
      lowercase: true,
      required: true
    },
    password: {
      type: String,
      require: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      require: true
    },
    age: {
      type: Number
    },
    role: {
      type: String,
      default: 'Admin',
    },
    status: {
      type: String,
      default: 'Pending',
      enum: ['Deleted', 'Active', 'Pending'],
      required: true
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    creditCards: [CreditCardSchema]
  },
  {
    timestamps: true
  }
)

UserSchema.pre('save', async function(next) {
  const user = this
  try {
    if (!user.isModified('password') || !user.isModified('creditCardNumber') ) {
      return next()
    }
  
    //Generar el hash y encriptar la contraseña
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(user.password, salt)

    user.password = hash

  } catch(error) {
    next(error)
  }
  

  console.log('user', user)
  next()
})

UserSchema.methods.comparePassword = async function (password) {
  const user = this
  console.log(user.password, password)
  return await bcrypt.compare(password, user.password)
}

UserSchema.virtual('profile').get(function() {
  const { firstName, lastName, email } = this

  return { fullName: `${firstName} ${lastName}`, email }
})

module.exports = mongoose.model('User', UserSchema)