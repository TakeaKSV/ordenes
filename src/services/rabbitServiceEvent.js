import amqp from 'amqplib';
import dotenv from "dotenv";
import config from '../config/config.js';

dotenv.config();

// Configuración de RabbitMQ
const RABBITMQ_URL = config.rabbitmq.url || 'amqp://admin:admin@rabbitmq:5672';
const EXCHANGE = 'orden_events';
const RABBITMQ_EXCHANGE = "user_event";
const RABBITMQ_ROUTING_KEY = "user.created";
const EMAIL_QUEUE = "user_create_queue";

/**
 * Establece conexión con RabbitMQ
 * @returns {Promise<Object>} - Conexión y canal
 */
const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    return { connection, channel };
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error);
    throw error;
  }
};

export async function userCreatedEvent(user) {
  const connection = await amqp.connect({
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST, // Debe ser "rabbitmq" en Docker
    port: 5672,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASS
  });
  const channel = await connection.createChannel();

  try {
    // Declare exchange
    await channel.assertExchange(RABBITMQ_EXCHANGE, "topic", { durable: true });

    // Publicar el evento para cualquier consumidor interesado en usuarios creados
    const message = JSON.stringify(user);
    channel.publish(
      RABBITMQ_EXCHANGE,
      RABBITMQ_ROUTING_KEY,
      Buffer.from(message)
    );

    // Asegurarse de que la cola de email exista
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });

    // Enviar directamente a la cola de email para notificación
    channel.sendToQueue(
      EMAIL_QUEUE,
      Buffer.from(message),
      { persistent: true }
    );

    console.log(
      `[✅] Evento de usuario creado publicado en exchange "${RABBITMQ_EXCHANGE}" y cola "${EMAIL_QUEUE}"`
    );
  } catch (error) {
    console.error("Error publicando evento de producto creado:", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error al cerrar conexión RabbitMQ:", err);
      }
    }
  }
}

/**
 * Publica un evento cuando se crea una orden
 * @param {Object} orden - Datos de la orden
 */
export const ordenCreatedEvent = async (orden) => {
  try {
    const { connection, channel } = await connectRabbitMQ();
    const routingKey = 'orden.created';
    
    await channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(orden)),
      { persistent: true }
    );
    
    console.log(`Evento orden.created publicado para orden ID=${orden.id}`);
    await connection.close();
  } catch (error) {
    console.error('Error al publicar evento orden.created:', error);
  }
};

/**
 * Publica un evento cuando se actualiza el estado de una orden
 * @param {Object} orden - Datos de la orden
 */
export const ordenStatusUpdatedEvent = async (orden) => {
  try {
    const { connection, channel } = await connectRabbitMQ();
    const routingKey = 'orden.status.updated';
    
    await channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify({
        id: orden.id,
        estado: orden.estado,
        clienteId: orden.clienteId,
        usuarioId: orden.usuarioId,
        fechaActualizacion: new Date()
      })),
      { persistent: true }
    );
    
    console.log(`Evento orden.status.updated publicado para orden ID=${orden.id}, estado=${orden.estado}`);
    await connection.close();
  } catch (error) {
    console.error('Error al publicar evento orden.status.updated:', error);
  }
};