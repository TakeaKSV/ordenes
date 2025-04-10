import express from "express";
import { swaggerUi, specs } from './src/api-docs.js';
import cors from "cors";
import sequelize from "./src/config/database.js";
import ordenRoutes from "./src/routes/ordenRoutes.js";
import carritoRoutes from "./src/routes/carritoRoutes.js";
import setupAssociations from "./src/models/associations.js";
import httpLogger from "./src/utils/httpLogger.js";
import logger from "./src/utils/logger.js";
import config from "./src/config/config.js";

const app = express();

// Middleware para logging HTTP
app.use(httpLogger);

// Middleware básicos
app.use(express.json());
app.use(cors());

// Rutas de la API
app.use("/ordenes", ordenRoutes);
app.use("/carrito", carritoRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware para manejo de errores global
app.use((err, req, res, next) => {
  logger.error('Error no controlado', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Establecer las asociaciones de los modelos
setupAssociations();

// Conectar a la base de datos y sincronizar modelos
sequelize
  .sync()
  .then(() => {
    logger.info("✅ Base de datos sincronizada");
    
    // Levantar el servidor
    const PORT = config.server.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor de órdenes corriendo en el puerto ${PORT}`, {
        environment: config.environment,
        port: PORT
      });
    });
  })
  .catch((error) => {
    logger.error("❌ Error al conectar a la base de datos:", { error: error.message });
    process.exit(1);
  });