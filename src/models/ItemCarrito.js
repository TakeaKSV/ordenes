import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Carrito from "./Carrito.js";

const ItemCarrito = sequelize.define(
  "ItemCarrito",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    carritoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Carrito,
        key: 'id'
      }
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    tableName: "items_carrito"
  }
);

// Elimina estas líneas para evitar asociaciones duplicadas
// Carrito.hasMany(ItemCarrito, { foreignKey: 'carritoId', as: 'items' });
// ItemCarrito.belongsTo(Carrito, { foreignKey: 'carritoId' });

export default ItemCarrito;