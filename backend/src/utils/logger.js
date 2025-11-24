// src/utils/logger.js

// Definir los niveles de log y sus colores (usando códigos ANSI)
const LOG_LEVELS = {
    DEBUG: { color: '\x1b[34m', prefix: 'DEBUG' }, // Azul
    INFO: { color: '\x1b[32m', prefix: 'INFO ' },  // Verde
    WARN: { color: '\x1b[33m', prefix: 'WARN ' },  // Amarillo
    ERROR: { color: '\x1b[31m', prefix: 'ERROR' }, // Rojo
    SUCCESS: { color: '\x1b[36m', prefix: 'SUCCESS' } // Cyan
};

const RESET_COLOR = '\x1b[0m';

/**
 * Función principal para formatear y emitir el log.
 * @param {string} level - Nivel del log (ej: 'INFO', 'ERROR').
 * @param {string} message - Mensaje a loguear.
 * @param {object} context - Objeto de contexto (ej: req.params, error object).
 */
const log = (level, message, context = null) => {
    const levelConfig = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    const timestamp = new Date().toISOString();

    // Formato: [TIMESTAMP] [NIVEL] - Mensaje
    let logMessage = `${levelConfig.color}[${timestamp}] [${levelConfig.prefix}]${RESET_COLOR} - ${message}`;

    // Si hay contexto, lo añadimos al mensaje
    if (context) {
        logMessage += `\n${JSON.stringify(context, null, 2)}`;
    }

    // Usar el método de consola apropiado
    if (level === 'ERROR') {
        console.error(logMessage);
    } else if (level === 'WARN') {
        console.warn(logMessage);
    } else {
        console.log(logMessage);
    }
};

// --- Logger Exportable ---

export const logger = {
    debug: (message, context) => log('DEBUG', message, context),
    info: (message, context) => log('INFO', message, context),
    warn: (message, context) => log('WARN', message, context),
    error: (message, context) => log('ERROR', message, context),
    success: (message, context) => log('SUCCESS', message, context),
};