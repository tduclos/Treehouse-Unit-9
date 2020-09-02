const express = require('express');
const morgan = require('morgan');
const router = express.Router();
const Sequelize = require('sequelize');
const User = require('../models').User;
const Course = require('../models').Course;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');
const users = [];

//asyncHandler
function asyncHandler(callback){
    return async(req, res, next) => {
      try {
        await callback(req, res, next)
      } catch(error){
        next(error)
        console.log(error)
      }
    } 
  }

//authenticateUser
const authenticateUser = async (req, res, next) => {
  let message = null;
  // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
  if (credentials) {
    //retrieve user
        const users = await User.findAll();
        const user = users.find(user => user.emailAddress === credentials.name);
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for : ${user.firstName} ${user.lastName}`);
        //store user on request header
        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${user.firstName} ${user.lastName}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
  //authentication failure
  if (message) {
    console.warn(message);
  
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    //authentication success
      next();
  }
};

//GET User
router.get('/api/users', authenticateUser, asyncHandler(async (req, res, next) => {
  console.log('Starting');
    let authedUser = req.currentUser;
    if(authedUser) {
      res.json({
        id: authedUser.id,
        firstName: authedUser.firstName,
        lastName: authedUser.lastName,
        emailAddress: authedUser.emailAddress
      });
    } else {
      res.sendStatus(404);
    }
}));
  

//POST New user
router.post('/api/users', [
    check('firstName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include a first name with your POST request'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include a last name with your POST request'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include an email address with your POST request'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please include a password with your POST request'),
], asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
  
    //validation error handling
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }
  
    let user = req.body;
    user.password = bcryptjs.hashSync(user.password);
    await User.create(user);const currentUsers = await User.findAll({
      attributes: ['emailAddress']
    });
    let foundUserEmails = JSON.stringify(currentUsers);
    if (user.emailAddress === foundUserEmails) {
      res.status(400).send({ error: 'There is already a user associated with this e-mail address'}); //updated this for consistency to be safe
    } else {
      users.push(user);
      res.location('/');
      return res.status(201).end();
    }  
}));
module.exports = router;