/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* LECTOR.JS                                            */
/* Lector, progreso, temas y tamaño de texto            */
/* ===================================================== */


/* ===================================================== */
/* CONFIGURACIÓN                                        */
/* ===================================================== */

const CLAVE_TEMA_LECTOR =
    "nereTemaLector";

const CLAVE_TAMANO_LECTOR =
    "nereTamanoLector";


let temaLectorActual =
    localStorage.getItem(
        CLAVE_TEMA_LECTOR
    )
    || "sepia";


let tamanoTextoActual =
    Number(
        localStorage.getItem(
            CLAVE_TAMANO_LECTOR
        )
    )
    || 18;


let libroEnLectura =
    null;


let guardadoScrollPendiente =
    null;


/* ===================================================== */
/* ABRIR LECTOR                                         */
/* ===================================================== */

async function abrirLector(
    libro
) {

    if (!libro) {

        return;

    }


    libroEnLectura =
        libro;


    /*
      También mantenemos sincronizado
      el libro actual de app.js.
    */

    if (
        window.estadoApp
    ) {

        window.estadoApp
            .libroActual =
            libro;

    }


    window.libroActual =
        libro;


    mostrarPantalla(
        "pantalla-lector"
    );


    prepararCabeceraLector(
        libro
    );


    mostrarCargandoLector();


    try {

        /*
          api.js implementa descargarLibroTexto()
          y prepararContenidoLibro().
        */

        if (
            typeof descargarLibroTexto
            !== "function"
        ) {

            throw new Error(
                "api.js no está cargado correctamente."
            );

        }


        const descarga =
            await descargarLibroTexto(
                libro
            );


        let contenido =
            "";


        if (
            typeof prepararContenidoLibro
            === "function"
        ) {

            contenido =
                prepararContenidoLibro(
                    descarga
                );

        }

        else {

            contenido =
                descarga.contenido
                || "";

        }


        if (!contenido) {

            throw new Error(
                "No se pudo preparar el contenido del libro."
            );

        }


        pintarContenidoLector(
            contenido
        );


        aplicarTemaActual();

        aplicarTamanoActual();


        /*
          Esperamos a que el navegador
          termine de pintar el texto.
        */

        setTimeout(
            () => {

                restaurarProgresoLibro(
                    libro
                );

            },
            250
        );

    }

    catch (error) {

        console.error(
            "Error abriendo libro:",
            error
        );


        mostrarErrorLector(
            error.message
            ||
            "No se ha podido abrir este libro."
        );

    }

}


/* ===================================================== */
/* CABECERA DEL LECTOR                                  */
/* ===================================================== */

function prepararCabeceraLector(
    libro
) {

    const titulo =
        document.getElementById(
            "lector-titulo"
        );


    const autor =
        document.getElementById(
            "lector-autor"
        );


    if (titulo) {

        titulo.textContent =
            libro.titulo
            ||
            "Libro";

    }


    if (autor) {

        autor.textContent =
            libro.autor
            ||
            "";

    }

}


/* ===================================================== */
/* CARGANDO                                             */
/* ===================================================== */

