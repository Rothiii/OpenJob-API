import './config/env.js';
import { notifyJobOwner } from './services/notification.service.js';
import { consumeFromQueue, closeRabbitMQ } from './utils/rabbitmq.js';
import { closePool } from './config/database.js';

const handleMessage = async ({ application_id: applicationId }) => {
  if (!applicationId) {
    console.warn('Message without application_id, skipping');
    return;
  }

  await notifyJobOwner(applicationId);
};

const start = async () => {
  await consumeFromQueue(handleMessage);
  console.log('Consumer is waiting for job application messages...');
};

const shutdown = async (signal) => {
  console.log(`\n${signal} received, stopping consumer...`);

  await closeRabbitMQ();
  await closePool();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

start().catch((error) => {
  console.error('Consumer failed to start:', error.message);
  process.exit(1);
});
