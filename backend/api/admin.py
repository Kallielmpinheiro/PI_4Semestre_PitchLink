from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from api.models import ContractSignature, CreditTransactions, PaymentTransaction, ProposalPayment, User, Innovation, InnovationImage, NegotiationMessage, NegotiationRoom, ProposalInnovation


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('get_user_info', 'email', 'get_plan_display', 'get_balance_display', 'get_created_display')
    list_filter = ('plan', 'created', 'data_nasc')
    search_fields = ('email', 'first_name', 'last_name')
    
    fieldsets = (
        ('Informações Pessoais', {
            'fields': ('first_name', 'last_name', 'email', 'data_nasc')
        }),
        ('Foto de Perfil', {
            'fields': ('profile_picture', 'profile_picture_url')
        }),
        ('Plano e Financeiro', {
            'fields': ('plan', 'balance', 'categories')
        }),
    )
    
    def get_user_info(self, obj):
        full_name = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return format_html(
            '<strong>{}</strong> <div style="font-size: 12px; color: #666;">{}</div>',
            full_name or 'Sem nome',
            obj.email or 'Sem email'
        )
    get_user_info.short_description = 'Usuário'
    
    def get_plan_display(self, obj):
        colors = {'gratuito': '#6c757d', 'esmerald': '#28a745', 'sapphire': '#007bff', 'ruby': '#dc3545'}
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.plan, '#6c757d'),
            obj.get_plan_display()
        )
    get_plan_display.short_description = 'Plano'
    
    def get_balance_display(self, obj):
        return format_html('R$ {}', f'{float(obj.balance):.2f}')
    get_balance_display.short_description = 'Saldo'
    
    def get_created_display(self, obj):
        return format_html(
            '<div style="font-size: 12px; color: #666;">{}</div>',
            obj.created.strftime('%d/%m/%Y %H:%M')
        )
    get_created_display.short_description = 'Criado em'

