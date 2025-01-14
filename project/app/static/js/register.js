const steps = document.getElementsByClassName("step");
const pipes = document.getElementsByClassName("pipe");
const firstStepElements = [".email-container", ".password-container", ".confirm-password-container"];
const secondStepElements = [".input-fullname-container", ".date-naissance-container", ".input-location-container1", ".input-location-container2",".telephone-container"];
const thirdStepElements = [".type-compte-container" ,".formation-container", ".competence-container", ".experience-container"];
const fourthStepElements = [".profile-pic-container"];
//First step initialitation
const registerBtn = document.getElementById("register-btn");

registerBtn.style.display="none";
for(let element of secondStepElements){
    document.querySelector(element).style.display = "none";
}
for(let element of thirdStepElements){
    document.querySelector(element).style.display = "none";
}
for(let element of fourthStepElements){
    document.querySelector(element).style.display = "none";
}

let step = 0;
steps[0].classList.replace('not-passed-step', 'current-step');

//Handle continue button
const continueBtn = document.getElementById("continue-btn");
continueBtn.addEventListener("click", function(){
    if(step == 0){
        if(validateFirstStep()){
            for(let element of firstStepElements){
                document.querySelector(element).style.display = "none";
            }
            for(let element of secondStepElements){
                document.querySelector(element).style.display = "flex";
            }
            steps[step].classList.replace('current-step', 'passed-step');
            pipes[step].classList.replace('not-passed-pipe', 'passed-pipe');
            steps[step+1].classList.replace('not-passed-step', 'current-step');
            step++;
        }
    }else if(step==1){
        if(validateSecondStep()){
            for(let element of secondStepElements){
                document.querySelector(element).style.display = "none";
            }
            for(let element of thirdStepElements){
                document.querySelector(element).style.display = "flex";
            }
            steps[step].classList.replace('current-step', 'passed-step');
            pipes[step].classList.replace('not-passed-pipe', 'passed-pipe');
            steps[step+1].classList.replace('not-passed-step', 'current-step');
            step++;
        }
    }else if(step==2){
        if(validateThirdStep()){
            for(let element of thirdStepElements){
                document.querySelector(element).style.display = "none";
            }
            for(let element of fourthStepElements){
                document.querySelector(element).style.display = "flex";
            }
            steps[step].classList.replace('current-step', 'passed-step');
            pipes[step].classList.replace('not-passed-pipe', 'passed-pipe');
            steps[step+1].classList.replace('not-passed-step', 'current-step');
            step++;
            continueBtn.style.display="none";
            registerBtn.style.display="block";
        }
    }
});

const validateFirstStep = () => {return true};
const validateSecondStep = () => {return true};
const validateThirdStep = () => {return true};

