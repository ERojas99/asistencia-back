import express from 'express';
import { db, admin } from '../config/firebase-config.js';

const router = express.Router();

// Obtener todos los visitantes
router.get('/', async (req, res) => {
  try {
    const visitorsSnapshot = await db.collection('visitors').get();
    const visitors = [];
    
    visitorsSnapshot.forEach(doc => {
      visitors.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json(visitors);
  } catch (error) {
    console.error('Error al obtener visitantes:', error);
    res.status(500).json({ error: 'Error al obtener los visitantes' });
  }
});

// Registrar un nuevo visitante
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      idNumber, // Nuevo campo para cédula
      email,
      countryCode,
      phoneNumber,
      company,
      faceData,
      faceImage
    } = req.body;
    
    // Validar datos obligatorios
    if (!firstName || !lastName || !idNumber || !email || !faceData) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Validar formato de cédula (solo números entre 6 y 10 dígitos)
    if (!/^\d{6,10}$/.test(idNumber)) {
      return res.status(400).json({ error: 'Formato de cédula inválido' });
    }
    
    // Crear objeto de datos para Firestore, omitiendo campos undefined
    const visitorData = {
      firstName,
      lastName,
      idNumber, // Guardar el número de cédula
      email,
      countryCode: countryCode || '+57',
      phoneNumber: phoneNumber || '',
      company: company || '',
      faceData,
      registrationDate: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Solo añadir faceImage si existe
    if (faceImage) {
      visitorData.faceImage = faceImage;
    }
    
    // Crear registro en Firestore
    const visitorRef = await db.collection('visitors').add(visitorData);
    
    res.status(201).json({
      id: visitorRef.id,
      message: 'Visitante registrado exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar visitante:', error);
    res.status(500).json({ error: 'Error al registrar el visitante' });
  }
});

// Buscar visitante por ID
router.get('/:id', async (req, res) => {
  try {
    const visitorDoc = await db.collection('visitors').doc(req.params.id).get();
    
    if (!visitorDoc.exists) {
      return res.status(404).json({ error: 'Visitante no encontrado' });
    }
    
    res.status(200).json({
      id: visitorDoc.id,
      ...visitorDoc.data()
    });
  } catch (error) {
    console.error('Error al buscar visitante:', error);
    res.status(500).json({ error: 'Error al buscar el visitante' });
  }
});

export default router;