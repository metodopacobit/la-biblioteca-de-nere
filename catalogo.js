/* ===================================================== */
/* LA BIBLIOTECA DE NERE                                */
/* CATALOGO.JS · v1.2                                   */
/* Catálogo estable + control infantil por edad          */
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
/* CONTROL DE PETICIONES                                */
/* ===================================================== */

let peticionCatalogoActual = 0;


/* ===================================================== */
/* CACHE GUTENBERG                                      */
/* ===================================================== */

const CACHE_GUTENBERG_NERE = {};

const PROMESAS_GUTENBERG_NERE = {};

const GUTENDEX_CATALOGO =
    "https://gutendex.com/books/";


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
            "fiction novel"

    },


    thriller: {

        nombre: "Thriller",

        icono: "🔪",

        adultos:
            "thriller mystery suspense detective"

    },


    historia: {

        nombre: "Histórica",

        icono: "🏰",

        adultos:
            "historical fiction history",

        infantil:
            "children history historical",

        juvenil:
            "juvenile history historical fiction"

    },


    romantica: {

        nombre: "Romántica",

        icono: "💕",

        adultos:
            "romance love romantic"

    },


    fantasia: {

        nombre: "Fantasía",

        icono: "🪄",

        adultos:
            "fantasy legends supernatural",

        infantil:
            "children fairy tales fantasy",

        juvenil:
            "juvenile fantasy fairy tales"

    },


    cienciaficcion: {

        nombre: "Ciencia ficción",

        icono: "🚀",

        adultos:
            "science fiction future space"

    },


    clasicos: {

        nombre: "Clásicos",

        icono: "📘",

        adultos:
            "classic literature",

        infantil:
            "children literature classics",

        juvenil:
            "juvenile literature classics"

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
            "children mystery detective",

        juvenil:
            "juvenile mystery detective"
    },


    animales: {

        nombre: "Animales",

        icono: "🐾",

        infantil:
            "children animals fables",

        juvenil:
            "animals juvenile fiction"

    }

};


/* ===================================================== */
/* CATEGORÍAS POR TIPO                                  */
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
/* PALABRAS PARA CLASIFICAR GUTENBERG                   */
/* ===================================================== */

const PALABRAS_CATEGORIA_GRATIS = {

    novela: [

        "fiction",
        "novel",
        "novela",
        "novelas",
        "stories",
        "literature"

    ],


    thriller: [

        "mystery",
        "detective",
        "crime",
        "criminal",
        "suspense",
        "thriller",
        "misterio",
        "detectives",
        "police"

    ],


    historia: [

        "historical",
        "history",
        "historia",
        "historic",
        "war",
        "medieval",
        "ancient",
        "roman",
        "revolution"

    ],


    romantica: [

        "love",
        "romance",
        "romantic",
        "amor",
        "amorous",
        "courtship",
        "marriage"

    ],


    fantasia: [

        "fantasy",
        "fairy",
        "fairies",
        "magic",
        "magical",
        "legend",
        "legends",
        "myth",
        "myths",
        "supernatural",
        "fantasia"

    ],


    cienciaficcion: [

        "science fiction",
        "science-fiction",
        "space",
        "planet",
        "future",
        "futuristic",
        "alien",
        "aliens"

    ],


    clasicos: [

        "classic",
        "classics",
        "literature",
        "literatura",
        "fiction"

    ],


    aventuras: [

        "adventure",
        "adventures",
        "aventura",
        "aventuras",
        "voyage",
        "journey",
        "travel",
        "pirate",
        "pirates",
        "exploration"

    ],


    misterio: [

        "mystery",
        "detective",
        "detectives",
        "crime",
        "misterio",
        "mysteries",
        "investigation"

    ],


    animales: [

        "animal",
        "animals",
        "dog",
        "dogs",
        "cat",
        "cats",
        "horse",
        "horses",
        "bird",
        "birds",
        "fable",
        "fables"

    ]

};


/* ===================================================== */
/* CONTROL DE CONTENIDO POR SECCIÓN Y EDAD               */
/* ===================================================== */

