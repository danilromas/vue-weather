import { ref, shallowRef } from 'vue'
import { getForecast } from '../utils/api'

export function useWeather() {
  const data = shallowRef(null)
  const loading = ref(false)
  const error = ref('')
  let requestId = 0

  async function load(city) {
    const id = ++requestId
    loading.value = true
    error.value = ''
    try {
      const res = await getForecast(city)
      // если пользователь успел выбрать другой город — старый ответ не нужен
      if (id === requestId) data.value = res
    } catch (e) {
      if (id === requestId) error.value = e.message
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  return { data, loading, error, load }
}
