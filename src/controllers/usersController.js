const bcrypt = require('bcrypt');
const pool = require('../config/db');
const NotFoundError = require('../errors/NotFoundError');
const { generateId, isUuid } = require('../utils/uuid');
const InvariantError = require('../errors/InvariantError'); 

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const id = generateId();
    const checkEmail = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (checkEmail.rowCount > 0) {
      const existingUser = await pool.query(
        'SELECT id, name, email, role FROM users WHERE email = $1',
        [email]
      );

      return res.status(201).json({
        status: 'success',
        data: existingUser.rows[0],
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    const result = await pool.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [id, name, email, hashed, userRole]
    );

    return res.status(201).json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {

    if (error.code === '23505') {
      const existingUser = await pool.query(
        'SELECT id, name, email, role FROM users WHERE email = $1',
        [req.body.email]
      );

      if (existingUser.rowCount) {
        return res.status(201).json({
          status: 'success',
          data: existingUser.rows[0],
        });
      }

      return next(new InvariantError('Email already registered'));
    }
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      throw new NotFoundError('User not found');
    }
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );

    if (!result.rowCount) {
      throw new NotFoundError('User not found');
    }

    return res.json({
      status: 'success',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, getById };