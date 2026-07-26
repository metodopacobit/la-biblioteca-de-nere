/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* LECTOR.JS - PROGRESO CORREGIDO                       */
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


let libroEnLectura = null;

let guardadoScrollPendiente = null;


/*
   MUY IMPORTANTE:

   Mientras abrimos el libro o restauramos
   su posición, bloqueamos temporalmente
   el guardado automático.

   Esto evita que se guarde 100% por error.
*/

let restaurandoPosicion = false;

let lectorCargado = false;


/* ===================================================== */
/* ABRIR LECTOR                                         */
/* ===================================================== */

async function abrirLector(libro) {

    if (!libro) {
        return;
    }


    libroEnLectura = libro;

    lectorCargado = false;

    restaurandoPosicion = true;


    if (window.estadoApp) {

        window.estadoApp.libroActual =
            libro;

    }


    window.libroActual =
        libro;


    /*
       Primero mostramos el lector.
    */

    mostrarPantalla(
        "pantalla-lector"
    );


    /*
       CORRECCIÓN IMPORTANTE:

       No heredamos la posición de scroll
       de Infantil, Juvenil, Buscar, etc.
    */

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });


    prepararCabeceraLector(
        libro
    );


    mostrarCargandoLector();


    actualizarIndicadorProgreso(
        0
    );


    try {

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


        let contenido = "";


        if (
            typeof prepararContenidoLibro ===
            "function"
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
           Dejamos que el navegador calcule
           primero la altura real del libro.
        */

        requestAnimationFrame(
            function() {

                requestAnimationFrame(
                    function() {

                        restaurarProgresoLibro(
                            libro
                        );

                    }
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Error abriendo libro:",
            error
        );


        restaurandoPosicion =
            false;


        lectorCargado =
            false;


        mostrarErrorLector(
            error.message
            ||
            "No se ha podido abrir este libro."
        );

    }

}


/* ===================================================== */
/* CABECERA                                             */
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
/* PINTAR CONTENIDO                                     */
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


    contenedor
        .querySelectorAll("p")
        .forEach(
            function(parrafo) {

                parrafo.style.margin =
                    "0 0 1.2em";

            }
        );


    contenedor
        .querySelectorAll("img")
        .forEach(
            function(imagen) {

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

    /*
       Guardamos únicamente si el libro
       terminó de cargar correctamente.
    */

    if (
        lectorCargado &&
        !restaurandoPosicion
    ) {

        guardarProgresoLectura();

    }


    restaurandoPosicion =
        true;


    clearTimeout(
        guardadoScrollPendiente
    );


    if (
        window.estadoApp &&
        libroEnLectura
    ) {

        window.estadoApp.libroActual =
            libroEnLectura;

    }


    /*
       Volvemos a la ficha.
    */

    mostrarPantalla(
        "pantalla-libro"
    );


    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });


    if (
        typeof pintarFichaLibro ===
        "function" &&
        libroEnLectura
    ) {

        pintarFichaLibro(
            libroEnLectura
        );

    }


    setTimeout(
        function() {

            restaurandoPosicion =
                false;

        },
        150
    );

}


/* ===================================================== */
/* ID                                                   */
/* ===================================================== */

function obtenerIdLibroLector(
    libro
) {

    if (
        typeof obtenerIdLibro ===
        "function"
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


/* ===================================================== */
/* LEER PROGRESOS                                       */
/* ===================================================== */

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


/* ===================================================== */
/* GUARDAR PROGRESOS                                    */
/* ===================================================== */

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

    if (
        !lectorCargado ||
        restaurandoPosicion
    ) {

        return null;
    }


    const contenido =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenido) {
        return null;
    }


    /*
       Calculamos el progreso respecto
       al TEXTO DEL LIBRO.

       Ya no usamos toda la página.
    */

    const inicioLibro =
        contenido.offsetTop;


    const alturaLibro =
        contenido.scrollHeight;


    const posicionActual =
        window.scrollY;


    const recorrido =
        Math.max(
            1,
            alturaLibro -
            window.innerHeight
        );


    const avance =
        posicionActual -
        inicioLibro;


    const porcentaje =
        (
            avance /
            recorrido
        ) * 100;


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

    if (
        !libroEnLectura ||
        restaurandoPosicion ||
        !lectorCargado
    ) {

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


    if (
        porcentaje === null ||
        Number.isNaN(
            porcentaje
        )
    ) {

        return;

    }


    const progresos =
        leerProgresosLector();


    /*
       Guardamos únicamente valores
       válidos entre 0 y 100.
    */

    progresos[id] = {

        porcentaje:
            Math.min(
                100,
                Math.max(
                    0,
                    porcentaje
                )
            ),

        fecha:
            Date.now()

    };


    guardarProgresosLector(
        progresos
    );


    actualizarIndicadorProgreso(
        porcentaje
    );


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

    restaurandoPosicion =
        true;


    const id =
        obtenerIdLibroLector(
            libro
        );


    const progresos =
        leerProgresosLector();


    const guardado =
        id
        ? progresos[id]
        : null;


    let porcentaje = 0;


    if (
        typeof guardado ===
        "number"
    ) {

        porcentaje =
            guardado;

    }

    else if (
        guardado &&
        typeof guardado.porcentaje ===
        "number"
    ) {

        porcentaje =
            guardado.porcentaje;

    }


    porcentaje =
        Math.min(
            100,
            Math.max(
                0,
                porcentaje
            )
        );


    const contenido =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenido) {

        restaurandoPosicion =
            false;

        return;

    }


    const inicioLibro =
        contenido.offsetTop;


    const recorrido =
        Math.max(
            0,
            contenido.scrollHeight -
            window.innerHeight
        );


    const destino =
        inicioLibro
        +
        (
            recorrido *
            porcentaje /
            100
        );


    /*
       NUNCA usamos smooth aquí.

       El movimiento suave disparaba
       múltiples eventos scroll y podía
       guardar porcentajes incorrectos.
    */

    window.scrollTo({
        top:
            porcentaje <= 0
                ? 0
                : destino,

        left: 0,

        behavior: "auto"
    });


    actualizarIndicadorProgreso(
        porcentaje
    );


    /*
       Dejamos terminar por completo
       el reposicionamiento antes de
       permitir guardar progreso.
    */

    setTimeout(
        function() {

            lectorCargado =
                true;


            restaurandoPosicion =
                false;


            const real =
                calcularPorcentajeLectura();


            if (
                real !== null
            ) {

                actualizarIndicadorProgreso(
                    real
                );

            }

        },
        350
    );

}


/* ===================================================== */
/* INDICADOR                                            */
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
                    Number(
                        porcentaje
                    ) || 0
                )
            )
        );


    if (relleno) {

        relleno.style.width =
            valor + "%";

    }


    if (texto) {

        texto.textContent =
            valor + "%";

    }

}


