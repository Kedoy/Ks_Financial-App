document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const inputBoxes = document.querySelectorAll('.input-box');
    const inputs = document.querySelectorAll('.input-box input');
    const wrapper = document.querySelector('.wrapper');
    const submitBtn = document.querySelector('.btn');
    const guestBtn = document.querySelector('.btn-guest');
    const registerLink = document.querySelector('.register-link');
    
    let currentStep = 0;
    
    function initializeForm() {
        wrapper.classList.add('step-0');
        setTimeout(() => {
            inputBoxes[0].classList.add('active');
            inputs[0].focus();
        }, 100);
        
        submitBtn.style.display = 'none';
    }
    
    function showNextField() {
        if (currentStep < inputBoxes.length - 1) {
            currentStep++;
            wrapper.classList.remove(`step-${currentStep - 1}`);
            wrapper.classList.add(`step-${currentStep}`);
            setTimeout(() => {
                inputBoxes[currentStep].classList.add('active');
                
                setTimeout(() => {
                    inputs[currentStep].focus();
                }, 200);
            }, 200);
        }
        
        if (currentStep === inputBoxes.length - 1) {
            setTimeout(() => {
                submitBtn.style.display = 'block';
                setTimeout(() => {
                    submitBtn.classList.add('active');
                }, 150);
            }, 400);
        }
    }

    function handleInput(e) {
        const currentInput = e.target;
        const currentIndex = Array.from(inputs).indexOf(currentInput);
        if (currentInput.value.trim() !== '' && currentIndex === currentStep && currentIndex < inputs.length - 1) {
            setTimeout(() => {
                showNextField();
            }, 600);
        }
    }
    
    function handleEnterKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentInput = e.target;
            const currentIndex = Array.from(inputs).indexOf(currentInput);
            
            if (currentInput.value.trim() !== '' && currentIndex === currentStep) {
                setTimeout(() => {
                    showNextField();
                }, 300);
            }
        }
    }
    
    inputs.forEach(input => {
        input.addEventListener('keypress', handleEnterKey);
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        
        if (!allFilled) {
            alert('Пожалуйста, заполните все поля!');
            return;
        }
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают!');
            document.getElementById('confirmPassword').style.borderColor = 'red';
            return;
        }
        
        alert('Регистрация успешна!');
    });
    
    initializeForm();
});