import amqp from 'amqplib';
import env from '../config/env.js';

// Must match the queue the API publishes to.
export const QUEUE_NAME = 'job_application_queue';

let connection = null;
let channel = null;

const amqpUrl = () =>
  env.AMQP_URL ||
  `amqp://${encodeURIComponent(env.RABBITMQ_USER)}:${encodeURIComponent(
    env.RABBITMQ_PASSWORD
  )}@${env.RABBITMQ_HOST}:${env.RABBITMQ_PORT}`;

export const initRabbitMQ = async () => {
  if (channel) return channel;

  connection = await amqp.connect(amqpUrl());
  channel = await connection.createChannel();

  // Declared on both sides: whichever process starts first creates the queue,
  // so no message is lost when the API publishes before this one runs.
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  connection.on('close', () => {
    connection = null;
    channel = null;
  });
  connection.on('error', () => {});

  console.log('RabbitMQ connected');

  return channel;
};

export const consumeFromQueue = async (handler) => {
  const ch = await initRabbitMQ();

  // One message at a time, so running extra workers actually shares the load.
  await ch.prefetch(1);
  await ch.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      await handler(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch (error) {
      console.error('Consumer failed to process message:', error.message);
      // Drop the message instead of requeuing it into an endless retry loop.
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

export default { initRabbitMQ, consumeFromQueue, closeRabbitMQ };
