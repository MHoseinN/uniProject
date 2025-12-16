import jalaali from 'moment-jalaali'

export function toPersianDate(date) {
  if (!date) return '-'
  return jalaali(date).format('jYYYY/jMM/jDD')
}

export function toPersianDateTime(date) {
  if (!date) return '-'
  return jalaali(date).format('jYYYY/jMM/jDD HH:mm')
}

export function formatTime(time) {
  if (!time) return '-'
  return time
}

export function getCurrentPersianDate() {
  return jalaali().format('jYYYY/jMM/jDD')
}
