import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { todayLagos } from '@/lib/time'
import { z } from 'zod'
import { getOrSetDeviceId } from '@/lib/device'

const schema = z.object({ name: z.string().min(1).transform((s) => s.trim()) })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { name } = schema.parse(json)

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
      return NextResponse.json({ message: 'Facilitator not found' }, { status: 404 })
    }

    const deviceId = getOrSetDeviceId()
    const bound = await prisma.deviceBinding.findUnique({ where: { deviceId } })
    if (bound && bound.facilitatorId !== facilitator.id) {
      const linked = bound.facilitatorId ? await prisma.facilitator.findUnique({ 
        where: { id: bound.facilitatorId } 
      }) : null
      if (linked) {
        return NextResponse.json({
          message: 'This device is linked to another account.',
          redirect: `/facilitator/status?name=${encodeURIComponent(linked.name)}&notice=linked`,
        })
      }
    }
    if (!bound) {
      await prisma.deviceBinding.create({ 
        data: { deviceId, facilitatorId: facilitator.id } 
      })
    }

    const dateKey = todayLagos()
    const attendance = await prisma.facilitatorAttendance.findUnique({
      where: { facilitatorId_date: { facilitatorId: facilitator.id, date: dateKey } },
    })

    if (attendance) {
      const updated = await prisma.facilitatorAttendance.update({
        where: { id: attendance.id },
        data: { clockIn: new Date() },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ message: 'No attendance record found' }, { status: 404 })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
