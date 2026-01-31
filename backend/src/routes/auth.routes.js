const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { validateLogin, validateRegister } = require('../middlewares/validators');

// POST /api/auth/login - Login de usuário
router.post('/login', validateLogin, AuthController.login);

// POST /api/auth/register - Registro de novo usuário (admin)
router.post('/register', validateRegister, AuthController.register);

// POST /api/auth/refresh - Atualizar token
router.post('/refresh', AuthController.refreshToken);

// POST /api/auth/logout - Logout
router.post('/logout', AuthController.logout);

module.exports = router;
