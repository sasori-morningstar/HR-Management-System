from django.shortcuts import render

def afficher_index(request):
    return render(request, "index.html")

def afficher_login(request):
    return render(request, "login.html")

def afficher_register(request):
    return render(request, "register.html")

# Create your views here.
