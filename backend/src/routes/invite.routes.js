const express = require('express');
const router = express.Router();
const InviteController = require('../controllers/InviteController');
const RegisterController = require('../controllers/RegisterController');

// POST /api/invites/request - Gerar convite (iToken)
router.post('/request', InviteController.create);

// GET /api/invites/verify/:token - Verificar iToken
router.get('/verify/:token', RegisterController.checkToken);

module.exports = router;