const MARCADORES_INFANTILES_NERE = [

    "children",
    "children's",
    "child readers",
    "juvenile fiction",
    "juvenile literature",
    "juvenile stories",
    "picture book",
    "picture books",
    "fairy tales",
    "fables",
    "nursery",
    "young readers",
    "cuentos infantiles",
    "literatura infantil",
    "libros infantiles",
    "libros ilustrados",
    "primeros lectores"

];


const MARCADORES_JUVENILES_NERE = [

    "young adult",
    "young adults",
    "teen",
    "teenage",
    "teenagers",
    "adolescent",
    "adolescents",
    "juvenile fiction",
    "juvenile literature",
    "coming of age",
    "high school",
    "middle grade",
    "literatura juvenil",
    "novela juvenil"

];


const MARCADORES_EDAD_NERE = {

    "3-5": [

        "picture book",
        "picture books",
        "pictorial works",
        "preschool",
        "pre-school",
        "nursery",
        "bedtime stories",
        "read-aloud",
        "alphabet",
        "counting",
        "fairy tales",
        "fables",
        "children's poetry",
        "libros ilustrados",
        "preescolar",
        "cuentos para dormir",
        "primeros lectores"

    ],


    "6-8": [

        "beginning readers",
        "early readers",
        "young readers",
        "children's stories",
        "juvenile fiction",
        "juvenile literature",
        "fairy tales",
        "fables",
        "animals",
        "adventure",
        "school",
        "chapter books",
        "primeros lectores",
        "literatura infantil",
        "cuentos infantiles"

    ],


    "9-11": [

        "middle grade",
        "juvenile fiction",
        "juvenile literature",
        "children's stories",
        "adventure",
        "fantasy",
        "mystery",
        "detective",
        "history",
        "school",
        "friendship",
        "literatura infantil",
        "cuentos infantiles"

    ],


    "12-14": [

        "middle grade",
        "young readers",
        "juvenile fiction",
        "juvenile literature",
        "adventure",
        "fantasy",
        "mystery",
        "school",
        "friendship",
        "coming of age",
        "literatura juvenil",
        "novela juvenil"

    ],


    "15-17": [

        "young adult",
        "young adults",
        "teen",
        "teenage",
        "teenagers",
        "adolescent",
        "adolescents",
        "high school",
        "coming of age",
        "juvenile fiction",
        "literatura juvenil",
        "novela juvenil"

    ]

};


const MARCADORES_CONTENIDO_ADULTO_NERE = [

    "erotic",
    "erotica",
    "pornograph",
    "sexual abuse",
    "sexual violence",
    "rape",
    "prostitution",
    "serial killer",
    "serial murder",
    "suicide",
    "torture",
    "domestic violence",
    "drug addiction",
    "alcoholism",
    "capital punishment"

];


const TITULOS_BLOQUEADOS_INFANTIL_NERE = [

    "crime and punishment",
    "crimen y castigo",
    "crime et chatiment",
    "verbrechen und strafe",
    "delitto e castigo",
    "crime e castigo",
    "the scarlet letter",
    "la letra escarlata",
    "cuentos de amor",
    "insolacion",
    "morrina",
    "don quijote",
    "don quixote"

];


const CODIGOS_IDIOMA_CATALOGO_NERE = {

    es: [
        "es",
        "spa"
    ],

    en: [
        "en",
        "eng"
    ],

    fr: [
        "fr",
        "fre",
        "fra"
    ],

    de: [
        "de",
        "ger",
        "deu"
    ],

    it: [
        "it",
        "ita"
    ],

    pt: [
        "pt",
        "por"
    ]

};


/* ===================================================== */
/* ABRIR CATÁLOGO                                       */
/* ===================================================== */

