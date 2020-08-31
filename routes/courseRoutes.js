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
        next(error);
        console.log(error);
      }
    }
  }

  

//GET all courses
router.get('/courses', asyncHandler(async (req, res, next) => {
  const courses = await Course.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['password','createdAt', 'updatedAt'] }
      },
    ],
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  },
  
  );
    console.log(courses);
    res.json({ courses });
}));

//GET specific course
router.get('/courses/:id', asyncHandler(async (req, res, next) => {

}));
  
//POST New Course 
router.post('/courses', [], asyncHandler(async (req, res, next) => {
  
}));


//PUT course updates
router.put('/api/courses/:id', asyncHandler(async (req, res, next) => {
  
}));

//DELETE a course
router.delete('/api/courses/:id', asyncHandler(async (req ,res) => {

}));

module.exports = router;