const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../keys');
const requireLogin = require('../middleware/requireLogin');


router.get('/protected', requireLogin, (req, res) => {
  res.send('hello user');
});

router.post('/signup', (req, res) => {
  const {name, email, password} = req.body;
  if(!email || !password || !name) {
    return res.status(422).json({error: 'Please add all the fields.'});
  }

  // add data in DB
  User.findOne({email: email})
    .then((savedUser) => {
      if(savedUser) {
        return res.status(422).json({error: 'User already exists.'});
      }
      
      bcrypt.hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email, name, password: hashedPassword
          });
    
          user.save()
            .then((user) => {
              res.status(201).json({message: "User created successfully.", id: user._id});
            })
            .catch(err => {
              console.log(err);
            })
        })
        .catch(err => {console.log(err)});
    })
    .catch(err => {
      console.log(err);
    })
});

router.post('/signin', (req, res) => {
  const {email, password} = req.body;

  if(!email || !password) {
    return res.status(422).json({error: "Please add all fields."});
  }
  
  
  User.findOne({email}).then((savedUser) => {
    if(!savedUser) {
      return res.status(422).json({error: "Invalid Email/Password."});
    }
    
    bcrypt.compare(password, savedUser.password).then((matched) => {
      if(!matched) {
        return res.status(422).json({error: "Invalid Email/Password."});
      }

      const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
      console.log({savedUser});
      const {_id, name, email, followers, followings} = savedUser;
      res.status(200).json({message: "loggedin successfully", token, user: {_id, name, email, followers, followings}});

    }).catch(err => console.log(err));

  }).catch(err => console.log(err));

})


module.exports = router;