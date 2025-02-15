import { handleFormSubmission } from './form.js'

$(document).ready(function () {
    console.log("ready!");
    handleFormSubmission("#contactForm", function (response) {
        console.log(response)
        $("#modal-update").modal("hide");
        $("#contactForm").trigger("reset");

        window.location.reload(); // Recarga toda la página

    }, function (error) {
        console.log(error)

    });

});