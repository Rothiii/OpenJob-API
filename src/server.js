import app from './app.js';
import env from './config/env.js';
import { closePool } from './config/database.js';
import { initRabbitMQ, closeRabbitMQ } from './utils/rabbitmq.js';
import { closeRedis } from './utils/redis.js';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running at http://${env.HOST}:${env.PORT}`);
});

// Warm the broker connection up front; a broker that is down must not stop the
// API from serving, so publishing retries the connection later on its own.
initRabbitMQ().catch((error) => {
  console.error('RabbitMQ connection failed:', error.message);
});

const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down...`);

  server.close(async () => {
    await closeRabbitMQ();
    await closeRedis();
    await closePool();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

export default server;
