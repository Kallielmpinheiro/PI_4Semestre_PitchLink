from typing import List, Optional
from ninja import NinjaAPI, Schema, Form, File
from ninja.files import UploadedFile
from uuid import UUID
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
    nome: str
    descricao: str
    investimento_minimo: float
    porcentagem_cedida: float
    categorias: str
    
class SearchInnovationReq(Schema):
    search : str
    
    
class ImgInnovationReq(Schema):
    id : int 
    

class CreateRoomRequest(Schema):
    innovation_id: int

class CreateMessageRequest(Schema):
    room_id: UUID
    senderid: int
    receiver: int
    content: str


class ProposalInnovationReq(Schema):
    sponsored : int
    innovation : int
    descricao : str
    investimento_minimo : float
    porcentagem_cedida : float
    
class SearchroposalInnovationReq(Schema):
    id: int
    
    
class EnterNegotiationRomReq(Schema):
    id: str
    
class SearchMensagensRelatedReq(Schema):
    id: str