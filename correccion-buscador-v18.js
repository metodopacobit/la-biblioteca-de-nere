/* La Biblioteca de Nere · corrección integral v1.9 */
(function () {
  "use strict";
  if (window.__nereV19) return;
  window.__nereV19 = true;
  const LOTE = 40;

  const norm = t => String(t || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  const toks = t => norm(t).split(" ").filter(Boolean);
  const coincide = (a, b) => a === b || (a.length >= 4 && b.startsWith(a));
  const contiene = (buscados, candidatos) => buscados.length > 0 &&
    buscados.every(a => candidatos.some(b => coincide(a, b)));
  const secuencia = (a, b) => {
    for (let i = 0; i <= b.length - a.length; i += 1) {
      if (a.every((x, j) => coincide(x, b[i + j]))) return true;
    }
    return false;
  };

  window.puntuacionRegistroCasaNere = function (r, consulta, campo = "todo") {
    const q = norm(consulta), qt = toks(consulta), tt = toks(r?.[1]), at = toks(r?.[2]);
    const titulo = norm(r?.[1]), autor = norm(r?.[2]);
    const isbn = String(r?.[3] || "").replace(/\D/g, "");
    const qi = String(consulta || "").replace(/\D/g, "");
    if (!q || !qt.length) return -1;
    const enTitulo = contiene(qt, tt), enAutor = contiene(qt, at);
    if (campo === "titulo" && !enTitulo) return -1;
    if (campo === "autor" && !enAutor) return -1;
    if (qi.length >= 10 && qi === isbn) return 1000;
    if (campo !== "autor") {
      if (titulo === q) return 900;
      if (secuencia(qt, tt)) return 850;
      if (enTitulo) return 800;
    }
    if (campo !== "titulo") {
      if (autor === q) return 650;
      if (secuencia(qt, at)) return 600;
      if (enAutor) return 550;
    }
    return -1;
  };

  const frases = {
    es: ["cuento de hadas","reina roja","loba negra","todo arde","me llamo","el paciente","la paciente"],
    ca: ["em dic","lloba negra","rei blanc","tot crema","el pacient","la pacient","aquest llibre","conte de fades"],
    pt: ["a espera de um milagre","sob a redoma","novembro de 63","os justiceiros","conto de fadas","o livro"],
    en: ["the red queen","the black wolf","everything burns","fairy tale","under the dome","the patient","a novel"],
    fr: ["la reine rouge","le loup noir","tout brule","conte de fees"],
    de: ["die rote konigin","der schwarze wolf","das buch","marchen"],
    it: ["la regina rossa","il lupo nero","tutto brucia","libro delle","favola"]
  };
  const palabras = {
    es:{cuento:4,hadas:5,reina:3,roja:3,loba:5,arde:4,paciente:3,anos:4,guia:3,milagro:4,noviembre:4},
    ca:{dic:6,lloba:7,rei:4,blanc:4,tot:4,crema:4,cicatriu:7,llibre:7,llibres:7,anys:6,amb:4,sense:5,aquest:6,aquesta:6,dels:4,meva:5,teva:5,seva:5,conte:4,fades:6,pacient:5},
    pt:{um:3,uma:4,sob:6,redoma:7,novembro:7,justiceiros:8,livro:7,milagre:6,morto:5,tiros:5,conto:4,fadas:6,nao:7,voce:5,criancas:6,espera:3,tambem:5},
    en:{the:3,and:3,with:4,from:3,queen:5,black:4,wolf:5,everything:5,burns:6,fairy:6,tale:5,under:4,dome:6,patient:5,novel:5,book:4,stories:5,secrets:5,world:4},
    fr:{le:2,les:3,une:3,avec:4,sans:4,reine:5,rouge:4,loup:5,noir:4,livre:5,histoire:4,fees:6,conte:4,brule:5},
    de:{der:3,die:3,das:3,und:3,mit:4,ohne:4,konigin:6,schwarz:5,schwarze:6,buch:6,geschichte:6,marchen:7},
    it:{il:2,lo:2,gli:3,una:2,regina:5,rossa:5,lupo:5,nero:4,libro:5,storia:4,tutto:4,brucia:6,favola:6,paziente:5}
  };

  function detectarIdioma(titulo) {
    const original = String(titulo || "").toLowerCase(), n = norm(original);
    if (!n) return "";
    const acolchado = ` ${n} `;
    for (const [idioma, lista] of Object.entries(frases)) {
      if (lista.some(f => acolchado.includes(` ${norm(f)} `))) return idioma;
    }
    const p = Object.fromEntries(Object.keys(palabras).map(k => [k, 0]));
    toks(n).forEach(w => Object.entries(palabras).forEach(([k,v]) => { p[k] += v[w] || 0; }));
    if (/[¿¡ñ]/i.test(original)) p.es += 4;
    if (/·/.test(original) || /\b(ll|ny)[a-z]+/.test(n)) p.ca += 3;
    if (/[ãõ]/i.test(original) || /\b(çao|coes|nh|lh)[a-z]*/.test(n)) p.pt += 5;
    if (/\b(tion|ing|ness|ship)[a-z]*/.test(n)) p.en += 3;
    if (/\b(sch|ung|keit|heit)[a-z]*/.test(n)) p.de += 4;
    if (/\b(zione|zioni|gli)[a-z]*/.test(n)) p.it += 4;
    const o = Object.entries(p).sort((a,b) => b[1]-a[1]);
    const min = toks(n).length <= 2 ? 6 : 5;
    return o[0][1] >= min && o[0][1] - o[1][1] >= 2 ? o[0][0] : "";
  }
  window.detectarIdiomaTituloV19Nere = detectarIdioma;
  window.idiomaCompatibleCasaNere = function (r, idioma) {
    if (!idioma || idioma === "todos") return true;
    const detectado = detectarIdioma(r?.[1]);
    if (detectado) return detectado === idioma;
    return String(r?.[9] || "").toLowerCase().trim() === idioma;
  };

  window.fragmentosDesdeIndiceCasaV17Nere = function (indice, consulta) {
    const claves = tokensCasaNere(consulta).filter(t => t.length >= 3)
      .map(clavePrefijoCasaV17Nere).filter(Boolean);
    const listas = claves.map(k => indice.prefijos?.[k]).filter(a => Array.isArray(a) && a.length);
    const puntos = new Map();
    const sets = listas.map(lista => new Set(lista.map(x => Number(Array.isArray(x) ? x[0] : x))));
    listas.forEach(lista => lista.forEach(x => {
      const f = Number(Array.isArray(x) ? x[0] : x), c = Number(Array.isArray(x) ? x[1] : 1) || 1;
      puntos.set(f, (puntos.get(f) || 0) + c);
    }));
    let candidatos = sets.length ? Array.from(sets[0]).filter(f => sets.every(s => s.has(f))) : [];
    if (!candidatos.length) candidatos = Array.from(new Set(sets.flatMap(s => Array.from(s))));
    const a = prefijoCasaNere(consulta, false), b = prefijoCasaNere(consulta, true);
    if (a.length >= 3) candidatos.push(fragmentoCasaNere(a));
    if (b.length >= 3) candidatos.push(fragmentoCasaNere(b));
    return Array.from(new Set(candidatos)).filter(f => Number.isInteger(f) && f >= 0 && f < 64)
      .sort((x,y) => (puntos.get(y)||0) - (puntos.get(x)||0));
  };

  function claveObra(r) {
    return normalizarCasaNere(r?.[1]).replace(/\b(ebook|audiolibro|audio libro|tapa dura|tapa blanda|bolsillo)\b/g," ").replace(/\s+/g," ").trim()
      + "|" + normalizarCasaNere(r?.[2]);
  }
  window.agruparRegistrosCasaNere = function (registros, limite = 0) {
    const grupos = new Map();
    (registros || []).forEach(r => {
      const clave = claveObra(r); if (!clave || clave === "|") return;
      if (!grupos.has(clave)) grupos.set(clave, {titulo:r[1],autor:r[2]||"Autor desconocido",portada:portadaCasaNere(r[3]),resena:"Disponible en el catálogo de Casa del Libro.",tipo:"casa",tiendaCasa:true,gratis:false,comercial:{},preciosCasa:[]});
      const l = grupos.get(clave); if (!l.portada) l.portada = portadaCasaNere(r[3]);
      const formato = CASA_FORMATOS_NERE[r[5]]; if (!formato) return;
      const precio = precioCasaNere(r[4]);
      const oferta = {url:urlProductoCasaNere(r[0]),precio,disponible:true,tienda:"Casa del Libro",esBusqueda:false};
      const anterior = l.comercial[formato];
      if (!anterior || (!anterior.precio && precio)) l.comercial[formato] = oferta;
      else if (anterior.precio && precio) {
        const previo = Number(anterior.precio.replace(/[^0-9,]/g,"").replace(",","."));
        if (r[4]/100 < previo) l.comercial[formato] = oferta;
      }
      if (r[4]) l.preciosCasa.push(r[4]);
    });
    const libros = Array.from(grupos.values()).map(l => {
      if (l.preciosCasa.length) l.precioDesde = "Desde " + precioCasaNere(Math.min(...l.preciosCasa));
      delete l.preciosCasa; return l;
    });
    return Number(limite) > 0 ? libros.slice(0, Number(limite)) : libros;
  };

  window.buscarLibrosCasaNere = async function (consulta, opciones = {}) {
    consultaCasaActualNere = String(consulta || "").trim();
    if (!consultaCasaActualNere || normalizarCasaNere(consultaCasaActualNere).length < 3) return [];
    const indice = await cargarIndicePrefijosCasaV17Nere();
    const fragmentos = fragmentosDesdeIndiceCasaV17Nere(indice, consultaCasaActualNere);
    const lotes = await Promise.all(fragmentos.map(cargarFragmentoCasaNere));
    const vistos = new Set(), puntuados = [];
    lotes.flat().forEach(r => {
      if (vistos.has(r[0])) return; vistos.add(r[0]);
      if (!idiomaCompatibleCasaNere(r, opciones.idioma || "es")) return;
      if (!registroCompatibleCatalogoCasaNere(r, opciones)) return;
      const puntos = puntuacionRegistroCasaNere(r, consultaCasaActualNere, opciones.campo || "todo");
      if (puntos >= 0) puntuados.push({r,puntos});
    });
    puntuados.sort((a,b) => b.puntos-a.puntos || Number(Boolean(b.r[3]))-Number(Boolean(a.r[3])));
    return filtrarMenoresCasaNere(agruparRegistrosCasaNere(puntuados.map(x => x.r), 0), opciones);
  };

  window.pintarResultadosBusqueda = function (libros) {
    const c = document.getElementById("resultados-busqueda"); if (!c) return;
    c.innerHTML = "";
    if (!Array.isArray(libros) || !libros.length) {
      if (window.modoBusquedaNere === "casa" && typeof pintarBusquedaDirectaCasaNere === "function") return pintarBusquedaDirectaCasaNere(c, consultaCasaActualNere);
      c.innerHTML = '<div class="estado-vacio"><span>🔎</span><p>No encontramos resultados.</p></div>'; return;
    }
    let mostrados = 0;
    const boton = document.createElement("button"); boton.type="button"; boton.className="boton-principal";
    boton.style.gridColumn="1 / -1"; boton.style.margin="16px auto"; boton.style.maxWidth="360px";
    function mas() {
      boton.remove(); const fin = Math.min(mostrados + LOTE, libros.length), frag = document.createDocumentFragment();
      for (let i=mostrados; i<fin; i+=1) frag.appendChild(crearTarjetaLibroAPI(libros[i]));
      c.appendChild(frag); mostrados = fin;
      if (mostrados < libros.length) { boton.textContent=`Cargar más (${mostrados} de ${libros.length})`; c.appendChild(boton); }
    }
    boton.addEventListener("click", mas); mas();
  };

  window.actualizarOpcionesCompra = function (libro) {
    window.estadoComercialNere.libro = libro || null;
    const exactas = libro?.comercial || {}, busquedas = crearOfertasBusquedaCasa(libro);
    const elegir = tipo => exactas[tipo]?.url && exactas[tipo].disponible !== false ? exactas[tipo] : (busquedas[tipo] || null);
    window.estadoComercialNere.ofertas = {
      fisico:normalizarOfertaComercial(elegir("fisico")), ebook:normalizarOfertaComercial(elegir("ebook")), audiolibro:normalizarOfertaComercial(elegir("audiolibro"))
    };
    actualizarBotonCompra("fisico","comprar-fisico","estado-fisico");
    actualizarBotonCompra("ebook","comprar-ebook","estado-ebook");
    actualizarBotonCompra("audiolibro","comprar-audiolibro","estado-audiolibro");
    actualizarMensajeComercial();
  };

  function filtroTodo() {
    if (window.estadoApp) window.estadoApp.filtroBusqueda = "todo";
    document.querySelectorAll(".filtros-busqueda .filtro").forEach(b => b.classList.remove("activo"));
    document.querySelector('.filtros-busqueda .filtro[data-filtro="todo"]')?.classList.add("activo");
  }
  filtroTodo();
  for (const nombre of ["abrirBuscar","cambiarModoBusquedaNere"]) {
    const original = window[nombre];
    if (typeof original === "function") window[nombre] = function (...args) { filtroTodo(); return original.apply(this,args); };
  }
  console.log("✅ Biblioteca de Nere v1.9");
})();
