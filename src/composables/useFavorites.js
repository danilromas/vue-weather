import { ref, watch } from 'vue'

const KEY = 'weather-favorites'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? null
  } catch {
    return null
  }
}

const defaults = [
  { name: 'Симферополь', region: 'Крым', lat: 44.952, lon: 34.102 },
  { name: 'Севастополь', region: 'Крым', lat: 44.6, lon: 33.53 },
  { name: 'Ялта', region: 'Крым', lat: 44.499, lon: 34.17 },
]

const favorites = ref(read() ?? defaults)

watch(favorites, (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}, { deep: true })

export function useFavorites() {
  // сравниваем по координатам: id у одного города в разных ответах API может отличаться
  const key = (c) => `${c.lat.toFixed(1)}:${c.lon.toFixed(1)}`
  const isFavorite = (city) => favorites.value.some((c) => key(c) === key(city))

  function toggle(city) {
    if (isFavorite(city)) favorites.value = favorites.value.filter((c) => key(c) !== key(city))
    else favorites.value.push(city)
  }

  return { favorites, isFavorite, toggle }
}
