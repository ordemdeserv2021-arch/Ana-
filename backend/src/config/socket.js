const logger = require('./logger');

// Armazena conexões ativas dos dispositivos
const connectedDevices = new Map();

function initializeSocket(io) {
  io.on('connection', (socket) => {
    logger.info(`Nova conexão: ${socket.id}`);

    // Registro de dispositivo mobile
    socket.on('register_device', (data) => {
      const { deviceId, userId, deviceType } = data;
      connectedDevices.set(socket.id, {
        deviceId,
        userId,
        deviceType,
        connectedAt: new Date()
      });
      logger.info(`Dispositivo registrado: ${deviceId} (${deviceType})`);
      socket.emit('device_registered', { success: true });
    });

    // Evento de acesso liberado
    socket.on('access_granted', (data) => {
      logger.info(`Acesso liberado: ${JSON.stringify(data)}`);
      // Notifica todos os dispositivos admin conectados
      io.emit('access_log', {
        type: 'granted',
        ...data,
        timestamp: new Date()
      });
    });

    // Evento de acesso negado
    socket.on('access_denied', (data) => {
      logger.warn(`Acesso negado: ${JSON.stringify(data)}`);
      io.emit('access_log', {
        type: 'denied',
        ...data,
        timestamp: new Date()
      });
    });

    // Sincronização de dados
    socket.on('sync_request', (data) => {
      logger.info(`Solicitação de sincronização: ${socket.id}`);
      // Aqui será implementada a lógica de sincronização com Control ID
      socket.emit('sync_response', { 
        success: true, 
        message: 'Sincronização iniciada' 
      });
    });

    // Desconexão
    socket.on('disconnect', () => {
      const device = connectedDevices.get(socket.id);
      if (device) {
        logger.info(`Dispositivo desconectado: ${device.deviceId}`);
        connectedDevices.delete(socket.id);
      }
    });
  });

  logger.info('WebSocket inicializado');
}

function getConnectedDevices() {
  return Array.from(connectedDevices.values());
}

function notifyAllDevices(event, data) {
  // Esta função será usada para notificar todos os dispositivos conectados
}

module.exports = { 
  initializeSocket, 
  getConnectedDevices,
  notifyAllDevices 
};
