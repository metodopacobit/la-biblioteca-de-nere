#!/usr/bin/env python3
"""Genera el índice comercial v1.7 desde los 64 fragmentos existentes."""
from __future__ import annotations

import gzip
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path("casa-data-final-v16-c83d")
OUT = Path("casa-data-v17")
IDIOMAS_OUT = OUT / "idiomas"
FRAGMENTOS = 64
STOPWORDS = {
    "a", "al", "an", "and", "con", "d", "de", "del", "des", "du", "e",
    "el", "en", "et", "for", "la", "las", "le", "les", "los", "of",
    "para", "por", "the", "un", "una", "unas", "uno", "unos", "y"
}
CODIGOS = {"es", "ca", "en", "fr", "de", "it", "pt", "gl", "eu"}
MAPA_DECLARADOS = {
    "spa": "es", "es": "es", "castellano": "es", "spanish": "es",
    "eng": "en", "en": "en", "english": "en",
    "fre": "fr", "fra": "fr", "fr": "fr", "french": "fr",
    "ger": "de", "deu": "de", "de": "de", "german": "de",
    "ita": "it", "it": "it", "italian": "it",
    "por": "pt", "pt": "pt", "portuguese": "pt",
    "cat": "ca", "ca": "ca", "catalan": "ca", "català": "ca",
    "glg": "gl", "gl": "gl", "galician": "gl", "galego": "gl",
    "baq": "eu", "eus": "eu", "eu": "eu", "basque": "eu", "euskera": "eu"
}

# Señales claras del idioma. Las frases del título tienen prioridad sobre un
# idioma declarado por el feed, porque el feed contiene etiquetas incorrectas.
FRASES = {
    "es": (
        "me llamo", "no puedo", "ni lo suenes", "qué fuerte", "que fuerte",
        "vaya lío", "vaya lio", "el diario", "años y", "para niños"
    ),
    "ca": (
        "em dic", "no puc", "el diari", "la creació", "la creacio",
        "el llenguatge", "més que", "mes que", "aquest llibre"
    ),
    "en": (
        "the ", " of ", " and ", "how to", "not even", "self defense",
        "grave secrets", "blue mountains", "sick leave", "my ", "your "
    ),
    "fr": (
        "le ", "la ", "les ", " de la ", " de les ", "pour ", "moi goa",
        "collégienne", "collegienne", "grande soeur", "même pas", "meme pas"
    ),
    "de": ("der ", "die ", "das ", " und ", "der meteor", "für ", "fur "),
    "it": ("di questa", " della ", " delle ", " il ", " lo ", "gli "),
    "pt": (
        "não ", "nao ", "uma ", " do ", " da ", "o livro", "livro místico",
        "livro mistico", "seminário", "seminario", "colégio", "colegio"
    ),
    "gl": ("unha ", "unha viaxe", "as frechas", "de ouro", "en galego"),
    "eu": ("euskal", " eta ", " ez ", "andereñoak", "liburua")
}
PALABRAS = {
    "es": {"llamo": 5, "eres": 3, "soy": 3, "años": 3, "anos": 2, "niños": 4,
           "ninas": 4, "señor": 3, "senor": 3, "guía": 3, "guia": 3,
           "diario": 3, "primero": 2, "puedo": 3, "fuerte": 2},
    "ca": {"dic": 6, "amb": 4, "aquest": 5, "aquesta": 5, "dels": 4,
           "llibre": 5, "llibres": 5, "anys": 5, "puc": 5, "diari": 5,
           "llenguatge": 6, "organitzacio": 5, "enrabiats": 6},
    "en": {"the": 3, "and": 3, "with": 4, "without": 4, "love": 3,
           "life": 3, "book": 4, "guide": 3, "world": 3, "secret": 4,
           "secrets": 5, "garden": 3, "grave": 4, "mountains": 4,
           "months": 4, "sick": 4, "leave": 4, "stories": 4},
    "fr": {"les": 3, "une": 4, "pour": 4, "avec": 4, "sans": 4, "dans": 3,
           "monde": 3, "livre": 5, "histoire": 4, "petit": 4, "moi": 5,
           "college": 3, "collegienne": 6, "soeur": 5, "galeres": 5},
    "de": {"der": 4, "die": 4, "das": 4, "und": 4, "mit": 4, "ohne": 4,
           "leben": 4, "liebe": 4, "buch": 5, "geschichte": 5, "welt": 4},
    "it": {"della": 4, "delle": 4, "degli": 4, "senza": 4, "questa": 5,
           "questo": 5, "vita": 3, "amore": 4, "storia": 4, "mondo": 4},
    "pt": {"uma": 4, "nao": 6, "livro": 6, "historia": 3, "mundo": 3,
           "voce": 4, "seminario": 5, "colegio": 5, "companhia": 5,
           "mistico": 5, "sao": 4},
    "gl": {"unha": 6, "viaxe": 6, "frechas": 6, "ouro": 5, "galego": 6,
           "galega": 6, "nenos": 5, "nenas": 5, "mais": 3},
    "eu": {"eta": 4, "bat": 5, "dago": 6, "dira": 5, "euskal": 7,
           "euskara": 7, "liburua": 7, "liburu": 6, "andereñoak": 7}
}


