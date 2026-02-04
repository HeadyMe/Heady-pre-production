const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const PORT = Number(process.env.PORT || 3300);
const HEADY_ADMIN_SCRIPT = process.env.HEADY_ADMIN_SCRIPT || path.join(__dirname, "src", "heady_project", "heady_conductor.py");
const HEADY_PYTHON_BIN = process.env.HEADY_PYTHON_BIN || "python";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Serve Frontend Build (React)
const frontendBuildPath = path.join(__dirname, "frontend", "build");
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}
app.use(express.static("public"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "heady-manager", ts: new Date().toISOString() });
});

// Proxy to Python Conductor for certain tasks if needed, or run locally
// For now, simple start
app.listen(PORT, () => console.log(`∞ Heady System Active on Port ${PORT} ∞`));
