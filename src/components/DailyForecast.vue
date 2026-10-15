<script setup>
import { computed } from 'vue'
import { describe } from '../utils/weatherCodes'
import { day, temp } from '../utils/format'

const props = defineProps({ daily: Object })

// общий диапазон недели, чтобы полоски температуры были сопоставимы
const range = computed(() => ({
  min: Math.min(...props.daily.temperature_2m_min),
  max: Math.max(...props.daily.temperature_2m_max),
}))

const days = computed(() =>
  props.daily.time.map((date, i) => {
    const lo = props.daily.temperature_2m_min[i]
    const hi = props.daily.temperature_2m_max[i]
    const span = range.value.max - range.value.min || 1
    return {
      date,
      label: day(date, i),
      icon: describe(props.daily.weather_code[i]).icon,
      rain: props.daily.precipitation_probability_max[i],
      lo,
      hi,
      left: ((lo - range.value.min) / span) * 100,
      width: ((hi - lo) / span) * 100,
    }
  }),
)
</script>

<template>
  <section class="panel daily">
    <h2>На неделю</h2>
    <ul>
      <li v-for="d in days" :key="d.date">
        <span class="d-name">{{ d.label }}</span>
        <span class="d-icon">{{ d.icon }}</span>
        <span class="d-rain">{{ d.rain > 20 ? d.rain + '%' : '' }}</span>
        <span class="d-lo">{{ temp(d.lo) }}</span>
        <span class="bar"><i :style="{ left: d.left + '%', width: Math.max(d.width, 4) + '%' }" /></span>
        <span class="d-hi">{{ temp(d.hi) }}</span>
      </li>
    </ul>
  </section>
</template>
