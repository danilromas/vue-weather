export const temp = (t) => `${Math.round(t) > 0 ? '+' : ''}${Math.round(t)}°`

export function hour(iso) {
  return iso.slice(11, 16)
}

const dayFmt = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })

export function day(iso, index) {
  if (index === 0) return 'Сегодня'
  if (index === 1) return 'Завтра'
  // T12:00 чтобы не уехать на другой день из-за часового пояса
  return dayFmt.format(new Date(iso + 'T12:00'))
}

export function windDirection(deg) {
  const dirs = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ']
  return dirs[Math.round(deg / 45) % 8]
}

// давление приходит в гПа, переводим в мм рт. ст.
export const mmHg = (hpa) => Math.round(hpa * 0.750062)
