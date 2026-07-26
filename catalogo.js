/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS                                          */
/* Infantil + Juvenil + gratis + buscador propio        */
/* ===================================================== */


/* ===================================================== */
/* ESTADO DEL CATÁLOGO                                  */
/* ===================================================== */

window.estadoCatalogo = {

    tipo: "infantil",

    edad: "6-8",

    categoria: "aventuras",

    soloGratis: false

};


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const CATALOGO_OPEN_LIBRARY =
    "https://openlibrary.org/search.json";


const CATALOGO_GUTENDEX =
    "https://gutendex.com/books/";


/* ===================================================== */
/* EDADES                                               */
/* ===================================================== */

const EDADES_CATALOGO = {

    infantil: [

        {
            clave: "3-5",
            texto: "3-5 años"
        },

        {
            clave: "6-8",
            texto: "6-8 años"
        },

        {
            clave: "9-11",
            texto: "9-11 años"
        }

    ],

    juvenil: [

        {
            clave: "12-14",
            texto: "12-14 años"
        },

        {
            clave: "15-17",
            texto: "15-17 años"
        }

    ]

};


/* ===================================================== */
/* CATEGORÍAS                                           */
/* ===================================================== */

const CATEGORIAS_NERE = {

    aventuras: {

        nombre:
            "Aventuras",

        infantil:
            "children adventure",

        juvenil:
            "juvenile adventure"
    },


    fantasia: {

        nombre:
            "Fantasía",

        infantil:
            "children fantasy",

        juvenil:
            "juvenile fantasy"
    },


    misterio: {

        nombre:
            "Misterio",

        infantil:
            "children mystery",

        juvenil:
            "juvenile mystery"
    },


    animales: {

        nombre:
            "Animales",

        infantil:
            "children animals",

        juvenil:
            "juvenile animals"
    },


    historia: {

        nombre:
            "Historia",

        infantil:
            "children historical fiction",

        juvenil:
            "juvenile historical fiction"
    },


    clasicos: {

        nombre:
            "Clásicos",

        infantil:
            "children classics",

        juvenil:
            "juvenile classics"
    }

};


/* ===================================================== */
/* ABRIR CATÁLOGO                                       */
/* ===================================================== */

function abrirCatalogo(tipo) {

    if (
        tipo !== "infantil" &&
        tipo !== "juvenil"
    ) {

        tipo =
            "infantil";

    }


    window.estadoCatalogo.tipo =
        tipo;


    window.estadoCatalogo.edad =
        tipo === "infantil"
            ? "6-8"
            : "12-14";


    window.estadoCatalogo.categoria =
        "aventuras";


    window.estadoCatalogo.soloGratis =
        false;


    const titulo =
        document.getElementById(
            "titulo-catalogo"
        );


    if (titulo) {

        titulo.textContent =
            tipo === "infantil"
                ? "🧒 Infantil"
                : "🧑 Juvenil";

    }


    const buscador =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (buscador) {

        buscador.value =
            "";

    }


    const gratis =
        document.getElementById(
            "solo-gratis"
        );


    if (gratis) {

        gratis.checked =
            false;

    }


    pintarEdadesCatalogo();

    seleccionarCategoriaVisual(
        "aventuras"
    );


    if (
        typeof mostrarPantalla ===
        "function"
    ) {

        mostrarPantalla(
            "pantalla-catalogo"
        );

    }


    cargarSeleccionCatalogo();

}


/* ===================================================== */
/* EDADES                                               */
/* ===================================================== */

