from django.contrib import admin
from api.models import User, Innovation,InnovationImage, NegotiationMessage, NegotiationRoom, ProposalInnovation

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
    list_display = ('created', 'id', 'sender', 'receiver', 'room', 'is_read')
    list_filter = ('is_read', 'created', 'modified')
    search_fields = ('content', 'sender__email', 'receiver__email', 'room__idRoom')
    
admin.site.register(NegotiationMessage,NegotiationMessageAdmin)

class NegotiationRoomAdmin(admin.ModelAdmin):
    list_display = ('created', 'id', 'idRoom', 'innovation', 'status', 'get_participants_count')
    list_filter = ('status', 'created', 'modified')
    search_fields = ('idRoom', 'innovation__nome', 'participants__email', 'participants__first_name')
    filter_horizontal = ('participants',)
    
    def get_participants_count(self, obj):
        return obj.participants.count()
    get_participants_count.short_description = 'Participants Count'
    
admin.site.register(NegotiationRoom, NegotiationRoomAdmin)

class ProposalInnovationAdmin(admin.ModelAdmin):
    list_display = ('created', 'id', 'investor', 'sponsored', 'innovation', 'investimento_minimo', 'porcentagem_cedida', 'status')
    list_filter = ('status', 'accepted', 'created', 'modified')
    search_fields = ('investor__first_name', 'sponsored__first_name', 'innovation__nome', 'descricao')

admin.site.register(ProposalInnovation, ProposalInnovationAdmin)


# admin
admin.site.site_header = 'PitchLink Admin'
admin.site.index_title = 'Painel Administrativo'
admin.site.site_title = admin.site.site_header
