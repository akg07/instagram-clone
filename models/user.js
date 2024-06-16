const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  followers: [
    {
      type: ObjectId,
      ref: 'User'
    }
  ],
  
  followings: [
    {
      type: ObjectId,
      ref: 'User'
    }
  ],
  photo: {
    type: String,
    default: 'https://res.cloudinary.com/dfcstdai1/image/upload/v1718567138/f809utuv6rp8seqtsxfh.png'
  },
});

mongoose.model('User', userSchema);