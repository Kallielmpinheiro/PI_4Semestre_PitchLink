from allauth.socialaccount.providers.openid_connect.views import OpenIDConnectOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2CallbackView
from allauth.socialaccount.views import SignupView
from django.shortcuts import redirect
from api.models import User


def custom_linkedin_callback(request):
    # Trata caso de cancelamento
    if request.GET.get('error') in ['user_cancelled_login', 'user_cancelled_authorize']:
        return redirect('http://localhost:4200/')

    provider_id = "linkedin-server"
    adapter = OpenIDConnectOAuth2Adapter(request, provider_id)

    class LinkedInCallbackView(OAuth2CallbackView):
        adapter_class = OpenIDConnectOAuth2Adapter

        def dispatch(self, request, *args, **kwargs):
            # Chama a implementação original para autenticar o usuário
            response = super().dispatch(request, *args, **kwargs)
            
            # Verifica se o usuário está autenticado e é primeiro login
            if request.user.is_authenticated:
                if not User.objects.filter(email=request.user.email).exists():
                    return redirect('http://localhost:4200/perfil')
                return redirect('http://localhost:4200/app/recs')
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

        def dispatch(self, request, *args, **kwargs):
            response = super().dispatch(request, *args, **kwargs)

            if request.user.is_authenticated:
                if not User.objects.filter(email=request.user.email).exists():
                    return redirect('http://localhost:4200/perfil')
                return redirect('http://localhost:4200/app/recs')

            return response

    # Instancia manual da view
    view = GoogleCallbackView()
    view.request = request
    view.adapter = adapter

    return view.dispatch(request)

class CustomSocialSignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return redirect('http://localhost:4200/')
