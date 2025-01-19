import json, re, datetime, os
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.validators import EmailValidator, FileExtensionValidator
from django.core.exceptions import ValidationError
from PIL import Image
from django.views.decorators.csrf import csrf_protect

def afficher_index(request):
    return render(request, "index.html")

def afficher_login(request):
    return render(request, "login.html")

@csrf_protect
def afficher_register(request):
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
        #Handle profile picture
        profile_pic = request.FILES.get("profilePic")
        if profile_pic:
            data["profilePic"] = profile_pic
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
            return JsonResponse({"errors": errors}, status=400)
        
        # Step 3: Create the user
        return JsonResponse({"success": True})
    else:
        return render(request, "register.html")
    
        
def validate_email_address(email):
    email_validator = EmailValidator()
    try:
        email_validator(email)  # Raises ValidationError if invalid
        return True
    except ValidationError as e:
        return False
    
def validate_image(image_file):
    """
    Validates that the uploaded file is a valid image and meets size requirements.
    """
    try:
        # Check file size (max 5MB)
        if image_file.size > 5 * 1024 * 1024:
            return False
            
        # Check if it's a valid image file
        img = Image.open(image_file)
        img.verify()
        
        # Check allowed formats
        allowed_formats = {'JPEG', 'PNG', 'JPG'}
        if img.format not in allowed_formats:
            return False
            
        # Check dimensions (max 2000x2000)
        if max(img.size) > 2000:
            return False
            
        return True
    except Exception:
        return False

def validate_experiences(experiences):
    """
    Validates the list of experiences provided during registration.
    """
    today = datetime.date.today()
    
    for exp in experiences:
        print(exp)
        try:
            # Check required fields
            if not exp.get("nomPoste") or not exp.get("nomEtablissement") or \
               not exp.get("dateDebut") or not exp.get("dateFin"):
                return False
            
            # Validate field lengths
            if len(exp["nomPoste"]) < 2 or len(exp["nomPoste"]) > 100 or \
               len(exp["nomEtablissement"]) < 2 or len(exp["nomEtablissement"]) > 100:
                return False
            
            # Parse and validate dates
            date_debut = datetime.datetime.strptime(exp["dateDebut"], "%Y-%m-%d").date()
            date_fin = datetime.datetime.strptime(exp["dateFin"], "%Y-%m-%d").date()
            
            # Check date ranges
            if date_debut < datetime.date(1900, 1, 1) or date_debut > today or \
               date_fin < datetime.date(1900, 1, 1) or date_fin > today or \
               date_debut > date_fin:
                return False
            
            # Validate justification file if marked as justified
            if exp.get("isJustified"):
                if not exp.get("justification"):
                    return False
                if exp["justification"].size > 10 * 1024 * 1024:  # 10MB max
                    return False
                # Check file extension
                allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
                ext = os.path.splitext(exp["justification"].name)[1].lower()
                if ext not in allowed_extensions:
                    return False
                    
        except (ValueError, AttributeError, KeyError):
            return False
            
    return True

def validate_formations(formations):
    """
    Validates the list of formations (education) provided during registration.
    """
    today = datetime.date.today()
    
    for formation in formations:
        try:
            # Check required fields
            if not formation.get("nomFormation") or not formation.get("nomEtablissement") or \
               not formation.get("dateDebut") or not formation.get("dateFin"):
                return False
            
            # Validate field lengths
            if len(formation["nomFormation"]) < 2 or len(formation["nomFormation"]) > 100 or \
               len(formation["nomEtablissement"]) < 2 or len(formation["nomEtablissement"]) > 100:
                return False
            
            # Parse and validate dates
            date_debut = datetime.datetime.strptime(formation["dateDebut"], "%Y-%m-%d").date()
            date_fin = datetime.datetime.strptime(formation["dateFin"], "%Y-%m-%d").date()
            
            # Check date ranges
            if date_debut < datetime.date(1900, 1, 1) or date_debut > today or \
               date_fin < datetime.date(1900, 1, 1) or date_fin > today or \
               date_debut > date_fin:
                return False
            
            # Validate justification file if marked as justified
            if formation.get("isJustified"):
                if not formation.get("justification"):
                    return False
                if formation["justification"].size > 10 * 1024 * 1024:  # 10MB max
                    return False
                # Check file extension
                allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
                ext = os.path.splitext(formation["justification"].name)[1].lower()
                if ext not in allowed_extensions:
                    return False
                    
        except (ValueError, AttributeError, KeyError):
            return False
            
    return True

def validate_competences(competences):
    """
    Validates the list of competences (skills) provided during registration.
    """
    for competence in competences:
        try:
            # Check required fields
            if not competence.get("nomCompetence"):
                return False
            
            # Validate field length
            if len(competence["nomCompetence"]) < 2 or len(competence["nomCompetence"]) > 50:
                return False
            
            # Validate justification file if marked as justified
            if competence.get("isJustified"):
                if not competence.get("justification"):
                    return False
                if competence["justification"].size > 10 * 1024 * 1024:  # 10MB max
                    return False
                # Check file extension
                allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png'}
                ext = os.path.splitext(competence["justification"].name)[1].lower()
                if ext not in allowed_extensions:
                    return False
                    
        except (ValueError, AttributeError, KeyError):
            return False
            
    return True
    
def afficher_en_attente(request):
    return render(request, "en-attente.html")

# Create your views here.