function pintarEdadesCatalogo() {

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
        EDADES_CATALOGO[
            window.estadoCatalogo.tipo
        ];


    edades.forEach(
        function(edad) {

            const boton =
                document.createElement(
                    "button"
                );


            boton.textContent =
                edad.texto;


            if (
                edad.clave ===
                window.estadoCatalogo.edad
            ) {

                boton.classList.add(
                    "activo"
                );

            }


            boton.onclick =
                function() {

                    filtrarEdad(
                        edad.clave,
                        boton
                    );

                };


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
            function(elemento) {

                elemento.classList.remove(
                    "activo"
                );

            }
        );


    if (boton) {

        boton.classList.add(
            "activo"
        );

    }


    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (
        input &&
        input.value.trim()
    ) {

        buscarEnCatalogo();

    }

    else {

        cargarSeleccionCatalogo();

    }

}


/* ===================================================== */
/* CATEGORÍAS                                           */
/* ===================================================== */

function filtrarCategoria(
    categoria,
    boton
) {

    if (
        !CATEGORIAS_NERE[
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
            function(elemento) {

                elemento.classList.remove(
                    "activo"
                );

            }
        );


    if (boton) {

        boton.classList.add(
            "activo"
        );

    }


    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (
        input &&
        input.value.trim()
    ) {

        buscarEnCatalogo();

    }

    else {

        cargarSeleccionCatalogo();

    }

}


/* ===================================================== */
/* MARCAR CATEGORÍA                                     */
/* ===================================================== */

function seleccionarCategoriaVisual(
    categoria
) {

    const orden = {

        aventuras: 0,

        fantasia: 1,

        misterio: 2,

        animales: 3,

        historia: 4,

        clasicos: 5

    };


    const botones =
        document.querySelectorAll(
            ".categorias-scroll button"
        );


    botones.forEach(
        function(boton) {

            boton.classList.remove(
                "activo"
            );

        }
    );


    const indice =
        orden[categoria];


    if (
        indice !== undefined &&
        botones[indice]
    ) {

        botones[indice]
            .classList.add(
                "activo"
            );

    }

}


/* ===================================================== */
/* CAMBIO SOLO GRATIS                                   */
/* ===================================================== */

function actualizarCatalogo() {

    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    window.estadoCatalogo.soloGratis =
        Boolean(
            checkbox &&
            checkbox.checked
        );


    const buscador =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (
        buscador &&
        buscador.value.trim()
    ) {

        buscarEnCatalogo();

    }

    else {

        cargarSeleccionCatalogo();

    }

}


/* ===================================================== */
/* BUSCADOR DENTRO DEL CATÁLOGO                         */
/* ===================================================== */

async function buscarEnCatalogo() {

    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    const consulta =
        input
            ? input.value.trim()
            : "";


    if (!consulta) {

        cargarSeleccionCatalogo();

        return;

    }


    ponerEstadoCatalogo(
        "🔎 Buscando..."
    );


    limpiarCatalogo();


    try {

        let libros = [];


        /*
          IMPORTANTE:

          Cuando el usuario escribe un título
          o autor usamos SEARCH en Gutendex.

          Ejemplo:
          Tom Sawyer
          Peter Pan
          Alice
        */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarCatalogoGratis(
                    consulta,
                    true
                );

        }

        else {

            libros =
                await buscarCatalogoGeneral(
                    consulta
                );

        }


        aplicarDatosCatalogo(
            libros
        );


        pintarLibrosCatalogo(
            libros
        );


        if (libros.length) {

            ponerEstadoCatalogo(
                libros.length +
                " resultados encontrados"
            );

        }

        else {

            ponerEstadoCatalogo(
                "No se encontraron libros."
            );

        }

    }

    catch (error) {

        console.error(
            "ERROR BUSCADOR CATÁLOGO:",
            error
        );


        ponerEstadoCatalogo(
            "❌ No se ha podido realizar la búsqueda."
        );

    }

}


/* ===================================================== */
/* SELECCIÓN AUTOMÁTICA                                 */
/* ===================================================== */

async function cargarSeleccionCatalogo() {

    ponerEstadoCatalogo(
        "📚 Cargando libros..."
    );


    limpiarCatalogo();


    try {

        const categoria =
            window.estadoCatalogo
                .categoria;


        const configuracion =
            CATEGORIAS_NERE[
                categoria
            ];


        const consulta =
            configuracion[
                window.estadoCatalogo.tipo
            ];


        let libros = [];


        /*
          PARA CATEGORÍAS GRATIS:

          usamos TOPIC, no SEARCH.

          Esto es lo que corrige Juvenil.
        */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarCatalogoGratis(
                    consulta,
                    false
                );

        }

        else {

            libros =
                await buscarCatalogoGeneral(
                    consulta
                );

        }


        /*
          RESPALDO PARA GUTENBERG

          Algunos temas juveniles están
          etiquetados de forma inconsistente.

          Si obtenemos pocos resultados,
          probamos consultas más amplias.
        */

        if (
            window.estadoCatalogo.soloGratis &&
            libros.length < 6
        ) {

            const respaldo =
                await obtenerRespaldoGratis();


            libros =
                combinarCatalogo(
                    libros,
                    respaldo
                );

        }


        /*
          RESPALDO PARA OPEN LIBRARY
        */

        if (
            !window.estadoCatalogo.soloGratis &&
            libros.length < 6
        ) {

            const respaldo =
                await buscarCatalogoGeneral(
                    configuracion.nombre
                );


            libros =
                combinarCatalogo(
                    libros,
                    respaldo
                );

        }


        aplicarDatosCatalogo(
            libros
        );


        pintarLibrosCatalogo(
            libros
        );


        if (libros.length) {

            ponerEstadoCatalogo(

                window.estadoCatalogo.tipo ===
                "infantil"

                    ? (
                        window.estadoCatalogo.soloGratis
                            ? "🟢 Libros infantiles gratuitos"
                            : "🧒 Libros infantiles recomendados"
                    )

                    : (
                        window.estadoCatalogo.soloGratis
                            ? "🟢 Libros juveniles gratuitos"
                            : "🧑 Libros juveniles recomendados"
                    )
            );

        }

        else {

            ponerEstadoCatalogo(
                "No encontramos libros para esta selección."
            );

        }

    }

    catch (error) {

        console.error(
            "ERROR CARGANDO CATÁLOGO:",
            error
        );


        ponerEstadoCatalogo(
            "❌ No se ha podido cargar esta selección."
        );

    }

}


