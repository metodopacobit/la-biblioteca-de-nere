/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS                                          */
/* Adultos + Infantil + Juvenil + idiomas               */
/* ===================================================== */


window.estadoCatalogo = {

    tipo: "adultos",

    edad: "",

    categoria: "novela",

    soloGratis: false,

    idioma: "todos"
};


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

    novela: {

        nombre: "Novela",
        icono: "📖",
        adultos: "novel fiction"
    },

    thriller: {

        nombre: "Thriller",
        icono: "🔪",
        adultos: "thriller suspense"
    },

    historia: {

        nombre: "Histórica",
        icono: "🏰",

        adultos:
            "historical fiction",

        infantil:
            "children historical fiction",

        juvenil:
            "juvenile historical fiction"
    },

    romantica: {

        nombre: "Romántica",
        icono: "💕",
        adultos: "romance fiction"
    },

    fantasia: {

        nombre: "Fantasía",
        icono: "🪄",

        adultos:
            "fantasy fiction",

        infantil:
            "children fantasy",

        juvenil:
            "juvenile fantasy"
    },

    cienciaficcion: {

        nombre: "Ciencia ficción",
        icono: "🚀",
        adultos: "science fiction"
    },

    clasicos: {

        nombre: "Clásicos",
        icono: "📘",

        adultos:
            "classic literature",

        infantil:
            "children classics",

        juvenil:
            "juvenile classics"
    },

    aventuras: {

        nombre: "Aventuras",
        icono: "⭐",

        infantil:
            "children adventure",

        juvenil:
            "juvenile adventure"
    },

    misterio: {

        nombre: "Misterio",
        icono: "🔎",

        infantil:
            "children mystery",

        juvenil:
            "juvenile mystery"
    },

    animales: {

        nombre: "Animales",
        icono: "🐾",

        infantil:
            "children animals",

        juvenil:
            "juvenile animals"
    }
};


const CATEGORIAS_POR_TIPO = {

    adultos: [
        "novela",
        "thriller",
        "historia",
        "romantica",
        "fantasia",
        "cienciaficcion",
        "clasicos"
    ],

    infantil: [
        "aventuras",
        "fantasia",
        "misterio",
        "animales",
        "historia",
        "clasicos"
    ],

    juvenil: [
        "aventuras",
        "fantasia",
        "misterio",
        "animales",
        "historia",
        "clasicos"
    ]
};


/* ===================================================== */
/* ABRIR CATÁLOGO                                       */
/* ===================================================== */

function abrirCatalogo(
    tipo
) {

    if (
        ![
            "adultos",
            "infantil",
            "juvenil"
        ].includes(tipo)
    ) {

        tipo =
            "adultos";
    }


    window.estadoCatalogo.tipo =
        tipo;


    if (
        tipo === "adultos"
    ) {

        window.estadoCatalogo.edad =
            "";

        window.estadoCatalogo.categoria =
            "novela";

    } else if (
        tipo === "infantil"
    ) {

        window.estadoCatalogo.edad =
            "6-8";

        window.estadoCatalogo.categoria =
            "aventuras";

    } else {

        window.estadoCatalogo.edad =
            "12-14";

        window.estadoCatalogo.categoria =
            "aventuras";
    }


    window.estadoCatalogo.soloGratis =
        false;

    window.estadoCatalogo.idioma =
        "todos";


    const titulo =
        document.getElementById(
            "titulo-catalogo"
        );


    if (titulo) {

        titulo.textContent =
            tipo === "adultos"

                ? "📚 Adultos"

                : tipo === "infantil"

                ? "🧒 Infantil"

                : "🧑 Juvenil";
    }


    const buscador =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (buscador) {
        buscador.value = "";
    }


    const gratis =
        document.getElementById(
            "solo-gratis"
        );


    if (gratis) {
        gratis.checked = false;
    }


    const idioma =
        document.getElementById(
            "idioma-catalogo"
        );


    if (idioma) {
        idioma.value = "todos";
    }


    pintarEdadesCatalogo();

    pintarCategoriasCatalogo();


    mostrarPantalla(
        "pantalla-catalogo"
    );


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


    const tipo =
        window.estadoCatalogo.tipo;


    if (
        tipo === "adultos"
    ) {

        contenedor.style.display =
            "none";

        return;
    }


    contenedor.style.display =
        "";


    const edades =
        EDADES_CATALOGO[
            tipo
        ] || [];


    edades.forEach(
        edad => {

            const boton =
                document.createElement(
                    "button"
                );


            boton.textContent =
                edad.texto;


            boton.classList.toggle(
                "activo",
                edad.clave ===
                window.estadoCatalogo.edad
            );


            boton.onclick =
                () =>
                    filtrarEdad(
                        edad.clave,
                        boton
                    );


            contenedor.appendChild(
                boton
            );
        }
    );
}


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
            elemento =>
                elemento.classList.remove(
                    "activo"
                )
        );


    boton
        ?.classList
        .add(
            "activo"
        );


    recargarCatalogoActual();
}


/* ===================================================== */
/* CATEGORÍAS                                           */
/* ===================================================== */

