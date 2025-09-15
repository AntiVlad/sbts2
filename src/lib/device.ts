import { headers } from 'next/headers'
import { createHash } from 'crypto'

export function getOrSetDeviceId(): string {
  return getDeviceFingerprint()
}

export function readDeviceId(): string | null {
  return getDeviceFingerprint()
}

function getDeviceFingerprint(): string {
  const headerStore = headers()
  const ip = headerStore.get('x-forwarded-for') || 
             headerStore.get('x-real-ip') || 
             headerStore.get('cf-connecting-ip') ||
             '127.0.0.1'
  const userAgent = headerStore.get('user-agent') || 'unknown'
  
  const fingerprint = `${ip}:${userAgent}`
  return createHash('sha256').update(fingerprint).digest('hex').slice(0, 16)
}


