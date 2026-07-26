/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS                                          */
/* Infantil + Juvenil + edades + categorías             */
/* ===================================================== */


/* ===================================================== */
/* ESTADO DEL CATÁLOGO                                  */
/* ===================================================== */

window.estadoCatalogo = {

    tipo:
        "infantil",

    edad:
        "6-8",

    categoria:
        "aventuras",

    soloGratis:
        true

};


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const CATEGORIAS_CATALOGO = {

    aventuras: {

        etiqueta:
            "Aventuras",

        topicInfantil:
            "children adventure",

        topicJuvenil:
            "juvenile adventure"

    },

    fantasia: {

        etiqueta:
            "Fantasía",

        topicInfantil:
            "children fantasy",

        topicJuvenil:
            "juvenile fantasy"

    },

    misterio: {

        etiqueta:
            "Misterio",

        topicInfantil:
            "children mystery",

        topicJuvenil:
            "juvenile mystery"

    },

    animales: {

        etiqueta:
            "Animales",

        topicInfantil:
            "children animals",

        topicJuvenil:
            "juvenile animals"

    },

    historia: {

        etiqueta:
            "Historia",

        topicInfantil:
            "children historical",

        topicJuvenil:
            "juvenile historical fiction"

    },

    clasicos: {

        etiqueta:
            "Clásicos",

        topicInfantil:
            "children classics",

        topicJuvenil:
            "juvenile classics"

    }

};


/* ===================================================== */
/* EDADES                                               */
/* ===================================================== */

const EDADES_INFANTIL = [

    {
        clave:
            "3-5",

        texto:
            "3-5 años",

        terminos: [
            "picture books",
            "children",
            "fairy tales"
        ]
    },

    {
        clave:
            "6-8",

        texto:
            "6-8 años",

        terminos: [
            "children",
            "juvenile",
            "stories"
        ]
    },

    {
        clave:
            "9-11",

        texto:
            "9-11 años",

        terminos: [
            "juvenile fiction",
            "children adventure",
            "children classics"
        ]
    }

];


const EDADES_JUVENIL = [

    {
        clave:
            "12-14",

        texto:
            "12-14 años",

        terminos: [
            "juvenile fiction",
            "young readers",
            "adventure"
        ]
    },

    {
        clave:
            "15-17",

        texto:
            "15-17 años",

        terminos: [
            "young adult",
            "juvenile fiction",
            "coming of age"
        ]
    }

];


/* ===================================================== */
/* ABRIR CATÁLOGO                                       */
/* ===================================================== */

function abrirCatalogo(
    tipo
) {

    const tipoValido =
        tipo === "juvenil"
        ? "juvenil"
        : "infantil";


    window.estadoCatalogo.tipo =
        tipoValido;


    /*
      Edad por defecto.
    */

    window.estadoCatalogo.edad =
        tipoValido === "infantil"
        ? "6-8"
        : "12-14";


    window.estadoCatalogo.categoria =
        "aventuras";


    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    if (checkbox) {

        checkbox.checked =
            true;

    }


    window.estadoCatalogo.soloGratis =
        true;


    const titulo =
        document.getElementById(
            "titulo-catalogo"
        );


    if (titulo) {

        titulo.textContent =
            tipoValido === "infantil"
            ? "Infantil"
            : "Juvenil";

    }


    pintarFiltrosEdadCatalogo();

    marcarCategoriaActiva(
        "aventuras"
    );


    mostrarPantalla(
        "pantalla-catalogo"
    );


    actualizarCatalogo();

}


/* ===================================================== */
/* FILTROS DE EDAD                                      */
/* ===================================================== */

