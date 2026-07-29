import amqp from 'amqplib';
import env from '../config/env.js';

export const QUEUE_NAME = 'job_application_queue';

let connection = null;
let channel = null;

const amqpUrl = () =>
  env.AMQP_URL ||
  `amqp://${encodeURIComponent(env.RABBITMQ_USER)}:${encodeURIComponent(
    env.RABBITMQ_PASSWORD
  )}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;

/** Opens the connection once and reuses it; safe to call repeatedly. */
export const initRabbitMQ = async () => {
  if (channel) return channel;

  connection = await amqp.connect(amqpUrl());
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  // Drop the cached handles so the next call reconnects instead of publishing
  // into a dead channel.
  connection.on('close', () => {
    connection = null;
    channel = null;
  });
  connection.on('error', () => {});

  console.log('RabbitMQ connected');

  return channel;
};

/**
 * Publishing must never fail the HTTP request that triggered it, so errors are
 * logged instead of thrown.
 */
export const publishToQueue = async (message) => {
  try {
    const ch = await initRabbitMQ();

    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log('Message published:', message);
  } catch (error) {
    console.error('RabbitMQ publish failed:', error.message);
  }
};

export const consumeFromQueue = async (handler) => {
  const ch = await initRabbitMQ();

  await ch.prefetch(1);
  await ch.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      await handler(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch (error) {
      console.error('Consumer failed to process message:', error.message);
      // Drop the message instead of requeuing it forever.
      ch.nack(msg, false, false);
    }
  });
};

export const closeRabbitMQ = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
  } catch (error) {
    console.error('Error closing RabbitMQ:', error.message);
  } finally {
    channel = null;
    connection = null;
  }
};

export default { initRabbitMQ, publishToQueue, consumeFromQueue, closeRabbitMQ };
