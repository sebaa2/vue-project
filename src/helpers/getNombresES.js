// trae los nombres en español
export function getSpanishName(names = []) {
  if (!Array.isArray(names)) return ''
  const entry = names.find((n) => n.language?.name === 'es')
  return entry ? entry.name : ''
}
