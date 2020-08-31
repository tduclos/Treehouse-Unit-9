const express = require('express');
const morgan = require('morgan');
const router = express.Router();
const Sequelize = require('sequelize');
const User = require('../models').User;
const Course = require('../models').Course;

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

//GET User
router.get('/users/', authenticateUser, asyncHandler(async (req, res, next) => {
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
router.post('/users/', [], asyncHandler(async (req, res, next) => {
 
}));

module.exports = router;