@admin.register(Innovation)
class InnovationAdmin(admin.ModelAdmin):
    list_display = ('get_innovation_info', 'owner', 'get_investment_display', 'get_equity_display', 'get_status_display')
    list_filter = ('status', 'created', 'categorias')
    search_fields = ('nome', 'owner__first_name', 'owner__email', 'descricao')
    filter_horizontal = ('partners',)
    
    def get_innovation_info(self, obj):
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">{}</small>',
            obj.nome or 'Sem nome',
            obj.descricao[:50] + '...' if obj.descricao and len(obj.descricao) > 50 else obj.descricao or 'Sem descrição'
        )
    get_innovation_info.short_description = 'Inovação'
    
    def get_investment_display(self, obj):
        return format_html('<strong>R$ {}</strong>', obj.investimento_minimo or '0')
    get_investment_display.short_description = 'Investimento'
    
    def get_equity_display(self, obj):
        return format_html('<strong>{}%</strong>', obj.porcentagem_cedida or '0')
    get_equity_display.short_description = 'Equity'
    
    def get_status_display(self, obj):
        colors = {
            'active': '#28a745',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(InnovationImage)
class InnovationImageAdmin(admin.ModelAdmin):
    list_display = ('get_image_info', 'innovation', 'owner', 'get_created_display')
    list_filter = ('created',)
    search_fields = ('innovation__nome', 'owner__first_name')
    
    def get_image_info(self, obj):
        return format_html('Imagem da Inovação')
    get_image_info.short_description = 'Imagem'
    
    def get_created_display(self, obj):
        return format_html(
            '<div style="font-size: 12px; color: #666;">{}</div>',
            obj.created.strftime('%d/%m/%Y %H:%M')
        )
    get_created_display.short_description = 'Criado em'

@admin.register(NegotiationRoom)
class NegotiationRoomAdmin(admin.ModelAdmin):
    list_display = ('get_room_info', 'innovation', 'get_participants_count', 'get_status_display')
    list_filter = ('status', 'created')
    search_fields = ('idRoom', 'innovation__nome', 'participants__email')
    filter_horizontal = ('participants',)
    
    def get_room_info(self, obj):
        return format_html(
            '<code>{}</code>',
            str(obj.idRoom)[:8] + '...'
        )
    get_room_info.short_description = 'Sala'
    
    def get_participants_count(self, obj):
        count = obj.participants.count()
        return format_html('<strong>{}</strong> participante{}'.format(count, 's' if count != 1 else ''))
    get_participants_count.short_description = 'Participantes'
    
    def get_status_display(self, obj):
        colors = {
            'open': '#28a745',
            'closed': '#dc3545',
            'in_progress': '#007bff'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(NegotiationMessage)
class NegotiationMessageAdmin(admin.ModelAdmin):
    list_display = ('get_message_info', 'sender', 'receiver', 'room', 'get_read_status')
    list_filter = ('is_read', 'created')
    search_fields = ('content', 'sender__email', 'receiver__email')
    
    def get_message_info(self, obj):
        return format_html(
            '<div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{}</div>',
            obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
        )
    get_message_info.short_description = 'Mensagem'
    
    def get_read_status(self, obj):
        if obj.is_read:
            return format_html('<span style="color: green;">✓ Lida</span>')
        return format_html('<span style="color: orange;">○ Não lida</span>')
    get_read_status.short_description = 'Status'

@admin.register(ProposalInnovation)
class ProposalInnovationAdmin(admin.ModelAdmin):
    list_display = ('get_proposal_info', 'investor', 'sponsored', 'get_investment_display', 'get_status_display', 'get_payment_status')
    list_filter = ('status', 'accepted', 'paid', 'created')
    search_fields = ('investor__first_name', 'sponsored__first_name', 'innovation__nome')
    
    def get_proposal_info(self, obj):
        return format_html(
            '<strong>{}</strong>',
            obj.innovation.nome
        )
    get_proposal_info.short_description = 'Proposta'
    
    def get_investment_display(self, obj):
        return format_html('R$ {} ({}%)', obj.investimento_minimo or '0', obj.porcentagem_cedida or '0')
    get_investment_display.short_description = 'Investimento'
    
    def get_payment_status(self, obj):
        if obj.paid:
            return format_html('<span style="color: green;">✓ Pago</span>')
        return format_html('<span style="color: orange;">○ Pendente</span>')
    get_payment_status.short_description = 'Pagamento'
    
    def get_status_display(self, obj):
        colors = {
            'pending': '#ffc107',
            'cancelled': '#dc3545',
            'rejected': '#dc3545',
            'accepted_request': '#007bff',
            'accepted_proposal': '#007bff',
            'accepted_contract': '#007bff',
            'completed': '#6f42c1'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('get_payment_info', 'user', 'get_plan_display', 'get_amount_display', 'get_status_display')
    list_filter = ('status', 'plan', 'created')
    search_fields = ('user__first_name', 'user__email', 'stripe_payment_intent_id')
    readonly_fields = ('stripe_payment_intent_id', 'stripe_client_secret')
    
    def get_payment_info(self, obj):
        return format_html(
            '<code>{}</code>',
            obj.stripe_payment_intent_id[:20] + '...' if obj.stripe_payment_intent_id else 'N/A'
        )
    get_payment_info.short_description = 'Transação'
    
    def get_plan_display(self, obj):
        colors = {'esmerald': '#28a745', 'sapphire': '#007bff', 'ruby': '#dc3545'}
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.plan, '#6c757d'),
            obj.get_plan_display()
        )
    get_plan_display.short_description = 'Plano'
    
    def get_amount_display(self, obj):
        return format_html('<strong>R$ {}</strong>', f'{float(obj.amount):.2f}')
    get_amount_display.short_description = 'Valor'
    
    def get_status_display(self, obj):
        colors = {
            'pending': '#ffc107',
            'processing': '#ffc107',
            'succeeded': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#dc3545',
            'requires_action': '#ffc107'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(CreditTransactions)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ('get_credit_info', 'user', 'get_amount_display', 'get_status_display')
    list_filter = ('status', 'created')
    search_fields = ('user__first_name', 'user__email', 'stripe_payment_intent_id')
    readonly_fields = ('stripe_payment_intent_id', 'stripe_client_secret')
    
    def get_credit_info(self, obj):
        return format_html(
            '<code>{}</code>',
            obj.stripe_payment_intent_id[:20] + '...' if obj.stripe_payment_intent_id else 'N/A'
        )
    get_credit_info.short_description = 'Crédito'
    
    def get_amount_display(self, obj):
        return format_html('<strong>R$ {}</strong>', f'{float(obj.amount):.2f}')
    get_amount_display.short_description = 'Valor'
    
    def get_status_display(self, obj):
        colors = {
            'pending': '#ffc107',
            'processing': '#ffc107',
            'succeeded': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#dc3545',
            'requires_action': '#ffc107'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(ProposalPayment)
class ProposalPaymentAdmin(admin.ModelAdmin):
    list_display = ('get_proposal_payment_info', 'investor', 'get_amount_display', 'get_status_display')
    list_filter = ('status', 'created')
    search_fields = ('investor__first_name', 'investor__email', 'proposal__innovation__nome')
    
    def get_proposal_payment_info(self, obj):
        return format_html(
            '<strong>{}</strong>',
            obj.proposal.innovation.nome
        )
    get_proposal_payment_info.short_description = 'Pagamento da Proposta'
    
    def get_amount_display(self, obj):
        return format_html('<strong>R$ {}</strong>', f'{float(obj.amount):.2f}')
    get_amount_display.short_description = 'Valor'
    
    def get_status_display(self, obj):
        colors = {
            'pending': '#ffc107',
            'processing': '#ffc107',
            'succeeded': '#28a745',
            'failed': '#dc3545',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'

@admin.register(ContractSignature)
class ContractSignatureAdmin(admin.ModelAdmin):
    list_display = ('get_contract_info', 'signer_name', 'get_role_display', 'get_pdf_status', 'get_status_display')
    list_filter = ('status', 'user_role', 'document_type', 'created')
    search_fields = ('signer_name', 'signer_email', 'proposal__innovation__nome', 'contract_title')
    readonly_fields = ('contract_hash', 'ip_address', 'user_agent', 'timestamp')
    
    fieldsets = (
        ('Informações do Contrato', {
            'fields': ('proposal', 'contract_title', 'contract_subtitle', 'innovation_name', 'status')
        }),
        ('Signatário', {
            'fields': ('signer', 'signer_name', 'signer_email', 'user_role', 'document_type', 'document_number', 'signed_at')
        }),
        ('Termos Financeiros', {
            'fields': ('investment_amount', 'equity_percentage', 'contract_description')
        }),
        ('Arquivo PDF', {
            'fields': ('signed_pdf_file', 'get_pdf_download_link'),
            'classes': ('wide',)
        }),
        ('Informações de Segurança', {
            'fields': ('contract_hash', 'timestamp', 'ip_address', 'user_agent', 'platform', 'language', 'screen_resolution', 'timezone'),
            'classes': ('collapse',)
        }),
    )
    
    def get_contract_info(self, obj):
        return format_html(
            '<strong>{}</strong><br><small style="color: #666;">{}</small>',
            obj.contract_title[:40] + '...' if len(obj.contract_title) > 40 else obj.contract_title,
            obj.innovation_name
        )
    get_contract_info.short_description = 'Contrato'
    
    def get_role_display(self, obj):
        colors = {'investor': '#007bff', 'sponsored': '#28a745'}
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            colors.get(obj.user_role, '#6c757d'),
            obj.user_role.title()
        )
    get_role_display.short_description = 'Papel'
    
    def get_pdf_status(self, obj):
        if obj.signed_pdf_file:
            return format_html('<span style="color: green;">✓ PDF Anexado</span>')
        return format_html('<span style="color: red;">✗ Sem PDF</span>')
    get_pdf_status.short_description = 'PDF'
    
    def get_status_display(self, obj):
        colors = {
            'signed': '#28a745',
            'cancelled': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    get_status_display.short_description = 'Status'
    
    def get_pdf_download_link(self, obj):
        if obj.signed_pdf_file:
            return format_html(
                '<a href="{}" target="_blank" style="display: inline-flex; align-items: center; gap: 5px; background: #007bff; color: white; padding: 8px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">Baixar PDF</a>',
                obj.signed_pdf_file.url
            )
        return "Nenhum arquivo disponível"
    get_pdf_download_link.short_description = 'Download'

admin.site.site_header = 'PitchLink - Painel Administrativo'
admin.site.index_title = 'Gerenciamento do Sistema'
admin.site.site_title = 'PitchLink Admin'
