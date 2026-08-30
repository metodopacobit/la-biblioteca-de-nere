/* La Biblioteca de Nere · cargador v1.10 */
(function () {
  "use strict";
  if (window.__nereV110Loader) return;
  window.__nereV110Loader = true;
  const cargar = src => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  (async () => {
    try {
      await cargar("nere-v110-core.js?v=1.10");
      await cargar("nere-v110-ui.js?v=1.10");
    } catch (error) {
      console.error("No se pudo cargar Nere v1.10", error);
    }
  })();
})();
