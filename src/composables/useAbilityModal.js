// composables/useAbilityModal.js
import { ref } from 'vue'

export const useAbilityModal = () => {
  // Estado
  const selectedAbility = ref(null)
  const abilityDescriptions = ref({})
  const abilityNames = ref({}) // Caché para nombres en español
  const loadingAbility = ref(null)

  // Función para obtener el nombre de la habilidad desde la API
  const fetchAbilityName = async (abilityName) => {
    if (abilityNames.value[abilityName]) {
      return abilityNames.value[abilityName]
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`)
      const data = await response.json()

      const spanishName = data.names?.find((n) => n.language.name === 'es')

      let formattedName = null
      if (spanishName) {
        formattedName = spanishName.name
      } else {
        formattedName = abilityName
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }

      abilityNames.value[abilityName] = formattedName
      return formattedName
    } catch (error) {
      console.error('Error obteniendo nombre:', error)
      return abilityName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
  }

  // Función para obtener el nombre de forma reactiva (para usar en el template)
  const getAbilityName = async (abilityName) => {
    return await fetchAbilityName(abilityName)
  }

  // Función para obtener el nombre de forma síncrona (desde caché)
  const getCachedAbilityName = (abilityName) => {
    return abilityNames.value[abilityName] || null
  }

  // Obtener descripción desde la API
  const fetchAbilityDescription = async (abilityName) => {
    if (abilityDescriptions.value[abilityName]) {
      return abilityDescriptions.value[abilityName]
    }

    loadingAbility.value = abilityName

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`)
      const data = await response.json()

      let description = null

      if (data.flavor_text_entries) {
        const spanishFlavor = data.flavor_text_entries.find(
          (entry) =>
            entry.language.name === 'es' &&
            (entry.version_group.name === 'scarlet-violet' ||
              entry.version_group.name === 'sword-shield' ||
              entry.version_group.name === 'sun-moon'),
        )

        if (spanishFlavor) {
          description = spanishFlavor.flavor_text
        }
      }

      if (!description && data.flavor_text_entries) {
        const spanishFlavorOld = data.flavor_text_entries.find(
          (entry) => entry.language.name === 'es',
        )
        if (spanishFlavorOld) {
          description = spanishFlavorOld.flavor_text
        }
      }

      if (!description && data.effect_entries) {
        const englishEffect = data.effect_entries.find((entry) => entry.language.name === 'en')
        if (englishEffect) {
          description = `[EN] ${englishEffect.short_effect || englishEffect.effect}`
        }
      }

      if (!description) {
        description = 'Descripción no disponible para esta habilidad.'
      }

      abilityDescriptions.value[abilityName] = description
      return description
    } catch (error) {
      console.error('Error obteniendo descripción:', error)
      return 'No se pudo cargar la descripción.'
    } finally {
      loadingAbility.value = null
    }
  }

  // Alternar despliegue de habilidad
  const toggleAbility = async (ability) => {
    if (selectedAbility.value?.name === ability.ability.name) {
      selectedAbility.value = null
      return
    }

    const [formattedName, description] = await Promise.all([
      fetchAbilityName(ability.ability.name),
      fetchAbilityDescription(ability.ability.name),
    ])

    selectedAbility.value = {
      name: ability.ability.name,
      formattedName: formattedName,
      description: description,
      isHidden: ability.is_hidden,
    }
  }

  // Precargar nombres de habilidades al cargar el Pokémon
  const preloadAbilityNames = async (abilities) => {
    if (!abilities || abilities.length === 0) return

    const promises = abilities.map((ability) =>
      fetchAbilityName(ability.ability.name).catch((err) => console.error(err)),
    )
    await Promise.all(promises)
    console.log('📛 Nombres de habilidades precargados')
  }

  const handleClickOutside = (event) => {
    if (
      selectedAbility.value &&
      !event.target.closest('.ability-button') &&
      !event.target.closest('.ability-description')
    ) {
      selectedAbility.value = null
    }
  }

  const setupClickOutside = () => {
    document.addEventListener('click', handleClickOutside)
  }

  const cleanupClickOutside = () => {
    document.removeEventListener('click', handleClickOutside)
  }

  return {
    // Estado
    selectedAbility,
    loadingAbility,
    abilityNames, // Exponemos la caché de nombres

    // Métodos
    toggleAbility,
    getCachedAbilityName, // Para obtener nombre de forma síncrona
    preloadAbilityNames, // Para precargar al cargar el Pokémon
    setupClickOutside,
    cleanupClickOutside,
  }
}
