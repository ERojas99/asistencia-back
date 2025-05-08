import admin from 'firebase-admin';

let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} else {
  // Para desarrollo local
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Configurar Firestore para ignorar propiedades undefined
const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true
});

export { admin, db };

