import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const QuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  search: z.string().optional().default(''),
  page: z.string().transform((s) => Math.max(1, parseInt(s || '1', 10))).optional().default('1'),
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = QuerySchema.parse({
      date: searchParams.get('date'),
      search: searchParams.get('search') || '',
      page: searchParams.get('page') || '1',
    })
    const pageSize = 100
    const skip = (Number(parsed.page) - 1) * pageSize
    const q = parsed.search.trim()

    const where = {
      date: parsed.date,
      student: q
        ? {
            OR: [
              { regNo: { contains: q, mode: 'insensitive' } },
              { fullName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
    } as const

    const [rows, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { student: true },
        orderBy: [{ clockIn: 'asc' }],
        skip,
        take: pageSize,
      }),
      prisma.attendance.count({ where }),
    ])

    return NextResponse.json({ rows, total, page: Number(parsed.page), pageSize })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid query' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
