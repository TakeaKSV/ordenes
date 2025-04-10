import fetch from 'node-fetch';
import config from '../config/config.js';

/**
 * Obtiene un producto por su ID a través del ESB
 * @param {number} productoId - ID del producto
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Datos del producto
 */
export const getProductoById = async (productoId, token) => {
  try {
    const response = await fetch(`http://productos:7001/productos/${productoId}`, {
      method: 'GET',
      headers: {
        'Authorization': token
      }
    });
    
    if (!response.ok) {
      throw new Error(`Producto no encontrado (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener producto ID=${productoId}:`, error);
    throw new Error(`Error al obtener producto: ${error.message}`);
  }
};

/**
 * Actualiza el stock de un producto
 * @param {number} productoId - ID del producto
 * @param {number} cantidad - Cantidad a incrementar/decrementar
 * @param {string} operacion - 'decrementar' (default) o 'incrementar'
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const actualizarStockProducto = async (productoId, cantidad, token, operacion = 'decrementar') => {
  try {
    const response = await fetch(`http://productos:7001/productos/${productoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        cantidad,
        operacion
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error al actualizar stock del producto (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error al ${operacion} stock del producto ID=${productoId}:`, error);
    throw new Error(`Error al actualizar stock del producto: ${error.message}`);
  }
};
