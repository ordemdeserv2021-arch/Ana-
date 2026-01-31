const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/DeviceController');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// GET /api/devices - Listar dispositivos Control ID
router.get('/', DeviceController.index);

// POST /api/devices - Cadastrar novo dispositivo
router.post('/', adminMiddleware, DeviceController.create);

// GET /api/devices/:id - Buscar dispositivo por ID
router.get('/:id', DeviceController.show);

// PUT /api/devices/:id - Atualizar dispositivo
router.put('/:id', adminMiddleware, DeviceController.update);

// DELETE /api/devices/:id - Remover dispositivo
router.delete('/:id', adminMiddleware, DeviceController.delete);

// POST /api/devices/:id/sync - Sincronizar dispositivo
router.post('/:id/sync', DeviceController.sync);

// GET /api/devices/:id/status - Status do dispositivo
router.get('/:id/status', DeviceController.status);

// POST /api/devices/:id/reboot - Reiniciar dispositivo
router.post('/:id/reboot', adminMiddleware, DeviceController.reboot);

module.exports = router;
