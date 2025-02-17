
import { handleFormSubmission } from './form.js'
// Delegación de eventos para mouseover y mouseout
document.getElementById("contacts-container").addEventListener("mouseover", function (event) {
    // Verifica si el cursor está sobre un elemento con la clase ".contact" o uno de sus hijos
    const contact = event.target.closest(".contact");
    if (contact) {
        // Cambiar estilos e imágenes para el ícono de email
        const emailIcon = contact.querySelector(".email");
        if (emailIcon) {
            emailIcon.classList.remove("border-primary");
            emailIcon.classList.add("border-primary", "bg-primary");
            const emailImg = emailIcon.querySelector("img");
            emailImg.src = "static/img/envelope-solid-white.svg";
        }
        // Cambiar estilos e imágenes para el ícono de teléfono
        const phoneIcon = contact.querySelector(".phone");
        if (phoneIcon) {
            phoneIcon.classList.remove("border-primary");
            phoneIcon.classList.add("border-primary", "bg-primary");
            const phoneImg = phoneIcon.querySelector("img");
            phoneImg.src = "static/img/phone-solid-white.svg";
        }
    }
});

document.getElementById("contacts-container").addEventListener("mouseout", function (event) {
    // Verifica si el cursor sale de un elemento con la clase ".contact" o uno de sus hijos
    const contact = event.target.closest(".contact");
    if (contact) {
        // Restaurar estilos e imágenes para el ícono de email
        const emailIcon = contact.querySelector(".email");
        if (emailIcon) {
            emailIcon.classList.remove("border-primary", "bg-primary");
            emailIcon.classList.add("border-primary");
            const emailImg = emailIcon.querySelector("img");
            emailImg.src = "static/img/envelope-solid.svg";
        }

        // Restaurar estilos e imágenes para el ícono de teléfono
        const phoneIcon = contact.querySelector(".phone");
        if (phoneIcon) {
            phoneIcon.classList.remove("border-primary", "bg-primary");
            phoneIcon.classList.add("border-primary");
            const phoneImg = phoneIcon.querySelector("img");
            phoneImg.src = "static/img/phone-solid.svg";
        }
    }
});

function generateAvatar(name, avatarElement) {
    if (!name) {
        avatarElement.textContent = "?"; // Si no hay nombre, mostrar un "?"
        return;
    }
    const initial = name.charAt(0).toUpperCase();
    avatarElement.textContent = initial;
}

function listContact(page = 1, search = '') {
    const url = new URL("api/contacts", window.location.origin);
    url.searchParams.append("page", page);
    if (search) {
        url.searchParams.append("search", search);
    }
    fetch(url)
        .then(reponse => reponse.json())
        .then(data => {
            const contactsContainer = document.getElementById("contacts-container");
            contactsContainer.innerHTML = "";

            if (data.contacts && data.contacts.length > 0) {
                data.contacts.forEach(contact => {
                    const contactHtml = `
                    <div class="col-12 col-md-6 col-lg-6 col-xl-4 mb-3">
                        <a href="datail/${contact.id}" class="text-decoration-none text-dark">
                            <div class="card contact bg-contact">
                                <div class="header d-flex justify-content-center align-items-center">
                                    <div class="contact-avatar mt-2" data-name="${contact.name}"></div>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item bg-contact">
                                            <p class="fw-bold text-white text-start text-sm-center">${contact.name}</p>
                                        </li>
                                        <li class="list-group-item d-flex align-items-center bg-contact">
                                            <div class="icon-box border border-primary rounded-pill px-3 py-1 me-2 d-none d-sm-block  phone">
                                                <img src="static/img/phone-solid.svg" alt="Teléfono">
                                            </div>
                                            <span class="aling-middle text-break text-white text-center text-sm-start">${contact.phone}</span>
                                        </li>
                                        <li class="list-group-item d-flex align-items-center bg-contact">
                                            <div class="icon-box border border-primary rounded-pill px-3 py-1 me-2 d-none d-sm-block email">
                                                <img src="static/img/envelope-solid.svg" alt="">
                                            </div>
                                            <span class="aling-middle text-break text-white text-center text-sm-start">${contact.email}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </a>
                    </div>
                    `;
                    contactsContainer.innerHTML += contactHtml;
                });
                // Generar avatares después de que el DOM esté completamente cargado
                document.querySelectorAll(".contact-avatar").forEach(avatarElement => {
                    const name = avatarElement.getAttribute("data-name");
                    generateAvatar(name, avatarElement);
                });
                generatePagination(data.current_page, data.total_pages, search);
            } else {
                contactsContainer.innerHTML = "<p>No se encontraron contactos.</p>";
            }
        })
        .catch(error => {
            document.getElementById("contacts-container")
                .innerHTML = '<div class="col-12 text-center"><p>Ocurrió un error al cargar los contactos.</p></div>';
        });

}
function generatePagination(currentPage, totalPages, currentSearch) {
    const paginationContainer = document.querySelector(".container-page");

    let paginationHtml = '<nav aria-label="Page navigation"><ul class="pagination justify-content-center">';

    // Botón "Anterior"
    if (currentPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${currentPage - 1}" data-search="${currentSearch}" aria-label="Previous">Anterior</a>
            </li>
        `;
    }
    // Calcular el rango de páginas a mostrar (4 botones)
    let startPage, endPage;
    if (totalPages <= 4) {
        // Si hay 4 o menos páginas, muestra todas
        startPage = 1;
        endPage = totalPages;
    } else {
        // Si hay más de 4 páginas, calcula el rango dinámico
        if (currentPage <= 2) {
            // Para las primeras páginas, muestra las primeras 4
            startPage = 1;
            endPage = 4;
        } else if (currentPage + 1 >= totalPages) {
            // Para las últimas páginas, muestra las últimas 4
            startPage = totalPages - 3;
            endPage = totalPages;
        } else {
            // En el medio, centra la página actual lo más posible
            startPage = currentPage - 1;
            endPage = currentPage + 2;
        }
    }

    // Generar los botones de paginación
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHtml += `
                <li class="page-item active" aria-current="page">
                    <span class="page-link">${i}</span>
                </li>
            `;
        } else {
            paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${i}" data-search="${currentSearch}">${i}</a>
                </li>
            `;
        }
    }

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${currentPage + 1}" data-search="${currentSearch}" aria-label="Next">Siguiente</a>
            </li>
        `;
    }

    paginationHtml += '</ul></nav>';
    paginationContainer.innerHTML = paginationHtml;

}
// Delegación de eventos para la paginación
document.addEventListener("click", function (event) {
    if (event.target.closest(".page-link")) {
        event.preventDefault();
        const page = event.target.getAttribute("data-page");
        const search = event.target.getAttribute("data-search");
        listContact(page, search);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    listContact();

    // Función para realizar la búsqueda
    function performSearch(searchTerm) {
        listContact(1, searchTerm);
    }
    document.getElementById('search-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const currentSearch = document.getElementById('search-input').value;
        performSearch(currentSearch);
    });
    document.getElementById('search-input').addEventListener('input', function (event) {
        const currentSearch = this.value;
        performSearch(currentSearch);
    });
    // Usando el manejador para el formulario de contacto
    handleFormSubmission("contactForm", function (response) {
        const modal = document.getElementById("modal-new-contact");
        if (modal) {
            modal.style.display = 'none'; // Oculta el modal sin jQuery
        }
        listContact(); // Asumiendo que `listContact` es una función que actualiza la lista de contactos
    }, function (error) {
        console.log(error);
    });
})