from ninja import Schema
from typing import Optional
from datetime import date, datetime
from typing import List, Any
from decimal import Decimal


class ErrorResponse(Schema):
    error: bool = True
    result: str = 'error'
    message: str
    errors: Optional[List[str]] = []

class TestReq(Schema):
    name: str

class TestResp(Schema):
    name : str


class ProfileReq(Schema):
    pass 