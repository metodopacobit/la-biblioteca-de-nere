/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS                                          */
/* Adultos + Infantil + Juvenil + idiomas + gratis      */
/* ===================================================== */


/* ===================================================== */
/* ESTADO DEL CATÁLOGO                                  */
/* ===================================================== */

window.estadoCatalogo = {

    tipo: "adultos",

    edad: "",

    categoria: "novela",

    soloGratis: false,

    idioma: "todos"

};


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const CATALOGO_OPEN_LIBRARY =
    "https://openlibrary.org/search.json";


const CATALOGO_GUTENDEX =
    "https://gutendex.com/books/";


/* ===================================================== */
/* IDIOMAS                                              */
/* ===================================================== */

const IDIOMAS_OPEN_LIBRARY = {

    es: "spa",
    en: "eng",
    fr: "fre",
    de: "ger",
    it: "ita",
    pt: "por"

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
            "fiction novels"

    },


    thriller: {

        nombre: "Thriller",
        icono: "🔪",

        adultos:
            "thriller suspense"

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

        adultos:
            "romance fiction"

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

        adultos:
            "science fiction"
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


/* ===================================================== */
/* CATEGORÍAS SEGÚN TIPO                                */
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

    if (
        tipo !== "adultos" &&
        tipo !== "infantil" &&
        tipo !== "juvenil"
    ) {

        tipo = "adultos";

    }


    window.estadoCatalogo.tipo =
        tipo;


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


    window.estadoCatalogo.soloGratis =
        false;


    window.estadoCatalogo.idioma =
        "todos";


    const titulo =
        document.getElementById(
            "titulo-catalogo"
        );


    if (titulo) {

        if (tipo === "adultos") {

            titulo.textContent =
                "📚 Adultos";

        }

        else if (tipo === "infantil") {

            titulo.textContent =
                "🧒 Infantil";

        }

        else {

            titulo.textContent =
                "🧑 Juvenil";

        }

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
            "todos";

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


    contenedor.innerHTML = "";


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


    contenedor.innerHTML = "";


    const tipo =
        window.estadoCatalogo.tipo;


    const categorias =
        CATEGORIAS_POR_TIPO[tipo] || [];


    categorias.forEach(
        function(clave) {

            const config =
                CATEGORIAS_NERE[clave];


            if (!config) {

                return;

            }


            const boton =
                document.createElement(
                    "button"
                );


            boton.dataset.categoria =
                clave;


            boton.innerHTML = `

                <span>
                    ${config.icono || "📚"}
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
/* CAMBIAR CATEGORÍA                                    */
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
/* IDIOMA CATÁLOGO                                      */
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


    if (
        !permitidos.includes(
            idioma
        )
    ) {

        idioma =
            "todos";

    }


    window.estadoCatalogo.idioma =
        idioma;


    recargarCatalogoActual();

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


    recargarCatalogoActual();

}


/* ===================================================== */
/* RECARGAR ESTADO ACTUAL                               */
/* ===================================================== */

function recargarCatalogoActual() {

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
/* BUSCADOR DEL CATÁLOGO                                */
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


        if (!configuracion) {

            throw new Error(
                "Categoría no encontrada."
            );

        }


        let consulta =
            configuracion[
                window.estadoCatalogo.tipo
            ];


        if (!consulta) {

            consulta =
                configuracion.nombre;

        }


        let libros = [];


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
/* MENSAJE SEGÚN SECCIÓN                                */
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

    }

    else if (tipo === "infantil") {

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
/* RESPALDO GRATIS                                      */
/* ===================================================== */

async function obtenerRespaldoGratis() {

    const tipo =
        window.estadoCatalogo.tipo;


    const categoria =
        window.estadoCatalogo.categoria;


    const consultas = [];


    if (tipo === "adultos") {

        consultas.push(
            "fiction"
        );


        if (categoria === "novela") {

            consultas.push(
                "novels"
            );

        }

        else if (categoria === "thriller") {

            consultas.push(
                "mystery"
            );

        }

        else if (categoria === "historia") {

            consultas.push(
                "historical fiction"
            );

        }

        else if (categoria === "romantica") {

            consultas.push(
                "romance"
            );

        }

        else if (categoria === "fantasia") {

            consultas.push(
                "fantasy fiction"
            );

        }

        else if (
            categoria ===
            "cienciaficcion"
        ) {

            consultas.push(
                "science fiction"
            );

        }

        else if (categoria === "clasicos") {

            consultas.push(
                "classic literature"
            );

        }

    }

    else if (tipo === "infantil") {

        consultas.push(
            "children"
        );


        if (categoria === "aventuras") {

            consultas.push(
                "adventure"
            );

        }

        else if (categoria === "fantasia") {

            consultas.push(
                "fairy tales"
            );

        }

        else if (categoria === "misterio") {

            consultas.push(
                "mystery"
            );

        }

        else if (categoria === "animales") {

            consultas.push(
                "animals"
            );

        }

        else if (categoria === "historia") {

            consultas.push(
                "history"
            );

        }

        else if (categoria === "clasicos") {

            consultas.push(
                "children literature"
            );

        }

    }

    else {

        consultas.push(
            "juvenile fiction"
        );


        if (categoria === "aventuras") {

            consultas.push(
                "adventure stories"
            );

        }

        else if (categoria === "fantasia") {

            consultas.push(
                "fantasy fiction"
            );

        }

        else if (categoria === "misterio") {

            consultas.push(
                "detective mystery stories"
            );

        }

        else if (categoria === "animales") {

            consultas.push(
                "animals fiction"
            );

        }

        else if (categoria === "historia") {

            consultas.push(
                "historical fiction"
            );

        }

        else if (categoria === "clasicos") {

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

    let consultaFinal =
        consulta;


    const idioma =
        window.estadoCatalogo.idioma;


    let codigoIdioma =
        null;


    if (
        idioma &&
        idioma !== "todos"
    ) {

        codigoIdioma =
            IDIOMAS_OPEN_LIBRARY[
                idioma
            ];


        if (codigoIdioma) {

            consultaFinal +=
                " language:" +
                codigoIdioma;

        }

    }


    const url =
        CATALOGO_OPEN_LIBRARY +
        "?q=" +
        encodeURIComponent(
            consultaFinal
        ) +
        "&limit=50";


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


    let libros =
        (datos.docs || [])
        .map(
            normalizarLibroCatalogoOpenLibrary
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


    return libros.slice(
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


/* ===================================================== */
/* GUTENDEX                                             */
/* ===================================================== */

async function buscarCatalogoGratis(
    consulta,
    esBusquedaManual = false
) {

    const parametro =
        esBusquedaManual
            ? "search"
            : "topic";


    let url =
        CATALOGO_GUTENDEX +
        "?" +
        parametro +
        "=" +
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


    let libros =
        (datos.results || [])
        .map(
            normalizarLibroCatalogoGutendex
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

            if (
                window.estadoCatalogo.tipo ===
                "adultos"
            ) {

                libro.edad = "";

            }

            else {

                libro.edad =
                    window.estadoCatalogo.edad +
                    " años";

            }


            libro.categoria =
                nombreCategoria;


            libro.seccion =
                window.estadoCatalogo.tipo;

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


    contenedor.innerHTML = "";


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
    "✅ Catálogo Nere + filtro estricto de idiomas cargado"
);