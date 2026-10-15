const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

// fetch падает с TypeError, если нет сети — подменяем на понятное сообщение
async function request(url, options) {
  try {
    return await fetch(url, options)
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new Error('Нет соединения с сервером погоды')
  }
}

export async function searchCities(query, signal) {
  const params = new URLSearchParams({ name: query, count: '6', language: 'ru', format: 'json' })
  const res = await request(`${GEO_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Не удалось найти город')
  const data = await res.json()
  return (data.results ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export async function getForecast({ lat, lon }) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    timezone: 'auto',
    wind_speed_unit: 'ms',
    forecast_days: '7',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,weather_code,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max',
  })
  const res = await request(`${FORECAST_URL}?${params}`)
  if (!res.ok) throw new Error('Сервис погоды не отвечает, попробуйте позже')
  return res.json()
}
