import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '911234567890';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- WhatsApp Auth API ---

  // 1. Generate WhatsApp URL and start verification
  app.get('/api/auth/whatsapp-url', async (req, res) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = uuidv4();
    
    // Store verification request in Firestore
    await admin.firestore().collection('whatsapp_verifications').doc(verificationId).set({
      code,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    const message = `Verify my account with code: ${code}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    res.json({ url: whatsappUrl, verificationId, code });
  });

  // 2. Check verification status (polling)
  app.get('/api/auth/check-status', async (req, res) => {
    const { verificationId } = req.query;
    if (!verificationId) return res.status(400).json({ error: 'Missing verificationId' });

    const doc = await admin.firestore().collection('whatsapp_verifications').doc(verificationId as string).get();
    if (!doc.exists) return res.status(404).json({ error: 'Verification not found' });

    const data = doc.data();
    if (data?.status === 'verified') {
      // Generate Firebase Custom Token
      const customToken = await admin.auth().createCustomToken(data.uid, {
        phone: data.phone,
        role: data.role
      });

      // Also set our own JWT cookie for backend routes
      const token = jwt.sign({ uid: data.uid, phone: data.phone, role: data.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({ status: 'verified', user: data.user, customToken });
    }

    res.json({ status: 'pending' });
  });

  // 3. Mock Webhook for WhatsApp (Simulates receiving the message)
  app.post('/api/auth/whatsapp-webhook-mock', async (req, res) => {
    const { code, phone } = req.body;
    
    // Find the pending verification with this code
    const verificationsRef = admin.firestore().collection('whatsapp_verifications');
    const snapshot = await verificationsRef.where('code', '==', code).where('status', '==', 'pending').limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }

    const verificationDoc = snapshot.docs[0];
    const verificationId = verificationDoc.id;

    // 4. Create or login user
    let user;
    const usersRef = admin.firestore().collection('users');
    const userSnapshot = await usersRef.where('phone', '==', phone).limit(1).get();
    
    let uid;
    if (userSnapshot.empty) {
      uid = uuidv4();
      user = {
        id: uid, // Added id field as requested
        uid,
        phone,
        name: '', // Initialize empty fields
        native_place: '',
        current_city: '',
        profession: '',
        role: 'member',
        created_at: new Date().toISOString()
      };
      await usersRef.doc(uid).set(user);
    } else {
      const userDoc = userSnapshot.docs[0];
      uid = userDoc.id;
      user = userDoc.data();
    }

    // Update verification status
    await verificationsRef.doc(verificationId).update({
      status: 'verified',
      phone,
      uid,
      role: user.role,
      user
    });

    res.json({ success: true });
  });

  // 4. Get current user
  app.get('/api/auth/me', async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ user: null });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
      if (!userDoc.exists) return res.json({ user: null });
      res.json({ user: userDoc.data() });
    } catch (err) {
      res.json({ user: null });
    }
  });

  // 5. Logout
  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
