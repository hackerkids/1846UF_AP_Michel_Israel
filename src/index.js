// Importamos los módulos 
const express = require("express"); 
const app = express(); // Crea una instancia de la aplicación Express
const path = require("node:path"); 

/* const path = require("node:path");  */

// Cargar el archivo de variables de entorno para obtener el número de puerto
process.loadEnvFile(); 
const PORT = process.env.PORT; 

// Ordenar datos alfabéticamente por apellido de los autores

// Cargar los datos de autores y obras desde un archivo JSON
const datos = require("../data/ebooks.json");

// --------------------Ordenar datos alfabéticamente por apellido 
datos.sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido, "es-ES"));

// Configurar la carpeta "public" para servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public"))); // Hace accesibles los archivos estáticos desde "../public"

// Configurar la ruta raíz para devolver el archivo "index.html"
app.get("/", (req, res) => {
    res.sendFile(__dirname + "index.html"); // Devuelve el archivo index.html cuando se accede a "/"
});

// API para devolver la lista completa de autores ordenados alfabéticamente
app.get("/api/", (req, res) => {
    res.json(datos); // Responde con los datos en formato JSON
});

// Ruta para filtrar autores por el apellido proporcionado en la URL
// Ejemplo de uso: /api/apellido/Dumas
app.get("/api/apellido/:apellido", (req, res) => {
    const apellido = req.params.apellido; // Obtiene el apellido del parámetro de la URL
    const autores = datos.filter((autor) =>
        autor.autor_apellido.toLowerCase().includes(apellido.toLowerCase())
    ); // Filtra los autores que contienen el apellido buscado

    if (autores.length == 0) {
        return res.status(404).send("Autor no encontrado"); // Envía error 404 si no se encuentran autores
    }
    res.json(autores); // Devuelve la lista de autores coincidentes en JSON
});

// Ruta para obtener un autor específico por nombre y apellido
app.get("/api/nombre_apellido/:nombre/:apellido", (req, res) => {
    const nombre = req.params.nombre;                                    // Obtiene el nombre del parámetro de la URL
    const apellido = req.params.apellido; 
    const autor = datos.filter(
        (autor) =>
            autor.autor_nombre.toLowerCase() === nombre.toLowerCase() &&  // Filtra los autores que coinciden con el nombre y apellido exactos
            autor.autor_apellido.toLowerCase() === apellido.toLowerCase()
    ); 

    if (autor.length === 0) {
        return res.status(404).send("autor no encontrado");
    }
    // Devuelve el autor coincidente en JSON
    res.json(autor); 
});

// Ruta para obtener autores por nombre y primeras letras del apellido
app.get("/api/nombre/:nombre", (req, res) => {
    const nombre = req.params.nombre; 
    const apellido = req.query.apellido;

    if (apellido == undefined) {
        return res.status(404).send("Falta el parámetro apellido"); // Envía error si falta el parámetro apellido
    }

    const autores = datos.filter(
        (autor) =>
            autor.autor_nombre.toLowerCase() === nombre.toLowerCase() &&
            autor.autor_apellido                                                // Filtra los autores que coinciden con el nombre exacto y el inicio del apellido
                .toLowerCase()
                .startsWith(apellido.toLowerCase())
    );

     // Envía error 404 si no se encuentran autores
    if (autores.length == 0) {
        return res.status(404).send("Autor no encontrado");
    }
    res.json(autores); // Devuelve la lista de autores coincidentes en JSON
});

// Ruta para obtener las obras de un autor específico por nombre y apellido
app.get("/api/edicion/:year", (req, res) => {
    const year = req.params.year; // Obtiene el año del parámetro de la URL

    const editionYear = datos.flatMap((autor) =>
        autor.obras.filter((obra) => obra.edicion == year)
    ); 

    if (editionYear.length == 0) {
        return res.status(404).send(`Ninguna obra coincide con el año ${year}`); 
    }
    // Devuelve la lista de obras coincidentes en JSON
    res.json(editionYear); 
});

// Devuelve el archivo 404.html para rutas inexistentes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "../public", "404.html")); 
});


// Muestra un mensaje indicando que el servidor está escuchando
app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`); 
});
