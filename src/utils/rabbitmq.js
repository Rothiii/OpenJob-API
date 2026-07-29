import amqp from "amqplib";

let connection;
let channel;

const QUEUE_NAME = "job_application_queue";

export const initRabbitMQ = async () => {
	try {
		const amqpUrl = process.env.RABBITMQ_URL || "amqp://localhost";

		connection = await amqp.connect(amqpUrl);
		channel = await connection.createChannel();

		await channel.assertQueue(QUEUE_NAME, { durable: true });

		console.log("RabbitMQ connected and queue asserted.");
	} catch (error) {
		console.error("Error initializing RabbitMQ:", error);
	}
};

export const publishToQueue = async (message) => {
	try {
		if (!channel) {
			throw new Error("RabbitMQ channel is not initialized.");
		}

		const bufferMessage = Buffer.from(JSON.stringify(message));

		channel.sendToQueue(QUEUE_NAME, bufferMessage, { persistent: true });
		console.log("Message published to queue:", message);
	} catch (error) {
		console.error("Error publishing to queue:", error);
	}
};

export const consumeFromQueue = async (callback) => {
	try {
		if (!channel) {
			throw new Error("RabbitMQ channel is not initialized.");
		}

		await channel.consume(QUEUE_NAME, (msg) => {
			if (msg !== null) {
				const messageContent = JSON.parse(msg.content.toString());
				callback(messageContent);
				channel.ack(msg);
			}
		});
	} catch (error) {
		console.error("Error consuming from queue:", error);
	}
};

export const closeRabbitMQ = async () => {
	try {

		if (channel) await channel.close();
		if (connection) await connection.close();
    console.log("RabbitMQ connection closed.");

	} catch (error) {
		console.error("Error closing RabbitMQ:", error);
	}
};

export default {
  initRabbitMQ,
  publishToQueue,
  consumeFromQueue,
  closeRabbitMQ,
};