const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/users - Listar usuários (admin)
router.get('/', adminMiddleware, UserController.index);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', UserController.show);

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', UserController.update);

// DELETE /api/users/:id - Remover usuário (admin)
router.delete('/:id', adminMiddleware, UserController.delete);

// GET /api/users/me - Perfil do usuário logado
router.get('/me', UserController.profile);

module.exports = router;
