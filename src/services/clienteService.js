import fetch from 'node-fetch';
import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Obtiene un cliente por su ID a través del ESB
 * @param {number} clienteId - ID del cliente
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Datos del cliente
 */
export const getClienteById = async (clienteId, token) => {
  try {
    // Validar parámetros
    if (!clienteId) {
      logger.error('Error: clienteId es undefined o null');
      throw new Error('ID de cliente no proporcionado');
    }
    
    if (!token) {
      logger.error('Error: token de autorización no proporcionado');
      throw new Error('Token de autorización es requerido');
    }
    
    // CORREGIDO: Eliminar la duplicación del prefijo '/api/esb2'
    // La configuración ya incluye este prefijo
    const url = `http://clientes:7000/clientes/${clienteId}`;
    logger.info(`Consultando cliente ID=${clienteId} a través del ESB: ${url}`);
    
    // Realizar solicitud
    const response = await fetch(url, {
      headers: {
        'Authorization': token
      }
    });
    
    if (!response.ok) {
      const errorStatus = response.status;
      const errorText = await response.text();
      logger.error(`Error al obtener cliente ID=${clienteId}: Status ${errorStatus}, Respuesta: ${errorText}`);
      throw new Error(`Cliente no encontrado (${errorStatus})`);
    }
    
    const cliente = await response.json();
    logger.info(`Cliente ID=${clienteId} obtenido correctamente`);
    
    return cliente;
  } catch (error) {
    logger.error(`Error al obtener cliente ID=${clienteId}: ${error.message}`);
    throw new Error(`Cliente no encontrado: ${error.message}`);
  }
};