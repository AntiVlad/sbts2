"use client"
import Link from 'next/link'
import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [roleSelected, setRoleSelected] = useState<'student' | 'facilitator' | null>(null)

  useEffect(() => {
    async function checkDevice() {
      try {
        const res = await fetch('/api/attendance/check-device')
        const data = await res.json()
        if (data.bound && data.redirect) {
          router.push(data.redirect)
          return
        }
      } catch (err) {
        console.error('Error checking device:', err)
      } finally {
        setChecking(false)
      }
    }
    checkDevice()
  }, [router])

  if (checking) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6">
          <p className="text-sm text-white/70">Checking device...</p>
        </div>
      </div>
    )
  }

  if (!roleSelected) {
    return (
      <div className="mx-auto max-w-xl">
        <div className="card p-6">
          <h2 className="mb-6 text-xl font-semibold text-center">Welcome to SBTS Clock in</h2>
          <p className="mb-6 text-center text-white/70">Please select your role:</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setRoleSelected('student')} 
              className="btn btn-primary px-8"
            >
              Student
            </button>
            <button 
              onClick={() => setRoleSelected('facilitator')} 
              className="btn btn-primary px-8"
            >
              Facilitator
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (roleSelected === 'facilitator') {
    router.push('/facilitator')
    return null
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Student Clock in</h2>
        <StartForm />
      </div>
    </div>
  )
}

function StartForm() {
  const [regNo, setRegNo] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/attendance/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNo, fullName }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to start')
      }
      const redirect = data?.redirect as string | undefined
      if (redirect) {
        window.location.href = redirect
      } else {
        window.location.href = `/student?regNo=${encodeURIComponent(regNo.trim())}`
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
        <label className="mb-1 block text-sm">APP Number</label>
        <input
          className="input"
          value={regNo}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRegNo(e.target.value)}
          required
          placeholder="APP-2025-33214"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Full Name</label>
        <input
          className="input"
          value={fullName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
          required
          placeholder=""
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
