async function buscarLibros() {
  const texto = document.getElementById("buscador").value.trim();
  const resultados = document.getElementById("resultados");

  if (!texto) {
    resultados.innerHTML = "<p>Escribe un título o autor.</p>";
    return;
  }

  resultados.innerHTML = "<p>Buscando libros...</p>";

  try {
    const respuesta = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(texto)}&limit=12`
    );

    const datos = await respuesta.json();

    if (!datos.docs || datos.docs.length === 0) {
      resultados.innerHTML = "<p>No se encontraron libros.</p>";
      return;
    }

    resultados.innerHTML = "";

    datos.docs.forEach(libro => {
      const titulo = libro.title || "Sin título";
      const autor = libro.author_name?.[0] || "Autor desconocido";
      const año = libro.first_publish_year || "Año desconocido";

      let portada = "";

      if (libro.cover_i) {
        portada = `https://covers.openlibrary.org/b/id/${libro.cover_i}-M.jpg`;
      }

      const tarjeta = document.createElement("div");
      tarjeta.className = "libro";

      tarjeta.innerHTML = `
        ${
          portada
            ? `<img src="${portada}" alt="Portada de ${titulo}">`
            : `<div class="sin-portada">📚</div>`
        }

        <h3>${titulo}</h3>
        <p>${autor}</p>
        <small>${año}</small>
      `;

      resultados.appendChild(tarjeta);
    });

  } catch (error) {
    console.error(error);
    resultados.innerHTML = "<p>Error al buscar libros.</p>";
  }
}

document.getElementById("botonBuscar").addEventListener("click", buscarLibros);

document.getElementById("buscador").addEventListener("keydown", function(evento) {
  if (evento.key === "Enter") {
    buscarLibros();
  }
});
