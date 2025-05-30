import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar Firebase
def initialize_firebase():
    try:
        # Intentar obtener credenciales desde variable de entorno
        if os.getenv("FIREBASE_CREDENTIALS"):
            cred_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
            cred = credentials.Certificate(cred_dict)
        else:
            # Para desarrollo local, usar archivo de credenciales
            service_account_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                "../serviceAccountKey.json"
            )
            cred = credentials.Certificate(service_account_path)
        
        # Inicializar la aplicación
        firebase_admin.initialize_app(
            cred,
            {
                'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
            }
        )
        
        # Obtener instancia de Firestore
        db = firestore.client()
        return db
    except Exception as e:
        print(f"Error al inicializar Firebase: {e}")
        raise

# Exportar la instancia de Firestore
db = initialize_firebase()