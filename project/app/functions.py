import datetime, os
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from PIL import Image
from django.views.decorators.csrf import csrf_protect


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