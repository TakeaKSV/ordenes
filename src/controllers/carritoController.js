import Carrito from "../models/Carrito.js";
import ItemCarrito from "../models/ItemCarrito.js";
import { getProductoById } from "../services/productoService.js";
import sequelize from "../config/database.js";

// Obtener o crear carrito para un usuario
export const obtenerCarritoUsuario = async (req, res) => {
  const { usuarioId } = req.user;

  try {
    // Buscar si ya existe un carrito activo para el usuario
    let carrito = await Carrito.findOne({
      where: { usuarioId, activo: true },
      include: [{ model: ItemCarrito, as: 'items' }]
    });

    // Si no existe, crear uno nuevo
    if (!carrito) {
      carrito = await Carrito.create({ usuarioId });
      // Recargar para obtener el carrito con la relación items (vacío)
      carrito = await Carrito.findOne({
        where: { id: carrito.id },
        include: [{ model: ItemCarrito, as: 'items' }]
      });
    }

    res.json(carrito);
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ error: error.message });
  }
};

// Agregar producto al carrito
export const agregarProductoAlCarrito = async (req, res) => {
  const { usuarioId } = req.user;
  const { productoId, cantidad = 1 } = req.body;

  if (!productoId) {
    return res.status(400).json({ error: "El ID del producto es requerido" });
  }

  try {
    // Obtener información del producto desde el servicio de productos
    const producto = await getProductoById(productoId, req.header('Authorization'));

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (producto.stock < cantidad) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles` 
      });
    }

    const transaction = await sequelize.transaction();

    try {
      // Buscar u obtener el carrito activo del usuario
      let carrito = await Carrito.findOne({
        where: { usuarioId, activo: true },
        transaction
      });

      // Si no existe, crear uno nuevo
      if (!carrito) {
        carrito = await Carrito.create({ usuarioId }, { transaction });
      }

      // Verificar si el producto ya está en el carrito
      let itemCarrito = await ItemCarrito.findOne({
        where: { carritoId: carrito.id, productoId },
        transaction
      });

      if (itemCarrito) {
        // Actualizar cantidad si ya existe
        const nuevaCantidad = itemCarrito.cantidad + parseInt(cantidad);
        
        if (nuevaCantidad > producto.stock) {
          await transaction.rollback();
          return res.status(400).json({ 
            error: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles` 
          });
        }
        
        await itemCarrito.update({ 
          cantidad: nuevaCantidad 
        }, { transaction });
      } else {
        // Crear nuevo item si no existe
        itemCarrito = await ItemCarrito.create({
          carritoId: carrito.id,
          productoId,
          cantidad: parseInt(cantidad),
          precioUnitario: producto.precio,
          nombreProducto: producto.nombre
        }, { transaction });
      }

      await transaction.commit();

      // Recargar el carrito con todos sus items para devolverlo en la respuesta
      const carritoActualizado = await Carrito.findOne({
        where: { id: carrito.id },
        include: [{ model: ItemCarrito, as: 'items' }]
      });

      res.status(201).json({
        mensaje: "Producto agregado al carrito",
        carrito: carritoActualizado
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar cantidad de un producto en el carrito
export const actualizarCantidadProducto = async (req, res) => {
  const { usuarioId } = req.user;
  const { itemId } = req.params;
  const { cantidad } = req.body;

  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ error: "La cantidad debe ser al menos 1" });
  }

  try {
    // Verificar que el carrito pertenece al usuario
    const carrito = await Carrito.findOne({
      where: { usuarioId, activo: true }
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Buscar el item en el carrito
    const itemCarrito = await ItemCarrito.findOne({
      where: { id: itemId, carritoId: carrito.id }
    });

    if (!itemCarrito) {
      return res.status(404).json({ error: "Item no encontrado en el carrito" });
    }

    // Verificar stock disponible
    const producto = await getProductoById(itemCarrito.productoId, req.header('Authorization'));
    
    if (cantidad > producto.stock) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo hay ${producto.stock} unidades disponibles` 
      });
    }

    // Actualizar cantidad
    await itemCarrito.update({ cantidad: parseInt(cantidad) });

    // Recargar el carrito con todos sus items
    const carritoActualizado = await Carrito.findOne({
      where: { id: carrito.id },
      include: [{ model: ItemCarrito, as: 'items' }]
    });

    res.json({
      mensaje: "Cantidad actualizada correctamente",
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto del carrito
export const eliminarProductoDelCarrito = async (req, res) => {
  const { usuarioId } = req.user;
  const { itemId } = req.params;

  try {
    // Verificar que el carrito pertenece al usuario
    const carrito = await Carrito.findOne({
      where: { usuarioId, activo: true }
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Eliminar el item del carrito
    const resultado = await ItemCarrito.destroy({
      where: { id: itemId, carritoId: carrito.id }
    });

    if (resultado === 0) {
      return res.status(404).json({ error: "Item no encontrado en el carrito" });
    }

    // Recargar el carrito con todos sus items
    const carritoActualizado = await Carrito.findOne({
      where: { id: carrito.id },
      include: [{ model: ItemCarrito, as: 'items' }]
    });

    res.json({
      mensaje: "Producto eliminado del carrito",
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ error: error.message });
  }
};

// Vaciar carrito
export const vaciarCarrito = async (req, res) => {
  const { usuarioId } = req.user;

  try {
    // Verificar que el carrito pertenece al usuario
    const carrito = await Carrito.findOne({
      where: { usuarioId, activo: true }
    });

    if (!carrito) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    // Eliminar todos los items del carrito
    await ItemCarrito.destroy({
      where: { carritoId: carrito.id }
    });

    res.json({
      mensaje: "Carrito vaciado correctamente",
      carrito: {
        id: carrito.id,
        usuarioId: carrito.usuarioId,
        items: []
      }
    });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({ error: error.message });
  }
};