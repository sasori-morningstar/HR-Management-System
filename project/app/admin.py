from django.contrib import admin

# Register your models here.
from .models import Account, User, Experience, Formation, Competence, Fonctionnalite, Favori

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('account_email', 'account_role', 'account_status', 'account_created_at')
    list_filter = ('account_role', 'account_status')
    search_fields = ('account_email',)
    ordering = ('-account_created_at',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_first_name', 'user_last_name', 'user_phone', 'user_country', 'user_city')
    list_filter = ('user_country', 'user_city')
    search_fields = ('user_first_name', 'user_last_name', 'user_phone')
    raw_id_fields = ('account',)

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('experience_company', 'experience_position', 'experience_start_date', 
                   'experience_end_date', 'experience_is_justified')
    list_filter = ('experience_is_justified', 'experience_start_date', 'experience_end_date')
    search_fields = ('experience_company', 'experience_position')
    raw_id_fields = ('user',)

@admin.register(Formation)
class FormationAdmin(admin.ModelAdmin):
    list_display = ('formation_institution', 'formation_nom', 'formation_start_date', 
                   'formation_end_date', 'formation_is_justified')
    list_filter = ('formation_is_justified', 'formation_start_date', 'formation_end_date')
    search_fields = ('formation_institution', 'formation_nom')
    raw_id_fields = ('user',)

@admin.register(Competence)
class CompetenceAdmin(admin.ModelAdmin):
    list_display = ('competence_name', 'competence_is_justified')
    list_filter = ('competence_is_justified',)
    search_fields = ('competence_name',)
    raw_id_fields = ('user',)

@admin.register(Fonctionnalite)
class CompetenceAdmin(admin.ModelAdmin):
    list_display = ('fonctionnalite_titre', 'fonctionnalite_lien', 'fonctionnalite_logo')
    search_fields = ('fonctionnalite_titre',)

@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    list_display = ('favoris_id',)
    raw_id_fields = ('account','fonctionnalite',)
