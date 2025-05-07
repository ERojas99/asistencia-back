import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('C:/Users/Usuario/Documents/Tecon/Reg-adicom/back/config/serviceAccountKey.json');

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

