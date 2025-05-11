from allauth.socialaccount.providers.openid_connect.views import OpenIDConnectOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2CallbackView
from allauth.socialaccount.views import SignupView
from django.shortcuts import redirect
from api.models import User
import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import logout

def custom_linkedin_callback(request):
    if request.GET.get('error') in ['user_cancelled_login', 'user_cancelled_authorize']:
        return redirect('http://localhost:4200/')

    provider_id = "linkedin-server"
    adapter = OpenIDConnectOAuth2Adapter(request, provider_id)

    class LinkedInCallbackView(OAuth2CallbackView):
        adapter_class = OpenIDConnectOAuth2Adapter

        def get_client(self, request, app):
            client = super().get_client(request, app)
            if "?" in client.authorize_url:
                client.authorize_url = client.authorize_url + "&prompt=select_account"
            else:
                client.authorize_url = client.authorize_url + "?prompt=select_account"
            return client

        def dispatch(self, request, *args, **kwargs):
            response = super().dispatch(request, *args, **kwargs)
            
            if request.user.is_authenticated:
                auth_user = request.user

                try:
                    user = User.objects.get(email=auth_user.email)
                    perfil_existente = True  
                except User.DoesNotExist:
                    user = User.objects.create(email=auth_user.email)
                    perfil_existente = False  

                token = jwt.encode(
                    {
                        'id': user.id,
                        'exp': datetime.utcnow() + timedelta(days=7),
                        'iat': datetime.utcnow()
                    },
                    settings.SECRET_KEY,
                    algorithm="HS256"
                )
                print(token)

                if perfil_existente:
                    redirect_url = f"http://localhost:4200/auth-redirect?token={token}&user_id={user.id}"
                else:
                    redirect_url = f"http://localhost:4200/modal-login?token={token}&user_id={user.id}&perfil=true"

                return redirect(redirect_url)
                
            return response

    view = LinkedInCallbackView()
    view.request = request
    view.adapter = adapter
    return view.dispatch(request)

def custom_google_callback(request):
    if request.GET.get('error') in ['access_denied', 'user_cancelled_login', 'user_cancelled_authorize']:
        return redirect('http://localhost:4200/')

    adapter = GoogleOAuth2Adapter(request)
    

    class GoogleCallbackView(OAuth2CallbackView):
        adapter_class = GoogleOAuth2Adapter

        def get_client(self, request, app):
            client = super().get_client(request, app)
            client.authorize_url = client.authorize_url + "&prompt=select_account"
            return client

        def dispatch(self, request, *args, **kwargs):
            response = super().dispatch(request, *args, **kwargs)

            if request.user.is_authenticated:
                auth_user = request.user

                try:
                    user = User.objects.get(email=auth_user.email)
                    perfil_existente = True  
                except User.DoesNotExist:
                    user = User.objects.create(email=auth_user.email)
                    perfil_existente = False  

                token = jwt.encode(
                    {
                        'id': user.id,
                        'exp': datetime.utcnow() + timedelta(days=7),
                        'iat': datetime.utcnow()
                    },
                    settings.SECRET_KEY,
                    algorithm="HS256"
                )
                print(token)

                if perfil_existente:
                    redirect_url = f"http://localhost:4200/auth-redirect?token={token}&user_id={user.id}"
                else:
                    redirect_url = f"http://localhost:4200/modal-login?token={token}&user_id={user.id}&perfil=true"

                return redirect(redirect_url)

            return response

    view = GoogleCallbackView()
    view.request = request
    view.adapter = adapter
    return view.dispatch(request)

class CustomSocialSignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return redirect('http://localhost:4200/')

def completo_logout(request):
    logout(request)
    return redirect('http://localhost:4200/')