from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
from ..models.visitor import VisitorBase, VisitorCreate, VisitorResponse, EmailCheck
from ..config.firebase_config import db
from firebase_admin import firestore
import datetime

router = APIRouter()

@router.get("/", response_model=List[VisitorResponse])
async def get_all_visitors():
    """Obtener todos los visitantes registrados"""
    try:
        visitors_ref = db.collection('visitors')
        visitors_docs = visitors_ref.stream()
        
        visitors = []
        for doc in visitors_docs:
            visitor_data = doc.to_dict()
            visitor_data['id'] = doc.id
            
            # Convertir timestamp a string si existe
            if 'registrationDate' in visitor_data and visitor_data['registrationDate']:
                visitor_data['registrationDate'] = visitor_data['registrationDate'].strftime("%Y-%m-%d %H:%M:%S")
                
            visitors.append(visitor_data)
            
        return visitors
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener los visitantes: {str(e)}"
        )

@router.get("/check-email/{email}", response_model=EmailCheck)
async def check_email_exists(email: str):
    """Verificar si un correo electrónico ya existe en la base de datos"""
    try:
        email = email.lower()
        visitors_ref = db.collection('visitors')
        query = visitors_ref.where('email', '==', email).limit(1)
        docs = query.stream()
        
        # Verificar si hay al menos un documento
        exists = False
        for _ in docs:
            exists = True
            break
            
        return {"exists": exists}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al verificar el correo electrónico: {str(e)}"
        )

@router.post("/visitors", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_visitor(visitor: VisitorCreate):
    """Registrar un nuevo visitante"""
    try:
        # Validar datos obligatorios (ya lo hace Pydantic)
        
        # Crear objeto de datos para Firestore
        visitor_data = visitor.dict(exclude={"consent"})
        
        # Añadir fecha de registro
        visitor_data["registrationDate"] = firestore.SERVER_TIMESTAMP
        
        # Crear registro en Firestore
        visitor_ref = db.collection('visitors').document()
        visitor_ref.set(visitor_data)
        
        return {
            "id": visitor_ref.id,
            "message": "Visitante registrado exitosamente"
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el visitante: {str(e)}"
        )

@router.get("/{visitor_id}", response_model=VisitorResponse)
async def get_visitor_by_id(visitor_id: str):
    """Buscar visitante por ID"""
    try:
        visitor_doc = db.collection('visitors').document(visitor_id).get()
        
        if not visitor_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visitante no encontrado"
            )
        
        visitor_data = visitor_doc.to_dict()
        visitor_data['id'] = visitor_doc.id
        
        # Convertir timestamp a string si existe
        if 'registrationDate' in visitor_data and visitor_data['registrationDate']:
            visitor_data['registrationDate'] = visitor_data['registrationDate'].strftime("%Y-%m-%d %H:%M:%S")
            
        return visitor_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar el visitante: {str(e)}"
        )