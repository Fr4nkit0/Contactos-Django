const path = require('path');

module.exports = {
    mode: 'development', // Añade el modo para evitar el warning
    entry: './src/main.js', // Ruta al archivo de entrada
    output: {
        filename: 'bundle.js', // Nombre del archivo de salida
        path: path.resolve(__dirname, 'static/js'), // Carpeta de salida
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Regla para manejar archivos CSS
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};