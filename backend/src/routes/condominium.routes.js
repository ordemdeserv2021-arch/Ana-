const express = require('express');
const router = express.Router();
const CondominiumController = require('../controllers/CondominiumController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/condominiums - Listar condomínios/estabelecimentos
router.get('/', CondominiumController.index);

// POST /api/condominiums - Criar novo condomínio/estabelecimento
router.post('/', adminMiddleware, CondominiumController.create);

// GET /api/condominiums/:id - Buscar por ID
router.get('/:id', CondominiumController.show);

// PUT /api/condominiums/:id - Atualizar
router.put('/:id', adminMiddleware, CondominiumController.update);

// DELETE /api/condominiums/:id - Remover
router.delete('/:id', adminMiddleware, CondominiumController.delete);

// GET /api/condominiums/:id/stats - Estatísticas do condomínio
router.get('/:id/stats', CondominiumController.stats);

module.exports = router;
