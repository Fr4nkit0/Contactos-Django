
export function form_contact(form, successCallback, errorCallback) {
    const formData = form.serialize();
    $.ajax({
        data: formData,
        url: form.attr('action'),
        type: form.attr('method'),
        success: function (response) {
            successCallback(response);
        },
        error: function (err) {
            errorCallback(err);
        }
    });
}
export function handleFormSubmission(formId, successCallback, errorCallback, phoneInputId = "#phone") {
    $(formId).on("submit", function (e) {
        e.preventDefault();

        const form = $(this);
        console.log(form); // Para depuración

        // Limpia clases de error previas
        form.find(".form-control").removeClass("is-invalid");

        // Obtén los campos del formulario
        const phoneInput = $(phoneInputId);
        const emailInput = $('#email');
        const nameInput = $('#name');

        let isValid = true; // Bandera para verificar si el formulario es válido

        // Validación del teléfono
        if (phoneInput.length && window.iti) {
            if (!window.iti.isValidNumber()) {
                phoneInput.addClass("is-invalid");
                isValid = false;
            }
        }

        // Validación del correo electrónico
        if (!emailInput.val().trim()) {
            emailInput.addClass("is-invalid");
            isValid = false;
        }

        // Validación del nombre
        if (!nameInput.val().trim()) {
            nameInput.addClass("is-invalid");
            isValid = false;
        }

        // Si el formulario no es válido, detén el proceso
        if (!isValid) {
            return;
        }

        // Obtén el número de teléfono completo si está disponible
        const fullPhoneNumber = window.iti ? window.iti.getNumber() : null;
        console.log("Número completo:", fullPhoneNumber); // Para depuración

        // Agrega el número completo al formulario como un campo oculto
        if (fullPhoneNumber) {
            $("<input>").attr({
                type: "hidden",
                name: "full_phone_number",
                value: fullPhoneNumber
            }).appendTo(form);
        }

        // Envía el formulario
        form_contact(
            form,
            function (response) {
                successCallback(response);
                form.trigger("reset"); // Reinicia el formulario después de un envío exitoso
            },
            function (error) {
                // Si hay errores, aplica la clase is-invalid a los campos correspondientes
                if (error.responseJSON.error) {
                    if (error.responseJSON.error.name) {
                        nameInput.addClass("is-invalid");
                    } else {
                        nameInput.addClass("is-valid");
                    }
                    if (error.responseJSON.error.email) {
                        emailInput.addClass("is-invalid");
                    } else {
                        emailInput.addClass("is-valid");
                    }
                    if (error.responseJSON.error.phone) {
                        phoneInput.addClass("is-invalid");
                    } else {
                        phoneInput.addClass("is-valid");
                    }
                }
                errorCallback(error);
            }
        );
    });
}

//  // Manejo del envío del formulario
//  $("#contactForm").on("submit", function (e) {
//     e.preventDefault(); // Evitar envío tradicional

//     const form = $(this);

//     // Remover estados previos de error
//     form.find(".form-control").removeClass("is-invalid");
//     form.find(".invalid-feedback").hide();
//     form.find(".invalid-feedback").removeClass("d-none");
//     const phoneInput = document.querySelector("#phone");
//     if (phoneInput && window.iti) {
//         if (!window.iti.isValidNumber()) {
//             // Mostrar error si el número no es válido
//             phoneInput.classList.add("is-invalid");

//             return; // Detener el envío del formulario
//         }
//     }
//     const fullPhoneNumber = window.iti.getNumber();
//     console.log("Número completo:", fullPhoneNumber); // Para depuración

//     // Agregar el número completo al formulario
//     if (fullPhoneNumber) {
//         // Crear un campo oculto para enviar el número completo
//         $("<input>").attr({
//             type: "hidden",
//             name: "full_phone_number", // Nombre del campo
//             value: fullPhoneNumber
//         }).appendTo(form);
//     }
//     // Enviar la solicitud AJAX
//     form_contact(
//         form,
//         function (response) {
//             $("#modal-new-contact").modal("hide");
//             form.trigger("reset"); // Limpiar el formulario
//             listContact();
//         },
//         function (error) {
//             console.log(error);
//             // Verificamos si la respuesta JSON contiene errores
//             if (error.responseJSON && error.responseJSON.error) {
//                 // Iteramos sobre los errores del objeto "error"
//                 $.each(error.responseJSON.error, function (field, message) {
//                     let input = form.find(`[name="${field}"]`); // Buscamos el campo de entrada correspondiente
//                     if (input.length > 0) {
//                         input.addClass("is-invalid"); // Marcamos el campo como inválido
//                         let feedback = input.siblings(".invalid-feedback"); // Buscamos el mensaje de error en el sibling
//                         if (feedback.length === 0) {
//                             // Si no existe el mensaje de error, lo creamos dinámicamente
//                             input.after(`<div class="invalid-feedback">${message}</div>`);
//                         } else {
//                             // Si ya existe, solo actualizamos el mensaje
//                             feedback.text(message).show();
//                         }
//                     }
//                 });
//                 setTimeout(function () {
//                     $(".invalid-feedback").addClass("d-none");

//                     $(".is-invalid").removeClass("is-invalid");
//                 }, 3000);
//             } else {
//                 console.error("No se encontraron errores en la respuesta JSON");
//             }
//         }
//     );
// });



