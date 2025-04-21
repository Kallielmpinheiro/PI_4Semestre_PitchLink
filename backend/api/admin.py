from django.contrib import admin
from api.models import User
# Register your models here.


class UserAdmin(admin.ModelAdmin):
    search_fields = ('email',)
    list_display = ('id','first_name','email','data_nasc')
    
admin.site.register(User, UserAdmin)
    
    