/* ===================================================== */
/* RESPALDO GRATIS                                      */
/* ===================================================== */

async function obtenerRespaldoGratis() {

    const tipo =
        window.estadoCatalogo.tipo;


    const categoria =
        window.estadoCatalogo.categoria;


    const consultas = [];


    if (tipo === "infantil") {

        consultas.push(
            "children"
        );


        if (
            categoria === "aventuras"
        ) {

            consultas.push(
                "adventure"
            );

        }


        else if (
            categoria === "fantasia"
        ) {

            consultas.push(
                "fairy tales"
            );

        }


        else if (
            categoria === "misterio"
        ) {

            consultas.push(
                "mystery"
            );

        }


        else if (
            categoria === "animales"
        ) {

            consultas.push(
                "animals"
            );

        }


        else if (
            categoria === "historia"
        ) {

            consultas.push(
                "history"
            );

        }


        else if (
            categoria === "clasicos"
        ) {

            consultas.push(
                "children literature"
            );

        }

    }

    else {

        /*
          Gutenberg no siempre usa "young adult".
          "juvenile fiction" funciona mejor.
        */

        consultas.push(
            "juvenile fiction"
        );


        if (
            categoria === "aventuras"
        ) {

            consultas.push(
                "adventure stories"
            );

        }


        else if (
            categoria === "fantasia"
        ) {

            consultas.push(
                "fantasy fiction"
            );

        }


        else if (
            categoria === "misterio"
        ) {

            consultas.push(
                "detective mystery stories"
            );

        }


        else if (
            categoria === "animales"
        ) {

            consultas.push(
                "animals fiction"
            );

        }


        else if (
            categoria === "historia"
        ) {

            consultas.push(
                "historical fiction"
            );

        }


        else if (
            categoria === "clasicos"
        ) {

            consultas.push(
                "juvenile literature"
            );

        }

    }


    let resultado = [];


    for (
        const consulta of consultas
    ) {

        try {

            const libros =
                await buscarCatalogoGratis(
                    consulta,
                    false
                );


            resultado =
                combinarCatalogo(
                    resultado,
                    libros
                );


            if (
                resultado.length >= 18
            ) {

                break;

            }

        }

        catch (error) {

            console.warn(
                "Fallo consulta respaldo:",
                consulta
            );

        }

    }


    return resultado;

}


