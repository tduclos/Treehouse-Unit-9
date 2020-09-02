const express = require('express');
const morgan = require('morgan');
const router = express.Router();
const Sequelize = require('sequelize');
const User = require('../models').User;
const Course = require('../models').Course;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator');
let coursesArray = [];

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

//GET all courses
router.get('/api/courses', asyncHandler(async (req, res, next) => {
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
router.get('/api/courses/:id', asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    console.log(course);
    res.json({ course });
  }));
  
//POST New Course (Header is not being set- needs fixing)
router.post('/api/courses', [
  check('title')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please include a title with your POST request'),
check('description')
  .exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please include a description with your POST request')
], asyncHandler(async (req, res, next) => {
  
  const errors = validationResult(req);

  //validation error handling
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(401).json({ errors: errorMessages });
  }
  
  const course = await Course.create(req.body);
  coursesArray.push(course);
  console.log(course);
  return res.status(201).end();
  
}));

//PUT course updates (Returning a 500 and not the expected 400 error)
router.put('/api/courses/:id', authenticateUser, asyncHandler(async (req, res, next) => {
  console.log('Starting');
  let user = req.currentUser;
  let course = await Course.findByPk(req.params.id);
  console.log(course.userId);
  if (user.id === course.userId) {
    if (req.body.title === undefined || req.body.description === undefined) {  
      res.status(400).send({ error: 'Please include a title and description with your PUT request'});
    } else {
      await course.update(req.body);
      res.sendStatus(204);
    }
  } else {
    res.status(403).send({ error: 'This user does not own this course'});
  }
}));

//DELETE a course
router.delete('/api/courses/:id', authenticateUser, asyncHandler(async (req ,res) => {
    let user = req.currentUser;
    let course = await Course.findByPk(req.params.id);
      if (user.id === course.userId) {
          course.destroy();
          res.sendStatus(204);
        } else {
          res.status(403).send({ error: 'You does not have access to this course'});
        }
  }));

module.exports = router;