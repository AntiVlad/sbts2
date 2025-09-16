import AdminTable from '@/components/AdminTable'
import FacilitatorTable from '@/components/FacilitatorTable'
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
  const view = (typeof params.view === 'string' && params.view === 'facilitators') ? 'facilitators' : 'students'

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
        <div className="mb-6 flex gap-4 border-b border-white/10">
          <a 
            href={`/admin?view=students&date=${date}`} 
            className={`pb-3 px-4 ${view === 'students' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/70'}`}
          >
            Students
          </a>
          <a 
            href={`/admin?view=facilitators&date=${date}`} 
            className={`pb-3 px-4 ${view === 'facilitators' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-white/70'}`}
          >
            Facilitators
          </a>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <form className="flex flex-1 flex-col gap-3 md:flex-row md:items-end" method="get">
            <input type="hidden" name="view" value={view} />
            <div>
              <label className="mb-1 block text-sm">Date</label>
              <input type="date" name="date" defaultValue={date} className="input" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm">Search</label>
              <input 
                type="text" 
                name="search" 
                defaultValue={search} 
                placeholder={view === 'students' ? "APP No or Name" : "Facilitator Name"} 
                className="input" 
              />
            </div>
            <div>
              <button className="btn btn-secondary w-full md:w-auto">Apply</button>
            </div>
          </form>
          <div className="md:ml-auto flex gap-2">
            <a
              className="btn btn-secondary"
              href={`/api/admin/export?date=${encodeURIComponent(date)}&type=${view}`}
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
      {view === 'students' ? (
        <AdminTable date={date} search={search} page={page} sort={sort} />
      ) : (
        <FacilitatorTable date={date} search={search} page={page} sort={sort} />
      )}
    </div>
  )
}
