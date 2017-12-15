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

    latitude: {
      type: 'float',
      defaultsTo: 0.0
    },

    longitude: {
      type: 'float',
      defaultsTo: 0.0
    },

    isLocationEnabled: {
      type: 'boolean',
      defaultsTo: false
    },

    isDone: {
      type: 'boolean',
      defaultsTo: false
    },

    time: {
      type: 'string'
    },

    description: {
      type: 'string'
    },

    notificationSent: {
      type: 'boolean',
      defaultsTo: 'false'
    },

    repetition: {
      type: 'integer',
      defaultsTo: 0
    }
  }
};

