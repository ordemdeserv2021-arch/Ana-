const express = require('express');
const router = express.Router();
const AccessController = require('../controllers/AccessController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/access/logs - Histórico de acessos
router.get('/logs', AccessController.getLogs);

// GET /api/access/logs/:id - Detalhes de um acesso
router.get('/logs/:id', AccessController.getLogById);

// POST /api/access/grant - Liberar acesso manualmente
router.post('/grant', AccessController.grantAccess);

// POST /api/access/deny - Negar acesso
router.post('/deny', AccessController.denyAccess);

// GET /api/access/realtime - Acessos em tempo real (SSE)
router.get('/realtime', AccessController.realtime);

// GET /api/access/report - Relatório de acessos
router.get('/report', AccessController.generateReport);

// GET /api/access/stats - Estatísticas de acesso
router.get('/stats', AccessController.getStats);

module.exports = router;
