from django.contrib import admin
from api.models import User, Innovation,InnovationImage, NegotiationMessage, NegotiationRoom

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    search_fields = ('email',)
    list_display = ('created','id','first_name','email','data_nasc')
    
admin.site.register(User, UserAdmin)


class  InnovationImageAdmin(admin.ModelAdmin):
    search_fields = ('innovation',)
    list_display = ('created','id','owner','innovation','imagem')

admin.site.register(InnovationImage,InnovationImageAdmin)


class InnovationAdmin(admin.ModelAdmin):
    search_fields = ('owner__first_name',)
    list_display = ('created','id','owner','categorias','investimento_minimo','porcentagem_cedida')
    
admin.site.register(Innovation,InnovationAdmin)

class NegotiationMessageAdmin(admin.ModelAdmin):
    list_display = ('created','id')
    
admin.site.register(NegotiationMessage,NegotiationMessageAdmin)

class NegotiationRoomAdmin(admin.ModelAdmin):
    list_display = ('created','id','idRoom')
    
admin.site.register(NegotiationRoom,NegotiationRoomAdmin)

# admin
admin.site.site_header = 'PitchLink Admin'
admin.site.index_title = 'Painel Administrativo'
admin.site.site_title = admin.site.site_header
