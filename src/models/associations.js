import Orden from './Orden.js';
import DetalleOrden from './DetalleOrden.js';
import Carrito from './Carrito.js';
import ItemCarrito from './ItemCarrito.js';

export default function setupAssociations() {
  // Relaciones Carrito-ItemCarrito
  Carrito.hasMany(ItemCarrito, { foreignKey: 'carritoId', as: 'items' });
  ItemCarrito.belongsTo(Carrito, { foreignKey: 'carritoId' });
  
  // Relaciones Orden-DetalleOrden
  Orden.hasMany(DetalleOrden, { foreignKey: 'ordenId', as: 'detalles' });
  DetalleOrden.belongsTo(Orden, { foreignKey: 'ordenId' });
  
  console.log('✅ Asociaciones del servicio de Órdenes establecidas');
}