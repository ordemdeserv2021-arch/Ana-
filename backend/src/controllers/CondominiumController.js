const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class CondominiumController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, type, search } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [condominiums, total] = await Promise.all([
        prisma.condominium.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            _count: {
              select: {
                residents: true,
                devices: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.condominium.count({ where })
      ]);

      return res.json({
        data: condominiums,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar condomínios:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req, res) {
    try {
      const { name, address, type, phone, email, cnpj, managerId } = req.body;

      const condominium = await prisma.condominium.create({
        data: {
          name,
          address,
          type,
          phone,
          email,
          cnpj,
          managerId
        }
      });

      logger.info(`Condomínio criado: ${condominium.name}`);

      return res.status(201).json(condominium);
    } catch (error) {
      logger.error('Erro ao criar condomínio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const condominium = await prisma.condominium.findUnique({
        where: { id },
        include: {
          residents: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          devices: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              residents: true,
              accessLogs: true
            }
          }
        }
      });

      if (!condominium) {
        return res.status(404).json({ error: 'Condomínio não encontrado' });
      }

      return res.json(condominium);
    } catch (error) {
      logger.error('Erro ao buscar condomínio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, address, type, phone, email, cnpj, managerId, active } = req.body;

      const condominium = await prisma.condominium.update({
        where: { id },
        data: {
          name,
          address,
          type,
          phone,
          email,
          cnpj,
          managerId,
          active
        }
      });

      logger.info(`Condomínio atualizado: ${condominium.name}`);

      return res.json(condominium);
    } catch (error) {
      logger.error('Erro ao atualizar condomínio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.condominium.delete({
        where: { id }
      });

      logger.info(`Condomínio removido: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover condomínio:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async stats(req, res) {
    try {
      const { id } = req.params;

      const [residents, accessToday, devicesOnline] = await Promise.all([
        prisma.resident.count({ where: { condominiumId: id } }),
        prisma.accessLog.count({
          where: {
            condominiumId: id,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        prisma.device.count({
          where: {
            condominiumId: id,
            status: 'ONLINE'
          }
        })
      ]);

      return res.json({
        residents,
        accessToday,
        devicesOnline
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new CondominiumController();
