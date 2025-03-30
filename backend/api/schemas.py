from typing import Optional
from ninja import Schema
from typing import List


class ErrorResponse(Schema):
    error: bool = True
    result: str = 'error'
    message: str
    errors: Optional[List[str]] = []

from ninja import Schema
from typing import Optional, List
from datetime import datetime

class SaveReq(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    profile_picture: Optional[str] = None
    data_nasc: Optional[str] = None
    categories: Optional[List[str]] = None
