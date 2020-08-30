'use strict'

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
              notEmpty: {
                msg: 'A first name is required.'
              }
           }
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
              notEmpty: {
                msg: 'A last name name is required.'
              }
           }
        },
        emailAddress: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isEmail: {
              msg: 'A valid email address is required.'
            }
          }
      },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
              notEmpty: {
                msg: 'A password is required.'
              }
           }
        }
     }, { sequelize });

     User.associate = (models) => {
      User.hasMany(models.Course, {
        as: 'user',
        foreignKey: {
          fieldName: 'userId',
          allowNull: 'false'
        },
      })
    }
  return User;
}