const bcrypt = require('bcryptjs');

exports.validatePasswordUsername = async (req, res, next) => {
  const { password, username } = req.body;
  try {
    if (password) {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{7,20}$/;
      if (!password.match(passwordRegex)) {
        return res.status(406).json({
          message: 'The registration of a new user have failed',
          details:
            'Passwords must be a minimum of seven characters long and contain at least one uppercase and one lowercase letter (A, z), one numeric character (0-9), and one special character (such as !, %, @, or #).',
        });
      }
    }

    if (username) {
      const usernameRegex = '^[A-Za-z][A-Za-z0-9_]{6,19}$';

      if (!username.match(usernameRegex)) {
        return res.status(406).json({
          message: 'The registration of a new user have failed',
          details: `The username -${username}- does not match an acceptable format: It must start with letter. Must be 7 to 20 characters long. After the first character, numbers and underscores are allowed.`,
        });
      }
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.hashPassword = async (req, res, next) => {
  try {
    if (req.body.password) {
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      req.body.password = hashedPassword;
      return next();
    }
    return next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};