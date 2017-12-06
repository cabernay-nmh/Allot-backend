/**
 * RegisterController
 *
 * @description :: Server-side logic for managing Registers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  registerUser: function(req, res) {

    var firstName = req.param("firstName");
    var lastName = req.param("lastName");
    var email = req.param("email");
    var password = req.param("password");

    // console.log(firstName);
    // console.log(lastName);
    // console.log(email);
    // console.log(password);

    var requestingUser = {firstName: firstName, lastName: lastName, email: email, password: password};

    if (
      (!sanitizeString(firstName)) ||
      (!sanitizeString(lastName)) ||
      (!sanitizeString(email)) ||
      (!sanitizeString(password))) {

      return res.badRequest(badRequestJson);

    } else {

      // check if user exists
      User
        .findOne({email: email})
        .exec(function(err, user) {

          // user does not exist
          if (!user) {

            User
              .create(requestingUser)
              .exec(function(err, newUser){

                // server refused
                if (err) {

                  return res.json(unexpectedServerErrorJson);

                } else {

                  var createdUser = {};
                  createdUser.firstName = newUser.firstName;
                  createdUser.lastName = newUser.lastName;
                  createdUser.email = newUser.email;
                  createdUser.status = 200;
                  createdUser.msg = "User created successfully"
                  createdUser.token = JwtService.issue({email: newUser.email})

                  return res.json(createdUser);
                }
              });
          }

          // user already exists
          else {

            return res.json(alreadyRegisteredConflictJson);
          }

        });
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