/* ===================================================== */
/* OPEN LIBRARY                                         */
/* ===================================================== */

async function buscarCatalogoGeneral(
    consulta
) {

    const url =
        CATALOGO_OPEN_LIBRARY +
        "?q=" +
        encodeURIComponent(
            consulta
        ) +
        "&limit=24";


    console.log(
        "CATÁLOGO OPEN LIBRARY:",
        url
    );


    const respuesta =
        await fetch(
            url
        );


    if (!respuesta.ok) {

        throw new Error(
            "Open Library catálogo: " +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    return (
        datos.docs || []
    )
    .map(
        normalizarLibroCatalogoOpenLibrary
    )
    .slice(
        0,
        20
    );

}


/* ===================================================== */
/* NORMALIZAR OPEN LIBRARY                              */
/* ===================================================== */

function normalizarLibroCatalogoOpenLibrary(
    libro
) {

    let autor =
        "Autor desconocido";


    if (
        libro.author_name &&
        libro.author_name.length
    ) {

        autor =
            libro.author_name[0];

    }


    let portada = "";


    if (libro.cover_i) {

        portada =
            "https://covers.openlibrary.org/b/id/" +
            libro.cover_i +
            "-M.jpg";

    }


    return {

        idInterno:
            libro.key ||
            (
                "catalogo-" +
                normalizarTextoCatalogo(
                    (libro.title || "") +
                    "-" +
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

async function buscarCatalogoGratis(
    consulta,
    esBusquedaManual = false
) {

    /*
      BÚSQUEDA MANUAL:
      ?search=Tom Sawyer

      CATEGORÍAS:
      ?topic=juvenile adventure
    */

    const parametro =
        esBusquedaManual
            ? "search"
            : "topic";


    const url =
        CATALOGO_GUTENDEX +
        "?" +
        parametro +
        "=" +
        encodeURIComponent(
            consulta
        ) +
        "&sort=popular";


    console.log(
        "CATÁLOGO GRATIS:",
        url
    );


    const respuesta =
        await fetch(
            url
        );


    if (!respuesta.ok) {

        throw new Error(
            "Gutendex catálogo: " +
            respuesta.status
        );

    }


    const datos =
        await respuesta.json();


    return (
        datos.results || []
    )
    .map(
        normalizarLibroCatalogoGutendex
    )
    .slice(
        0,
        24
    );

}


/* ===================================================== */
/* NORMALIZAR GUTENDEX                                  */
/* ===================================================== */

function normalizarLibroCatalogoGutendex(
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
                function(item) {

                    return item.name;

                }
            )
            .join(", ");

    }


    const formatos =
        libro.formats || {};


    let resumen = "";


    if (
        Array.isArray(
            libro.summaries
        ) &&
        libro.summaries.length
    ) {

        resumen =
            libro.summaries[0];

    }


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

        formatos:
            formatos,

        temas:
            libro.subjects ||
            [],

        estanterias:
            libro.bookshelves ||
            [],

        idiomas:
            libro.languages ||
            [],

        descargas:
            libro.download_count ||
            0,

        gratis:
            true,

        tipo:
            "gutenberg",

        fuente:
            "Project Gutenberg",

        resena:
            resumen ||
            (
                (libro.title || "Este libro") +
                " está disponible gratuitamente en Project Gutenberg."
            )

    };

}


/* ===================================================== */
/* EDAD Y CATEGORÍA                                     */
/* ===================================================== */

function aplicarDatosCatalogo(
    libros
) {

    const nombreCategoria =
        CATEGORIAS_NERE[
            window.estadoCatalogo.categoria
        ]?.nombre
        ||
        "";


    libros.forEach(
        function(libro) {

            libro.edad =
                window.estadoCatalogo.edad +
                " años";


            libro.categoria =
                nombreCategoria;

        }
    );

}


/* ===================================================== */
/* PINTAR                                               */
/* ===================================================== */

function pintarLibrosCatalogo(
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
        !libros ||
        !libros.length
    ) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    📚
                </span>

                <p>
                    No encontramos libros para esta selección.
                </p>

            </div>
        `;

        return;

    }


    libros.forEach(
        function(libro) {

            if (
                typeof crearTarjetaLibroAPI ===
                "function"
            ) {

                contenedor.appendChild(
                    crearTarjetaLibroAPI(
                        libro
                    )
                );

            }

            else {

                contenedor.appendChild(
                    crearTarjetaCatalogoFallback(
                        libro
                    )
                );

            }

        }
    );

}


/* ===================================================== */
/* TARJETA FALLBACK                                     */
/* ===================================================== */

function crearTarjetaCatalogoFallback(
    libro
) {

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
                        src="${escaparCatalogo(
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
            ${escaparCatalogo(
                libro.titulo
            )}
        </h3>


        <p class="autor">
            ${escaparCatalogo(
                libro.autor
            )}
        </p>


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


    tarjeta.onclick =
        function() {

            if (
                typeof abrirFichaLibro ===
                "function"
            ) {

                abrirFichaLibro(
                    libro
                );

            }

        };


    return tarjeta;

}


/* ===================================================== */
/* COMBINAR SIN DUPLICADOS                              */
/* ===================================================== */

function combinarCatalogo(
    lista1,
    lista2
) {

    const resultado = [];

    const usados =
        new Set();


    [
        ...lista1,
        ...lista2
    ]
    .forEach(
        function(libro) {

            const id =
                libro.gutenbergId ||
                libro.key ||
                libro.idInterno ||
                (
                    libro.titulo +
                    libro.autor
                );


            if (
                usados.has(
                    String(id)
                )
            ) {

                return;

            }


            usados.add(
                String(id)
            );


            resultado.push(
                libro
            );

        }
    );


    return resultado;

}


/* ===================================================== */
/* ESTADO                                               */
/* ===================================================== */

function ponerEstadoCatalogo(
    mensaje
) {

    const estado =
        document.getElementById(
            "estado-catalogo"
        );


    if (estado) {

        estado.textContent =
            mensaje;

    }

}


/* ===================================================== */
/* CARGANDO                                             */
/* ===================================================== */

function limpiarCatalogo() {

    const contenedor =
        document.getElementById(
            "catalogo-libros"
        );


    if (contenedor) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    📚
                </span>

                <p>
                    Cargando...
                </p>

            </div>
        `;

    }

}


/* ===================================================== */
/* NORMALIZAR TEXTO                                     */
/* ===================================================== */

function normalizarTextoCatalogo(
    texto
) {

    return String(
        texto || ""
    )

    .normalize("NFD")

    .replace(
        /[\u0300-\u036f]/g,
        ""
    )

    .toLowerCase()

    .replace(
        /[^a-z0-9]+/g,
        "-"
    )

    .replace(
        /^-+|-+$/g,
        ""
    );

}


/* ===================================================== */
/* HTML SEGURO                                          */
/* ===================================================== */

function escaparCatalogo(
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
/* ENTER EN BUSCADOR                                    */
/* ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const input =
            document.getElementById(
                "input-busqueda-catalogo"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function(evento) {

                    if (
                        evento.key ===
                        "Enter"
                    ) {

                        buscarEnCatalogo();

                    }

                }
            );

        }

    }
);


console.log(
    "✅ Catálogo Nere Infantil/Juvenil + Gratis cargado"
);