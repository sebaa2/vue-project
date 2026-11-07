# vue-project

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Variables de entorno

Para habilitar la búsqueda de cartas del Pokémon TCG, crea un archivo `.env` con tu clave:

```sh
cp .env.example .env
```

Luego agrega tu API key en el archivo:

```env
VITE_TCG_API_KEY=tu_api_key_aqui
```

## Módulo competitivo

La ruta `/competitive` combina estadísticas de uso de [PokéKit](https://poke.itlibra.com/es/opendata)
(elaboradas a partir de Smogon Stats), conjuntos publicados por [data.pkmn.cc](https://data.pkmn.cc/),
datos base de [PokéAPI](https://pokeapi.co/) y datos técnicos de movimientos de
[Pokémon Showdown](https://play.pokemonshowdown.com/). Si PokéKit no publica un formato,
se usan data.pkmn.cc y Smogon Stats como respaldo. Los resultados se almacenan en caché en
memoria durante diez minutos (una hora para PokéKit y los datos de movimientos).

Los formatos disponibles dependen de la publicación de cada fuente: VGC 2026, VGC 2025,
VGC 2024 Regulation G, Gen 9 OU y Gen 9 Doubles OU. Los porcentajes de PokéKit son
condicionales al uso de cada Pokémon; los formatos que no publica usan los campos de
estadísticas disponibles en data.pkmn.cc/Smogon. Los sets se muestran solo si la fuente los
publica para el formato; no se construyen sets combinando porcentajes independientes.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