function abrirCatalogo(tipo) {

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


    window.estadoCatalogo.idioma =
        "es";


    window.estadoCatalogo.soloGratis =
        false;


    if (
        tipo === "adultos"
    ) {

        window.estadoCatalogo.edad =
            "";

        window.estadoCatalogo.categoria =
            "novela";

    }

    else if (
        tipo === "infantil"
    ) {

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

        buscador.value =
            "";

    }


    const checkbox =
        document.getElementById(
            "solo-gratis"
        );


    if (checkbox) {

        checkbox.checked =
            false;

    }


    const idioma =
        document.getElementById(
            "idioma-catalogo"
        );


    if (idioma) {

        idioma.value =
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
        EDADES_CATALOGO[tipo] ||
        [];


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
            elemento =>
                elemento.classList.remove(
                    "activo"
                )
        );


    if (boton) {

        boton.classList.add(
            "activo"
        );

    }


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
        function(clave) {

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
            elemento =>
                elemento.classList.remove(
                    "activo"
                )
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
        permitidos.includes(idioma)

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

    const miPeticion =
        ++peticionCatalogoActual;


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
                    window.estadoCatalogo.idioma,
                    60
                );

        }

        else {

            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma,
                    true,
                    60
                );

        }


        /*
           Si mientras esperábamos se pulsó
           otra categoría, ignoramos esta respuesta.
        */

        if (
            miPeticion !==
            peticionCatalogoActual
        ) {

            return;

        }


        libros =
            prepararLibrosCatalogo(
                libros
            );


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

                : "No encontramos un libro adecuado para esta edad y sección."

        );

    }

    catch (error) {

        if (
            miPeticion !==
            peticionCatalogoActual
        ) {

            return;

        }


        console.error(
            "ERROR BUSCADOR:",
            error
        );


        ponerEstadoCatalogo(
            "❌ No se ha podido realizar la búsqueda."
        );

    }

}


/* ===================================================== */
/* CARGAR SELECCIÓN                                     */
/* ===================================================== */

async function cargarSeleccionCatalogo() {

    const miPeticion =
        ++peticionCatalogoActual;


    ponerEstadoCatalogo(
        "📚 Cargando libros..."
    );


    limpiarCatalogo();


    try {

        let libros = [];


        if (
            window.estadoCatalogo.soloGratis
        ) {

            libros =
                await obtenerGratisCategoria();

        }

        else {

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


            libros =
                await buscarOpenLibrarySimple(
                    consulta,
                    "todo",
                    window.estadoCatalogo.idioma,
                    false,
                    60
                );

        }


        /*
           Evita que una respuesta antigua
           sustituya a la categoría actual.
        */

        if (
            miPeticion !==
            peticionCatalogoActual
        ) {

            return;

        }


        libros =
            prepararLibrosCatalogo(
                libros
            );


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

        if (
            miPeticion !==
            peticionCatalogoActual
        ) {

            return;

        }


        console.error(
            "ERROR CATÁLOGO:",
            error
        );


        ponerEstadoCatalogo(
            "❌ No se ha podido cargar esta selección."
        );

    }

}


/* ===================================================== */
/* CATÁLOGO GRATUITO ESTABLE                            */
/* ===================================================== */

async function obtenerGratisCategoria() {

    const idioma =
        window.estadoCatalogo.idioma;


    const todos =
        await cargarPoolGutenberg(
            idioma
        );


    if (!todos.length) {

        return [];

    }


    const categoria =
        window.estadoCatalogo.categoria;


    const tipo =
        window.estadoCatalogo.tipo;


    const edad =
        window.estadoCatalogo.edad;


    /*
       Primero se excluye todo libro que no tenga
       señales claras de pertenecer a la sección.
       En Infantil y Juvenil nunca se completa con
       obras populares sin clasificar.
    */

    const compatibles =
        todos.filter(
            libro =>
                libroCompatibleConSeccion(
                    libro,
                    tipo,
                    edad
                )
        );


    /*
       Calculamos puntuación local.
       Ya no dependemos de topic= de Gutenberg.
    */

    const puntuados =
        compatibles
        .map(
            function(libro) {

                return {

                    libro,

                    puntos:
                        puntuarLibroGratis(
                            libro,
                            categoria,
                            tipo,
                            edad
                        )

                };

            }
        )
        .sort(
            function(a, b) {

                if (
                    b.puntos !==
                    a.puntos
                ) {

                    return (
                        b.puntos -
                        a.puntos
                    );

                }


                return (
                    (b.libro.descargas || 0)
                    -
                    (a.libro.descargas || 0)
                );

            }
        );


    /*
       Primero resultados claramente relacionados.
    */

    let seleccion =
        puntuados
        .filter(
            resultado =>
                resultado.puntos >
                0
        )
        .map(
            resultado =>
                resultado.libro
        )
        .slice(
            0,
            20
        );


    /*
       Gutenberg español es mucho más pequeño.

       Si una categoría concreta no tiene
       suficientes libros bien etiquetados,
       completamos únicamente con libros que
       ya han superado el control de sección
       y edad.
    */

    if (
        seleccion.length <
        8
    ) {

        const respaldo =
            puntuados
            .map(
                resultado =>
                    resultado.libro
            );


        seleccion =
            combinarSinDuplicados(
                seleccion,
                respaldo
            )
            .slice(
                0,
                20
            );

    }


    /*
       En Adultos sí podemos usar los títulos
       populares como último respaldo. En las
       secciones de menores preferimos mostrar
       menos resultados antes que mezclar contenido.
    */

    if (
        tipo === "adultos"
        &&
        seleccion.length < 6
    ) {

        seleccion =
            combinarSinDuplicados(
                seleccion,
                compatibles
            )
            .slice(
                0,
                20
            );

    }


    return seleccion;

}


