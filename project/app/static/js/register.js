// Constants and Element References
const DOM = {
    steps: document.getElementsByClassName("step"),
    pipes: document.getElementsByClassName("pipe"),
    buttons: {
        register: document.getElementById("register-btn"),
        continue: document.getElementById("continue-btn"),
        showExperience: document.getElementById("experience-btn"),
        addExperience: document.getElementById("ajouter-experience-btn"),
        showFormation: document.getElementById("formation-btn"),
        addFormation: document.getElementById("ajouter-formation-btn"),
        showCompetence: document.getElementById("competence-btn"),
        addCompetence: document.getElementById("ajouter-competence-btn"),
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
    },
    formation: {
        popup: document.getElementById("formation-popup"),
        container: document.getElementsByClassName("formation-container")[0],
        noFormation: document.getElementById("no-formation"),
        justificationInput: document.getElementById("justifier-formation-input"),
        inputs: {
            nomFormation: document.getElementById("nom-formation"),
            establishment: document.getElementById("nom-etablissement-formation"),
            startDate: document.getElementById("date-debut-formation"),
            endDate: document.getElementById("date-fin-formation")
        }
    },
    competence: {
        popup: document.getElementById("competence-popup"),
        container: document.getElementsByClassName("competence-container")[0],
        noCompetence: document.getElementById("no-competence"),
        justificationInput: document.getElementById("justifier-competence-input"),
        inputs: {
            nomCompetence: document.getElementById("nom-competence"),
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
    accountType: type => ["Candidat", "Employé", "Manager", "Agent"].includes(type),
    date: date => {
        const parsedDate = new Date(date); // Convertir la date en objet Date
        const currentDate = new Date(); // Date actuelle
        return (
            parsedDate.getFullYear() > 1900 && // Année > 1900
            parsedDate <= currentDate // Date <= date actuelle
        );
    },
    startEndDate: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= end;
    }
};
class RegistrationForm {
    constructor() {
        this.currentStep = 0;
        this.experiences = [];
        this.formations = [];
        this.competences = [];
        this.experienceJustified = false;
        this.experienceJustification = null;
        this.formationJustified = false;
        this.formationJustification = null;
        this.competenceJustified = false;
        this.competenceJustification = null;
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
        DOM.buttons.showFormation.addEventListener('click', () => this.showFormationPopup());
        DOM.buttons.addFormation.addEventListener('click', () => this.handleAddFormation());
        DOM.buttons.showCompetence.addEventListener('click', () => this.showCompetencePopup());
        DOM.buttons.addCompetence.addEventListener('click', () => this.handleAddCompetence());

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
        // Formation justification
        DOM.formation.justificationInput.addEventListener('change', this.handleFormationJustification.bind(this));
        // Competence justification
        DOM.competence.justificationInput.addEventListener('change', this.handleCompetenceJustification.bind(this));


        // Enter key handler
        document.addEventListener('keydown', e => {
            if (e.key === "Enter") {
                if (DOM.experience.popup.style.display == "flex") {
                    //Handle experience popup here
                    e.preventDefault();
                    this.handleAddExperience();
                } else if (DOM.formation.popup.style.display == "flex") {
                    e.preventDefault();
                    this.handleAddExperience();
                } else if (DOM.competence.popup.style.display == "flex") {
                    e.preventDefault();
                    this.handleAddExperience();
                } else if (this.currentStep >= 0 && this.currentStep <= 2) {
                    e.preventDefault();
                    this.handleContinue();
                } else if (this.currentStep == 3) {
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
        if (!VALIDATORS.date(startDate.value) || !VALIDATORS.date(endDate.value) || !VALIDATORS.startEndDate(startDate.value, endDate.value)) {
            errors.push("Dates invalides");
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
        //Justifier experience existante
        const justifierExperienceExistante = element.querySelector('.justifier-experience-input');
        if (justifierExperienceExistante) {  // Check if element exists
            justifierExperienceExistante.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    // Get the file from the input
                    const file = event.target.files[0];

                    // Find the index of this experience in the experiences array
                    const experienceIndex = this.experiences.findIndex(exp =>
                        exp.nomPoste === experienceData.nomPoste &&
                        exp.dateDebut === experienceData.dateDebut
                    );
                    console.log(experienceIndex)

                    if (experienceIndex !== -1) {
                        // Update the experience data
                        this.experiences[experienceIndex].justification = file;
                        this.experiences[experienceIndex].isJustified = true;

                        // Update the UI
                        const etatExperience = element.querySelector('.etat-experience-container');
                        if (etatExperience) {
                            etatExperience.innerHTML = this.getJustificationHTML(true);
                        }
                    }
                }
            });
        }
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
                <input id="justifier-experience-input${this.experiences.length}" class="justifier-experience-input" type="file" accept=".pdf,.jpg,.jpeg,.png" name="justifier-experience-input${this.experiences.length}">
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
        console.log(this.experiences);

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

    handleExperienceJustification() {
        if (DOM.experience.justificationInput.files.length > 0) {
            this.experienceJustification = DOM.experience.justificationInput.files[0];
            this.experienceJustified = true;
        }
    }

    // Formation Management Methods
    showFormationPopup() {
        this.formationJustified = false;
        DOM.formation.popup.style.display = "flex";
    }

    validateFormation() {
        const errors = [];
        const { nomFormation, establishment, startDate, endDate } = DOM.formation.inputs;

        if (!nomFormation.value || !establishment.value || !startDate.value || !endDate.value) {
            errors.push("Veuillez remplir tous les champs");
        }
        if (!VALIDATORS.date(startDate.value) || !VALIDATORS.startEndDate(startDate.value, endDate.value)) {
            errors.push("Dates invalides");
        }

        this.displayErrors(errors, DOM.errors.popup);
        return errors.length === 0;
    }

    createFormationElement(formationData) {
        const element = document.createElement("div");
        element.classList.add("formation");

        element.innerHTML = `
            <div class="formation-overview">
                <div>
                    <div>
                        <span class="nom-formation">${formationData.nomFormation}</span> à 
                        <span class="nom-etablissement">${formationData.nomEtablissement}</span>
                    </div>
                    <div>
                        <span class="date-debut">${formationData.dateDebut}</span> - 
                        <span class="date-fin">${formationData.dateFin}</span>
                    </div>
                </div>
                <i class="icon delete-formation fa-solid fa-trash"></i>
            </div>
            <div class="etat-formation-container">
                ${this.getFormationJustificationHTML(formationData.isJustified)}
            </div>
        `;
        //Justifier formation existante
        const justifierFormationExistante = element.querySelector('.justifier-formation-input');
        if (justifierFormationExistante) {  // Check if element exists
            justifierFormationExistante.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    // Get the file from the input
                    const file = event.target.files[0];

                    // Find the index of this formation in the formations array
                    const formationIndex = this.formations.findIndex(form =>
                        form.nomFormation === formationData.nomFormation &&
                        form.dateDebut === formationData.dateDebut
                    );
                    console.log(formationIndex)

                    if (formationIndex !== -1) {
                        // Update the formation data
                        this.formations[formationIndex].justification = file;
                        this.formations[formationIndex].isJustified = true;

                        // Update the UI
                        const etatFormation = element.querySelector('.etat-formation-container');
                        if (etatFormation) {
                            etatFormation.innerHTML = this.getFormationJustificationHTML(true);
                        }
                    }
                }
            });
        }
        // Add delete functionality
        const deleteBtn = element.querySelector('.delete-formation');
        deleteBtn.addEventListener('click', () => this.deleteFormation(element, formationData));

        return element;
    }

    getFormationJustificationHTML(isJustified) {
        return isJustified
            ? '<span class="etat-formation justified">Justifiée</span>'
            : `
                <span class="etat-formation not-justified">Non justifiée</span>
                <label id="justifier-formation-existante${this.formations.length}" class="justifier-formation-existante" for="justifier-formation-input${this.formations.length}">
                    Charger une justification
                </label>
                <input id="justifier-formation-input${this.formations.length}" class="justifier-formation-input" type="file" accept=".pdf,.jpg,.jpeg,.png" name="justifier-formation-input${this.formations.length}">
            `;
    }

    handleAddFormation() {
        if (!this.validateFormation()) return;

        const formationData = {
            nomFormation: DOM.formation.inputs.nomFormation.value,
            nomEtablissement: DOM.formation.inputs.establishment.value,
            dateDebut: DOM.formation.inputs.startDate.value,
            dateFin: DOM.formation.inputs.endDate.value,
            isJustified: this.formationJustified,
            justification: this.formationJustification
        };

        this.formations.push(formationData);

        // Update UI
        DOM.errors.popup.style.display = "none";
        DOM.formation.popup.style.display = "none";
        DOM.formation.noFormation.style.display = "none";

        const formationElement = this.createFormationElement(formationData);
        DOM.formation.container.appendChild(formationElement);
        console.log(this.formations);

        // Reset form
        this.resetFormationForm();
    }

    deleteFormation(element, formationData) {
        const index = this.formations.indexOf(formationData);
        if (index > -1) {
            this.formations.splice(index, 1);
            element.remove();

            if (this.formations.length === 0) {
                DOM.formation.noFormation.style.display = "block";
            }
        }
    }

    resetFormationForm() {
        const { nomPoste, establishment, startDate, endDate } = DOM.formation.inputs;
        nomPoste.value = "";
        establishment.value = "";
        startDate.value = "";
        endDate.value = "";
        this.experienceJustified = false;
        this.experienceJustification = null;
    }

    handleFormationJustification() {
        if (DOM.formation.justificationInput.files.length > 0) {
            this.formationJustification = DOM.formation.justificationInput.files[0];
            this.formationJustified = true;
        }
    }

    // Competence Management Methods
    showCompetencePopup() {
        this.competenceJustified = false;
        DOM.competence.popup.style.display = "flex";
    }

    validateCompetence() {
        const errors = [];
        const { nomCompetence } = DOM.competence.inputs;

        if (!nomCompetence.value) {
            errors.push("Veuillez remplir tous les champs");
        }

        this.displayErrors(errors, DOM.errors.popup);
        return errors.length === 0;
    }

    createCompetenceElement(competenceData) {
        const element = document.createElement("div");
        element.classList.add("competence");

        element.innerHTML = `
            <div class="competence-overview">
                <div>
                    <div>
                        <span class="nom-competence">${competenceData.nomCompetence}</span> 
                    </div>
                </div>
                <i class="icon delete-competence fa-solid fa-trash"></i>
            </div>
            <div class="etat-competence-container">
                ${this.getCompetenceJustificationHTML(competenceData.isJustified)}
            </div>
        `;
        //Justifier competence existante
        const justifierCompetenceExistante = element.querySelector('.justifier-competence-input');
        if (justifierCompetenceExistante) {  // Check if element exists
            justifierCompetenceExistante.addEventListener('change', (event) => {
                if (event.target.files.length > 0) {
                    // Get the file from the input
                    const file = event.target.files[0];

                    // Find the index of this competence in the competences array
                    const competenceIndex = this.competences.findIndex(form =>
                        form.nomCompetence === competenceData.nomCompetence
                    );
                    console.log(competenceIndex)

                    if (competenceIndex !== -1) {
                        // Update the formation data
                        this.competences[competenceIndex].justification = file;
                        this.competences[competenceIndex].isJustified = true;

                        // Update the UI
                        const etatCompetence = element.querySelector('.etat-competence-container');
                        if (etatCompetence) {
                            etatCompetence.innerHTML = this.getCompetenceJustificationHTML(true);
                        }
                    }
                }
            });
        }
        // Add delete functionality
        const deleteBtn = element.querySelector('.delete-competence');
        deleteBtn.addEventListener('click', () => this.deleteCompetence(element, competenceData));

        return element;
    }

    getCompetenceJustificationHTML(isJustified) {
        return isJustified
            ? '<span class="etat-competence justified">Justifiée</span>'
            : `
                <span class="etat-competence not-justified">Non justifiée</span>
                <label id="justifier-competence-existante${this.competences.length}" class="justifier-competence-existante" for="justifier-competence-input${this.competences.length}">
                    Charger une justification
                </label>
                <input id="justifier-competence-input${this.competences.length}" class="justifier-competence-input" type="file" accept=".pdf,.jpg,.jpeg,.png" name="justifier-competence-input${this.competences.length}">
            `;
    }

    handleAddCompetence() {
        if (!this.validateCompetence()) return;

        const competenceData = {
            nomCompetence: DOM.competence.inputs.nomCompetence.value,
            isJustified: this.competenceJustified,
            justification: this.competenceJustification
        };

        this.competences.push(competenceData);

        // Update UI
        DOM.errors.popup.style.display = "none";
        DOM.competence.popup.style.display = "none";
        DOM.competence.noCompetence.style.display = "none";

        const competenceElement = this.createCompetenceElement(competenceData);
        DOM.competence.container.appendChild(competenceElement);
        console.log(this.competences);

        // Reset form
        this.resetCompetenceForm();
    }

    deleteCompetence(element, competenceData) {
        const index = this.competences.indexOf(competenceData);
        if (index > -1) {
            this.competences.splice(index, 1);
            element.remove();

            if (this.competences.length === 0) {
                DOM.competence.noCompetence.style.display = "block";
            }
        }
    }

    resetCompetenceForm() {
        const { nomCompetence } = DOM.competence.inputs;
        nomCompetence.value = "";
        this.competenceJustified = false;
        this.competenceJustification = null;
    }

    handleCompetenceJustification() {
        if (DOM.competence.justificationInput.files.length > 0) {
            this.competenceJustification = DOM.competence.justificationInput.files[0];
            this.competenceJustified = true;
        }
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
                const dateNaissance = getField("date-naissance")
                const requiredFields = ["firstname", "lastname", "pays", "ville", "commune", "rue"];

                if (requiredFields.some(field => !getField(field))) {
                    errors.push("Veuillez remplir tous les champs obligatoires");
                }
                if (!VALIDATORS.date(dateNaissance)) errors.push("Date de naissance invalide");
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
window.addEventListener('load', function () {
    const registrationForm = new RegistrationForm();
});