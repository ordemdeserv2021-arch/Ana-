const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const condominiumRoutes = require('./condominium.routes');
const residentRoutes = require('./resident.routes');
const accessRoutes = require('./access.routes');
const deviceRoutes = require('./device.routes');
const visitorRoutes = require('./visitor.routes');

// Public/register/invite routes
const inviteRoutes = require('./invite.routes');
const registerRoutes = require('./register.routes');
const dashboardRoutes = require('./dashboard.routes');

// Rotas públicas
router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
// Rotas de registro público (verificação de token e cadastro com iToken)
router.use('/', registerRoutes);

// Dashboard protegido (usa authMiddleware internamente)
router.use('/dashboard', dashboardRoutes);

// Rotas protegidas
router.use('/users', userRoutes);
router.use('/condominiums', condominiumRoutes);
router.use('/residents', residentRoutes);
router.use('/access', accessRoutes);
router.use('/devices', deviceRoutes);
router.use('/visitors', visitorRoutes);

module.exports = router;
