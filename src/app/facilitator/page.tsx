'use client'

import { useState, FormEvent } from 'react'

function FacilitatorForm() {
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/facilitator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, course }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to start')
      }
      const redirect = data?.redirect as string | undefined
      if (redirect) {
        window.location.href = redirect
      } else {
        window.location.href = `/facilitator/status?name=${encodeURIComponent(name)}`
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm">Full Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Course Teaching Today</label>
        <input
          className="input"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
          placeholder="e.g. Time Management "
        />
      </div>
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-2 text-red-300">
          {error}
        </div>
      )}
      <button className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Submitting…' : 'Continue'}
      </button>
    </form>
  )
}

export default function FacilitatorPage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Facilitator Clock in</h2>
        <FacilitatorForm />
      </div>
    </div>
  )
}
