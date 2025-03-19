from ninja import NinjaAPI
from django.contrib.auth import get_user_model
from ninja.security import django_auth

api = NinjaAPI()

@api.get("/check-auth", auth=django_auth)
def check_auth(request):
    return {"authenticated": True, "username": request.user.username}

@api.post("/full-profile")
def regsiter(request):
    return 200, {'message': 'manda a request ai pai'}

@api.get("/users")
def list_users(request):
    User = get_user_model()
    users = User.objects.filter(is_active=True, is_staff=False)
    
    user_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        }
        user_list.append(user_data)
    
    return user_list