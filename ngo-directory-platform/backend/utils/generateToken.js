const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for the given user id.
 * Expires in 7 days.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

module.exports = generateToken;