function pintarCategoriasCatalogo() {

    const contenedor =
        document.getElementById(
            "categorias-catalogo"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        "";


    const categorias =
        CATEGORIAS_POR_TIPO[
            window.estadoCatalogo.tipo
        ] || [];


    categorias.forEach(
        clave => {

            const config =
                CATEGORIAS_NERE[
                    clave
                ];


            const boton =
                document.createElement(
                    "button"
                );


            boton.innerHTML = `

                <span>
                    ${config.icono}
                </span>

                ${escaparCatalogo(
                    config.nombre
                )}
            `;


            boton.classList.toggle(
                "activo",
                clave ===
                window.estadoCatalogo.categoria
            );


            boton.onclick =
                () =>
                    filtrarCategoria(
                        clave,
                        boton
                    );


            contenedor.appendChild(
                boton
            );
        }
    );
}


function filtrarCategoria(
    categoria,
    boton
) {

    window.estadoCatalogo.categoria =
        categoria;


    document
        .querySelectorAll(
            "#categorias-catalogo button"
        )
        .forEach(
            elemento =>
                elemento.classList.remove(
                    "activo"
                )
        );


    boton
        ?.classList
        .add(
            "activo"
        );


    recargarCatalogoActual();
}


/* ===================================================== */
/* IDIOMA                                               */
/* ===================================================== */

function cambiarIdiomaCatalogo(
    idioma
) {

    const permitidos = [
        "todos",
        "es",
        "en",
        "fr",
        "de",
        "it",
        "pt"
    ];


    window.estadoCatalogo.idioma =
        permitidos.includes(idioma)
            ? idioma
            : "todos";


    recargarCatalogoActual();
}


/* ===================================================== */
/* GRATIS                                               */
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


    recargarCatalogoActual();
}


/* ===================================================== */
/* RECARGAR                                             */
/* ===================================================== */

function recargarCatalogoActual() {

    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (
        input &&
        input.value.trim()
    ) {

        buscarEnCatalogo();

    } else {

        cargarSeleccionCatalogo();
    }
}


/* ===================================================== */
/* BUSCADOR MANUAL                                      */
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


        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarLibrosGratis(
                    consulta,
                    window.estadoCatalogo.idioma
                );

        } else {

            /*
               Usamos el buscador general nuevo,
               que ya selecciona la edición
               correcta según el idioma.
            */

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma
                );
        }


        aplicarDatosCatalogo(
            libros
        );


        pintarLibrosCatalogo(
            libros
        );


        ponerEstadoCatalogo(

            libros.length

                ? libros.length +
                  " resultados encontrados"

                : "No se encontraron libros."
        );

    } catch (error) {

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
/* RECOMENDACIONES                                      */
/* ===================================================== */

async function cargarSeleccionCatalogo() {

    ponerEstadoCatalogo(
        "📚 Cargando libros..."
    );


    limpiarCatalogo();


    try {

        const configuracion =
            CATEGORIAS_NERE[
                window.estadoCatalogo.categoria
            ];


        const consulta =
            configuracion[
                window.estadoCatalogo.tipo
            ]
            ||
            configuracion.nombre;


        let libros = [];


        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarCatalogoGratisTema(
                    consulta
                );

        } else {

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma
                );
        }


        aplicarDatosCatalogo(
            libros
        );


        pintarLibrosCatalogo(
            libros
        );


        ponerMensajeCatalogo(
            libros
        );

    } catch (error) {

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
/* GUTENBERG POR TEMA                                   */
/* ===================================================== */

async function buscarCatalogoGratisTema(
    consulta
) {

    let url =
        API_GUTENDEX +
        "?topic=" +
        encodeURIComponent(
            consulta
        ) +
        "&sort=popular";


    const idioma =
        window.estadoCatalogo.idioma;


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
        await fetch(url);


    if (!respuesta.ok) {

        throw new Error(
            "Gutendex catálogo: " +
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
                    libro.idiomas.includes(
                        idioma
                    )
            );
    }


    return libros.slice(
        0,
        24
    );
}


/* ===================================================== */
/* INFORMACIÓN EXTRA                                    */
/* ===================================================== */

function aplicarDatosCatalogo(
    libros
) {

    const categoria =
        CATEGORIAS_NERE[
            window.estadoCatalogo.categoria
        ];


    libros.forEach(
        libro => {

            libro.categoria =
                categoria
                    ? categoria.nombre
                    : "";


            libro.seccion =
                window.estadoCatalogo.tipo;


            libro.edad =
                window.estadoCatalogo.tipo ===
                "adultos"

                    ? ""

                    : (
                        window.estadoCatalogo.edad +
                        " años"
                    );
        }
    );
}


/* ===================================================== */
/* MENSAJE                                              */
/* ===================================================== */

function ponerMensajeCatalogo(
    libros
) {

    if (!libros.length) {

        ponerEstadoCatalogo(
            "No encontramos libros para esta selección."
        );

        return;
    }


    const tipo =
        window.estadoCatalogo.tipo;


    const gratis =
        window.estadoCatalogo.soloGratis;


    if (tipo === "adultos") {

        ponerEstadoCatalogo(
            gratis
                ? "🟢 Libros para adultos gratuitos"
                : "📚 Libros para adultos recomendados"
        );

    } else if (
        tipo === "infantil"
    ) {

        ponerEstadoCatalogo(
            gratis
                ? "🟢 Libros infantiles gratuitos"
                : "🧒 Libros infantiles recomendados"
        );

    } else {

        ponerEstadoCatalogo(
            gratis
                ? "🟢 Libros juveniles gratuitos"
                : "🧑 Libros juveniles recomendados"
        );
    }
}


/* ===================================================== */
/* PINTAR LIBROS                                        */
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


    if (!libros.length) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>📚</span>

                <p>
                    No encontramos libros para esta selección.
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
/* ESTADOS                                              */
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


function limpiarCatalogo() {

    const contenedor =
        document.getElementById(
            "catalogo-libros"
        );


    if (contenedor) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>📚</span>

                <p>Cargando...</p>

            </div>
        `;
    }
}


/* ===================================================== */
/* HTML SEGURO                                          */
/* ===================================================== */

function escaparCatalogo(
    texto
) {

    return String(texto || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* ===================================================== */
/* ENTER                                                */
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
    "✅ Catálogo Nere v1.1 · ediciones por idioma cargado"
);