
export function form_contact(form, successCallback, errorCallback) {
    const url = form.getAttribute('action');
    const formData = new FormData(form);

    fetch(url, {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            successCallback(data);
        })
        .catch(error => {
            errorCallback(error);
        });
}
export function handleFormSubmission(formId, successCallback, errorCallback, phoneInputId = "phone") {
    const form = document.getElementById(formId);
    const phoneInput = document.getElementById(phoneInputId);
    const emailInput = document.getElementById('email');
    const nameInput = document.getElementById('name');

    // Agregar el manejador de eventos al formulario
    form.addEventListener("submit", function (e) {
        e.preventDefault();  // Esto previene que el formulario se envíe de forma tradicional

        form.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove("is-valid");
            input.classList.remove("is-invalid");
        });

        let isValid = true; // Bandera para verificar si el formulario es válido

        // Validación del correo electrónico
        if (!emailInput.value.trim()) {
            emailInput.classList.add("is-invalid");
            isValid = false;
        }

        // Validación del nombre
        if (!nameInput.value.trim()) {
            nameInput.classList.add("is-invalid");
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
            const hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = "full_phone_number";
            hiddenInput.value = fullPhoneNumber;
            form.appendChild(hiddenInput);
        }

        // Envía el formulario
        form_contact(
            form,
            function (response) {
                successCallback(response);
                form.reset(); // Reinicia el formulario después de un envío exitoso
            },
            function (error) {
                // Si hay errores, aplica la clase is-invalid a los campos correspondientes
                if (error.responseJSON && error.responseJSON.error) {
                    const errors = error.responseJSON.error;
                    if (errors.name) {
                        nameInput.classList.add("is-invalid");
                    } else {
                        nameInput.classList.add("is-valid");
                    }
                    if (errors.email) {
                        emailInput.classList.add("is-invalid");
                    } else {
                        emailInput.classList.add("is-valid");
                    }
                    if (errors.phone) {
                        phoneInput.classList.add("is-invalid");
                    } else {
                        phoneInput.classList.add("is-valid");
                    }
                }
                errorCallback(error);
            }
        );
    });
}