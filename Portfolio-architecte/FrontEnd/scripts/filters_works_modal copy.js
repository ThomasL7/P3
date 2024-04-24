//*** Request: Filters + Works ***************************************
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

//*** Builds & Add HTML ******************************************
// Add HTML
function addToHTML(contentHTML, classForInsertion) {
  const elementTarget = document.querySelector(`.${classForInsertion}`);
  elementTarget.innerHTML = "";
  elementTarget.insertAdjacentHTML("afterbegin", contentHTML);
}

// Filters Build
function gettingJSONFiltersToHTML(JSONName) {
  let allFiltersHTML = '<button type="button" class="filters-button filterCat-0 button active-button-filter">Tous</button>';
  for (const object of JSONName) {
    const filterHTML = `<button type="button" class="filters-button filterCat-${object.id} button">${object.name}</button>`;
    allFiltersHTML += filterHTML;
  }
  return allFiltersHTML;
}

// Gallery Build
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

// Modal Gallery Build
function gettingJSONModalWorksToHTML(JSONName) {
  let allModalWorksHTML = "";
  for (const object of JSONName) {
    const workHTML = `<article class="modal-individual-work workCat-${object.categoryId} id-${object.id}">
    <img class="modal-img-work" src="${object.imageUrl}" alt="${object.title}"=>
    <div class="modal-trash-block">
    <img src="./assets/icons/trash.png" alt="Icône de poubelle" aria-label="Button pour supprimer cette photo">
    </div>
    </article>`;
    allModalWorksHTML += workHTML;
  }
  return allModalWorksHTML;
}

// Build HTML of Categories Selection from add new work form
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

  // Build - List of all Works from each Category
  const arrayOfEachWorksCat = [];

  for (let i = 0; i < filtersButtons.length; i++) {
    const eachWorksCat = document.querySelectorAll(`.work-cat-${i}`);
    if (eachWorksCat.length === 0) {
      arrayOfEachWorksCat.push([]);
    } else {
      arrayOfEachWorksCat.push(eachWorksCat);
    }
  }

  // Filter Process
  let activeNumberCat = 0;

  filtersButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // CSS active
      filtersButtons.forEach((button2) => {
        button2.classList.remove("active-button-filter");
      });
      button.classList.add("active-button-filter");

      // Get Category Number of Activated Filter
      button.classList.forEach((eachClass) => {
        if (eachClass.startsWith("filterCat-")) {
          activeNumberCat = parseInt(eachClass.split("filterCat-")[1]);
        }
      });

      // Hide All Works
      arrayOfEachWorksCat.forEach((worksOfACat) => {
        worksOfACat.forEach((work) => {
          work.classList.add("hide-class");
        });
      });

      // Display Works of Selected Cat.
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

//*** Modify Works Modal **************************************
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

// Open & Close Modal
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
    resetAddWorkForm();
    document.removeEventListener("mousedown", docListener);
  }
}

// Update Content Modal
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

// Close Icons & Previous Icons
modalCloseIcon.addEventListener("click", () => {
  hideModal();
  displayAddWork = false;
  mainButtonIsClicked = false;
  resetAddWorkForm();
  document.removeEventListener("click", docListener);
});

modalPreviousIcon.addEventListener("click", () => {
  displayAddWork = false;
  mainButtonIsClicked = false;
  resetAddWorkForm();
  modalUpdateContent();
});

//*** Modal Delete Work ****************************************************/
function modalTrashesOn() {
  const trashes = document.querySelectorAll(".modal-trash-block");
  let idWorkForTrash;

  // Add Event Listeners
  trashes.forEach((trash) => {
    trash.addEventListener("click", (event) => {
      deletingWork(event);
    });

    trash.children[0].addEventListener("click", (event) => {
      deletingWork(event);
    });
  });

  // Delete Process
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

//*** Modal Add New Work ****************************************************/
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

function test() {
  inputNewWorkImage.addEventListener("change", (event) => {
    const imageLoaded = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      newImageLoaded.src = event.target.result;
      newImageLoaded.alt = imageLoaded.name.replace(/\.(png|jpeg)+$/, "");
    };
    reader.readAsDataURL(imageLoaded);
  });
}

// Link Button ".button-add-photo" to Input "#new-work-image" (avoiding a W3C error)
buttonAddPhoto.addEventListener("click", () => {
  test();
  inputNewWorkImage.click();
});

// Display Section Add Work
modalMainButton.addEventListener("click", () => {
  if (!mainButtonIsClicked) {
    displayAddWork = true;
    mainButtonIsClicked = true;
    modalUpdateContent();
  } else {
    sendingNewWork();
  }
});

// Form to add New Work + Request
function sendingNewWork() {
  const newWorkImage = inputNewWorkImage.files[0];
  const newWorkTitle = inputNewWorkTitle.value;
  const newWorkCat = inputNewWorkCat.value;
  let newWorkTitleWithoutStartSpace;

  //___Verify Image
  if (!newWorkImage) {
    buttonAddPhoto.classList.add("invalid-button");
    correctImg = false;
    displayDefaultFormImage();
  } else if ((newWorkImage.type !== "image/png" && newWorkImage.type !== "image/jpeg") || newWorkImage.size > 4000000) {
    buttonAddPhoto.classList.add("invalid-button");
    correctImg = false;
    displayDefaultFormImage();
  } else {
    buttonAddPhoto.classList.remove("invalid-button");
    displayLoadedImage();
    correctImg = true;
  }

  //___Verify Title
  if (!newWorkTitle || !/\S+/.test(newWorkTitle)) {
    inputNewWorkTitle.classList.add("invalid-class");
    correctTitle = false;
  } else {
    newWorkTitleWithoutStartSpace = newWorkTitle.replace(/^\s+|\s+$/g, "");
    inputNewWorkTitle.classList.remove("invalid-class");
    correctTitle = true;
  }

  //___Verify Cat
  if (!newWorkCat) {
    inputNewWorkCat.classList.add("invalid-class");
    correctCat = false;
  } else {
    inputNewWorkCat.classList.remove("invalid-class");
    correctCat = true;
  }

  //___Display Incorrect Input Text
  if (!correctImg || !correctTitle || !correctCat) {
    incorrectFormAddWork.classList.remove("hide-class");
  } else {
    incorrectFormAddWork.classList.add("hide-class");

    //___Building Form Data to Send
    const newWork = new FormData();
    newWork.append("image", newWorkImage);
    newWork.append("title", newWorkTitleWithoutStartSpace);
    newWork.append("category", newWorkCat);

    //___Request: Send New Work + Add to HTML
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
      },
      body: newWork,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response}`);
        }
        displayAddWork = false;
        mainButtonIsClicked = false;
        modalUpdateContent();
        resetAddWorkForm();
      })

      .catch((error) => {
        console.error("Request add new work :", error);
      });
  }
}

// Reset Form to add New Work
const formAddWork = document.querySelector(".form-add-work");

function resetAddWorkForm() {
  formAddWork.reset();
  buttonAddPhoto.classList.remove("invalid-button");
  inputNewWorkTitle.classList.remove("invalid-class");
  inputNewWorkCat.classList.remove("invalid-class");
  incorrectFormAddWork.classList.add("hide-class");
}
