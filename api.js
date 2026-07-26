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

        estado.textContent =
            "Escribe un título o autor.";

        contenedor.innerHTML =
            "";

        return;

    }


    estado.textContent =
        "Buscando libros...";


    contenedor.innerHTML =
        "";


    try {

        const filtro =
            window.estadoApp
                ?.filtroBusqueda
            ||
            "todo";


        const libros =
            await buscarOpenLibrary(
                texto,
                filtro
            );


        pintarResultadosBusqueda(
            libros
        );


        if (
            libros.length === 0
        ) {

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

    catch (error) {

        console.error(
            "Error en la búsqueda:",
            error
        );


        estado.textContent =
            "No se ha podido realizar la búsqueda.";


        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    📚
                </span>

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

    let parametro =
        "q";


    if (
        filtro === "titulo"
    ) {

        parametro =
            "title";

    }


    if (
        filtro === "autor"
    ) {

        parametro =
            "author";

    }


    const campos = [

        "key",

        "title",

        "author_name",

        "first_publish_year",

        "cover_i",

        "subject",

        "language"

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
        encodeURIComponent(
            texto
        )
        +
        "&fields="
        +
        encodeURIComponent(
            campos
        )
        +
        "&limit=30";


    const respuesta =
        await fetch(
            url
        );


    if (!respuesta.ok) {

        throw new Error(
            "Open Library devolvió "
            +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    let libros =
        (
            datos.docs
            ||
            []
        )
        .map(
            normalizarLibroOpenLibrary
        );


    /*
      Ordenamos mejor la búsqueda general.
    */

    if (
        filtro === "todo"
    ) {

        const buscado =
            normalizarTextoAPI(
                texto
            );


        libros.sort(
            (a, b) => {

                return (
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
        );

    }


    return libros
        .slice(
            0,
            20
        );

}


/* ===================================================== */
/* PUNTUACIÓN DE RESULTADOS                             */
/* ===================================================== */

function puntuacionBusqueda(
    libro,
    buscado
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
        titulo === buscado
    ) {

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
            libro.key
            ||
            "",

        titulo:
            libro.title
            ||
            "Sin título",

        autor:
            autor,

        año:
            libro.first_publish_year
            ||
            "",

        portada:
            portada,

        temas:
            libro.subject
            ||
            [],

        idiomas:
            libro.language
            ||
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


/* ===================================================== */
/* RESULTADOS DE BÚSQUEDA                               */
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


    contenedor.innerHTML =
        "";


    if (
        !libros
        ||
        libros.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    🔎
                </span>

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


    const portada =
        libro.portada
        ||
        "";


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
                portada

                ? `
                    <img
                        src="${escaparHTMLAPI(
                            portada
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

            <button
                class="corazon-tarjeta"
                aria-label="Añadir a quiero leer"
            >
                ♡
            </button>

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
                    Gratis
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

                <p
                    class="autor"
                    style="
                        text-align:right;
                        margin-top:4px;
                    "
                >
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
        evento => {

            if (
                evento.target
                    .closest(
                        ".corazon-tarjeta"
                    )
            ) {

                return;

            }


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


    const corazon =
        tarjeta.querySelector(
            ".corazon-tarjeta"
        );


    actualizarCorazonTarjeta(
        corazon,
        libro
    );


    corazon
        ?.addEventListener(
            "click",
            evento =>