/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS · v1.1                                   */
/* Adultos + Infantil + Juvenil + idiomas + gratis      */
/* ===================================================== */


/* ===================================================== */
/* ESTADO                                               */
/* ===================================================== */

window.estadoCatalogo = {

    tipo: "adultos",

    edad: "",

    categoria: "novela",

    soloGratis: false,

    idioma: "es"

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

        adultos:
            "fiction"

    },


    thriller: {

        nombre: "Thriller",
        icono: "🔪",

        adultos:
            "mystery"

    },


    historia: {

        nombre: "Histórica",
        icono: "🏰",

        adultos:
            "historical fiction",

        infantil:
            "children history",

        juvenil:
            "juvenile historical fiction"

    },


    romantica: {

        nombre: "Romántica",
        icono: "💕",

        adultos:
            "romance"

    },


    fantasia: {

        nombre: "Fantasía",
        icono: "🪄",

        adultos:
            "fantasy",

        infantil:
            "fairy tales",

        juvenil:
            "fantasy fiction"

    },


    cienciaficcion: {

        nombre: "Ciencia ficción",
        icono: "🚀",

        adultos:
            "science fiction"

    },


    clasicos: {

        nombre: "Clásicos",
        icono: "📘",

        adultos:
            "classic literature",

        infantil:
            "children literature",

        juvenil:
            "juvenile literature"

    },


    aventuras: {

        nombre: "Aventuras",
        icono: "⭐",

        infantil:
            "children adventure",

        juvenil:
            "adventure stories"

    },


    misterio: {

        nombre: "Misterio",
        icono: "🔎",

        infantil:
            "children mystery",

        juvenil:
            "mystery stories"

    },


    animales: {

        nombre: "Animales",
        icono: "🐾",

        infantil:
            "animals",

        juvenil:
            "animals fiction"

    }

};


/* ===================================================== */
/* CATEGORÍAS POR SECCIÓN                               */
/* ===================================================== */

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

function abrirCatalogo(tipo) {

    const permitidos = [
        "adultos",
        "infantil",
        "juvenil"
    ];


    if (!permitidos.includes(tipo)) {

        tipo = "adultos";

    }


    window.estadoCatalogo.tipo =
        tipo;


    /* ESPAÑOL POR DEFECTO */

    window.estadoCatalogo.idioma =
        "es";


    window.estadoCatalogo.soloGratis =
        false;


    if (tipo === "adultos") {

        window.estadoCatalogo.edad =
            "";

        window.estadoCatalogo.categoria =
            "novela";

    }

    else if (tipo === "infantil") {

        window.estadoCatalogo.edad =
            "6-8";

        window.estadoCatalogo.categoria =
            "aventuras";

    }

    else {

        window.estadoCatalogo.edad =
            "12-14";

        window.estadoCatalogo.categoria =
            "aventuras";

    }


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

        gratis.checked =
            false;

    }


    const selectorIdioma =
        document.getElementById(
            "idioma-catalogo"
        );


    if (selectorIdioma) {

        selectorIdioma.value =
            "es";

    }


    pintarEdadesCatalogo();

    pintarCategoriasCatalogo();


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


    const tipo =
        window.estadoCatalogo.tipo;


    if (tipo === "adultos") {

        contenedor.style.display =
            "none";

        return;

    }


    contenedor.style.display =
        "";


    const edades =
        EDADES_CATALOGO[tipo] || [];


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
/* FILTRAR EDAD                                         */
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


    recargarCatalogoActual();

}


