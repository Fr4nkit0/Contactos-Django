import 'intl-tel-input/build/css/intlTelInput.css'; // Importa el CSS
import intlTelInput from 'intl-tel-input';

const input = document.querySelector("#phone");
if (input) {
    const iti = intlTelInput(input, {
        loadUtils: () => import("intl-tel-input/utils"), // Carga utils.js dinámicamente
        preferredCountries: ['ar', 'us', 'mx', 'co'], // Argentina como país preferido
        initialCountry: 'auto', // Detectar país automáticamente
        formatOnDisplay: true, // Formatea el número mientras el usuario escribe
        separateDialCode: true, // Desactiva la separación del código de país
        strictMode: true
    });

    // Exporta la instancia de intlTelInput para que pueda ser accedida desde otros archivos
    window.iti = iti;
}