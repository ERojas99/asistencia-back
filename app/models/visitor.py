from pydantic import BaseModel, EmailStr, Field, validator
import re
from typing import Optional, Dict, Any, List

class VisitorBase(BaseModel):
    firstName: str
    lastName: str
    idNumber: str
    email: EmailStr
    countryCode: str = "+57"
    phoneNumber: Optional[str] = ""
    company: Optional[str] = ""
    
    @validator('idNumber')
    def validate_id_number(cls, v):
        if not re.match(r'^\d{6,10}$', v):
            raise ValueError('El número de cédula debe contener entre 6 y 10 dígitos')
        return v

class VisitorCreate(VisitorBase):
    faceData: Dict[str, Any]
    faceImage: Optional[str] = None
    consent: bool = False
    
    @validator('consent')
    def validate_consent(cls, v):
        if not v:
            raise ValueError('Debe aceptar el tratamiento de datos personales')
        return v

class VisitorResponse(VisitorBase):
    id: str
    registrationDate: Optional[str] = None

class EmailCheck(BaseModel):
    exists: bool