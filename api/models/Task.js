/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    title: {
      type: 'string'
    },

    groupCode: {
      type: 'string'
    },

    group: {
      collection: 'group',
      via: 'tasksInGroup'
    },

    creator: {
      collection: 'user',
      via: 'tasksCreated'
    },

    participants: {
      collection: 'user',
      via: 'userTasks'
    },

    lat: {
      type: 'float',
      defaultsTo: 0.0
    },

    long: {
      type: 'float',
      defaultsTo: 0.0
    },

    isLocationEnabled: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};