def normalizar(texto: object) -> str:
    valor = unicodedata.normalize("NFD", str(texto or ""))
    valor = "".join(c for c in valor if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", valor.lower()).strip()


def tokens(texto: object) -> list[str]:
    return [token for token in normalizar(texto).split() if token]


def declarado(valor: object) -> str:
    limpio = str(valor or "").strip().lower()
    return MAPA_DECLARADOS.get(limpio, limpio if limpio in CODIGOS else "")


def detectar_titulo(titulo: object) -> str:
    original = str(titulo or "").lower()
    normal = normalizar(original)
    acolchado_original = f" {original} "
    acolchado_normal = f" {normal} "
    lista = normal.split()
    if not lista:
        return ""

    for codigo, patrones in FRASES.items():
        for patron in patrones:
            patron_normal = normalizar(patron)
            if patron in original or f" {patron_normal} " in acolchado_normal:
                return codigo

    puntos: Counter[str] = Counter()
    for token in lista:
        for codigo, vocabulario in PALABRAS.items():
            puntos[codigo] += vocabulario.get(token, 0)

    if re.search(r"[¿¡ñ]", original):
        puntos["es"] += 4
    if re.search(r"[ç·]", original):
        puntos["ca"] += 5
    if re.search(r"\b(çao|coes|nh|lh)\w*", normal):
        puntos["pt"] += 4
    if re.search(r"\b(zione|zioni|gli|gn)\w*", normal):
        puntos["it"] += 4
    if re.search(r"\b(sch|ung|keit|heit)\w*", normal):
        puntos["de"] += 4

    if not puntos:
        return ""
    orden = puntos.most_common(2)
    mejor, valor = orden[0]
    segundo = orden[1][1] if len(orden) > 1 else 0
    minimo = 5 if len(lista) <= 3 else 4
    return mejor if valor >= minimo and valor - segundo >= 2 else ""


def idioma_registro(registro: list) -> str:
    detectado = detectar_titulo(registro[1] if len(registro) > 1 else "")
    return detectado or declarado(registro[9] if len(registro) > 9 else "")


def leer_gzip(ruta: Path):
    with gzip.open(ruta, "rt", encoding="utf-8") as archivo:
        return json.load(archivo)


def escribir_gzip(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    contenido = json.dumps(datos, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with ruta.open("wb") as salida:
        with gzip.GzipFile(filename="", mode="wb", fileobj=salida, mtime=0, compresslevel=9) as gz:
            gz.write(contenido)


def generar() -> None:
    if not BASE.exists():
        raise SystemExit(f"No existe {BASE}")

    OUT.mkdir(parents=True, exist_ok=True)
    IDIOMAS_OUT.mkdir(parents=True, exist_ok=True)
    prefijos: dict[str, Counter[int]] = defaultdict(Counter)
    idiomas_catalogo: dict[str, str] = {}
    conteo: Counter[str] = Counter()
    muestras_goa: list[tuple[str, str, str, int]] = []
    total = 0

    for numero in range(FRAGMENTOS):
        datos = leer_gzip(BASE / f"{numero:02d}.json.gz")
        registros = datos.get("items", []) if isinstance(datos, dict) else []
        idiomas: list[str] = []
        for registro in registros:
            total += 1
            codigo = idioma_registro(registro)
            idiomas.append(codigo)
            conteo[codigo or "desconocido"] += 1
            texto = f"{registro[1] if len(registro) > 1 else ''} {registro[2] if len(registro) > 2 else ''}"
            claves = {
                token[:4] if len(token) >= 4 else token
                for token in tokens(texto)
                if len(token) >= 3 and token not in STOPWORDS and not token.isdigit()
            }
            for clave in claves:
                prefijos[clave][numero] += 1
            if "goa" in tokens(registro[1] if len(registro) > 1 else "") and len(muestras_goa) < 80:
                muestras_goa.append((str(registro[1]), str(registro[2]), codigo, numero))
        escribir_gzip(IDIOMAS_OUT / f"{numero:02d}.json.gz", {"v": 2, "idiomas": idiomas})
        print(f"Fragmento {numero:02d}: {len(registros):,}")

    indice = {
        clave: [[fragmento, cantidad] for fragmento, cantidad in contador.most_common()]
        for clave, contador in sorted(prefijos.items())
    }
    escribir_gzip(OUT / "prefijos.json.gz", {"v": 2, "prefijos": indice})

    with (BASE / "catalogo.json").open("r", encoding="utf-8") as archivo:
        catalogo = json.load(archivo)
    for registros in (catalogo.get("grupos") or {}).values():
        for registro in registros:
            codigo = idioma_registro(registro)
            if codigo:
                idiomas_catalogo[str(registro[0])] = codigo
    escribir_gzip(OUT / "idiomas-catalogo.json.gz", {"v": 2, "idiomas": idiomas_catalogo})

    pruebas = {
        "Me llamo Goa 12": detectar_titulo("Me llamo Goa 12"),
        "Em dic Goa 13": detectar_titulo("Em dic Goa 13"),
        "Moi Goa collégienne et amoureuse": detectar_titulo("Moi Goa collégienne et amoureuse"),
        "Grave Secrets In Goa": detectar_titulo("Grave Secrets In Goa"),
        "Gôa e o Livro Místico": detectar_titulo("Gôa e o Livro Místico")
    }
    esperadas = ["es", "ca", "fr", "en", "pt"]
    if list(pruebas.values()) != esperadas:
        raise SystemExit(f"ERROR EN PRUEBAS DE IDIOMA: {pruebas}")
    if "goa" not in indice or not muestras_goa:
        raise SystemExit("ERROR: el índice no localiza Goa")

    meta = {
        "v": 2,
        "registros": total,
        "prefijos": len(indice),
        "idiomas": dict(conteo),
        "pruebasIdioma": pruebas,
        "muestrasGoa": muestras_goa[:30]
    }
    (OUT / "meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    index_path = Path("index.html")
    html = index_path.read_text(encoding="utf-8")
    etiqueta = '<script src="casa.js?v=1.6"></script>'
    nueva = etiqueta + '\n<script src="casa-v17.js?v=1.7"></script>'
    if "casa-v17.js" not in html:
        if etiqueta not in html:
            raise SystemExit("No se encontró casa.js en index.html")
        index_path.write_text(html.replace(etiqueta, nueva, 1), encoding="utf-8")

    print("VALIDACIÓN V1.7 CORRECTA")
    print(json.dumps(pruebas, ensure_ascii=False))
    print(f"Registros: {total:,}; prefijos: {len(indice):,}; Goa: {indice['goa']}")


if __name__ == "__main__":
    generar()
