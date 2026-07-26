/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* API.JS                                               */
/* Open Library + Gutendex + Gutenberg                  */
/* ===================================================== */


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const API_OPEN_LIBRARY =
    "https://openlibrary.org/search.json";

const API_GUTENDEX =
    "https://gutendex.com/books/";

const WORKER_NERE =
    "https://biblioteca-nere-worker.rjaresarias.workers.dev/";


/* ===================================================== */
/* BÚSQUEDA PRINCIPAL                                   */
/* ===================================================== */

async function buscarLibros() {

    const input =
        document.getElementById(
            "input-busqueda-resultados"
        );

    const estado =
        document.getElementById(
            "estado-busqueda"
        );

    const contenedor =
        document.getElementById(
            "resultados-busqueda"
        );


    if (!input || !contenedor) {
        return;
    }


    const texto =
        input.value.trim();


    if (!texto) {

        if (estado) {
            estado.textContent =
                "Escribe un título o autor.";
        }

        contenedor.innerHTML = "";

        return;
    }


    if (estado) {
        estado.textContent =
            "Buscando libros...";
    }

    contenedor.innerHTML = "";


    try {

        const filtro =
            window.estadoApp
                ?.filtroBusqueda
            || "todo";


        let libros = [];


        /* =========================
           GRATIS → GUTENDEX
        ========================== */

        if (filtro === "gratis") {

            libros =
                await buscarGutendex(
                    texto
                );

        }

        /* =========================
           GENERAL → OPEN LIBRARY
        ========================== */

        else {

            libros =
                await buscarOpenLibrary(
                    texto,
                    filtro
                );

        }


        pintarResultadosBusqueda(
            libros
        );


        if (estado) {

            if (!libros.length) {

                estado.textContent =
                    "No hemos encontrado libros.";

            }

            else {

                estado.textContent =
                    libros.length
                    +
                    (
                        libros.length === 1
                            ? " resultado encontrado"
                            : " resultados encontrados"
                    );

            }

        }

    }

    catch (error) {

        console.error(
            "Error buscando libros:",
            error
        );


        if (estado) {

            estado.textContent =
                "No se ha podido realizar la búsqueda.";

        }


        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>📚</span>

                <p>
                    Ha habido un problema al conectar con el catálogo.
                </p>

            </div>
        `;
    }
}


/* ===================================================== */
/* OPEN LIBRARY                                         */
/* ===================================================== */

async function buscarOpenLibrary(
    texto,
    filtro = "todo"
) {

    let parametro = "q";


    if (filtro === "titulo") {
        parametro = "title";
    }


    if (filtro === "autor") {
        parametro = "author";
    }


    const campos = [
        "key",
        "title",
        "author_name",
        "first_publish_year",
        "cover_i"
    ].join(",");


    const url =
        API_OPEN_LIBRARY
        +
        "?"
        +
        parametro
        +
        "="
        +
        encodeURIComponent(texto)
        +
        "&fields="
        +
        encodeURIComponent(campos)
        +
        "&limit=30";


    const respuesta =
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "Open Library: "
            +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    let libros =
        (datos.docs || [])
            .map(
                normalizarLibroOpenLibrary
            );


    /*
      Mejor orden para búsqueda general.
    */

    if (filtro === "todo") {

        const buscado =
            normalizarTextoAPI(
                texto
            );


        libros.sort(
            (a, b) =>
                puntuacionBusqueda(
                    b,
                    buscado
                )
                -
                puntuacionBusqueda(
                    a,
                    buscado
                )
        );

    }


    return libros.slice(
        0,
        20
    );
}


/* ===================================================== */
/* PUNTUAR RESULTADOS                                   */
/* ===================================================== */

function puntuacionBusqueda(
    libro,
    buscado
) {

    let puntos = 0;


    const titulo =
        normalizarTextoAPI(
            libro.titulo
        );


    const autor =
        normalizarTextoAPI(
            libro.autor
        );


    if (titulo === buscado) {
        puntos += 20;
    }


    if (
        titulo.includes(
            buscado
        )
    ) {
        puntos += 10;
    }


    if (
        autor.includes(
            buscado
        )
    ) {
        puntos += 12;
    }


    if (
        titulo.startsWith(
            buscado
        )
    ) {
        puntos += 5;
    }


    return puntos;
}


/* ===================================================== */
/* NORMALIZAR OPEN LIBRARY                              */
/* ===================================================== */

function normalizarLibroOpenLibrary(
    libro
) {

    const autor =
        libro.author_name
        &&
        libro.author_name.length

            ? libro.author_name[0]

            : "Autor desconocido";


    const portada =
        libro.cover_i

            ? (
                "https://covers.openlibrary.org/b/id/"
                +
                libro.cover_i
                +
                "-L.jpg"
            )

            : "";


    return {

        idInterno:
            libro.key
            ||
            (
                "openlibrary-"
                +
                normalizarTextoAPI(
                    libro.title
                    +
                    "-"
                    +
                    autor
                )
            ),

        key:
            libro.key || "",

        titulo:
            libro.title
            || "Sin título",

        autor:
            autor,

        año:
            libro.first_publish_year
            || "",

        portada:
            portada,

        gratis:
            false,

        tipo:
            "openlibrary",

        fuente:
            "Open Library",

        resena:
            ""
    };
}


/* ===================================================== */
/* GUTENDEX                                             */
/* ===================================================== */

async function buscarGutendex(
    texto
) {

    const respuesta =
        await fetch(
            API_GUTENDEX
            +
            "?search="
            +
            encodeURIComponent(
                texto
            )
        );


    if (!respuesta.ok) {

        throw new Error(
            "Gutendex: "
            +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    return (
        datos.results
        || []
    )
        .map(
            normalizarLibroGutendex
        )
        .slice(
            0,
            20
        );
}


/* ===================================================== */
/* NORMALIZAR GUTENDEX                                  */
/* ===================================================== */

function normalizarLibroGutendex(
    libro
) {

    const autor =
        libro.authors
        &&
        libro.authors.length

            ? libro.authors
                .map(
                    item =>
                        item.name
                )
                .join(", ")

            : "Autor desconocido";


    const portada =
        libro.formats
            ?.["image/jpeg"]
        || "";


    const urlLectura =
        obtenerFormatoLectura(
            libro.formats
        );


    let resumen = "";


    if (
        Array.isArray(
            libro.summaries
        )
        &&
        libro.summaries.length
    ) {

        resumen =
            libro.summaries[0];

    }


    return {

        idInterno:
            "gutenberg-"
            +
            libro.id,

        id:
            libro.id,

        gutenbergId:
            libro.id,

        titulo:
            libro.title
            || "Sin título",

        autor:
            autor,

        portada:
            portada,

        idiomas:
            libro.languages
            || [],

        idioma:
            (
                libro.languages
                &&
                libro.languages.length
            )
                ? libro.languages[0]
                : "",

        temas:
            libro.subjects
            || [],

        estanterias:
            libro.bookshelves
            || [],

        descargas:
            libro.download_count
            || 0,

        formatos:
            libro.formats
            || {},

        urlLectura:
            urlLectura,

        gratis:
            true,

        tipo:
            "gutenberg",

        fuente:
            "Project Gutenberg",

        resena:
            resumen
            ||
            crearResenaBasica(
                libro
            )
    };
}


/* ===================================================== */
/* RESULTADOS                                           */
/* ===================================================== */

function pintarResultadosBusqueda(
    libros
) {

    const contenedor =
        document.getElementById(
            "resultados-busqueda"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = "";


    if (!libros.length) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>🔎</span>

                <p>
                    No encontramos libros con esa búsqueda.
                </p>

            </div>
        `;

        return;
    }


    libros.forEach(
        libro => {

            contenedor.appendChild(
                crearTarjetaLibroAPI(
                    libro
                )
            );

        }
    );
}


