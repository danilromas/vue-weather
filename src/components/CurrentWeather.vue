<script setup>
import { computed } from 'vue'
import { describe } from '../utils/weatherCodes'
import { temp, hour, windDirection, mmHg } from '../utils/format'

const props = defineProps({
  city: Object,
  current: Object,
  today: Object,
  favorite: Boolean,
})
defineEmits(['toggle-favorite'])

const info = computed(() => describe(props.current.weather_code, props.current.is_day))

const details = computed(() => [
  { label: 'Ощущается', value: temp(props.current.apparent_temperature) },
  { label: 'Влажность', value: `${props.current.relative_humidity_2m}%` },
  { label: 'Ветер', value: `${Math.round(props.current.wind_speed_10m)} м/с, ${windDirection(props.current.wind_direction_10m)}` },
  { label: 'Давление', value: `${mmHg(props.current.pressure_msl)} мм` },
  { label: 'Восход', value: hour(props.today.sunrise[0]) },
  { label: 'Закат', value: hour(props.today.sunset[0]) },
])
</script>

<template>
  <section class="current">
    <div class="current-main">
      <div class="place">
        <h1>{{ city.name }}</h1>
        <button class="star" :class="{ on: favorite }" :title="favorite ? 'Убрать из избранного' : 'В избранное'" @click="$emit('toggle-favorite')">
          {{ favorite ? '★' : '☆' }}
        </button>
      </div>
      <p class="region">{{ city.region }}</p>

      <div class="temp-row">
        <span class="big-icon">{{ info.icon }}</span>
        <span class="big-temp">{{ temp(current.temperature_2m) }}</span>
      </div>
      <p class="condition">
        {{ info.text }} · {{ temp(today.temperature_2m_min[0]) }} / {{ temp(today.temperature_2m_max[0]) }}
      </p>
    </div>

    <dl class="details">
      <div v-for="d in details" :key="d.label">
        <dt>{{ d.label }}</dt>
        <dd>{{ d.value }}</dd>
      </div>
    </dl>
  </section>
</template>
