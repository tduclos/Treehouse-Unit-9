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
router.get('/users/', asyncHandler(async (req, res, next) => {

}));
  

//POST New user
router.post('/users/', [], asyncHandler(async (req, res, next) => {
 
}));

module.exports = router;