const express = require('express');
const router = express.Router();
const AccessController = require('../controllers/AccessController');
const { authMiddleware } = require('../middlewares/auth');

// GET /api/dashboard/stats - Estatísticas do dashboard (protegido)
router.get('/stats', authMiddleware, AccessController.getStats);

module.exports = router;
