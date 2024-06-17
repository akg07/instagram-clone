

const express = require('express');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./config/keys');

const app = express(); // invoke the express
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI);
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.log(error);
})

app.use(express.json()); // parse all the request to json

// register these model in DB
require('./models/user');
require('./models/post');

// register the routers
app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

app.listen(PORT, () => { // run the application on PORT.
  console.log(`Server is running on ${PORT}`);
})