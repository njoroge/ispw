// backend/utils/passwordGenerator.js

/**
 * Generates a random alphanumeric password.
 * @param {number} length The desired length of the password (default: 12).
 * @returns {string} The generated password.
 */
const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

module.exports = generatePassword;
