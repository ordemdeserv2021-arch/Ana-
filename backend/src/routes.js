const express = require('express');
const routes = express.Router();

const AuthController = require('./controllers/AuthController');
const UserController = require('./controllers/UserController');
const CondominiumController = require('./controllers/CondominiumController');
const ResidentController = require('./controllers/ResidentController');
const DeviceController = require('./controllers/DeviceController');
const VisitorController = require('./controllers/VisitorController');
const AccessController = require('./controllers/AccessController');
const InviteController = require('./controllers/InviteController');
const RegisterController = require('./controllers/RegisterController');

const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('./middlewares/auth');
const { 
  validateLogin, validateRegister, validateResident, 
  validateCondominium, validateDevice 
} = require('./middlewares/validators');

// --- Rotas Públicas ---
routes.post('/auth/login', validateLogin, AuthController.login);

routes.post('/auth/refresh-token', AuthController.refreshToken);

// Rotas de Registro via Convite (App Mobile)
routes.get('/register/validate/:token', RegisterController.checkToken);
routes.post('/register', RegisterController.register);

// Endpoints públicos para mobile (iToken)
routes.post('/invites/request', InviteController.create);
routes.get('/invites/verify/:token', RegisterController.checkToken);
// Upload de foto esperado no campo 'photo'
const upload = require('./middlewares/upload');
routes.post('/residents/register-with-token', upload.single('photo'), RegisterController.register);

// --- Rotas Protegidas (Requer Login) ---
routes.use(authMiddleware);

routes.post('/auth/logout', AuthController.logout);
routes.get('/users/profile', UserController.profile);

// --- Rotas de Usuários ---
routes.get('/users', adminMiddleware, UserController.index);
routes.get('/users/:id', adminMiddleware, UserController.show);
// Rota para criar novos usuários (apenas Super Admin)
routes.post('/users', superAdminMiddleware, validateRegister, AuthController.register);
routes.put('/users/:id', adminMiddleware, UserController.update);
routes.delete('/users/:id', superAdminMiddleware, UserController.delete);

// --- Rotas de Condomínios ---
routes.get('/condominiums', CondominiumController.index);
routes.get('/condominiums/:id', CondominiumController.show);
routes.post('/condominiums', superAdminMiddleware, validateCondominium, CondominiumController.create);
routes.put('/condominiums/:id', superAdminMiddleware, CondominiumController.update);
routes.delete('/condominiums/:id', superAdminMiddleware, CondominiumController.delete);
routes.get('/condominiums/:id/stats', CondominiumController.stats);

// --- Rotas de Moradores ---
routes.get('/residents', ResidentController.index);
routes.get('/residents/:id', ResidentController.show);
routes.post('/residents', validateResident, ResidentController.create);
routes.put('/residents/:id', ResidentController.update);
routes.delete('/residents/:id', ResidentController.delete);
// Credenciais e Bloqueio
routes.post('/residents/:id/credentials', ResidentController.addCredential);
routes.delete('/residents/:id/credentials/:credentialId', ResidentController.removeCredential);
routes.post('/residents/:id/block', ResidentController.blockAccess);
routes.post('/residents/:id/unblock', ResidentController.unblockAccess);

// --- Rotas de Convites (iToken) ---
routes.post('/invites', adminMiddleware, InviteController.create);

// --- Rotas de Dispositivos ---
routes.get('/devices', DeviceController.index);
routes.get('/devices/:id', DeviceController.show);
routes.post('/devices', adminMiddleware, validateDevice, DeviceController.create);
routes.put('/devices/:id', adminMiddleware, DeviceController.update);
routes.delete('/devices/:id', adminMiddleware, DeviceController.delete);
// Comandos para dispositivos
routes.post('/devices/:id/sync', DeviceController.sync);
routes.get('/devices/:id/status', DeviceController.status);
routes.post('/devices/:id/reboot', DeviceController.reboot);

// --- Rotas de Visitantes ---
routes.get('/visitors', VisitorController.index);
routes.get('/visitors/active', VisitorController.getActive);
routes.get('/visitors/:id', VisitorController.show);
routes.post('/visitors', VisitorController.create);
routes.put('/visitors/:id', VisitorController.update);
routes.delete('/visitors/:id', VisitorController.delete);
// Check-in / Check-out
routes.post('/visitors/:id/checkin', VisitorController.checkIn);
routes.post('/visitors/:id/checkout', VisitorController.checkOut);

// --- Rotas de Acesso e Logs ---
routes.get('/access/logs', AccessController.getLogs);
routes.get('/access/logs/:id', AccessController.getLogById);
routes.get('/access/stats', AccessController.getStats);
routes.get('/access/report', AccessController.generateReport);
// Liberação Manual
routes.post('/access/grant', AccessController.grantAccess);
routes.post('/access/deny', AccessController.denyAccess);
// Realtime (SSE)
routes.get('/access/realtime', AccessController.realtime);

module.exports = routes;