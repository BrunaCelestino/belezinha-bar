const jwt = require('jsonwebtoken');
const UserSchema = require('../models/user/userSchema');
const { SECRET } = process.env;

exports.checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, SECRET);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: error.message });
  }
};

exports.checkAuthAndUserHasUserPermission = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET);
    const username = decoded.username;
    const role = decoded.role;

    if (!username || !role) {
      return res.status(403).json({ error: 'Unauthorized' });
    }



    const findUser = await UserSchema.findOne({ username });

    if (role === 'ADMIN' && findUser.token === token) {
      return next();
    }

    if (!findUser || req.params.id !== findUser._id.toString() || findUser.token !== token) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: error.message });
  }
};

exports.checkAuthAndAdminPermission = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Header error', details: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Header error', details: 'Token missing in header' });
    }

    const decoded = jwt.verify(token, SECRET);
    const username = decoded.username;
    const role = decoded.role;

    if (!username || !role || role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You cannot access this route',
        details: 'Forbidden',
      });
    }

    const findAdmin = await UserSchema.findOne({ username });

    if (!findAdmin || findAdmin.role !== 'ADMIN' || findAdmin.token !== token) {
      return res.status(403).json({
        message: 'You cannot access this route',
        details: 'Forbidden',
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: error.message });
  }
};
