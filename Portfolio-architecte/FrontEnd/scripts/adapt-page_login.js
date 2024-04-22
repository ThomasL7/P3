//*** Adaptative Content ****************************************************/
// Reload page to top
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

// Hide or Show HTML Sections (functions)
const allSections = document.querySelectorAll("section");
const introductionSection = document.getElementById("introduction");
let connected = false;

function hideSections() {
  allSections.forEach((section) => {
    section.classList.add("hideClass");
  });
  introductionSection.id = "hideIntroduction";
}

function showSections() {
  allSections.forEach((section) => {
    section.classList.remove("hideClass");
  });
  introductionSection.id = "introduction";
}

// Show Login Section + Logout Process
const navLogin = document.getElementById("nav-login");
const loginSection = document.querySelector(".login-section");

navLogin.addEventListener("click", () => {
  if (connected === false) {
    hideSections();
    loginSection.classList.remove("hideClass");
    navLogin.classList.add("navActiveLi");
  } else {
    sessionStorage.removeItem("accessToken");
    connected = false;
    adaptativeHomepage();
  }
});

// Adaptative Home Page Process
const divModifyWorks = document.querySelector(".div-modify-works");
const filters = document.querySelector(".filters");
const navProjects = document.getElementById("nav-projects");
const navContact = document.getElementById("nav-contact");

//___Navigation Projects & Contact to Home
navProjects.addEventListener("click", () => {
  adaptativeHomepage();
});

navContact.addEventListener("click", () => {
  adaptativeHomepage();
});

//___Adapt Homepage if Connected or Not
function adaptativeHomepage() {
  navLogin.classList.remove("navActiveLi");

  if (connected === true) {
    navLogin.textContent = "logout";
    navLogin.setAttribute("aria-label", "Button pour se déconnecter");
    divModifyWorks.classList.remove("hideClass");
    filters.classList.add("hideClass");
    showSections();
    loginSection.classList.add("hideClass");
  } else {
    navLogin.textContent = "login";
    navLogin.setAttribute("aria-label", "Lien pour se connecter");
    divModifyWorks.classList.add("hideClass");
    filters.classList.remove("hideClass");
    showSections();
    loginSection.classList.add("hideClass");
  }
}

// *** Request: Login **************************************
const submitLogin = document.getElementById("submit-login");
const incorrectLogin = document.querySelector(".incorrect-login");

// Submit Button Event
submitLogin.addEventListener("click", (event) => {
  event.preventDefault();

  //___Getting Login Input
  const fullLogin = {
    email: document.getElementById("email-login").value,
    password: document.getElementById("password-login").value,
  };

  //___Fetch Login for Token
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullLogin),
  })
    .then((response) => {
      if (!response.ok) {
        incorrectLogin.classList.remove("hideClass");
        throw new Error(response);
      }
      incorrectLogin.classList.add("hideClass");
      return response.json();
    })

    .then((data) => {
      sessionStorage.setItem("accessToken", data.token);
      connected = true;
      adaptativeHomepage();
    })

    .catch((error) => {
      console.error("Request Login :", error);
    });
});

// *** Check if Logged on Reload *************************************************/
window.addEventListener("load", function () {
  if (sessionStorage.getItem("accessToken")) {
    connected = true;
    adaptativeHomepage();
  }
});
