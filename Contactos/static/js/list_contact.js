
import { handleFormSubmission } from './form.js'
// Delegación de eventos para mouseenter y mouseleave
$("#contacts-container").on("mouseenter", ".contact", function () {
    // Cambiar estilos e imágenes para el ícono de email
    $(this).find(".email")
        .removeClass("border-primary")
        .addClass("border-primary bg-primary")
        .find("img")
        .attr("src", "static/img/envelope-solid-white.svg");
    // Cambiar estilos e imágenes para el ícono de teléfono
    $(this).find(".phone")
        .removeClass("border-primary")
        .addClass("border-primary bg-primary")
        .find("img")
        .attr("src", "static/img/phone-solid-white.svg");
});

$("#contacts-container").on("mouseleave", ".contact", function () {


    // Restaurar estilos e imágenes para el ícono de email
    $(this).find(".email")
        .removeClass("border-primary bg-primary")
        .addClass("border-primary")
        .find("img")
        .attr("src", "static/img/envelope-solid.svg");
    // Restaurar estilos e imágenes para el ícono de teléfono
    $(this).find(".phone")
        .removeClass("border-primary bg-primary")
        .addClass("border-primary")
        .find("img")
        .attr("src", "static/img/phone-solid.svg");
});
function generateAvatar(name, avatarElement) {
    if (!name) {
        $(avatarElement).text("?"); // Si no hay nombre, mostrar un "?"
        return;
    }

    const initial = name.charAt(0).toUpperCase();
    $(avatarElement).text(initial);

}
function listContact(page = 1, search = '') {

    $.ajax({
        url: "api/contacts",  // URL de la API
        type: "GET",
        data: { page: page, search: search },
        dataType: "json",
        success: function (response) {
            $("#contacts-container").empty();
            if (response.contacts && response.contacts.length > 0) {
                // Generar el HTML para cada contacto
                response.contacts.forEach(function (contact) {
                    let contactHtml = `
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
                                                <div class="icon-box border border-primary rounded-pill px-3 py-1 me-2 d-none d-sm-block email phone">
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

                    // Agregar el contacto al contenedor
                    $("#contacts-container").append(contactHtml);
                    // Iterar sobre todas las tarjetas y asignar el avatar
                    $(".contact-avatar").each(function () {
                        const name = $(this).data("name");
                        generateAvatar(name, this);
                    });
                    generatePagination(response.current_page, response.total_pages, search);
                });
            } else {
                // Mostrar un mensaje si no hay contactos
                $("#contacts-container").html('<div class="col-12 text-center"><p>No se encontraron contactos.</p></div>');
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al cargar los contactos:", error);
            $("#contacts-container").html('<div class="col-12 text-center"><p>Ocurrió un error al cargar los contactos.</p></div>');
        }
    });
}
function generatePagination(currentPage, totalPages, currentSearch) {
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
    $(".container-page").html(paginationHtml);
}

// Delegación de eventos para la paginación
$(document).on("click", ".page-link", function (e) {
    e.preventDefault();  // Evitar el comportamiento predeterminado del enlace
    const page = $(this).data("page");
    const search = $(this).data('search');
    listContact(page, search); // Llamar a listContact con la nueva página y la misma búsqueda
});


// Llamar a la función cuando el DOM esté listo
$(document).ready(function () {
    listContact();
    // Evento click para el botón "Ver todo"
    $('#ver-todo').click(function (event) {
        event.preventDefault(); // Previene cualquier comportamiento por defecto
        event.stopPropagation(); // Evita que el evento se propague
        listContact(1); // Llama a listContact con la página uno
        $('#search-input').val("");
    });
    // Función para realizar la búsqueda
    function performSearch(searchTerm) {
        console.log("Realizando búsqueda:", searchTerm); // Depuración
        listContact(1, searchTerm); // Llamar a listContact con la página 1 y el término de búsqueda
    }

    // Capturar el evento input para la búsqueda en tiempo real
    $('#search-input').on('input', function (event) {
        const currentSearch = $(this).val(); // Obtener el término de búsqueda
        performSearch(currentSearch); // Realizar la búsqueda
    });

    // Capturar el evento submit del formulario de búsqueda
    $('#search-form').on('submit', function (event) {
        event.preventDefault(); // Evitar que el formulario se envíe
        const currentSearch = $('#search-input').val(); // Obtener el término de búsqueda
        performSearch(currentSearch); // Realizar la búsqueda
    });

    // Usando el manejador para el formulario de contacto
    handleFormSubmission("#contactForm", function (response) {
        $("#modal-new-contact").modal("hide");
        listContact();
    }, function (error) {
        console.log(error);

    });


}); 
