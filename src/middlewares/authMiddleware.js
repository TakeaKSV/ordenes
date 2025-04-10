import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      logger.warn('Token no proporcionado');
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    
    // Verificar formato del token
    if (!token.startsWith('Bearer ')) {
      logger.warn('Formato de token inválido');
      return res.status(401).json({ error: 'Formato de token inválido' });
    }
    
    const tokenValue = token.split(' ')[1];
    
    try {
      const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET);
      logger.info(`Usuario autenticado: ${decodedToken.id}`);
      
      // Asignar usuario al objeto req para acceso posterior
      // Estandariza a "user" para mantener consistencia
      req.user = {
        id: decodedToken.id,
        usuarioId: decodedToken.id,
        email: decodedToken.email,
        role: decodedToken.role
      };
      
      // Para compatibilidad con código existente, mantén también "usuario"
      req.usuario = req.user;
      
      next();
    } catch (error) {
      logger.error(`Token inválido: ${error.message}`);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  } catch (error) {
    logger.error(`Error en verificación de token: ${error.message}`);
    return res.status(500).json({ error: 'Error interno en autenticación' });
  }
};