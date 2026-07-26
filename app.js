/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* APP.JS                                               */
/* Navegación, biblioteca, ficha y estado general       */
/* ===================================================== */


/* ===================================================== */
/* ESTADO GENERAL                                       */
/* ===================================================== */

window.estadoApp = {

    pantallaActual:
        "pantalla-inicio",

    pantallaAnterior:
        "pantalla-inicio",

    filtroBusqueda:
        "todo",

    estadoBiblioteca:
        "quiero",

    libroActual:
        null

};


/* ===================================================== */
/* LOCAL STORAGE                                        */
/* ===================================================== */

const CLAVE_BIBLIOTECA =
    "bibliotecaNere";


const CLAVE_PROGRESOS =
    "progresosNere";


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


        return Array.isArray(
            biblioteca
        )
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


        return (
            JSON.parse(datos)
            || {}
        );

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
/* IDENTIFICADOR DE LIBRO                               */
/* ===================================================== */

function obtenerIdLibro(
    libro
) {

    if (!libro) {

        return null;

    }


    if (libro.idInterno) {

        return String(
            libro.idInterno
        );

    }


    if (libro.gutenbergId) {

        return (
            "gutenberg-"
            +
            libro.gutenbergId
        );

    }


    if (libro.id) {

        return String(
            libro.id
        );

    }


    if (libro.key) {

        return String(
            libro.key
        );

    }


    const titulo =
        libro.titulo
        ||
        libro.title
        ||
        "";


    const autor =
        libro.autor
        ||
        libro.author
        ||
        "";


    return (
        "libro-"
        +
        normalizarTexto(
            titulo
            +
            "-"
            +
            autor
        )
    );

}


function normalizarTexto(
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
            "");

}


/* ===================================================== */
/* NAVEGACIÓN                                           */
/* ===================================================== */

