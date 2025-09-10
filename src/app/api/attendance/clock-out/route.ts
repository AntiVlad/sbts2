import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { todayLagos } from '@/lib/time'
import { z } from 'zod'
import { getOrSetDeviceId } from '@/lib/device'

const schema = z.object({ regNo: z.string().min(1).transform((s) => s.trim()) })

export async function POST(req: Request) {
  try {
  const json = await req.json()
  const { regNo } = schema.parse(json)
  const regKey = regNo.toUpperCase()

    const setting = await prisma.setting.findUnique({ where: { key: 'clockOutEnabled' } })
    const enabled = !!(
      setting && setting.value === 'true' && (!setting.expiresAt || setting.expiresAt > new Date())
    )
    if (!enabled) {
      return NextResponse.json({ message: 'Clock-out not enabled yet' }, { status: 403 })
    }

    let student = await prisma.student.findUnique({ where: { regNo: regKey } })
    if (!student && regKey !== regNo) {
      const legacy = await prisma.student.findUnique({ where: { regNo } })
      if (legacy) {
        student = await prisma.student.update({ where: { id: legacy.id }, data: { regNo: regKey } })
      }
    }
    if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 })

    // Enforce device binding
    const deviceId = getOrSetDeviceId()
    const bound = await prisma.deviceBinding.findUnique({ where: { deviceId } })
    if (bound && bound.studentId !== student.id) {
      const linked = await prisma.student.findUnique({ where: { id: bound.studentId } })
      if (linked) {
        const dateKeyLinked = todayLagos()
        await prisma.attendance.upsert({
          where: { studentId_date: { studentId: linked.id, date: dateKeyLinked } },
          update: {},
          create: { studentId: linked.id, date: dateKeyLinked },
        })
        return NextResponse.json({
          message: 'This device is linked to another account. Redirecting to that account.',
          redirect: `/student?regNo=${encodeURIComponent(linked.regNo)}&notice=linked`,
        })
      }
    }
    if (!bound) {
      await prisma.deviceBinding.create({ data: { deviceId, studentId: student.id } })
    }

    const dateKey = todayLagos()
    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date: dateKey } },
      update: {},
      create: { studentId: student.id, date: dateKey },
    })

    if (!attendance.clockOut) {
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: { clockOut: new Date() },
      })
      return NextResponse.json(updated)
    }
    return NextResponse.json(attendance)
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
