const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class AccessController {
  async getLogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        condominiumId, 
        residentId,
        deviceId,
        type,
        startDate,
        endDate 
      } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (condominiumId) where.condominiumId = condominiumId;
      if (residentId) where.residentId = residentId;
      if (deviceId) where.deviceId = deviceId;
      if (type) where.type = type;
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [logs, total] = await Promise.all([
        prisma.accessLog.findMany({
          where,
          skip,
          take: parseInt(limit),
          include: {
            resident: {
              select: { id: true, name: true, unit: true, photo: true }
            },
            device: {
              select: { id: true, name: true, location: true }
            },
            condominium: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.accessLog.count({ where })
      ]);

      return res.json({
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar logs de acesso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getLogById(req, res) {
    try {
      const { id } = req.params;

      const log = await prisma.accessLog.findUnique({
        where: { id },
        include: {
          resident: true,
          device: true,
          condominium: true
        }
      });

      if (!log) {
        return res.status(404).json({ error: 'Log não encontrado' });
      }

      return res.json(log);
    } catch (error) {
      logger.error('Erro ao buscar log:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async grantAccess(req, res) {
    try {
      const { residentId, deviceId, condominiumId, reason } = req.body;

      const log = await prisma.accessLog.create({
        data: {
          type: 'GRANTED',
          method: 'MANUAL',
          residentId,
          deviceId,
          condominiumId,
          grantedBy: req.user.id,
          notes: reason
        },
        include: {
          resident: {
            select: { name: true, unit: true }
          }
        }
      });

      // Notifica dispositivos em tempo real
      const io = req.app.get('io');
      io.emit('access_granted', {
        log,
        timestamp: new Date()
      });

      logger.info(`Acesso liberado manualmente para: ${log.resident?.name || 'Visitante'}`);

      return res.status(201).json(log);
    } catch (error) {
      logger.error('Erro ao liberar acesso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async denyAccess(req, res) {
    try {
      const { residentId, deviceId, condominiumId, reason } = req.body;

      const log = await prisma.accessLog.create({
        data: {
          type: 'DENIED',
          method: 'MANUAL',
          residentId,
          deviceId,
          condominiumId,
          deniedBy: req.user.id,
          notes: reason
        }
      });

      // Notifica em tempo real
      const io = req.app.get('io');
      io.emit('access_denied', {
        log,
        reason,
        timestamp: new Date()
      });

      logger.warn(`Acesso negado: ${reason}`);

      return res.status(201).json(log);
    } catch (error) {
      logger.error('Erro ao negar acesso:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async realtime(req, res) {
    // Server-Sent Events para atualizações em tempo real
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const io = req.app.get('io');

    const onAccess = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    io.on('access_log', onAccess);

    req.on('close', () => {
      io.off('access_log', onAccess);
    });
  }

  async generateReport(req, res) {
    try {
      const { condominiumId, startDate, endDate, format = 'json' } = req.query;

      const where = { condominiumId };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const logs = await prisma.accessLog.findMany({
        where,
        include: {
          resident: {
            select: { name: true, unit: true, document: true }
          },
          device: {
            select: { name: true, location: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      // Estatísticas
      const stats = {
        total: logs.length,
        granted: logs.filter(l => l.type === 'GRANTED').length,
        denied: logs.filter(l => l.type === 'DENIED').length,
        byMethod: {},
        byHour: {}
      };

      logs.forEach(log => {
        // Por método
        stats.byMethod[log.method] = (stats.byMethod[log.method] || 0) + 1;
        
        // Por hora
        const hour = new Date(log.createdAt).getHours();
        stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
      });

      return res.json({
        period: { startDate, endDate },
        stats,
        logs
      });
    } catch (error) {
      logger.error('Erro ao gerar relatório:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getStats(req, res) {
    try {
      const { condominiumId } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const where = condominiumId ? { condominiumId } : {};

      const [todayAccess, weekAccess, monthAccess] = await Promise.all([
        prisma.accessLog.count({
          where: {
            ...where,
            createdAt: { gte: today }
          }
        }),
        prisma.accessLog.count({
          where: {
            ...where,
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        }),
        prisma.accessLog.count({
          where: {
            ...where,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      // Últimos acessos
      const recentAccess = await prisma.accessLog.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          resident: {
            select: { name: true, unit: true, photo: true }
          },
          device: {
            select: { name: true }
          }
        }
      });

      return res.json({
        today: todayAccess,
        week: weekAccess,
        month: monthAccess,
        recent: recentAccess
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AccessController();
