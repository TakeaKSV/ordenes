import express from "express";
import {
  obtenerCarritoUsuario,
  agregarProductoAlCarrito,
  actualizarCantidadProducto,
  eliminarProductoDelCarrito,
  vaciarCarrito
} from "../controllers/carritoController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Carrito
 *   description: Gestión del carrito de compras
 */

/**
 * @swagger
 * /carrito:
 *   get:
 *     summary: Obtiene el carrito del usuario actual
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito del usuario
 */
router.get("/", verifyToken, obtenerCarritoUsuario);

/**
 * @swagger
 * /carrito/agregar:
 *   post:
 *     summary: Agrega un producto al carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productoId:
 *                 type: integer
 *                 required: true
 *               cantidad:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Producto agregado al carrito
 */
router.post("/agregar", verifyToken, agregarProductoAlCarrito);

/**
 * @swagger
 * /carrito/item/{itemId}:
 *   put:
 *     summary: Actualiza la cantidad de un producto en el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
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
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */
router.put("/item/:itemId", verifyToken, actualizarCantidadProducto);

/**
 * @swagger
 * /carrito/item/{itemId}:
 *   delete:
 *     summary: Elimina un producto del carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 */
router.delete("/item/:itemId", verifyToken, eliminarProductoDelCarrito);

/**
 * @swagger
 * /carrito/vaciar:
 *   delete:
 *     summary: Vacía el carrito
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado
 */
router.delete("/vaciar", verifyToken, vaciarCarrito);

export default router;