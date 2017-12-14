/**
 * LoginController
 *
 * @description :: Server-side logic for managing Logins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  loginUser: function(req,res) {

    var email = req.param("email");
    var password = req.param("password");

    var androidDeviceId = req.param("androidDeviceId");

    if (!sanitizeString(email) ||
      !sanitizeString(password)) {

      return res.badRequest(badRequestJson);
    }

    else {

      User
        .findOne({email: email})
        .exec(function(err, user) {

          if (err) {

            return res.json(userDoesNotExistJson);
          }

          User
            .comparePassword(password, user)
            .then(function(valid)  {

              if (!valid) {
                res.status = 403;
                return res.json(invalidLoginJson);
              }

              user.status = 200;
              user.msg = "Login successfull";
              user.token = JwtService.issue({email: user.email});

              // update user with new token
              User.update({id: user.id}, {token: user.token, androidDeviceId: androidDeviceId})
                .exec(function(err, record){});

              return res.json(user);
            })
            .catch(function(err){
              res.status = 403;
              return res.json(invalidLoginJson);
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