function mostrarCargandoLector() {

    const contenedor =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div class="cargando-lector">

            <div class="spinner"></div>

            <p>
                Abriendo libro...
            </p>

        </div>
    `;

}


/* ===================================================== */
/* PINTAR TEXTO                                         */
/* ===================================================== */

function pintarContenidoLector(
    contenido
) {

    const contenedor =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        contenido;


    /*
      Añadimos clase a párrafos
      para que el texto quede más limpio.
    */

    contenedor
        .querySelectorAll(
            "p"
        )
        .forEach(
            parrafo => {

                parrafo.style.margin =
                    "0 0 1.2em";

            }
        );


    /*
      Evitamos imágenes enormes
      en caso de que Gutenberg
      devuelva alguna.
    */

    contenedor
        .querySelectorAll(
            "img"
        )
        .forEach(
            imagen => {

                imagen.style.maxWidth =
                    "100%";

                imagen.style.height =
                    "auto";

            }
        );

}


/* ===================================================== */
/* ERROR                                                */
/* ===================================================== */

function mostrarErrorLector(
    mensaje
) {

    const contenedor =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div
            style="
                min-height:55vh;
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                text-align:center;
                padding:30px;
            "
        >

            <div
                style="
                    font-size:46px;
                    margin-bottom:14px;
                "
            >
                📚
            </div>

            <h3>
                No se ha podido abrir el libro
            </h3>

            <p
                style="
                    max-width:400px;
                    line-height:1.5;
                    opacity:.75;
                "
            >
                ${escaparHTMLLector(
                    mensaje
                )}
            </p>

            <button
                onclick="cerrarLector()"
                style="
                    margin-top:15px;
                    padding:12px 18px;
                    border-radius:999px;
                    background:#8b56d5;
                    color:white;
                "
            >
                ← Volver
            </button>

        </div>
    `;

}


/* ===================================================== */
/* CERRAR LECTOR                                        */
/* ===================================================== */

function cerrarLector() {

    guardarProgresoLectura();


    if (
        window.estadoApp
        &&
        libroEnLectura
    ) {

        window.estadoApp
            .libroActual =
            libroEnLectura;

    }


    /*
      Volvemos a la ficha del libro,
      no directamente al inicio.
    */

    mostrarPantalla(
        "pantalla-libro"
    );


    if (
        typeof pintarFichaLibro
        === "function"
        &&
        libroEnLectura
    ) {

        pintarFichaLibro(
            libroEnLectura
        );

    }

}


/* ===================================================== */
/* PROGRESO                                             */
/* ===================================================== */

function obtenerIdLibroLector(
    libro
) {

    if (
        typeof obtenerIdLibro
        === "function"
    ) {

        return obtenerIdLibro(
            libro
        );

    }


    return (
        libro?.idInterno
        ||
        libro?.gutenbergId
        ||
        libro?.id
        ||
        null
    );

}


