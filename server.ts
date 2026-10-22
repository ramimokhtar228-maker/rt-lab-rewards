import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'sync-database.json');

interface SyncDatabase {
  claims: any[];
  patients: any[];
  collectors: any[];
  settings: any;
  lastUpdated: string;
}

// Initial DB loader
function loadDatabase(): SyncDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  // Fallback defaults from lab-config.json if available
  let initialCollectors: any[] = [];
  try {
    const configPath = path.resolve(__dirname, 'public/lab-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.collectors) initialCollectors = config.collectors;
    }
  } catch {
    // ignore
  }

  const defaultDb: SyncDatabase = {
    claims: [
      {
        id: 'clm_default_1',
        patientName: 'أحمد محمود النجار',
        patientPhone: '01023456542',
        address: 'شارع ترعة الشابوري، بهتيم، شبرا الخيمة',
        serviceType: 'home_visit',
        preferredTime: 'صباحاً (9:00 ص - 1:00 ظ)',
        couponCode: 'RT-FREE-CBC-9921',
        prizeTitle: 'تحليل صورة دم كاملة (CBC) مجاناً',
        prizeValue: 'مجاني 100%',
        points: 450,
        collectorId: 'col_aya',
        collectorName: 'أ. آية أحمد',
        collectorPhone: '01278967133',
        collectorWhatsApp: '201116979431',
        createdAt: new Date().toLocaleDateString('ar-EG'),
        status: 'confirmed',
        notes: 'تم تأكيد الزيارة المنزلية وجاهزية فني السحب',
      },
    ],
    patients: [],
    collectors: initialCollectors.length > 0 ? initialCollectors : [
      {
        id: 'col_aya',
        name: 'أ. آية أحمد',
        phone: '01278967133',
        whatsappNumber: '201116979431',
        area: 'شبرا الخيمة، بهتيم، مسطرد، والمناطق المجاورة',
        roleTitle: 'مسؤولة التنسيق وفنية سحب عينات',
        isAvailable: true,
        notes: 'سحب منزلي سريع وعينات الأطفال وكبار السن',
      },
      {
        id: 'col_mona',
        name: 'ك. منى أحمد',
        phone: '01013242777',
        whatsappNumber: '201000756144',
        area: 'بهتيم، شبرا الخيمة، والفرع الرئيسي',
        roleTitle: 'أخصائية سحب وتحاليل طبية',
        isAvailable: true,
        notes: 'سحب عينات دقيق وشغل الوحدات التخصصية',
      },
      {
        id: 'col_emergency',
        name: 'فريق التمريض السريع (سحب منزلي 24 ساعة)',
        phone: '01100046841',
        whatsappNumber: '201100874444',
        area: 'كافة أنحاء القاهرة الكبرى والجيزة والقليوبية',
        roleTitle: 'طوارئ سحب منزلي مجهز',
        isAvailable: true,
        notes: 'متاح على مدار 24 ساعة مع شنطة سحب معقمة وحافظات حرارية',
      },
      {
        id: 'col_dr_rami',
        name: 'د. رامي مختار (إشراف وحالات حرجة)',
        phone: '01124485444',
        whatsappNumber: '201100874444',
        area: 'الفرع الرئيسي ومتابعة الحالات الخاصة',
        roleTitle: 'طبيب الباثولوجيا الإكلينيكية واستشاري المعمل',
        isAvailable: true,
        notes: 'متابعة النتائج الحرجة وتوجيه فريق السحب',
      },
    ],
    settings: null,
    lastUpdated: new Date().toISOString(),
  };

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: SyncDatabase) {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// SSE Connected Clients set
const sseClients = new Set<express.Response>();

function broadcastEvent(type: string, payload: any) {
  const data = JSON.stringify({ type, data: payload, timestamp: Date.now() });
  const eventMsg = `event: message\ndata: ${data}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(eventMsg);
    } catch {
      sseClients.delete(client);
    }
  }
}

// REST API Endpoints

// 1. Health & Server Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'RT Lab Real-Time Sync Server',
    connectedClients: sseClients.size,
    claimsCount: db.claims.length,
    collectorsCount: db.collectors.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial handshake and full current state
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`);
  res.write(
    `event: message\ndata: ${JSON.stringify({
      type: 'sync:init',
      data: {
        claims: db.claims,
        collectors: db.collectors,
        patients: db.patients,
      },
      timestamp: Date.now(),
    })}\n\n`
  );

  sseClients.add(res);

  // Heartbeat every 20 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// 3. Claims API
app.get('/api/claims', (req, res) => {
  res.json({ success: true, claims: db.claims });
});

app.post('/api/claims', (req, res) => {
  const newClaim = req.body;
  if (!newClaim || !newClaim.patientName || !newClaim.patientPhone) {
    return res.status(400).json({ error: 'Missing required patient data' });
  }

  const claimWithMeta = {
    ...newClaim,
    id: newClaim.id || 'clm_' + Date.now(),
    createdAt: newClaim.createdAt || new Date().toLocaleDateString('ar-EG'),
    status: newClaim.status || 'pending',
    syncedAt: new Date().toISOString(),
  };

  // Add to in-memory db and persist
  // Prevent duplicate if same id exists
  const existsIdx = db.claims.findIndex((c) => c.id === claimWithMeta.id);
  if (existsIdx >= 0) {
    db.claims[existsIdx] = claimWithMeta;
  } else {
    db.claims = [claimWithMeta, ...db.claims];
  }
  saveDatabase(db);

  // Broadcast to all connected devices instantly
  broadcastEvent('claim:new', claimWithMeta);

  console.log(`[RT-Sync] 🚨 New claim registered: ${claimWithMeta.patientName} -> Collector: ${claimWithMeta.collectorName || 'Not assigned'}`);

  res.status(201).json({ success: true, claim: claimWithMeta });
});

app.patch('/api/claims/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.claims.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  db.claims[idx] = { ...db.claims[idx], ...updates, updatedAt: new Date().toISOString() };
  saveDatabase(db);

  broadcastEvent('claim:updated', db.claims[idx]);

  res.json({ success: true, claim: db.claims[idx] });
});

