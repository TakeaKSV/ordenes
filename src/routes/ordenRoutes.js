import express from "express";
import {
  crearOrden,
  obtenerOrdenesUsuario,
  obtenerOrdenPorId,
  actualizarEstadoOrden,
  obtenerTodasLasOrdenes
} from "../controllers/ordenController.js"; // Cambia a ruta relativa correcta
import { actualizarStockProducto } from "../services/productoService.js"; // Cambia a ruta relativa correcta
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ordenes
 *   description: Gestión de órdenes de compra
 */

/**
 * @swagger
 * /ordenes:
 *   post:
 *     summary: Crea una nueva orden desde el carrito
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 required: true
 *               direccionEnvio:
 *                 type: string
 *                 required: true
 *               metodoPago:
 *                 type: string
 *                 required: true
 *               referenciaPago:
 *                 type: string
 *               notas:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada con éxito
 */
router.post("/", verifyToken, crearOrden);

/**
 * @swagger
 * /ordenes:
 *   get:
 *     summary: Obtiene todas las órdenes del usuario actual
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes del usuario
 */
router.get("/", verifyToken, obtenerOrdenesUsuario);

/**
 * @swagger
 * /ordenes/admin:
 *   get:
 *     summary: Obtiene todas las órdenes (solo para administradores)
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todas las órdenes
 */
router.get("/admin", verifyToken, obtenerTodasLasOrdenes);

/**
 * @swagger
 * /ordenes/{id}:
 *   get:
 *     summary: Obtiene una orden específica
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       404:
 *         description: Orden no encontrada
 */
router.get("/:id", verifyToken, obtenerOrdenPorId);

/**
 * @swagger
 * /ordenes/{id}/estado:
 *   put:
 *     summary: Actualiza el estado de una orden
 *     tags: [Ordenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, pagada, enviada, entregada, cancelada]
 *                 required: true
 *     responses:
 *       200:
 *         description: Estado de la orden actualizado
 *       404:
 *         description: Orden no encontrada
 */
router.put("/:id/estado", verifyToken, actualizarEstadoOrden);
router.put('/productos/:id', actualizarStockProducto);

export default router;