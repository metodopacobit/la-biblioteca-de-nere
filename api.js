/* =====================================================
   LA BIBLIOTECA DE NERE
   API.JS · v1.2
   Open Library + Gutenberg + idiomas
===================================================== */

const API_OPEN_LIBRARY =
    "https://openlibrary.org/search.json";

const API_GUTENDEX =
    "https://gutendex.com/books/";

const WORKER_NERE =
    "https://biblioteca-nere-worker.rjaresarias.workers.dev/";


/* =====================================================
   IDIOMA PREDETERMINADO
===================================================== */

window.idiomaBusquedaNere =
    "es";


const IDIOMAS_API_OPEN_LIBRARY = {

    es: "spa",
    en: "eng",
    fr: "fre",
    de: "ger",
    it: "ita",
    pt: "por"

};


/* =====================================================
   CAMBIAR IDIOMA
===================================================== */

function cambiarIdiomaBusqueda(
    idioma
) {

    const permitidos = [
        "es",
        "en",
        "fr",
        "de",
        "it",
        "pt",
        "todos"
    ];


    window.idiomaBusquedaNere =
        permitidos.includes(idioma)
            ? idioma
            : "es";


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

        return;

    }


    const texto =
        input.value.trim();


    if (!texto) {

        if (estado) {

            estado.textContent =
                "Escribe un título o autor.";

        }

        resultados.innerHTML =
            "";

        return;

    }


    if (estado) {

        estado.textContent =
            "🔎 Buscando...";

    }


    resultados.innerHTML =
        "";


    try {

        const filtro =
            window.estadoApp
                ? window.estadoApp.filtroBusqueda
                : "todo";


        let libros = [];


        if (
            filtro === "gratis"
        ) {

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
                    window.idiomaBusquedaNere,
                    true
                );

        }


        pintarResultadosBusqueda(
            libros
        );


        if (estado) {

            estado.textContent =
                libros.length

                    ? (
                        libros.length +
                        " resultados encontrados"
                    )

                    : "No se encontraron libros.";

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
    filtro = "todo",
    idioma = "es",
    exigirRelevancia = true,
    limite = 20
) {

    const limpio =
        limpiarConsultaOpenLibrary(
            texto
        );


    let consulta = "";


    if (
        filtro === "titulo"
    ) {

        consulta =
            'title:"' +
            limpio +
            '"';

    }

    else if (
        filtro === "autor"
    ) {

        consulta =
            'author:"' +
            limpio +
            '"';

    }

    else {

        consulta =
            limpio;

    }


    const codigoIdioma =
        idioma !== "todos"
            ? IDIOMAS_API_OPEN_LIBRARY[
                idioma
            ]
            : null;


    /*
       language:spa EXCLUYE obras
       sin edición española.
    */

    if (codigoIdioma) {

        consulta +=
            " language:" +
            codigoIdioma;

    }


    const parametros =
        new URLSearchParams();


    parametros.set(
        "q",
        consulta
    );


    parametros.set(
        "limit",
        String(
            Math.max(
                50,
                Math.min(
                    Number(limite) || 20,
                    100
                )
            )
        )
    );


    /*
       Pedimos obra + edición recomendada.
    */

    parametros.set(
        "fields",
        [
            "key",
            "title",
            "author_name",
            "first_publish_year",
            "cover_i",
            "language",
            "subject",
            "subject_key",
            "editions",
            "editions.key",
            "editions.title",
            "editions.language",
            "editions.cover_i",
            "editions.publish_date"
        ].join(",")
    );


    /*
       Hace que Open Library priorice
       la edición del idioma elegido.
    */

    if (
        idioma !== "todos"
    ) {

        parametros.set(
            "lang",
            idioma
        );

    }


    const url =
        API_OPEN_LIBRARY +
        "?" +
        parametros.toString();


    console.log(
        "OPEN LIBRARY:",
        url
    );


    const respuesta =
        await fetch(
            url
        );


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
            libro =>
                normalizarOpenLibrary(
                    libro,
                    codigoIdioma
                )
        )

        .filter(Boolean);


    /*
       En búsquedas escritas por el usuario
       eliminamos resultados absurdos.
    */

    if (
        exigirRelevancia
    ) {

        const buscado =
            normalizarTextoAPI(
                texto
            );


        libros =
            libros

            .map(
                libro => ({

                    libro,

                    puntos:
                        calcularPuntosBusqueda(
                            libro,
                            buscado,
                            filtro
                        )

                })
            )

            .filter(
                resultado =>
                    resultado.puntos >
                    0
            )

            .sort(
                (a, b) =>
                    b.puntos -
                    a.puntos
            )

            .map(
                resultado =>
                    resultado.libro
            );

    }


    libros =
        eliminarLibrosDuplicadosAPI(
            libros
        );


    return libros.slice(
        0,
        Math.max(
            1,
            Number(limite) || 20
        )
    );

}


