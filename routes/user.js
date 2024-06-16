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
});

router.put('/follow', requireLogin, (req, res) => {

  const { followId } = req.body;
  const { _id } = req.user;

  User.findByIdAndUpdate(followId, {
    $push: { followers: _id }
  },{ new: true })
  .then(follows => {
    User.findByIdAndUpdate(_id, {
      $push: { followings: followId }
    },{ new: true })
    .then(following => {
      res.status(200).json({message: 'Followed Successfully', user: following});
    })
    .catch(err => {
      console.log('User Following: ', err);
      return res.status(422).json({error: "Failed to follow the user"});
    });
  })
  .catch(err => {
    console.log('User Follow: ', err);
    return res.status(422).json({error: "Failed to follow the user"});
  });
});

router.put('/unfollow', requireLogin, (req, res) => {

  const { unfollowId } = req.body;
  const { _id } = req.user;

  User.findByIdAndUpdate(unfollowId, {
    $pull: { followers: _id }
  },{ new: true })
  .select('-password')
  .then(unfollows => {
    User.findByIdAndUpdate(_id, {
      $pull: { followings: unfollowId }
    },{ new: true })
    .select('-password')
    .then(unfollowing => {
      res.status(200).json({message: 'unFollowed Successfully', user: unfollowing});
    })
    .catch(err => {
      console.log('User unFollowing: ', err);
      return res.status(422).json({error: "Failed to unfollow the user"});
    });
  })
  .catch(err => {
    console.log('User unFollow: ', err);
    return res.status(422).json({error: "Failed to unfollow the user"});
  });
});

module.exports = router;