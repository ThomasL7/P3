// *************** Fetch Request: Works + Filters ************************
const fetchFilters = fetch("http://localhost:5678/api/categories");
const fetchWorks = fetch("http://localhost:5678/api/works");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcxMzIyMDM4MCwiZXhwIjoxNzEzMzA2NzgwfQ.nOm9KbGj0CEv5BM4fomKWqlm7v2-vdAhKhcCMlwQkFs";

function prout() {
  Promise.all([fetchFilters, fetchWorks])
    .then((responses) => {
      const [responseFilters, responseWorks] = responses;
      if (!responseFilters.ok || !responseWorks.ok) {
        return Promise.all([responseFilters.json(), responseWorks.json()]).then(([dataFilters, dataWorks]) => {
          throw new Error(`Erreur HTTP - promise1: ${dataFilters.message}, promise2: ${dataWorks.message}`);
        });
      }
      return Promise.all([responseFilters.json(), responseWorks.json()]);
    })

    .then(([filters, works]) => {
      // addToHTML(gettingJSONworksToHTML(works, buildWorksHTML), "gallery");
      addToHTML(gettingJSONworksToHTML(works, buildModalWorksHTML), "modal-works-list");
      modalTrashesReady();
    })

    .catch((error) => {
      console.error("Error - request filters & works :", error);
    });
}

// *************** Functions: Builds & Add HTML ***************************
function addToHTML(contentHTML, classForInsertion) {
  const filters = document.querySelector(`.${classForInsertion}`);
  filters.innerHTML = "";
  filters.insertAdjacentHTML("afterbegin", contentHTML);
}

function buildWorksHTML(titleWork, srcImg, categoryId, id) {
  const workHTML = `<figure class="workCat-${categoryId} id-${id}">
      <img src="${srcImg}">
      <figcaption>${titleWork}</figcaption>
    </figure>`;
  return workHTML;
}

function gettingJSONworksToHTML(JSONName, whichBuildWorksHTML) {
  let allWorksHTML = "";
  for (const object of JSONName) {
    const workHTML = whichBuildWorksHTML(object.title, object.imageUrl, object.categoryId, object.id);
    allWorksHTML += workHTML;
  }
  return allWorksHTML;
}

function buildModalWorksHTML(titleWork, srcImg, categoryId, id) {
  const workHTML = `<article class="modal-individual-work workCat-${categoryId} id-${id}">
  <img class="modal-img-work" src="${srcImg}" alt="${titleWork}">
  <div class="modal-trash-block">
    <img src="./assets/icons/trash.png" alt="">
  </div>
</article>`;

  return workHTML;
}

// Trash - Delete Work Function
let idWorkForTrash;

function modalTrashesReady() {
  const trashes = document.querySelectorAll(".modal-trash-block");
  trashes.forEach((trash) => {
    trash.addEventListener("click", (event) => {
      event.preventDefault();
      const elementForTrash = event.target.parentNode.parentNode;
      elementForTrash.classList.forEach((classFromElementForTrash) => {
        event.preventDefault();
        if (classFromElementForTrash.startsWith("id-")) {
          idWorkForTrash = classFromElementForTrash.split("id-")[1];
        }
      });

      fetch(`http://localhost:5678/api/works/${idWorkForTrash}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(`Erreur HTTP : ${data.message}`);
            });
          }
        })

        .catch((error) => {
          console.error("Error - request delete :", error);
        });
    });
  });
}

const modalMainButton = document.querySelector(".modal-main-button");
modalMainButton.addEventListener("click", (event) => {
  event.preventDefault();
  const modalNewWorkImg = document.getElementById("modal-photo-to-add");
  const imageNewWork = modalNewWorkImg.files[0];

  const imageFinal = new Blob([imageNewWork], { type: "image/png" });

  const newWork = new FormData();
  newWork.append("image", imageFinal, imageFinal.name);
  newWork.append("title", "test2");
  newWork.append("category", 1);

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + token,
    },
    body: newWork,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response}`);
      }
    })
    .catch((error) => {
      console.error("Request add new work :", error);
    });
});

prout();
