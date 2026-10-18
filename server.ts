import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cloud Sync In-Memory & File Store
const DATA_DIR = path.join(__dirname, 'data');
const CLOUD_SYNC_FILE = path.join(DATA_DIR, 'cloud_sync_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface DeviceSession {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  branchName?: string;
  lastSeen: number;
  ip?: string;
}

const activeDevices = new Map<string, DeviceSession>();

// In-memory sync state
let syncRevision = 1;
let lastCloudUpdated = new Date().toISOString();
let cloudData: any = null;

// Load initial cloud data if exists on disk
if (fs.existsSync(CLOUD_SYNC_FILE)) {
  try {
    const raw = fs.readFileSync(CLOUD_SYNC_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    cloudData = parsed.data || null;
    syncRevision = parsed.revision || 1;
    lastCloudUpdated = parsed.lastUpdated || new Date().toISOString();
    console.log(`[CloudSync] Loaded cloud data from disk. Revision: ${syncRevision}`);
  } catch (err) {
    console.error('[CloudSync] Error reading cloud file:', err);
  }
}

// Clean up stale devices (> 60 seconds inactive)
setInterval(() => {
  const now = Date.now();
  for (const [id, dev] of activeDevices.entries()) {
    if (now - dev.lastSeen > 60000) {
      activeDevices.delete(id);
    }
  }
}, 15000);

// ================= API ENDPOINTS =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    devicesOnline: activeDevices.size,
  });
});

// Device Heartbeat
app.post('/api/cloud-sync/heartbeat', (req: Request, res: Response) => {
  const { deviceId, deviceName, deviceType, branchName } = req.body;
  if (deviceId) {
    activeDevices.set(deviceId, {
      deviceId,
      deviceName: deviceName || 'جهاز غير مسمى',
      deviceType: deviceType || 'desktop',
      branchName: branchName || 'الفرع الرئيسي',
      lastSeen: Date.now(),
      ip: req.ip,
    });
  }

  res.json({
    success: true,
    revision: syncRevision,
    lastUpdated: lastCloudUpdated,
    connectedDevices: Array.from(activeDevices.values()),
    devicesCount: activeDevices.size,
  });
});

// Lightweight Status Check (poll every few seconds)
app.get('/api/cloud-sync/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    revision: syncRevision,
    lastUpdated: lastCloudUpdated,
    devicesCount: Math.max(1, activeDevices.size),
    connectedDevices: Array.from(activeDevices.values()),
  });
});

// Get Cloud Full State
app.get('/api/cloud-sync/data', (req: Request, res: Response) => {
  res.json({
    success: true,
    revision: syncRevision,
    lastUpdated: lastCloudUpdated,
    data: cloudData,
    devicesCount: Math.max(1, activeDevices.size),
  });
});

// Push Updates to Cloud (from any device / receptionist / admin)
app.post('/api/cloud-sync/data', (req: Request, res: Response) => {
  try {
    const { deviceId, deviceName, branchName, payload } = req.body;

    if (!payload) {
      return res.status(400).json({ success: false, message: 'Missing payload data' });
    }

    cloudData = payload;
    syncRevision += 1;
    lastCloudUpdated = new Date().toISOString();

    if (deviceId) {
      activeDevices.set(deviceId, {
        deviceId,
        deviceName: deviceName || 'جهاز معمل RT',
        deviceType: 'desktop',
        branchName: branchName || 'الفرع الرئيسي',
        lastSeen: Date.now(),
        ip: req.ip,
      });
    }

    // Persist to disk
    try {
      fs.writeFileSync(
        CLOUD_SYNC_FILE,
        JSON.stringify(
          {
            revision: syncRevision,
            lastUpdated: lastCloudUpdated,
            updatedByDevice: deviceName,
            data: cloudData,
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (fsErr) {
      console.error('[CloudSync] Failed to persist data to disk:', fsErr);
    }

    return res.json({
      success: true,
      revision: syncRevision,
      lastUpdated: lastCloudUpdated,
      message: 'تمت المزامنة السحابية بنجاح وحفظ البيانات لكافة الأجهزة',
    });
  } catch (err: any) {
    console.error('[CloudSync] Post error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GitHub Integration Endpoint (Allows saving/syncing directly to GitHub repo)
app.post('/api/github/sync-backup', async (req: Request, res: Response) => {
  try {
    const { token, owner, repo, filePath, message, contentJson } = req.body;

    const targetToken = token || process.env.GITHUB_TOKEN || '';
    const targetOwner = owner || 'ramimokhtar228-maker';
    const targetRepo = repo || 'rt-lab-rewards';
    const targetPath = filePath || 'data/lab_cloud_backup.json';

    if (!targetToken) {
      return res.status(400).json({ success: false, message: 'Token is missing' });
    }

    // First check if the file already exists on GitHub to obtain its SHA
    const getUrl = `https://api.github.com/repos/${targetOwner}/${targetRepo}/contents/${targetPath}`;
    let currentSha: string | undefined = undefined;

    const checkRes = await fetch(getUrl, {
      headers: {
        Authorization: `token ${targetToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'RT-Lab-Cloud-Sync',
      },
    });

    if (checkRes.ok) {
      const existing = (await checkRes.json()) as any;
      currentSha = existing.sha;
    }

    const dataToSave = contentJson !== undefined ? contentJson : (cloudData || { timestamp: new Date().toISOString() });
    const contentString = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave, null, 2);
    const base64Content = Buffer.from(contentString).toString('base64');

    const putRes = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${targetToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'RT-Lab-Cloud-Sync',
      },
      body: JSON.stringify({
        message: message || `Cloud Sync Lab Update - ${new Date().toLocaleString('ar-EG')}`,
        content: base64Content,
        sha: currentSha,
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      return res.status(putRes.status).json({
        success: false,
        message: 'GitHub API error',
        details: errData,
      });
    }

    const result = await putRes.json();
    return res.json({
      success: true,
      message: 'تم حفظ ومزامنة النسخة السحابية بنجاح على GitHub Repository!',
      commit: result.commit,
    });
  } catch (err: any) {
    console.error('[GitHubSync] Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= VITE DEV / PROD MIDDLEWARE =================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Vite Dev Server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 RT Lab Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
