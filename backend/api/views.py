from allauth.socialaccount.providers.openid_connect.views import OpenIDConnectOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2CallbackView
from allauth.socialaccount.views import SignupView
from django.shortcuts import redirect

def custom_linkedin_callback(request):

    if request.GET.get('error') == 'user_cancelled_login' or request.GET.get('error') == 'user_cancelled_authorize':
        return redirect('http://localhost:4200/')

    provider_id = "linkedin-server"
    adapter = OpenIDConnectOAuth2Adapter(request, provider_id)

    class LinkedInCallbackView(OAuth2CallbackView):
        adapter_class = OpenIDConnectOAuth2Adapter

    view = LinkedInCallbackView()
    view.request = request  
    view.adapter = adapter  
    return view.dispatch(request)

class CustomSocialSignupView(SignupView):
    def dispatch(self, request, *args, **kwargs):
        return redirect('http://localhost:4200/')
