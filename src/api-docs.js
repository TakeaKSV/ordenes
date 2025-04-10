import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Órdenes',
      version: '1.0.0',
      description: 'API para la gestión de carritos de compra y órdenes.',
    },
    servers: [
      {
        url: 'http://localhost:7002',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js'], // Ruta a tus archivos de rutas
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };