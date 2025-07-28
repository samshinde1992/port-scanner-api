const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function scanPort(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;

    socket.setTimeout(timeout);
    socket.once("connect", () => {
      isOpen = true;
      socket.destroy();
    });

    socket.on("timeout", () => socket.destroy());
    socket.on("error", () => socket.destroy());
    socket.on("close", () => {
      resolve({ port, open: isOpen });
    });

    socket.connect(port, host);
  });
}

app.post("/scan", async (req, res) => {
  const { host, ports } = req.body;
  if (!host || !ports || !Array.isArray(ports)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const results = await Promise.all(ports.map((port) => scanPort(host, port)));
  res.json({ host, results });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
