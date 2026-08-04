/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* APP.JS                                               */
/* ===================================================== */


/* ===================================================== */
/* ESTADO GENERAL                                       */
/* ===================================================== */

window.estadoApp = {

    pantallaActual: "pantalla-inicio",

    pantallaAnterior: "pantalla-inicio",

    filtroBusqueda: "todo",

    estadoBiblioteca: "quiero",

    libroActual: null

};


/* ===================================================== */
/* LOCAL STORAGE                                        */
/* ===================================================== */

const CLAVE_BIBLIOTECA = "bibliotecaNere";

const CLAVE_PROGRESOS = "progresosNere";


function obtenerBiblioteca() {

    try {

        const datos =
            localStorage.getItem(
                CLAVE_BIBLIOTECA
            );

        if (!datos) {
            return [];
        }

        const biblioteca =
            JSON.parse(datos);

        return Array.isArray(biblioteca)
            ? biblioteca
            : [];

    }

    catch (error) {

        console.error(
            "Error leyendo biblioteca:",
            error
        );

        return [];

    }

}


function guardarBibliotecaLocal(
    biblioteca
) {

    try {

        localStorage.setItem(
            CLAVE_BIBLIOTECA,
            JSON.stringify(
                biblioteca
            )
        );

    }

    catch (error) {

        console.error(
            "Error guardando biblioteca:",
            error
        );

    }

    actualizarResumenBiblioteca();

    pintarContinuarLeyendo();

}


function obtenerProgresos() {

    try {

        const datos =
            localStorage.getItem(
                CLAVE_PROGRESOS
            );

        if (!datos) {
            return {};
        }

        return JSON.parse(datos) || {};

    }

    catch (error) {

        console.error(
            "Error leyendo progresos:",
            error
        );

        return {};

    }

}


/* ===================================================== */
/* IDENTIFICADOR                                        */
/* ===================================================== */

function obtenerIdLibro(
    libro
) {

    if (!libro) {
        return null;
    }

    if (libro.idInterno) {
        return String(libro.idInterno);
    }

    if (libro.gutenbergId) {

        return (
            "gutenberg-"
            +
            libro.gutenbergId
        );

    }

    if (libro.key) {
        return String(libro.key);
    }

    if (libro.id) {
        return String(libro.id);
    }


    return (
        "libro-"
        +
        normalizarTexto(
            (
                libro.titulo
                ||
                libro.title
                ||
                ""
            )
            +
            "-"
            +
            (
                libro.autor
                ||
                libro.author
                ||
                ""
            )
        )
    );

}


