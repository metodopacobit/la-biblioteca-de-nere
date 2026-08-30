/* La Biblioteca de Nere · v1.10 · interfaz progresiva */
(function () {
  "use strict";
  const N = window.NereV110;
  if (!N?.coreReady || N.uiReady) return;
  N.uiReady = true;

  function actualizarEstado(id, cantidad, estado) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = estado?.terminado
      ? `${cantidad} resultados encontrados`
      : `${cantidad} resultados encontrados hasta ahora`;
  }

  function etiqueta(estado, libros) {
    const hasta = Math.min(estado?.mostrarHasta || N.RESULTADOS_POR_PANTALLA, libros.length);
    if (libros.length > hasta) return `Mostrar más (${hasta} de ${libros.length} encontrados)`;
    return estado && !estado.terminado ? "Buscar más resultados en el catálogo" : "";
  }

  window.pintarResultadosBusqueda = function (libros) {
    const c = document.getElementById("resultados-busqueda");
    if (!c) return;
    c.innerHTML = "";
    if (!Array.isArray(libros) || !libros.length) {
      if (window.modoBusquedaNere === "casa" && typeof pintarBusquedaDirectaCasaNere === "function") {
        pintarBusquedaDirectaCasaNere(c, consultaCasaActualNere);
        return;
      }
      c.innerHTML = '<div class="estado-vacio"><span>🔎</span><p>No encontramos resultados.</p></div>';
      return;
    }

    const estado = window.modoBusquedaNere === "casa" ? N.estado : null;
    const hasta = estado ? Math.min(estado.mostrarHasta, libros.length) : Math.min(N.RESULTADOS_POR_PANTALLA, libros.length);
    libros.slice(0, hasta).forEach(l => c.appendChild(crearTarjetaLibroAPI(l)));

    if (estado && (libros.length > hasta || !estado.terminado)) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "boton-principal";
      b.style.gridColumn = "1 / -1";
      b.style.margin = "16px auto";
      b.style.maxWidth = "360px";
      b.textContent = etiqueta(estado, libros);
      b.addEventListener("click", async () => {
        b.disabled = true;
        b.textContent = "Cargando...";
        const nuevos = await N.avanzar();
        window.pintarResultadosBusqueda(nuevos);
        actualizarEstado("estado-busqueda", nuevos.length, N.estado);
      });
      c.appendChild(b);
    }
    if (estado) setTimeout(() => actualizarEstado("estado-busqueda", libros.length, estado), 0);
  };

  async function refrescarCatalogo() {
    const estado = N.estado;
    if (!estado) return;
    let libros = N.resultados();
    if (typeof prepararLibrosCatalogo === "function") libros = prepararLibrosCatalogo(libros);
    if (typeof aplicarDatosCatalogo === "function") aplicarDatosCatalogo(libros);
    const hasta = Math.min(estado.mostrarHasta, libros.length);
    if (typeof pintarLibrosCatalogo === "function") pintarLibrosCatalogo(libros.slice(0, hasta));
    if (typeof ponerEstadoCatalogo === "function") {
      ponerEstadoCatalogo(estado.terminado ? `${libros.length} resultados encontrados` : `${libros.length} resultados encontrados hasta ahora`);
    }
    const c = document.getElementById("catalogo-libros");
    if (!c || (libros.length <= hasta && estado.terminado)) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "boton-principal";
    b.style.gridColumn = "1 / -1";
    b.style.margin = "16px auto";
    b.style.maxWidth = "360px";
    b.textContent = etiqueta(estado, libros);
    b.addEventListener("click", async () => {
      b.disabled = true;
      b.textContent = "Cargando...";
      await N.avanzar();
      await refrescarCatalogo();
    });
    c.appendChild(b);
  }

  const buscarCatalogoOriginal = window.buscarEnCatalogo;
  if (typeof buscarCatalogoOriginal === "function") {
    window.buscarEnCatalogo = async function (...args) {
      const r = await buscarCatalogoOriginal.apply(this, args);
      if (!window.estadoCatalogo?.soloGratis && N.estado) await refrescarCatalogo();
      return r;
    };
  }

  const compraOriginal = window.actualizarOpcionesCompra;
  window.actualizarOpcionesCompra = function (libro) {
    if (!libro || !(libro.tipo === "casa" || libro.tiendaCasa)) {
      return typeof compraOriginal === "function" ? compraOriginal(libro) : undefined;
    }
    window.estadoComercialNere.libro = libro;
    const exactas = libro.comercial || {};
    const busquedas = crearOfertasBusquedaCasa(libro);
    const elegir = tipo => exactas[tipo]?.url && exactas[tipo].disponible !== false ? exactas[tipo] : (busquedas[tipo] || null);
    window.estadoComercialNere.ofertas = {
      fisico:normalizarOfertaComercial(elegir("fisico")),
      ebook:normalizarOfertaComercial(elegir("ebook")),
      audiolibro:normalizarOfertaComercial(elegir("audiolibro"))
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
    if (typeof original === "function") {
      window[nombre] = function (...args) {
        filtroTodo();
        N.reset();
        return original.apply(this,args);
      };
    }
  }
  console.log("✅ Nere v1.10 UI lista");
})();
