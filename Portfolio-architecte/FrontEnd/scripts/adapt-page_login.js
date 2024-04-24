//*** Adaptative content ****************************************************/
// Reload page to top
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

// Hide or show HTML sections (functions)
const allSections = document.querySelectorAll("section");
const introductionSection = document.getElementById("introduction");
let connected = false;

function hideSections() {
  allSections.forEach((section) => {
    section.classList.add("hide-class");
  });
  introductionSection.id = "hide-introduction";
}

function showSections() {
  allSections.forEach((section) => {
    section.classList.remove("hide-class");
  });
  introductionSection.id = "introduction";
}

// Show login section + logout process
const navLogin = document.getElementById("nav-login");
const loginSection = document.querySelector(".login-section");

navLogin.addEventListener("click", () => {
  if (connected === false) {
    hideSections();
    loginSection.classList.remove("hide-class");
    navLogin.classList.add("nav-active");
  } else {
    sessionStorage.removeItem("accessToken");
    connected = false;
    adaptativeHomepage();
  }
});

// Adaptative home page process
const headerTitle = document.getElementById("header-title");
const navProjects = document.getElementById("nav-projects");
const navContact = document.getElementById("nav-contact");
const divModifyWorks = document.querySelector(".div-modify-works");
const filters = document.querySelector(".filters");

//___Header title, navigation projects & contact to home
headerTitle.addEventListener("click", () => {
  adaptativeHomepage();
  window.scrollTo(0, 0);
});

navProjects.addEventListener("click", () => {
  adaptativeHomepage();
});

navContact.addEventListener("click", () => {
  adaptativeHomepage();
});

//___Adapt homepage if connected or not
function adaptativeHomepage() {
  navLogin.classList.remove("nav-active");

  if (connected) {
    navLogin.textContent = "logout";
    navLogin.setAttribute("aria-label", "Button pour se déconnecter");
    divModifyWorks.classList.remove("hide-class");
    filters.classList.add("hide-class");
    showSections();
    loginSection.classList.add("hide-class");
  } else {
    navLogin.textContent = "login";
    navLogin.setAttribute("aria-label", "Lien pour se connecter");
    divModifyWorks.classList.add("hide-class");
    filters.classList.remove("hide-class");
    showSections();
    loginSection.classList.add("hide-class");
  }

  if (!incorrectLogin.classList.contains("hide-class")) {
    incorrectLogin.classList.add("hide-class");
  }
}

// *** Request: login **************************************
const submitLogin = document.getElementById("submit-login");
const incorrectLogin = document.querySelector(".incorrect-login");

// Submit button event
submitLogin.addEventListener("click", (event) => {
  event.preventDefault();

  //___Getting login input
  const fullLogin = {
    email: document.getElementById("email-login").value,
    password: document.getElementById("password-login").value,
  };

  //___Fetch login for token
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullLogin),
  })
    .then((response) => {
      if (!response.ok) {
        incorrectLogin.classList.remove("hide-class");
        throw new Error(response);
      }
      incorrectLogin.classList.add("hide-class");
      return response.json();
    })

    .then((data) => {
      sessionStorage.setItem("accessToken", data.token);
      connected = true;
      adaptativeHomepage();
    })

    .catch((error) => {
      console.error("Request login :", error);
    });
});

// *** Check if logged on reload *************************************************/
window.addEventListener("load", function () {
  if (sessionStorage.getItem("accessToken")) {
    connected = true;
    adaptativeHomepage();
  }
});
