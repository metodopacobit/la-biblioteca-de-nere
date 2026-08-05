/* =====================================================
   LA BIBLIOTECA DE NERE
   CASA-V17.JS · v1.7
   Búsqueda por cualquier palabra, idioma conservador
   y portadas de mayor resolución.
===================================================== */

const CASA_V17_BASE_NERE = "casa-data-v17/";
const CASA_V17_MAX_FRAGMENTOS_NERE = 16;
const CASA_CACHE_FRAGMENTOS_V17_NERE = new Map();
let casaIndicePrefijosV17Nere = null;
let casaCatalogoResumenV17Nere = null;

function portadaCasaNere(codigo) {
    if (!/^97[89]\d{10}$/.test(codigo || "")) {
        return "";
    }
    return "https://imagessl3.casadellibro.com/a/l/s5/" +
        codigo.slice(-2) + "/" + codigo + ".webp";
}

function isbnDesdePortadaCasaV17Nere(url) {
    const coincidencia = String(url || "").match(/\/(97[89]\d{10})(?:\.(?:webp|jpg|jpeg))?(?:\?.*)?$/i);
    return coincidencia ? coincidencia[1] : "";
}

document.addEventListener("error", evento => {
    const imagen = evento.target;
    if (!(imagen instanceof HTMLImageElement)) {
        return;
    }
    const isbn = isbnDesdePortadaCasaV17Nere(imagen.currentSrc || imagen.src);
    if (!isbn) {
        return;
    }
    const etapa = Number(imagen.dataset.casaPortadaEtapa || 0);
    if (etapa === 0) {
        imagen.dataset.casaPortadaEtapa = "1";
        imagen.src = "https://imagessl.casadellibro.com/a/l/t5/" + isbn.slice(-2) + "/" + isbn + ".jpg";
        return;
    }
    if (etapa === 1) {
        imagen.dataset.casaPortadaEtapa = "2";
        imagen.src = "https://imagessl.casadellibro.com/a/l/t2/" + isbn.slice(-2) + "/" + isbn + ".jpg";
        return;
    }
    imagen.style.display = "none";
    const padre = imagen.parentElement;
    if (padre && !padre.querySelector(".tarjeta-libro-sin-portada")) {
        const aviso = document.createElement("div");
        aviso.className = "tarjeta-libro-sin-portada";
        aviso.textContent = "📚";
        padre.appendChild(aviso);
    }
}, true);

async function cargarIndicePrefijosCasaV17Nere() {
    if (!casaIndicePrefijosV17Nere) {
        casaIndicePrefijosV17Nere = leerJsonGzipCasaNere(
            CASA_V17_BASE_NERE + "prefijos.json.gz?v=1.7"
        ).catch(error => {
            casaIndicePrefijosV17Nere = null;
            throw error;
        });
    }
    return casaIndicePrefijosV17Nere;
}

function cargarFragmentoCasaNere(numero) {
    if (!CASA_CACHE_FRAGMENTOS_V17_NERE.has(numero)) {
        const nombre = String(numero).padStart(2, "0");
        const promesa = Promise.all([
            leerJsonGzipCasaNere(
                CASA_INDICE_BASE_NERE + nombre + ".json.gz?v=1.6"
            ),
            leerJsonGzipCasaNere(
                CASA_V17_BASE_NERE + "idiomas/" + nombre + ".json.gz?v=1.7"
            )
        ]).then(([datos, datosIdiomas]) => {
            const registros = Array.isArray(datos.items) ? datos.items : [];
            const idiomas = Array.isArray(datosIdiomas.idiomas) ? datosIdiomas.idiomas : [];
            registros.forEach((registro, indice) => {
                while (registro.length <= 9) {
                    registro.push("");
                }
                registro[9] = idiomas[indice] || registro[9] || "";
            });
            return registros;
        }).catch(error => {
            CASA_CACHE_FRAGMENTOS_V17_NERE.delete(numero);
            throw error;
        });
        CASA_CACHE_FRAGMENTOS_V17_NERE.set(numero, promesa);
    }
    return CASA_CACHE_FRAGMENTOS_V17_NERE.get(numero);
}

