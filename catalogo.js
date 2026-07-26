/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS                                          */
/* Infantil + Juvenil + buscador + filtros              */
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
/* CONFIGURACIÓN DE EDADES                              */
/* ===================================================== */

const EDADES_INFANTIL = [

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

];


const EDADES_JUVENIL = [

    {
        clave: "12-14",
        texto: "12-14 años"
    },

    {
        clave: "15-17",
        texto: "15-17 años"
    }

];


/* ===================================================== */
/* TEMÁTICAS                                            */
/* ===================================================== */

const TEMAS_CATALOGO = {

    aventuras: {
        texto: "adventure"
    },

    fantasia: {
        texto: "fantasy"
    },

    misterio: {
        texto: "mystery"
    },

    animales: {
        texto: "animals"
    },

    historia: {
        texto: "historical fiction"
    },

    clasicos: {
        texto: "classic literature"
    }

};


/* ===================================================== */
/* ABRIR CATÁLOGO                                       */
/* ===================================================== */

function abrirCatalogo(tipo) {

    window.estadoCatalogo.tipo =
        tipo === "juvenil"
            ? "juvenil"
            : "infantil";


    window.estadoCatalogo.edad =
        window.estadoCatalogo.tipo === "infantil"
            ? "6-8"
            : "12-14";


    window.estadoCatalogo.categoria =
        "aventuras";


    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    if (checkbox) {

        checkbox.checked =
            false;

    }


    window.estadoCatalogo.soloGratis =
        false;


    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    if (input) {

        input.value = "";

    }


    const titulo =
        document.getElementById(
            "titulo-catalogo"
        );


    if (titulo) {

        titulo.textContent =
            window.estadoCatalogo.tipo === "infantil"
                ? "Infantil"
                : "Juvenil";

    }


    pintarFiltrosEdadCatalogo();

    marcarCategoriaActiva(
        "aventuras"
    );


    mostrarPantalla(
        "pantalla-catalogo"
    );


    actualizarCatalogo();
}


/* ===================================================== */
/* EDADES                                               */
/* ===================================================== */

