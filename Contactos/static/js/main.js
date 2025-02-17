function generateAvatar(name, avatarElement) {
    if (!name) {
        avatarElement.textContent = "?"; // Si no hay nombre, mostrar un "?"
        return;
    }

    const initial = name.charAt(0).toUpperCase(); // Obtener la primera letra y convertirla a mayúscula
    avatarElement.textContent = initial; // Asignar la inicial al contenido del elemento
}

document.addEventListener("DOMContentLoaded", function () {
    // Generar avatares después de que el DOM esté completamente cargado
    const avatarElements = document.querySelectorAll(".contact-avatar"); // Obtener todos los elementos con la clase .contact-avatar

    avatarElements.forEach(function (avatarElement) {
        const name = avatarElement.dataset.name; // Obtener el nombre desde el atributo data-name
        generateAvatar(name, avatarElement); // Generar el avatar para cada elemento
    });
});