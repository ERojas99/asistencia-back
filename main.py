from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL de tu frontend en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ejemplo de ruta
@app.get("/api/test")
async def test_route():
    return {"message": "Conexión exitosa con el backend FastAPI"}

# Ejecutar con: uvicorn main:app --reload