/* La Biblioteca de Nere · v1.11 · idioma y enlaces corregidos */
(function () {
  "use strict";
  if (window.NereV111Fix) return;
  window.NereV111Fix = true;

  const norm = texto => String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  const palabras = texto => norm(texto).split(" ").filter(Boolean);

  const MARCADORES = {
    pt: {
      fuertes: ["nao","uma","sob","redoma","novembro","janeiro","fevereiro","outubro","justica","justica","livro","livros","milagre","justiceiros","portugues","edicao","coracao","criancas","voce","tambem","morto","tiros"],
      comunes: ["do","da","dos","das","em","no","na","nos","nas","ao","aos","pela","pelo","pelos","pelas","seu","sua","meu","minha","nossa","mais"]
    },
    ca: {
      fuertes: ["llibre","llibres","lloba","blanc","cicatriu","catala","edicio","aquest","aquesta","aixo","avui","perque","meva","teva","seva","anys","rei","crema"],
      comunes: ["amb","sense","dels","dalt","baix","mes","els"]
    },
    en: {
      fuertes: ["english","edition","novel","book","books","stories","story","fairy","tale","queen","wolf","everything","burns","under","dome"],
      comunes: ["the","and","with","from","into","your","my","our","black","red"]
    },
    fr: {
      fuertes: ["francaise","edition","livre","livres","histoire","reine","loup","noir","rouge","fees","brule"],
      comunes: ["les","des","une","avec","sans","pour","dans","aux"]
    },
    de: {
      fuertes: ["deutsche","ausgabe","buch","geschichte","konigin","marchen"],
      comunes: ["der","die","das","und","mit","ohne","fur"]
    },
    it: {
      fuertes: ["italiana","edizione","libro","storia","regina","rossa","lupo","favola","brucia"],
      comunes: ["gli","della","delle","senza","questa","questo"]
    }
  };

  function detectarExtranjero(titulo) {
    const original = String(titulo || "").toLowerCase();
    const tokens = palabras(original);
    const set = new Set(tokens);

    if (/[ãõ]/i.test(original) || /\b\w*(?:cao|coes|nh|lh)\w*\b/i.test(norm(original))) return "pt";
    if (/·/.test(original) || /\b\w*(?:ll|ny)\w*\b/i.test(norm(original))) {
      const catScore = MARCADORES.ca.fuertes.filter(x => set.has(x)).length;
      if (catScore) return "ca";
    }

    let mejor = "";
    let mejorPuntuacion = 0;
    for (const [idioma, listas] of Object.entries(MARCADORES)) {
      let puntos = 0;
      listas.fuertes.forEach(p => { if (set.has(p)) puntos += 3; });
      listas.comunes.forEach(p => { if (set.has(p)) puntos += 1; });
      if (idioma === "pt" && (set.has("do") || set.has("da") || set.has("dos") || set.has("das")) && (set.has("uma") || set.has("em") || set.has("na") || set.has("no"))) puntos += 3;
      if (idioma === "en" && set.has("the") && tokens.length >= 3) puntos += 2;
      if (idioma === "ca" && (set.has("amb") || set.has("sense")) && tokens.length >= 3) puntos += 2;
      if (puntos > mejorPuntuacion) {
        mejorPuntuacion = puntos;
        mejor = idioma;
      }
    }
    return mejorPuntuacion >= 3 ? mejor : "";
  }

  window.idiomaCompatibleCasaNere = function (registro, idioma) {
    if (!idioma || idioma === "todos") return true;

    const declarado = String(registro?.[9] || "").toLowerCase().trim();
    const extranjero = detectarExtranjero(registro?.[1]);

    if (idioma === "es") {
      if (extranjero && extranjero !== "es") return false;
      if (declarado && declarado !== "es") return false;
      return declarado === "es" || !extranjero;
    }

    if (extranjero) return extranjero === idioma;
    return declarado === idioma;
  };

  function consultaFormato(libro, tipo) {
    const titulo = String(libro?.titulo || libro?.title || "").replace(/\s+/g, " ").trim();
    const autor = String(libro?.autor || libro?.author || "")
      .replace(/autor desconocido/ig, "")
      .replace(/\s+/g, " ")
      .trim();
    const formato = tipo === "fisico" ? "libro" : tipo === "ebook" ? "ebook" : "audiolibro";
    return [titulo, autor, formato].filter(Boolean).join(" ");
  }

  function urlProfundaCasa(consulta) {
    const destino = "https://www.casadellibro.com/busqueda-generica?busqueda=" + encodeURIComponent(consulta);
    return "https://www.awin1.com/cread.php" +
      "?awinmid=21491" +
      "&awinaffid=3007163" +
      "&ued=" + encodeURIComponent(destino);
  }

  function ofertaBusqueda(libro, tipo) {
    return {
      url: urlProfundaCasa(consultaFormato(libro, tipo)),
      precio: "",
      disponible: true,
      tienda: "Casa del Libro",
      esBusqueda: true
    };
  }

  const actualizarAnterior = window.actualizarOpcionesCompra;
  window.actualizarOpcionesCompra = function (libro) {
    if (!libro || !(libro.tipo === "casa" || libro.tiendaCasa)) {
      return typeof actualizarAnterior === "function" ? actualizarAnterior(libro) : undefined;
    }

    window.estadoComercialNere.libro = libro;
    window.estadoComercialNere.ofertas = {
      fisico: normalizarOfertaComercial(ofertaBusqueda(libro, "fisico")),
      ebook: normalizarOfertaComercial(ofertaBusqueda(libro, "ebook")),
      audiolibro: normalizarOfertaComercial(ofertaBusqueda(libro, "audiolibro"))
    };

    actualizarBotonCompra("fisico", "comprar-fisico", "estado-fisico");
    actualizarBotonCompra("ebook", "comprar-ebook", "estado-ebook");
    actualizarBotonCompra("audiolibro", "comprar-audiolibro", "estado-audiolibro");
    actualizarMensajeComercial();
  };

  console.log("✅ Nere v1.11 · idioma estricto y enlaces profundos corregidos");
})();
