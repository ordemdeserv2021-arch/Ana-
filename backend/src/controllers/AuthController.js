const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      if (!user.active) {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Atualiza último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      logger.info(`Login realizado: ${user.email}`);

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      logger.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async register(req, res) {
    try {
      const { name, email, password, role = 'USER' } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      logger.info(`Novo usuário registrado: ${user.email}`);

      return res.status(201).json(user);
    } catch (error) {
      logger.error('Erro no registro:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Usuário inválido' });
      }

      const newToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({ token: newToken });
    } catch (error) {
      logger.error('Erro ao atualizar token:', error);
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  async logout(req, res) {
    // Em uma implementação mais robusta, você pode adicionar o token a uma blacklist
    return res.json({ message: 'Logout realizado com sucesso' });
  }
}

module.exports = new AuthController();
