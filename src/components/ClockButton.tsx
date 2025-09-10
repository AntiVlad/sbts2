'use client'

import { useState } from 'react'

export default function ClockButton({ mode, regNo, disabled }: { mode: 'in' | 'out'; regNo: string; disabled?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onClick() {
    if (disabled) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/attendance/${mode === 'in' ? 'clock-in' : 'clock-out'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo }),
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
      setMessage('Success')
      window.location.reload()
    } catch (err: any) {
      setMessage(err.message || 'Error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={onClick} className="btn btn-primary" disabled={disabled || loading}>
        {loading ? 'Please wait…' : mode === 'in' ? 'Clock In' : 'Clock Out'}
      </button>
      {message && <span className="text-sm text-white/70">{message}</span>}
    </div>
  )
}
