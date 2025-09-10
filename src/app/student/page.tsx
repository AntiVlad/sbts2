import { prisma } from '@/lib/db'
import { formatDate, todayLagos } from '@/lib/time'
import ClockButton from '@/components/ClockButton'
import StudentStatus from '@/components/StudentStatus'

export default async function StudentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams
  const regNoRaw = typeof params.regNo === 'string' ? params.regNo : ''
  const notice = typeof params.notice === 'string' ? params.notice : ''
  const regNo = regNoRaw.trim()
  const regKey = regNo.toUpperCase()
  if (!regNo) {
    return (
      <div className="card p-6">
        <p className="text-sm">Missing APP Number. Go back to the home page.</p>
        <a href="/" className="mt-3 inline-block text-blue-400 underline">Home</a>
      </div>
    )
  }

  let student = await prisma.student.findUnique({ where: { regNo: regKey } })
  if (!student && regKey !== regNo) {
    const legacy = await prisma.student.findUnique({ where: { regNo } })
    if (legacy) {
      student = await prisma.student.update({ where: { id: legacy.id }, data: { regNo: regKey } })
    }
  }
  if (!student) {
    return (
      <div className="card p-6">
        <p className="text-sm">Student not found. Please start from the home page.</p>
        <a href="/" className="mt-3 inline-block text-blue-400 underline">Home</a>
      </div>
    )
  }

  const dateKey = todayLagos()
  const attendance = await prisma.attendance.findUnique({
    where: { studentId_date: { studentId: student.id, date: dateKey } },
  })

  const setting = await prisma.setting.findUnique({ where: { key: 'clockOutEnabled' } })
  const clockOutEnabled = !!(
    setting && setting.value === 'true' && (!setting.expiresAt || setting.expiresAt > new Date())
  )

  return (
    <div className="space-y-4">
      {notice === 'linked' && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200">
          This device is linked to another account. You were redirected to the linked student.
        </div>
      )}
      <div className="card p-6">
        <StudentStatus fullName={student.fullName} regNo={student.regNo} date={dateKey} />
        <div className="mt-4 space-y-2">
          <div className="text-sm text-white/80">
            <div>Clock-In: {attendance?.clockIn ? formatDate(attendance.clockIn) : '—'}</div>
            <div>Clock-Out: {attendance?.clockOut ? formatDate(attendance.clockOut) : '—'}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          {!attendance?.clockIn ? (
            <ClockButton mode="in" regNo={student.regNo} />
          ) : (
            <>
              <button className="btn btn-secondary" disabled>
                Clocked-In
              </button>
              <ClockButton mode="out" regNo={student.regNo} disabled={!clockOutEnabled} />
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
