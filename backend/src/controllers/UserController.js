const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class UserController {
  async index(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: parseInt(limit),
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
            lastLogin: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      return res.json({
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, role, active } = req.body;

      // Verifica se usuário pode editar
      if (req.user.id !== id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Sem permissão para editar este usuário' });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = await bcrypt.hash(password, 10);
      
      // Apenas admins podem mudar role e status
      if ((req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') && role) {
        updateData.role = role;
      }
      if ((req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') && active !== undefined) {
        updateData.active = active;
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          updatedAt: true
        }
      });

      logger.info(`Usuário atualizado: ${user.email}`);

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      logger.info(`Usuário removido: ${id}`);

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao remover usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async profile(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          lastLogin: true,
          createdAt: true
        }
      });

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new UserController();
