from django.shortcuts import render

def afficher_index(request):
    return render(request, "index.html")

def afficher_login(request):
    return render(request, "login.html")

# Create your views here.
