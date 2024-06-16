const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');


router.get('/user/:id', requireLogin, (req, res) => {

  const { id } = req.params;

  User.findOne({_id: id})
  .select('-password')
  .then(user => {
    // get all post created by user
    Post.find({postedBy: id})
    .populate('postedBy', '_id name')
    .then(posts => {
      res.status(200).json({
        user,
        posts
      })
    })
    .catch(err => {
      console.log('post error: ', err);
      return res.status(404).json({error: 'No post found'});
    })
  })
  .catch(err => {
    console.log('user error: ', err);
    return res.status(404).json({error: 'User not found!!'});
  })
})


module.exports = router;