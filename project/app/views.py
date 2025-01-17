from django.shortcuts import render

def afficher_index(request):
    return render(request, "index.html")

def afficher_login(request):
    return render(request, "login.html")

def afficher_register(request):
    return render(request, "register.html")

def afficher_en_attente(request):
    return render(request, "en-attente.html")

# Create your views here.
