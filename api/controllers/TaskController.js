/**
 * TaskController
 *
 * @description :: Server-side logic for managing Tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  createTask: function (req, res) {

    // user creds
    var id = req.param("id");
    var token = req.param("token");

    // group code
    var groupCode = req.param("groupCode");

    // task
    var taskTitle = req.param("title");
    var taskParticipants = req.param("participants"); // csv user ids
    var taskIsLocationEnabled = req.param("isLocationEnabled"); // 0 false 1 true
    var taskLat = req.param("latitude");
    var taskLong = req.param("longitude");
    var taskTime = req.param("time");
    var taskDescription = req.param("description");
    var taskIsDone = req.param("isDone");
    var taskRepetition = req.param("repetition");


    var taskInfo = {};
    taskInfo.title = taskTitle;
    taskInfo.latitude = taskLat;
    taskInfo.longitude = taskLong;
    taskInfo.time = taskTime;
    taskInfo.groupCode = groupCode;
    taskInfo.description = taskDescription;
    taskInfo.repetition = taskRepetition;


    if (taskIsLocationEnabled === '1') {
      taskInfo.isLocationEnabled = true;
    } else {
      taskInfo.isLocationEnabled = false;
    }

    if (taskIsDone === '1') {
      taskInfo.isDone = true;
    } else {
      taskInfo.isDone = false;
    }


    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupCode)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .exec(function(err, user) {

          if (!user) {

            return res.json(userDoesNotExistJson);
          }

          User
            .compareToken(token, user)
            .then(function(valid)  {

              if (!valid) {
                res.status = 403;
                return res.json(forbiddenRequestJson);
              }

              // token verified
              Task
                .create(taskInfo)
                .exec(function(err, record) {

                  if (err) {

                    return res.json(unexpectedServerErrorJson);

                  } else {

                    // add task to group - promise1
                    // add task to creator - promise2
                    // add task for participants

                    // add task to group
                    var promise1 = new Promise(function(resolve, reject){
                      Group
                        .findOne({code: groupCode})
                        .exec(function(err, intendedGroup){

                          if (err) {
                            console.log("fails here4");
                            return res.json(unexpectedServerErrorJson);
                          } else {

                            intendedGroup.tasksInGroup.add(record.id);
                            intendedGroup.save(function (err) {

                              if (err) {
                                reject(err);
                              } else {
                                resolve();
                              }
                            });
                          }
                        });
                    });

                    // add creator to group
                    var promise2 = new Promise(function(resolve, reject){
                      user.tasksCreated.add(record.id);
                      user.save(function(err) {

                        if (err) {
                          reject(err);

                        } else {
                          resolve();
                        }
                      });
                    });

                    var promise3 = new Promise(function(resolve, reject){
                      var participants = taskParticipants.split(",");
                      var participantPromises = participants.map(function(eachParticipantId){

                        return User
                          .findOne({id: eachParticipantId})
                          .populate('userTasks')
                          .then(function(eachParticipant){

                            if (eachParticipant) {
                              eachParticipant.userTasks.add(record.id);
                              eachParticipant.save(function (err) {});
                            }
                          });
                      });
                      Promise
                        .all(participantPromises)
                        .then(function () {
                          resolve();
                        })
                        .catch(function (err) {
                          reject(err);
                        })
                    });

                    var creationPromises = new Array();
                    creationPromises.push(promise1);
                    creationPromises.push(promise2);
                    creationPromises.push(promise3);


                    Promise
                      .all(creationPromises)
                      .then(function () {
                        return res.json(taskCreatedCode);
                      })
                      .catch(function (err) {
                        console.log(err);
                        return res.json(unexpectedServerErrorJson);
                      })

                    // promise1
                    //   .then(function(){
                    //     promise2
                    //       .then(function () {
                    //         return res.json(taskCreatedCode);
                    //       })
                    //       .catch(function () {
                    //         return res.json(unexpectedServerErrorJson);
                    //       })
                    //   })
                    //   .catch(function () {
                    //     return res.json(unexpectedServerErrorJson);
                    //   })
                  }
                });

            })
            .catch(function(err){

              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  },

  getGroupTasks: function (req,res) {

    // user creds
    var id = req.param("id");
    var token = req.param("token");

    // group code
    var groupCode = req.param("groupCode");


    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupCode)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .exec(function(err, user) {

          if (!user) {

            return res.json(userDoesNotExistJson);
          }

          User
            .compareToken(token, user)
            .then(function(valid)  {

              if (!valid) {
                res.status = 403;
                return res.json(forbiddenRequestJson);
              }

              Group
                .findOne({code: groupCode})
                .populate('tasksInGroup')
                .exec(function(err, groupObj) {

                  var tasks = {};
                  tasks = groupObj.tasksInGroup;

                  var getTasksPromises = tasks.map(function(eachTask){

                    // to do: delete token attribute for user

                    return Task
                      .findOne({id: eachTask.id})
                      .populate('participants')
                      .populate('creator')
                      .then(function(eachTaskInfo){
                        return eachTaskInfo;
                      });
                  });

                  Promise
                    .all(getTasksPromises)
                    .then(function(allTasks){

                      var responseObj = {};
                      responseObj.status = 200;
                      responseObj.msg = "Tasks Fetched Successfully"
                      responseObj.tasks = allTasks
                      return res.json(responseObj);
                    })
                    .catch(function(err){
                      return res.json(unexpectedServerErrorJson);
                    });

                });

            })
            .catch(function(err){

              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  },

  getUserTasks: function (req,res) {

    // user creds
    var id = req.param("id");
    var token = req.param("token");

    // group code
    var groupCode = req.param("groupCode");


    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupCode)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .populate('userTasks')
        .exec(function(err, user) {

          if (err) {
            return res.json(unexpectedServerErrorJson);
          }

          if (!user) {

            return res.json(userDoesNotExistJson);
          }

          User
            .compareToken(token, user)
            .then(function(valid)  {

              if (!valid) {
                res.status = 403;
                return res.json(forbiddenRequestJson);
              }

              var tasksForParticularGroup = new Array();

              user.userTasks.forEach(function(singleTask) {
                if (singleTask.groupCode === groupCode) {
                  tasksForParticularGroup.push(singleTask);
                }
              });

              var getTasksPromises = tasksForParticularGroup.map(function(eachTask){

                // to do: delete token attribute for user

                return Task
                  .findOne({id: eachTask.id})
                  .populate('participants')
                  .then(function(eachTaskInfo){
                    return eachTaskInfo;
                  });
              });

              Promise
                .all(getTasksPromises)
                .then(function(allTasks){

                  var responseObj = {};
                  responseObj.status = 200;
                  responseObj.msg = "Tasks Fetched Successfully"
                  responseObj.tasks = allTasks
                  return res.json(responseObj);
                })
                .catch(function(err){
                  return res.json(unexpectedServerErrorJson);
                });

              // return res.json(tasksForParticularGroup);

            })
            .catch(function(err){

              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  },

  markAsDone: function (req,res) {

    // user creds
    var id = req.param("id");
    var token = req.param("token");

    // task Id
    var taskId = req.param("taskId");


    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(taskId)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .exec(function(err, user) {

          if (err) {
            return res.json(unexpectedServerErrorJson);
          }

          if (!user) {

            return res.json(userDoesNotExistJson);
          }

          User
            .compareToken(token, user)
            .then(function(valid)  {

              if (!valid) {
                res.status = 403;
                return res.json(forbiddenRequestJson);
              }

              Task
                .update({id: taskId}, {isDone: true})
                .exec(function(err, updated) {

                  if (err) {
                    return res.json(unexpectedServerErrorJson);
                  } else {
                    return res.json(taskMarkedAsDone);
                  }
                });

            })
            .catch(function(err){

              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  }

};

// general json repsonses
var badRequestJson = {status: 400, msg: "Bad Request"};
var forbiddenRequestJson = {status: 403, msg: "Forbidden Request"};
var alreadyRegisteredConflictJson = {status: 409, msg: "User already registered"};
var unexpectedServerErrorJson = {status: 500, msg: "Unexpected server error"};
var userDoesNotExistJson = {status: 409, msg: "User does not exist"};
var invalidLoginJson = {status: 403, msg: "Invalid email/password"};
var invalidGroupCode = {status: 403, msg: "Invalid Group Code"};
var taskCreatedCode = {status: 200, msg: "Task Created"};
var taskMarkedAsDone = {status: 200, msg: "Task Marked As Done"};

/**
 * Sanitizes input.
 * @param unsanitizedString string to be sanitized
 * @returns {boolean} true if sanitization successfull
 */
var sanitizeString = function(unsanitizedString) {

  if (!unsanitizedString || unsanitizedString.trim().length ===0) {
    return false;
  } else {
    return true;
  }

};
