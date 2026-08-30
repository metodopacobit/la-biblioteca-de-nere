/* La Biblioteca de Nere · v1.10 · núcleo de búsqueda segura */
(function () {
  "use strict";
  if (window.NereV110?.coreReady) return;

  const N = window.NereV110 = window.NereV110 || {};
  N.coreReady = true;
  N.FRAGMENTOS_POR_LOTE = 3;
  N.RESULTADOS_POR_PANTALLA = 40;
  N.estado = null;

  const norm = texto => String(texto || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  const tokens = texto => norm(texto).split(" ").filter(Boolean);
  const tokenCoincide = (a, b) => a === b || (a.length >= 4 && b.startsWith(a));
  const contieneTodos = (a, b) => a.length > 0 && a.every(x => b.some(y => tokenCoincide(x, y)));

  function contieneSecuencia(a, b) {
    if (!a.length || a.length > b.length) return false;
    for (let i = 0; i <= b.length - a.length; i += 1) {
      if (a.every((x, j) => tokenCoincide(x, b[i + j]))) return true;
    }
    return false;
  }

  N.norm = norm;
  N.tokens = tokens;

  window.puntuacionRegistroCasaNere = function (registro, consulta, campo = "todo") {
    const titulo = norm(registro?.[1]);
    const autor = norm(registro?.[2]);
    const buscado = norm(consulta);
    const q = tokens(consulta), tt = tokens(titulo), at = tokens(autor);
    const isbn = String(registro?.[3] || "").replace(/\D/g, "");
    const qi = String(consulta || "").replace(/\D/g, "");
    if (!buscado || !q.length) return -1;
    const enTitulo = contieneTodos(q, tt), enAutor = contieneTodos(q, at);
    if (campo === "titulo" && !enTitulo) return -1;
    if (campo === "autor" && !enAutor) return -1;
    if (qi.length >= 10 && qi === isbn) return 1000;
    if (campo !== "autor") {
      if (titulo === buscado) return 900;
      if (contieneSecuencia(q, tt)) return 850;
      if (enTitulo) return 800;
    }
    if (campo !== "titulo") {
      if (autor === buscado) return 650;
      if (contieneSecuencia(q, at)) return 600;
      if (enAutor) return 550;
    }
    return -1;
  };

  const FRASES = {
    ca: ["em dic","lloba negra","rei blanc","tot crema","cicatriu","aquest llibre","aquesta","el pacient","la pacient","conte de fades","en catala","edicio en catala"],
    pt: ["a espera de um milagre","sob a redoma","novembro de 63","os justiceiros","conto de fadas","o livro","em portugues","edicao portuguesa"],
    en: ["red queen","black wolf","everything burns","fairy tale","under the dome","the patient","a novel","english edition","in english"],
    fr: ["la reine rouge","le loup noir","tout brule","conte de fees","edition francaise"],
    de: ["die rote konigin","der schwarze wolf","das buch","marchen","deutsche ausgabe"],
    it: ["la regina rossa","il lupo nero","tutto brucia","libro delle","favola","edizione italiana"],
    es: ["cuento de hadas","loba negra","todo arde","me llamo","el paciente","edicion espanola"]
  };

  const PALABRAS = {
    ca:{lloba:8,blanc:6,cicatriu:9,llibre:8,llibres:8,anys:7,amb:5,sense:6,aquest:7,aquesta:7,meva:6,teva:6,seva:6,catala:8,edicio:4,pacient:5},
    pt:{um:4,uma:5,sob:7,redoma:8,novembro:8,justiceiros:9,livro:8,milagre:7,morto:6,tiros:6,nao:8,voce:6,criancas:7,portugues:8,edicao:4},
    en:{the:4,and:4,with:5,from:4,queen:6,black:5,wolf:6,everything:6,burns:7,fairy:7,tale:6,under:5,dome:7,patient:6,novel:6,book:5,english:8,edition:3},
    fr:{les:4,une:4,avec:5,sans:5,reine:6,rouge:5,loup:6,noir:5,livre:6,histoire:5,fees:7,francaise:8},
    de:{der:4,die:4,das:4,und:4,mit:5,ohne:5,konigin:7,buch:7,geschichte:7,deutsche:8,ausgabe:6},
    it:{gli:4,regina:6,rossa:6,lupo:6,nero:5,libro:6,storia:5,tutto:5,brucia:7,italiana:8,edizione:5},
    es:{cuento:4,hadas:6,reina:3,roja:3,loba:6,arde:5,paciente:4,anos:5,guia:4,milagro:5,noviembre:5,espanola:8}
  };

  function detectarIdioma(titulo) {
    const original = String(titulo || "").toLowerCase();
    const limpio = norm(original);
    if (!limpio) return "";
    const acolchado = ` ${limpio} `;
    for (const [idioma, frases] of Object.entries(FRASES)) {
      if (frases.some(f => acolchado.includes(` ${norm(f)} `))) return idioma;
    }
    const puntos = Object.fromEntries(Object.keys(PALABRAS).map(k => [k, 0]));
    tokens(limpio).forEach(w => Object.entries(PALABRAS).forEach(([k,v]) => { puntos[k] += v[w] || 0; }));
    if (/[¿¡ñ]/i.test(original)) puntos.es += 4;
    if (/[ãõ]/i.test(original) || /\b(çao|coes|nh|lh)[a-z]*/.test(limpio)) puntos.pt += 6;
    if (/·/.test(original) || /\b(ll|ny)[a-z]+/.test(limpio)) puntos.ca += 4;
    if (/\b(tion|ing|ness|ship)[a-z]*/.test(limpio)) puntos.en += 3;
    if (/\b(sch|ung|keit|heit)[a-z]*/.test(limpio)) puntos.de += 4;
    if (/\b(zione|zioni|gli)[a-z]*/.test(limpio)) puntos.it += 4;
    const orden = Object.entries(puntos).sort((a,b) => b[1] - a[1]);
    const minimo = tokens(limpio).length <= 2 ? 7 : 5;
    return orden[0][1] >= minimo && orden[0][1] - orden[1][1] >= 2 ? orden[0][0] : "";
  }

  N.detectarIdioma = detectarIdioma;
  window.detectarIdiomaTituloV110Nere = detectarIdioma;
  window.idiomaCompatibleCasaNere = function (registro, idioma) {
    if (!idioma || idioma === "todos") return true;
    const declarado = String(registro?.[9] || "").toLowerCase().trim();
    const detectado = detectarIdioma(registro?.[1]);
    if (declarado && declarado !== "es") return declarado === idioma;
    if (detectado && detectado !== "es") return detectado === idioma;
    if (declarado === "es") return idioma === "es";
    if (detectado === "es") return idioma === "es";
    return false;
  };

  function fragmentosCandidatos(indice, consulta) {
    const claves = tokensCasaNere(consulta).filter(t => t.length >= 3).map(clavePrefijoCasaV17Nere).filter(Boolean);
    const listas = claves.map(k => indice.prefijos?.[k]).filter(a => Array.isArray(a) && a.length);
    const puntuaciones = new Map();
    const conjuntos = listas.map(lista => new Set(lista.map(x => Number(Array.isArray(x) ? x[0] : x))));
    listas.forEach(lista => lista.forEach(x => {
      const f = Number(Array.isArray(x) ? x[0] : x), c = Number(Array.isArray(x) ? x[1] : 1) || 1;
      puntuaciones.set(f, (puntuaciones.get(f) || 0) + c);
    }));
    let candidatos = conjuntos.length ? Array.from(conjuntos[0]).filter(f => conjuntos.every(c => c.has(f))) : [];
    if (!candidatos.length) candidatos = Array.from(new Set(conjuntos.flatMap(c => Array.from(c))));
    const a = prefijoCasaNere(consulta, false), b = prefijoCasaNere(consulta, true);
    if (a.length >= 3) candidatos.push(fragmentoCasaNere(a));
    if (b.length >= 3) candidatos.push(fragmentoCasaNere(b));
    return Array.from(new Set(candidatos))
      .filter(f => Number.isInteger(f) && f >= 0 && f < CASA_FRAGMENTOS_NERE)
      .sort((x,y) => (puntuaciones.get(y)||0) - (puntuaciones.get(x)||0));
  }

  async function cargarFragmentoLigero(numero) {
    const nombre = String(numero).padStart(2, "0");
    const [datos, datosIdiomas] = await Promise.all([
      leerJsonGzipCasaNere(`${CASA_INDICE_BASE_NERE}${nombre}.json.gz?v=1.6`),
      leerJsonGzipCasaNere(`${CASA_V17_BASE_NERE}idiomas/${nombre}.json.gz?v=1.7`)
    ]);
    return {
      registros: Array.isArray(datos.items) ? datos.items : [],
      idiomas: Array.isArray(datosIdiomas.idiomas) ? datosIdiomas.idiomas : []
    };
  }

  function claveObra(r) {
    const titulo = normalizarCasaNere(r?.[1])
      .replace(/\b(ebook|audiolibro|audio libro|tapa dura|tapa blanda|bolsillo)\b/g," ")
      .replace(/\s+/g," ").trim();
    return `${titulo}|${normalizarCasaNere(r?.[2])}`;
  }

  function incorporar(estado, r, puntos) {
    const clave = claveObra(r);
    if (!clave || clave === "|") return;
    let entrada = estado.obras.get(clave);
    if (!entrada) {
      entrada = {puntos, libro:{titulo:r[1],autor:r[2]||"Autor desconocido",portada:portadaCasaNere(r[3]),resena:"Disponible en el catálogo de Casa del Libro.",tipo:"casa",tiendaCasa:true,gratis:false,comercial:{},preciosCasa:[]}};
      estado.obras.set(clave, entrada);
    } else {
      entrada.puntos = Math.max(entrada.puntos, puntos);
      if (!entrada.libro.portada) entrada.libro.portada = portadaCasaNere(r[3]);
    }
    const formato = CASA_FORMATOS_NERE[r[5]];
    if (formato) {
      const precio = precioCasaNere(r[4]);
      const oferta = {url:urlProductoCasaNere(r[0]),precio,disponible:true,tienda:"Casa del Libro",esBusqueda:false};
      const anterior = entrada.libro.comercial[formato];
      if (!anterior || (!anterior.precio && precio)) entrada.libro.comercial[formato] = oferta;
      else if (anterior.precio && precio) {
        const previo = Number(anterior.precio.replace(/[^0-9,]/g,"").replace(",","."));
        if (r[4]/100 < previo) entrada.libro.comercial[formato] = oferta;
      }
    }
    if (r[4]) entrada.libro.preciosCasa.push(r[4]);
  }

  function resultados(estado = N.estado) {
    if (!estado) return [];
    let libros = Array.from(estado.obras.values()).sort((a,b) => b.puntos-a.puntos).map(e => {
      const l = e.libro;
      if (l.preciosCasa.length) l.precioDesde = "Desde " + precioCasaNere(Math.min(...l.preciosCasa));
      return l;
    });
    if (estado.opciones?.seccion) libros = filtrarMenoresCasaNere(libros, estado.opciones);
    return libros;
  }

  async function procesar(estado, cantidad = N.FRAGMENTOS_POR_LOTE) {
    let hechos = 0;
    while (estado.posicion < estado.fragmentos.length && hechos < cantidad) {
      const lote = await cargarFragmentoLigero(estado.fragmentos[estado.posicion++]);
      for (let i = 0; i < lote.registros.length; i += 1) {
        const original = lote.registros[i];
        const puntos = puntuacionRegistroCasaNere(original, estado.consulta, estado.opciones.campo || "todo");
        if (puntos < 0) continue;
        const r = original.slice();
        while (r.length <= 9) r.push("");
        r[9] = lote.idiomas[i] || r[9] || "";
        if (!idiomaCompatibleCasaNere(r, estado.opciones.idioma || "es")) continue;
        if (!registroCompatibleCatalogoCasaNere(r, estado.opciones)) continue;
        if (estado.vistos.has(r[0])) continue;
        estado.vistos.add(r[0]);
        incorporar(estado, r, puntos);
      }
      hechos += 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    estado.terminado = estado.posicion >= estado.fragmentos.length;
    return resultados(estado);
  }

  N.resultados = resultados;
  N.procesar = procesar;
  N.reset = () => { N.estado = null; };

  N.avanzar = async function () {
    const estado = N.estado;
    if (!estado) return [];
    let libros = resultados(estado);
    if (libros.length > estado.mostrarHasta) {
      estado.mostrarHasta += N.RESULTADOS_POR_PANTALLA;
      return libros;
    }
    const antes = libros.length;
    let intentos = 0;
    do {
      libros = await procesar(estado);
      intentos += 1;
    } while (!estado.terminado && libros.length === antes && intentos < 2);
    return libros;
  };

  window.buscarLibrosCasaNere = async function (consulta, opciones = {}) {
    consultaCasaActualNere = String(consulta || "").trim();
    if (!consultaCasaActualNere || normalizarCasaNere(consultaCasaActualNere).length < 3) return [];
    const indice = await cargarIndicePrefijosCasaV17Nere();
    N.estado = {
      consulta: consultaCasaActualNere,
      opciones:{...opciones, limite:0},
      fragmentos:fragmentosCandidatos(indice, consultaCasaActualNere),
      posicion:0,
      vistos:new Set(),
      obras:new Map(),
      terminado:false,
      mostrarHasta:N.RESULTADOS_POR_PANTALLA
    };
    let libros = [];
    do {
      libros = await procesar(N.estado);
    } while (!libros.length && !N.estado.terminado && N.estado.posicion < 6);
    return libros;
  };

  console.log("✅ Nere v1.10 core listo");
})();
