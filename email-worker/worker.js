const amqp = require("amqplib");

// ===== RabbitMQ config =====
const USERNAME = "saidnnnn";
const PASSWORD = "said28082005";
const HOST = "rabbitmq-saidnnnn.alwaysdata.net";
const VHOST = "saidnnnn_asyncshop_rmq";

const RABBIT_URL = `amqp://${USERNAME}:${PASSWORD}@${HOST}:5672/${VHOST}`;
const QUEUE = "order_created";

async function start() {
  const conn = await amqp.connect(RABBIT_URL);
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });
  channel.prefetch(1);

  console.log("📩 Email Worker waiting for messages...");

  channel.consume(
    QUEUE,
    async (msg) => {
      if (!msg) return;

      try {
        const order = JSON.parse(msg.content.toString());

        console.log(
          "✉️ Sending email (simulated) to:",
          order.email
        );

        await new Promise((r) => setTimeout(r, 1500));

        console.log("✅ Email sent for order:", order.orderId);

        channel.ack(msg);
      } catch (e) {
        console.error("❌ Worker error:", e.message);
        channel.nack(msg, false, true);
      }
    },
    { noAck: false }
  );
}

start().catch((e) => {
  console.error("❌ Worker failed:", e.message);
  process.exit(1);
});