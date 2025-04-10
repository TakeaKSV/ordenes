import dotenv from 'dotenv';

dotenv.config();

export default {
  server: {
    port: process.env.PORT || 7002
  },
  environment: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.MYSQL_URL 
  },
  services: {
    // Corrige la URL del ESB para que sea http://esb-service:8080/api/esb2
    esb: process.env.ESB_URL || 'http://esb-service:8080/api/esb2',
    auth: process.env.AUTH_URL || 'http://auth-service:8000/api/auth'
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672'
  }
};