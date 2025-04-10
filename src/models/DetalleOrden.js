import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Orden from "./Orden.js";

const DetalleOrden = sequelize.define(
  "DetalleOrden",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ordenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Orden,
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
    subtotal: {
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
    tableName: "detalles_orden"
  }
);

// Elimina estas líneas para evitar asociaciones duplicadas
// Orden.hasMany(DetalleOrden, { foreignKey: 'ordenId', as: 'detalles' });
// DetalleOrden.belongsTo(Orden, { foreignKey: 'ordenId' });

export default DetalleOrden;