/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS - VERSIÓN ESTABLE                        */
/* Infantil + Juvenil                                   */
/* ===================================================== */


/* ===================================================== */
/* ESTADO                                               */
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

        nombre: "Aventuras",

        infantil:
            "children adventure",

        juvenil:
            "young adult adventure"

    },


    fantasia: {

        nombre: "Fantasía",

        infantil:
            "children fantasy",

        juvenil:
            "young adult fantasy"

    },


    misterio: {

        nombre: "Misterio",

        infantil:
            "children mystery",

        juvenil:
            "young adult mystery"

    },


    animales: {

        nombre: "Animales",

        infantil:
            "children animals",

        juvenil:
            "juvenile animals"

    },


    historia: {

        nombre: "Historia",

        infantil:
            "children historical fiction",

        juvenil:
            "young adult historical fiction"

    },


    clasicos: {

        nombre: "Clásicos",

        infantil:
            "children classics",

        juvenil:
            "classic juvenile literature"

    }

};


/* ===================================================== */
/* ABRIR INFANTIL / JUVENIL                             */
/* ===================================================== */

function abrirCatalogo(tipo) {

    if (
        tipo !== "infantil" &&
        tipo !== "juvenil"
    ) {

        tipo = "infantil";

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


    /* TITULO */

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


    /* LIMPIAR BUSCADOR */

    const buscador =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (buscador) {

        buscador.value = "";

    }


    /* GRATIS DESACTIVADO */

    const gratis =
        document.getElementById(
            "solo-gratis"
        );


    if (gratis) {

        gratis.checked = false;

    }


    pintarEdadesCatalogo();

    seleccionarCategoriaVisual(
        "aventuras"
    );


    /*
      app.js controla las pantallas.
    */

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


    contenedor.innerHTML = "";


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


    /*
      Solo recargamos recomendaciones.
      Si hay una búsqueda escrita,
      respetamos esa búsqueda.
    */

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
/* CATEGORÍA VISUAL                                     */
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
            .classList
            .add(
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
/* BUSCADOR INFANTIL / JUVENIL                         */
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

        let libros;


        /*
          CON SOLO GRATIS:
          buscamos directamente en Gutenberg.
        */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarCatalogoGratis(
                    consulta
                );

        }

        /*
          SIN SOLO GRATIS:
          búsqueda normal de Open Library.

          MUY IMPORTANTE:
          NO añadimos "children" ni "young adult"
          al título escrito.

          Así, si buscas Harry Potter,
          busca Harry Potter de verdad.
        */

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


        let libros;


        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarCatalogoGratis(
                    consulta
                );

        }

        else {

            libros =
                await buscarCatalogoGeneral(
                    consulta
                );

        }


        /*
          Si Open Library devuelve poco,
          probamos una consulta más amplia.
        */

        if (
            libros.length < 6 &&
            !window.estadoCatalogo.soloGratis
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


        ponerEstadoCatalogo(

            window.estadoCatalogo.tipo ===
            "infantil"

                ? "🧒 Libros infantiles recomendados"

                : "🧑 Libros juveniles recomendados"
        );

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
/* OPEN LIBRARY DIRECTO                                 */
/* ===================================================== */

async function buscarCatalogoGeneral(
    consulta
) {

    /*
      Consulta intencionadamente sencilla.

      Es el mismo tipo de llamada que ya
      sabemos que funciona en el buscador
      general.
    */

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
                Date.now() +
                "-" +
                Math.random()
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
/* GUTENDEX DIRECTO                                     */
/* ===================================================== */

async function buscarCatalogoGratis(
    consulta
) {

    const url =
        CATALOGO_GUTENDEX +
        "?search=" +
        encodeURIComponent(
            consulta
        );


    console.log(
        "CATÁLOGO GUTENDEX:",
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
        20
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
            (
                libro.summaries &&
                libro.summaries.length
            )
                ? libro.summaries[0]
                : (
                    (libro.title || "Este libro") +
                    " está disponible gratuitamente en Project Gutenberg."
                )

    };

}


/* ===================================================== */
/* EDAD + CATEGORÍA                                     */
/* ===================================================== */

function aplicarDatosCatalogo(
    libros
) {

    const nombreCategoria =
        CATEGORIAS_NERE[
            window.estadoCatalogo
                .categoria
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
/* PINTAR RESULTADOS                                    */
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


    contenedor.innerHTML = "";


    if (!libros.length) {

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

            /*
              Reutilizamos la tarjeta que YA
              funciona en el buscador general.
            */

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

                /*
                  Fallback de seguridad.
                */

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
/* FALLBACK TARJETA                                     */
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
/* COMBINAR                                             */
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
                libro.key ||
                libro.idInterno ||
                (
                    libro.titulo +
                    libro.autor
                );


            if (
                usados.has(id)
            ) {

                return;

            }


            usados.add(id);

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
/* LIMPIAR                                              */
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
/* ESCAPAR                                              */
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
    "✅ Catálogo Infantil/Juvenil independiente cargado"
);