from django.shortcuts import render

def afficher_index(request):
    return render(request, "index.html")

# Create your views here.
