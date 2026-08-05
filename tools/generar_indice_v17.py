#!/usr/bin/env python3
"""Genera el índice comercial v1.7 sin alterar los 64 fragmentos originales."""
from __future__ import annotations

import gzip
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path('casa-data-final-v16-c83d')
OUT = Path('casa-data-v17')
IDIOMAS_OUT = OUT / 'idiomas'
FRAGMENTOS = 64

STOPWORDS_BUSQUEDA = {
    'a','al','an','and','con','d','de','del','des','du','e','el','en','et','for',
    'la','las','le','les','los','of','para','por','the','un','una','unas','uno',
    'unos','y'
}

PALABRAS_IDIOMA = {
    'es': {
        'me':3,'llamo':4,'eres':3,'soy':3,'muy':2,'más':2,'como':1,'cómo':2,
        'qué':2,'que':1,'para':1,'por':1,'con':1,'sin':1,'del':1,'los':1,
        'las':1,'una':1,'uno':1,'vida':2,'amor':2,'historia':2,'libro':2,
        'guía':2,'guia':2,'niños':3,'niñas':3,'años':2,'señor':2,'señora':2,
        'no':1,'puedo':3,'sueñes':4,'lío':3,'lio':3,'diario':3,'primero':2
    },
    'ca': {
        'em':3,'dic':5,'amb':4,'per':2,'més':4,'mes':2,'aquest':4,'aquesta':4,
        'això':5,'aixo':4,'dels':3,'dones':3,'llibre':4,'llibres':4,'anys':4,
        'món':4,'mon':2,'puc':4,'seu':3,'seva':3,'meva':3,'teva':3,'ho':2,
        'diari':4,'edició':4,'edicio':4,'junts':3,'límits':4,'limits':3,
        'enrabiats':5,'creació':4,'creacio':4,'organitzacio':4,'llenguatge':5
    },
    'en': {
        'the':2,'and':2,'for':2,'with':3,'without':3,'not':3,'even':3,'love':3,
        'life':3,'book':3,'guide':3,'war':3,'world':3,'secret':3,'garden':3,
        'city':3,'art':2,'new':2,'self':2,'how':3,'why':3,'your':3,'my':2,
        'from':2,'into':2,'other':2,'stories':3,'history':2,'volume':2
    },
    'fr': {
        'les':2,'des':2,'une':3,'un':1,'du':2,'de':1,'et':2,'pour':3,'avec':3,
        'sans':3,'dans':3,'sur':2,'monde':3,'vie':3,'amour':3,'livre':4,
        'histoire':3,'petit':3,'petite':3,'comment':3,'pourquoi':3,'cette':3,
        'ces':2,'aux':2,'être':4,'etre':3
    },
    'de': {
        'der':3,'die':3,'das':3,'und':3,'mit':3,'ohne':3,'für':4,'fur':3,
        'von':2,'im':2,'ein':2,'eine':3,'einer':3,'leben':3,'liebe':3,
        'buch':4,'geschichte':4,'welt':3,'wie':2,'warum':3,'zum':2,'zur':2
    },
    'it': {
        'di':1,'del':1,'della':3,'delle':3,'degli':3,'il':2,'lo':2,'gli':2,
        'una':1,'uno':2,'con':1,'senza':3,'per':2,'che':2,'questa':4,
        'questo':4,'vita':3,'amore':3,'libro':3,'storia':3,'mondo':3,
        'come':2,'perché':4,'perche':3
    },
    'pt': {
        'uma':3,'um':2,'do':2,'da':2,'dos':2,'das':2,'e':1,'em':2,'para':1,
        'com':1,'sem':3,'não':5,'nao':4,'vida':2,'amor':2,'livro':4,
        'história':4,'historia':2,'mundo':3,'como':1,'porque':3,'você':4,
        'voce':3,'mais':2
    },
    'gl': {
        'unha':5,'unhas':5,'viaxe':5,'frechas':5,'ouro':4,'galego':5,
        'galega':5,'nenos':4,'nenas':4,'libro':2,'historia':1,'mundo':1,
        'do':2,'da':2,'dos':2,'das':2,'e':1,'en':1,'para':1,'con':1,
        'sen':3,'máis':4,'mais':2,'como':1
    },
    'eu': {
        'eta':4,'bat':4,'ez':4,'da':1,'dago':5,'dira':4,'euskal':6,
        'euskara':6,'liburua':6,'liburu':5,'mendi':4,'gure':4,'zure':4,
        'bere':3,'hau':4,'hori':4,'istorio':3,'ipuin':5,'andereñoak':6,
        'andereño':6
    }
}

