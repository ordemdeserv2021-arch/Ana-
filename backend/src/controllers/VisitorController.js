const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class VisitorController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, condominiumId, status, search } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (condominiumId) where.condominiumId = condominiumId;
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { document: { contains: search } }
        ];
      }

      const [visitors, total] = await Promise.all([
        prisma.visitor.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            condominium: {
              select: { id: true, name: true }
            },
            visitingResident: {
              select: { id: true, name: true, unit: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.visitor.count({ where })
      ]);

      return res.json({
        data: visitors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar visitantes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { 
        name, document, phone, photo, vehicle, 
        vehiclePlate, visitingResidentId, condominiumId,
        reason, expectedDate, notes 
      } = req.body;

      const visitor = await prisma.visitor.create({
        data: {
          name,
          document,
          phone,
          photo,
          vehicle,
          vehiclePlate,
          visitingResidentId,
          condominiumId,
          reason,
          expectedDate: expectedDate ? new Date(expectedDate) : null,
          notes,
          status: 'PENDING',
          registeredBy: req.user.id
        },
        include: {
          visitingResident: {
            select: { name: true, unit: true }
          }
        }
      });

      // Notifica portaria
      const io = req.app.get('io');
      io.emit('visitor_registered', visitor);

      logger.info(`Visitante cadastrado: ${visitor.name}`);

      return res.status(201).json(visitor);
    } catch (error) {
      logger.error('Erro ao criar visitante:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          condominium: true,
          visitingResident: true,
          accessLogs: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!visitor) {
        return res.status(404).json({ error: 'Visitante não encontrado' });
      }

      return res.json(visitor);
    } catch (error) {
      logger.error('Erro ao buscar visitante:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, document, phone, photo, vehicle, 
        vehiclePlate, reason, notes 
      } = req.body;

      const visitor = await prisma.visitor.update({
        where: { id },
        data: {
          name,
          document,
          phone,
          photo,
          vehicle,
          vehiclePlate,
          reason,
          notes
        }
      });

      logger.info(`Visitante atualizado: ${visitor.name}`);

      return res.json(visitor);
    } catch (error) {
      logger.error('Erro ao atualizar visitante:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.visitor.delete({
        where: { id }
      });

      logger.info(`Visitante removido: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover visitante:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async checkIn(req, res) {
    try {
      const { id } = req.params;
      const { deviceId } = req.body;

      const visitor = await prisma.visitor.update({
        where: { id },
        data: {
          status: 'INSIDE',
          checkInAt: new Date(),
          checkInBy: req.user.id
        }
      });

      // Registra log de acesso
      await prisma.accessLog.create({
        data: {
          type: 'GRANTED',
          method: 'MANUAL',
          visitorId: id,
          deviceId,
          condominiumId: visitor.condominiumId,
          grantedBy: req.user.id,
          notes: 'Check-in de visitante'
        }
      });

      // Notifica em tempo real
      const io = req.app.get('io');
      io.emit('visitor_checkin', visitor);

      logger.info(`Check-in realizado: ${visitor.name}`);

      return res.json(visitor);
    } catch (error) {
      logger.error('Erro no check-in:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async checkOut(req, res) {
    try {
      const { id } = req.params;
      const { deviceId } = req.body;

      const visitor = await prisma.visitor.update({
        where: { id },
        data: {
          status: 'LEFT',
          checkOutAt: new Date(),
          checkOutBy: req.user.id
        }
      });

      // Registra log de saída
      await prisma.accessLog.create({
        data: {
          type: 'EXIT',
          method: 'MANUAL',
          visitorId: id,
          deviceId,
          condominiumId: visitor.condominiumId,
          notes: 'Check-out de visitante'
        }
      });

      // Notifica em tempo real
      const io = req.app.get('io');
      io.emit('visitor_checkout', visitor);

      logger.info(`Check-out realizado: ${visitor.name}`);

      return res.json(visitor);
    } catch (error) {
      logger.error('Erro no check-out:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getActive(req, res) {
    try {
      const { condominiumId } = req.query;

      const where = { status: 'INSIDE' };
      if (condominiumId) where.condominiumId = condominiumId;

      const visitors = await prisma.visitor.findMany({
        where,
        include: {
          visitingResident: {
            select: { name: true, unit: true }
          }
        },
        orderBy: { checkInAt: 'desc' }
      });

      return res.json(visitors);
    } catch (error) {
      logger.error('Erro ao listar visitantes ativos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new VisitorController();