/* ===================================================== */
/* SCROLL                                               */
/* ===================================================== */

window.addEventListener(
    "scroll",
    function() {

        const pantalla =
            document.getElementById(
                "pantalla-lector"
            );


        if (
            !pantalla ||
            !pantalla.classList.contains(
                "activa"
            ) ||
            restaurandoPosicion ||
            !lectorCargado
        ) {

            return;

        }


        const porcentaje =
            calcularPorcentajeLectura();


        if (
            porcentaje !== null
        ) {

            actualizarIndicadorProgreso(
                porcentaje
            );

        }


        clearTimeout(
            guardadoScrollPendiente
        );


        guardadoScrollPendiente =
            setTimeout(
                function() {

                    guardarProgresoLectura();

                },
                300
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
        typeof obtenerBiblioteca !==
        "function" ||
        typeof guardarBibliotecaLocal !==
        "function"
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
            function(item) {

                return (
                    obtenerIdLibroLector(
                        item
                    )
                    === id
                );

            }
        );


    const guardado = {

        ...libro,

        idInterno: id,

        estado:
            "leyendo",

        ultimaLectura:
            Date.now()

    };


    if (indice >= 0) {

        biblioteca[indice] = {

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


    controles
        ?.classList
        .toggle(
            "oculto"
        );

}


/* ===================================================== */
/* TAMAÑO                                               */
/* ===================================================== */

function cambiarTamanoTexto(
    cambio
) {

    /*
       Guardamos dónde estábamos ANTES
       de cambiar el tamaño.
    */

    const porcentaje =
        calcularPorcentajeLectura();


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


    if (
        porcentaje !== null
    ) {

        restaurandoPosicion =
            true;


        setTimeout(
            function() {

                restaurarPorcentaje(
                    porcentaje
                );

            },
            100
        );

    }

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

    if (
        ![
            "claro",
            "sepia",
            "oscuro"
        ].includes(
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
        "tema-" +
        temaLectorActual
    );

}


/* ===================================================== */
/* IR ARRIBA                                            */
/* ===================================================== */

function subirInicioLector() {

    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });

}


/* ===================================================== */
/* RESTAURAR TRAS CAMBIAR LETRA                         */
/* ===================================================== */

function restaurarPorcentaje(
    porcentaje
) {

    const contenido =
        document.getElementById(
            "contenido-lector"
        );


    if (!contenido) {

        restaurandoPosicion =
            false;

        return;

    }


    const inicioLibro =
        contenido.offsetTop;


    const recorrido =
        Math.max(
            0,
            contenido.scrollHeight -
            window.innerHeight
        );


    const destino =
        inicioLibro
        +
        recorrido *
        (
            porcentaje /
            100
        );


    window.scrollTo({
        top: destino,
        left: 0,
        behavior: "auto"
    });


    setTimeout(
        function() {

            restaurandoPosicion =
                false;

        },
        250
    );

}


/* ===================================================== */
/* SALIR DE APP                                         */
/* ===================================================== */

window.addEventListener(
    "pagehide",
    function() {

        if (
            lectorCargado &&
            !restaurandoPosicion
        ) {

            guardarProgresoLectura();

        }

    }
);


/* ===================================================== */
/* APP EN SEGUNDO PLANO                                 */
/* ===================================================== */

document.addEventListener(
    "visibilitychange",
    function() {

        if (
            document.hidden &&
            lectorCargado &&
            !restaurandoPosicion
        ) {

            guardarProgresoLectura();

        }

    }
);


/* ===================================================== */
/* HTML SEGURO                                          */
/* ===================================================== */

function escaparHTMLLector(
    texto
) {

    return String(
        texto || ""
    )

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


/* ===================================================== */
/* ARRANQUE                                             */
/* ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        aplicarTemaActual();

        aplicarTamanoActual();

    }
);


console.log(
    "✅ Lector Nere con progreso corregido"
);