/* ===================================================== */
/* PINTAR CATEGORÍAS                                    */
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
        function(clave) {

            const config =
                CATEGORIAS_NERE[
                    clave
                ];


            if (!config) {

                return;

            }


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


            if (
                clave ===
                window.estadoCatalogo.categoria
            ) {

                boton.classList.add(
                    "activo"
                );

            }


            boton.onclick =
                function() {

                    filtrarCategoria(
                        clave,
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
/* FILTRAR CATEGORÍA                                    */
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
            "#categorias-catalogo button"
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


    recargarCatalogoActual();

}


/* ===================================================== */
/* IDIOMA                                               */
/* ===================================================== */

function cambiarIdiomaCatalogo(
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


    window.estadoCatalogo.idioma =
        permitidos.includes(
            idioma
        )
            ? idioma
            : "es";


    recargarCatalogoActual();

}


/* ===================================================== */
/* SOLO GRATIS                                          */
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

    }

    else {

        cargarSeleccionCatalogo();

    }

}


/* ===================================================== */
/* BÚSQUEDA MANUAL                                      */
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

        let libros =
            [];


        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarLibrosGratis(
                    consulta,
                    window.estadoCatalogo.idioma
                );

        }

        else {

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma,
                    true
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

                ? (
                    libros.length +
                    " resultados encontrados"
                )

                : "No se encontraron libros."

        );

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


        if (!configuracion) {

            throw new Error(
                "Categoría no encontrada"
            );

        }


        const consulta =
            configuracion[
                window.estadoCatalogo.tipo
            ]
            ||
            configuracion.nombre;


        let libros =
            [];


        /* =================================================
           GRATIS
        ================================================= */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await cargarGratisRobusto(
                    consulta
                );

        }


        /* =================================================
           CATÁLOGO GENERAL
        ================================================= */

        else {

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma,
                    false
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
/* GRATIS ROBUSTO                                       */
/* ===================================================== */

async function cargarGratisRobusto(
    consultaPrincipal
) {

    let resultado =
        [];


    /*
       1. Intentamos primero buscar
       directamente por tema.
    */

    try {

        const porTema =
            await buscarGratisPorTema(
                consultaPrincipal
            );


        resultado =
            combinarCatalogoGratis(
                resultado,
                porTema
            );

    }

    catch (error) {

        console.warn(
            "No funcionó el tema principal gratis:",
            error
        );

    }


    /*
       2. Si encontramos pocos,
       utilizamos búsquedas alternativas.
    */

    if (
        resultado.length <
        12
    ) {

        const consultas =
            obtenerConsultasRespaldoGratis();


        for (
            const consulta of consultas
        ) {

            try {

                /*
                   Primero buscamos como SEARCH.
                   Gutenberg suele ser más flexible así.
                */

                const encontrados =
                    await buscarLibrosGratis(
                        consulta,
                        window.estadoCatalogo.idioma
                    );


                resultado =
                    combinarCatalogoGratis(
                        resultado,
                        encontrados
                    );


                if (
                    resultado.length >=
                    20
                ) {

                    break;

                }

            }

            catch (error) {

                console.warn(
                    "Fallo respaldo gratis:",
                    consulta
                );

            }

        }

    }


    return resultado.slice(
        0,
        24
    );

}


/* ===================================================== */
/* BUSCAR GRATIS POR TEMA                               */
/* ===================================================== */

async function buscarGratisPorTema(
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


    return libros;

}


/* ===================================================== */
/* CONSULTAS DE RESPALDO GRATIS                         */
/* ===================================================== */

function obtenerConsultasRespaldoGratis() {

    const tipo =
        window.estadoCatalogo.tipo;


    const categoria =
        window.estadoCatalogo.categoria;


    const consultas =
        [];


    /* ================= ADULTOS ================= */

    if (
        tipo === "adultos"
    ) {

        if (
            categoria === "novela"
        ) {

            consultas.push(
                "novela",
                "fiction",
                "novel"
            );

        }


        else if (
            categoria === "thriller"
        ) {

            consultas.push(
                "misterio",
                "mystery",
                "detective"
            );

        }


        else if (
            categoria === "historia"
        ) {

            consultas.push(
                "historia",
                "historical",
                "historical fiction"
            );

        }


        else if (
            categoria === "romantica"
        ) {

            consultas.push(
                "romance",
                "love",
                "romantic"
            );

        }


        else if (
            categoria === "fantasia"
        ) {

            consultas.push(
                "fantasy",
                "fantasia",
                "legends"
            );

        }


        else if (
            categoria ===
            "cienciaficcion"
        ) {

            consultas.push(
                "science fiction",
                "science",
                "future"
            );

        }


        else {

            consultas.push(
                "classic",
                "literature",
                "clasicos"
            );

        }

    }


    /* ================= INFANTIL ================= */

    else if (
        tipo === "infantil"
    ) {

        if (
            categoria === "aventuras"
        ) {

            consultas.push(
                "children",
                "adventure",
                "cuentos"
            );

        }


        else if (
            categoria === "fantasia"
        ) {

            consultas.push(
                "fairy tales",
                "children",
                "fantasy"
            );

        }


        else if (
            categoria === "misterio"
        ) {

            consultas.push(
                "children mystery",
                "mystery",
                "children"
            );

        }


        else if (
            categoria === "animales"
        ) {

            consultas.push(
                "animals",
                "children animals",
                "fables"
            );

        }


        else if (
            categoria === "historia"
        ) {

            consultas.push(
                "children history",
                "history",
                "children"
            );

        }


        else {

            consultas.push(
                "children literature",
                "children",
                "cuentos"
            );

        }

    }


    /* ================= JUVENIL ================= */

    else {

        if (
            categoria === "aventuras"
        ) {

            consultas.push(
                "adventure",
                "juvenile fiction",
                "adventure stories"
            );

        }


        else if (
            categoria === "fantasia"
        ) {

            consultas.push(
                "fantasy",
                "juvenile fiction",
                "fairy tales"
            );

        }


        else if (
            categoria === "misterio"
        ) {

            consultas.push(
                "mystery",
                "detective",
                "juvenile fiction"
            );

        }


        else if (
            categoria === "animales"
        ) {

            consultas.push(
                "animals",
                "animal stories",
                "juvenile fiction"
            );

        }


        else if (
            categoria === "historia"
        ) {

            consultas.push(
                "historical fiction",
                "history",
                "juvenile fiction"
            );

        }


        else {

            consultas.push(
                "juvenile literature",
                "juvenile fiction",
                "classic"
            );

        }

    }


    return consultas;

}


/* ===================================================== */
/* COMBINAR GRATIS SIN DUPLICADOS                       */
/* ===================================================== */

function combinarCatalogoGratis(
    lista1,
    lista2
) {

    const resultado =
        [];


    const usados =
        new Set();


    [
        ...(lista1 || []),
        ...(lista2 || [])
    ]
    .forEach(
        function(libro) {

            const id =
                libro.gutenbergId ||
                libro.id ||
                libro.idInterno ||
                (
                    libro.titulo +
                    "-" +
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
/* DATOS DEL CATÁLOGO                                   */
/* ===================================================== */

function aplicarDatosCatalogo(
    libros
) {

    const categoria =
        CATEGORIAS_NERE[
            window.estadoCatalogo.categoria
        ];


    libros.forEach(
        function(libro) {

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

    if (
        !libros ||
        !libros.length
    ) {

        ponerEstadoCatalogo(
            "No encontramos libros para esta selección."
        );

        return;

    }


    const tipo =
        window.estadoCatalogo.tipo;


    const gratis =
        window.estadoCatalogo.soloGratis;


    if (
        tipo === "adultos"
    ) {

        ponerEstadoCatalogo(

            gratis

                ? "🟢 Libros para adultos gratuitos"

                : "📚 Libros para adultos recomendados"

        );

    }


    else if (
        tipo === "infantil"
    ) {

        ponerEstadoCatalogo(

            gratis

                ? "🟢 Libros infantiles gratuitos"

                : "🧒 Libros infantiles recomendados"

        );

    }


    else {

        ponerEstadoCatalogo(

            gratis

                ? "🟢 Libros juveniles gratuitos"

                : "🧑 Libros juveniles recomendados"

        );

    }

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

        }
    );

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
    "✅ Catálogo Nere v1.1 · Gratis robusto + Español cargado"
);