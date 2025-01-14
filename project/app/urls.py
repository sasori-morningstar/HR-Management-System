from django.urls import path
from . import views

urlpatterns = [
    path("", views.afficher_index),
    path("login", views.afficher_login),
    path("register", views.afficher_register),
]