function pintarFiltrosEdadCatalogo() {

    const contenedor =
        document.getElementById(
            "filtros-edad"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = "";


    const edades =
        window.estadoCatalogo.tipo === "infantil"
            ? EDADES_INFANTIL
            : EDADES_JUVENIL;


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


            boton.addEventListener(
                "click",
                function() {

                    filtrarEdad(
                        edad.clave,
                        boton
                    );

                }
            );


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


    boton?.classList.add(
        "activo"
    );


    actualizarCatalogo();
}


/* ===================================================== */
/* CAMBIAR CATEGORÍA                                    */
/* ===================================================== */

function filtrarCategoria(
    categoria,
    boton
) {

    if (
        !TEMAS_CATALOGO[
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


    boton?.classList.add(
        "activo"
    );


    actualizarCatalogo();
}


/* ===================================================== */
/* MARCAR CATEGORÍA                                     */
/* ===================================================== */

function marcarCategoriaActiva(
    categoria
) {

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


    const orden = {

        aventuras: 0,

        fantasia: 1,

        misterio: 2,

        animales: 3,

        historia: 4,

        clasicos: 5

    };


    const indice =
        orden[categoria];


    if (
        indice !== undefined
        &&
        botones[indice]
    ) {

        botones[indice]
            .classList.add(
                "activo"
            );
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


    const texto =
        input?.value.trim()
        || "";


    /*
      Si está vacío, volvemos
      a la selección automática.
    */

    if (!texto) {

        actualizarCatalogo();

        return;
    }


    const estado =
        document.getElementById(
            "estado-catalogo"
        );


    const contenedor =
        document.getElementById(
            "catalogo-libros"
        );


    if (!contenedor) {

        return;
    }


    estado.textContent =
        "🔎 Buscando...";


    contenedor.innerHTML = "";


    try {

        let libros = [];


        /*
          SOLO GRATIS
          -> Gutenberg / Gutendex
        */

        if (
            document
                .getElementById(
                    "solo-gratis"
                )
                ?.checked
        ) {

            libros =
                await buscarLibrosGratis(
                    texto
                );

        }

        /*
          CATÁLOGO GENERAL
          -> Open Library
        */

        else {

            libros =
                await buscarOpenLibrarySimple(
                    texto,
                    "todo"
                );
        }


        /*
          Añadimos edad y categoría
          como información visual.
        */

        libros =
            libros.map(
                function(libro) {

                    return {

                        ...libro,

                        edad:
                            window.estadoCatalogo.edad
                            +
                            " años",

                        categoria:
                            nombreCategoriaCatalogo(
                                window.estadoCatalogo.categoria
                            )
                    };

                }
            );


        pintarCatalogo(
            libros
        );


        estado.textContent =
            libros.length
                ? libros.length +
                  " resultados encontrados"
                : "No se encontraron libros.";

    }

    catch (error) {

        console.error(
            "Error buscando en catálogo:",
            error
        );


        estado.textContent =
            "❌ No se ha podido realizar la búsqueda.";
    }
}


/* ===================================================== */
/* ACTUALIZAR CATÁLOGO                                  */
/* ===================================================== */

async function actualizarCatalogo() {

    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    window.estadoCatalogo.soloGratis =
        Boolean(
            checkbox?.checked
        );


    const input =
        document.getElementById(
            "input-busqueda-catalogo"
        );


    /*
      Si hay texto escrito,
      hacemos búsqueda directa.
    */

    if (
        input
        &&
        input.value.trim()
    ) {

        buscarEnCatalogo();

        return;
    }


    const estado =
        document.getElementById(
            "estado-catalogo"
        );


    const contenedor =
        document.getElementById(
            "catalogo-libros"
        );


    if (!contenedor) {

        return;
    }


    estado.textContent =
        "📚 Cargando selección...";


    contenedor.innerHTML = "";


    try {

        let libros = [];


        const consulta =
            construirConsultaCatalogo();


        /*
          GRATIS
        */

        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await buscarLibrosGratis(
                    consulta
                );

        }

        /*
          GENERAL
        */

        else {

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo"
                );
        }


        /*
          Si la consulta compleja no da nada,
          hacemos una más sencilla.
        */

        if (!libros.length) {

            const tema =
                TEMAS_CATALOGO[
                    window.estadoCatalogo.categoria
                ]?.texto
                || "books";


            if (
                window.estadoCatalogo.soloGratis
            ) {

                libros =
                    await buscarLibrosGratis(
                        tema
                    );

            }

            else {

                libros =
                    await buscarOpenLibrarySimple(
                        tema,
                        "todo"
                    );
            }
        }


        libros =
            libros.map(
                function(libro) {

                    return {

                        ...libro,

                        edad:
                            window.estadoCatalogo.edad
                            +
                            " años",

                        categoria:
                            nombreCategoriaCatalogo(
                                window.estadoCatalogo.categoria
                            )
                    };

                }
            );


        pintarCatalogo(
            libros
        );


        estado.textContent =
            window.estadoCatalogo.tipo === "infantil"
                ? "🧒 Selección infantil"
                : "🧑 Selección juvenil";

    }

    catch (error) {

        console.error(
            "Error cargando catálogo:",
            error
        );


        estado.textContent =
            "❌ No se ha podido cargar esta sección.";


        contenedor.innerHTML = `
            <div class="estado-vacio">
                <span>📚</span>
                <p>
                    No se ha podido conectar con el catálogo.
                </p>
            </div>
        `;
    }
}


/* ===================================================== */
/* CONSTRUIR CONSULTA                                   */
/* ===================================================== */

function construirConsultaCatalogo() {

    const tema =
        TEMAS_CATALOGO[
            window.estadoCatalogo.categoria
        ]?.texto
        || "books";


    /*
      Open Library entiende razonablemente
      estos términos en inglés.
    */

    let publico = "";


    if (
        window.estadoCatalogo.tipo ===
        "infantil"
    ) {

        if (
            window.estadoCatalogo.edad ===
            "3-5"
        ) {

            publico =
                "picture books children";
        }

        else if (
            window.estadoCatalogo.edad ===
            "6-8"
        ) {

            publico =
                "children books";
        }

        else {

            publico =
                "juvenile children";
        }

    }

    else {

        if (
            window.estadoCatalogo.edad ===
            "12-14"
        ) {

            publico =
                "juvenile fiction";
        }

        else {

            publico =
                "young adult";
        }
    }


    return (
        publico
        +
        " "
        +
        tema
    );
}


/* ===================================================== */
/* NOMBRE DE CATEGORÍA                                  */
/* ===================================================== */

function nombreCategoriaCatalogo(
    categoria
) {

    const nombres = {

        aventuras:
            "Aventuras",

        fantasia:
            "Fantasía",

        misterio:
            "Misterio",

        animales:
            "Animales",

        historia:
            "Historia",

        clasicos:
            "Clásicos"

    };


    return (
        nombres[categoria]
        ||
        categoria
    );
}


/* ===================================================== */
/* PINTAR CATÁLOGO                                      */
/* ===================================================== */

function pintarCatalogo(
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
        !libros
        ||
        !libros.length
    ) {

        contenedor.innerHTML = `
            <div class="estado-vacio">
                <span>📚</span>
                <p>
                    No hemos encontrado libros
                    para esta selección.
                </p>
            </div>
        `;

        return;
    }


    libros.forEach(
        function(libro) {

            /*
              Reutilizamos exactamente
              la misma tarjeta del buscador.
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

        }
    );
}


/* ===================================================== */
/* ENTER EN BUSCADOR DEL CATÁLOGO                       */
/* ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const input =
            document.getElementById(
                "input-busqueda-catalogo"
            );


        input?.addEventListener(
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
);


/* ===================================================== */
/* FIN                                                  */
/* ===================================================== */

console.log(
    "✨ Catálogo Infantil/Juvenil cargado correctamente"
);