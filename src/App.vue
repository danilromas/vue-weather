<script setup>
import { computed, ref, watch } from 'vue'
import { useWeather } from './composables/useWeather'
import { useFavorites } from './composables/useFavorites'
import { describe } from './utils/weatherCodes'
import CitySearch from './components/CitySearch.vue'
import CurrentWeather from './components/CurrentWeather.vue'
import HourlyChart from './components/HourlyChart.vue'
import DailyForecast from './components/DailyForecast.vue'

const { data, loading, error, load } = useWeather()
const { favorites, isFavorite, toggle } = useFavorites()

function lastCity() {
  try {
    return JSON.parse(localStorage.getItem('weather-last-city'))
  } catch {
    return null
  }
}

const city = ref(lastCity() ?? favorites.value[0])

watch(city, (c) => {
  load(c)
  try {
    localStorage.setItem('weather-last-city', JSON.stringify(c))
  } catch {}
}, { immediate: true })

// фон страницы зависит от погоды
const theme = computed(() => {
  if (!data.value) return 'clouds'
  return describe(data.value.current.weather_code, data.value.current.is_day).group
})

const geoError = ref('')
function useMyLocation() {
  geoError.value = ''
  if (!navigator.geolocation) {
    geoError.value = 'Браузер не поддерживает геолокацию'
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      city.value = {
        name: 'Моё местоположение',
        region: `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
      }
    },
    () => (geoError.value = 'Нет доступа к геолокации'),
  )
}
</script>

<template>
  <div class="page" :data-theme="theme">
    <div class="container">
      <header class="header">
        <CitySearch @select="city = $event" />
        <button class="chip" title="Определить местоположение" @click="useMyLocation">📍</button>
      </header>

      <nav class="favorites">
        <button
          v-for="f in favorites"
          :key="f.name + f.lat"
          class="chip"
          :class="{ active: f.lat === city.lat && f.lon === city.lon }"
          @click="city = f"
        >
          {{ f.name }}
        </button>
      </nav>

      <p v-if="geoError" class="error">{{ geoError }}</p>
      <p v-if="error" class="error">{{ error }} <button class="link" @click="load(city)">Повторить</button></p>

      <div v-if="loading && !data" class="skeleton" />

      <template v-if="data">
        <CurrentWeather
          :city="city"
          :current="data.current"
          :today="data.daily"
          :favorite="isFavorite(city)"
          :class="{ dim: loading }"
          @toggle-favorite="toggle(city)"
        />
        <div class="grid" :class="{ dim: loading }">
          <HourlyChart :hourly="data.hourly" :now="data.current.time" />
          <DailyForecast :daily="data.daily" />
        </div>
      </template>

      <footer class="footer">Данные: <a href="https://open-meteo.com" target="_blank" rel="noopener">Open-Meteo</a></footer>
    </div>
  </div>
</template>
