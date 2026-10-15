<script setup>
import { computed } from 'vue'
import { describe } from '../utils/weatherCodes'
import { hour, temp } from '../utils/format'

const props = defineProps({ hourly: Object, now: String })

const W = 720
const H = 240
const PAD = { top: 36, bottom: 44, x: 20 }

// берём 24 часа начиная с текущего
const points = computed(() => {
  const start = Math.max(0, props.hourly.time.findIndex((t) => t >= props.now.slice(0, 13)))
  return props.hourly.time.slice(start, start + 24).map((time, i) => ({
    time,
    t: props.hourly.temperature_2m[start + i],
    rain: props.hourly.precipitation_probability[start + i] ?? 0,
    icon: describe(props.hourly.weather_code[start + i], props.hourly.is_day[start + i]).icon,
  }))
})

const coords = computed(() => {
  const temps = points.value.map((p) => p.t)
  const min = Math.min(...temps) - 1
  const max = Math.max(...temps) + 1
  const step = (W - PAD.x * 2) / (points.value.length - 1)
  return points.value.map((p, i) => ({
    ...p,
    x: PAD.x + i * step,
    y: PAD.top + (1 - (p.t - min) / (max - min)) * (H - PAD.top - PAD.bottom),
  }))
})

// сглаженная линия через кривые Безье
const linePath = computed(() => {
  const c = coords.value
  return c.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`
    const prev = c[i - 1]
    const mx = (prev.x + p.x) / 2
    return `${d} C${mx},${prev.y} ${mx},${p.y} ${p.x},${p.y}`
  }, '')
})

const areaPath = computed(() => {
  const c = coords.value
  return `${linePath.value} L${c.at(-1).x},${H - PAD.bottom} L${c[0].x},${H - PAD.bottom} Z`
})
</script>

<template>
  <section class="panel hourly">
    <h2>На 24 часа</h2>
    <div class="chart-scroll">
      <svg :viewBox="`0 0 ${W} ${H}`" class="chart">
        <defs>
          <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".35" />
            <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- вероятность осадков столбиками снизу -->
        <rect
          v-for="p in coords"
          :key="'r' + p.time"
          :x="p.x - 6"
          :y="H - PAD.bottom - p.rain * 0.3"
          width="12"
          :height="p.rain * 0.3"
          rx="3"
          class="rain-bar"
        />

        <path :d="areaPath" fill="url(#area)" />
        <path :d="linePath" class="line" />

        <g v-for="(p, i) in coords" :key="p.time">
          <template v-if="i % 3 === 0">
            <circle :cx="p.x" :cy="p.y" r="3.5" class="point" />
            <text :x="p.x" :y="p.y - 12" class="t-label">{{ temp(p.t) }}</text>
            <text :x="p.x" :y="H - 22" class="icon-label">{{ p.icon }}</text>
            <text :x="p.x" :y="H - 4" class="h-label">{{ i === 0 ? 'Сейчас' : hour(p.time) }}</text>
          </template>
        </g>
      </svg>
    </div>
  </section>
</template>
