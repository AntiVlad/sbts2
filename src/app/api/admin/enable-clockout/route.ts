import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { endOfTodayLagos } from '@/lib/time'

export async function POST() {
  const expiresAt = endOfTodayLagos()
  await prisma.setting.upsert({
    where: { key: 'clockOutEnabled' },
    update: { value: 'true', expiresAt },
    create: { key: 'clockOutEnabled', value: 'true', expiresAt },
  })
  return NextResponse.json({ ok: true, expiresAt })
}
