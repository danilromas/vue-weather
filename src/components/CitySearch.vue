<script setup>
import { ref, watch } from 'vue'
import { searchCities } from '../utils/api'

const emit = defineEmits(['select'])

const query = ref('')
const results = ref([])
const open = ref(false)
const active = ref(-1)
let timer = null
let controller = null

watch(query, (q) => {
  clearTimeout(timer)
  if (q.trim().length < 2) {
    results.value = []
    return
  }
  // ждём, пока пользователь допечатает
  timer = setTimeout(async () => {
    controller?.abort()
    controller = new AbortController()
    try {
      results.value = await searchCities(q.trim(), controller.signal)
      active.value = -1
      open.value = true
    } catch (e) {
      if (e.name !== 'AbortError') results.value = []
    }
  }, 350)
})

function choose(city) {
  emit('select', city)
  query.value = ''
  results.value = []
  open.value = false
}

function onKeydown(e) {
  if (!results.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    active.value = (active.value + 1) % results.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    active.value = (active.value - 1 + results.value.length) % results.value.length
  } else if (e.key === 'Enter') {
    choose(results.value[Math.max(active.value, 0)])
  } else if (e.key === 'Escape') {
    open.value = false
  }
}
</script>

<template>
  <div class="search">
    <input
      v-model="query"
      class="search-input"
      placeholder="Найти город…"
      @focus="open = true"
      @blur="open = false"
      @keydown="onKeydown"
    />
    <ul v-if="open && results.length" class="dropdown">
      <li
        v-for="(c, i) in results"
        :key="c.id"
        :class="{ active: i === active }"
        @mousedown.prevent="choose(c)"
      >
        <strong>{{ c.name }}</strong>
        <span>{{ c.region }}</span>
      </li>
    </ul>
    <p v-else-if="open && query.length >= 2 && !results.length" class="dropdown empty">Ничего не нашлось</p>
  </div>
</template>
