import morgan from 'morgan';
import logger from './logger.js';

// Crear un stream para que morgan escriba a nuestro logger de winston
const stream = {
  // Usar la función info del logger
  write: (message) => logger.http(message.trim()),
};

// Definir el formato que queremos para morgan
const format = ':method :url :status :res[content-length] - :response-time ms';

// Crear el middleware
const httpLogger = morgan(format, { stream });

export default httpLogger;