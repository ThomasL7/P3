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

    filtersProcessOn();
    modalTrashesOn();
  })

  .catch((error) => {
    console.error("Request Filters + Works :", error);
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
  let allFiltersHTML = '<button type="button" class="filters-button filterCat-0 button activeButtonFilter">Tous</button>';
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
        button2.classList.remove("activeButtonFilter");
      });
      button.classList.add("activeButtonFilter");

      // Get Category Number of Activated Filter
      button.classList.forEach((eachClass) => {
        if (eachClass.startsWith("filterCat-")) {
          activeNumberCat = parseInt(eachClass.split("filterCat-")[1]);
        }
      });

      // Hide All Works
      arrayOfEachWorksCat.forEach((worksOfACat) => {
        worksOfACat.forEach((work) => {
          work.classList.add("hideClass");
        });
      });

      // Display Works of Selected Cat.
      if (activeNumberCat === 0) {
        arrayOfEachWorksCat.forEach((worksOfACat) => {
          worksOfACat.forEach((work) => {
            work.classList.remove("hideClass");
          });
        });
      } else {
        arrayOfEachWorksCat[activeNumberCat].forEach((work) => {
          work.classList.remove("hideClass");
        });
      }
    });
  });
}

//*** Modify Modal **************************************
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
  modal.classList.remove("hideClass");
}
function hideModal() {
  modal.classList.add("hideClass");
}

linkModifyWorks.addEventListener("click", (event) => {
  event.stopPropagation();
  modalUpdateContent();
  showModal();
  document.addEventListener("click", docListener);
});

function docListener(event) {
  if (!modalContent.contains(event.target)) {
    hideModal();
    displayAddWork = false;
    document.removeEventListener("click", docListener);
  }
}

// Update Content Modal
function modalUpdateContent() {
  changeModalPreviousIcon();
  changeModalHeaderTitle();
  changeModalContent();
  changeMainButton();
}

function changeModalHeaderTitle() {
  if (displayAddWork) {
    modalHeaderTitle.textContent = "Ajout photo";
  } else {
    modalHeaderTitle.textContent = "Galerie photo";
  }
}

function changeModalContent() {
  if (displayAddWork) {
    modalGallery.classList.add("hideClass");
    modalSectionAddWork.classList.remove("hideClass");
  } else {
    modalGallery.classList.remove("hideClass");
    modalSectionAddWork.classList.add("hideClass");
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
    modalPreviousIcon.classList.remove("hideClass");
  } else {
    modalPreviousIcon.classList.add("hideClass");
  }
}

// Close Icons & Previous Icons
modalCloseIcon.addEventListener("click", () => {
  hideModal();
  displayAddWork = false;
  document.removeEventListener("click", docListener);
});

modalPreviousIcon.addEventListener("click", () => {
  displayAddWork = false;
  modalUpdateContent();
});

// Delete Work
function modalTrashesOn() {
  const trashes = document.querySelectorAll(".modal-trash-block");
  let idWorkForTrash;

  //___Add Event Listeners
  trashes.forEach((trash) => {
    trash.addEventListener("click", (event) => {
      deletingWork(event);
    });

    trash.children[0].addEventListener("click", (event) => {
      deletingWork(event);
    });
  });

  //___Delete Process
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

// Add Work
// Link Button ".button-add-photo" to Input "#new-work-image" (avoiding a W3C error)
const buttonAddPhoto = document.querySelector(".button-add-photo");
const modalNewWorkImage = document.getElementById("new-work-image");

(function linkButtonToInputFile() {
  buttonAddPhoto.addEventListener("click", () => {
    modalNewWorkImage.click();
  });
})();

// ????
modalMainButton.addEventListener("click", (event) => {
  displayAddWork = true;
  modalUpdateContent();
});

// New Work Form
function sendingWorkProcess() {
  // const modalNewWorkImage = document.getElementById("new-work-image");
  const newWorkImage = modalNewWorkImage.files[0];
  const modalNewWorkTitle = document.getElementById("new-work-title");
  const newWorkTitle = modalNewWorkTitle.value;
  const newWorkCat = document.getElementById("new-work-cat").value;
  let correctImg = false;
  let correctTitle = false;
  // // if (!newWorkImage) {
  // //   modalNewWorkImage.classList.add("invalidClass");
  // //   correctImg = false;
  // // } else if ((newWorkImage.type !== "image/png" && newWorkImage.type !== "image/jpeg") || newWorkImage.size > 4000000) {
  // //   correctImg = false;
  // // } else {
  // //   modalNewWorkImage.classList.remove("invalidClass");
  // //   correctImg = true;
  // // }
  // // if (!titleNewWork) {
  // //   modalNewWorkTitle.classList.add("invalidClass");
  // //   correctTitle = false;
  // // } else {
  // //   modalNewWorkTitle.classList.remove("invalidClass");
  // //   correctTitle = true;
  // // }
  // if (correctImg && correctTitle) {
  // mainButtonIsClicked = true;
  const imageFinal = new Blob([newWorkImage], { type: "image/png" });
  console.log(imageFinal);
  const newWork = new FormData();
  newWork.append("image", newWorkImage, newWorkImage.name);
  newWork.append("title", "test2");
  newWork.append("category", 1);

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("accessToken"),
      "Content-Type": "multipart/form-data",
    },
    body: newWork,
  })
    .then((response) => {
      console.log(newWork);
      if (!response.ok) {
        throw new Error(`${response}`);
      }
    })
    .catch((error) => {
      console.error("Request add new work :", error);
    });
}