/* ===================================================== */
/* TARJETA                                              */
/* ===================================================== */

function crearTarjetaLibroAPI(
    libro
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-libro";


    const progreso =
        typeof obtenerProgresoLibro
        === "function"

            ? obtenerProgresoLibro(
                libro
            )

            : 0;


    tarjeta.innerHTML = `

        <div class="tarjeta-libro-portada">

            ${
                libro.portada

                    ? `
                        <img
                            src="${escaparHTMLAPI(
                                libro.portada
                            )}"
                            alt="Portada de ${escaparHTMLAPI(
                                libro.titulo
                            )}"
                            loading="lazy"
                        >
                    `

                    : `
                        <div class="tarjeta-libro-sin-portada">
                            📚
                        </div>
                    `
            }

        </div>


        <h3>
            ${escaparHTMLAPI(
                libro.titulo
            )}
        </h3>


        <p class="autor">
            ${escaparHTMLAPI(
                libro.autor
            )}
        </p>


        ${
            libro.año

                ? `
                    <p class="autor">
                        ${escaparHTMLAPI(
                            libro.año
                        )}
                    </p>
                `

                : ""
        }


        ${
            libro.gratis

                ? `
                    <span class="etiqueta-gratis">
                        🟢 Gratis
                    </span>
                `

                : ""
        }


        ${
            progreso > 0

                ? `
                    <div class="marca-progreso">

                        <div
                            style="
                                width:
                                ${Math.min(
                                    100,
                                    progreso
                                )}%;
                            "
                        >
                        </div>

                    </div>

                    <p class="autor">
                        ${Math.round(
                            progreso
                        )}%
                    </p>
                `

                : ""
        }
    `;


    tarjeta.addEventListener(
        "click",
        () => {

            if (
                typeof abrirFichaLibro
                === "function"
            ) {

                abrirFichaLibro(
                    libro
                );

            }

        }
    );


    const imagen =
        tarjeta.querySelector(
            "img"
        );


    imagen
        ?.addEventListener(
            "error",
            () => {

                const zona =
                    tarjeta.querySelector(
                        ".tarjeta-libro-portada"
                    );


                if (!zona) {
                    return;
                }


                imagen.remove();


                const reemplazo =
                    document.createElement(
                        "div"
                    );


                reemplazo.className =
                    "tarjeta-libro-sin-portada";


                reemplazo.textContent =
                    "📚";


                zona.appendChild(
                    reemplazo
                );
            }
        );


    return tarjeta;
}


