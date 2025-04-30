const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase-config');

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
      email,
      countryCode,
      phoneNumber,
      company,
      faceData,
      faceImage
    } = req.body;
    
    // Validar datos obligatorios
    if (!firstName || !lastName || !email || !faceData) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Verificar si faceData incluye verificación de vida
    const hasLivenessVerification = faceData && 
                                   faceData.livenessVerified && 
                                   faceData.embeddings && 
                                   faceData.embeddings.frontal &&
                                   faceData.embeddings.right &&
                                   faceData.embeddings.left;
    
    // Crear objeto de datos para Firestore
    const visitorData = {
      firstName,
      lastName,
      email,
      countryCode: countryCode || '+57',
      phoneNumber: phoneNumber || '',
      company: company || '',
      registrationDate: admin.firestore.FieldValue.serverTimestamp(),
      livenessVerified: hasLivenessVerification
    };
    
    // Añadir datos faciales según el formato recibido
    if (hasLivenessVerification) {
      visitorData.faceData = {
        frontal: faceData.embeddings.frontal,
        right: faceData.embeddings.right,
        left: faceData.embeddings.left
      };
      
      // Añadir imágenes si existen
      if (faceData.images && faceData.images.frontal) {
        visitorData.faceImage = faceData.images.frontal;
      }
    } else if (faceData) {
      // Formato antiguo (solo un embedding)
      visitorData.faceData = faceData;
      
      // Añadir imagen si existe
      if (faceImage) {
        visitorData.faceImage = faceImage;
      }
    }
    
    // Crear registro en Firestore
    const visitorRef = await db.collection('visitors').add(visitorData);
    
    res.status(201).json({
      id: visitorRef.id,
      message: 'Visitante registrado exitosamente',
      livenessVerified: hasLivenessVerification
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

module.exports = router;