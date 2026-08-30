/* =====================================================
   LA BIBLIOTECA DE NERE
   CORRECCIÓN BUSCADOR · v1.8

   Este archivo debe cargarse el último, después de:
   casa.js, casa-v17.js, api.js, catalogo.js,
   lector.js, app.js y comercial.js.

   Corrige:
   - Coincidencias falsas: Goa ya no coincide con Bengoa, Ngoa o Goaz.
   - Prioridad del título frente al autor en la búsqueda general.
   - Restablecimiento automático del filtro a "Todo" al abrir Buscar
     o al cambiar entre "Leer gratis" y "Casa del Libro".
===================================================== */

(function () {
    "use strict";

    const MARCA_V18_NERE = "biblioteca-nere-buscador-v18";

    if (window[MARCA_V18_NERE]) {
        return;
    }

    window[MARCA_V18_NERE] = true;


    /* =================================================
       NORMALIZACIÓN Y COINCIDENCIA ESTRICTA
    ================================================= */

    function normalizarV18Nere(texto) {
        if (typeof window.normalizarCasaNere === "function") {
            return window.normalizarCasaNere(texto);
        }

        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }


    function tokensConsultaV18Nere(texto) {
        if (typeof window.tokensCasaNere === "function") {
            return window.tokensCasaNere(texto);
        }

        return normalizarV18Nere(texto)
            .split(" ")
            .filter(Boolean);
    }


    function tokensCandidatoV18Nere(texto) {
        return normalizarV18Nere(texto)
            .split(" ")
            .filter(Boolean);
    }


    function tokenCoincideV18Nere(tokenBuscado, tokenCandidato) {
        if (!tokenBuscado || !tokenCandidato) {
            return false;
        }

        if (tokenBuscado === tokenCandidato) {
            return true;
        }

        return (
            tokenBuscado.length >= 4
            &&
            tokenCandidato.startsWith(tokenBuscado)
        );
    }


    function contieneTodosLosTokensV18Nere(
        tokensBuscados,
        tokensCandidato
    ) {
        if (!tokensBuscados.length || !tokensCandidato.length) {
            return false;
        }

        return tokensBuscados.every(tokenBuscado =>
            tokensCandidato.some(tokenCandidato =>
                tokenCoincideV18Nere(tokenBuscado, tokenCandidato)
            )
        );
    }


    function contieneSecuenciaV18Nere(
        tokensBuscados,
        tokensCandidato
    ) {
        if (
            !tokensBuscados.length
            ||
            tokensBuscados.length > tokensCandidato.length
        ) {
            return false;
        }

        for (
            let inicio = 0;
            inicio <= tokensCandidato.length - tokensBuscados.length;
            inicio += 1
        ) {
            const coincide = tokensBuscados.every(
                (tokenBuscado, desplazamiento) =>
                    tokenCoincideV18Nere(
                        tokenBuscado,
                        tokensCandidato[inicio + desplazamiento]
                    )
            );

            if (coincide) {
                return true;
            }
        }

        return false;
    }


    window.puntuacionRegistroCasaNere = function (
        registro,
        consulta,
        campo = "todo"
    ) {
        const titulo = normalizarV18Nere(registro?.[1]);
        const autor = normalizarV18Nere(registro?.[2]);
        const isbn = String(registro?.[3] || "").replace(/\D/g, "");
        const consultaNormalizada = normalizarV18Nere(consulta);
        const isbnBuscado = String(consulta || "").replace(/\D/g, "");

        const tokensBuscados = tokensConsultaV18Nere(consulta);
        const tokensTitulo = tokensCandidatoV18Nere(titulo);
        const tokensAutor = tokensCandidatoV18Nere(autor);

        if (!consultaNormalizada || !tokensBuscados.length) {
            return -1;
        }

        const todosTitulo = contieneTodosLosTokensV18Nere(
            tokensBuscados,
            tokensTitulo
        );

        const todosAutor = contieneTodosLosTokensV18Nere(
            tokensBuscados,
            tokensAutor
        );

        const secuenciaTitulo = contieneSecuenciaV18Nere(
            tokensBuscados,
            tokensTitulo
        );

        const secuenciaAutor = contieneSecuenciaV18Nere(
            tokensBuscados,
            tokensAutor
        );

        if (
            campo === "titulo"
            &&
            !todosTitulo
        ) {
            return -1;
        }

        if (
            campo === "autor"
            &&
            !todosAutor
        ) {
            return -1;
        }

        if (
            isbnBuscado.length >= 10
            &&
            isbn === isbnBuscado
        ) {
            return 1000;
        }

        if (campo !== "autor") {
            if (titulo === consultaNormalizada) {
                return 900;
            }

            if (secuenciaTitulo) {
                return 850;
            }

            if (todosTitulo) {
                return 800;
            }
        }

        if (campo !== "titulo") {
            if (autor === consultaNormalizada) {
                return 650;
            }

            if (secuenciaAutor) {
                return 600;
            }

            if (todosAutor) {
                return 550;
            }
        }

        return -1;
    };


    function activarFiltroTodoV18Nere() {
        if (window.estadoApp) {
            window.estadoApp.filtroBusqueda = "todo";
        }

        const botones = document.querySelectorAll(
            ".filtros-busqueda .filtro"
        );

        botones.forEach(boton =>
            boton.classList.remove("activo")
        );

        const botonTodo = document.querySelector(
            '.filtros-busqueda .filtro[data-filtro="todo"]'
        );

        botonTodo?.classList.add("activo");
    }


    window.activarFiltroTodoV18Nere = activarFiltroTodoV18Nere;


    function envolverFuncionV18Nere(nombre, antes) {
        const original = window[nombre];

        if (
            typeof original !== "function"
            ||
            original.__nereV18
        ) {
            return;
        }

        const reemplazo = function (...argumentos) {
            antes(...argumentos);
            return original.apply(this, argumentos);
        };

        reemplazo.__nereV18 = true;
        reemplazo.__originalNere = original;

        window[nombre] = reemplazo;
    }


    activarFiltroTodoV18Nere();

    envolverFuncionV18Nere(
        "abrirBuscar",
        activarFiltroTodoV18Nere
    );

    envolverFuncionV18Nere(
        "cambiarModoBusquedaNere",
        activarFiltroTodoV18Nere
    );


    setTimeout(() => {
        const pantalla = document.getElementById("pantalla-buscar");
        const input = document.getElementById(
            "input-busqueda-resultados"
        );

        if (
            pantalla?.classList.contains("activa")
            &&
            input?.value.trim()
            &&
            typeof window.buscarLibros === "function"
        ) {
            window.buscarLibros();
        }
    }, 0);


    console.log(
        "✅ Biblioteca de Nere v1.8 · relevancia estricta y filtro Todo corregido"
    );
})();
