import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Orden = sequelize.define(
  "Orden",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // clienteId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'),
      defaultValue: 'pendiente'
    },
    fechaEntrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    direccionEnvio: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metodoPago: {
      type: DataTypes.STRING,
      allowNull: false
    },
    referenciaPago: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    timestamps: true,
    tableName: "ordenes"
  }
);

export default Orden;