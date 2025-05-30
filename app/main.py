from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import visitors
import uvicorn

# Crear la aplicación FastAPI
app = FastAPI(
    title="API de Registro de Visitantes",
    description="API para el registro de visitantes con reconocimiento facial",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(visitors.router, prefix="/api/visitors", tags=["visitors"])

# Ruta de prueba
@app.get("/", tags=["root"])
async def root():
    return {"message": "API de Registro de Visitantes funcionando correctamente"}

# Para ejecutar directamente con Python
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)