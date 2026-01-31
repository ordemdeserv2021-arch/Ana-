const express = require('express');
const router = express.Router();
const ResidentController = require('../controllers/ResidentController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/residents - Listar moradores/funcionários
router.get('/', ResidentController.index);

// POST /api/residents - Cadastrar morador/funcionário
router.post('/', ResidentController.create);

// GET /api/residents/:id - Buscar por ID
router.get('/:id', ResidentController.show);

// PUT /api/residents/:id - Atualizar
router.put('/:id', ResidentController.update);

// DELETE /api/residents/:id - Remover
router.delete('/:id', ResidentController.delete);

// POST /api/residents/:id/credentials - Adicionar credencial (cartão, biometria)
router.post('/:id/credentials', ResidentController.addCredential);

// DELETE /api/residents/:id/credentials/:credentialId - Remover credencial
router.delete('/:id/credentials/:credentialId', ResidentController.removeCredential);

// PUT /api/residents/:id/block - Bloquear acesso
router.put('/:id/block', ResidentController.blockAccess);

// PUT /api/residents/:id/unblock - Desbloquear acesso
router.put('/:id/unblock', ResidentController.unblockAccess);

module.exports = router;
