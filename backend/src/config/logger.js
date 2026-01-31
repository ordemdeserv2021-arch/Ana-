const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ana-backend' },
  transports: [
    // Arquivo de erros
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Arquivo com todos os logs
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Em desenvolvimento, também loga no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
