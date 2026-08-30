/* La Biblioteca de Nere · v1.12 · idioma estricto y compra por ISBN */
(function () {
  "use strict";
  if (window.NereV112Fix) return;
  window.NereV112Fix = true;

  const AWIN_MID = "21491";
  const AWIN_AFF = "3007163";
  const CASA_RAIZ = "https://www.casadellibro.com/";

  const norm = texto => String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  const toks = texto => norm(texto).split(" ").filter(Boolean);

  const PERFIL = {
    es: {
      fuertes: ["llamo","cuento","cuentos","hada","hadas","loba","arde","paciente","senor","senora","nino","nina","ninos","ninas","anos","corazon","guerra","verdad","fuego","viaje","viajes","hija","hijo","madre","padre"],
      comunes: ["el","la","los","las","del","un","una","unos","unas","que","como","para","por","con","sin","mas","mi","mis","tu","tus","su","sus","vida","muerte","noche","dia","hombre","mujer","historia","libro","libros","amor","mundo","casa","tiempo","secreto","sombra","todo"]
    },
    pt: {
      fuertes: ["nao","voce","uma","sob","redoma","novembro","janeiro","fevereiro","outubro","justica","justiceiros","livro","livros","milagre","coracao","criancas","portugues","edicao","mulher","menino","menina","cidade","depois","ainda"],
      comunes: ["um","do","da","dos","das","em","no","na","nos","nas","ao","aos","pela","pelo","pelos","pelas","seu","sua","meu","minha","nossa","mais","com","sem"]
    },
    ca: {
      fuertes: ["dic","llibre","llibres","lloba","blanc","cicatriu","catala","edicio","aquest","aquesta","aixo","avui","perque","meva","teva","seva","anys","rei","nen","nena","ciutat","llenguatge","creacio"],
      comunes: ["em","amb","sense","dels","mes","els","les","seu","seva"]
    },
    gl: {
      fuertes: ["unha","unhas","viaxe","frechas","ouro","galego","galega","nenos","nenas","lingua"],
      comunes: ["mais","do","da","dos","das","sen"]
    },
    eu: {
      fuertes: ["euskal","euskara","liburu","liburua","dago","dira","gure","zure","bere","ipuin","anderinoak","anderenoak"],
      comunes: ["eta","ez","bat","hau","hori"]
    },
    en: {
      fuertes: ["english","edition","novel","book","books","story","stories","fairy","tale","queen","wolf","everything","burns","under","dome","world","girl","boy","city"],
      comunes: ["the","and","with","from","into","your","my","our","black","red","life","love","war","secret","secrets"]
    },
    fr: {
      fuertes: ["francaise","edition","livre","livres","histoire","reine","loup","noir","rouge","fees","brule","fille","garcon","ville"],
      comunes: ["le","les","des","une","avec","sans","pour","dans","aux","amour"]
    },
    de: {
      fuertes: ["deutsche","ausgabe","buch","geschichte","konigin","marchen","madchen","junge","stadt"],
      comunes: ["der","die","das","und","mit","ohne","fur","liebe"]
    },
    it: {
      fuertes: ["italiana","edizione","storia","regina","rossa","lupo","favola","brucia","ragazza","ragazzo","citta"],
      comunes: ["il","lo","gli","della","delle","senza","questa","questo","amore"]
    }
  };

  function idiomaPorISBN(isbn) {
    const n = String(isbn || "").replace(/\D/g, "");
    if (!/^97[89]\d{10}$/.test(n)) return "";
    if (/^978(?:972|989|85|65)/.test(n)) return "pt";
    if (/^978(?:0|1)/.test(n) || /^9798/.test(n)) return "en";
    if (/^9782/.test(n)) return "fr";
    if (/^9783/.test(n)) return "de";
    if (/^97888/.test(n)) return "it";
    if (/^(?:97884|97913)/.test(n)) return "es";
    if (/^978(?:950|987|956|958|968|970|607|9972|9974|9942)/.test(n)) return "es";
    return "";
  }

  function clasificarIdioma(registro) {
    const tituloOriginal = String(registro?.[1] || "");
    const palabras = toks(tituloOriginal);
    const set = new Set(palabras);
    const puntos = Object.fromEntries(Object.keys(PERFIL).map(k => [k, 0]));

    for (const [idioma, listas] of Object.entries(PERFIL)) {
      for (const palabra of listas.fuertes) if (set.has(norm(palabra))) puntos[idioma] += 4;
      for (const palabra of listas.comunes) if (set.has(norm(palabra))) puntos[idioma] += 1;
    }

    const originalMin = tituloOriginal.toLowerCase();
    if (/[¿¡ñ]/i.test(originalMin)) puntos.es += 5;
    if (/[ãõ]/i.test(originalMin) || /\b\w*(?:cao|coes|nh|lh)\w*\b/i.test(norm(originalMin))) puntos.pt += 7;
    if (/·/.test(originalMin)) puntos.ca += 7;

    const fuertesExtranjeras = ["pt","ca","gl","eu","en","fr","de","it"]
      .map(idioma => [idioma, PERFIL[idioma].fuertes.reduce((n, p) => n + (set.has(norm(p)) ? 1 : 0), 0)])
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1]);
    if (fuertesExtranjeras.length && (fuertesExtranjeras.length === 1 || fuertesExtranjeras[0][1] > fuertesExtranjeras[1][1])) {
      return fuertesExtranjeras[0][0];
    }

    const declarado = String(registro?.[9] || "").toLowerCase().trim();
    if (Object.prototype.hasOwnProperty.call(puntos, declarado)) puntos[declarado] += 6;

    const porIsbn = idiomaPorISBN(registro?.[3]);
    if (porIsbn) puntos[porIsbn] += 7;

    const orden = Object.entries(puntos).sort((a, b) => b[1] - a[1]);
    const [idioma, mejor] = orden[0];
    const segundo = orden[1]?.[1] || 0;

    if (mejor >= 6 && mejor - segundo >= 2) return idioma;
    if (porIsbn && puntos[porIsbn] >= 7 && puntos[porIsbn] >= segundo) return porIsbn;
    return "";
  }

  window.detectarIdiomaTituloV112Nere = registro => clasificarIdioma(registro);

  window.idiomaCompatibleCasaNere = function (registro, idioma) {
    if (!idioma || idioma === "todos") return true;
    return clasificarIdioma(registro) === idioma;
  };

  function isbnDesdeLibro(libro) {
    const directos = [libro?.isbn, libro?.ean, libro?.gtin].map(x => String(x || "").replace(/\D/g, ""));
    const directo = directos.find(x => /^97[89]\d{10}$/.test(x));
    if (directo) return directo;
    const texto = String(libro?.portada || libro?.cover || "");
    const m = texto.match(/(97[89]\d{10})/);
    return m ? m[1] : "";
  }

  function consultaLibro(libro) {
    const isbn = isbnDesdeLibro(libro);
    if (isbn) return isbn;
    const titulo = String(libro?.titulo || libro?.title || "").replace(/\s+/g, " ").trim();
    const autor = String(libro?.autor || libro?.author || "")
      .replace(/autor desconocido/ig, "")
      .replace(/\s+/g, " ").trim();
    return [titulo, autor].filter(Boolean).join(" ");
  }

  function destinoCasa(consulta) {
    return CASA_RAIZ + "?query=" + encodeURIComponent(String(consulta || "libros"));
  }

  function enlaceAwin(destino, tipo = "libro") {
    return "https://www.awin1.com/cread.php" +
      "?awinmid=" + AWIN_MID +
      "&awinaffid=" + AWIN_AFF +
      "&clickref=" + encodeURIComponent("nere-" + tipo) +
      "&ued=" + encodeURIComponent(destino);
  }

  function ofertaSegura(libro, tipo, exacta) {
    return {
      url: enlaceAwin(destinoCasa(consultaLibro(libro)), tipo),
      precio: exacta?.precio || "",
      disponible: true,
      tienda: "Casa del Libro",
      esBusqueda: !exacta?.precio
    };
  }

  window.crearOfertaBusquedaCasa = function (libro, tipo) {
    return ofertaSegura(libro, tipo, null);
  };

  window.crearOfertasBusquedaCasa = function (libro) {
    if (!libro) return {};
    return {
      fisico: ofertaSegura(libro, "fisico", null),
      ebook: ofertaSegura(libro, "ebook", null),
      audiolibro: ofertaSegura(libro, "audiolibro", null)
    };
  };

  window.urlBusquedaDirectaCasaNere = function (consulta) {
    return enlaceAwin(destinoCasa(consulta || "libros"), "busqueda");
  };

  const actualizarAnterior = window.actualizarOpcionesCompra;
  window.actualizarOpcionesCompra = function (libro) {
    if (!libro || !(libro.tipo === "casa" || libro.tiendaCasa)) {
      return typeof actualizarAnterior === "function" ? actualizarAnterior(libro) : undefined;
    }

    const exactas = libro.comercial || {};
    window.estadoComercialNere.libro = libro;
    window.estadoComercialNere.ofertas = {
      fisico: normalizarOfertaComercial(ofertaSegura(libro, "fisico", exactas.fisico)),
      ebook: normalizarOfertaComercial(ofertaSegura(libro, "ebook", exactas.ebook)),
      audiolibro: normalizarOfertaComercial(ofertaSegura(libro, "audiolibro", exactas.audiolibro))
    };

    actualizarBotonCompra("fisico", "comprar-fisico", "estado-fisico");
    actualizarBotonCompra("ebook", "comprar-ebook", "estado-ebook");
    actualizarBotonCompra("audiolibro", "comprar-audiolibro", "estado-audiolibro");
    actualizarMensajeComercial();
  };

  console.log("✅ Nere v1.12 · idioma estricto y enlaces por ISBN activos");
})();