/* ===================================================== */
/* COMPLETAR FICHA                                      */
/* ===================================================== */

async function completarDatosLibro(
    libro
) {

    if (!libro) {
        return libro;
    }


    /*
      Gutenberg ya trae todos los datos importantes.
    */

    if (
        libro.tipo === "gutenberg"
        ||
        libro.gutenbergId
    ) {

        const completo =
            await obtenerLibroGutenberg(
                libro.gutenbergId
                || libro.id
            );


        return completo
            ? {
                ...libro,
                ...completo
            }
            : libro;
    }


    /*
      OPEN LIBRARY
    */

    let descripcion = "";


    if (
        libro.key
        &&
        libro.key.startsWith(
            "/works/"
        )
    ) {

        descripcion =
            await obtenerDescripcionOpenLibrary(
                libro.key
            );
    }


    /*
      Buscamos también si ese libro
      existe gratuitamente en Gutenberg.
    */

    const equivalente =
        await buscarEquivalenteGutenberg(
            libro.titulo,
            libro.autor
        );


    if (equivalente) {

        return {

            ...libro,

            ...equivalente,

            titulo:
                libro.titulo,

            autor:
                libro.autor,

            portada:
                libro.portada
                || equivalente.portada,

            año:
                libro.año
                || equivalente.año,

            resena:
                descripcion
                ||
                equivalente.resena,

            gratis:
                true,

            tipo:
                "gutenberg"
        };
    }


    return {

        ...libro,

        resena:
            descripcion
            ||
            libro.resena
            ||
            ""
    };
}


/* ===================================================== */
/* DESCRIPCIÓN OPEN LIBRARY                             */
/* ===================================================== */

async function obtenerDescripcionOpenLibrary(
    key
) {

    try {

        const respuesta =
            await fetch(
                "https://openlibrary.org"
                +
                key
                +
                ".json"
            );


        if (!respuesta.ok) {
            return "";
        }


        const datos =
            await respuesta.json();


        if (
            typeof datos.description
            === "string"
        ) {

            return datos.description;
        }


        if (
            datos.description
            &&
            typeof datos.description.value
            === "string"
        ) {

            return datos.description.value;
        }


        return "";

    }

    catch (error) {

        console.warn(
            "No se pudo obtener descripción:",
            error
        );

        return "";
    }
}


/* ===================================================== */
/* BUSCAR EQUIVALENTE GUTENBERG                         */
/* ===================================================== */

