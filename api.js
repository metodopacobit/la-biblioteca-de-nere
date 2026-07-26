/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* API.JS                                               */
/* Búsqueda de libros + Gutendex + Project Gutenberg    */
/* ===================================================== */


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const API_GUTENDEX =
    "https://gutendex.com/books/";


// Worker que ya hemos creado y comprobado
const WORKER_NERE =
    "https://biblioteca-nere-worker.rjaresarias.workers.dev/";


let ultimaBusqueda = [];

let paginaSiguienteBusqueda = null;


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


    const resultados =
        document.getElementById(
            "resultados-busqueda"
        );


    if (
        !input
        ||
        !resultados
    ) {

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

        estado.innerHTML =
            `
            <div class="cargando-busqueda">
                Buscando libros...
            </div>
            `;

    }


    resultados.innerHTML =
        "";


    try {

        let consulta =
            texto;


        const filtro =
            window.estadoApp
                ?.filtroBusqueda
            ||
            "todo";


        /*
          Gutendex no tiene parámetros
          separados perfectos para título,
          así que utilizamos search para
          mantener buenos resultados.
        */

        let url =
            API_GUTENDEX
            +
            "?search="
            +
            encodeURIComponent(
                consulta
            );


        const respuesta =
            await fetch(
                url
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error Gutendex "
                +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        let libros =
            (
                datos.results
                ||
                []
            )
            .map(
                normalizarLibroGutendex
            );


        /*
          Filtro adicional local.
        */

        if (
            filtro
            === "titulo"
        ) {

            const consultaNormalizada =
                normalizarBusqueda(
                    texto
                );


            libros =
                libros.filter(
                    libro =>
                        normalizarBusqueda(
                            libro.titulo
                        )
                        .includes(
                            consultaNormalizada
                        )
                );

        }


        if (
            filtro
            === "autor"
        ) {

            const consultaNormalizada =
                normalizarBusqueda(
                    texto
                );


            libros =
                libros.filter(
                    libro =>
                        normalizarBusqueda(
                            libro.autor
                        )
                        .includes(
                            consultaNormalizada
                        )
                );

        }


        ultimaBusqueda =
            libros;


        paginaSiguienteBusqueda =
            datos.next
            ||
            null;


        pintarResultadosBusqueda(
            libros
        );


        if (estado) {

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


        resultados.innerHTML =
            `
            <div class="estado-vacio">
                <span>📚</span>

                <p>
                    Ha habido un problema al conectar
                    con el catálogo de libros.
                </p>
            </div>
            `;

    }

}


/* ===================================================== */
/* NORMALIZAR LIBRO GUTENDEX                            */
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
                autor =>
                    autor.name
            )
            .join(", ")

        : "Autor desconocido";


    const portada =
        libro.formats
            ?.["image/jpeg"]
        ||
        "";


    const lectura =
        obtenerFormatoLectura(
            libro.formats
        );


    const idioma =
        libro.languages
        &&
        libro.languages.length

        ? libro.languages[0]

        : "";


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
            ||
            "Sin título",

        autor:
            autor,

        portada:
            portada,

        idiomas:
            libro.languages
            ||
            [],

        idioma:
            idioma,

        temas:
            libro.subjects
            ||
            [],

        estanterias:
            libro.bookshelves
            ||
            [],

        descargas:
            libro.download_count
            ||
            0,

        formatos:
            libro.formats
            ||
            {},

        urlLectura:
            lectura,

        gratis:
            true,

        tipo:
            "gutenberg",

        fuente:
            "Project Gutenberg",

        resena:
            crearResenaBasica(
                libro
            )

    };

}


/* ===================================================== */
/* ELEGIR FORMATO PARA LEER                             */
/* ===================================================== */

