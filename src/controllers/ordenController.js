import sequelize from "../config/database.js";
import Orden from "../models/Orden.js";
import DetalleOrden from "../models/DetalleOrden.js";
import Carrito from "../models/Carrito.js"; 
import ItemCarrito from "../models/ItemCarrito.js";
import { getClienteById } from "../services/clienteService.js";
import { actualizarStockProducto } from "../services/productoService.js";
import { ordenCreatedEvent, ordenStatusUpdatedEvent } from "../services/rabbitServiceEvent.js";
import logger from "../utils/logger.js";

// Crear una nueva orden desde el carrito del usuario
// Crear una nueva orden
export const crearOrden = async (req, res) => {
  const usuarioId = req.user?.id || req.usuario?.id;

  // Verificar que el usuario esté autenticado
  if (!usuarioId) {
    logger.error('Error: usuarioId indefinido. Token posiblemente inválido');
    return res.status(401).json({ error: "Usuario no autenticado correctamente" });
  }

  const { 
    direccionEnvio, 
    metodoPago,
    referenciaPago = null,
    notas = null
  } = req.body;

  // Logs para depuración
  logger.info(`Creando orden para usuario ${usuarioId}`);
  logger.info(`Datos de la orden: direccionEnvio=${direccionEnvio}, metodoPago=${metodoPago}`);

  // Validaciones previas a la transacción
  if (!direccionEnvio) {
    return res.status(400).json({ error: "La dirección de envío es requerida" });
  }

  if (!metodoPago) {
    return res.status(400).json({ error: "El método de pago es requerido" });
  }

  let transaction;
  
  try {
    transaction = await sequelize.transaction();

    // Crear la orden
    const orden = await Orden.create({
      usuarioId,
      total: 0,  // Aquí puedes calcular el total si lo necesitas
      direccionEnvio,
      metodoPago,
      referenciaPago,
      notas,
      estado: 'pendiente'
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      mensaje: "Orden creada con éxito",
      orden
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error(`Error al crear orden: ${error.message}`, { stack: error.stack });

    return res.status(500).json({ error: `Error al crear orden: ${error.message}` });
  }
};


// Obtener todas las órdenes del usuario actual
export const obtenerOrdenesUsuario = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Solo los administradores pueden realizar esta operación" });
  }
  try {
    // Obtener el usuarioId del token, con una validación adicional
    const usuarioId = req.user?.usuarioId;
    
    if (!usuarioId) {
      return res.status(400).json({ 
        error: "No se pudo identificar al usuario. Verifica tu token de autenticación." 
      });
    }
    
    const ordenes = await Orden.findAll({
      where: { usuarioId },
      include: [{ model: DetalleOrden, as: 'detalles' }],
      order: [['createdAt', 'DESC']]
    });

    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener una orden específica
export const obtenerOrdenPorId = async (req, res) => {
  const { usuarioId } = req.user;
  const { id } = req.params;
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Solo los administradores pueden realizar esta operación" });
    }

    const orden = await Orden.findOne({
      where: { id, usuarioId },
      include: [{ model: DetalleOrden, as: 'detalles' }]
    });

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(orden);
  } catch (error) {
    console.error("Error al obtener orden:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar el estado de una orden
export const actualizarEstadoOrden = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Validaciones...
  
  let transaction;
  
  try {
    transaction = await sequelize.transaction();
    
    const orden = await Orden.findByPk(id, { 
      transaction,
      lock: true, // Bloqueo optimista para evitar problemas de concurrencia
      include: [{ model: DetalleOrden, as: 'detalles' }]
    });

    if (!orden) {
      throw new Error("Orden no encontrada");
    }
    
    // Validar transiciones de estado...
    
    // Si la orden está cancelada y estaba en pendiente o pagada, restaurar el stock
    if (estado === 'cancelada' && ['pendiente', 'pagada'].includes(orden.estado)) {
      // Restaurar stock para cada producto
      for (const detalle of orden.detalles) {
        await actualizarStockProducto(
          detalle.productoId, 
          detalle.cantidad, 
          'incrementar',
          req.header('Authorization')
        );
      }
    }

    // Actualizar el estado
    await orden.update({ estado }, { transaction });
    
    // Publicar evento de cambio de estado
    await ordenStatusUpdatedEvent(orden);

    await transaction.commit();
    
    res.json({
      mensaje: "Estado de la orden actualizado correctamente",
      orden: orden
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error al actualizar estado de la orden:", error);
    res.status(error.message.includes("no encontrada") ? 404 : 400).json({ error: error.message });
  }
};

// Obtener todas las órdenes (para administradores)
export const obtenerTodasLasOrdenes = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "No tiene permisos para realizar esta acción" });
    }

    const ordenes = await Orden.findAll({
      include: [{ model: DetalleOrden, as: 'detalles' }],
      order: [['createdAt', 'DESC']]
    });

    res.json(ordenes);
  } catch (error) {
    console.error("Error al obtener todas las órdenes:", error);
    res.status(500).json({ error: error.message });
  }
};