/* =====================================================
   NORMALIZAR OPEN LIBRARY
===================================================== */

function normalizarOpenLibrary(
    libro,
    codigoIdioma = null
) {

    const ediciones =
        libro.editions &&
        Array.isArray(
            libro.editions.docs
        )

            ? libro.editions.docs

            : [];


    /*
       No damos por válida la primera edición.
       Buscamos expresamente una edición en el
       idioma elegido para no mezclar títulos.
    */

    const edicion =
        codigoIdioma

            ? (
                ediciones.find(
                    candidata =>
                        edicionIncluyeIdiomaAPI(
                            candidata,
                            codigoIdioma
                        )
                ) || null
            )

            : (
                ediciones.length
                    ? ediciones[0]
                    : null
            );


    /*
       Si hemos pedido un idioma concreto
       y Open Library no devuelve edición
       de ese idioma, no mostramos esa obra.
    */

    if (
        codigoIdioma &&
        !edicion
    ) {

        return null;

    }


    const autor =
        libro.author_name &&
        libro.author_name.length

            ? libro.author_name[0]

            : "Autor desconocido";


    const titulo =
        edicion &&
        edicion.title

            ? edicion.title

            : (
                libro.title ||
                "Sin título"
            );


    const coverId =
        edicion &&
        edicion.cover_i

            ? edicion.cover_i

            : libro.cover_i;


    const portada =
        coverId

            ? (
                "https://covers.openlibrary.org/b/id/" +
                coverId +
                "-M.jpg"
            )

            : "";


    return {

        idInterno:
            (
                edicion &&
                edicion.key
            )
                ? edicion.key
                : libro.key,

        key:
            libro.key || "",

        editionKey:
            edicion
                ? edicion.key || ""
                : "",

        titulo:
            titulo,

        autor:
            autor,

        año:
            extraerAnoAPI(
                edicion
                    ? edicion.publish_date
                    : ""
            )
            ||
            libro.first_publish_year
            ||
            "",

        portada:
            portada,

        idiomas:
            edicion
                ? edicion.language || []
                : libro.language || [],

        temas:
            [
                ...(Array.isArray(libro.subject)
                    ? libro.subject
                    : []),
                ...(Array.isArray(libro.subject_key)
                    ? libro.subject_key
                    : [])
            ],

        estanterias:
            [],

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
   IDIOMA DE EDICIÓN
===================================================== */

function edicionIncluyeIdiomaAPI(
    edicion,
    codigoIdioma
) {

    if (
        !edicion ||
        !Array.isArray(
            edicion.language
        )
    ) {

        return false;

    }


    return edicion.language
        .map(
            codigo =>
                String(codigo)
                .toLowerCase()
                .trim()
        )
        .includes(
            String(codigoIdioma)
            .toLowerCase()
            .trim()
        );

}


/* =====================================================
   ELIMINAR DUPLICADOS
===================================================== */

function eliminarLibrosDuplicadosAPI(
    libros
) {

    const resultado =
        [];


    const usados =
        new Set();


    (libros || []).forEach(
        function(libro) {

            if (!libro) {

                return;

            }


            const clave =
                [
                    normalizarTextoAPI(
                        libro.titulo
                    )
                    .replace(
                        /[^a-z0-9]+/g,
                        " "
                    )
                    .trim(),

                    normalizarTextoAPI(
                        libro.autor
                    )
                    .replace(
                        /[^a-z0-9]+/g,
                        " "
                    )
                    .trim()
                ]
                .join("|");


            if (
                usados.has(
                    clave
                )
            ) {

                return;

            }


            usados.add(
                clave
            );

            resultado.push(
                libro
            );

        }
    );


    return resultado;

}


/* =====================================================
   RELEVANCIA
===================================================== */

function calcularPuntosBusqueda(
    libro,
    buscado,
    filtro
) {

    let puntos =
        0;


    const titulo =
        normalizarTextoAPI(
            libro.titulo
        );


    const autor =
        normalizarTextoAPI(
            libro.autor
        );


    if (
        filtro === "autor"
    ) {

        if (
            autor === buscado
        ) {

            puntos += 200;

        }

        if (
            autor.includes(
                buscado
            )
        ) {

            puntos += 120;

        }

    }


    else if (
        filtro === "titulo"
    ) {

        if (
            titulo === buscado
        ) {

            puntos += 200;

        }

        if (
            titulo.includes(
                buscado
            )
        ) {

            puntos += 120;

        }

    }


    else {

        if (
            titulo === buscado
        ) {

            puntos += 200;

        }


        if (
            autor === buscado
        ) {

            puntos += 200;

        }


        if (
            titulo.includes(
                buscado
            )
        ) {

            puntos += 100;

        }


        if (
            autor.includes(
                buscado
            )
        ) {

            puntos += 140;

        }


        const palabras =
            buscado
            .split(/\s+/)
            .filter(
                palabra =>
                    palabra.length >
                    2
            );


        palabras.forEach(
            palabra => {

                if (
                    titulo.includes(
                        palabra
                    )
                ) {

                    puntos += 8;

                }


                if (
                    autor.includes(
                        palabra
                    )
                ) {

                    puntos += 15;

                }

            }
        );

    }


    return puntos;

}


/* =====================================================
   GUTENDEX
===================================================== */

async function buscarLibrosGratis(
    texto,
    idioma = "es",
    limite = 20
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


    const respuesta =
        await fetch(
            url
        );


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


    if (
        idioma &&
        idioma !== "todos"
    ) {

        libros =
            libros.filter(
                libro =>
                    Array.isArray(
                        libro.idiomas
                    )
                    &&
                    libro.idiomas.includes(
                        idioma
                    )
            );

    }


    libros =
        eliminarLibrosDuplicadosAPI(
            libros
        );


    return libros.slice(
        0,
        Math.max(
            1,
            Number(limite) || 20
        )
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
                autor =>
                    autor.name
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
            formatos[
                "image/jpeg"
            ] || "",

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
   RESEÑA
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
        " forma parte del catálogo gratuito de Project Gutenberg."
    );

}


/* =====================================================
   RESULTADOS
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


    contenedor.innerHTML =
        "";


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
        libro => {

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


    const portadaHTML =
        libro.portada

            ? `
                <img
                    src="${escaparHTMLAPI(
                        libro.portada
                    )}"
                    alt="Portada"
                    loading="lazy"
                >
            `

            : `
                <div class="tarjeta-libro-sin-portada">
                    📚
                </div>
            `;


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
        libro.tipo ===
        "gutenberg" ||
        libro.gutenbergId
    ) {

        return libro;

    }


    let descripcion =
        "";


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
            libro => {

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
                    parte =>
                        parte.length >
                        3
                )
                .forEach(
                    parte => {

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
   LECTOR GUTENBERG
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
        contenido.length <
        100
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
        inicio.includes("<html") ||
        inicio.includes("<body") ||
        inicio.includes("<!doctype")
    ) {

        return "html";

    }


    return "texto";

}


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
            elemento =>
                elemento.remove()
        );


    return documento.body
        ? documento.body.innerHTML
        : html;

}


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
        bloque =>
            bloque.trim()
    )

    .filter(Boolean)

    .map(
        bloque => {

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
   UTILIDADES
===================================================== */

function extraerAnoAPI(
    texto
) {

    const coincidencia =
        String(
            texto || ""
        )
        .match(
            /\b(1[0-9]{3}|20[0-9]{2})\b/
        );


    return coincidencia
        ? coincidencia[1]
        : "";

}


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


function escaparHTMLAPI(
    texto
) {

    return String(
        texto || ""
    )

    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


console.log(
    "✅ API Nere v1.2 · Idioma estricto y duplicados corregidos"
);
