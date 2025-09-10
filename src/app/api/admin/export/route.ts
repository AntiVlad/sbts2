import { prisma } from '@/lib/db'
import { formatInTimeZone } from 'date-fns-tz'
import { NextResponse } from 'next/server'

function csvEscape(val: string) {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"'
  }
  return val
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new NextResponse('Invalid date', { status: 400 })
  }
  const rows = await prisma.attendance.findMany({
    where: { date },
    include: { student: true },
    orderBy: [{ clockIn: 'asc' }],
  })
  let csv = 'reg_no,full_name,date,clock_in,clock_out,duration_minutes\n'
  for (const r of rows) {
    const clockIn = r.clockIn ? formatInTimeZone(r.clockIn, 'Africa/Lagos', "yyyy-MM-dd'T'HH:mm:ssXXX") : ''
    const clockOut = r.clockOut ? formatInTimeZone(r.clockOut, 'Africa/Lagos', "yyyy-MM-dd'T'HH:mm:ssXXX") : ''
    let duration = ''
    if (r.clockIn && r.clockOut) {
      const ms = r.clockOut.getTime() - r.clockIn.getTime()
      duration = String(Math.round(ms / 60000))
    }
    csv += [
      csvEscape(r.student.regNo),
      csvEscape(r.student.fullName),
      csvEscape(date),
      csvEscape(clockIn),
      csvEscape(clockOut),
      csvEscape(duration),
    ].join(',') + '\n'
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="attendance-${date}.csv"`,
    },
  })
}
