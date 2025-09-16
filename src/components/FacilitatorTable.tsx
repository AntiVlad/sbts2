import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/time'

export default async function FacilitatorTable({
  date,
  search,
  page,
  sort = 'asc',
}: {
  date: string
  search: string
  page: number
  sort?: 'asc' | 'desc'
}) {
  const pageSize = 100
  const skip = (page - 1) * pageSize
  const q = search.trim()
  const where = {
    date,
    facilitator: q
      ? {
          name: { contains: q },
        }
      : undefined,
  } as const

  const [rows, total] = await Promise.all([
    prisma.facilitatorAttendance.findMany({
      where,
      include: { facilitator: true },
      orderBy: [{ clockIn: sort }],
      skip,
      take: pageSize,
    }),
    prisma.facilitatorAttendance.count({ where }),
  ])
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="card p-6">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Name</th>
              <th className="th">Course</th>
              <th className="th">
                <a className="underline" href={`?view=facilitators&date=${encodeURIComponent(date)}&search=${encodeURIComponent(search)}&page=${page}&sort=${sort === 'asc' ? 'desc' : 'asc'}`}>
                  Clock-In {sort === 'asc' ? '▲' : '▼'}
                </a>
              </th>
              <th className="th">Clock-Out</th>
              <th className="th">Duration</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="td" colSpan={6}>
                  <div className="py-8 text-center text-white/70">No records</div>
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const cin = r.clockIn ? formatDate(r.clockIn) : ''
              const cout = r.clockOut ? formatDate(r.clockOut) : ''
              const durMin = r.clockIn && r.clockOut ? Math.round((r.clockOut.getTime() - r.clockIn.getTime()) / 60000) : 0
              const dur = r.clockIn && r.clockOut ? `${String(Math.floor(durMin / 60)).padStart(2, '0')}:${String(durMin % 60).padStart(2, '0')}` : ''
              const status = r.clockIn ? (r.clockOut ? 'Done' : 'In') : 'Not In'
              return (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="td">{r.facilitator.name}</td>
                  <td className="td">{r.course}</td>
                  <td className="td">{cin}</td>
                  <td className="td">{cout}</td>
                  <td className="td">{dur}</td>
                  <td className="td">{status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-white/70">
        <span>
          Page {page} of {totalPages} — {total} total
        </span>
        <div className="flex items-center gap-2">
          <a
            className={`btn btn-secondary ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
            href={`?view=facilitators&date=${encodeURIComponent(date)}&search=${encodeURIComponent(search)}&page=${page - 1}`}
          >
            Prev
          </a>
          <a
            className={`btn btn-secondary ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
            href={`?view=facilitators&date=${encodeURIComponent(date)}&search=${encodeURIComponent(search)}&page=${page + 1}`}
          >
            Next
          </a>
        </div>
      </div>
    </div>
  )
}
