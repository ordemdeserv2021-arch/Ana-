const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');
// const ControlIdService = require('../services/ControlIdService');

const prisma = new PrismaClient();

class DeviceController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, condominiumId, status } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (condominiumId) where.condominiumId = condominiumId;
      if (status) where.status = status;

      const [devices, total] = await Promise.all([
        prisma.device.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            condominium: {
              select: { id: true, name: true }
            }
          },
          orderBy: { name: 'asc' }
        }),
        prisma.device.count({ where })
      ]);

      return res.json({
        data: devices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar dispositivos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { 
        name, ip, port = 80, model, serialNumber, 
        location, condominiumId, description 
      } = req.body;

      const device = await prisma.device.create({
        data: {
          name,
          ip,
          port,
          model,
          serialNumber,
          location,
          condominiumId,
          description,
          status: 'OFFLINE'
        }
      });

      logger.info(`Dispositivo cadastrado: ${device.name} (${device.ip})`);

      return res.status(201).json(device);
    } catch (error) {
      logger.error('Erro ao criar dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id },
        include: {
          condominium: true,
          accessLogs: {
            take: 20,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!device) {
        return res.status(404).json({ error: 'Dispositivo não encontrado' });
      }

      return res.json(device);
    } catch (error) {
      logger.error('Erro ao buscar dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, ip, port, location, description, active } = req.body;

      const device = await prisma.device.update({
        where: { id },
        data: {
          name,
          ip,
          port,
          location,
          description,
          active
        }
      });

      logger.info(`Dispositivo atualizado: ${device.name}`);

      return res.json(device);
    } catch (error) {
      logger.error('Erro ao atualizar dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.device.delete({
        where: { id }
      });

      logger.info(`Dispositivo removido: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async sync(req, res) {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id }
      });

      if (!device) {
        return res.status(404).json({ error: 'Dispositivo não encontrado' });
      }

      // TODO: Implementar sincronização real com Control ID
      // const result = await ControlIdService.syncDevice(device);

      // Por enquanto, simula sincronização
      await prisma.device.update({
        where: { id },
        data: { 
          lastSync: new Date(),
          status: 'ONLINE'
        }
      });

      // Notifica via WebSocket
      const io = req.app.get('io');
      io.emit('device_synced', { deviceId: id, timestamp: new Date() });

      logger.info(`Dispositivo sincronizado: ${device.name}`);

      return res.json({ 
        message: 'Sincronização iniciada',
        device: device.name
      });
    } catch (error) {
      logger.error('Erro ao sincronizar dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async status(req, res) {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          ip: true,
          status: true,
          lastSync: true,
          lastPing: true
        }
      });

      if (!device) {
        return res.status(404).json({ error: 'Dispositivo não encontrado' });
      }

      // TODO: Implementar ping real ao dispositivo
      // const isOnline = await ControlIdService.pingDevice(device.ip);

      return res.json({
        ...device,
        online: device.status === 'ONLINE'
      });
    } catch (error) {
      logger.error('Erro ao verificar status:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async reboot(req, res) {
    try {
      const { id } = req.params;

      const device = await prisma.device.findUnique({
        where: { id }
      });

      if (!device) {
        return res.status(404).json({ error: 'Dispositivo não encontrado' });
      }

      // TODO: Implementar reboot real via API Control ID
      // await ControlIdService.rebootDevice(device);

      logger.warn(`Reiniciando dispositivo: ${device.name}`);

      return res.json({ 
        message: 'Comando de reinicialização enviado',
        device: device.name
      });
    } catch (error) {
      logger.error('Erro ao reiniciar dispositivo:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new DeviceController();
