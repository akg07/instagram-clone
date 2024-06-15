

const express = require('express');
const mongoose = require('mongoose');
const { MONGO_URI } = require('./keys');

const app = express(); // invoke the express
const PORT = 5000;

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

app.listen(PORT, () => { // run the application on PORT.
  console.log(`Server is running on ${PORT}`);
})