function leerProgresosLector() {

    try {

        const datos =
            localStorage.getItem(
                "progresosNere"
            );


        if (!datos) {

            return {};

        }


        return (
            JSON.parse(datos)
            ||
            {}
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


function guardarProgresosLector(
    progresos
) {

    try {

        localStorage.setItem(
            "progresosNere",
            JSON.stringify(
                progresos
            )
        );

    }

    catch (error) {

        console.error(
            "Error guardando progreso:",
            error
        );

    }

}


/* ===================================================== */
/* CALCULAR PROGRESO                                    */
/* ===================================================== */

function calcularPorcentajeLectura() {

    const pantalla =
        document.getElementById(
            "pantalla-lector"
        );


    if (
        !pantalla
        ||
        !pantalla.classList
            .contains("activa")
    ) {

        return 0;

    }


    const alturaDocumento =
        document.documentElement
            .scrollHeight;


    const alturaVentana =
        window.innerHeight;


    const maxScroll =
        Math.max(
            1,
            alturaDocumento
            -
            alturaVentana
        );


    const porcentaje =
        (
            window.scrollY
            /
            maxScroll
        )
        *
        100;


    return Math.min(
        100,
        Math.max(
            0,
            porcentaje
        )
    );

}


/* ===================================================== */
/* GUARDAR PROGRESO                                     */
/* ===================================================== */

function guardarProgresoLectura() {

    if (!libroEnLectura) {

        return;

    }


    const id =
        obtenerIdLibroLector(
            libroEnLectura
        );


    if (!id) {

        return;

    }


    const porcentaje =
        calcularPorcentajeLectura();


    const progresos =
        leerProgresosLector();


    progresos[id] = {

        porcentaje:
            porcentaje,

        scroll:
            window.scrollY,

        fecha:
            Date.now()

    };


    guardarProgresosLector(
        progresos
    );


    actualizarIndicadorProgreso(
        porcentaje
    );


    /*
      Si el libro se está leyendo,
      lo dejamos en estado "leyendo"
      automáticamente.
    */

    actualizarLibroComoLeyendo(
        libroEnLectura
    );


    window.dispatchEvent(
        new CustomEvent(
            "nereProgresoActualizado"
        )
    );

}


/* ===================================================== */
/* RESTAURAR PROGRESO                                   */
/* ===================================================== */

function restaurarProgresoLibro(
    libro
) {

    const id =
        obtenerIdLibroLector(
            libro
        );


    if (!id) {

        subirInicioLector();

        return;

    }


    const progresos =
        leerProgresosLector();


    const progreso =
        progresos[id];


    if (!progreso) {

        subirInicioLector();

        actualizarIndicadorProgreso(
            0
        );

        return;

    }


    let porcentaje =
        0;


    if (
        typeof progreso
        === "number"
    ) {

        porcentaje =
            progreso;

    }

    else {

        porcentaje =
            Number(
                progreso.porcentaje
            )
            ||
            0;

    }


    /*
      Restauramos por porcentaje
      porque es más robusto si cambia
      ligeramente el tamaño de texto.
    */

    const alturaDocumento =
        document.documentElement
            .scrollHeight;


    const alturaVentana =
        window.innerHeight;


    const maxScroll =
        Math.max(
            0,
            alturaDocumento
            -
            alturaVentana
        );


    const destino =
        maxScroll
        *
        (
            porcentaje
            /
            100
        );


    window.scrollTo(
        0,
        destino
    );


    actualizarIndicadorProgreso(
        porcentaje
    );

}


/* ===================================================== */
/* BARRA DE PROGRESO                                    */
/* ===================================================== */

function actualizarIndicadorProgreso(
    porcentaje
) {

    const relleno =
        document.getElementById(
            "progreso-relleno"
        );


    const texto =
        document.getElementById(
            "porcentaje-lectura"
        );


    const valor =
        Math.round(
            Math.min(
                100,
                Math.max(
                    0,
                    porcentaje
                )
            )
        );


    if (relleno) {

        relleno.style.width =
            valor
            +
            "%";

    }


    if (texto) {

        texto.textContent =
            valor
            +
            "%";

    }

}


/* ===================================================== */
/* SCROLL                                               */
/* ===================================================== */

window.addEventListener(
    "scroll",
    () => {

        const pantalla =
            document.getElementById(
                "pantalla-lector"
            );


        if (
            !pantalla
            ||
            !pantalla.classList
                .contains("activa")
        ) {

            return;

        }


        const porcentaje =
            calcularPorcentajeLectura();


        actualizarIndicadorProgreso(
            porcentaje
        );


        /*
          Evitamos escribir localStorage
          en cada píxel de scroll.
        */

        clearTimeout(
            guardadoScrollPendiente
        );


        guardadoScrollPendiente =
            setTimeout(
                () => {

                    guardarProgresoLectura();

                },
                250
            );

    },
    {
        passive: true
    }
);


/* ===================================================== */
/* MARCAR COMO LEYENDO                                  */
/* ===================================================== */

function actualizarLibroComoLeyendo(
    libro
) {

    if (
        typeof obtenerBiblioteca
        !== "function"
        ||
        typeof guardarBibliotecaLocal
        !== "function"
    ) {

        return;

    }


    const biblioteca =
        obtenerBiblioteca();


    const id =
        obtenerIdLibroLector(
            libro
        );


    const indice =
        biblioteca.findIndex(
            item => {

                const itemId =
                    obtenerIdLibroLector(
                        item
                    );


                return (
                    itemId
                    === id
                );

            }
        );


    const guardado = {

        ...libro,

        idInterno:
            id,

        estado:
            "leyendo",

        ultimaLectura:
            Date.now()

    };


    if (
        indice >= 0
    ) {

        biblioteca[indice] =
            {
                ...biblioteca[indice],
                ...guardado
            };

    }

    else {

        biblioteca.push(
            guardado
        );

    }


    guardarBibliotecaLocal(
        biblioteca
    );

}


/* ===================================================== */
/* CONTROLES                                            */
/* ===================================================== */

function toggleControlesLector() {

    const controles =
        document.getElementById(
            "controles-lector"
        );


    if (!controles) {

        return;

    }


    controles.classList.toggle(
        "oculto"
    );

}


/* ===================================================== */
/* TAMAÑO DE TEXTO                                      */
/* ===================================================== */

function cambiarTamanoTexto(
    cambio
) {

    tamanoTextoActual +=
        cambio * 2;


    tamanoTextoActual =
        Math.max(
            14,
            Math.min(
                32,
                tamanoTextoActual
            )
        );


    localStorage.setItem(
        CLAVE_TAMANO_LECTOR,
        tamanoTextoActual
    );


    aplicarTamanoActual();


    /*
      Guardamos primero el porcentaje
      antes de que cambie la altura
      del documento.
    */

    const porcentaje =
        calcularPorcentajeLectura();


    setTimeout(
        () => {

            restaurarPorcentaje(
                porcentaje
            );

        },
        100
    );

}


function aplicarTamanoActual() {

    const contenido =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenido) {

        return;

    }


    contenido.style.fontSize =
        tamanoTextoActual
        +
        "px";

}


/* ===================================================== */
/* TEMAS                                                */
/* ===================================================== */

function cambiarTemaLector(
    tema
) {

    const permitidos = [

        "claro",

        "sepia",

        "oscuro"

    ];


    if (
        !permitidos.includes(
            tema
        )
    ) {

        return;

    }


    temaLectorActual =
        tema;


    localStorage.setItem(
        CLAVE_TEMA_LECTOR,
        tema
    );


    aplicarTemaActual();

}


function aplicarTemaActual() {

    const contenido =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenido) {

        return;

    }


    contenido.classList.remove(
        "tema-claro",
        "tema-sepia",
        "tema-oscuro"
    );


    contenido.classList.add(
        "tema-"
        +
        temaLectorActual
    );

}


/* ===================================================== */
/* IR AL PRINCIPIO                                      */
/* ===================================================== */

function subirInicioLector() {

    window.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


/* ===================================================== */
/* RESTAURAR PORCENTAJE                                 */
/* ===================================================== */

function restaurarPorcentaje(
    porcentaje
) {

    const alturaDocumento =
        document.documentElement
            .scrollHeight;


    const alturaVentana =
        window.innerHeight;


    const maxScroll =
        Math.max(
            0,
            alturaDocumento
            -
            alturaVentana
        );


    const destino =
        maxScroll
        *
        (
            porcentaje
            /
            100
        );


    window.scrollTo(
        0,
        destino
    );

}


/* ===================================================== */
/* GUARDAR AL SALIR DE LA PÁGINA                        */
/* ===================================================== */

window.addEventListener(
    "pagehide",
    () => {

        const pantalla =
            document.getElementById(
                "pantalla-lector"
            );


        if (
            pantalla
            &&
            pantalla.classList
                .contains("activa")
        ) {

            guardarProgresoLectura();

        }

    }
);


/* ===================================================== */
/* VISIBILIDAD                                          */
/* ===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            const pantalla =
                document.getElementById(
                    "pantalla-lector"
                );


            if (
                pantalla
                &&
                pantalla.classList
                    .contains("activa")
            ) {

                guardarProgresoLectura();

            }

        }

    }
);


/* ===================================================== */
/* ESCAPAR HTML                                         */
/* ===================================================== */

function escaparHTMLLector(
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
/* INICIO                                               */
/* ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        aplicarTemaActual();

        aplicarTamanoActual();

    }
);


console.log(
    "📖 Lector de La Biblioteca de Nere cargado"
);