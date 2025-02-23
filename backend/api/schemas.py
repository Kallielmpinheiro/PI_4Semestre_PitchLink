from ninja import Schema
from typing import Optional
from datetime import date, datetime
from typing import List, Any
from decimal import Decimal

class TestReq(Schema):
    name: str

class TestResp(Schema):
    name : str