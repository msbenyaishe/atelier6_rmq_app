const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

// ===== RabbitMQ config (AlwaysData) =====
const USERNAME = "saidnnnn";
const PASSWORD = "said28082005";
const HOST = "rabbitmq-saidnnnn.alwaysdata.net";
const VHOST = "saidnnnn_asyncshop_rmq";

const RABBIT_URL = `amqp://${USERNAME}:${PASSWORD}@${HOST}:5672/${VHOST}`;
const QUEUE = "order_created";

let channel;

// Connect to RabbitMQ
async function initRabbit() {
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  console.log("✅ RabbitMQ connected (Orders API)");
}

// HTTP endpoint
app.post("/orders", async (req, res) => {
  try {
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
      message: "Order created. Email will be sent asynchronously.",
      order,
    });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start app
initRabbit()
  .then(() => {
    app.listen(3000, () =>
      console.log("🚀 Orders API running on http://localhost:3000")
    );
  })
  .catch((e) => {
    console.error("❌ RabbitMQ init failed:", e.message);
    process.exit(1);
  });

  const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173"
}));