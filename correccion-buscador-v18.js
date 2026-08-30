/* La Biblioteca de Nere · cargador v1.12.1 */
(function () {
  "use strict";
  if (window.__nereV1121Loader) return;
  window.__nereV1121Loader = true;

  const cargar = src => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

  (async () => {
    try {
      await cargar("nere-v110-core.js?v=1.12.1");
      await cargar("nere-v110-ui.js?v=1.12.1");
      await cargar("nere-v112-fix.js?v=1.12.1");
    } catch (error) {
      console.error("No se pudo cargar Nere v1.12.1", error);
    }
  })();
})();
