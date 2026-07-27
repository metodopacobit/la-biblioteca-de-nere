/* =====================================================
   LA BIBLIOTECA DE NERE
   API.JS
   Open Library + Project Gutenberg + Idiomas
===================================================== */

const API_OPEN_LIBRARY = "https://openlibrary.org/search.json";
const API_GUTENDEX = "https://gutendex.com/books/";

const WORKER_NERE =
    "https://biblioteca-nere-worker.rjaresarias.workers.dev/";


/* =====================================================
   ESTADO DE IDIOMA
===================================================== */

window.idiomaBusquedaNere = "todos";


/* =====================================================
   IDIOMAS OPEN LIBRARY
===================================================== */

const IDIOMAS_API_OPEN_LIBRARY = {

    es: "spa",
    en: "eng",
    fr: "fre",
    de: "ger",
    it: "ita",
    pt: "por"

};


/* =====================================================
   CAMBIAR IDIOMA BUSCADOR
===================================================== */

function cambiarIdiomaBusqueda(idioma) {

    const permitidos = [
        "todos",
        "es",
        "en",
        "fr",
        "de",
        "it",
        "pt"
    ];


    if (!permitidos.includes(idioma)) {

        idioma = "todos";

    }


    window.idiomaBusquedaNere =
        idioma;


    const input =
        document.getElementById(
            "input-busqueda-resultados"
        );


    if (
        input &&
        input.value.trim()
    ) {

        buscarLibros();

    }

}


/* =====================================================
   BUSCADOR GENERAL
===================================================== */

async function buscarLibros() {

    const input =
        document.getElementById(
            "input-busqueda-resultados"
        );

    const estado =
        document.getElementById(
            "estado-busqueda"
        );

    const resultados =
        document.getElementById(
            "resultados-busqueda"
        );


    if (!input || !resultados) {

        console.error(
            "No encuentro los elementos del buscador."
        );

        return;

    }


    const texto =
        input.value.trim();


    if (!texto) {

        if (estado) {

            estado.textContent =
                "Escribe un título o autor.";

        }

        resultados.innerHTML = "";

        return;

    }


    if (estado) {

        estado.textContent =
            "🔎 Buscando...";

    }


    resultados.innerHTML = "";


    try {

        const filtro =
            window.estadoApp
                ? window.estadoApp.filtroBusqueda
                : "todo";


        let libros = [];


        if (filtro === "gratis") {

            libros =
                await buscarLibrosGratis(
                    texto,
                    window.idiomaBusquedaNere
                );

        }

        else {

            libros =
                await buscarOpenLibrarySimple(
                    texto,
                    filtro,
                    window.idiomaBusquedaNere
                );

        }


        pintarResultadosBusqueda(
            libros
        );


        if (!estado) {

            return;

        }


        if (!libros.length) {

            estado.textContent =
                "No se encontraron libros.";

        }

        else {

            estado.textContent =
                libros.length +
                " resultados encontrados";

        }

    }

    catch (error) {

        console.error(
            "ERROR BUSCADOR:",
            error
        );


        if (estado) {

            estado.textContent =
                "❌ No se ha podido realizar la búsqueda.";

        }


        resultados.innerHTML = `

            <div class="estado-vacio">

                <span>📚</span>

                <p>
                    No se ha podido conectar con el catálogo.
                </p>

            </div>
        `;

    }

}


/* =====================================================
   OPEN LIBRARY
===================================================== */

