import re, datetime
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import login, logout, authenticate
from django.views.decorators.csrf import csrf_protect
from django.db import transaction


from .models import Account, User, Experience, Formation, Competence, Fonctionnalite, Favori
from .functions import validate_email_address, validate_image, validate_experiences, validate_formations, validate_competences

def afficher_index(request):
    if request.user.is_authenticated:
        if request.user.account_status:
            if request.user.account_role == "a":
                if request.method == "POST":
                    try:
                        # Get and clean the title
                        data = {
                            "fonctionnalite_titre": request.POST.get("fonctionnalite_titre", "").strip(),
                            "action": request.POST.get("action", "").strip()
                        }
                        print(data)
                        # Check if title is empty
                        if not data["fonctionnalite_titre"]:
                            return JsonResponse({"success": False, "errors": ["Fonctionnalité titre is required."]}, status=200)
        
                        # Try to get the Fonctionnalite object
                        try:
                            fonctionnalite = Fonctionnalite.objects.get(fonctionnalite_titre=data["fonctionnalite_titre"])
                        except Fonctionnalite.DoesNotExist:
                            return JsonResponse({"success": False, "errors": ["Fonctionnalité not found."]}, status=200)
            
                        if data["action"] == "add":
                            # Check if favorite already exists
                            if Favori.objects.filter(fonctionnalite=fonctionnalite, account=request.user).exists():
                                return JsonResponse({"success": False, "errors": ["Favorite already exists."]}, status=200)
                            # Create the favorite
                            favori = Favori.objects.create(fonctionnalite=fonctionnalite,account=request.user)
                        else:
                            # Check if favorite exists
                            if not Favori.objects.filter(fonctionnalite=fonctionnalite, account=request.user).exists():
                                return JsonResponse({"success": False, "errors": ["Favorite does not exist."]}, status=200)
                            # Delete the favorite
                            Favori.objects.filter(fonctionnalite=fonctionnalite, account=request.user).delete()
        
                        return JsonResponse({"success": True})
        
                    except Exception as e:
                        return JsonResponse({"success": False, "errors": [str(e)]}, status=200)
                    
                return render(request, "admin-index.html", {"fonctionnalites": Fonctionnalite.objects.all(), "favoris": Favori.objects.filter(account=request.user), "favoris_titles": Favori.objects.filter(account=request.user).values_list('fonctionnalite__fonctionnalite_titre', flat=True)})
        else:
            return render(request, "en-attente.html")
    else:
        return render(request, "visitor-index.html")
    
def afficher_comptes(request):
    if request.user.is_authenticated:
        if request.user.account_status:
            if request.user.account_role == "a":
                return render(request, "comptes.html", {"comptes": Account.objects.all(), "fonctionnalites": Fonctionnalite.objects.all(), "favoris": Favori.objects.filter(account=request.user), "favoris_titles": Favori.objects.filter(account=request.user).values_list('fonctionnalite__fonctionnalite_titre', flat=True)})
        else:
            return render(request, "en-attente.html")
    else:
        return render(request, "login.html")

def afficher_login(request):
    if request.user.is_authenticated:
        if not request.user.account_status:
            return redirect('/en-attente')
        else:
            return redirect('/')

    if request.method == 'POST':
        data = {
            "email": request.POST.get("email", "").strip().lower(),
            "password": request.POST.get("password")
        }
        
        # Use Django's authenticate function instead of manual password checking
        user = authenticate(request, 
            username=data["email"],  # Django will use this with USERNAME_FIELD
            password=data["password"]
        )
        
        if user is None:
            return JsonResponse({"success": False}, status=200)
            
        login(request, user)
        return JsonResponse({"success": True})
        
    return render(request, "login.html")