async function buscarEquivalenteGutenberg(
    titulo,
    autor
) {

    try {

        let resultados =
            await buscarGutendex(
                titulo
            );


        if (!resultados.length) {
            return null;
        }


        const tituloBuscado =
            normalizarTextoAPI(
                titulo
            );


        const autorBuscado =
            normalizarTextoAPI(
                autor
            );


        let mejor = null;

        let puntuacionMejor = 0;


        resultados.forEach(
            libro => {

                const tituloLibro =
                    normalizarTextoAPI(
                        libro.titulo
                    );


                const autorLibro =
                    normalizarTextoAPI(
                        libro.autor
                    );


                let puntos = 0;


                if (
                    tituloLibro ===
                    tituloBuscado
                ) {
                    puntos += 10;
                }


                if (
                    tituloLibro.includes(
                        tituloBuscado
                    )
                    ||
                    tituloBuscado.includes(
                        tituloLibro
                    )
                ) {
                    puntos += 6;
                }


                const partesAutor =
                    autorBuscado
                        .split(" ")
                        .filter(
                            parte =>
                                parte.length > 3
                        );


                partesAutor.forEach(
                    parte => {

                        if (
                            autorLibro.includes(
                                parte
                            )
                        ) {
                            puntos += 2;
                        }

                    }
                );


                if (
                    puntos >
                    puntuacionMejor
                ) {

                    puntuacionMejor =
                        puntos;

                    mejor =
                        libro;
                }

            }
        );


        return puntuacionMejor >= 6
            ? mejor
            : null;

    }

    catch (error) {

        console.warn(
            "No se pudo comprobar Gutenberg:",
            error
        );

        return null;
    }
}


/* ===================================================== */
/* LIBRO GUTENBERG POR ID                               */
/* ===================================================== */

async function obtenerLibroGutenberg(
    id
) {

    if (!id) {
        return null;
    }


    try {

        const respuesta =
            await fetch(
                API_GUTENDEX
                +
                "?ids="
                +
                encodeURIComponent(
                    id
                )
            );


        if (!respuesta.ok) {
            return null;
        }


        const datos =
            await respuesta.json();


        if (
            !datos.results
            ||
            !datos.results.length
        ) {

            return null;
        }


        return normalizarLibroGutendex(
            datos.results[0]
        );

    }

    catch (error) {

        console.error(
            "Error obteniendo libro Gutenberg:",
            error
        );

        return null;
    }
}


/* ===================================================== */
/* FORMATO DE LECTURA                                   */
/* ===================================================== */

function obtenerFormatoLectura(
    formatos
) {

    if (!formatos) {
        return "";
    }


    const prioridades = [

        "text/plain; charset=utf-8",

        "text/plain",

        "text/html; charset=utf-8",

        "text/html"

    ];


    for (
        const tipo of prioridades
    ) {

        const url =
            formatos[tipo];


        if (
            typeof url === "string"
            &&
            url.startsWith(
                "http"
            )
        ) {

            return convertirURLSegura(
                url
            );
        }
    }


    return "";
}


/* ===================================================== */
/* URL ESTÁNDAR GUTENBERG                               */
/* ===================================================== */

function crearURLTextoGutenberg(
    id
) {

    if (!id) {
        return "";
    }


    return (
        "https://www.gutenberg.org/cache/epub/"
        +
        id
        +
        "/pg"
        +
        id
        +
        ".txt"
    );
}


/* ===================================================== */
/* URL DE LECTURA                                       */
/* ===================================================== */

async function obtenerURLLecturaLibro(
    libro
) {

    if (!libro) {
        return "";
    }


    const id =
        libro.gutenbergId
        ||
        (
            libro.tipo === "gutenberg"
                ? libro.id
                : null
        );


    if (id) {

        return crearURLTextoGutenberg(
            id
        );
    }


    return libro.urlLectura
        ? convertirURLSegura(
            libro.urlLectura
        )
        : "";
}


/* ===================================================== */
/* DESCARGAR LIBRO                                      */
/* ===================================================== */

async function descargarLibroTexto(
    libro
) {

    const urlOriginal =
        await obtenerURLLecturaLibro(
            libro
        );


    if (!urlOriginal) {

        throw new Error(
            "No hay versión de lectura disponible."
        );
    }


    /*
      PRIMER INTENTO:
      ruta estándar que ya funcionó
      con Don Quijote.
    */

    const respuesta =
        await fetch(
            WORKER_NERE
            +
            "?url="
            +
            encodeURIComponent(
                urlOriginal
            )
        );


    if (respuesta.ok) {

        const contenido =
            await respuesta.text();


        if (
            contenido
            &&
            contenido.trim().length > 100
        ) {

            return {

                contenido:
                    contenido,

                tipo:
                    detectarTipoContenido(
                        contenido
                    ),

                urlOriginal:
                    urlOriginal
            };
        }
    }


    /*
      SEGUNDO INTENTO:
      URL suministrada por Gutendex.
    */

    if (libro.gutenbergId) {

        const completo =
            await obtenerLibroGutenberg(
                libro.gutenbergId
            );


        if (
            completo
            &&
            completo.urlLectura
            &&
            completo.urlLectura !==
            urlOriginal
        ) {

            const respuesta2 =
                await fetch(
                    WORKER_NERE
                    +
                    "?url="
                    +
                    encodeURIComponent(
                        convertirURLSegura(
                            completo.urlLectura
                        )
                    )
                );


            if (respuesta2.ok) {

                const contenido2 =
                    await respuesta2.text();


                if (
                    contenido2
                    &&
                    contenido2.trim()
                        .length > 100
                ) {

                    return {

                        contenido:
                            contenido2,

                        tipo:
                            detectarTipoContenido(
                                contenido2
                            ),

                        urlOriginal:
                            completo.urlLectura
                    };
                }
            }
        }
    }


    throw new Error(
        "No se ha podido descargar este libro."
    );
}


