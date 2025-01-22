from django.contrib.auth.models import BaseUserManager

class AccountManager(BaseUserManager):
    def create_user(self, account_email, password=None, **extra_fields):
        extra_fields.setdefault('account_role', 'c')
        extra_fields.setdefault('account_status', True)
        extra_fields.setdefault('is_active', True)
        
        if not account_email:
            raise ValueError("The Email field must be set")
            
        account_email = self.normalize_email(account_email)
        user = self.model(account_email=account_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, account_email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('account_role', 'a')  # Set agent role for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(account_email, password, **extra_fields)