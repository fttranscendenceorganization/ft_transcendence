import express from "express";
import axios from "axios";
import client from "prom-client";

const app = express();
const PORT = 3000;

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const serviceUp = new client.Gauge({
  name: "netpong_service_up",
  help: "Service liveness status (1 = UP, 0 = DOWN)",
  labelNames: ["service"],
});

const serviceDegraded = new client.Gauge({
  name: "netpong_service_degraded",
  help: "Service readiness degraded (1 = DEGRADED)",
  labelNames: ["service"],
});

register.registerMetric(serviceUp);
register.registerMetric(serviceDegraded);

const services = {
  nginx: {
    liveness: "http://nginx/health",
    readiness: null,
  },
  backend: {
    liveness: "http://backend_api:3000/health",
    readiness: "http://backend_api:3000/health/ready",
  },
};

const cache = {};


async function checkService(cfg) {
  try {
    await axios.get(cfg.liveness, { timeout: 2000 });

    if (cfg.readiness) {
      try {
        await axios.get(cfg.readiness, { timeout: 2000 });
        return "UP";
      } catch {
        return "DEGRADED";
      }
    }

    return "UP";
  } catch {
    return "DOWN";
  }
}

async function runChecks() {
  for (const [name, cfg] of Object.entries(services)) {
    const status = await checkService(cfg);

    cache[name] = {
      status,
      checked_at: new Date().toISOString(),
    };

    serviceUp.set({ service: name }, status === "UP" ? 1 : 0);
    serviceDegraded.set({ service: name }, status === "DEGRADED" ? 1 : 0);
  }
}

setInterval(runChecks, 5000);
runChecks();


app.get("/status", (req, res) => {
  res.json({ status: "ok", services: cache });
});

app.get("/status/ui", (req, res) => {
  const serviceItems = Object.entries(cache)
    .map(([name, s]) => {
      const statusClass = s.status.toLowerCase();
      return `
        <div class="card">
          <div class="info">
            <span class="name">${name.toUpperCase()}</span>
            <span class="time">Last check: ${new Date(s.checked_at).toLocaleTimeString()}</span>
          </div>
          <div class="status-badge ${statusClass}">${s.status}</div>
        </div>
      `;
    })
    .join("");

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Netpong Status</title>
        <meta http-equiv="refresh" content="5">
        <style>
          :root {
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text: #f1f5f9;
            --up: #10b981;
            --degraded: #f59e0b;
            --down: #ef4444;
          }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: var(--bg); color: var(--text); 
            display: flex; flex-direction: column; align-items: center;
            padding: 50px; margin: 0;
          }
          h1 { margin-bottom: 30px; font-weight: 300; letter-spacing: 2px; }
          .container { width: 100%; max-width: 600px; }
          .card { 
            background: var(--card-bg); margin-bottom: 15px;
            padding: 20px; border-radius: 12px;
            display: flex; justify-content: space-between; align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(255,255,255,0.05);
            transition: transform 0.2s;
          }
          .card:hover { transform: translateY(-2px); }
          .info { display: flex; flex-direction: column; }
          .name { font-weight: bold; font-size: 1.1em; color: #94a3b8; }
          .time { font-size: 0.8em; color: #64748b; margin-top: 4px; }
          .status-badge { 
            padding: 6px 16px; border-radius: 20px; font-size: 0.8em; 
            font-weight: bold; text-transform: uppercase; letter-spacing: 1px;
          }
          .up { background: rgba(16, 185, 129, 0.1); color: var(--up); border: 1px solid var(--up); box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
          .degraded { background: rgba(245, 158, 11, 0.1); color: var(--degraded); border: 1px solid var(--degraded); }
          .down { background: rgba(239, 68, 68, 0.1); color: var(--down); border: 1px solid var(--down); box-shadow: 0 0 10px rgba(239, 68, 68, 0.2); }
          .pulse { height: 10px; width: 10px; background: var(--up); border-radius: 50%; display: inline-block; margin-right: 10px; animation: blink 2s infinite; }
          @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        </style>
      </head>
      <body>
        <h1><span class="pulse"></span>NETPONG SYSTEM STATUS</h1>
        <div class="container">
          ${serviceItems}
        </div>
        <p style="color: #475569; font-size: 0.8em; margin-top: 20px;">Auto-refreshing every 5 seconds</p>
      </body>
    </html>
  `);
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Status service running on port ${PORT}`);
});