/* ===================================================== */
/* CARGAR POOL GUTENBERG                                */
/* ===================================================== */

async function cargarPoolGutenberg(
    idioma
) {

    const clave =
        idioma ||
        "todos";


    if (
        CACHE_GUTENBERG_NERE[
            clave
        ]
    ) {

        return CACHE_GUTENBERG_NERE[
            clave
        ];

    }


    /*
       Si otra categoría ya está descargando
       el catálogo, usamos la misma promesa.
    */

    if (
        PROMESAS_GUTENBERG_NERE[
            clave
        ]
    ) {

        return PROMESAS_GUTENBERG_NERE[
            clave
        ];

    }


    PROMESAS_GUTENBERG_NERE[
        clave
    ] =
        descargarPoolGutenberg(
            idioma
        );


    try {

        const libros =
            await PROMESAS_GUTENBERG_NERE[
                clave
            ];


        CACHE_GUTENBERG_NERE[
            clave
        ] =
            libros;


        return libros;

    }

    finally {

        delete PROMESAS_GUTENBERG_NERE[
            clave
        ];

    }

}


/* ===================================================== */
/* DESCARGAR VARIAS PÁGINAS                             */
/* ===================================================== */

async function descargarPoolGutenberg(
    idioma
) {

    let url =
        GUTENDEX_CATALOGO +
        "?sort=popular";


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


    const resultado =
        [];


    const usados =
        new Set();


    /*
       Cada página de Gutendex contiene
       como máximo 32 libros.

       Leemos varias páginas para tener
       un catálogo suficientemente amplio.
    */

    let paginas =
        0;


    while (
        url &&
        paginas < 6
    ) {

        const respuesta =
            await fetch(
                url
            );


        if (!respuesta.ok) {

            throw new Error(
                "Gutendex: " +
                respuesta.status
            );

        }


        const datos =
            await respuesta.json();


        const libros =
            (datos.results || [])
            .map(
                normalizarGutendex
            );


        libros.forEach(
            function(libro) {

                const id =
                    String(
                        libro.gutenbergId ||
                        libro.idInterno
                    );


                if (
                    usados.has(id)
                ) {

                    return;

                }


                usados.add(id);

                resultado.push(
                    libro
                );

            }
        );


        url =
            datos.next ||
            null;


        paginas++;

    }


    console.log(
        "📚 Gutenberg cargado:",
        idioma,
        resultado.length,
        "libros"
    );


    return resultado;

}


/* ===================================================== */
/* PUNTUAR LIBRO GRATIS                                 */
/* ===================================================== */

