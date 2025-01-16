// Constants and Element References
const DOM = {
    steps: document.getElementsByClassName("step"),
    pipes: document.getElementsByClassName("pipe"),
    buttons: {
        register: document.getElementById("register-btn"),
        continue: document.getElementById("continue-btn"),
        showExperience: document.getElementById("experience-btn"),
        addExperience: document.getElementById("ajouter-experience-btn"),
        closePopup: document.getElementsByClassName("close-popup")
    },
    errors: {
        main: document.getElementById("errors"),
        popup: document.getElementById("popup-errors")
    },
    experience: {
        popup: document.getElementById("experience-popup"),
        container: document.getElementsByClassName("experience-container")[0],
        noExperience: document.getElementById("no-experience"),
        justificationInput: document.getElementById("justifier-experience-input"),
        inputs: {
            position: document.getElementById("nom-poste-experience"),
            establishment: document.getElementById("nom-etablissement-experience"),
            startDate: document.getElementById("date-debut-experience"),
            endDate: document.getElementById("date-fin-experience")
        }
    }
};
// Step Configuration
const STEP_ELEMENTS = {
    0: [".email-container", ".password-container", ".confirm-password-container"],
    1: [".input-fullname-container", ".date-naissance-container", ".input-location-container1", ".input-location-container2", ".telephone-container"],
    2: [".type-compte-container", ".formation-container", ".competence-container", ".experience-container"],
    3: [".profile-pic-container"]
};
// Validation Rules
const VALIDATORS = {
    email: email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
    phone: number => /^(05|06|07)[0-9]{8}$/.test(number),
    password: password => password.length >= 8,
    accountType: type => ["Candidat", "Employé", "Manager", "Agent"].includes(type)
};
class RegistrationForm {
    constructor() {
        this.currentStep = 0;
        this.experiences = [];
        this.experienceJustified = false;
        this.experienceJustification = null;
        this.initializeForm();
    }

    initializeForm() {
        this.initializeStepVisibility();
        this.attachEventListeners();
        this.loadCities();
    }

    initializeStepVisibility() {
        DOM.steps[this.currentStep].classList.replace('not-passed-step', 'current-step');
        DOM.buttons.register.style.display = "none";
        
        Object.entries(STEP_ELEMENTS).forEach(([index, elements]) => {
            if (index != this.currentStep) {
                elements.forEach(element => {
                    document.querySelector(element).style.display = "none";
                });
            }
        });
    }

    attachEventListeners() {
        // Button listeners
        DOM.buttons.continue.addEventListener('click', () => this.handleContinue());
        DOM.buttons.showExperience.addEventListener('click', () => this.showExperiencePopup());
        DOM.buttons.addExperience.addEventListener('click', () => this.handleAddExperience());
        
        // Close popup buttons
        Array.from(DOM.buttons.closePopup).forEach(btn => {
            btn.addEventListener('click', e => {
                e.target.parentElement.parentElement.style.display = "none";
            });
        });

        // Profile picture preview
        document.getElementById('profile-pic-input').addEventListener('change', this.handleProfilePicUpdate);

        // Experience justification
        DOM.experience.justificationInput.addEventListener('change', this.handleExperienceJustification.bind(this));

        // Enter key handler
        document.addEventListener('keydown', e => {
            if (e.key === "Enter") {
                if(false){
                    //Handle popup here
                }else if(this.currentStep >= 0 && this.currentStep <= 2){
                    e.preventDefault();
                    this.handleContinue();
                }else if(this.currentStep == 3){
                    //Handle submit here
                }
            }
        });
    }

    // Experience Management Methods
    showExperiencePopup() {
        this.experienceJustified = false;
        DOM.experience.popup.style.display = "flex";
    }

    validateExperience() {
        const errors = [];
        const { position, establishment, startDate, endDate } = DOM.experience.inputs;

        if (!position.value || !establishment.value || !startDate.value || !endDate.value) {
            errors.push("Veuillez remplir tous les champs");
        }

        this.displayErrors(errors, DOM.errors.popup);
        return errors.length === 0;
    }

    createExperienceElement(experienceData) {
        const element = document.createElement("div");
        element.classList.add("experience");
        
        element.innerHTML = `
            <div class="experience-overview">
                <div>
                    <div>
                        <span class="nom-poste">${experienceData.nomPoste}</span> à 
                        <span class="nom-etablissement">${experienceData.nomEtablissement}</span>
                    </div>
                    <div>
                        <span class="date-debut">${experienceData.dateDebut}</span> - 
                        <span class="date-fin">${experienceData.dateFin}</span>
                    </div>
                </div>
                <i class="icon delete-experience fa-solid fa-trash"></i>
            </div>
            <div class="etat-experience-container">
                ${this.getJustificationHTML(experienceData.isJustified)}
            </div>
        `;
        // Add delete functionality
        const deleteBtn = element.querySelector('.delete-experience');
        deleteBtn.addEventListener('click', () => this.deleteExperience(element, experienceData));

        return element;
    }

    getJustificationHTML(isJustified) {
        return isJustified 
            ? '<span class="etat-experience justified">Justifiée</span>'
            : `
                <span class="etat-experience not-justified">Non justifiée</span>
                <label id="justifier-experience-existante${this.experiences.length}" class="justifier-experience-existante" for="justifier-experience-input${this.experiences.length}">
                    Charger une justification
                </label>
                <input id="justifier-experience-input${this.experiences.length}" class="justifier-experience-input" type="file" accept="image/*" name="justifier-experience-input${this.experiences.length}">
            `;
    }

