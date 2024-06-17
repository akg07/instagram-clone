const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {

  const {authorization} = req.headers;
  if(!authorization) {
    return res.status(401).json({message: 'Please login.'});
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if(err) {
      return res.status(401).json({error: "Please login."})
    }

    const {_id} = payload;
    User.findById(_id).then((userData) => {
      userData.password = undefined;
      req.user = userData; // modify request using middleware
      next(); // stop this middleware and continue req-res-cycle.
    }).catch(err => {
      console.log(err)
      next();
    });

  });

}