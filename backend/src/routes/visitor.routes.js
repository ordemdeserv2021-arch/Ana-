const express = require('express');
const router = express.Router();
const VisitorController = require('../controllers/VisitorController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/visitors - Listar visitantes
router.get('/', VisitorController.index);

// POST /api/visitors - Cadastrar visitante
router.post('/', VisitorController.create);

// GET /api/visitors/:id - Buscar visitante por ID
router.get('/:id', VisitorController.show);

// PUT /api/visitors/:id - Atualizar visitante
router.put('/:id', VisitorController.update);

// DELETE /api/visitors/:id - Remover visitante
router.delete('/:id', VisitorController.delete);

// POST /api/visitors/:id/checkin - Registrar entrada
router.post('/:id/checkin', VisitorController.checkIn);

// POST /api/visitors/:id/checkout - Registrar saída
router.post('/:id/checkout', VisitorController.checkOut);

// GET /api/visitors/active - Visitantes ativos (dentro do local)
router.get('/active', VisitorController.getActive);

module.exports = router;
