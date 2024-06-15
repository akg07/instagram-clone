const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const requireLogin = require('../middleware/requireLogin');


router.post('/create-post', requireLogin, (req, res) => {
  const {title, body} = req.body;

  if(!title || !body) {
    return res.status(422).json({error: 'Please add all fields.'});
  }

  const post = new Post({
    title,
    body,
    postedBy: req.user
  });

  post.save().then((result) => {
    res.status(201).json({message: 'post created successfully', res: result});
  })
  .catch(err => {console.log(err)});

});

router.get('/all-post', (req, res) => {
  Post.find()
  .populate('postedBy', '_id name').then(posts => {
    res.status(200).json({message: 'success', posts});
  }).catch(err => {
    console.log(err);
  })
})


module.exports = router;