async function buscarOpenLibrarySimple(
    texto,
    filtro,
    idioma = "todos"
) {

    let consulta = "";


    if (filtro === "titulo") {

        consulta =
            'title:"' +
            limpiarConsultaOpenLibrary(texto) +
            '"';

    }

    else if (filtro === "autor") {

        consulta =
            'author:"' +
            limpiarConsultaOpenLibrary(texto) +
            '"';

    }

    else {

        consulta =
            limpiarConsultaOpenLibrary(texto);

    }


    let codigoIdioma = null;


    if (
        idioma &&
        idioma !== "todos"
    ) {

        codigoIdioma =
            IDIOMAS_API_OPEN_LIBRARY[
                idioma
            ];


        if (codigoIdioma) {

            consulta +=
                " language:" +
                codigoIdioma;

        }

    }


    const url =
        API_OPEN_LIBRARY +
        "?q=" +
        encodeURIComponent(
            consulta
        ) +
        "&limit=50";


    console.log(
        "Buscando en Open Library:",
        url
    );


    const respuesta =
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "Open Library: " +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    let libros =
        (datos.docs || [])
        .map(
            normalizarOpenLibrary
        );


    /* =================================================
       FILTRO ESTRICTO POR IDIOMA
    ================================================= */

    if (codigoIdioma) {

        libros =
            libros.filter(
                function(libro) {

                    return (
                        Array.isArray(
                            libro.idiomas
                        )
                        &&
                        libro.idiomas.includes(
                            codigoIdioma
                        )
                    );

                }
            );

    }


    /* =================================================
       ORDENAR RESULTADOS
    ================================================= */

    if (filtro === "todo") {

        const buscado =
            normalizarTextoAPI(
                texto
            );


        libros.sort(
            function(a, b) {

                return (
                    calcularPuntos(
                        b,
                        buscado
                    )
                    -
                    calcularPuntos(
                        a,
                        buscado
                    )
                );

            }
        );

    }


    return libros.slice(
        0,
        20
    );

}


/* =====================================================
   LIMPIAR CONSULTA OPEN LIBRARY
===================================================== */

function limpiarConsultaOpenLibrary(
    texto
) {

    return String(
        texto || ""
    )
    .replace(
        /"/g,
        ""
    )
    .trim();

}


/* =====================================================
   NORMALIZAR OPEN LIBRARY
===================================================== */

