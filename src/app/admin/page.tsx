import AdminTable from '@/components/AdminTable'
import { todayLagos, endOfTodayLagos } from '@/lib/time'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = searchParams
  const date = (typeof params.date === 'string' && params.date) || todayLagos()
  const search = (typeof params.search === 'string' && params.search) || ''
  const page = Math.max(1, parseInt((typeof params.page === 'string' && params.page) || '1', 10))
  const sort = (typeof params.sort === 'string' && (params.sort === 'desc' ? 'desc' : 'asc')) || 'asc'

  async function enableClockOut() {
    'use server'
    const expiresAt = endOfTodayLagos()
    await prisma.setting.upsert({
      where: { key: 'clockOutEnabled' },
      update: { value: 'true', expiresAt },
      create: { key: 'clockOutEnabled', value: 'true', expiresAt },
    })
    revalidatePath('/admin')
  }

  async function disableClockOut() {
    'use server'
    await prisma.setting.upsert({
      where: { key: 'clockOutEnabled' },
      update: { value: 'false', expiresAt: null },
      create: { key: 'clockOutEnabled', value: 'false', expiresAt: null },
    })
    revalidatePath('/admin')
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <form className="flex flex-1 flex-col gap-3 md:flex-row md:items-end" method="get">
            <div>
              <label className="mb-1 block text-sm">Date</label>
              <input type="date" name="date" defaultValue={date} className="input" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm">Search</label>
              <input type="text" name="search" defaultValue={search} placeholder="APP No or Name" className="input" />
            </div>
            <div>
              <button className="btn btn-secondary w-full md:w-auto">Apply</button>
            </div>
          </form>
          <div className="md:ml-auto flex gap-2">
            <a
              className="btn btn-secondary"
              href={`/api/admin/export?date=${encodeURIComponent(date)}`}
              target="_blank"
              rel="noreferrer"
            >
              Export CSV
            </a>
            <form action={enableClockOut}>
              <button className="btn btn-primary">
                Enable Clock-Out for Today
              </button>
            </form>
            <form action={disableClockOut}>
              <button className="btn btn-secondary">
                Disable Clock-Out
              </button>
            </form>
          </div>
        </div>
      </div>
  <AdminTable date={date} search={search} page={page} sort={sort} />
    </div>
  )
}
