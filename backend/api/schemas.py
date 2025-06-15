from typing import List, Optional
from ninja import NinjaAPI, Schema, Form, File
from ninja.files import UploadedFile
from uuid import UUID
from decimal import Decimal
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
    
class SearchInnovationCategoriesReq(Schema):
    search : str
    
class SearchInnovationReq(Schema):
    id : int 
    
class ImgInnovationReq(Schema):
    id : int 
    

class CreateRoomRequest(Schema):
    innovation_id: int
    investor_id: int
    
class CreateMessageRequest(Schema):
    room_id: str
    content: str
    receiver: int


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

class AcceptedProposalInnovation(Schema):
    id: int
    

class RejectProposalInnovation(Schema):
    id: int

class UpdateInovattionReq(Schema):
    id: int
    nome: Optional[str] = None
    descricao: Optional[str] = None
    investimento_minimo: Optional[float] = None
    porcentagem_cedida: Optional[float] = None
    categorias: Optional[List[str]] = None
    delete_image_ids: Optional[List[int]] = None
    keep_existing_images: Optional[bool] = True

class PaymentPlanReq(Schema):
    plan: str
    payment_method_id: str
    
    
class CreatePaymentIntentReq(Schema):
    plan: str
    
class PaymentResponse(Schema):
    success: bool
    message: str
    plan: str = None
    client_secret: str = None
    payment_intent_id: str = None
    amount: float = None
    
class PaymentHistoryResponse(Schema):
    id: int
    plan: str
    amount: float
    created: str
    status: str
    stripe_payment_intent_id: str

class CreateCreditPaymentIntentReq(Schema):
    amount: float

class ConfirmCreditPaymentReq(Schema):
    payment_intent_id: str

class CancelReq(Schema):
    id: str

class PaymentProposalReq(Schema):
    id_inovation: str
    id_proposal: str
    amount : Decimal
    id_sponsored : int
    
class SignatureContractReq(Schema):
    proposalId: int
    contractDetails: dict
    securityInfo: dict
    signatureInfo: dict
    signedPdfBase64: Optional[str] = None
    pdfFileName: Optional[str] = None
    
class CancelProposalReq(Schema):
    id: int