function mostrarPantalla(
    idPantalla
) {

    const pantallaDestino =
        document.getElementById(
            idPantalla
        );


    if (!pantallaDestino) {

        console.warn(
            "Pantalla no encontrada:",
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
        actual.id
        !== idPantalla
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
            pantalla => {

                pantalla.classList
                    .remove(
                        "activa"
                    );

            }
        );


    pantallaDestino
        .classList
        .add(
            "activa"
        );


    window.estadoApp
        .pantallaActual =
        idPantalla;


    actualizarNavegacionInferior(
        idPantalla
    );


    if (
        idPantalla
        !== "pantalla-lector"
    ) {

        window.scrollTo(
            0,
            0
        );

    }


    if (
        idPantalla
        === "pantalla-inicio"
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


    /*
      Ocultamos la navegación durante
      la lectura para ganar espacio.
    */

    if (
        pantalla
        === "pantalla-lector"
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
        boton => {

            boton.classList.remove(
                "nav-activo"
            );

        }
    );


    if (
        pantalla
        === "pantalla-inicio"
    ) {

        botones[0]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    if (
        pantalla
        === "pantalla-buscar"
    ) {

        botones[1]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    if (
        pantalla
        === "pantalla-catalogo"
    ) {

        botones[2]
            ?.classList
            .add(
                "nav-activo"
            );

    }


    if (
        pantalla
        === "pantalla-biblioteca"
    ) {

        botones[3]
            ?.classList
            .add(
                "nav-activo"
            );

    }

}


/* ===================================================== */
/* BUSCAR DESDE INICIO                                  */
/* ===================================================== */

function buscarDesdeInicio() {

    const inputInicio =
        document.getElementById(
            "input-busqueda"
        );


    const texto =
        inputInicio
            ?.value
            .trim()
        || "";


    abrirBuscar();


    const inputResultados =
        document.getElementById(
            "input-busqueda-resultados"
        );


    if (inputResultados) {

        inputResultados.value =
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
/* FILTRO DE BÚSQUEDA                                   */
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


    const input =
        document.getElementById(
            "input-busqueda-resultados"
        );


    if (
        input
        &&
        input.value.trim()
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

        return;

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
                libro.tipo
                === "gutenberg"
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
/* ABRIR FICHA                                          */
/* ===================================================== */

async function abrirFichaLibro(
    libro
) {

    const pantallaActual =
        window.estadoApp
            .pantallaActual;


    if (
        pantallaActual
        !== "pantalla-libro"
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


    /*
      api.js podrá implementar esta función
      para buscar descripción, año, etc.
    */

    if (
        typeof completarDatosLibro
        === "function"
    ) {

        try {

            const completado =
                await completarDatosLibro(
                    actual
                );


            if (completado) {

                establecerLibroActual(
                    completado
                );


                pintarFichaLibro(
                    window.estadoApp
                        .libroActual
                );

            }

        }

        catch (error) {

            console.warn(
                "No se pudo completar la ficha:",
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


    const botonCorazon =
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

            portada.removeAttribute(
                "src"
            );


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


    /*
      Disponible para lectura únicamente
      cuando tenemos Gutenberg.
    */

    const tieneLectura =
        Boolean(
            libro.gutenbergId
            ||
            libro.tipo
            === "gutenberg"
        );


    if (estadoGratis) {

        estadoGratis.classList.toggle(
            "oculto",
            !tieneLectura
        );

    }


    if (botonLeer) {

        botonLeer.classList.toggle(
            "oculto",
            !tieneLectura
        );

    }


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


            botonContinuar.innerHTML =
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


    if (botonCorazon) {

        const guardado =
            obtenerLibroBiblioteca(
                libro
            );


        botonCorazon.textContent =
            guardado
            &&
            guardado.estado
            === "quiero"

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
/* VOLVER DESDE FICHA                                   */
/* ===================================================== */

function volverDesdeFicha() {

    const destino =
        window.estadoApp
            .pantallaAnterior
        ||
        "pantalla-inicio";


    /*
      Evitamos volver accidentalmente
      al propio libro o al lector.
    */

    if (
        destino
        === "pantalla-libro"
        ||
        destino
        === "pantalla-lector"
    ) {

        mostrarPantalla(
            "pantalla-inicio"
        );

        return;

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


    if (!id) {

        return null;

    }


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


    const nuevoLibro = {

        ...libro,

        idInterno:
            id,

        estado:
            estado,

        fechaGuardado:
            Date.now()

    };


    if (
        indice >= 0
    ) {

        biblioteca[indice] =
            {
                ...biblioteca[indice],
                ...nuevoLibro
            };

    }

    else {

        biblioteca.push(
            nuevoLibro
        );

    }


    guardarBibliotecaLocal(
        biblioteca
    );


    pintarFichaLibro(
        libro
    );


    mostrarMensajeTemporal(
        estado
        === "quiero"

        ? "💗 Guardado en Quiero leer"

        : estado
        === "leyendo"

        ? "📖 Guardado en Leyendo"

        : "✓ Guardado en Leídos"
    );

}


/* ===================================================== */
/* CORAZÓN DE LA FICHA                                  */
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


    /*
      Si ya está en quiero leer,
      lo quitamos de la biblioteca.
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


        guardarBibliotecaLocal(
            biblioteca
        );


        pintarFichaLibro(
            libro
        );


        mostrarMensajeTemporal(
            "Eliminado de Quiero leer"
        );


        return;

    }


    guardarEstadoLibro(
        "quiero"
    );

}


/* ===================================================== */
/* ABRIR MI BIBLIOTECA                                  */
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
                        "tab-"
                        +
                        tipo
                    )
                    ?.classList
                    .toggle(
                        "activo",
                        tipo
                        === estado
                    );

            }
        );

}


/* ===================================================== */
/* PINTAR MI BIBLIOTECA                                 */
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
                    libro.estado
                    === estado
            );


    contenedor.innerHTML =
        "";


    if (
        libros.length === 0
    ) {

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
        libro => {

            contenedor.appendChild(
                crearItemBiblioteca(
                    libro
                )
            );

        }
    );

}


function crearItemBiblioteca(
    libro
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "item-biblioteca";


    const portada =
        libro.portada
        ||
        "";


    item.innerHTML = `

        ${
            portada

            ? `
                <img
                    src="${escaparHTMLApp(portada)}"
                    alt=""
                >
            `

            : `
                <div
                    style="
                        width:62px;
                        aspect-ratio:2/3;
                        border-radius:9px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#f4eafa;
                        font-size:26px;
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

            ${
                obtenerProgresoLibro(
                    libro
                ) > 0

                ? `
                    <p style="margin-top:5px;">
                        📖
                        ${Math.round(
                            obtenerProgresoLibro(
                                libro
                            )
                        )}%
                        leído
                    </p>
                `

                : ""
            }

        </div>

        <div class="acciones-item">

            <button
                title="Eliminar"
                aria-label="Eliminar"
            >
                ×
            </button>

        </div>
    `;


    /*
      Pulsar el libro abre su ficha.
    */

    item.addEventListener(
        "click",
        evento => {

            if (
                evento.target
                    .closest(
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


    /*
      Eliminar.
    */

    item
        .querySelector(
            ".acciones-item button"
        )
        ?.addEventListener(
            "click",
            evento => {

                evento
                    .stopPropagation();


                eliminarLibroBiblioteca(
                    libro
                );

            }
        );


    return item;

}


/* ===================================================== */
/* ELIMINAR LIBRO                                       */
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


    const quiero =
        biblioteca.filter(
            libro =>
                libro.estado
                === "quiero"
        ).length;


    const leyendo =
        biblioteca.filter(
            libro =>
                libro.estado
                === "leyendo"
        ).length;


    const leidos =
        biblioteca.filter(
            libro =>
                libro.estado
                === "leidos"
        ).length;


    escribirTexto(
        "contador-quiero",
        quiero
    );


    escribirTexto(
        "contador-leyendo",
        leyendo
    );


    escribirTexto(
        "contador-leidos",
        leidos
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
/* CONTINUAR LEYENDO                                    */
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


    const progresos =
        obtenerProgresos();


    const dato =
        progresos[id];


    if (
        typeof dato
        === "number"
    ) {

        return dato;

    }


    if (
        dato
        &&
        typeof dato.porcentaje
        === "number"
    ) {

        return dato.porcentaje;

    }


    return 0;

}


function pintarContinuarLeyendo() {

    const contenedor =
        document.getElementById(
            "lista-continuar"
        );


    if (!contenedor) {

        return;

    }


    const biblioteca =
        obtenerBiblioteca();


    const libros =
        biblioteca
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
            )
            .sort(
                (a, b) =>
                    (
                        b.ultimaLectura
                        ||
                        b.fechaGuardado
                        ||
                        0
                    )
                    -
                    (
                        a.ultimaLectura
                        ||
                        a.fechaGuardado
                        ||
                        0
                    )
            );


    contenedor.innerHTML =
        "";


    if (
        libros.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="estado-vacio">

                <span>
                    📖
                </span>

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

                contenedor.appendChild(
                    crearTarjetaContinuar(
                        libro
                    )
                );

            }
        );

}


function crearTarjetaContinuar(
    libro
) {

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


    const portada =
        libro.portada
        ||
        "";


    tarjeta.innerHTML = `

        <div class="tarjeta-libro-portada">

            ${
                portada

                ? `
                    <img
                        src="${escaparHTMLApp(portada)}"
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

        <p
            class="autor"
            style="
                text-align:right;
                margin-top:4px;
            "
        >
            ${Math.round(
                libro.progreso
            )}%
        </p>
    `;


    tarjeta.addEventListener(
        "click",
        () => {

            window.estadoApp
                .pantallaAnterior =
                "pantalla-inicio";


            abrirFichaLibro(
                libro
            );

        }
    );


    return tarjeta;

}


/* ===================================================== */
/* LEER LIBRO ACTUAL                                    */
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
        libro.tipo
        !== "gutenberg"
    ) {

        mostrarMensajeTemporal(
            "Este libro no está disponible para lectura completa."
        );

        return;

    }


    /*
      lector.js implementará abrirLector().
    */

    if (
        typeof abrirLector
        === "function"
    ) {

        abrirLector(
            libro
        );

    }

    else {

        console.error(
            "lector.js no está cargado correctamente."
        );

    }

}


/* ===================================================== */
/* MENSAJE TEMPORAL                                     */
/* ===================================================== */

function mostrarMensajeTemporal(
    mensaje
) {

    const existente =
        document.getElementById(
            "mensaje-app-temporal"
        );


    existente?.remove();


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
                "white",

            padding:
                "12px 18px",

            borderRadius:
                "999px",

            zIndex:
                "9999",

            fontSize:
                "13px",

            boxShadow:
                "0 6px 20px rgba(80,40,120,.25)",

            maxWidth:
                "calc(100% - 30px)",

            textAlign:
                "center"

        }
    );


    document.body
        .appendChild(
            elemento
        );


    setTimeout(
        () => {

            elemento.remove();

        },
        2200
    );

}


/* ===================================================== */
/* ESCAPAR HTML                                         */
/* ===================================================== */

function escaparHTMLApp(
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
/* ENTER EN LOS BUSCADORES                              */
/* ===================================================== */

document
    .getElementById(
        "input-busqueda"
    )
    ?.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key
                === "Enter"
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
                evento.key
                === "Enter"
                &&
                typeof buscarLibros
                === "function"
            ) {

                buscarLibros();

            }

        }
    );


/* ===================================================== */
/* EVENTO PARA ACTUALIZAR PROGRESO                      */
/* ===================================================== */

/*
  lector.js puede lanzar:

  window.dispatchEvent(
      new CustomEvent(
          "nereProgresoActualizado"
      )
  );

  cuando cambia el progreso.
*/

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
/* ARRANQUE DE LA APP                                   */
/* ===================================================== */

function iniciarApp() {

    actualizarResumenBiblioteca();

    pintarContinuarLeyendo();


    mostrarPantalla(
        "pantalla-inicio"
    );


    console.log(
        "📚 La Biblioteca de Nere iniciada"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    iniciarApp
);