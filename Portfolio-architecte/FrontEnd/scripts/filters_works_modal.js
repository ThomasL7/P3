//*** Request: filters + works ***************************************
const fetchFilters = fetch("http://localhost:5678/api/categories");
const fetchWorks = fetch("http://localhost:5678/api/works");

Promise.all([fetchFilters, fetchWorks])
  .then((responses) => {
    const [responseFilters, responseWorks] = responses;
    if (!responseFilters.ok || !responseWorks.ok) {
      throw new Error(responseFilters, responseWorks);
    }
    return Promise.all([responseFilters.json(), responseWorks.json()]);
  })

  .then(([filters, works]) => {
    addToHTML(gettingJSONFiltersToHTML(filters), "filters");
    addToHTML(gettingJSONWorksToHTML(works), "gallery");
    addToHTML(gettingJSONModalWorksToHTML(works), "modal-gallery");
    addToHTML(gettingJSONModalFiltersToHTML(filters), "new-work-cat");

    filtersProcessOn();
    modalTrashesOn();
  })

  .catch((error) => {
    console.error("Request filters & works :", error);
  });

//*** Builds & add HTML ******************************************
// Add HTML
function addToHTML(contentHTML, classForInsertion) {
  const elementTarget = document.querySelector(`.${classForInsertion}`);
  elementTarget.innerHTML = "";
  elementTarget.insertAdjacentHTML("afterbegin", contentHTML);
}

// Filters build
function gettingJSONFiltersToHTML(JSONName) {
  let allFiltersHTML = '<button type="button" class="filters-button filter-cat-0 button active-button-filter">Tous</button>';
  for (const object of JSONName) {
    const filterHTML = `<button type="button" class="filters-button filter-cat-${object.id} button">${object.name}</button>`;
    allFiltersHTML += filterHTML;
  }
  return allFiltersHTML;
}

// Gallery build
function gettingJSONWorksToHTML(JSONName) {
  let allWorksHTML = "";
  for (const object of JSONName) {
    const workHTML = `<figure class="work-cat-${object.categoryId} id-${object.id}">
    <img src="${object.imageUrl}" alt="Image - ${object.title}">
    <figcaption>${object.title}</figcaption>
    </figure>`;
    allWorksHTML += workHTML;
  }
  return allWorksHTML;
}

// Modal gallery build
function gettingJSONModalWorksToHTML(JSONName) {
  let allModalWorksHTML = "";
  for (const object of JSONName) {
    const workHTML = `<article class="modal-individual-work work-cat-${object.categoryId} id-${object.id}">
    <img class="modal-img-work" src="${object.imageUrl}" alt="${object.title}"=>
    <div class="modal-trash-block">
    <img src="./assets/icons/trash.png" alt="Icône de poubelle" aria-label="Button pour supprimer cette photo">
    </div>
    </article>`;
    allModalWorksHTML += workHTML;
  }
  return allModalWorksHTML;
}

// Build HTML of categories selection from add new work form
function gettingJSONModalFiltersToHTML(JSONName) {
  let allModalFiltersHTML = '<option label=" " aria-hidden="true"></option>';
  for (const object of JSONName) {
    const ModalFilterHTML = `<option value="${object.id}">${object.name}</option>`;
    allModalFiltersHTML += ModalFilterHTML;
  }
  return allModalFiltersHTML;
}

