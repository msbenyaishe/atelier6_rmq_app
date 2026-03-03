const amqp = require("amqplib");

const USERNAME = process.env.RABBIT_USER;
const PASSWORD = process.env.RABBIT_PASS;
const HOST = process.env.RABBIT_HOST;
const VHOST = process.env.RABBIT_VHOST;

const RABBIT_URL = `amqp://${USERNAME}:${PASSWORD}@${HOST}:5672/${VHOST}`;
const QUEUE = "order_created";

async function startWorker() {
  try {
    const conn = await amqp.connect(RABBIT_URL);
    const ch = await conn.createChannel();

    await ch.assertQueue(QUEUE, { durable: true });
    ch.prefetch(1);

    console.log("📩 Email Worker waiting for messages...");

    ch.consume(QUEUE, async (msg) => {
      if (!msg) return;

      try {
        const order = JSON.parse(msg.content.toString());
        console.log("✉ Email sent to:", order.email);

        // simulate email sending
        await new Promise((r) => setTimeout(r, 1500));

        ch.ack(msg);
      } catch (err) {
        console.error("❌ Message processing failed:", err.message);

        // requeue message
        ch.nack(msg, false, true);
      }
    });
  } catch (err) {
    console.error("❌ Worker startup failed:", err.message);
    process.exit(1); // Render will restart it
  }
}

startWorker();