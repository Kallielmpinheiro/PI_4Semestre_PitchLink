from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from .schemas import TestReq, TestResp

api = NinjaAPI()

@api.get("/test", response={200: TestResp, 404: dict})
def test_endpoint(request, data: TestReq) -> TestResp:
    if data.name:
        return 200, TestResp(name=data.name)
    else:
        return 404, {"error": "Name is required"}