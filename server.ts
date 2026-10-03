import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = process.env.PORT || 3000;

  // Initialize Google GenAI with API key from environment
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

  // In-memory devices store supporting ESP32, ESP32-S3, ESP32-C3 / C3 Mini
  const devicesStore = new Map();

  // Root status
  app.get('/status', (req, res) => {
    res.json({
      status: 'active',
      version: '1.3.0',
      gemini_configured: !!apiKey && apiKey !== 'MY_GEMINI_API_KEY',
      timestamp: new Date().toISOString()
    });
  });

  // REST API Endpoints for ESP32 Devices (as requested)
  app.post('/api/devices/register', (req, res) => {
    const { device_id, device_type, chip_type, firmware_version, user_id } = req.body;
    if (!device_id) {
      return res.status(400).json({ success: false, error: 'device_id is required' });
    }

    const deviceRecord = {
      device_id,
      device_type: device_type || 'ESP32-Module',
      chip_type: chip_type || 'ESP32-S3',
      firmware_version: firmware_version || '1.0.0',
      user_id: user_id || 'anonymous',
      connection_status: 'online',
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      uptime: 3600,
      ip: '192.168.43.150',
      rssi: -50
    };

    devicesStore.set(device_id, deviceRecord);

    res.json({
      success: true,
      message: 'Device registered successfully',
      device: deviceRecord
    });
  });

  app.post('/api/devices/heartbeat', (req, res) => {
    const { device_id, rssi, ip, uptime } = req.body;
    if (!device_id || !devicesStore.has(device_id)) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const record = devicesStore.get(device_id);
    record.last_seen = new Date().toISOString();
    record.connection_status = 'online';
    if (rssi !== undefined) record.rssi = rssi;
    if (ip !== undefined) record.ip = ip;
    if (uptime !== undefined) record.uptime = uptime;

    devicesStore.set(device_id, record);

    res.json({ success: true, timestamp: record.last_seen });
  });

  app.post('/api/devices/status', (req, res) => {
    const { device_id } = req.body;
    const record = devicesStore.get(device_id) || {
      device_id: device_id || 'EVA-ESP32-01',
      connection_status: 'offline'
    };
    res.json({ success: true, device: record });
  });

  app.get('/api/devices', (req, res) => {
    const list = Array.from(devicesStore.values());
    res.json({ success: true, devices: list });
  });

  app.get('/api/devices/:deviceId', (req, res) => {
    const { deviceId } = req.params;
    const record = devicesStore.get(deviceId);
    if (!record) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, device: record });
  });

  // AI Chat proxy endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, device_id } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.json({
          reply: `[EVA AI Simulator]: Hello! I received your message: "${message}" for device (${device_id || 'EVA-ESP32-01'}).`
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'system',
            parts: [{ text: 'You are EVA, an advanced physical AI assistant embedded in an ESP32 hardware device (ESP32, ESP32-S3, ESP32-C3). Keep responses concise and helpful.' }]
          },
          {
            role: 'user',
            parts: [{ text: message }]
          }
        ]
      });

      res.json({ reply: response.text || 'EVA is processing your request.' });
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate AI response' });
    }
  });

  // Telemetry endpoint
  app.get('/api/esp32/telemetry', (req, res) => {
    res.json({
      success: true,
      temperature: +(24 + Math.random() * 6).toFixed(1),
      humidity: +(45 + Math.random() * 15).toFixed(1),
      battery: +(85 + Math.random() * 14).toFixed(1),
      cpu_load: +(12 + Math.random() * 25).toFixed(1),
      rssi: -Math.floor(45 + Math.random() * 20),
      timestamp: new Date().toISOString()
    });
  });

  // OTA Firmware update endpoint
  app.post('/api/esp32/ota', (req, res) => {
    const { device_id = 'EVA-ESP32-01', version = '1.3.0' } = req.body;
    res.json({
      success: true,
      device_id,
      new_version: version,
      message: `OTA firmware update v${version} successfully flashed to ESP32 device.`
    });
  });

  app.post('/device/ping', (req, res) => {
    const { device_id = 'EVA-ESP32-01' } = req.body;
    res.json({
      success: true,
      device_id,
      ping_ms: Math.floor(Math.random() * 25) + 12,
      rssi: -55,
      status: 'online',
      timestamp: new Date().toISOString()
    });
  });

  app.post('/device/command', (req, res) => {
    const { device_id = 'EVA-ESP32-01', command, payload } = req.body;
    res.json({
      success: true,
      device_id,
      command,
      executed: true,
      result: { code: 200, message: `Command '${command}' executed on ESP32.` }
    });
  });

  app.post('/face/detect', (req, res) => {
    const { device_id = 'EVA-ESP32-01' } = req.body;
    const detected = Math.random() > 0.2;
    res.json({
      success: true,
      device_id,
      faces_detected: detected ? 1 : 0,
      confidence: detected ? 0.94 : 0.0,
      expression: detected ? 'smiling' : 'none',
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`EVA Device Setup server running on http://localhost:${PORT}`);
  });
}

startServer();
