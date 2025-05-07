const registerSection = document.getElementById("register-section");
const inviteSection = document.getElementById("invite-section");
const gameSection = document.getElementById("game-section");
const registerButton = document.getElementById("register-button");
const goToRegister = document.getElementById("go-to-register");
const loginSection = document.getElementById("login-section");
const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");

function showSection(section) {
    loginSection.classList.add("hidden");
    registerSection.classList.add("hidden");
    inviteSection.classList.add("hidden");
    gameSection.classList.add("hidden");
    section.classList.remove("hidden");
}

goToRegister.onclick = () => {
    showSection(registerSection);
}

const register = function(username, email) {
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('Registrazione completata! Controlla la tua email.');
            showSection(loginSection);
        } else {
            alert(data.message || 'Errore nella registrazione.');
        }
    })
    .catch(() => {
        alert('Errore di rete.');
    });
};

registerButton.onclick = () => {
    const username = registerUsername.value;
    const email = registerEmail.value;
    if (username && email) {
        register(username, email);
    } else {
        alert('Riempi tutti i campi.');
    }
};