import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { todayLagos } from '@/lib/time'
import { z } from 'zod'
import { getOrSetDeviceId } from '@/lib/device'

const schema = z.object({
  regNo: z.string().min(1).transform((s) => s.trim()),
  fullName: z.string().min(1).transform((s) => s.trim()),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { regNo, fullName } = schema.parse(json)
    const regKey = regNo.toUpperCase()

    const deviceId = getOrSetDeviceId()
    const bound = await prisma.deviceBinding.findUnique({ where: { deviceId } })
    if (bound) {
      const linked = await prisma.student.findUnique({ where: { id: bound.studentId } })
      if (!linked) {
        await prisma.deviceBinding.delete({ where: { deviceId } }).catch(() => {})
      } else {
        if (linked.regNo !== regKey) {
          const dateKeyLinked = todayLagos()
          await prisma.attendance.upsert({
            where: { studentId_date: { studentId: linked.id, date: dateKeyLinked } },
            update: {},
            create: { studentId: linked.id, date: dateKeyLinked },
          })
          return NextResponse.json({
            message: 'This device is linked to another account. Redirecting to that account.',
            redirect: `/student?regNo=${encodeURIComponent(linked.regNo)}`,
          })
        }
      }
    }

    let existing = await prisma.student.findUnique({ where: { regNo: regKey } })
    if (!existing && regKey !== regNo) {
      const legacy = await prisma.student.findUnique({ where: { regNo } })
      if (legacy) {
        existing = await prisma.student.update({ where: { id: legacy.id }, data: { regNo: regKey } })
      }
    }

    if (existing && existing.fullName.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      return NextResponse.json(
        { message: 'APP number already exists with a different full name.' },
        { status: 400 },
      )
    }

    const student = await prisma.student.upsert({
      where: { regNo: regKey },
      update: { fullName },
      create: { regNo: regKey, fullName },
    })

    if (!bound) {
      await prisma.deviceBinding.create({ data: { deviceId, studentId: student.id } })
    }

    const dateKey = todayLagos()
    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date: dateKey } },
      update: {},
      create: { studentId: student.id, date: dateKey },
    })

  return NextResponse.json({ studentId: student.id, redirect: `/student?regNo=${encodeURIComponent(regKey)}` })
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
