/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var shortid = require('shortid');

module.exports = {

  attributes: {

    name: {
      type: 'string'
    },

    code: {
      type: 'string'
    },

    members: {
      collection: 'user',
      via: 'groups'
    }

  },

  beforeCreate: function(values, cb) {

    values.code = shortid.generate();
    cb();

  }

};