//*** Filters ***********************************************
function filtersProcessOn() {
  const filtersButtons = document.querySelectorAll(".filters-button");

  // Build - list of all works from each category
  const arrayOfEachWorksCat = [];

  for (let i = 0; i < filtersButtons.length; i++) {
    const eachWorksCat = document.querySelectorAll(`.work-cat-${i}`);
    if (eachWorksCat.length === 0) {
      arrayOfEachWorksCat.push([]);
    } else {
      arrayOfEachWorksCat.push(eachWorksCat);
    }
  }

  // Filter process
  let activeNumberCat = 0;

  filtersButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // CSS active
      filtersButtons.forEach((button2) => {
        button2.classList.remove("active-button-filter");
      });
      button.classList.add("active-button-filter");

      // Get category number of activated filter
      button.classList.forEach((eachClass) => {
        if (eachClass.startsWith("filter-cat-")) {
          activeNumberCat = parseInt(eachClass.split("filter-cat-")[1]);
        }
      });

      // Hide all works
      arrayOfEachWorksCat.forEach((worksOfACat) => {
        worksOfACat.forEach((work) => {
          work.classList.add("hide-class");
        });
      });

      // Display works of selected cat.
      if (activeNumberCat === 0) {
        arrayOfEachWorksCat.forEach((worksOfACat) => {
          worksOfACat.forEach((work) => {
            work.classList.remove("hide-class");
          });
        });
      } else {
        arrayOfEachWorksCat[activeNumberCat].forEach((work) => {
          work.classList.remove("hide-class");
        });
      }
    });
  });
}

// Display all works when nav login is clicked
const navLogin2 = document.getElementById("nav-login");
navLogin2.addEventListener("click", () => {
  const filterAll = document.querySelector(".filter-cat-0");
  filterAll.click();
});

//*** Modify works modal **************************************
const linkModifyWorks = document.getElementById("link-modify-works");
const modal = document.querySelector(".modal");
const modalContent = document.querySelector(".modal-all-content");
const modalPreviousIcon = document.querySelector(".modal-previous-icon");
const modalCloseIcon = document.querySelector(".modal-close-icon");
const modalHeaderTitle = document.querySelector(".modal-header-title");
const modalGallery = document.querySelector(".modal-gallery");
const modalSectionAddWork = document.querySelector(".modal-section-add-work");
const modalMainButton = document.querySelector(".modal-main-button");
let displayAddWork = false;
let mainButtonIsClicked = false;

// Open & close modal
function showModal() {
  modal.classList.remove("hide-class");
  resetAddWorkForm();
}
function hideModal() {
  modal.classList.add("hide-class");
}

linkModifyWorks.addEventListener("click", (event) => {
  event.stopPropagation();
  modalUpdateContent();
  showModal();
  document.addEventListener("mousedown", docListener);
});

function docListener(event) {
  if (!modalContent.contains(event.target)) {
    hideModal();
    displayAddWork = false;
    mainButtonIsClicked = false;
    modalMainButtonNormalStyle();
    resetAddWorkForm();
    document.removeEventListener("mousedown", docListener);
  }
}

// Update content modal
function modalUpdateContent() {
  changeModalPreviousIcon();
  changeModalHeaderTitle();
  changeModalMainContent();
  changeMainButton();
}

function changeModalHeaderTitle() {
  if (displayAddWork) {
    modalHeaderTitle.textContent = "Ajout photo";
  } else {
    modalHeaderTitle.textContent = "Galerie photo";
  }
}

function changeModalMainContent() {
  if (displayAddWork) {
    modalGallery.classList.add("hide-class");
    modalSectionAddWork.classList.remove("hide-class");
  } else {
    modalGallery.classList.remove("hide-class");
    modalSectionAddWork.classList.add("hide-class");
  }
}

function changeMainButton() {
  if (displayAddWork) {
    modalMainButton.textContent = "Valider";
  } else {
    modalMainButton.textContent = "Ajouter une photo";
  }
}

function changeModalPreviousIcon() {
  if (displayAddWork) {
    modalPreviousIcon.classList.remove("hide-class");
  } else {
    modalPreviousIcon.classList.add("hide-class");
  }
}

// Close icons & previous icons
modalCloseIcon.addEventListener("click", () => {
  hideModal();
  displayAddWork = false;
  mainButtonIsClicked = false;
  modalMainButtonNormalStyle();
  resetAddWorkForm();
  document.removeEventListener("click", docListener);
});

modalPreviousIcon.addEventListener("click", () => {
  displayAddWork = false;
  mainButtonIsClicked = false;
  resetAddWorkForm();
  modalMainButtonNormalStyle();
  modalUpdateContent();
});

