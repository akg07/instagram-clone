const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');
const requireLogin = require('../middleware/requireLogin');
const sendEmail = require('../service/nodemailer');
const config = require('../config/keys');


router.get('/protected', requireLogin, (req, res) => {
  res.send('hello user');
});

router.post('/signup', (req, res) => {
  const {name, email, password, photo} = req.body;
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
            email, name, password: hashedPassword, photo
          });
    
          user.save()
            .then((user) => {
              sendEmail({
                to: user.email,
                subject: 'Signup success',
                html: `<h1>welcome to the sepiagram-clone app developed by Ayush K gupta!!!</h1>`
              });
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
      const {_id, name, email, followers, followings, photo} = savedUser;
      setTimeout(() => {
        res.status(200).json({message: "loggedin successfully", token, user: {_id, name, email, followers, followings, photo}});
      }, 1500);

    }).catch(err => console.log(err));

  }).catch(err => console.log(err));

})

router.put('/update-profile-pic', requireLogin, (req, res) => {
  const {photo} = req.body;
  const{ _id } = req.user;

  User.findByIdAndUpdate(_id, {$set: {photo: photo }}, {new: true})
  .exec()
  .then(result => {
    console.log(result);
    res.status(200).json({message: "Profile image updated successfully.", result});
  })
  .catch(err => {
    console.log('Update profile pic Error: ', err);
    return res.status(422).json({error: 'Something went wrong.'})
  })
})

router.post('/reset-password', (req, res) => {

  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log('reset password error: ', err);
    }
    const token = buffer.toString('hex');

    const {email} = req.body;

    User.findOne({email}).then((user) => {
      if(!user) {
        return res.status(422).json({error: "User don't exists with provided email."});
      }

      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;

      user.save().then((saveToken) => {
        sendEmail({
          to: user.email,
          subject: 'Password Reset',
          html: `
            <p>You requested for password reset</p>
            <h5>Click in this <a href='${config.FRONTEND_URL}/reset/${token}'> link </a> to reset password. </h5>
          `
        });

        res.status(200).json({message: 'check your email inbox/spam'});
      });
    });
  });
})

router.post('/new-password', (req, res) => {

  const { newpass, token } = req.body;
  console.log({newpass});
  console.log({token});


  User.findOne({resetToken: token, expireToken: { $gt: Date.now() }}).then((user) => {
    if(!user) {
      return res.status(422).json({error: 'URL expired. Try again!!'});
    }

    bcrypt.hash(newpass, 12).then(hashedPassword => {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.expireToken = undefined;
      
      console.log({hashedPassword});
      console.log({user});

      user.save().then((result) => {
        console.log({result});
        res.status(200).json({message: 'Password updated successfully'});
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  }).catch(err => console.log(err));
})

router.post('/search-users', (req, res) => {
  const {query} = req.body;
  let userPattern = new RegExp(`^${query}`);

  User.find({email: { $regex: userPattern }})
  .select('_id email name photo')
  .then(user => {
    res.json({user});
  }).catch((err) => console.log('err ', err));
})


module.exports = router;