CODIGOS_VALIDOS = {'es','en','fr','de','it','pt','ca','gl','eu'}
MAPA_DECLARADOS = {
    'spa':'es','es':'es','castellano':'es','spanish':'es',
    'eng':'en','en':'en','english':'en',
    'fre':'fr','fra':'fr','fr':'fr','french':'fr',
    'ger':'de','deu':'de','de':'de','german':'de',
    'ita':'it','it':'it','italian':'it',
    'por':'pt','pt':'pt','portuguese':'pt',
    'cat':'ca','ca':'ca','catalan':'ca','català':'ca',
    'glg':'gl','gl':'gl','galician':'gl','galego':'gl',
    'baq':'eu','eus':'eu','eu':'eu','basque':'eu','euskera':'eu'
}


def normalizar(texto: object) -> str:
    valor = unicodedata.normalize('NFD', str(texto or ''))
    valor = ''.join(c for c in valor if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', valor.lower()).strip()


def tokens(texto: object) -> list[str]:
    return [t for t in normalizar(texto).split() if t]


def prefijo_token(token: str) -> str:
    return token[:4] if len(token) >= 4 else token


def idioma_declarado(valor: object) -> str:
    limpio = str(valor or '').strip().lower()
    return MAPA_DECLARADOS.get(limpio, limpio if limpio in CODIGOS_VALIDOS else '')


def detectar_idioma(titulo: object) -> str:
    original = str(titulo or '').lower()
    lista = tokens(titulo)
    if not lista:
        return ''

    frases = {
        'es': ('me llamo','no puedo','ni lo suenes','que fuerte','vaya lio','el diario'),
        'ca': ('em dic','no puc','el diari','la creacio','el llenguatge'),
        'en': ('the ',' of ',' and ','how to','not even','self defense'),
        'fr': (' le ',' la ',' les ',' de la ',' de les ','pour '),
        'de': (' der ',' die ',' das ',' und ',' der meteor'),
        'it': (' di questa',' della ',' delle ',' il ',' lo '),
        'pt': (' nao ',' não ',' uma ',' do ',' da '),
        'gl': (' unha ',' unha viaxe',' as frechas',' de ouro'),
        'eu': (' euskal',' eta ',' ez ',' andereñoak')
    }
    acolchado = f' {normalizar(original)} '
    for codigo, patrones in frases.items():
        if any(p.strip() and (p in original or f' {normalizar(p)} ' in acolchado) for p in patrones):
            if codigo in {'fr','de','it','pt'} and len(lista) < 3:
                continue
            return codigo

    puntuaciones: Counter[str] = Counter()
    for token in lista:
        for codigo, vocabulario in PALABRAS_IDIOMA.items():
            puntuaciones[codigo] += vocabulario.get(token, 0)

    if re.search(r'[¿¡ñ]', original):
        puntuaciones['es'] += 3
    if re.search(r'[ç·]', original):
        puntuaciones['ca'] += 4
    if re.search(r'\b(ll|ny|ig)\w*', normalizar(original)):
        puntuaciones['ca'] += 1
    if re.search(r'\b(ção|ções|nh|lh)\w*', original):
        puntuaciones['pt'] += 4
    if re.search(r'\b(zione|zioni|gli|gn)\w*', normalizar(original)):
        puntuaciones['it'] += 3
    if re.search(r'\b(sch|ung|keit|heit)\w*', normalizar(original)):
        puntuaciones['de'] += 3

    if not puntuaciones:
        return ''
    orden = puntuaciones.most_common(2)
    mejor, puntos = orden[0]
    segundo = orden[1][1] if len(orden) > 1 else 0
    minimo = 4 if len(lista) <= 3 else 3
    if puntos < minimo or puntos - segundo < 2:
        return ''
    return mejor


def leer_gzip_json(ruta: Path):
    with gzip.open(ruta, 'rt', encoding='utf-8') as fh:
        return json.load(fh)


def escribir_gzip_json(ruta: Path, datos) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    serializado = json.dumps(datos, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    with gzip.GzipFile(filename='', mode='wb', fileobj=ruta.open('wb'), mtime=0, compresslevel=9) as gz:
        gz.write(serializado)


def idioma_registro(registro: list) -> str:
    declarado = idioma_declarado(registro[9] if len(registro) > 9 else '')
    return declarado or detectar_idioma(registro[1] if len(registro) > 1 else '')


def generar() -> None:
    if not BASE.exists():
        raise SystemExit(f'No existe {BASE}')

    OUT.mkdir(parents=True, exist_ok=True)
    IDIOMAS_OUT.mkdir(parents=True, exist_ok=True)

    prefijos: dict[str, Counter[int]] = defaultdict(Counter)
    idiomas_catalogo: dict[str, str] = {}
    conteo_idiomas: Counter[str] = Counter()
    total = 0
    muestras_goa: list[tuple[str, str, str, int]] = []

    for numero in range(FRAGMENTOS):
        ruta = BASE / f'{numero:02d}.json.gz'
        datos = leer_gzip_json(ruta)
        registros = datos.get('items', []) if isinstance(datos, dict) else []
        idiomas: list[str] = []

        for registro in registros:
            total += 1
            codigo = idioma_registro(registro)
            idiomas.append(codigo)
            conteo_idiomas[codigo or 'desconocido'] += 1

            texto = f"{registro[1] if len(registro)>1 else ''} {registro[2] if len(registro)>2 else ''}"
            claves = {
                prefijo_token(t)
                for t in tokens(texto)
                if len(t) >= 3 and t not in STOPWORDS_BUSQUEDA and not t.isdigit()
            }
            for clave in claves:
                prefijos[clave][numero] += 1

            if 'goa' in tokens(registro[1] if len(registro)>1 else '') and len(muestras_goa) < 30:
                muestras_goa.append((str(registro[1]), str(registro[2]), codigo, numero))

        escribir_gzip_json(
            IDIOMAS_OUT / f'{numero:02d}.json.gz',
            {'v': 1, 'idiomas': idiomas}
        )
        print(f'Fragmento {numero:02d}: {len(registros):,} registros')

    indice = {
        clave: [[fragmento, cantidad] for fragmento, cantidad in contador.most_common()]
        for clave, contador in sorted(prefijos.items())
    }
    escribir_gzip_json(OUT / 'prefijos.json.gz', {'v': 1, 'prefijos': indice})

    catalogo = leer_gzip_json(BASE / 'catalogo.json.gz') if (BASE / 'catalogo.json.gz').exists() else None
    if catalogo is None:
        with (BASE / 'catalogo.json').open('r', encoding='utf-8') as fh:
            catalogo = json.load(fh)
    for registros in (catalogo.get('grupos') or {}).values():
        for registro in registros:
            codigo = idioma_registro(registro)
            if codigo:
                idiomas_catalogo[str(registro[0])] = codigo
    escribir_gzip_json(OUT / 'idiomas-catalogo.json.gz', {'v': 1, 'idiomas': idiomas_catalogo})

    meta = {
        'v': 1,
        'productos': total,
        'prefijos': len(indice),
        'idiomas': dict(conteo_idiomas),
        'muestrasGoa': muestras_goa[:20]
    }
    (OUT / 'meta.json').write_text(
        json.dumps(meta, ensure_ascii=False, separators=(',', ':')),
        encoding='utf-8'
    )

    index_path = Path('index.html')
    html = index_path.read_text(encoding='utf-8')
    etiqueta = '<script src="casa.js?v=1.6"></script>'
    nueva = etiqueta + '\n<script src="casa-v17.js?v=1.7"></script>'
    if 'casa-v17.js' not in html:
        if etiqueta not in html:
            raise SystemExit('No se encontró la etiqueta de casa.js en index.html')
        html = html.replace(etiqueta, nueva, 1)
        index_path.write_text(html, encoding='utf-8')

    goa = indice.get('goa', [])
    if not goa:
        raise SystemExit('ERROR: el nuevo índice no contiene el prefijo goa')
    if not muestras_goa:
        raise SystemExit('ERROR: no se encontraron títulos Goa en los fragmentos')

    print('\nVALIDACIÓN V1.7')
    print(f'Productos procesados: {total:,}')
    print(f'Prefijos indexados: {len(indice):,}')
    print(f'Fragmentos para "goa": {goa}')
    for titulo, autor, idioma, fragmento in muestras_goa[:10]:
        print(f'  [{fragmento:02d}] {idioma or "?"}: {titulo} — {autor}')
    print('Idiomas:', dict(conteo_idiomas))


if __name__ == '__main__':
    generar()
