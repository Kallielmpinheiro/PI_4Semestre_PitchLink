from typing import Optional
from ninja import Schema
from typing import List


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