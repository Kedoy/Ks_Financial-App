const passwordEl = document.querySelector("#password-input");
const passwordToggle = document.querySelector("#password-toggle");

passwordToggle.addEventListener("click", () => {
    if (passwordEl.type === "password") {
        passwordEl.type = "text";
        passwordToggle.classList.remove("bxs-hide");
        passwordToggle.classList.add("bxs-show");
    } else {
        passwordEl.type = "password";
        passwordToggle.classList.remove("bxs-show");
        passwordToggle.classList.add("bxs-hide");
    }
    
    passwordToggle.style.transform = "translateY(-50%) scale(1.2)";
    setTimeout(() => {
        passwordToggle.style.transform = "translateY(-50%) scale(1)";
    }, 200);
});