function puntuarLibroGratis(
    libro,
    categoria,
    tipo,
    edad
) {

    const texto =
        obtenerTextoClasificacion(
            libro
        );


    const palabras =
        PALABRAS_CATEGORIA_GRATIS[
            categoria
        ] || [];


    let puntos =
        0;


    palabras.forEach(
        function(palabra) {

            if (
                texto.includes(
                    palabra
                    .toLowerCase()
                )
            ) {

                puntos +=
                    palabra.includes(" ")
                        ? 5
                        : 3;

            }

        }
    );


    const marcadoresEdad =
        MARCADORES_EDAD_NERE[
            edad
        ] || [];


    marcadoresEdad.forEach(
        function(marcador) {

            if (
                texto.includes(
                    marcador
                )
            ) {

                puntos += 4;

            }

        }
    );


    /*
       Ajuste según sección.
    */

    if (
        tipo === "infantil"
    ) {

        if (
            contieneAlguna(
                texto,
                [
                    "children",
                    "children's",
                    "child",
                    "juvenile",
                    "fairy tales",
                    "fables"
                ]
            )
        ) {

            puntos += 8;

        }

    }


    else if (
        tipo === "juvenil"
    ) {

        if (
            contieneAlguna(
                texto,
                [
                    "juvenile",
                    "young",
                    "adventure",
                    "fantasy",
                    "school"
                ]
            )
        ) {

            puntos += 6;

        }

    }


    else {

        /*
           En adultos reducimos libros
           claramente infantiles.
        */

        if (
            contieneAlguna(
                texto,
                [
                    "children's literature",
                    "children --",
                    "juvenile fiction"
                ]
            )
        ) {

            puntos -= 5;

        }

    }


    return puntos;

}


/* ===================================================== */
/* COMPATIBILIDAD POR SECCIÓN                           */
/* ===================================================== */

function libroCompatibleConSeccion(
    libro,
    tipo,
    edad = ""
) {

    const texto =
        obtenerTextoClasificacion(
            libro
        );


    const tieneContenidoAdulto =
        contieneAlguna(
            texto,
            MARCADORES_CONTENIDO_ADULTO_NERE
        );


    if (
        tipo === "infantil"
    ) {

        if (
            tieneContenidoAdulto
            ||
            tituloBloqueadoParaInfantil(
                libro
            )
        ) {

            return false;

        }


        const esInfantil =
            contieneAlguna(
                texto,
                MARCADORES_INFANTILES_NERE
            );


        if (!esInfantil) {

            return false;

        }


        const marcadoresEdad =
            MARCADORES_EDAD_NERE[
                edad
            ] || [];


        if (
            edad === "3-5"
        ) {

            return (
                contieneAlguna(
                    texto,
                    marcadoresEdad
                )
                &&
                !contieneAlguna(
                    texto,
                    [
                        "young adult",
                        "teen",
                        "middle grade",
                        "chapter books"
                    ]
                )
            );

        }


        if (
            edad === "6-8"
        ) {

            return (
                contieneAlguna(
                    texto,
                    marcadoresEdad
                )
                &&
                !contieneAlguna(
                    texto,
                    [
                        "young adult",
                        "teenage",
                        "high school"
                    ]
                )
            );

        }


        if (
            edad === "9-11"
        ) {

            return (
                contieneAlguna(
                    texto,
                    marcadoresEdad
                )
                &&
                !contieneAlguna(
                    texto,
                    [
                        "preschool",
                        "pre-school",
                        "nursery rhymes",
                        "alphabet books",
                        "counting books"
                    ]
                )
            );

        }


        return esInfantil;

    }


    if (
        tipo === "juvenil"
    ) {

        if (
            tieneContenidoAdulto
        ) {

            return false;

        }


        const esJuvenil =
            contieneAlguna(
                texto,
                MARCADORES_JUVENILES_NERE
            );


        if (!esJuvenil) {

            return false;

        }


        const marcadoresEdad =
            MARCADORES_EDAD_NERE[
                edad
            ] || [];


        return (
            !marcadoresEdad.length
            ||
            contieneAlguna(
                texto,
                marcadoresEdad
            )
        );

    }


    return !contieneAlguna(
        texto,
        [
            "picture books",
            "nursery",
            "preschool",
            "pre-school",
            "children's picture books"
        ]
    );

}


/* ===================================================== */
/* PREPARAR RESULTADOS DEL CATÁLOGO                      */
/* ===================================================== */

function prepararLibrosCatalogo(
    libros
) {

    const tipo =
        window.estadoCatalogo.tipo;


    const edad =
        window.estadoCatalogo.edad;


    const idioma =
        window.estadoCatalogo.idioma;


    return combinarSinDuplicados(
        [],
        libros || []
    )
    .filter(
        libro =>
            libroTieneIdiomaCatalogo(
                libro,
                idioma
            )
    )
    .filter(
        libro =>
            libroCompatibleConSeccion(
                libro,
                tipo,
                edad
            )
    )
    .slice(
        0,
        20
    );

}


