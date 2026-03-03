const express = require("express");
const cors = require("cors");
const amqp = require("amqplib");

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

const USERNAME = "saidnnnn";
const PASSWORD = "said28082005";
const HOST = "rabbitmq-saidnnnn.alwaysdata.net";
const VHOST = "saidnnnn_asyncshop_rmq";

const RABBIT_URL = `amqp://${USERNAME}:${PASSWORD}@${HOST}:5672/${VHOST}`;
const QUEUES = ["order_created"];

let channel;

async function initRabbit() {
  const conn = await amqp.connect(RABBIT_URL);
  channel = await conn.createChannel();

  for (const q of QUEUES) {
    await channel.assertQueue(q, { durable: true });
  }

  console.log("✅ Admin UI connected to RabbitMQ");
}

app.get("/api/queues", async (_req, res) => {
  try {
    const results = [];

    for (const q of QUEUES) {
      const info = await channel.checkQueue(q);
      results.push({
        name: q,
        ready: info.messageCount,
      });
    }

    res.json({ queues: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (_req, res) => {
  res.send(`
    <h2>RabbitMQ Mini UI</h2>
    <button onclick="load()">Refresh</button>
    <pre id="out"></pre>
    <script>
      async function load(){
        const r = await fetch('/api/queues');
        document.getElementById('out').innerText =
          JSON.stringify(await r.json(), null, 2);
      }
      load();
    </script>
  `);
});

initRabbit().then(() =>
  app.listen(4000, () =>
    console.log("🚀 Admin UI on http://localhost:4000")
  )
);