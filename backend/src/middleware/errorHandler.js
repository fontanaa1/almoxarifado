// src/middleware/errorHandler.js
const winston = require('winston');

// Configuração do logger
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';

    // Log do erro
    logger.error({
        message: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Erros do Supabase
    if (err.code) {
        switch (err.code) {
            case 'PGRST116':
                return res.status(404).json({ error: 'Registro não encontrado' });
            case '23505':
                return res.status(409).json({ error: 'Registro duplicado' });
            case '23503':
                return res.status(400).json({ error: 'Violação de chave estrangeira' });
            default:
                return res.status(500).json({ error: 'Erro no banco de dados' });
        }
    }

    // Erro de validação Joi
    if (err.isJoi) {
        return res.status(400).json({ error: err.details[0].message });
    }

    // Resposta padrão
    res.status(statusCode).json({ 
        error: message,
        timestamp: new Date().toISOString()
    });
};

module.exports = { errorHandler, logger };
