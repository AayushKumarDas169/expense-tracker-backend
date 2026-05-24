const jwt = require("jsonwebtoken");

/**
 * Generates a JSON Web Token (JWT) signed with the user's MongoDB unique ID.
 * @param {string} id - The unique _id of the authenticated user.
 * @returns {string} - Signed JWT token string.
 */
const generateToken = (id) => {
  // Signs the payload containing the user ID with your hidden JWT_SECRET env variable
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token remains valid for 30 days before forcing a clean re-login
  });
};

module.exports = generateToken;