function normalizarTexto(
    texto
) {

    return String(texto || "")

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
/* NAVEGACIÓN                                           */
/* ===================================================== */

function mostrarPantalla(
    idPantalla
) {

    const destino =
        document.getElementById(
            idPantalla
        );


    if (!destino) {

        console.error(
            "Pantalla inexistente:",
            idPantalla
        );

        return;

    }


    const actual =
        document.querySelector(
            ".pantalla.activa"
        );


    if (
        actual
        &&
        actual.id !== idPantalla
    ) {

        window.estadoApp
            .pantallaAnterior =
            actual.id;

    }


    document
        .querySelectorAll(
            ".pantalla"
        )
        .forEach(

            pantalla =>
                pantalla.classList.remove(
                    "activa"
                )

        );


    destino.classList.add(
        "activa"
    );


    window.estadoApp
        .pantallaActual =
        idPantalla;


    actualizarNavegacionInferior(
        idPantalla
    );


    if (
        idPantalla !==
        "pantalla-lector"
    ) {

        window.scrollTo(
            0,
            0
        );

    }


    if (
        idPantalla ===
        "pantalla-inicio"
    ) {

        actualizarResumenBiblioteca();

        pintarContinuarLeyendo();

    }

}


/* ===================================================== */
/* NAVEGACIÓN INFERIOR                                  */
/* ===================================================== */

function actualizarNavegacionInferior(
    pantalla
) {

    const navegacion =
        document.getElementById(
            "navegacion-inferior"
        );


    if (!navegacion) {
        return;
    }


    if (
        pantalla ===
        "pantalla-lector"
    ) {

        navegacion.style.display =
            "none";

        return;

    }


    navegacion.style.display =
        "grid";


    const botones =
        navegacion.querySelectorAll(
            "button"
        );


    botones.forEach(

        boton =>
            boton.classList.remove(
                "nav-activo"
            )

    );


    if (
        pantalla ===
        "pantalla-inicio"
    ) {

        botones[0]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    else if (
        pantalla ===
        "pantalla-buscar"
    ) {

        botones[1]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    else if (
        pantalla ===
        "pantalla-catalogo"
    ) {

        botones[2]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    else if (
        pantalla ===
        "pantalla-biblioteca"
    ) {

        botones[3]
            ?.classList
            .add(
                "nav-activo"
            );

    }

}


/* ===================================================== */
/* BOTÓN GRATIS                                         */
/* ===================================================== */

function crearBotonGratisBusqueda() {

    const filtros =
        document.querySelector(
            ".filtros-busqueda"
        );


    if (!filtros) {
        return;
    }


    if (
        filtros.querySelector(
            '[data-filtro="gratis"]'
        )
    ) {

        return;

    }


    const boton =
        document.createElement(
            "button"
        );


    boton.className =
        "filtro";


    boton.dataset.filtro =
        "gratis";


    boton.innerHTML =
        "🟢 Gratis";


    boton.onclick =
        function() {

            cambiarFiltroBusqueda(
                "gratis",
                boton
            );

        };


    filtros.appendChild(
        boton
    );

}


/* ===================================================== */
/* BUSCAR DESDE INICIO                                  */
/* ===================================================== */

function buscarDesdeInicio() {

    const input =
        document.getElementById(
            "input-busqueda"
        );


    const texto =
        input?.value.trim()
        || "";


    abrirBuscar();


    const destino =
        document.getElementById(
            "input-busqueda-resultados"
        );


    if (destino) {

        destino.value =
            texto;

    }


    if (
        texto
        &&
        typeof buscarLibros
        === "function"
    ) {

        buscarLibros();

    }

}


function abrirBuscar() {

    mostrarPantalla(
        "pantalla-buscar"
    );


    setTimeout(
        () => {

            document
                .getElementById(
                    "input-busqueda-resultados"
                )
                ?.focus();

        },
        100
    );

}


/* ===================================================== */
/* FILTROS                                              */
/* ===================================================== */

function cambiarFiltroBusqueda(
    filtro,
    boton
) {

    window.estadoApp
        .filtroBusqueda =
        filtro;


    document
        .querySelectorAll(
            ".filtros-busqueda .filtro"
        )
        .forEach(

            elemento =>
                elemento
                    .classList
                    .remove(
                        "activo"
                    )

        );


    boton
        ?.classList
        .add(
            "activo"
        );


    const input =
        document.getElementById(
            "input-busqueda-resultados"
        );


    if (
        input?.value.trim()
        &&
        typeof buscarLibros
        === "function"
    ) {

        buscarLibros();

    }

}


/* ===================================================== */
/* LIBRO ACTUAL                                         */
/* ===================================================== */

function establecerLibroActual(
    libro
) {

    if (!libro) {
        return null;
    }


    const normalizado = {

        ...libro,

        titulo:
            libro.titulo
            ||
            libro.title
            ||
            "Sin título",

        autor:
            libro.autor
            ||
            libro.author
            ||
            "Autor desconocido",

        portada:
            libro.portada
            ||
            libro.cover
            ||
            libro.coverUrl
            ||
            "",

        resena:
            libro.resena
            ||
            libro.descripcion
            ||
            libro.summary
            ||
            "",

        gratis:
            Boolean(
                libro.gratis
                ||
                libro.gutenbergId
                ||
                libro.tipo ===
                "gutenberg"
            )

    };


    normalizado.idInterno =
        obtenerIdLibro(
            normalizado
        );


    window.estadoApp
        .libroActual =
        normalizado;


    window.libroActual =
        normalizado;


    return normalizado;

}


/* ===================================================== */
/* FICHA                                                */
/* ===================================================== */

async function abrirFichaLibro(
    libro
) {

    const pantallaActual =
        window.estadoApp
            .pantallaActual;


    if (
        pantallaActual !==
        "pantalla-libro"
    ) {

        window.estadoApp
            .pantallaAnterior =
            pantallaActual;

    }


    const actual =
        establecerLibroActual(
            libro
        );


    if (!actual) {
        return;
    }


    mostrarPantalla(
        "pantalla-libro"
    );


    pintarFichaLibro(
        actual
    );


    if (
        typeof completarDatosLibro
        === "function"
    ) {

        try {

            const completo =
                await completarDatosLibro(
                    actual
                );


            if (completo) {

                const final =
                    establecerLibroActual(
                        completo
                    );


                pintarFichaLibro(
                    final
                );

            }

        }

        catch (error) {

            console.error(
                "Error completando ficha:",
                error
            );

        }

    }

}


/* ===================================================== */
/* PINTAR FICHA                                         */
/* ===================================================== */

function pintarFichaLibro(
    libro
) {

    if (!libro) {
        return;
    }


    const portada =
        document.getElementById(
            "ficha-portada"
        );

    const titulo =
        document.getElementById(
            "ficha-titulo"
        );

    const autor =
        document.getElementById(
            "ficha-autor"
        );

    const resena =
        document.getElementById(
            "ficha-resena"
        );

    const etiquetas =
        document.getElementById(
            "ficha-etiquetas"
        );

    const estadoGratis =
        document.getElementById(
            "estado-gratis"
        );

    const botonLeer =
        document.getElementById(
            "boton-leer"
        );

    const botonContinuar =
        document.getElementById(
            "boton-continuar-ficha"
        );

    const corazon =
        document.getElementById(
            "boton-favorito-ficha"
        );


    if (titulo) {

        titulo.textContent =
            libro.titulo;

    }


    if (autor) {

        autor.textContent =
            libro.autor;

    }


    if (portada) {

        if (libro.portada) {

            portada.src =
                libro.portada;

            portada.style.display =
                "block";

        }

        else {

            portada.style.display =
                "none";

        }

    }


    if (resena) {

        resena.textContent =
            libro.resena
            ||
            libro.descripcion
            ||
            "No hay una reseña disponible para este libro.";

    }


    if (etiquetas) {

        etiquetas.innerHTML =
            "";


        if (libro.año) {

            crearEtiquetaFicha(
                etiquetas,
                libro.año
            );

        }


        if (libro.categoria) {

            crearEtiquetaFicha(
                etiquetas,
                libro.categoria
            );

        }


        if (libro.edad) {

            crearEtiquetaFicha(
                etiquetas,
                libro.edad
            );

        }


        if (libro.gratis) {

            crearEtiquetaFicha(
                etiquetas,
                "Gratis"
            );

        }

    }


    const tieneLectura =
        Boolean(
            libro.gutenbergId
            ||
            libro.tipo ===
            "gutenberg"
        );


    estadoGratis
        ?.classList
        .toggle(
            "oculto",
            !tieneLectura
        );


    botonLeer
        ?.classList
        .toggle(
            "oculto",
            !tieneLectura
        );


    const progreso =
        obtenerProgresoLibro(
            libro
        );


    if (botonContinuar) {

        if (
            tieneLectura
            &&
            progreso > 0
        ) {

            botonContinuar
                .classList
                .remove(
                    "oculto"
                );


            botonContinuar
                .innerHTML =
                "▷ Continuar leyendo · "
                +
                Math.round(
                    progreso
                )
                +
                "%";

        }

        else {

            botonContinuar
                .classList
                .add(
                    "oculto"
                );

        }

    }


    if (corazon) {

        const guardado =
            obtenerLibroBiblioteca(
                libro
            );


        corazon.textContent =
            guardado
            &&
            guardado.estado ===
            "quiero"

            ? "♥"
            : "♡";

    }

}


function crearEtiquetaFicha(
    contenedor,
    texto
) {

    const span =
        document.createElement(
            "span"
        );


    span.textContent =
        texto;


    contenedor.appendChild(
        span
    );

}


/* ===================================================== */
/* VOLVER FICHA                                         */
/* ===================================================== */

function volverDesdeFicha() {

    let destino =
        window.estadoApp
            .pantallaAnterior
        ||
        "pantalla-inicio";


    if (
        destino ===
        "pantalla-libro"
        ||
        destino ===
        "pantalla-lector"
    ) {

        destino =
            "pantalla-inicio";

    }


    mostrarPantalla(
        destino
    );

}


/* ===================================================== */
/* BIBLIOTECA                                           */
/* ===================================================== */

function obtenerLibroBiblioteca(
    libro
) {

    const id =
        obtenerIdLibro(
            libro
        );


    return (
        obtenerBiblioteca()
            .find(

                item =>
                    obtenerIdLibro(
                        item
                    )
                    === id

            )
        ||
        null
    );

}


function guardarEstadoLibro(
    estado
) {

    const libro =
        window.estadoApp
            .libroActual;


    if (!libro) {
        return;
    }


    const biblioteca =
        obtenerBiblioteca();


    const id =
        obtenerIdLibro(
            libro
        );


    const indice =
        biblioteca.findIndex(

            item =>
                obtenerIdLibro(
                    item
                )
                === id

        );


    const nuevo = {

        ...libro,

        idInterno: id,

        estado: estado,

        fechaGuardado:
            Date.now()

    };


    if (indice >= 0) {

        biblioteca[indice] = {

            ...biblioteca[indice],

            ...nuevo

        };

    }

    else {

        biblioteca.push(
            nuevo
        );

    }


    guardarBibliotecaLocal(
        biblioteca
    );


    pintarFichaLibro(
        libro
    );


    mostrarMensajeTemporal(

        estado === "quiero"

        ? "💗 Guardado en Quiero leer"

        : estado === "leyendo"

        ? "📖 Guardado en Leyendo"

        : "✓ Guardado en Leídos"

    );

}


/* ===================================================== */
/* FAVORITO                                             */
/* ===================================================== */

function toggleQuieroLeerLibroActual() {

    const libro =
        window.estadoApp
            .libroActual;


    if (!libro) {
        return;
    }


    const biblioteca =
        obtenerBiblioteca();


    const id =
        obtenerIdLibro(
            libro
        );


    const indice =
        biblioteca.findIndex(

            item =>
                obtenerIdLibro(
                    item
                )
                === id

        );


    if (
        indice >= 0
        &&
        biblioteca[indice]
            .estado === "quiero"
    ) {

        biblioteca.splice(
            indice,
            1
        );


        guardarBibliotecaLocal(
            biblioteca
        );


        pintarFichaLibro(
            libro
        );


        return;

    }


    guardarEstadoLibro(
        "quiero"
    );

}


/* ===================================================== */
/* ABRIR BIBLIOTECA                                     */
/* ===================================================== */

function abrirBiblioteca(
    estado = "quiero"
) {

    window.estadoApp
        .estadoBiblioteca =
        estado;


    mostrarPantalla(
        "pantalla-biblioteca"
    );


    actualizarTabsBiblioteca(
        estado
    );


    pintarBiblioteca(
        estado
    );

}


function actualizarTabsBiblioteca(
    estado
) {

    [
        "quiero",
        "leyendo",
        "leidos"
    ]
    .forEach(

        tipo => {

            document
                .getElementById(
                    "tab-" + tipo
                )
                ?.classList
                .toggle(
                    "activo",
                    tipo === estado
                );

        }

    );

}


/* ===================================================== */
/* PINTAR BIBLIOTECA                                    */
/* ===================================================== */

function pintarBiblioteca(
    estado
) {

    const contenedor =
        document.getElementById(
            "lista-biblioteca"
        );


    if (!contenedor) {
        return;
    }


    const libros =
        obtenerBiblioteca()
            .filter(

                libro =>
                    libro.estado ===
                    estado

            );


    contenedor.innerHTML =
        "";


    if (!libros.length) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>📚</span>

                <p>
                    Todavía no tienes libros aquí.
                </p>

            </div>
        `;

        return;

    }


    libros.forEach(

        libro =>
            contenedor.appendChild(
                crearItemBiblioteca(
                    libro
                )
            )

    );

}


/* ===================================================== */
/* ITEM BIBLIOTECA                                      */
/* ===================================================== */

function crearItemBiblioteca(
    libro
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "item-biblioteca";


    item.innerHTML = `

        ${
            libro.portada

            ? `
                <img
                    src="${escaparHTMLApp(
                        libro.portada
                    )}"
                    alt=""
                >
            `

            : `
                <div
                    style="
                        width:62px;
                        aspect-ratio:2/3;
                        border-radius:9px;
                        background:#f4eafa;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        font-size:27px;
                    "
                >
                    📚
                </div>
            `
        }


        <div>

            <h3>
                ${escaparHTMLApp(
                    libro.titulo
                )}
            </h3>

            <p>
                ${escaparHTMLApp(
                    libro.autor
                )}
            </p>

        </div>


        <div class="acciones-item">

            <button>
                ×
            </button>

        </div>
    `;


    item.addEventListener(
        "click",
        evento => {

            if (
                evento.target.closest(
                    ".acciones-item"
                )
            ) {

                return;

            }


            window.estadoApp
                .pantallaAnterior =
                "pantalla-biblioteca";


            abrirFichaLibro(
                libro
            );

        }
    );


    item
        .querySelector(
            ".acciones-item button"
        )
        ?.addEventListener(
            "click",
            evento => {

                evento.stopPropagation();

                eliminarLibroBiblioteca(
                    libro
                );

            }
        );


    return item;

}


/* ===================================================== */
/* ELIMINAR                                             */
/* ===================================================== */

function eliminarLibroBiblioteca(
    libro
) {

    const id =
        obtenerIdLibro(
            libro
        );


    const biblioteca =
        obtenerBiblioteca()
            .filter(

                item =>
                    obtenerIdLibro(
                        item
                    )
                    !== id

            );


    guardarBibliotecaLocal(
        biblioteca
    );


    pintarBiblioteca(
        window.estadoApp
            .estadoBiblioteca
    );

}


/* ===================================================== */
/* CONTADORES                                           */
/* ===================================================== */

function actualizarResumenBiblioteca() {

    const biblioteca =
        obtenerBiblioteca();


    escribirTexto(
        "contador-quiero",

        biblioteca.filter(
            libro =>
                libro.estado ===
                "quiero"
        ).length
    );


    escribirTexto(
        "contador-leyendo",

        biblioteca.filter(
            libro =>
                libro.estado ===
                "leyendo"
        ).length
    );


    escribirTexto(
        "contador-leidos",

        biblioteca.filter(
            libro =>
                libro.estado ===
                "leidos"
        ).length
    );

}


function escribirTexto(
    id,
    texto
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            texto;

    }

}


/* ===================================================== */
/* PROGRESO                                             */
/* ===================================================== */

function obtenerProgresoLibro(
    libro
) {

    const id =
        obtenerIdLibro(
            libro
        );


    if (!id) {
        return 0;
    }


    const dato =
        obtenerProgresos()[
            id
        ];


    if (
        typeof dato ===
        "number"
    ) {

        return dato;

    }


    if (
        dato
        &&
        typeof dato.porcentaje ===
        "number"
    ) {

        return dato.porcentaje;

    }


    return 0;

}


/* ===================================================== */
/* CONTINUAR LEYENDO                                    */
/* ===================================================== */

function pintarContinuarLeyendo() {

    const contenedor =
        document.getElementById(
            "lista-continuar"
        );


    if (!contenedor) {
        return;
    }


    const libros =
        obtenerBiblioteca()

            .map(
                libro => ({

                    ...libro,

                    progreso:
                        obtenerProgresoLibro(
                            libro
                        )

                })
            )

            .filter(
                libro =>
                    libro.progreso > 0
                    &&
                    libro.progreso < 99.5
            );


    contenedor.innerHTML =
        "";


    if (!libros.length) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>📖</span>

                <p>
                    Los libros que empieces aparecerán aquí.
                </p>

            </div>
        `;

        return;

    }


    libros
        .slice(0, 8)
        .forEach(

            libro => {

                const tarjeta =
                    document.createElement(
                        "article"
                    );


                tarjeta.className =
                    "tarjeta-libro";


                tarjeta.style.minWidth =
                    "145px";


                tarjeta.style.width =
                    "145px";


                tarjeta.innerHTML = `

                    <div class="tarjeta-libro-portada">

                        ${
                            libro.portada

                            ? `
                                <img
                                    src="${escaparHTMLApp(
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
                        ${escaparHTMLApp(
                            libro.titulo
                        )}
                    </h3>

                    <p class="autor">
                        ${escaparHTMLApp(
                            libro.autor
                        )}
                    </p>

                    <div class="marca-progreso">

                        <div
                            style="
                                width:
                                ${Math.min(
                                    100,
                                    libro.progreso
                                )}%;
                            "
                        >
                        </div>

                    </div>

                    <p class="autor">
                        ${Math.round(
                            libro.progreso
                        )}%
                    </p>
                `;


                tarjeta.onclick =
                    () =>
                        abrirFichaLibro(
                            libro
                        );


                contenedor.appendChild(
                    tarjeta
                );

            }

        );

}


/* ===================================================== */
/* LEER                                                 */
/* ===================================================== */

function leerLibroActual() {

    const libro =
        window.estadoApp
            .libroActual;


    if (!libro) {
        return;
    }


    if (
        !libro.gutenbergId
        &&
        libro.tipo !==
        "gutenberg"
    ) {

        mostrarMensajeTemporal(
            "Este libro no está disponible para lectura completa."
        );

        return;

    }


    if (
        typeof abrirLector ===
        "function"
    ) {

        abrirLector(
            libro
        );

    }

}


/* ===================================================== */
/* MENSAJE                                              */
/* ===================================================== */

function mostrarMensajeTemporal(
    mensaje
) {

    document
        .getElementById(
            "mensaje-app-temporal"
        )
        ?.remove();


    const elemento =
        document.createElement(
            "div"
        );


    elemento.id =
        "mensaje-app-temporal";


    elemento.textContent =
        mensaje;


    Object.assign(
        elemento.style,
        {

            position:
                "fixed",

            left:
                "50%",

            bottom:
                "90px",

            transform:
                "translateX(-50%)",

            background:
                "#54258c",

            color:
                "#fff",

            padding:
                "12px 18px",

            borderRadius:
                "999px",

            zIndex:
                "9999",

            maxWidth:
                "calc(100% - 30px)",

            textAlign:
                "center"

        }
    );


    document.body.appendChild(
        elemento
    );


    setTimeout(
        () => elemento.remove(),
        2200
    );

}


/* ===================================================== */
/* HTML SEGURO                                          */
/* ===================================================== */

function escaparHTMLApp(
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

document
    .getElementById(
        "input-busqueda"
    )
    ?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Enter"
            ) {

                buscarDesdeInicio();

            }

        }
    );


document
    .getElementById(
        "input-busqueda-resultados"
    )
    ?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Enter"
                &&
                typeof buscarLibros ===
                "function"
            ) {

                buscarLibros();

            }

        }
    );


/* ===================================================== */
/* PROGRESO ACTUALIZADO                                 */
/* ===================================================== */

window.addEventListener(
    "nereProgresoActualizado",
    () => {

        actualizarResumenBiblioteca();

        pintarContinuarLeyendo();


        if (
            window.estadoApp
                .libroActual
        ) {

            pintarFichaLibro(
                window.estadoApp
                    .libroActual
            );

        }

    }
);


/* ===================================================== */
/* ARRANQUE                                             */
/* ===================================================== */

function iniciarApp() {

    /*
      Recuperamos el filtro Gratis
      que desapareció del nuevo HTML.
    */

    crearBotonGratisBusqueda();


    actualizarResumenBiblioteca();

    pintarContinuarLeyendo();


    mostrarPantalla(
        "pantalla-inicio"
    );


    console.log(
        "📚 La Biblioteca de Nere iniciada correctamente"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    iniciarApp
);
