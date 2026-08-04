/* =====================================================
   LA BIBLIOTECA DE NERE
   CASA.JS · v1.6
   Búsqueda local del catálogo de Casa del Libro
===================================================== */

const CASA_INDICE_BASE_NERE = "casa-data-final-v16-c83d/";
const CASA_FRAGMENTOS_NERE = 64;
const CASA_AWIN_ANUNCIANTE_NERE = "21491";
const CASA_AWIN_AFILIADO_NERE = "3007163";
const CASA_BUSCADOR_NERE = "https://www.casadellibro.com/busqueda-generica?busqueda=";

const CASA_STOPWORDS_NERE = new Set([
    "a", "al", "an", "and", "con", "d", "de", "del", "des", "du",
    "e", "el", "en", "et", "for", "la", "las", "le", "les", "los",
    "of", "para", "por", "the", "un", "una", "unas", "uno", "unos", "y"
]);

const CASA_CATEGORIAS_NERE = {
    novela: 1,
    thriller: 2,
    historia: 4,
    romantica: 8,
    fantasia: 16,
    cienciaficcion: 32,
    clasicos: 64,
    aventuras: 128,
    misterio: 256,
    animales: 512
};

const CASA_EDADES_NERE = {
    "3-5": 1,
    "6-8": 2,
    "9-11": 4,
    "12-14": 8,
    "15-17": 16
};

const CASA_SECCIONES_NERE = {
    adultos: 0,
    infantil: 1,
    juvenil: 2
};

const CASA_FORMATOS_NERE = [
    "fisico",
    "ebook",
    "audiolibro"
];

const CASA_CACHE_FRAGMENTOS_NERE = new Map();
let casaCatalogoResumenNere = null;
let consultaCasaActualNere = "";

window.modoBusquedaNere = "gratis";


function normalizarCasaNere(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\((?:ebook|audiolibro)\)\s*$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}


function tokensCasaNere(texto) {
    const todos = normalizarCasaNere(texto).split(" ").filter(Boolean);
    const utiles = todos.filter(token => !CASA_STOPWORDS_NERE.has(token));
    return utiles.length ? utiles : todos;
}


function prefijoCasaNere(texto, ultimo = false) {
    const tokens = tokensCasaNere(texto);
    if (!tokens.length) {
        return "";
    }
    return (ultimo ? tokens[tokens.length - 1] : tokens[0]).slice(0, 3);
}


function fragmentoCasaNere(prefijo) {
    let numero = 2166136261;
    const bytes = new TextEncoder().encode(prefijo);
    bytes.forEach(byte => {
        numero ^= byte;
        numero = Math.imul(numero, 16777619) >>> 0;
    });
    return numero % CASA_FRAGMENTOS_NERE;
}


async function leerJsonGzipCasaNere(url) {
    if (typeof DecompressionStream !== "function") {
        throw new Error("Este navegador no permite abrir el índice comprimido.");
    }

    const respuesta = await fetch(url, {cache: "force-cache"});
    if (!respuesta.ok || !respuesta.body) {
        throw new Error("No se pudo cargar el catálogo de Casa del Libro.");
    }

    const flujo = respuesta.body.pipeThrough(new DecompressionStream("gzip"));
    return new Response(flujo).json();
}


function cargarFragmentoCasaNere(numero) {
    if (!CASA_CACHE_FRAGMENTOS_NERE.has(numero)) {
        const nombre = String(numero).padStart(2, "0");
        CASA_CACHE_FRAGMENTOS_NERE.set(
            numero,
            leerJsonGzipCasaNere(`${CASA_INDICE_BASE_NERE}${nombre}.json.gz?v=1.6`)
                .then(datos => Array.isArray(datos.items) ? datos.items : [])
                .catch(error => {
                    CASA_CACHE_FRAGMENTOS_NERE.delete(numero);
                    throw error;
                })
        );
    }
    return CASA_CACHE_FRAGMENTOS_NERE.get(numero);
}


async function cargarResumenCasaNere() {
    if (!casaCatalogoResumenNere) {
        casaCatalogoResumenNere = fetch(`${CASA_INDICE_BASE_NERE}catalogo.json?v=1.6`, {cache: "force-cache"})
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar la selección de Casa del Libro.");
                }
                return respuesta.json();
            })
            .catch(error => {
                casaCatalogoResumenNere = null;
                throw error;
            });
    }
    return casaCatalogoResumenNere;
}


function idiomaCompatibleCasaNere(registro, idioma) {
    if (!idioma || idioma === "todos") {
        return true;
    }
    const declarado = registro[9] || "";
    if (declarado) {
        return declarado === idioma;
    }
    // El feed físico de Casa del Libro no declara idioma. Se conserva en
    // Español, pero no se atribuye a otros idiomas sin metadatos.
    return idioma === "es";
}


