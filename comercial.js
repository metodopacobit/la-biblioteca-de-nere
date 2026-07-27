/* =====================================================
   LA BIBLIOTECA DE NERE
   COMERCIAL.JS · v1.2
   Casa del Libro
===================================================== */


/*
   En esta primera fase todavía no tenemos
   acceso a los enlaces reales de Casa del Libro.

   Cuando Awin apruebe la cuenta, este módulo
   será el encargado de gestionar:

   - Libro físico
   - eBook
   - Audiolibro
*/


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


    /*
       En el futuro las ofertas llegarán
       desde Casa del Libro / Awin.
    */

    const ofertas =
        libro &&
        libro.comercial

            ? libro.comercial

            : {};


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
            "Casa del Libro"

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

                ? "Opciones disponibles en Casa del Libro."

                : "Integración con Casa del Libro en preparación.";

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
    "✅ Comercial Nere v1.2 preparado"
);