/* ===================================================== */
/* PREPARAR CONTENIDO                                   */
/* ===================================================== */

function prepararContenidoLibro(
    descarga
) {

    if (
        !descarga
        ||
        !descarga.contenido
    ) {

        return "";
    }


    if (
        descarga.tipo ===
        "html"
    ) {

        return extraerContenidoHTMLLibro(
            descarga.contenido
        );
    }


    return convertirTextoPlanoHTML(
        descarga.contenido
    );
}


/* ===================================================== */
/* DETECTAR HTML                                        */
/* ===================================================== */

function detectarTipoContenido(
    contenido
) {

    const inicio =
        String(contenido)
            .trim()
            .slice(
                0,
                1000
            )
            .toLowerCase();


    if (
        inicio.includes(
            "<!doctype html"
        )
        ||
        inicio.includes(
            "<html"
        )
        ||
        inicio.includes(
            "<body"
        )
    ) {

        return "html";
    }


    return "texto";
}


/* ===================================================== */
/* EXTRAER HTML                                         */
/* ===================================================== */

function extraerContenidoHTMLLibro(
    html
) {

    try {

        const parser =
            new DOMParser();


        const documento =
            parser.parseFromString(
                html,
                "text/html"
            );


        documento
            .querySelectorAll(
                "script,style,noscript,iframe,form"
            )
            .forEach(
                nodo =>
                    nodo.remove()
            );


        if (!documento.body) {

            return convertirTextoPlanoHTML(
                html
            );
        }


        return documento.body.innerHTML;

    }

    catch (error) {

        return convertirTextoPlanoHTML(
            html
        );
    }
}


/* ===================================================== */
/* TEXTO PLANO → HTML                                   */
/* ===================================================== */

function convertirTextoPlanoHTML(
    texto
) {

    const bloques =
        String(texto || "")
            .replace(
                /\r/g,
                ""
            )
            .split(
                /\n\s*\n/
            )
            .map(
                bloque =>
                    bloque.trim()
            )
            .filter(
                Boolean
            );


    return bloques
        .map(
            bloque => {

                const limpio =
                    escaparHTMLAPI(
                        bloque
                    )
                    .replace(
                        /\n/g,
                        " "
                    );


                if (
                    bloque.length < 120
                    &&
                    bloque ===
                    bloque.toUpperCase()
                ) {

                    return (
                        "<h3>"
                        +
                        limpio
                        +
                        "</h3>"
                    );
                }


                return (
                    "<p>"
                    +
                    limpio
                    +
                    "</p>"
                );
            }
        )
        .join("");
}


/* ===================================================== */
/* RESEÑA BÁSICA                                        */
/* ===================================================== */

function crearResenaBasica(
    libro
) {

    const titulo =
        libro.title
        || "Este libro";


    if (
        libro.subjects
        &&
        libro.subjects.length
    ) {

        return (
            titulo
            +
            " es una obra disponible gratuitamente en Project Gutenberg."
        );
    }


    return (
        titulo
        +
        " forma parte del catálogo gratuito de Project Gutenberg."
    );
}


/* ===================================================== */
/* HTTPS                                                */
/* ===================================================== */

function convertirURLSegura(
    url
) {

    return String(url || "")
        .replace(
            /^http:\/\//i,
            "https://"
        );
}


/* ===================================================== */
/* NORMALIZAR TEXTO                                     */
/* ===================================================== */

function normalizarTextoAPI(
    texto
) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


/* ===================================================== */
/* HTML SEGURO                                          */
/* ===================================================== */

function escaparHTMLAPI(
    texto
) {

    return String(texto || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


console.log(
    "📚 API de La Biblioteca de Nere cargada correctamente"
);