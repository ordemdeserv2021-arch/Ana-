const express = require('express');
const router = express.Router();
const RegisterController = require('../controllers/RegisterController');

// GET /api/residents/register/verify/:token - Verifica iToken (usado pelo app antes do formulário)
router.get('/residents/register/verify/:token', RegisterController.checkToken);

// POST /api/residents/register-with-token - Finaliza cadastro com iToken (upload de foto pode ser multipart)
router.post('/residents/register-with-token', RegisterController.register);

module.exports = router;
