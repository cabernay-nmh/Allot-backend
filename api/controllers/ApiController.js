/**
 * ApiController
 *
 * @description :: Server-side logic for managing Apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	apiLanding: function(req,res) {

		return res.json({page: "API Documentation"});

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

}
