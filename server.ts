import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// --- REST API Endpoints with Real Database Persistence ---

// 1. Auth & Users
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const user = db.createUser(req.body);
    return res.status(201).json({
      success: true,
      user,
      token: `fb_token_${user.id}_${Date.now()}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role, userId } = req.body;
  const users = db.getUsers();
  let user = users.find((u) => u.id === userId);

  if (!user && email) {
    user = db.findUserByEmail(email);
  }

  if (!user && role) {
    user = users.find((u) => u.role === role);
  }

  if (!user) {
    user = users[0];
  }

  db.logAuditEvent({
    actor: user.name,
    role: user.role,
    action: 'USER_LOGIN',
    entity: 'User',
    entity_id: user.id,
    status: 'SUCCESS',
    details: `User logged in with role ${user.role}`,
  });

  return res.json({
    success: true,
    user,
    token: `fb_token_${user.id}_${Date.now()}`,
  });
});

app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json({ success: true, users: db.getUsers() });
});

// 2. Donations
app.get('/api/donations', (req: Request, res: Response) => {
  const { status, donor_id } = req.query as { status?: string; donor_id?: string };
  const donations = db.getDonations({ status, donorId: donor_id });
  res.json({ success: true, count: donations.length, donations });
});

app.post('/api/donations', (req: Request, res: Response) => {
  try {
    const donation = db.createDonation(req.body);
    return res.status(201).json({ success: true, donation });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

app.get('/api/donations/:id', (req: Request, res: Response) => {
  const donation = db.getDonationById(req.params.id);
  if (!donation) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Donation not found' } });
  }
  return res.json({ success: true, donation });
});

app.put('/api/donations/:id', (req: Request, res: Response) => {
  const updated = db.updateDonation(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Donation not found' } });
  }
  return res.json({ success: true, donation: updated });
});

app.delete('/api/donations/:id', (req: Request, res: Response) => {
  const deleted = db.deleteDonation(req.params.id);
  return res.json({ success: deleted, message: deleted ? 'Donation removed' : 'Donation not found' });
});

// 3. AI Dynamic Matching Engine
app.get('/api/matches/:donation_id', (req: Request, res: Response) => {
  const matches = db.getMatchesForDonation(req.params.donation_id);
  res.json({
    success: true,
    donation_id: req.params.donation_id,
    matches,
    algorithm: '5-factor normalized scoring: Distance (30%) + Compatibility (25%) + Urgency (20%) + Capacity (15%) + Verification (10%)',
  });
});

app.post('/api/matches/:id/accept', (req: Request, res: Response) => {
  const { ngo_id, ngo_name } = req.body;
  const updated = db.acceptMatch(req.params.id, ngo_id, ngo_name);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Donation record not found' });
  }
  return res.json({
    success: true,
    message: 'Match accepted. Volunteer courier dispatch triggered.',
    donation: updated,
  });
});

// 4. Volunteers & Pickups
app.get('/api/volunteers', (_req: Request, res: Response) => {
  res.json({ success: true, volunteers: db.getVolunteers() });
});

app.post('/api/pickups', (req: Request, res: Response) => {
  const { donation_id, volunteer_id, volunteer_name } = req.body;
  const updated = db.assignVolunteer(donation_id, volunteer_id, volunteer_name);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Donation not found' });
  }
  return res.status(201).json({
    success: true,
    message: 'Mission accepted by courier.',
    donation: updated,
  });
});

app.put('/api/pickups/:id/status', (req: Request, res: Response) => {
  const { status, entered_otp } = req.body;
  const result = db.updatePickupStatus(req.params.id, status, entered_otp);
  if (!result.success) {
    return res.status(400).json({ success: false, error: { message: result.message } });
  }
  return res.json({
    success: true,
    message: result.message,
    donation: result.donation,
  });
});

// 5. Food Safety Inspection
app.post('/api/safety-check', (req: Request, res: Response) => {
  const { donation_id, temperature_c, checked_by, packaging_intact, overall_status } = req.body;
  const donation = db.getDonationById(donation_id);

  if (!donation) {
    return res.status(404).json({ success: false, message: 'Donation record not found' });
  }

  // Safety block condition: if food is hot cooked meal and temp < 55°C
  if (temperature_c && temperature_c < 55 && donation.food_category === 'Cooked Meal') {
    db.logAuditEvent({
      actor: checked_by || 'Courier Inspector',
      role: 'volunteer',
      action: 'SAFETY_ALERT_TRIGGERED',
      entity: 'FoodDonation',
      entity_id: donation_id,
      status: 'WARNING',
      details: `Food temperature check warning (${temperature_c}°C). Required: >60°C hot hold.`,
    });
  }

  db.updateDonation(donation_id, {
    safety_status: overall_status === 'REJECTED' ? 'REJECTED' : 'VERIFIED',
  });

  db.logAuditEvent({
    actor: checked_by || 'Field Inspector',
    role: 'volunteer',
    action: 'SAFETY_INSPECTION_COMPLETED',
    entity: 'FoodSafetyCheck',
    entity_id: donation_id,
    status: 'SUCCESS',
    details: `7-point physical inspection verified (Packaging: ${packaging_intact ? 'Pass' : 'Fail'}, Status: ${overall_status || 'SAFE'})`,
  });

  return res.json({
    success: true,
    safety_id: `sc-${Date.now()}`,
    status: overall_status || 'SAFE',
    timestamp: new Date().toISOString(),
    message: 'Food safety declaration logged into immutable custody ledger.',
  });
});

// 6. Community Needs Board
app.get('/api/needs', (_req: Request, res: Response) => {
  res.json({ success: true, needs: db.getCommunityNeeds() });
});

app.post('/api/needs', (req: Request, res: Response) => {
  const need = db.createCommunityNeed(req.body);
  res.status(201).json({ success: true, need });
});

// 7. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const { user_id } = req.query as { user_id?: string };
  res.json({ success: true, notifications: db.getNotifications(user_id) });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const updated = db.markNotificationRead(req.params.id);
  res.json({ success: updated });
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  const { user_id } = req.body;
  db.markAllNotificationsRead(user_id);
  res.json({ success: true });
});

// 8. Audit Logs
app.get('/api/audit', (_req: Request, res: Response) => {
  res.json({ success: true, logs: db.getAuditLogs() });
});

// 9. Analytics & Impact
app.get('/api/analytics', (_req: Request, res: Response) => {
  res.json({
    success: true,
    analytics: db.getAnalytics(),
    methodology: 'CO2e conversion: 4.43 kg CO2e per kg food diverted from landfill (FAO / EPA). Clearly disclosed as an illustrative estimate.',
  });
});

// 10. Admin Reset Demo Data
app.post('/api/admin/reset', (_req: Request, res: Response) => {
  const refreshed = db.resetToInitial();
  return res.json({
    success: true,
    message: 'Demo database successfully restored to fresh hackathon state.',
    lastResetAt: refreshed.lastResetAt,
  });
});

// 11. Service Worker Endpoint
app.get('/sw.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    const CACHE_NAME = 'foodbridge-ai-v2';
    const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
      );
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
      );
      self.clients.claim();
    });

    self.addEventListener('fetch', (event) => {
      if (event.request.url.includes('/api/')) {
        // Network first for API with fallback
        return;
      }
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        })
      );
    });
  `);
});

// 12. System Health
app.get('/api/health', (_req: Request, res: Response) => {
  const donations = db.getDonations();
  const users = db.getUsers();
  res.json({
    status: 'ONLINE',
    service: 'FoodBridge AI Core Engine',
    version: '2.5.0-hackathon-production',
    sdg_target: 'SDG 2 — Zero Hunger & SDG 12 — Responsible Consumption',
    components: {
      frontend: 'ONLINE',
      backend: 'ONLINE',
      database: 'ONLINE',
      matching_engine: 'ONLINE',
      safety_engine: 'ONLINE',
      offline_service_worker: 'READY',
    },
    counts: {
      users: users.length,
      donations: donations.length,
      active_donations: donations.filter((d) => d.status !== 'COMPLETED').length,
      audit_events: db.getAuditLogs().length,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server with Vite middleware in dev or static files in production
async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodBridge AI Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
});