function obtenerFormatoLectura(
    formatos
) {

    if (!formatos) {

        return "";

    }


    /*
      Priorizamos HTML UTF-8.
      Es el formato que mejor podemos
      mostrar dentro de nuestro lector.
    */

    const prioridades = [

        "text/html; charset=utf-8",

        "text/html",

        "text/plain; charset=utf-8",

        "text/plain"

    ];


    for (
        const tipo
        of prioridades
    ) {

        const url =
            formatos[tipo];


        if (
            url
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


    /*
      Si Gutenberg cambia ligeramente
      el nombre MIME, buscamos cualquier
      HTML disponible.
    */

    for (
        const [
            tipo,
            url
        ]
        of Object.entries(
            formatos
        )
    ) {

        if (
            tipo.includes(
                "text/html"
            )
            &&
            typeof url
            === "string"
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


    /*
      Último recurso:
      texto plano.
    */

    for (
        const [
            tipo,
            url
        ]
        of Object.entries(
            formatos
        )
    ) {

        if (
            tipo.includes(
                "text/plain"
            )
            &&
            typeof url
            === "string"
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
/* HTTPS                                                */
/* ===================================================== */

function convertirURLSegura(
    url
) {

    if (!url) {

        return "";

    }


    return String(
        url
    )
        .replace(
            /^http:\/\//i,
            "https://"
        );

}


/* ===================================================== */
/* RESEÑA BÁSICA                                       */
/* ===================================================== */

function crearResenaBasica(
    libro
) {

    const temas =
        libro.subjects
        ||
        [];


    const titulo =
        libro.title
        ||
        "Este libro";


    if (
        temas.length > 0
    ) {

        const seleccion =
            temas
                .slice(
                    0,
                    3
                )
                .map(
                    limpiarTema
                )
                .filter(
                    Boolean
                );


        if (
            seleccion.length
        ) {

            return (
                titulo
                +
                " forma parte del catálogo de Project Gutenberg. "
                +
                "Entre sus principales temas encontramos "
                +
                seleccion.join(
                    ", "
                )
                +
                ". Puedes leerlo gratuitamente desde La Biblioteca de Nere."
            );

        }

    }


    return (
        titulo
        +
        " es una obra disponible gratuitamente "
        +
        "en el catálogo de Project Gutenberg. "
        +
        "Puedes leerla directamente desde "
        +
        "La Biblioteca de Nere."
    );

}


function limpiarTema(
    tema
) {

    if (!tema) {

        return "";

    }


    /*
      Gutenberg devuelve algunos temas
      con separadores --.
      Nos quedamos con una descripción
      más sencilla.
    */

    return String(
        tema
    )
        .replace(
            /--/g,
            " · "
        )
        .trim();

}


/* ===================================================== */
/* PINTAR RESULTADOS                                    */
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

        contenedor.innerHTML =
            `
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
/* TARJETA DE LIBRO                                     */
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


    tarjeta.innerHTML =
        `

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


        <div class="etiquetas-tarjeta">

            ${
                libro.idioma

                ? `
                    <span>
                        ${nombreIdioma(
                            libro.idioma
                        )}
                    </span>
                `

                : ""
            }

            <span>
                Gratis
            </span>

        </div>

        `;


    /*
      Abrir ficha al tocar
      cualquier parte de la tarjeta.
    */

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


    /*
      Corazón.
    */

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
            evento => {

                evento
                    .stopPropagation();


                guardarQuieroLeerDesdeTarjeta(
                    libro
                );


                actualizarCorazonTarjeta(
                    corazon,
                    libro
                );

            }
        );


    /*
      Si falla la imagen mostramos
      nuestro icono.
    */

    const imagen =
        tarjeta.querySelector(
            "img"
        );


    imagen
        ?.addEventListener(
            "error",
            () => {

                const contenedorPortada =
                    tarjeta.querySelector(
                        ".tarjeta-libro-portada"
                    );


                if (
                    contenedorPortada
                ) {

                    imagen.remove();


                    const reemplazo =
                        document.createElement(
                            "div"
                        );


                    reemplazo.className =
                        "tarjeta-libro-sin-portada";


                    reemplazo.textContent =
                        "📚";


                    contenedorPortada
                        .prepend(
                            reemplazo
                        );

                }

            }
        );


    return tarjeta;

}


/* ===================================================== */
/* CORAZÓN EN RESULTADOS                                */
/* ===================================================== */

function actualizarCorazonTarjeta(
    boton,
    libro
) {

    if (
        !boton
        ||
        typeof obtenerLibroBiblioteca
        !== "function"
    ) {

        return;

    }


    const guardado =
        obtenerLibroBiblioteca(
            libro
        );


    if (
        guardado
        &&
        guardado.estado
        === "quiero"
    ) {

        boton.textContent =
            "♥";


        boton.classList.add(
            "activo"
        );

    }

    else {

        boton.textContent =
            "♡";


        boton.classList.remove(
            "activo"
        );

    }

}


function guardarQuieroLeerDesdeTarjeta(
    libro
) {

    if (
        typeof obtenerBiblioteca
        !== "function"
    ) {

        return;

    }


    const biblioteca =
        obtenerBiblioteca();


    const id =
        typeof obtenerIdLibro
        === "function"

        ? obtenerIdLibro(
            libro
        )

        : libro.idInterno;


    const indice =
        biblioteca.findIndex(
            item => {

                const itemId =
                    typeof obtenerIdLibro
                    === "function"

                    ? obtenerIdLibro(
                        item
                    )

                    : item.idInterno;


                return (
                    itemId
                    === id
                );

            }
        );


    /*
      Si ya está en Quiero leer,
      lo quitamos.
    */

    if (
        indice >= 0
        &&
        biblioteca[indice]
            .estado
        === "quiero"
    ) {

        biblioteca.splice(
            indice,
            1
        );

    }

    else {

        const nuevo = {

            ...libro,

            idInterno:
                id,

            estado:
                "quiero",

            fechaGuardado:
                Date.now()

        };


        if (
            indice >= 0
        ) {

            biblioteca[indice] =
                {
                    ...biblioteca[indice],
                    ...nuevo
                };

        }

        else {

            biblioteca.push(
                nuevo
            );

        }

    }


    if (
        typeof guardarBibliotecaLocal
        === "function"
    ) {

        guardarBibliotecaLocal(
            biblioteca
        );

    }

}


/* ===================================================== */
/* COMPLETAR DATOS DE LA FICHA                          */
/* ===================================================== */

async function completarDatosLibro(
    libro
) {

    if (
        !libro
        ||
        !libro.gutenbergId
    ) {

        return libro;

    }


    try {

        const url =
            API_GUTENDEX
            +
            "?ids="
            +
            encodeURIComponent(
                libro.gutenbergId
            );


        const respuesta =
            await fetch(
                url
            );


        if (!respuesta.ok) {

            return libro;

        }


        const datos =
            await respuesta.json();


        if (
            !datos.results
            ||
            datos.results.length === 0
        ) {

            return libro;

        }


        const completo =
            normalizarLibroGutendex(
                datos.results[0]
            );


        return {

            ...libro,
            ...completo

        };

    }

    catch (error) {

        console.warn(
            "No se pudo completar el libro:",
            error
        );


        return libro;

    }

}


/* ===================================================== */
/* OBTENER LIBRO POR ID                                 */
/* ===================================================== */

async function obtenerLibroGutenberg(
    id
) {

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

            throw new Error(
                "No se pudo obtener el libro"
            );

        }


        const datos =
            await respuesta.json();


        if (
            !datos.results
            ||
            datos.results.length === 0
        ) {

            return null;

        }


        return normalizarLibroGutendex(
            datos.results[0]
        );

    }

    catch (error) {

        console.error(
            "Error obteniendo libro:",
            error
        );


        return null;

    }

}


/* ===================================================== */
/* OBTENER URL DE LECTURA                               */
/* ===================================================== */

async function obtenerURLLecturaLibro(
    libro
) {

    if (!libro) {

        return "";

    }


    /*
      Si ya tenemos la URL no necesitamos
      volver a consultar Gutendex.
    */

    if (
        libro.urlLectura
    ) {

        return convertirURLSegura(
            libro.urlLectura
        );

    }


    if (
        libro.formatos
    ) {

        const url =
            obtenerFormatoLectura(
                libro.formatos
            );


        if (url) {

            return url;

        }

    }


    /*
      Recuperamos el libro de nuevo.
    */

    if (
        libro.gutenbergId
    ) {

        const completo =
            await obtenerLibroGutenberg(
                libro.gutenbergId
            );


        if (completo) {

            return completo.urlLectura
                ||
                "";

        }

    }


    return "";

}


/* ===================================================== */
/* URL DEL WORKER                                       */
/* ===================================================== */

function crearURLWorker(
    urlLibro
) {

    if (!urlLibro) {

        return "";

    }


    /*
      Resultado:

      https://biblioteca-nere-worker...
      ?url=https%3A%2F%2F...
    */

    return (
        WORKER_NERE
        +
        "?url="
        +
        encodeURIComponent(
            convertirURLSegura(
                urlLibro
            )
        )
    );

}


/* ===================================================== */
/* DESCARGAR LIBRO A TRAVÉS DEL WORKER                  */
/* ===================================================== */

async function descargarLibroTexto(
    libro
) {

    const urlLectura =
        await obtenerURLLecturaLibro(
            libro
        );


    if (!urlLectura) {

        throw new Error(
            "Este libro no tiene un formato de lectura compatible."
        );

    }


    const urlWorker =
        crearURLWorker(
            urlLectura
        );


    const respuesta =
        await fetch(
            urlWorker
        );


    if (!respuesta.ok) {

        throw new Error(
            "El servidor intermedio devolvió "
            +
            respuesta.status
        );

    }


    const texto =
        await respuesta.text();


    if (
        !texto
        ||
        texto.trim().length
        < 100
    ) {

        throw new Error(
            "El libro recibido está vacío."
        );

    }


    return {

        contenido:
            texto,

        urlOriginal:
            urlLectura,

        tipo:
            detectarTipoContenido(
                texto
            )

    };

}


/* ===================================================== */
/* DETECTAR HTML / TEXTO                                */
/* ===================================================== */

function detectarTipoContenido(
    contenido
) {

    const inicio =
        String(
            contenido
        )
        .trim()
        .slice(
            0,
            500
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
/* LIMPIAR HTML DE GUTENBERG                            */
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


        /*
          Eliminamos elementos que no queremos
          mostrar en el lector.
        */

        documento
            .querySelectorAll(
                [
                    "script",
                    "style",
                    "noscript",
                    "iframe",
                    "form",
                    "nav"
                ].join(",")
            )
            .forEach(
                elemento =>
                    elemento.remove()
            );


        /*
          Gutenberg suele utilizar
          .chapter, section o body.
        */

        const cuerpo =
            documento.body;


        if (!cuerpo) {

            return html;

        }


        /*
          Eliminamos enlaces de navegación
          vacíos y algunos elementos molestos.
        */

        cuerpo
            .querySelectorAll(
                "a"
            )
            .forEach(
                enlace => {

                    enlace.removeAttribute(
                        "href"
                    );

                }
            );


        cuerpo
            .querySelectorAll(
                "img"
            )
            .forEach(
                imagen => {

                    /*
                      Evitamos imágenes relativas
                      que no cargarían correctamente.
                    */

                    const src =
                        imagen.getAttribute(
                            "src"
                        );


                    if (
                        !src
                        ||
                        !src.startsWith(
                            "http"
                        )
                    ) {

                        imagen.remove();

                    }

                }
            );


        return cuerpo.innerHTML;

    }

    catch (error) {

        console.warn(
            "No se pudo limpiar el HTML:",
            error
        );


        return html;

    }

}


/* ===================================================== */
/* CONVERTIR TEXTO PLANO PARA EL LECTOR                 */
/* ===================================================== */

function convertirTextoPlanoHTML(
    texto
) {

    if (!texto) {

        return "";

    }


    const limpio =
        escaparHTMLAPI(
            texto
        );


    /*
      Separamos por dobles saltos
      para crear párrafos.
    */

    const parrafos =
        limpio
            .split(
                /\n\s*\n/
            )
            .map(
                parrafo =>
                    parrafo
                        .replace(
                            /\n/g,
                            " "
                        )
                        .trim()
            )
            .filter(
                parrafo =>
                    parrafo.length > 0
            );


    return parrafos
        .map(
            parrafo =>
                "<p>"
                +
                parrafo
                +
                "</p>"
        )
        .join("");

}


/* ===================================================== */
/* PREPARAR CONTENIDO PARA EL LECTOR                    */
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
        descarga.tipo
        === "html"
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
/* IDIOMAS                                              */
/* ===================================================== */

function nombreIdioma(
    codigo
) {

    const idiomas = {

        es:
            "Español",

        en:
            "Inglés",

        fr:
            "Francés",

        de:
            "Alemán",

        it:
            "Italiano",

        pt:
            "Portugués",

        ca:
            "Catalán",

        gl:
            "Gallego",

        eu:
            "Euskera",

        la:
            "Latín"

    };


    return (
        idiomas[
            String(
                codigo
            )
            .toLowerCase()
        ]
        ||
        String(
            codigo
        )
        .toUpperCase()
    );

}


/* ===================================================== */
/* NORMALIZAR BÚSQUEDA                                  */
/* ===================================================== */

function normalizarBusqueda(
    texto
) {

    return String(
        texto
        ||
        ""
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


/* ===================================================== */
/* ESCAPAR HTML                                         */
/* ===================================================== */

function escaparHTMLAPI(
    texto
) {

    return String(
        texto
        ||
        ""
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


/* ===================================================== */
/* FIN API.JS                                           */
/* ===================================================== */

console.log(
    "📚 API de La Biblioteca de Nere cargada"
);