function normalizarOpenLibrary(
    libro
) {

    const autor =
        libro.author_name &&
        libro.author_name.length
            ? libro.author_name[0]
            : "Autor desconocido";


    const portada =
        libro.cover_i
            ? (
                "https://covers.openlibrary.org/b/id/" +
                libro.cover_i +
                "-M.jpg"
            )
            : "";


    return {

        idInterno:
            libro.key ||
            (
                "ol-" +
                normalizarTextoAPI(
                    (libro.title || "") +
                    autor
                )
            ),

        key:
            libro.key || "",

        titulo:
            libro.title ||
            "Sin título",

        autor:
            autor,

        año:
            libro.first_publish_year ||
            "",

        portada:
            portada,

        idiomas:
            Array.isArray(
                libro.language
            )
                ? libro.language
                : [],

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


/* =====================================================
   PUNTUACIÓN
===================================================== */

function calcularPuntos(
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


    return puntos;

}


/* =====================================================
   GUTENDEX / GRATIS
===================================================== */

async function buscarLibrosGratis(
    texto,
    idioma = "todos"
) {

    let url =
        API_GUTENDEX +
        "?search=" +
        encodeURIComponent(
            texto
        );


    if (
        idioma &&
        idioma !== "todos"
    ) {

        url +=
            "&languages=" +
            encodeURIComponent(
                idioma
            );

    }


    console.log(
        "Buscando gratis:",
        url
    );


    const respuesta =
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "Gutendex: " +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    let libros =
        (datos.results || [])
        .map(
            normalizarGutendex
        );


    /* FILTRO EXTRA DE SEGURIDAD */

    if (
        idioma &&
        idioma !== "todos"
    ) {

        libros =
            libros.filter(
                function(libro) {

                    return (
                        Array.isArray(
                            libro.idiomas
                        )
                        &&
                        libro.idiomas.includes(
                            idioma
                        )
                    );

                }
            );

    }


    return libros.slice(
        0,
        20
    );

}


/* =====================================================
   NORMALIZAR GUTENDEX
===================================================== */

function normalizarGutendex(
    libro
) {

    let autor =
        "Autor desconocido";


    if (
        libro.authors &&
        libro.authors.length
    ) {

        autor =
            libro.authors
            .map(
                function(a) {

                    return a.name;

                }
            )
            .join(", ");

    }


    const formatos =
        libro.formats || {};


    return {

        idInterno:
            "gutenberg-" +
            libro.id,

        id:
            libro.id,

        gutenbergId:
            libro.id,

        titulo:
            libro.title ||
            "Sin título",

        autor:
            autor,

        portada:
            formatos["image/jpeg"] ||
            "",

        idiomas:
            libro.languages || [],

        temas:
            libro.subjects || [],

        estanterias:
            libro.bookshelves || [],

        descargas:
            libro.download_count || 0,

        formatos:
            formatos,

        gratis:
            true,

        tipo:
            "gutenberg",

        fuente:
            "Project Gutenberg",

        resena:
            crearResenaGutenberg(
                libro
            )

    };

}


/* =====================================================
   RESEÑA GUTENBERG
===================================================== */

function crearResenaGutenberg(
    libro
) {

    if (
        libro.summaries &&
        libro.summaries.length
    ) {

        return libro.summaries[0];

    }


    return (
        (libro.title || "Este libro") +
        " forma parte del catálogo gratuito " +
        "de Project Gutenberg."
    );

}


/* =====================================================
   PINTAR RESULTADOS
===================================================== */

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
                    No encontramos resultados.
                </p>

            </div>
        `;

        return;

    }


    libros.forEach(
        function(libro) {

            contenedor.appendChild(
                crearTarjetaLibroAPI(
                    libro
                )
            );

        }
    );

}


/* =====================================================
   TARJETA
===================================================== */

function crearTarjetaLibroAPI(
    libro
) {

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-libro";


    let portadaHTML;


    if (libro.portada) {

        portadaHTML = `

            <img
                src="${escaparHTMLAPI(
                    libro.portada
                )}"
                alt="Portada"
                loading="lazy"
            >
        `;

    }

    else {

        portadaHTML = `

            <div class="tarjeta-libro-sin-portada">
                📚
            </div>
        `;

    }


    tarjeta.innerHTML = `

        <div class="tarjeta-libro-portada">
            ${portadaHTML}
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
    `;


    tarjeta.addEventListener(
        "click",
        function() {

            if (
                typeof abrirFichaLibro ===
                "function"
            ) {

                abrirFichaLibro(
                    libro
                );

            }

        }
    );


    return tarjeta;

}


/* =====================================================
   COMPLETAR FICHA
===================================================== */

async function completarDatosLibro(
    libro
) {

    if (!libro) {

        return libro;

    }


    if (
        libro.tipo === "gutenberg" ||
        libro.gutenbergId
    ) {

        return libro;

    }


    let descripcion = "";


    if (
        libro.key &&
        libro.key.startsWith(
            "/works/"
        )
    ) {

        descripcion =
            await obtenerDescripcionOpenLibrary(
                libro.key
            );

    }


    const gratis =
        await buscarCoincidenciaGutenberg(
            libro.titulo,
            libro.autor
        );


    if (gratis) {

        return {

            ...libro,

            gutenbergId:
                gratis.gutenbergId,

            formatos:
                gratis.formatos,

            gratis:
                true,

            tipo:
                "gutenberg",

            resena:
                descripcion ||
                gratis.resena ||
                libro.resena

        };

    }


    return {

        ...libro,

        resena:
            descripcion ||
            libro.resena ||
            ""

    };

}


/* =====================================================
   DESCRIPCIÓN OPEN LIBRARY
===================================================== */

async function obtenerDescripcionOpenLibrary(
    key
) {

    try {

        const respuesta =
            await fetch(
                "https://openlibrary.org" +
                key +
                ".json"
            );


        if (!respuesta.ok) {

            return "";

        }


        const datos =
            await respuesta.json();


        if (
            typeof datos.description ===
            "string"
        ) {

            return datos.description;

        }


        if (
            datos.description &&
            typeof datos.description.value ===
            "string"
        ) {

            return datos.description.value;

        }

    }

    catch (error) {

        console.warn(
            "No hay descripción:",
            error
        );

    }


    return "";

}


/* =====================================================
   BUSCAR EQUIVALENTE GRATUITO
===================================================== */

async function buscarCoincidenciaGutenberg(
    titulo,
    autor
) {

    try {

        const resultados =
            await buscarLibrosGratis(
                titulo,
                "todos"
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


        let mejor =
            null;

        let mejorPuntos =
            0;


        resultados.forEach(
            function(libro) {

                let puntos =
                    0;


                const t =
                    normalizarTextoAPI(
                        libro.titulo
                    );


                const a =
                    normalizarTextoAPI(
                        libro.autor
                    );


                if (
                    t === tituloBuscado
                ) {

                    puntos += 10;

                }


                if (
                    t.includes(
                        tituloBuscado
                    ) ||
                    tituloBuscado.includes(
                        t
                    )
                ) {

                    puntos += 6;

                }


                autorBuscado
                    .split(" ")
                    .filter(
                        function(parte) {

                            return (
                                parte.length >
                                3
                            );

                        }
                    )
                    .forEach(
                        function(parte) {

                            if (
                                a.includes(
                                    parte
                                )
                            ) {

                                puntos += 2;

                            }

                        }
                    );


                if (
                    puntos >
                    mejorPuntos
                ) {

                    mejorPuntos =
                        puntos;

                    mejor =
                        libro;

                }

            }
        );


        return (
            mejorPuntos >= 6
                ? mejor
                : null
        );

    }

    catch (error) {

        return null;

    }

}


/* =====================================================
   URL GUTENBERG
===================================================== */

function crearURLTextoGutenberg(
    id
) {

    return (
        "https://www.gutenberg.org/cache/epub/" +
        id +
        "/pg" +
        id +
        ".txt"
    );

}


/* =====================================================
   DESCARGA PARA LECTOR
===================================================== */

async function descargarLibroTexto(
    libro
) {

    const id =
        libro.gutenbergId ||
        libro.id;


    if (!id) {

        throw new Error(
            "Este libro no tiene versión gratuita."
        );

    }


    const urlLibro =
        crearURLTextoGutenberg(
            id
        );


    const urlWorker =
        WORKER_NERE +
        "?url=" +
        encodeURIComponent(
            urlLibro
        );


    const respuesta =
        await fetch(
            urlWorker
        );


    if (!respuesta.ok) {

        throw new Error(
            "No se ha podido descargar el libro."
        );

    }


    const contenido =
        await respuesta.text();


    if (
        !contenido ||
        contenido.length < 100
    ) {

        throw new Error(
            "El libro recibido está vacío."
        );

    }


    return {

        contenido:
            contenido,

        tipo:
            detectarTipoContenido(
                contenido
            ),

        urlOriginal:
            urlLibro

    };

}


/* =====================================================
   PREPARAR PARA LECTOR
===================================================== */

function prepararContenidoLibro(
    descarga
) {

    if (!descarga) {

        return "";

    }


    if (
        descarga.tipo ===
        "html"
    ) {

        return limpiarHTMLLibro(
            descarga.contenido
        );

    }


    return textoPlanoAHTML(
        descarga.contenido
    );

}


/* =====================================================
   DETECTAR TIPO
===================================================== */

function detectarTipoContenido(
    contenido
) {

    const inicio =
        String(
            contenido || ""
        )
        .slice(
            0,
            1000
        )
        .toLowerCase();


    if (
        inicio.includes(
            "<html"
        ) ||
        inicio.includes(
            "<body"
        ) ||
        inicio.includes(
            "<!doctype"
        )
    ) {

        return "html";

    }


    return "texto";

}


/* =====================================================
   LIMPIAR HTML
===================================================== */

function limpiarHTMLLibro(
    html
) {

    const parser =
        new DOMParser();


    const documento =
        parser.parseFromString(
            html,
            "text/html"
        );


    documento
        .querySelectorAll(
            "script,style,iframe,form"
        )
        .forEach(
            function(elemento) {

                elemento.remove();

            }
        );


    return documento.body
        ? documento.body.innerHTML
        : html;

}


/* =====================================================
   TEXTO → HTML
===================================================== */

function textoPlanoAHTML(
    texto
) {

    return String(
        texto || ""
    )

    .replace(
        /\r/g,
        ""
    )

    .split(
        /\n\s*\n/
    )

    .map(
        function(bloque) {

            return bloque.trim();

        }
    )

    .filter(Boolean)

    .map(
        function(bloque) {

            const seguro =
                escaparHTMLAPI(
                    bloque
                )
                .replace(
                    /\n/g,
                    " "
                );


            if (
                bloque.length <
                100 &&
                bloque ===
                bloque.toUpperCase()
            ) {

                return (
                    "<h3>" +
                    seguro +
                    "</h3>"
                );

            }


            return (
                "<p>" +
                seguro +
                "</p>"
            );

        }
    )

    .join("");

}


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizarTextoAPI(
    texto
) {

    return String(
        texto || ""
    )

    .normalize(
        "NFD"
    )

    .replace(
        /[\u0300-\u036f]/g,
        ""
    )

    .toLowerCase()

    .trim();

}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparHTMLAPI(
    texto
) {

    return String(
        texto || ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


console.log(
    "✅ API Nere + filtro estricto de idiomas cargada"
);