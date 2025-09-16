import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { todayLagos } from '@/lib/time'
import { z } from 'zod'
import { getOrSetDeviceId } from '@/lib/device'

const schema = z.object({
  name: z.string().min(1).transform((s) => s.trim()),
  course: z.string().min(1).transform((s) => s.trim())
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { name, course } = schema.parse(json)

    const deviceId = getOrSetDeviceId()
    const bound = await prisma.deviceBinding.findUnique({ where: { deviceId } })
    if (bound) {
      // Check if bound to a student
      if (bound.studentId) {
        const student = await prisma.student.findUnique({ where: { id: bound.studentId } })
        if (student) {
          return NextResponse.json({
            message: 'This device is linked to a student account.',
            redirect: `/student?regNo=${encodeURIComponent(student.regNo)}`,
          })
        }
      }
      // Check if bound to another facilitator
      if (bound.facilitatorId) {
        const linked = await prisma.facilitator.findUnique({ where: { id: bound.facilitatorId } })
        if (linked && linked.name.toLowerCase() !== name.toLowerCase()) {
          return NextResponse.json({
            message: 'This device is linked to another facilitator account.',
            redirect: `/facilitator/status?name=${encodeURIComponent(linked.name)}&notice=linked`,
          })
        }
      }
    }

    const facilitator = await prisma.facilitator.upsert({
      where: { name },
      update: {},
      create: { name },
    })

    if (!bound) {
      await prisma.deviceBinding.create({ 
        data: { 
          deviceId, 
          facilitatorId: facilitator.id 
        } 
      })
    }

    const dateKey = todayLagos()
    await prisma.facilitatorAttendance.upsert({
      where: { facilitatorId_date: { facilitatorId: facilitator.id, date: dateKey } },
      update: { course },
      create: { facilitatorId: facilitator.id, date: dateKey, course },
    })

    return NextResponse.json({ 
      redirect: `/facilitator/status?name=${encodeURIComponent(name)}` 
    })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