/* ===================================================== */
/* IDIOMA EXACTO                                        */
/* ===================================================== */

function libroTieneIdiomaCatalogo(
    libro,
    idioma
) {

    if (
        !idioma ||
        idioma === "todos"
    ) {

        return true;

    }


    const permitidos =
        CODIGOS_IDIOMA_CATALOGO_NERE[
            idioma
        ] || [
            idioma
        ];


    const idiomasLibro =
        Array.isArray(
            libro.idiomas
        )

            ? libro.idiomas.map(
                codigo =>
                    String(codigo)
                    .toLowerCase()
                    .trim()
            )

            : [];


    return permitidos.some(
        codigo =>
            idiomasLibro.includes(
                codigo
            )
    );

}


/* ===================================================== */
/* TÍTULOS NO INFANTILES                                */
/* ===================================================== */

function tituloBloqueadoParaInfantil(
    libro
) {

    const titulo =
        normalizarTextoCatalogo(
            libro &&
            libro.titulo
        );


    return TITULOS_BLOQUEADOS_INFANTIL_NERE.some(
        bloqueado =>
            titulo.includes(
                bloqueado
            )
    );

}


/* ===================================================== */
/* TEXTO PARA CLASIFICACIÓN                             */
/* ===================================================== */

function obtenerTextoClasificacion(
    libro
) {

    return normalizarTextoCatalogo(
        [

            libro.titulo ||
            "",

            libro.autor ||
            "",

            ...(libro.temas || []),

            ...(libro.estanterias || [])

        ]

        .join(" ")
    );


}


function normalizarTextoCatalogo(
    texto
) {

    return String(
        texto || ""
    )
    .normalize(
        "NFD"
    )

    .replace(
        /[\u0300-\u036f]/g,
        ""
    )

    .toLowerCase()
    .trim();

}


/* ===================================================== */
/* CONTIENE ALGUNA                                      */
/* ===================================================== */

function contieneAlguna(
    texto,
    palabras
) {

    return palabras.some(
        palabra =>
            texto.includes(
                palabra.toLowerCase()
            )
    );

}


/* ===================================================== */
/* COMBINAR SIN DUPLICADOS                              */
/* ===================================================== */

function combinarSinDuplicados(
    primera,
    segunda
) {

    const resultado =
        [];


    const usados =
        new Set();


    [
        ...(primera || []),
        ...(segunda || [])
    ]
    .forEach(
        function(libro) {

            const id =
                [
                    normalizarTextoCatalogo(
                        libro.titulo
                    )
                    .replace(
                        /[^a-z0-9]+/g,
                        " "
                    )
                    .trim(),

                    normalizarTextoCatalogo(
                        libro.autor
                    )
                    .replace(
                        /[^a-z0-9]+/g,
                        " "
                    )
                    .trim()
                ]
                .join("|");


            if (
                usados.has(id)
            ) {

                return;

            }


            usados.add(id);

            resultado.push(
                libro
            );

        }
    );


    return resultado;

}


/* ===================================================== */
/* DATOS CATÁLOGO                                       */
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
            "No encontramos libros adecuados para esta edad y sección."
        );

        return;

    }


    const tipo =
        window.estadoCatalogo.tipo;


    if (
        window.estadoCatalogo.soloGratis
    ) {

        if (
            tipo === "adultos"
        ) {

            ponerEstadoCatalogo(
                "🟢 Libros para adultos gratuitos"
            );

        }

        else if (
            tipo === "infantil"
        ) {

            ponerEstadoCatalogo(
                "🟢 Libros infantiles gratuitos"
            );

        }

        else {

            ponerEstadoCatalogo(
                "🟢 Libros juveniles gratuitos"
            );

        }


        return;

    }


    if (
        tipo === "adultos"
    ) {

        ponerEstadoCatalogo(
            "📚 Libros para adultos recomendados"
        );

    }

    else if (
        tipo === "infantil"
    ) {

        ponerEstadoCatalogo(
            "🧒 Libros infantiles recomendados"
        );

    }

    else {

        ponerEstadoCatalogo(
            "🧑 Libros juveniles recomendados"
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
                    No encontramos libros adecuados para esta edad y sección.
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
    "✅ Catálogo Nere v1.2 · Filtros de edad y contenido activos"
);
