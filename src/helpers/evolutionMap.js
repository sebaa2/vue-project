// src/helpers/evolutionMap.js

export const evolutionMap = {
  // ==================== GENERACIÓN 1 ====================
  tyrogue: {
    evolvesTo: [
      {
        name: 'hitmonlee',
        displayName: 'Hitmonlee',
        method: 'Nivel 20 (si Ataque > Defensa)',
        types: ['fighting'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmonlee.png',
      },
      {
        name: 'hitmonchan',
        displayName: 'Hitmonchan',
        method: 'Nivel 20 (si Ataque < Defensa)',
        types: ['fighting'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmonchan.png',
      },
      {
        name: 'hitmontop',
        displayName: 'Hitmontop',
        method: 'Nivel 20 (si Ataque = Defensa)',
        types: ['fighting'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmontop.png',
      },
    ],
  },
  // Gen 2
  onix: {
    evolvesTo: [
      {
        name: 'steelix',
        displayName: 'Steelix',
        method: 'Intercambio con Revestimiento Metálico',
        types: ['steel', 'ground'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/steelix.png',
      },
    ],
  },
  scyther: {
    evolvesTo: [
      {
        name: 'scizor',
        displayName: 'Scizor',
        method: 'Intercambio con Revestimiento Metálico',
        types: ['bug', 'steel'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/scizor.png',
      },
    ],
  },
  seadra: {
    evolvesTo: [
      {
        name: 'kingdra',
        displayName: 'Kingdra',
        method: 'Intercambio con Escama Dragón',
        types: ['water', 'dragon'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/kingdra.png',
      },
    ],
  },
  porygon: {
    evolvesTo: [
      {
        name: 'porygon2',
        displayName: 'Porygon2',
        method: 'Intercambio con Mejora',
        types: ['normal'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/porygon2.png',
      },
    ],
  },
  poliwhirl: {
    evolvesTo: [
      {
        name: 'politoed',
        displayName: 'Politoed',
        method: 'Intercambio con Roca del Rey',
        types: ['water'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/politoed.png',
      },
    ],
  },
  slowpoke: {
    evolvesTo: [
      {
        name: 'slowking',
        displayName: 'Slowking',
        method: 'Intercambio con Roca del Rey',
        types: ['water', 'psychic'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/slowking.png',
      },
    ],
  },

  // Gen 3 (caso especial doble)
  clamperl: {
    evolvesTo: [
      {
        name: 'huntail',
        displayName: 'Huntail',
        method: 'Intercambio con Diente Marino',
        types: ['water'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/huntail.png',
      },
      {
        name: 'gorebyss',
        displayName: 'Gorebyss',
        method: 'Intercambio con Escama Marina',
        types: ['water'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/gorebyss.png',
      },
    ],
  },
  feebas: {
    evolvesTo: [
      {
        name: 'milotic',
        displayName: 'Milotic',
        method: 'Intercambio con Escama Bella (Gen 5+) / Belleza alta + un nivel (Gen 3-4)',
        types: ['water'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/milotic.png',
      },
    ],
  },

  // ==================== GENERACIÓN 4 ====================
  magneton: {
    evolvesTo: [
      {
        name: 'magnezone',
        displayName: 'Magnezone',
        method: 'Nivel en campo magnético especial (o Piedra Trueno desde Gen 8)',
        types: ['electric', 'steel'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/magnezone.png',
      },
    ],
  },
  nosepass: {
    evolvesTo: [
      {
        name: 'probopass',
        displayName: 'Probopass',
        method: 'Nivel en campo magnético especial (o Piedra Trueno desde Leyendas Arceus)',
        types: ['rock', 'steel'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/probopass.png',
      },
    ],
  },
  // Gen 4
  porygon2: {
    evolvesTo: [
      {
        name: 'porygon-z',
        displayName: 'Porygon-Z',
        method: 'Intercambio con Disco Extraño',
        types: ['normal'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/porygon-z.png',
      },
    ],
  },
  rhydon: {
    evolvesTo: [
      {
        name: 'rhyperior',
        displayName: 'Rhyperior',
        method: 'Intercambio con Protector',
        types: ['ground', 'rock'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/rhyperior.png',
      },
    ],
  },
  electabuzz: {
    evolvesTo: [
      {
        name: 'electivire',
        displayName: 'Electivire',
        method: 'Intercambio con Electrizador',
        types: ['electric'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/electivire.png',
      },
    ],
  },
  magmar: {
    evolvesTo: [
      {
        name: 'magmortar',
        displayName: 'Magmortar',
        method: 'Intercambio con Magmatizador',
        types: ['fire'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/magmortar.png',
      },
    ],
  },
  dusclops: {
    evolvesTo: [
      {
        name: 'dusknoir',
        displayName: 'Dusknoir',
        method: 'Intercambio con Tela Terrible',
        types: ['ghost'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/dusknoir.png',
      },
    ],
  },

  // ==================== GENERACIÓN 5 ====================
  karrablast: {
    evolvesTo: [
      {
        name: 'escavalier',
        displayName: 'Escavalier',
        method: 'Intercambio con Shelmet',
        types: ['bug', 'steel'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/escavalier.png',
      },
    ],
  },
  shelmet: {
    evolvesTo: [
      {
        name: 'accelgor',
        displayName: 'Accelgor',
        method: 'Intercambio con Karrablast',
        types: ['bug'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/accelgor.png',
      },
    ],
  },

  // ==================== GENERACIÓN 7 ====================
  cosmog: {
    evolvesTo: [
      {
        name: 'cosmoem',
        displayName: 'Cosmoem',
        method: 'Nivel 43',
        types: ['psychic'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/cosmoem.png',
      },
    ],
  },
  cosmoem: {
    evolvesTo: [
      {
        name: 'solgaleo',
        displayName: 'Solgaleo',
        method: 'Nivel 53 (durante el día)',
        style: 'Sol',
        types: ['psychic', 'steel'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/solgaleo.png',
      },
      {
        name: 'lunala',
        displayName: 'Lunala',
        method: 'Nivel 53 (durante la noche)',
        style: 'Luna',
        types: ['psychic', 'ghost'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/lunala.png',
      },
    ],
  },

  // ==================== GENERACIÓN 8 ====================
  kubfu: {
    evolvesTo: [
      {
        name: 'urshifu-single-strike',
        displayName: 'Urshifu Estilo Brusco',
        method: 'Manuscrito Sombras (antes Torre de la Oscuridad)',
        style: 'Brusco',
        types: ['fighting', 'dark'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu.png',
      },
      {
        name: 'urshifu-rapid-strike',
        displayName: 'Urshifu Estilo Fluido',
        method: 'Manuscrito aguas (antes Torre del Agua)',
        style: 'Fluido',
        types: ['fighting', 'water'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu-rapidstrike.png',
      },
    ],
  },
  toxel: {
    evolvesTo: [
      {
        name: 'toxtricity-amped',
        displayName: 'Toxtricity (Amped)',
        method: 'Nivel 30 (Naturaleza: Fuerte, Osada, Firme, etc.)',
        style: 'Amped',
        types: ['electric', 'poison'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity.png',
      },
      {
        name: 'toxtricity-low-key',
        displayName: 'Toxtricity (Low Key)',
        method: 'Nivel 30 (Naturaleza: Miedosa, Modest, Calm, etc.)',
        style: 'Low Key',
        types: ['electric', 'poison'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity-lowkey.png',
      },
    ],
  },
  applin: {
    evolvesTo: [
      {
        name: 'dipplin',
        displayName: 'Dipplin',
        method: 'Usar: Manzana Melosa',
        types: ['grass', 'dragon'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/dipplin.png',
      },
    ],
  },

  // ==================== GENERACIÓN 9 ====================
  happiny: {
    evolvesTo: [
      {
        name: 'chansey',
        displayName: 'Chansey',
        method: 'Nivel (durante el día) con Piedra Oval equipada',
        types: ['normal'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/chansey.png',
      },
    ],
  },
  dipplin: {
    evolvesTo: [
      {
        name: 'hydrapple',
        displayName: 'Hydrapple',
        method: 'Nivel conociendo el movimiento Bramido Dragón',
        types: ['grass', 'dragon'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/hydrapple.png',
      },
    ],
  },
  primeape: {
    evolvesTo: [
      {
        name: 'annihilape',
        displayName: 'Annihilape',
        method: 'Usar Puño Furia 20 veces + subir 1 nivel',
        types: ['fighting', 'ghost'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/annihilape.png',
      },
    ],
  },
  gimmighoul: {
    evolvesTo: [
      {
        name: 'gholdengo',
        displayName: 'Gholdengo',
        method: 'Recolectar 999 monedas Gimmighoul',
        types: ['steel', 'ghost'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/gholdengo.png',
      },
    ],
  },
  girafarig: {
    evolvesTo: [
      {
        name: 'farigiraf',
        displayName: 'Farigiraf',
        method: 'Aprender Láser Doble + subir 1 nivel',
        types: ['normal', 'psychic'],
        sprite: 'https://play.pokemonshowdown.com/sprites/home/farigiraf.png',
      },
    ],
  },
}
