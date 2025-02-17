import { handleFormSubmission } from './form.js'

document.addEventListener("DOMContentLoaded", function () {
    handleFormSubmission("contactForm", function (response) {
        // Ocultar el modal
        const modal = document.getElementById("modal-new-contact");
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal); // Crear una nueva instancia del modal
            bootstrapModal.hide(); // Ocultar el modal
        }

        // Reiniciar el formulario
        const contactForm = document.getElementById("contactForm");
        if (contactForm) {
            contactForm.reset(); // Reiniciar el formulario
        }

        window.location.reload(); // Recargar la página
    }, function (error) {
        console.log(error);
    });
});