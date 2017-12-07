/**
 * GroupController
 *
 * @description :: Server-side logic for managing Groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  createGroup: function(req, res) {

    var id = req.param("id");
    var token = req.param("token");
    var groupName = req.param("groupName");

    var groupInfo = {};
    groupInfo.name = groupName;

    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupName)) {

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

              Group
                .create(groupInfo)
                .exec(function(err, record) {

                  if (err) {

                    return res.json(unexpectedServerErrorJson);

                  } else {

                    // add creator to group
                    user.groups.add(record.id);
                    user.save(function(err){

                      if (err) {

                        return res.json(unexpectedServerErrorJson);

                      } else {

                        Group.findOne({id: record.id}).populate('members').exec(function(err, freshGroup){

                          var createdGroup = {};
                          createdGroup.name = freshGroup.name;
                          createdGroup.code = freshGroup.code;
                          createdGroup.status = 200;
                          createdGroup.msg = "Group created successfully";
                          createdGroup.members = freshGroup.members;

                          createdGroup.members.forEach(function(ele) {
                            delete ele.token;
                          });

                          return res.json(createdGroup);

                        });
                      }
                    });
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


  joinGroup: function(req, res) {

    var id = req.param("id");
    var token = req.param("token");
    var groupCode = req.param("groupCode");

    var groupInfo = {};
    groupInfo.code = groupCode;

    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupCode)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .populate('groups')
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

              Group
                .findOne(groupInfo)
                .populate('members')
                .exec(function(err, record) {

                  if (err) {

                    return res.json(unexpectedServerErrorJson);

                  } else if(!record) {

                    return res.json(invalidGroupCode);

                  } else {

                    // add creator to group
                    user
                      .groups
                      .add(record.id);

                    user
                      .save(function(err){

                        if (err) {

                          return res.json(unexpectedServerErrorJson);

                        }

                        else {

                          Group
                            .findOne({id: record.id})
                            .populate('members')
                            .exec(function(err, freshGroup){

                              var createdGroup = {};
                              createdGroup.name = freshGroup.name;
                              createdGroup.code = freshGroup.code;
                              createdGroup.status = 200;
                              createdGroup.msg = "Group joined successfully";
                              createdGroup.members = freshGroup.members;

                              createdGroup.members.forEach(function(ele) {
                                delete ele.token;
                              });

                              return res.json(createdGroup);

                          });
                        }
                      });
                  }
                });
            })
            .catch(function(err){

              console.log(err);
              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  },

  getJoinedGroups: function(req, res) {

    var id = req.param("id");
    var token = req.param("token");


    if (!sanitizeString(id) ||
      !sanitizeString(token)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .populate('groups')
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

              var getGroupsPromises = user.groups.map(function(eachGroup){

                return Group
                    .findOne({id: eachGroup.id})
                    .populate('members')
                    .then(function(eachGroupInfo){
                      return eachGroupInfo;
                });
              });

              Promise
                .all(getGroupsPromises)
                .then(function(groupsWithMembers){


                  // remove sensitive information
                  groupsWithMembers.forEach(function(groupEle, groupIndex, groupArray){

                    groupEle.members.forEach(function(memberEle, memberIndex, memberArray){

                      delete groupArray[groupIndex].members[memberIndex].token;
                    });
                  });

                  var responseObj = {};
                  responseObj.status =  200;
                  responseObj.msg = "Fetched Groups Successfully.";
                  responseObj.groups =  groupsWithMembers;

                  return res.json(responseObj);

                }).catch(function(err){
                  console.log(err);
              });
            })
            .catch(function(err){

              console.log("comparision failing: " + err);
              res.status = 403;
              return res.json(forbiddenRequestJson);
            });
        })
    }
  },

  getGroupInfo: function(req, res) {

    var id = req.param("id");
    var token = req.param("token");
    var groupCode = req.param("groupCode");


    if (!sanitizeString(id) ||
      !sanitizeString(token) ||
      !sanitizeString(groupCode)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({id: id})
        .populate('groups')
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

              // Get group info
              Group
                .findOne({code: groupCode})
                .populate('members')
                .exec(function(err, groupRecord) {

                  if (err) {

                    return res.json(unexpectedServerErrorJson);

                  } else if (!grouRecord) {

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
