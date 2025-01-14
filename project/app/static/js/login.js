const showPassword = document.getElementsByClassName("see-password-icon");
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