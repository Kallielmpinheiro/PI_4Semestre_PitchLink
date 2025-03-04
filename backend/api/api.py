from ninja import NinjaAPI
from django.contrib.auth import get_user_model
from ninja.security import django_auth

api = NinjaAPI()

@api.get("/check-auth", auth=django_auth)
def check_auth(request):
    return {"authenticated": True, "username": request.user.username}