import winston from 'winston';
import config from '../config/config.js';

// Define los niveles de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define el nivel de logging según el entorno
const level = () => {
  const env = config.environment || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Define colores para cada nivel de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Añade colores a los niveles
winston.addColors(colors);

// Define el formato de los logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define los transportes para los logs
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Crea el logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;