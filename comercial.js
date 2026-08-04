/* =====================================================
   LA BIBLIOTECA DE NERE
   COMERCIAL.JS · v1.5
   Casa del Libro · Awin
===================================================== */


const AWIN_ANUNCIANTE_CASA_NERE =
    "21491";

const AWIN_AFILIADO_NERE =
    "3007163";

const BUSCADOR_CASA_NERE =
    "https://www.casadellibro.com/busqueda-generica?busqueda=";


window.estadoComercialNere = {

    libro:
        null,

    ofertas: {

        fisico:
            null,

        ebook:
            null,

        audiolibro:
            null

    }

};


/* =====================================================
   ACTUALIZAR FICHA
===================================================== */

function actualizarOpcionesCompra(
    libro
) {

    window.estadoComercialNere.libro =
        libro ||
        null;


    const ofertas =
        libro &&
        libro.comercial

            ? libro.comercial

            : crearOfertasBusquedaCasa(
                libro
            );


    window.estadoComercialNere.ofertas = {

        fisico:
            normalizarOfertaComercial(
                ofertas.fisico
            ),

        ebook:
            normalizarOfertaComercial(
                ofertas.ebook
            ),

        audiolibro:
            normalizarOfertaComercial(
                ofertas.audiolibro
            )

    };


    actualizarBotonCompra(
        "fisico",
        "comprar-fisico",
        "estado-fisico"
    );


    actualizarBotonCompra(
        "ebook",
        "comprar-ebook",
        "estado-ebook"
    );


    actualizarBotonCompra(
        "audiolibro",
        "comprar-audiolibro",
        "estado-audiolibro"
    );


    actualizarMensajeComercial();

}


/* =====================================================
   BÚSQUEDAS AFILIADAS
===================================================== */

function crearOfertasBusquedaCasa(
    libro
) {

    if (
        !libro ||
        !String(
            libro.titulo ||
            libro.title ||
            ""
        ).trim()
    ) {

        return {};

    }


    return {

        fisico:
            crearOfertaBusquedaCasa(
                libro,
                "fisico"
            ),

        ebook:
            crearOfertaBusquedaCasa(
                libro,
                "ebook"
            ),

        audiolibro:
            crearOfertaBusquedaCasa(
                libro,
                "audiolibro"
            )

    };

}


function crearOfertaBusquedaCasa(
    libro,
    tipo
) {

    const titulo =
        String(
            libro.titulo ||
            libro.title ||
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();


    const autorOriginal =
        String(
            libro.autor ||
            libro.author ||
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();


    const autor =
        autorOriginal &&
        !/autor desconocido/i.test(
            autorOriginal
        )

            ? autorOriginal

            : "";


    const formato = {

        fisico:
            "",

        ebook:
            "ebook",

        audiolibro:
            "audiolibro"

    }[
        tipo
    ] || "";


    const consulta =
        [
            titulo,
            autor,
            formato
        ]
        .filter(Boolean)
        .join(" ");


    const destino =
        BUSCADOR_CASA_NERE +
        encodeURIComponent(
            consulta
        );


    const urlAfiliada =
        "https://www.awin1.com/cread.php" +
        "?awinmid=" +
        AWIN_ANUNCIANTE_CASA_NERE +
        "&awinaffid=" +
        AWIN_AFILIADO_NERE +
        "&ued=" +
        encodeURIComponent(
            destino
        );


    return {

        url:
            urlAfiliada,

        precio:
            "",

        disponible:
            true,

        tienda:
            "Casa del Libro",

        esBusqueda:
            true

    };

}


/* =====================================================
   NORMALIZAR OFERTA
===================================================== */

function normalizarOfertaComercial(
    oferta
) {

    if (
        !oferta ||
        typeof oferta !==
        "object"
    ) {

        return null;

    }


    if (
        !oferta.url
    ) {

        return null;

    }


    return {

        url:
            oferta.url,

        precio:
            oferta.precio ||
            "",

        disponible:
            oferta.disponible !==
            false,

        tienda:
            oferta.tienda ||
            "Casa del Libro",

        esBusqueda:
            Boolean(
                oferta.esBusqueda
            )

    };

}


/* =====================================================
   BOTONES
===================================================== */

function actualizarBotonCompra(
    tipo,
    botonId,
    estadoId
) {

    const boton =
        document.getElementById(
            botonId
        );


    const texto =
        document.getElementById(
            estadoId
        );


    if (
        !boton ||
        !texto
    ) {

        return;

    }


    const oferta =
        window.estadoComercialNere
        .ofertas[
            tipo
        ];


    if (
        oferta &&
        oferta.disponible &&
        oferta.url
    ) {

        boton.disabled =
            false;


        boton.classList.add(
            "disponible"
        );


        if (
            oferta.precio
        ) {

            texto.textContent =
                oferta.precio +
                " · Casa del Libro";

        }

        else if (
            oferta.esBusqueda
        ) {

            texto.textContent =
                "Buscar · Casa del Libro";

        }

        else {

            texto.textContent =
                "Disponible · Casa del Libro";

        }

    }

    else {

        boton.disabled =
            true;


        boton.classList.remove(
            "disponible"
        );


        texto.textContent =
            "Próximamente";

    }

}


/* =====================================================
   MENSAJE
===================================================== */

function actualizarMensajeComercial() {

    const mensaje =
        document.getElementById(
            "mensaje-compra"
        );


    const aviso =
        document.getElementById(
            "aviso-afiliado"
        );


    const ofertas =
        window.estadoComercialNere
        .ofertas;


    const hayOferta =
        Boolean(
            ofertas.fisico ||
            ofertas.ebook ||
            ofertas.audiolibro
        );


    if (mensaje) {

        mensaje.textContent =
            hayOferta

                ? "Consulta el precio y la disponibilidad en Casa del Libro."

                : "No se ha podido preparar la búsqueda en Casa del Libro.";

    }


    if (aviso) {

        if (hayOferta) {

            aviso.classList.remove(
                "oculto"
            );

        }

        else {

            aviso.classList.add(
                "oculto"
            );

        }

    }

}


/* =====================================================
   ABRIR COMPRA
===================================================== */

function abrirCompraCasa(
    tipo
) {

    const oferta =
        window.estadoComercialNere
        .ofertas[
            tipo
        ];


    if (
        !oferta ||
        !oferta.url
    ) {

        return;

    }


    window.open(
        oferta.url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =====================================================
   CONECTAR CON LA FICHA EXISTENTE
===================================================== */

/*
   No modificamos app.js.

   Envolvemos la función abrirFichaLibro()
   que ya existe en la app estable.
*/


document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            typeof window.abrirFichaLibro !==
            "function"
        ) {

            console.warn(
                "No se encontró abrirFichaLibro()"
            );

            return;

        }


        const abrirFichaOriginal =
            window.abrirFichaLibro;


        window.abrirFichaLibro =
            function(libro) {

                const resultado =
                    abrirFichaOriginal
                    .apply(
                        this,
                        arguments
                    );


                Promise
                .resolve(
                    resultado
                )
                .finally(
                    function() {

                        setTimeout(
                            function() {

                                const libroActual =
                                    window.estadoApp &&
                                    window.estadoApp.libroActual

                                        ? window.estadoApp.libroActual

                                        : libro;


                                actualizarOpcionesCompra(
                                    libroActual
                                );

                            },
                            0
                        );

                    }
                );


                return resultado;

            };

    }
);


console.log(
    "✅ Comercial Nere v1.5 · Awin activo"
);
