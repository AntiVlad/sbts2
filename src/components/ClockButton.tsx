'use client'

import { useState } from 'react'

interface Props {
  mode: 'in' | 'out'
  regNo?: string
  name?: string
  disabled?: boolean
  isFacilitator?: boolean
}

export default function ClockButton({ mode, regNo, name, disabled, isFacilitator }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasClocked, setHasClocked] = useState(false)

  async function onClick() {
    if (disabled || hasClocked) return
    setLoading(true)
    setMessage(null)
    try {
      const endpoint = isFacilitator ? 'facilitator' : ''
      const res = await fetch(`/api/attendance/${endpoint}/${mode === 'in' ? 'clock-in' : 'clock-out'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isFacilitator ? { name } : { regNo }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Failed')
      }
      const redirect = data?.redirect as string | undefined
      if (redirect) {
        window.location.href = redirect
        return
      }
      if (mode === 'out') {
        setHasClocked(true)
        setMessage('Successfully clocked out')
      } else {
        setMessage('Success')
        window.location.reload()
      }
    } catch (err: any) {
      setMessage(err.message || 'Error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onClick} 
        className={`btn ${mode === 'out' && hasClocked ? 'btn-secondary' : 'btn-primary'}`} 
        disabled={disabled || loading || (mode === 'out' && hasClocked)}
      >
        {loading ? 'Please wait…' : mode === 'in' ? 'Clock In' : hasClocked ? 'Clocked Out' : 'Clock Out'}
      </button>
      {message && <span className="text-sm text-white/70">{message}</span>}
    </div>
  )
}
