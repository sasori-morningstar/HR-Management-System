from django.urls import path
from . import views

urlpatterns = [
    path("", views.afficher_index),
    path("login", views.afficher_login),
    path("comptes", views.afficher_comptes),
    path("register", views.afficher_register),
    path("en-attente", views.afficher_en_attente),
    path("logout", views.logout_user)
]