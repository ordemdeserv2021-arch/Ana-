require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const routes = require('./routes');
const logger = require('./config/logger');
const { initializeSocket } = require('./config/socket');

const app = express();
const server = http.createServer(app);

// Configuração do Socket.IO para comunicação assíncrona com mobile
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir uploads estáticos
app.use('/uploads', express.static(require('path').join(__dirname, '..', 'uploads')));

// Disponibiliza io para as rotas
app.set('io', io);

// Rotas
app.use('/api', routes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Ana - Sistema de Controle de Acesso' });
});

// Inicializa WebSocket
initializeSocket(io);

// Tratamento de erros global
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`Servidor Ana rodando na porta ${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