function registroCompatibleCatalogoCasaNere(registro, opciones) {
    if (!opciones || !opciones.seccion) {
        return true;
    }

    // Para menores la decisión definitiva se toma después con el catálogo
    // revisado. No descartamos antes una edición correcta por una categoría
    // editorial incompleta o errónea del feed.
    if (["infantil", "juvenil"].includes(opciones.seccion)) {
        return true;
    }

    const seccion = CASA_SECCIONES_NERE[opciones.seccion];
    if (registro[6] !== seccion) {
        return false;
    }
    const edad = CASA_EDADES_NERE[opciones.edad] || 0;
    if (edad && !(registro[7] & edad)) {
        return false;
    }
    const categoria = CASA_CATEGORIAS_NERE[opciones.categoria] || 0;
    return !categoria || Boolean(registro[8] & categoria);
}


function puntuacionRegistroCasaNere(registro, consulta, campo) {
    const titulo = normalizarCasaNere(registro[1]);
    const autor = normalizarCasaNere(registro[2]);
    const isbn = registro[3] || "";
    const normalizada = normalizarCasaNere(consulta);
    const tokens = tokensCasaNere(consulta);
    const todosTitulo = tokens.every(token => titulo.includes(token));
    const todosAutor = tokens.every(token => autor.includes(token));

    if (campo === "titulo" && !todosTitulo) {
        return -1;
    }
    if (campo === "autor" && !todosAutor) {
        return -1;
    }
    if (normalizada && isbn === normalizada.replace(/\s/g, "")) {
        return 120;
    }
    if (titulo === normalizada) {
        return 110;
    }
    if (titulo.startsWith(normalizada)) {
        return 100;
    }
    if (titulo.includes(normalizada)) {
        return 90;
    }
    if (todosTitulo) {
        return 80;
    }
    if (autor === normalizada) {
        return 75;
    }
    if (autor.startsWith(normalizada)) {
        return 70;
    }
    if (autor.includes(normalizada)) {
        return 65;
    }
    if (todosAutor) {
        return 60;
    }
    return -1;
}


function urlProductoCasaNere(productoId) {
    return "https://www.awin1.com/pclick.php" +
        `?p=${encodeURIComponent(productoId)}` +
        `&a=${CASA_AWIN_AFILIADO_NERE}` +
        `&m=${CASA_AWIN_ANUNCIANTE_NERE}`;
}


function portadaCasaNere(codigo) {
    if (!/^97[89]\d{10}$/.test(codigo || "")) {
        return "";
    }
    return "https://imagessl.casadellibro.com/a/l/t2/" +
        codigo.slice(-2) + "/" + codigo + ".jpg";
}


function precioCasaNere(centimos) {
    if (!centimos) {
        return "";
    }
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(centimos / 100);
}


function agruparRegistrosCasaNere(registros, limite = 24) {
    const grupos = new Map();

    registros.forEach(registro => {
        const clave = normalizarCasaNere(registro[1]) + "|" + normalizarCasaNere(registro[2]);
        if (!clave || clave === "|") {
            return;
        }

        if (!grupos.has(clave)) {
            grupos.set(clave, {
                titulo: registro[1],
                autor: registro[2] || "Autor desconocido",
                portada: portadaCasaNere(registro[3]),
                resena: "Disponible en el catálogo de Casa del Libro.",
                tipo: "casa",
                tiendaCasa: true,
                gratis: false,
                comercial: {},
                preciosCasa: []
            });
        }

        const libro = grupos.get(clave);
        if (!libro.portada) {
            libro.portada = portadaCasaNere(registro[3]);
        }

        const formato = CASA_FORMATOS_NERE[registro[5]];
        const precio = precioCasaNere(registro[4]);
        const oferta = {
            url: urlProductoCasaNere(registro[0]),
            precio,
            disponible: true,
            tienda: "Casa del Libro",
            esBusqueda: false
        };

        const anterior = libro.comercial[formato];
        if (!anterior || (!anterior.precio && precio)) {
            libro.comercial[formato] = oferta;
        } else if (anterior.precio && precio) {
            const previo = Number(anterior.precio.replace(/[^0-9,]/g, "").replace(",", "."));
            if (registro[4] / 100 < previo) {
                libro.comercial[formato] = oferta;
            }
        }

        if (registro[4]) {
            libro.preciosCasa.push(registro[4]);
        }
    });

    return Array.from(grupos.values())
        .map(libro => {
            if (libro.preciosCasa.length) {
                libro.precioDesde = "Desde " + precioCasaNere(Math.min(...libro.preciosCasa));
            }
            delete libro.preciosCasa;
            return libro;
        })
        .slice(0, limite);
}


function filtrarMenoresCasaNere(libros, opciones = {}) {
    if (
        !["infantil", "juvenil"].includes(opciones.seccion)
        || typeof libroAutorizadoParaMenoresGeneral !== "function"
    ) {
        return libros;
    }

    // Casa del Libro mezcla metadatos de edad e idioma de varios editores.
    // Conservamos en Infantil y Juvenil la misma lista revisada de la v1.4:
    // una etiqueta incorrecta del feed nunca basta para mostrar un título.
    return libros.filter(libro =>
        libroAutorizadoParaMenoresGeneral(
            libro,
            opciones.seccion,
            opciones.edad || "",
            opciones.categoria || "",
            opciones.idioma || "es"
        )
    );
}


