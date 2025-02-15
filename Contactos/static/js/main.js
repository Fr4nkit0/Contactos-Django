function generateAvatar(name, avatarElement) {
    if (!name) {
        $(avatarElement).text("?"); // Si no hay nombre, mostrar un "?"
        return;
    }

    const initial = name.charAt(0).toUpperCase();
    $(avatarElement).text(initial);

}
$(document).ready(function () {
    // Iterar sobre todas las tarjetas y asignar el avatar
    $(".card").each(function () {
        const name = $(this).find(".contact-avatar").data("name"); // Obtener el nombre desde el atributo data-name
        const avatarElement = $(this).find(".contact-avatar"); // Obtener el contenedor del avatar
        generateAvatar(name, avatarElement); // Llamar a la función para generar el avatar
    });
});

