from django.contrib import admin
from api.models import PaymentTransaction, User, Innovation,InnovationImage, NegotiationMessage, NegotiationRoom, ProposalInnovation

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    search_fields = ('email',)
    list_display = ('created','id','first_name','email','data_nasc','plan')
    
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

class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('created', 'id', 'user', 'plan', 'amount', 'status', 'stripe_payment_intent_id')
    list_filter = ('status', 'plan', 'created', 'modified')
    search_fields = ('user__first_name', 'user__email', 'stripe_payment_intent_id', 'plan')
    readonly_fields = ('stripe_payment_intent_id', 'stripe_client_secret', 'get_amount_in_cents')
    
    def get_amount_in_cents(self, obj):
        return obj.get_amount_in_cents()
    get_amount_in_cents.short_description = 'Amount in Cents'

admin.site.register(PaymentTransaction, PaymentTransactionAdmin)

# admin
admin.site.site_header = 'PitchLink Admin'
admin.site.index_title = 'Painel Administrativo'
admin.site.site_title = admin.site.site_header
