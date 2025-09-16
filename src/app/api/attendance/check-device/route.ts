import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { readDeviceId } from '@/lib/device'

export async function GET() {
  try {
    const deviceId = readDeviceId()
    if (!deviceId) {
      return NextResponse.json({ bound: false })
    }

    const binding = await prisma.deviceBinding.findUnique({
      where: { deviceId }
    })

    if (!binding) {
      return NextResponse.json({ bound: false })
    }

    if (binding.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: binding.studentId }
      })
      if (student) {
        return NextResponse.json({
          bound: true,
          redirect: `/student?regNo=${encodeURIComponent(student.regNo)}`,
        })
      }
    }

    if (binding.facilitatorId) {
      const facilitator = await prisma.facilitator.findUnique({
        where: { id: binding.facilitatorId }
      })
      if (facilitator) {
        return NextResponse.json({
          bound: true,
          redirect: `/facilitator/status?name=${encodeURIComponent(facilitator.name)}`,
        })
      }
    }

    return NextResponse.json({ bound: false })
  } catch (err) {
    console.error('Error checking device binding:', err)
    return NextResponse.json({ bound: false })
  }
}
