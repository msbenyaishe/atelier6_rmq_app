const amqp = require("amqplib");
const cors = require("cors");

let channel;

const USERNAME = process.env.RABBIT_USER;
const PASSWORD = process.env.RABBIT_PASS;
const HOST = process.env.RABBIT_HOST;
const VHOST = process.env.RABBIT_VHOST;

const RABBIT_URL = `amqp://${USERNAME}:${PASSWORD}@${HOST}:5672/${VHOST}`;
const QUEUE = "order_created";

const initRabbit = async () => {
  if (channel) return;

  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
};

const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

module.exports = async (req, res) => {
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await initRabbit();

    const { email, total } = req.body;

    const order = {
      orderId: Date.now(),
      email,
      total,
      createdAt: new Date().toISOString(),
    };

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify(order)),
      { persistent: true }
    );

    res.status(201).json({
      message: "Order created",
      order,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "RabbitMQ error" });
  }
};