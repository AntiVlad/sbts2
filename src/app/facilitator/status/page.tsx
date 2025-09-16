import { prisma } from '@/lib/db'
import { formatDate, todayLagos } from '@/lib/time'
import ClockButton from '@/components/ClockButton'

export default async function FacilitatorStatusPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams
  const name = typeof params.name === 'string' ? params.name.trim() : ''
  const notice = typeof params.notice === 'string' ? params.notice : ''
  
  if (!name) {
    return (
      <div className="card p-6">
        <p className="text-sm">Missing name. Go back to the home page.</p>
        <a href="/" className="mt-3 inline-block text-blue-400 underline">Home</a>
      </div>
    )
  }

  const facilitator = await prisma.facilitator.findFirst({
    where: {
      OR: [
        { name: name },
        { name: name.toLowerCase() },
        { name: name.toUpperCase() }
      ]
    }
  })

  if (!facilitator) {
    return (
      <div className="card p-6">
        <p className="text-sm">Facilitator not found. Please start from the home page.</p>
        <a href="/" className="mt-3 inline-block text-blue-400 underline">Home</a>
      </div>
    )
  }

  const dateKey = todayLagos()
  const attendance = await prisma.facilitatorAttendance.findUnique({
    where: { facilitatorId_date: { facilitatorId: facilitator.id, date: dateKey } },
  })

  const setting = await prisma.setting.findUnique({ where: { key: 'clockOutEnabled' } })
  const clockOutEnabled = !!(
    setting && setting.value === 'true' && (!setting.expiresAt || setting.expiresAt > new Date())
  )

  return (
    <div className="space-y-4">
      {notice === 'linked' && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200">
          This device is linked to another account. You were redirected to the linked facilitator.
        </div>
      )}
      <div className="card p-6">
        <div className="flex flex-col gap-1">
          <div className="text-lg font-semibold">{facilitator.name}</div>
          <div className="text-white/70">Course: {attendance?.course || '—'}</div>
          <div className="text-white/60 text-sm">Today: {dateKey}</div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="text-sm text-white/80">
            <div>Clock-In: {attendance?.clockIn ? formatDate(attendance.clockIn) : '—'}</div>
            <div>Clock-Out: {attendance?.clockOut ? formatDate(attendance.clockOut) : '—'}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {!attendance?.clockIn ? (
            <ClockButton mode="in" isFacilitator name={facilitator.name} />
          ) : (
            <>
              <button className="btn btn-secondary" disabled>
                Clocked-In
              </button>
              <ClockButton mode="out" isFacilitator name={facilitator.name} disabled={!clockOutEnabled} />
            </>
          )}
        </div>
        {!clockOutEnabled && attendance?.clockIn && (
          <p className="mt-2 text-sm text-white/70">Clock-out is not enabled yet. Please check after class is over.</p>
        )}
      </div>
    </div>
  )
}
