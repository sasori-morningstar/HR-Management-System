from django.db import models
from django.forms import ValidationError
from django.contrib.auth.models import AbstractUser

# Create your models here.
class Account(AbstractUser):
    ACCOUNT_ROLES = [
        ('c', 'Candidat'),
        ('e', 'Employé'),
        ('m', 'Manager'),
        ('a', 'Agent'),
    ]
    account_created_at = models.DateTimeField(auto_now_add=True)
    account_id= models.AutoField(primary_key=True)
    account_email = models.EmailField(max_length=255, unique=True)
    account_password = models.CharField(max_length=255)
    account_role = models.CharField(max_length=1, choices=ACCOUNT_ROLES, default='c')
    account_status = models.BooleanField(default=False)
    last_login = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_email} - {self.get_account_role_display()}"

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_first_name = models.CharField(max_length=50)
    user_last_name = models.CharField(max_length=50)
    user_birth_date = models.DateField()
    user_country = models.CharField(max_length=50)
    user_city = models.CharField(max_length=50)
    user_commune = models.CharField(max_length=50)
    user_street = models.CharField(max_length=255)
    user_phone = models.CharField(max_length=10, unique=True)
    user_profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True, default=None)
    account = models.OneToOneField('Account', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user_first_name} {self.user_last_name}"

class Experience(models.Model):
    experience_id = models.AutoField(primary_key=True)
    experience_company = models.CharField(max_length=100)
    experience_position = models.CharField(max_length=100)
    experience_start_date = models.DateField()
    experience_end_date = models.DateField()
    experience_is_justified = models.BooleanField(default=False)
    experience_justification = models.FileField(upload_to='justifications/experiences/', null=True, blank=True, default=None)
    user = models.ForeignKey('User', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.experience_position} at {self.experience_company}"

    def clean(self):
        if self.experience_end_date < self.experience_start_date:
            raise ValidationError("End date cannot be before start date")

class Formation(models.Model):
    formation_id = models.AutoField(primary_key=True)
    formation_institution = models.CharField(max_length=100)
    formation_nom = models.CharField(max_length=100)
    formation_start_date = models.DateField()
    formation_end_date = models.DateField()
    formation_is_justified = models.BooleanField(default=False)
    formation_justification = models.FileField(upload_to='justifications/formations/', null=True, blank=True, default=None)
    user = models.ForeignKey('User', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.formation_nom} at {self.formation_institution}"

    def clean(self):
        if self.formation_end_date < self.formation_start_date:
            raise ValidationError("End date cannot be before start date")

class Competence(models.Model):
    competence_id = models.AutoField(primary_key=True)
    competence_name = models.CharField(max_length=50)
    competence_is_justified = models.BooleanField(default=False)
    competence_justification = models.FileField(upload_to='justifications/competences/', null=True, blank=True, default=None)
    user = models.ForeignKey('User', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.competence_name}"
