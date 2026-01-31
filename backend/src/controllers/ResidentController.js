const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class ResidentController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, condominiumId, search, blocked } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (condominiumId) where.condominiumId = condominiumId;
      if (blocked !== undefined) where.blocked = blocked === 'true';
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { document: { contains: search } },
          { unit: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [residents, total] = await Promise.all([
        prisma.resident.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            condominium: {
              select: { id: true, name: true }
            },
            credentials: true
          },
          orderBy: { name: 'asc' }
        }),
        prisma.resident.count({ where })
      ]);

      return res.json({
        data: residents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar moradores:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { 
        name, document, email, phone, unit, block,
        condominiumId, type, photo, notes 
      } = req.body;

      const resident = await prisma.resident.create({
        data: {
          name,
          document,
          email,
          phone,
          unit,
          block,
          condominiumId,
          type: type || 'RESIDENT',
          photo,
          notes
        },
        include: {
          condominium: {
            select: { id: true, name: true }
          }
        }
      });

      // Notifica dispositivos conectados sobre novo morador
      const io = req.app.get('io');
      io.emit('resident_created', resident);

      logger.info(`Morador cadastrado: ${resident.name}`);

      return res.status(201).json(resident);
    } catch (error) {
      logger.error('Erro ao criar morador:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const resident = await prisma.resident.findUnique({
        where: { id },
        include: {
          condominium: true,
          credentials: true,
          accessLogs: {
            take: 20,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!resident) {
        return res.status(404).json({ error: 'Morador não encontrado' });
      }

      return res.json(resident);
    } catch (error) {
      logger.error('Erro ao buscar morador:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { 
        name, document, email, phone, unit, block,
        type, photo, notes 
      } = req.body;

      const resident = await prisma.resident.update({
        where: { id },
        data: {
          name,
          document,
          email,
          phone,
          unit,
          block,
          type,
          photo,
          notes
        }
      });

      // Notifica dispositivos sobre atualização
      const io = req.app.get('io');
      io.emit('resident_updated', resident);

      logger.info(`Morador atualizado: ${resident.name}`);

      return res.json(resident);
    } catch (error) {
      logger.error('Erro ao atualizar morador:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const resident = await prisma.resident.delete({
        where: { id }
      });

      // Notifica dispositivos sobre remoção
      const io = req.app.get('io');
      io.emit('resident_deleted', { id });

      logger.info(`Morador removido: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover morador:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addCredential(req, res) {
    try {
      const { id } = req.params;
      const { type, value, validUntil } = req.body;

      const credential = await prisma.credential.create({
        data: {
          type, // CARD, BIOMETRIC, QR_CODE, PIN
          value,
          validUntil: validUntil ? new Date(validUntil) : null,
          residentId: id
        }
      });

      // Sincroniza com dispositivos Control ID
      const io = req.app.get('io');
      io.emit('credential_added', { residentId: id, credential });

      logger.info(`Credencial adicionada ao morador: ${id}`);

      return res.status(201).json(credential);
    } catch (error) {
      logger.error('Erro ao adicionar credencial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async removeCredential(req, res) {
    try {
      const { id, credentialId } = req.params;

      await prisma.credential.delete({
        where: { id: credentialId }
      });

      // Sincroniza com dispositivos
      const io = req.app.get('io');
      io.emit('credential_removed', { residentId: id, credentialId });

      logger.info(`Credencial removida: ${credentialId}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover credencial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async blockAccess(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const resident = await prisma.resident.update({
        where: { id },
        data: {
          blocked: true,
          blockedReason: reason,
          blockedAt: new Date()
        }
      });

      // Notifica dispositivos para bloquear acesso
      const io = req.app.get('io');
      io.emit('resident_blocked', { id, reason });

      logger.warn(`Acesso bloqueado: ${resident.name} - ${reason}`);

      return res.json(resident);
    } catch (error) {
      logger.error('Erro ao bloquear acesso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async unblockAccess(req, res) {
    try {
      const { id } = req.params;

      const resident = await prisma.resident.update({
        where: { id },
        data: {
          blocked: false,
          blockedReason: null,
          blockedAt: null
        }
      });

      // Notifica dispositivos para desbloquear
      const io = req.app.get('io');
      io.emit('resident_unblocked', { id });

      logger.info(`Acesso desbloqueado: ${resident.name}`);

      return res.json(resident);
    } catch (error) {
      logger.error('Erro ao desbloquear acesso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new ResidentController();
