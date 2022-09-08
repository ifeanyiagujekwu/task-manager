const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password must not contain the word password');
      }
    },
    },
    tokens: [{
        token: {
          type: String,
          required: true
      }
  }],
    avatar: {
      type: Buffer
    }
}, {
  timestamps: true
});

// virtual method on the database to create a relationship between user and task models .....note: it is not stored in the database it is just for mongoose to understand what is happening
userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

// the .toJSON method is to remove the password and token from the details sent back to the user
  userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.token
  delete userObject.avatar

  return userObject
}

//get authenticated be generating an authentication token and concatinating it to the token array
userSchema.methods.getAuthToken = async function () {
    
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewsong')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//find the user by email and compare the hashed password
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });

  if (!user) {
    throw new Error('unable to login');
    }
    
  const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
    throw new Error('unable to login');
    }
    
  return user;
};

// hash plain password before saving
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//delete user task when user is deleted
userSchema.pre('remove', async function (next) {
  
  const user = this
  await Task.deleteMany({owner: user._id})
  next()
})

//creating a model after attributing methods on schema above
const User = mongoose.model('User', userSchema);

module.exports = User;
