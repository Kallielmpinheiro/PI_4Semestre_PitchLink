from typing import List, Optional
from ninja import NinjaAPI, Schema, Form, File
from ninja.files import UploadedFile

# Schemas payloads para requests

class ErrorResponse(Schema):
    error: bool = True
    result: str = 'error'
    message: str
    
class SuccessResponse(Schema):
    token : str = None
    status: int = 200
    data: list = None
    message: str = None

class SaveReq(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    profile_picture: Optional[str] = None
    data_nasc: Optional[str] = None
    categories: Optional[List[str]] = None 
    
class UserReq(Schema):
    email: str
    
class CreateInnovationReq(Schema):
    partners: Optional[str] = None
    nome: Optional[str] = None
    descricao : Optional[str] = None
    investimento_minimo : Optional[str] = None
    porcentagem_cedida : Optional[str] = None
    categorias : Optional[str] = None
    
class SearchInnovationReq(Schema):
    search : str