async function buscarLibrosCasaNere(consulta, opciones = {}) {
    consultaCasaActualNere = String(consulta || "").trim();
    const primero = prefijoCasaNere(consulta, false);
    const ultimo = prefijoCasaNere(consulta, true);
    if (primero.length < 3) {
        return [];
    }

    const fragmentos = new Set([fragmentoCasaNere(primero)]);
    if (ultimo.length >= 3) {
        fragmentos.add(fragmentoCasaNere(ultimo));
    }

    const lotes = await Promise.all(Array.from(fragmentos, cargarFragmentoCasaNere));
    const vistos = new Set();
    const puntuados = [];

    lotes.flat().forEach(registro => {
        if (vistos.has(registro[0])) {
            return;
        }
        vistos.add(registro[0]);
        if (!idiomaCompatibleCasaNere(registro, opciones.idioma || "es")) {
            return;
        }
        if (!registroCompatibleCatalogoCasaNere(registro, opciones)) {
            return;
        }
        const puntos = puntuacionRegistroCasaNere(registro, consulta, opciones.campo || "todo");
        if (puntos < 0) {
            return;
        }
        puntuados.push({registro, puntos});
    });

    puntuados.sort((a, b) =>
        b.puntos - a.puntos ||
        Number(Boolean(b.registro[3])) - Number(Boolean(a.registro[3])) ||
        Number(Boolean(b.registro[2])) - Number(Boolean(a.registro[2]))
    );

    return filtrarMenoresCasaNere(agruparRegistrosCasaNere(
        puntuados.slice(0, 250).map(item => item.registro),
        opciones.limite || 24
    ), opciones);
}


async function obtenerCatalogoCasaNere(opciones) {
    const datos = await cargarResumenCasaNere();
    const seccion = CASA_SECCIONES_NERE[opciones.seccion] ?? 0;
    const edad = seccion === 0 ? 0 : (CASA_EDADES_NERE[opciones.edad] || 0);
    const clave = `${seccion}:${edad}:${opciones.categoria}`;
    const registros = datos.grupos && Array.isArray(datos.grupos[clave])
        ? datos.grupos[clave]
        : [];
    return filtrarMenoresCasaNere(agruparRegistrosCasaNere(
        registros.filter(registro => idiomaCompatibleCasaNere(registro, opciones.idioma || "es")),
        opciones.limite || 20
    ), opciones);
}


function urlBusquedaDirectaCasaNere(consulta) {
    const destino = CASA_BUSCADOR_NERE + encodeURIComponent(consulta || "libros");
    return "https://www.awin1.com/cread.php" +
        `?awinmid=${CASA_AWIN_ANUNCIANTE_NERE}` +
        `&awinaffid=${CASA_AWIN_AFILIADO_NERE}` +
        `&ued=${encodeURIComponent(destino)}`;
}


function abrirBusquedaDirectaCasaNere(consulta = consultaCasaActualNere) {
    window.open(urlBusquedaDirectaCasaNere(consulta), "_blank", "noopener,noreferrer");
}


function pintarBusquedaDirectaCasaNere(contenedor, consulta) {
    if (!contenedor) {
        return;
    }
    const bloque = document.createElement("div");
    bloque.className = "estado-vacio estado-vacio-casa";
    bloque.innerHTML = `
        <span>🛍️</span>
        <p>No encontramos una coincidencia exacta en el índice.</p>
        <button type="button" class="boton-principal boton-busqueda-casa">
            Buscar “${escaparHTMLCasaNere(consulta)}” en Casa del Libro
        </button>
    `;
    bloque.querySelector("button")?.addEventListener("click", () => abrirBusquedaDirectaCasaNere(consulta));
    contenedor.innerHTML = "";
    contenedor.appendChild(bloque);
}


function cambiarModoBusquedaNere(modo) {
    window.modoBusquedaNere = modo === "casa" ? "casa" : "gratis";
    if (window.estadoCatalogo) {
        window.estadoCatalogo.soloGratis = window.modoBusquedaNere === "gratis";
    }
    actualizarControlesModoNere();

    const pantalla = window.estadoApp && window.estadoApp.pantallaActual;
    if (pantalla === "pantalla-buscar") {
        const input = document.getElementById("input-busqueda-resultados");
        if (input?.value.trim() && typeof buscarLibros === "function") {
            buscarLibros();
        }
    } else if (pantalla === "pantalla-catalogo" && typeof recargarCatalogoActual === "function") {
        recargarCatalogoActual();
    }
}


function actualizarControlesModoNere() {
    document.querySelectorAll("[data-modo-nere]").forEach(boton => {
        const activo = boton.dataset.modoNere === window.modoBusquedaNere;
        boton.classList.toggle("activo", activo);
        boton.setAttribute("aria-pressed", String(activo));
    });
}


function escaparHTMLCasaNere(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document.addEventListener("DOMContentLoaded", actualizarControlesModoNere);

console.log("✅ Casa Nere v1.6 · catálogo Awin fragmentado activo");
