export const COMPETITIVE_FORMATS = [
  {
    id: 'gen9vgc2026',
    label: 'VGC 2026',
    group: 'VGC',
    smogonId: 'gen9vgc2026',
    pkmnId: 'gen9vgc2026',
  },
  {
    id: 'gen9vgc2025',
    label: 'VGC 2025',
    group: 'VGC',
    smogonId: 'gen9vgc2025',
    pkmnId: 'gen9vgc2025',
  },
  {
    id: 'gen9vgc2024',
    label: 'VGC 2024 · Regulation G',
    group: 'VGC',
    smogonId: 'gen9vgc2024',
    pkmnId: 'gen9vgc2024',
    pokeKitId: 'vgc',
  },
  {
    id: 'gen9ou',
    label: 'Smogon · Gen 9 OU',
    group: 'Smogon',
    smogonId: 'gen9ou',
    pkmnId: 'gen9ou',
    pokeKitId: 'ou',
  },
  {
    id: 'gen9doublesou',
    label: 'Smogon · Gen 9 Doubles OU',
    group: 'Smogon',
    smogonId: 'gen9doublesou',
    pkmnId: 'gen9doublesou',
    pokeKitId: 'doublesou',
  },
]

export const DEFAULT_FORMAT_ID = 'gen9vgc2024'
export const DEFAULT_COMPARISON_FORMAT_ID = 'gen9ou'

export function getFormatById(id) {
  return COMPETITIVE_FORMATS.find((format) => format.id === id)
}