//*** Modal delete work ****************************************************/
function modalTrashesOn() {
  const trashes = document.querySelectorAll(".modal-trash-block");
  let idWorkForTrash;

  // Add event listeners
  trashes.forEach((trash) => {
    trash.addEventListener("click", (event) => {
      deletingWork(event);
    });

    trash.children[0].addEventListener("click", (event) => {
      deletingWork(event);
    });
  });

  // Delete process
  function deletingWork(event) {
    //___Get ID for trash
    let elementForTrash = null;

    if (event.target.tagName === "IMG") {
      elementForTrash = event.target.parentNode.parentNode;
    } else {
      elementForTrash = event.target.parentNode;
    }

    elementForTrash.classList.forEach((classFromElementForTrash) => {
      if (classFromElementForTrash.startsWith("id-")) {
        idWorkForTrash = classFromElementForTrash.split("id-")[1];

        //___Delete selected work (from HTML & DB server)
        fetch(`http://localhost:5678/api/works/${idWorkForTrash}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(response);
            }
          })

          .then(() => {
            const allHTMLWorkForTrash = document.querySelectorAll(`.id-${idWorkForTrash}`);
            allHTMLWorkForTrash.forEach((HTMLWorkForTrash) => {
              HTMLWorkForTrash.remove();
            });
          })

          .catch((error) => {
            console.error("Request delete work :", error);
          });
      }
    });
  }
}

//*** Modal add new work ****************************************************/
const modalSectionAddPhotoToHide = document.querySelector(".modal-section-add-photo-to-hide");
const newImageLoaded = document.querySelector(".modal-image-loaded");
const buttonAddPhoto = document.querySelector(".button-add-photo");
const inputNewWorkImage = document.getElementById("new-work-image");
const inputNewWorkTitle = document.getElementById("new-work-title");
const inputNewWorkCat = document.getElementById("new-work-cat");
const incorrectFormAddWork = document.querySelector(".incorrect-form-add-work");
let correctImg = false;
let correctTitle = false;
let correctCat = false;
let newWorkImage;

// Display section add work
modalMainButton.addEventListener("click", () => {
  if (!mainButtonIsClicked) {
    displayAddWork = true;
    mainButtonIsClicked = true;
    modalUpdateContent();
    modalMainButton.classList.add("button-style-2");
  } else {
    sendingNewWork();
  }
});

// Link button ".button-add-photo" to input "#new-work-image" (avoiding a W3C error)
buttonAddPhoto.addEventListener("click", () => {
  inputNewWorkImage.click();
});

// Functions: display loaded image or section form image
function displayLoadedImage() {
  modalSectionAddPhotoToHide.classList.add("hide-class");
  newImageLoaded.classList.remove("hide-class");
}

function displayDefaultFormImage() {
  newImageLoaded.classList.add("hide-class");
  modalSectionAddPhotoToHide.classList.remove("hide-class");
}

// Loaded image process
inputNewWorkImage.addEventListener("change", () => {
  newWorkImage = inputNewWorkImage.files[0];

  //___Check if image format is correct
  if ((newWorkImage.type !== "image/png" && newWorkImage.type !== "image/jpeg") || newWorkImage.size > 4000000) {
    buttonAddPhoto.classList.add("invalid-button");
    if (correctImg) {
      correctImg = false;
      resetHTMLLoadedImage();
      displayDefaultFormImage();
    } else {
      correctImg = false;
      resetHTMLLoadedImage();
    }
    incorrectFormAddWork.classList.remove("hide-class");
    buttonAddPhoto.setCustomValidity("Veuillez sélectionner une photo valide");
  } else {
    // Remove incorrect span if needed
    if (!inputNewWorkTitle.classList.contains("invalid-class") || !inputNewWorkCat.classList.contains("invalid-class")) {
      incorrectFormAddWork.classList.add("hide-class");
    }

    //___If correct read & display image
    const reader = new FileReader();
    reader.onload = function (event) {
      newImageLoaded.src = event.target.result;
      newImageLoaded.alt = newWorkImage.name.replace(/\.(png|jpg|jpeg|jpe)$/, "");
      newImageLoaded.ariaLabel = "Cliquez pour changer de photo";
    };
    reader.readAsDataURL(newWorkImage);

    correctImg = true;
    displayLoadedImage();
  }
});

// Function: reset HTML loaded image
function resetHTMLLoadedImage() {
  newImageLoaded.src = "";
  newImageLoaded.alt = "";
  newImageLoaded.removeAttribute("aria-label");
}

// Clicking loaded image to change image
newImageLoaded.addEventListener("click", () => {
  inputNewWorkImage.click();
});

// Form to add new work + request
function sendingNewWork() {
  const newWorkTitle = inputNewWorkTitle.value;
  const newWorkCat = inputNewWorkCat.value;
  let newWorkTitleWithoutUselessSpaces;

  //___Verify if image exist
  if (!correctImg) {
    buttonAddPhoto.classList.add("invalid-button");
  }

  //___Verify title
  if (!inputNewWorkTitle.reportValidity()) {
    inputNewWorkTitle.classList.add("invalid-class");
  } else {
    newWorkTitleWithoutUselessSpaces = newWorkTitle.replace(/^\s+|\s+$/g, "");
    inputNewWorkTitle.classList.remove("invalid-class");
  }

  //___Verify cat
  if (!inputNewWorkCat.reportValidity()) {
    inputNewWorkCat.classList.add("invalid-class");
  } else {
    inputNewWorkCat.classList.remove("invalid-class");
  }

  //___Display incorrect input text
  if (!correctImg || !inputNewWorkTitle.reportValidity() || !inputNewWorkCat.reportValidity()) {
    incorrectFormAddWork.classList.remove("hide-class");
  } else {
    incorrectFormAddWork.classList.add("hide-class");

    //___Building form data to send
    const newWork = new FormData();
    newWork.append("image", newWorkImage);
    newWork.append("title", newWorkTitleWithoutUselessSpaces);
    newWork.append("category", newWorkCat);

    //___Request: send new work + add to HTML
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      body: newWork,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response);
        }
        return response.json();
      })

      .then((dataNewWork) => {
        // Add HTML new work
        const newWorkHTML = `<figure class="work-cat-${dataNewWork.categoryId} id-${dataNewWork.id}">
      <img src="${dataNewWork.imageUrl}" alt="Image - ${dataNewWork.title}">
      <figcaption>${dataNewWork.title}</figcaption>
      </figure>`;
        const elementTarget = document.querySelector(`.gallery`);
        elementTarget.insertAdjacentHTML("beforeend", newWorkHTML);

        // Add modal HTML new work
        const newWorkModalHTML = `<article class="modal-individual-work work-cat-${dataNewWork.categoryId} id-${dataNewWork.id}">
      <img class="modal-img-work" src="${dataNewWork.imageUrl}" alt="${dataNewWork.title}"=>
      <div class="modal-trash-block">
      <img src="./assets/icons/trash.png" alt="Icône de poubelle" aria-label="Button pour supprimer cette photo">
      </div>
      </article>`;
        const elementModalTarget = document.querySelector(`.modal-gallery`);
        elementModalTarget.insertAdjacentHTML("beforeend", newWorkModalHTML);

        // Reset modal display & form
        displayAddWork = false;
        mainButtonIsClicked = false;
        modalMainButtonNormalStyle();
        modalUpdateContent();
        resetAddWorkForm();
      })

      .catch((error) => {
        console.error("Request add new work :", error);
      });
  }
}

// Reset form to add new work
const formAddWork = document.querySelector(".form-add-work");

function resetAddWorkForm() {
  displayDefaultFormImage();
  formAddWork.reset();
  correctImg = false;
  resetHTMLLoadedImage();
  buttonAddPhoto.classList.remove("invalid-button");
  inputNewWorkTitle.classList.remove("invalid-class");
  inputNewWorkCat.classList.remove("invalid-class");
  incorrectFormAddWork.classList.add("hide-class");
}

// Modal main button normal style
function modalMainButtonNormalStyle() {
  modalMainButton.classList.remove("button-style-2");
}
