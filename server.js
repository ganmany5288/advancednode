'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const session = require('express-session');
const passport = require('passport');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const {ObjectID} = require('mongodb');
const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './views/pug');


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {secure: false}
}));

app.use(passport.initialize());
app.use(passport.session());



myDB(async client  =>{
  const myDataBase = await client.db('database').collection('users');
  app.route('/').get((req, res) => {
    // Finally, use res.render() in the route for your home page, passing index as the first argument. This will render the pug template.
    console.log("connected to database!!!");
    res.render('index', 
    {
      title: 'Nihao', 
      message: 'Please login senpai!'
    });
  });


  passport.serializeUser((user, done) =>{
    done(null, user._id);
  
  })
  
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({_id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    })
  })



}).catch(err => {
  app.route('/').get((req, res) => {
    console.log('NOT connected to DB');
    res.render('index', {title: err, message: "Unable to connect to database"});
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