function pintarFiltrosEdadCatalogo() {

    const contenedor =
        document.getElementById(
            "filtros-edad"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        "";


    const edades =
        window.estadoCatalogo.tipo
        === "infantil"

        ? EDADES_INFANTIL

        : EDADES_JUVENIL;


    edades.forEach(
        edad => {

            const boton =
                document.createElement(
                    "button"
                );


            boton.textContent =
                edad.texto;


            if (
                edad.clave
                === window.estadoCatalogo.edad
            ) {

                boton.classList.add(
                    "activo"
                );

            }


            boton.addEventListener(
                "click",
                () => {

                    filtrarEdad(
                        edad.clave,
                        boton
                    );

                }
            );


            contenedor.appendChild(
                boton
            );

        }
    );

}


/* ===================================================== */
/* CAMBIAR EDAD                                         */
/* ===================================================== */

function filtrarEdad(
    edad,
    boton
) {

    window.estadoCatalogo.edad =
        edad;


    document
        .querySelectorAll(
            "#filtros-edad button"
        )
        .forEach(
            elemento => {

                elemento
                    .classList
                    .remove(
                        "activo"
                    );

            }
        );


    boton
        ?.classList
        .add(
            "activo"
        );


    actualizarCatalogo();

}


/* ===================================================== */
/* CAMBIAR CATEGORÍA                                    */
/* ===================================================== */

function filtrarCategoria(
    categoria,
    boton
) {

    if (
        !CATEGORIAS_CATALOGO[
            categoria
        ]
    ) {

        return;

    }


    window.estadoCatalogo.categoria =
        categoria;


    document
        .querySelectorAll(
            ".categorias-scroll button"
        )
        .forEach(
            elemento => {

                elemento
                    .classList
                    .remove(
                        "activo"
                    );

            }
        );


    boton
        ?.classList
        .add(
            "activo"
        );


    actualizarCatalogo();

}


function marcarCategoriaActiva(
    categoria
) {

    const botones =
        document.querySelectorAll(
            ".categorias-scroll button"
        );


    botones.forEach(
        boton => {

            boton.classList
                .remove(
                    "activo"
                );

        }
    );


    const mapaOrden = {

        aventuras:
            0,

        fantasia:
            1,

        misterio:
            2,

        animales:
            3,

        historia:
            4,

        clasicos:
            5

    };


    const indice =
        mapaOrden[
            categoria
        ];


    if (
        indice !== undefined
        &&
        botones[indice]
    ) {

        botones[indice]
            .classList
            .add(
                "activo"
            );

    }

}


/* ===================================================== */
/* ACTUALIZAR CATÁLOGO                                  */
/* ===================================================== */

async function actualizarCatalogo() {

    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    window.estadoCatalogo.soloGratis =
        Boolean(
            checkbox
            ?.checked
        );


    const contenedor =
        document.getElementById(
            "catalogo-libros"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div class="estado-vacio">

            <span>
                📚
            </span>

            <p>
                Buscando libros...
            </p>

        </div>
    `;


    try {

        let libros = [];


        /*
          De momento usamos Gutendex
          tanto para Infantil como Juvenil,
          porque garantiza que podamos
          leer los libros en nuestra app.
        */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await cargarCatalogoGratis();

        }

        else {

            /*
              Aunque desactives "Solo libros gratis",
              mantenemos una mezcla útil:
              Gutenberg + búsquedas temáticas.
              Más adelante podremos añadir
              Open Library aquí.
            */

            libros =
                await cargarCatalogoGratis();

        }


        pintarCatalogo(
            libros
        );

    }

    catch (error) {

        console.error(
            "Error cargando catálogo:",
            error
        );


        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    😕
                </span>

                <p>
                    No se ha podido cargar esta sección.
                </p>

            </div>
        `;

    }

}


/* ===================================================== */
/* CARGAR CATÁLOGO GRATIS                               */
/* ===================================================== */

async function cargarCatalogoGratis() {

    if (
        typeof API_GUTENDEX
        === "undefined"
    ) {

        throw new Error(
            "api.js no está cargado."
        );

    }


    const categoria =
        window.estadoCatalogo.categoria;


    const configuracion =
        CATEGORIAS_CATALOGO[
            categoria
        ];


    const tipo =
        window.estadoCatalogo.tipo;


    const topic =
        tipo === "infantil"

        ? configuracion.topicInfantil

        : configuracion.topicJuvenil;


    /*
      Primera búsqueda temática.
    */

    let libros =
        await consultarGutendexTopic(
            topic
        );


    /*
      Si vienen pocos resultados,
      hacemos una búsqueda alternativa
      con términos de edad.
    */

    if (
        libros.length < 8
    ) {

        const terminoEdad =
            obtenerTerminoEdadCatalogo();


        const alternativa =
            await consultarGutendexSearch(
                terminoEdad
                +
                " "
                +
                configuracion.etiqueta
            );


        libros =
            combinarLibrosSinDuplicados(
                libros,
                alternativa
            );

    }


    /*
      Filtrado básico por idioma.
      Priorizamos español, pero si no hay
      suficientes resultados dejamos
      otros idiomas.
    */

    libros =
        priorizarEspanol(
            libros
        );


    /*
      Filtro de relevancia infantil /
      juvenil.
    */

    libros =
        filtrarRelevanciaCatalogo(
            libros
        );


    return libros
        .slice(
            0,
            24
        );

}


/* ===================================================== */
/* CONSULTAR GUTENDEX POR TOPIC                         */
/* ===================================================== */

async function consultarGutendexTopic(
    topic
) {

    const url =
        API_GUTENDEX
        +
        "?topic="
        +
        encodeURIComponent(
            topic
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


    return (
        datos.results
        ||
        []
    )
        .map(
            normalizarLibroGutendex
        );

}


/* ===================================================== */
/* CONSULTAR GUTENDEX POR SEARCH                        */
/* ===================================================== */

async function consultarGutendexSearch(
    consulta
) {

    const url =
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

        return [];

    }


    const datos =
        await respuesta.json();


    return (
        datos.results
        ||
        []
    )
        .map(
            normalizarLibroGutendex
        );

}


/* ===================================================== */
/* TÉRMINO POR EDAD                                     */
/* ===================================================== */

function obtenerTerminoEdadCatalogo() {

    const edades =
        window.estadoCatalogo.tipo
        === "infantil"

        ? EDADES_INFANTIL

        : EDADES_JUVENIL;


    const edad =
        edades.find(
            item =>
                item.clave
                === window.estadoCatalogo.edad
        );


    if (
        !edad
        ||
        !edad.terminos.length
    ) {

        return "";

    }


    return edad.terminos[0];

}


/* ===================================================== */
/* FILTRAR RELEVANCIA                                   */
/* ===================================================== */

function filtrarRelevanciaCatalogo(
    libros
) {

    if (!libros.length) {

        return [];

    }


    const tipo =
        window.estadoCatalogo.tipo;


    const categoria =
        window.estadoCatalogo.categoria;


    const palabrasInfantil = [

        "children",

        "juvenile",

        "fairy",

        "storybook",

        "stories",

        "child",

        "boys",

        "girls",

        "animals",

        "adventure"

    ];


    const palabrasJuvenil = [

        "juvenile",

        "young",

        "adventure",

        "fantasy",

        "mystery",

        "historical",

        "coming of age",

        "boys",

        "girls"

    ];


    const palabras =
        tipo === "infantil"

        ? palabrasInfantil

        : palabrasJuvenil;


    const evaluados =
        libros.map(
            libro => {

                const texto =
                    normalizarCatalogoTexto(
                        [
                            libro.titulo,
                            libro.autor,
                            ...(libro.temas || []),
                            ...(libro.estanterias || [])
                        ]
                        .join(
                            " "
                        )
                    );


                let puntos = 0;


                palabras.forEach(
                    palabra => {

                        if (
                            texto.includes(
                                normalizarCatalogoTexto(
                                    palabra
                                )
                            )
                        ) {

                            puntos += 2;

                        }

                    }
                );


                /*
                  Bonus según categoría.
                */

                const categoriaTexto =
                    normalizarCatalogoTexto(
                        CATEGORIAS_CATALOGO[
                            categoria
                        ]
                        .etiqueta
                    );


                if (
                    texto.includes(
                        categoriaTexto
                    )
                ) {

                    puntos += 3;

                }


                /*
                  Popularidad.
                */

                if (
                    libro.descargas > 10000
                ) {

                    puntos += 2;

                }

                else if (
                    libro.descargas > 1000
                ) {

                    puntos += 1;

                }


                return {

                    libro,
                    puntos

                };

            }
        );


    /*
      No eliminamos los de 0 puntos,
      porque algunos clásicos no vienen
      bien etiquetados en Gutenberg.
    */

    evaluados.sort(
        (a, b) => {

            if (
                b.puntos
                !== a.puntos
            ) {

                return (
                    b.puntos
                    -
                    a.puntos
                );

            }


            return (
                (
                    b.libro.descargas
                    ||
                    0
                )
                -
                (
                    a.libro.descargas
                    ||
                    0
                )
            );

        }
    );


    return evaluados.map(
        elemento =>
            elemento.libro
    );

}


/* ===================================================== */
/* PRIORIZAR ESPAÑOL                                    */
/* ===================================================== */

function priorizarEspanol(
    libros
) {

    return [
        ...libros.filter(
            libro =>
                libro.idiomas
                ?.includes(
                    "es"
                )
        ),

        ...libros.filter(
            libro =>
                !libro.idiomas
                ?.includes(
                    "es"
                )
        )
    ];

}


/* ===================================================== */
/* COMBINAR SIN DUPLICADOS                              */
/* ===================================================== */

function combinarLibrosSinDuplicados(
    lista1,
    lista2
) {

    const mapa =
        new Map();


    [
        ...lista1,
        ...lista2
    ]
        .forEach(
            libro => {

                const id =
                    libro.idInterno
                    ||
                    libro.gutenbergId
                    ||
                    libro.id;


                if (!id) {

                    return;

                }


                if (
                    !mapa.has(
                        String(id)
                    )
                ) {

                    mapa.set(
                        String(id),
                        libro
                    );

                }

            }
        );


    return [
        ...mapa.values()
    ];

}


/* ===================================================== */
/* PINTAR CATÁLOGO                                      */
/* ===================================================== */

function pintarCatalogo(
    libros
) {

    const contenedor =
        document.getElementById(
            "catalogo-libros"
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
                    📚
                </span>

                <p>
                    No hemos encontrado libros
                    para esta selección.
                </p>

            </div>
        `;


        return;

    }


    libros.forEach(
        libro => {

            contenedor.appendChild(
                crearTarjetaCatalogo(
                    libro
                )
            );

        }
    );

}


/* ===================================================== */
/* TARJETA DE CATÁLOGO                                  */
/* ===================================================== */

function crearTarjetaCatalogo(
    libro
) {

    /*
      Reutilizamos la tarjeta de api.js
      si está disponible.
    */

    if (
        typeof crearTarjetaLibroAPI
        === "function"
    ) {

        return crearTarjetaLibroAPI(
            {
                ...libro,

                categoria:
                    CATEGORIAS_CATALOGO[
                        window.estadoCatalogo
                            .categoria
                    ]
                    .etiqueta,

                edad:
                    window.estadoCatalogo
                        .edad
                    +
                    " años"
            }
        );

    }


    /*
      Fallback por si api.js no ha cargado.
    */

    const tarjeta =
        document.createElement(
            "article"
        );


    tarjeta.className =
        "tarjeta-libro";


    tarjeta.innerHTML = `

        <div class="tarjeta-libro-portada">

            ${
                libro.portada

                ? `
                    <img
                        src="${escaparHTMLCatalogo(
                            libro.portada
                        )}"
                        alt=""
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
            ${escaparHTMLCatalogo(
                libro.titulo
            )}
        </h3>


        <p class="autor">
            ${escaparHTMLCatalogo(
                libro.autor
            )}
        </p>


        <span class="etiqueta-gratis">
            Gratis
        </span>
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


    return tarjeta;

}


/* ===================================================== */
/* NORMALIZAR TEXTO                                     */
/* ===================================================== */

function normalizarCatalogoTexto(
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
        .toLowerCase();

}


/* ===================================================== */
/* ESCAPAR HTML                                         */
/* ===================================================== */

function escaparHTMLCatalogo(
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


/* ===================================================== */
/* ARRANQUE                                             */
/* ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
          Dejamos el catálogo preparado
          por defecto en Infantil.
        */

        pintarFiltrosEdadCatalogo();

    }
);


console.log(
    "✨ Catálogo Infantil/Juvenil cargado"
);