from typing import Optional
from ninja import Schema
from typing import List


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