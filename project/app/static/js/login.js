const showPassword = document.getElementsByClassName("see-password-icon");
const loginForm = document.getElementById("login-form");
const errors = document.getElementById("errors");
const success = document.getElementById("success");

Array.from(showPassword).forEach((child) => {
    child.addEventListener('click', (event) => {
        // Get the clicked element
        const clickedChild = event.target;
        // Get the input of the clicked element
        const input = clickedChild.nextElementSibling;
        // Check clicked element status and replace
        if (clickedChild.classList.contains("fa-eye")) {
            clickedChild.classList.replace('fa-eye', 'fa-eye-slash');
            //Show password
            if (input) {
                input.setAttribute('type', 'text');
            }
        } else {
            clickedChild.classList.replace('fa-eye-slash', 'fa-eye');
            //Hide password
            if (input) {
                input.setAttribute('type', 'password');
            }
        }
    });
});
function displayErrors(errors, element) {
    element.innerHTML = "";
    element.style.display = errors.length ? "block" : "none";

    errors.forEach(error => {
        const li = document.createElement("li");
        li.textContent = error;
        element.appendChild(li);
    });
}
function getCSRFToken() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}
loginForm.addEventListener('submit', (event) => {
    event.preventDefault()
    handleSubmit()
})

async function handleSubmit(){
    errors.style.display = "none";
    success.style.display = "none";
    const formData = new FormData(loginForm);
    try {
        const response = await fetch("login", {
            method: "POST",
            headers: {
                'X-CSRFToken': getCSRFToken()
                // Remove Content-Type header - it will be set automatically with boundary
            },
            body: formData  // Send FormData instead of JSON
        });
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                success.innerText = "Compte connecté avec succés !"
                success.style.display = "block"
                setTimeout(() => {
                    window.location.href = "/";
                }, 2000);
            } else {
                displayErrors(["Invalid credentials, veuillez ressayer !"], errors);
            }
        }
    } catch (error) {
        displayErrors(["An error occurred. Please try again."], errors);
    }
}