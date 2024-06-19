const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const requireLogin = require('../middleware/requireLogin');


router.post('/create-post', requireLogin, (req, res) => {
  const {title, body, pic} = req.body;
  console.log(req.body)
  if(!title || !body || !pic) {
    return res.status(422).json({error: 'Please add all fields.'});
  }

  const post = new Post({
    title,
    body,
    photo: pic,
    postedBy: req.user
  });

  post.save().then((result) => {
    res.status(201).json({message: 'post created successfully', res: result});
  })
  .catch(err => {console.log(err)});

});

router.get('/all-post', requireLogin, (req, res) => {
  Post.find()
  .populate('postedBy', '_id name')
  .populate('comments.postedBy', '_id name')
  .sort('-createdAt')
  .then(posts => {
    res.status(200).json({message: 'success', posts});
  }).catch(err => {
    console.log(err);
  })
});

router.get('/all-followings-post', requireLogin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.followings } })
  .populate('postedBy', '_id name')
  .populate('comments.postedBy', '_id name')
  .sort('-createdAt')
  .then(posts => {
    res.status(200).json({message: 'success', posts});
  }).catch(err => {
    console.log(err);
  })
});

router.get('/my-posts', requireLogin, (req, res) => {
  Post.find({postedBy: req.user._id})
  .populate('postedBy', '_id name')
  .sort('-createdAt')
  .then(posts => {
    res.status(200).json({message: 'success', posts});
  }).catch(err => {
    console.log(err);
  })
});

router.delete('/delete-post/:postId', requireLogin, (req, res) => {

  const { postId } = req.params;

  Post.findOne({_id: postId})
  .populate('postedBy', '_id')
  .exec()
  .then(result => {
    if(!result) {
      return res.status(422).json({error: 'not able to delete post'});
    }
    if(result.postedBy._id.toString() === req.user._id.toString()) {
      Post.deleteOne({_id: result._id})
      .exec()
      .then(resultdel => {
        res.status(200).json({message: 'Post delete successfully', data: result});
      })
      .catch(err => console.log('Deleting ', err));
    }else {
      return res.status(401).json({message: 'You are not authorized to delete this post.'})
    }
  })
  .catch(err => console.log('DELETE FIND ONE ', err));
});

router.put('/like', requireLogin, (req, res) => {
  const { postId } = req.body;
  const { _id } = req.user; // comes from requireLogin middleware -> via token
  Post.findByIdAndUpdate(postId, {
    $push: { likes: _id }
  }, { new: true })
  .populate('comments.postedBy', '_id name')
  .exec()
  .then((data) => {
    res.status(201).json({message: 'liked post', data});
  })
  .catch(err => console.log(err));
});

router.put('/unlike', requireLogin, (req, res) => {
  const { postId } = req.body;
  const { _id } = req.user; // comes from requireLogin middleware -> via token

  Post.findByIdAndUpdate(postId, {
    $pull: { likes: _id }
  }, { new: true })
  .populate('comments.postedBy', '_id name')
  .exec()
  .then((data) => {
    res.status(201).json({message: 'unlike post', data});
  })
  .catch(err => console.log(err));
});

router.put('/comment', requireLogin, (req, res) => {
  const { postId, text } = req.body;
  const { _id } = req.user; // comes from requireLogin middleware -> via token
  const comment = {
    text,
    postedBy: _id
  }
  Post.findByIdAndUpdate(postId, {
    $push: { comments: comment}
  }, { new: true })
  .populate('postedBy', '_id name')
  .populate('comments.postedBy', '_id name')
  .exec()
  .then((data) => {
    res.status(201).json({message: 'Comment added', data});
  })
  .catch(err => console.log(err));
});


module.exports = router;