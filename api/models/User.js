/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');
var promise = require('bluebird');

module.exports = {

  attributes: {

    firstName: {
      type: 'string'
    },

    lastName: {
      type: 'string'
    },

    email: {
      type: 'string'
    },

    password: {
      type: 'string',
      protected: true,
      required: true,
      columnName: 'encryptedPassword'
    },

    androidDeviceId: {
      type: 'string'
    },

    groups: {
      collection: 'group',
      via: 'members',
      dominant: true
    },

    tasksCreated: {
      collection: 'task',
      via: 'creator',
      dominant: true
    },

    userTasks: {
      collection: 'task',
      via: 'participants',
      dominant: true
    },


    toJSON: function() {

      var obj = this.toObject();
      delete obj.password;
      delete obj.createdAt;
      delete obj.updatedAt;
      return obj;
    }
  },

  beforeCreate: function(values, cb) {

    bcrypt.hash(values.password, 10, function (err, hash) {

      if (err) return cb(err);
      values.password = hash;
      cb();

    });
  },

  comparePassword: function(password, user) {

    return new promise(function (resolve, reject) {
      bcrypt.compare(password, user.password, function (err, match) {
        if (err) reject(err);

        if (match) {
          resolve(true);
        } else {
          reject(err);
        }
      })
    });
  },

  compareToken: function(token, user) {

    return new promise(function (resolve, reject) {

      if (token === user.token) {
        resolve(true);
      } else {
        reject("Token does not match");
      }

    });
  }
};