app.delete('/api/claims/:id', (req, res) => {
  const { id } = req.params;
  db.claims = db.claims.filter((c) => c.id !== id);
  saveDatabase(db);

  broadcastEvent('claim:deleted', { id });
  res.json({ success: true, message: 'Claim deleted' });
});

// 4. Collectors API
app.get('/api/collectors', (req, res) => {
  res.json({ success: true, collectors: db.collectors });
});

app.post('/api/collectors', (req, res) => {
  const collector = req.body;
  if (!collector.name || !collector.phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const collectorWithMeta = {
    ...collector,
    id: collector.id || 'col_' + Date.now(),
    isAvailable: collector.isAvailable !== false,
  };

  const idx = db.collectors.findIndex((c) => c.id === collectorWithMeta.id);
  if (idx >= 0) {
    db.collectors[idx] = collectorWithMeta;
  } else {
    db.collectors.push(collectorWithMeta);
  }
  saveDatabase(db);

  broadcastEvent('collector:updated', collectorWithMeta);
  res.status(201).json({ success: true, collector: collectorWithMeta });
});

app.delete('/api/collectors/:id', (req, res) => {
  const { id } = req.params;
  db.collectors = db.collectors.filter((c) => c.id !== id);
  saveDatabase(db);

  broadcastEvent('collector:deleted', { id });
  res.json({ success: true });
});

// 5. Patients Sync API
app.get('/api/patients', (req, res) => {
  res.json({ success: true, patients: db.patients });
});

app.post('/api/patients', (req, res) => {
  const patient = req.body;
  if (!patient.name || !patient.phone) {
    return res.status(400).json({ error: 'Name and phone required' });
  }

  const idx = db.patients.findIndex((p) => p.phone === patient.phone || p.id === patient.id);
  if (idx >= 0) {
    db.patients[idx] = { ...db.patients[idx], ...patient, lastActive: new Date().toLocaleDateString('ar-EG') };
  } else {
    db.patients = [{ ...patient, id: patient.id || 'pat_' + Date.now(), joinedAt: new Date().toLocaleDateString('ar-EG') }, ...db.patients];
  }
  saveDatabase(db);

  broadcastEvent('patient:updated', patient);
  res.json({ success: true, count: db.patients.length });
});

// 6. Generic Broadcast Relay (for multi-device custom triggers)
app.post('/api/broadcast', (req, res) => {
  const { type, payload } = req.body;
  if (!type) return res.status(400).json({ error: 'Event type required' });
  broadcastEvent(type, payload);
  res.json({ success: true });
});

// Vite Middleware for Dev / Static serving for Prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RT Lab Real-Time Sync Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