@csrf_protect
def afficher_register(request):
    if request.user.is_authenticated:
        if not request.user.account_status:
            return redirect('/en-attente')
        else:
            return redirect('/')
    if (request.method=="POST"):
        # Get the current date
        today = datetime.date.today()
        # Step 1: Retrieve data from the request
        data = {
            "email": request.POST.get("email", "").strip().lower(),
            "password": request.POST.get("password", ""),
            "confirmPassword": request.POST.get("confirmPassword", ""),
            "firstname": request.POST.get("firstname", ""),
            "lastname": request.POST.get("lastname", ""),
            "dateNaissance": request.POST.get("dateNaissance", ""),
            "pays": request.POST.get("pays", ""),
            "ville": request.POST.get("ville", ""),
            "commune": request.POST.get("commune", ""),
            "rue": request.POST.get("rue", ""),
            "telephone": request.POST.get("telephone", ""),
            "typeCompte": request.POST.get("typeCompte", "")
        }
        # Check if user already exists with the given email
        if Account.objects.filter(account_email=data["email"]).exists():
            return JsonResponse({"success": False, "errors": ["Email is already in use."]}, status=200)
        # Check if user already exists with the given phone number
        if User.objects.filter(user_phone=data["telephone"]).exists():
            return JsonResponse({"success": False, "errors": ["Phone is already in use."]}, status=200)

        # Handle profile picture
        profile_pic = request.FILES.get("profilePic")
        if profile_pic:
            data["profilePic"] = profile_pic

        # Create username
        data["username"] = data["firstname"].lower() + "." + data["lastname"].lower()
        #Handle experiences
        experiences = []
        i = 0
        while request.POST.get(f'experiences[{i}][nomPoste]'):
            exp = {
                "nomPoste": request.POST.get(f'experiences[{i}][nomPoste]'),
                "nomEtablissement": request.POST.get(f'experiences[{i}][nomEtablissement]'),
                "dateDebut": request.POST.get(f'experiences[{i}][dateDebut]'),
                "dateFin": request.POST.get(f'experiences[{i}][dateFin]'),
                "isJustified": request.POST.get(f'experiences[{i}][isJustified]') == "true"
            }
            if f'experiences[{i}][justification]' in request.FILES:
                exp["justification"] = request.FILES[f"experiences[{i}][justification]"]
            experiences.append(exp)
            i += 1
        #Handle formations
        formations = []
        i = 0
        while request.POST.get(f'formations[{i}][nomFormation]'):
            formation = {
                "nomFormation": request.POST.get(f'formations[{i}][nomFormation]'),
                "nomEtablissement": request.POST.get(f'formations[{i}][nomEtablissement]'),
                "dateDebut": request.POST.get(f'formations[{i}][dateDebut]'),
                "dateFin": request.POST.get(f'formations[{i}][dateFin]'),
                "isJustified": request.POST.get(f'formations[{i}][isJustified]') == "true"
            }
            if f'formations[{i}][justification]' in request.FILES:
                formation["justification"] = request.FILES[f"formations[{i}][justification]"]
            formations.append(formation)
            i += 1
        #Handle competences
        competences = []
        i = 0
        while request.POST.get(f'competences[{i}][nomCompetence]'):
            competence = {
                "nomCompetence": request.POST.get(f'competences[{i}][nomCompetence]'),
                "isJustified": request.POST.get(f'competences[{i}][isJustified]') == "true"
            }
            if f'competences[{i}][justification]' in request.FILES:
                competence["justification"] = request.FILES[f"competences[{i}][justification]"]
            competences.append(competence)
            i += 1
        # Step 2: Validate data
        errors = []
        if not data["email"] or not data["password"] or not data["confirmPassword"]:
            errors.append("Email, password, and confirmation are required.")
        if len(data["email"]) > 255:
            errors.append("Email is too long.")
        if not validate_email_address(data["email"]):
            errors.append("Email is invalid.")
        if len(data["password"]) < 8 or len(data["password"]) > 255 or len(data["confirmPassword"]) < 8 or len(data["confirmPassword"]) > 255:
            errors.append("Password must be between 8 and 255 characters.")
        if data["password"] != data["confirmPassword"]:
            errors.append("Passwords do not match.")
        
        if len(data["firstname"]) < 2 or len(data["firstname"]) > 50 or len(data["lastname"]) < 2 or len(data["lastname"]) > 50:
            errors.append("Firstname and lastname must be between 2 and 50 character.")
        try:
            date_naissance = datetime.datetime.strptime(data["dateNaissance"], "%Y-%m-%d").date()
            if date_naissance < datetime.date(1900, 1, 1) or date_naissance >= today:
                errors.append("Date de naissance must be between 1900-01-01 and today.")
        except ValueError:
            errors.append("Invalid date format for date de naissance.")
        if len(data["pays"]) < 2 or len(data["pays"]) > 50 or len(data["ville"]) < 2 or len(data["ville"]) > 50 or len(data["commune"]) < 2 or len(data["commune"]) > 50 or len(data["rue"]) < 2 or len(data["rue"]) > 255:
            errors.append("Pays, ville, commune, and rue must be between 2 and 50 characters.")
        if not re.match(r"^(05|06|07)\d{8}$", data["telephone"]):
            errors.append("Telephone must be a valid phone number.")
        if data["typeCompte"] not in ["Candidat", "Employé", "Manager", "Agent"]:
            errors.append("Type de compte is invalid.")
        if profile_pic and not validate_image(profile_pic):
            errors.append("Profile picture is invalid.")
        if not validate_experiences(experiences):
            errors.append("Experiences are invalid.")
        if not validate_formations(formations):
            errors.append("Formations are invalid.")
        if not validate_competences(competences):
            errors.append("Competences are invalid.")
        
        if errors:
            return JsonResponse({"success": False, "errors": errors}, status=200)
        
        # Step 3: Create the user
        # Create the account
        try:
            with transaction.atomic():
                # Create the account using the custom user model
                status = data["typeCompte"] == "Candidat"
                account = Account.objects.create_user(
                    account_email=data["email"],
                    password=data["password"],  # Don't use make_password here
                    account_role=data["typeCompte"][0].lower(),
                    account_status=status,
                    first_name=data["firstname"],  # These fields come from AbstractUser
                    last_name=data["lastname"],
                )

                # Create the user profile
                user = User(
                    user_first_name=data["firstname"],
                    user_last_name=data["lastname"],
                    user_birth_date=date_naissance,
                    user_country=data["pays"],
                    user_city=data["ville"],
                    user_commune=data["commune"],
                    user_street=data["rue"],
                    user_phone=data["telephone"],
                    account=account
                )
                if profile_pic:
                    user.user_profile_pic = profile_pic
                user.save()
                # Create experiences
                for experience in experiences:
                    exp = Experience(
                        experience_company=experience["nomEtablissement"],
                        experience_position=experience["nomPoste"],
                        experience_start_date=datetime.datetime.strptime(experience["dateDebut"], "%Y-%m-%d").date(),
                        experience_end_date=datetime.datetime.strptime(experience["dateFin"], "%Y-%m-%d").date(),
                        experience_is_justified=experience["isJustified"],
                        user=user
                    )
                    if experience["isJustified"]:
                        exp.experience_justification = experience["justification"]
            
                    exp.save()
                # Create formations
                for formation in formations:
                    formt = Formation(
                        formation_institution=formation["nomEtablissement"],
                        formation_nom=formation["nomFormation"],
                        formation_start_date=datetime.datetime.strptime(formation["dateDebut"], "%Y-%m-%d").date(),
                        formation_end_date=datetime.datetime.strptime(formation["dateFin"], "%Y-%m-%d").date(),
                        formation_is_justified=formation["isJustified"],
                        user=user
                    )
                    if formation["isJustified"]:
                        formt.formation_justification = formation["justification"]
            
                    formt.save()
                # Create competences
                for competence in competences:
                    comp = Competence(
                        competence_name=competence["nomCompetence"],
                        competence_is_justified=competence["isJustified"],
                        user=user
                    )
                    if competence["isJustified"]:
                        comp.competence_justification = competence["justification"]
                    comp.save()
                # Step 4: Return a success response
                return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "errors": [str(e)]}, status=200)
    else:
        return render(request, "register.html")
    
    
def afficher_en_attente(request):
    if not request.user.is_authenticated:
        return redirect('/login')
    else:
        if request.user.account_status:
            return redirect('/')
    return render(request, "en-attente.html")

def logout_user(request):
    if request.user.is_authenticated:
        logout(request)
    return redirect('/')

# Create your views here.