async function cargarResumenCasaNere() {
    if (!casaCatalogoResumenV17Nere) {
        casaCatalogoResumenV17Nere = Promise.all([
            fetch(CASA_INDICE_BASE_NERE + "catalogo.json?v=1.6", {cache: "force-cache"})
                .then(respuesta => {
                    if (!respuesta.ok) {
                        throw new Error("No se pudo cargar la selección de Casa del Libro.");
                    }
                    return respuesta.json();
                }),
            leerJsonGzipCasaNere(
                CASA_V17_BASE_NERE + "idiomas-catalogo.json.gz?v=1.7"
            )
        ]).then(([datos, idiomasDatos]) => {
            const idiomas = idiomasDatos.idiomas || {};
            Object.values(datos.grupos || {}).forEach(registros => {
                registros.forEach(registro => {
                    while (registro.length <= 9) {
                        registro.push("");
                    }
                    registro[9] = idiomas[String(registro[0])] || registro[9] || "";
                });
            });
            return datos;
        }).catch(error => {
            casaCatalogoResumenV17Nere = null;
            throw error;
        });
    }
    return casaCatalogoResumenV17Nere;
}

function idiomaCompatibleCasaNere(registro, idioma) {
    if (!idioma || idioma === "todos") {
        return true;
    }
    const declarado = String(registro[9] || "").toLowerCase();
    return declarado === idioma;
}

function clavePrefijoCasaV17Nere(token) {
    const limpio = normalizarCasaNere(token).replace(/\s/g, "");
    if (limpio.length < 3) {
        return "";
    }
    return limpio.length >= 4 ? limpio.slice(0, 4) : limpio;
}

function fragmentosDesdeIndiceCasaV17Nere(indice, consulta) {
    const palabras = tokensCasaNere(consulta)
        .filter(token => token.length >= 3)
        .map(clavePrefijoCasaV17Nere)
        .filter(Boolean);
    const listas = palabras
        .map(clave => indice.prefijos && indice.prefijos[clave])
        .filter(lista => Array.isArray(lista) && lista.length);

    const puntuaciones = new Map();
    const conjuntos = listas.map(lista => new Set(lista.map(item => Number(Array.isArray(item) ? item[0] : item))));
    listas.forEach(lista => {
        lista.forEach(item => {
            const fragmento = Number(Array.isArray(item) ? item[0] : item);
            const cantidad = Number(Array.isArray(item) ? item[1] : 1) || 1;
            puntuaciones.set(fragmento, (puntuaciones.get(fragmento) || 0) + cantidad);
        });
    });

    let candidatos = [];
    if (conjuntos.length) {
        candidatos = Array.from(conjuntos[0]).filter(fragmento =>
            conjuntos.every(conjunto => conjunto.has(fragmento))
        );
        if (!candidatos.length) {
            candidatos = Array.from(new Set(conjuntos.flatMap(conjunto => Array.from(conjunto))));
        }
    }

    const primero = prefijoCasaNere(consulta, false);
    const ultimo = prefijoCasaNere(consulta, true);
    if (primero.length >= 3) {
        candidatos.push(fragmentoCasaNere(primero));
    }
    if (ultimo.length >= 3) {
        candidatos.push(fragmentoCasaNere(ultimo));
    }

    return Array.from(new Set(candidatos))
        .sort((a, b) => (puntuaciones.get(b) || 0) - (puntuaciones.get(a) || 0))
        .slice(0, CASA_V17_MAX_FRAGMENTOS_NERE);
}

async function buscarLibrosCasaNere(consulta, opciones = {}) {
    consultaCasaActualNere = String(consulta || "").trim();
    if (!consultaCasaActualNere || normalizarCasaNere(consultaCasaActualNere).length < 3) {
        return [];
    }

    const indice = await cargarIndicePrefijosCasaV17Nere();
    const fragmentos = fragmentosDesdeIndiceCasaV17Nere(indice, consultaCasaActualNere);
    if (!fragmentos.length) {
        return [];
    }

    const lotes = await Promise.all(fragmentos.map(cargarFragmentoCasaNere));
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
        const puntos = puntuacionRegistroCasaNere(
            registro,
            consultaCasaActualNere,
            opciones.campo || "todo"
        );
        if (puntos >= 0) {
            puntuados.push({registro, puntos});
        }
    });

    puntuados.sort((a, b) =>
        b.puntos - a.puntos ||
        Number(Boolean(b.registro[3])) - Number(Boolean(a.registro[3])) ||
        Number(Boolean(b.registro[2])) - Number(Boolean(a.registro[2]))
    );

    return filtrarMenoresCasaNere(
        agruparRegistrosCasaNere(
            puntuados.slice(0, 400).map(item => item.registro),
            opciones.limite || 24
        ),
        opciones
    );
}

console.log("✅ Casa Nere v1.7 · búsqueda completa, idioma estricto y portadas HD");