    handleAddExperience() {
        if (!this.validateExperience()) return;

        const experienceData = {
            nomPoste: DOM.experience.inputs.position.value,
            nomEtablissement: DOM.experience.inputs.establishment.value,
            dateDebut: DOM.experience.inputs.startDate.value,
            dateFin: DOM.experience.inputs.endDate.value,
            isJustified: this.experienceJustified,
            justification: this.experienceJustification
        };

        this.experiences.push(experienceData);
        
        // Update UI
        DOM.errors.popup.style.display = "none";
        DOM.experience.popup.style.display = "none";
        DOM.experience.noExperience.style.display = "none";
        
        const experienceElement = this.createExperienceElement(experienceData);
        DOM.experience.container.appendChild(experienceElement);

        // Reset form
        this.resetExperienceForm();
    }

    deleteExperience(element, experienceData) {
        const index = this.experiences.indexOf(experienceData);
        if (index > -1) {
            this.experiences.splice(index, 1);
            element.remove();
            
            if (this.experiences.length === 0) {
                DOM.experience.noExperience.style.display = "block";
            }
        }
    }

    resetExperienceForm() {
        const { position, establishment, startDate, endDate } = DOM.experience.inputs;
        position.value = "";
        establishment.value = "";
        startDate.value = "";
        endDate.value = "";
        this.experienceJustified = false;
        this.experienceJustification = null;
    }

    handleProfilePicUpdate(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = e => {
                document.getElementById('profile-pic').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    handleExperienceJustification() {
        if (DOM.experience.justificationInput.files.length > 0) {
            this.experienceJustification = DOM.experience.justificationInput.files[0];
            this.experienceJustified = true;
        }
    }

    validateStep() {
        const errors = [];
        const getField = id => document.getElementById(id)?.value;

        switch (this.currentStep) {
            case 0:
                const email = getField("email");
                const password = getField("password");
                const confirmPassword = getField("confirm-password");

                if (!VALIDATORS.email(email)) errors.push("Email invalide");
                if (!VALIDATORS.password(password)) errors.push("Le mot de passe doit contenir au moins 8 caractères");
                if (password !== confirmPassword) errors.push("Les mots de passe ne correspondent pas");
                break;

            case 1:
                const phone = getField("telephone");
                const requiredFields = ["firstname", "lastname", "date-naissance", "pays", "ville", "commune", "rue"];
                
                if (requiredFields.some(field => !getField(field))) {
                    errors.push("Veuillez remplir tous les champs obligatoires");
                }
                if (!VALIDATORS.phone(phone)) errors.push("Numéro de téléphone invalide");
                break;

            case 2:
                const accountType = getField("type-compte");
                if (!VALIDATORS.accountType(accountType)) errors.push("Type de compte invalide");
                break;
        }

        this.displayErrors(errors, DOM.errors.main);
        return errors.length === 0;
    }

    displayErrors(errors, element) {
        element.innerHTML = "";
        element.style.display = errors.length ? "block" : "none";
        
        errors.forEach(error => {
            const li = document.createElement("li");
            li.textContent = error;
            element.appendChild(li);
        });
    }

    handleContinue() {
        if (this.currentStep >= 0 && this.currentStep <= 2 && this.validateStep()) {
            this.updateStepVisibility();
            this.updateNavigationState();
            this.currentStep++;
        }
    }

    updateStepVisibility() {
        // Hide current step elements
        STEP_ELEMENTS[this.currentStep].forEach(element => {
            document.querySelector(element).style.display = "none";
        });

        // Show next step elements
        STEP_ELEMENTS[this.currentStep + 1].forEach(element => {
            document.querySelector(element).style.display = "flex";
        });

        // Update visual indicators
        DOM.steps[this.currentStep].classList.replace('current-step', 'passed-step');
        DOM.pipes[this.currentStep].classList.replace('not-passed-pipe', 'passed-pipe');
        DOM.steps[this.currentStep + 1].classList.replace('not-passed-step', 'current-step');
    }

    updateNavigationState() {
        if (this.currentStep === 2) {
            DOM.buttons.continue.style.display = "none";
            DOM.buttons.register.style.display = "block";
        }
    }

    async loadCities() {
        try {
            const response = await fetch('static/js/algérie.json');
            const cities = await response.json();
            this.initializeCitySelect(cities);
        } catch (err) {
            console.error("Error loading cities:", err);
        }
    }

    initializeCitySelect(cities) {
        const citySelect = document.getElementById("ville");
        
        Object.keys(cities).forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });

        citySelect.addEventListener('change', () => {
            this.updateCommunes(cities[citySelect.value]);
        });
    }

    updateCommunes(communes) {
        const communeSelect = document.getElementById("commune");
        communeSelect.innerHTML = '<option value="" disabled selected>Choisir une commune</option>';
        
        communes.forEach(commune => {
            const option = document.createElement("option");
            option.value = commune;
            option.textContent = commune;
            communeSelect.appendChild(option);
        });
    }
}

// Initialize the form
const registrationForm = new RegistrationForm();