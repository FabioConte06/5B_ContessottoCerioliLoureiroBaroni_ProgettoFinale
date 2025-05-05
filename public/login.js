const loginButton = document.getElementById("login-button");
const registerButton = document.getElementById("register-button");
const showRegisterButton = document.getElementById("show-register");
const showLoginButton = document.getElementById("show-login");
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const gameSection = document.getElementById("game-section");

const login = async (username, password) => {
  const response = await fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const result = await response.json();
  if (result.success) {
    alert("Login successful!");
    loginSection.style.display = "none";
    registerSection.style.display = "none";
    gameSection.style.display = "block";
  } else {
    alert("Login failed. Check your credentials.");
  }
};

const register = async (username, email, password) => {
  const response = await fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });
  const result = await response.json();
  if (result.success ) {
    alert("Registration successful! Check your email for the password.");
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  } else {
    alert("Registration failed. Check your details.");
  }
};

if (loginButton) {
  loginButton.onclick = () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (username && password) {
      login(username, password);
    } else {
      alert("Please fill in all fields.");
    }
  };
}

if (registerButton) {
  registerButton.onclick = () => {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    if (username && email && password) {
      register(username, email, password);
    } else {
      alert("Please fill in all fields.");
    }
  };
}

if (showRegisterButton) {
  showRegisterButton.onclick = () => {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  };
}

if (showLoginButton) {
  showLoginButton.onclick = () => {
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  };
}
