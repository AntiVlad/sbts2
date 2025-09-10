import { formatInTimeZone, toZonedTime } from 'date-fns-tz'
import { endOfDay } from 'date-fns'

export const LAGOS_TZ = 'Africa/Lagos'

export function now(): Date {
  return new Date()
}

// YYYY-MM-DD in Africa/Lagos
export function todayLagos(date: Date = now()): string {
  return formatInTimeZone(date, LAGOS_TZ, 'yyyy-MM-dd')
}

export function toISODateLagos(date: Date): string {
  return formatInTimeZone(date, LAGOS_TZ, 'yyyy-MM-dd')
}

export function endOfTodayLagos(date: Date = now()): Date {
  const zoned = toZonedTime(date, LAGOS_TZ)
  const eodZoned = endOfDay(zoned)
  // convert zoned end-of-day back to UTC Date keeping the instant
  const iso = formatInTimeZone(eodZoned, LAGOS_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX")
  return new Date(iso)
}

export function formatTime(date?: Date | null): string {
  if (!date) return ''
  return formatInTimeZone(date, LAGOS_TZ, 'HH:mm:ss')
}

export function formatDate(date?: Date | null): string {
  if (!date) return ''
  return formatInTimeZone(date, LAGOS_TZ, 'yyyy-MM-dd HH:mm:ss')
}
