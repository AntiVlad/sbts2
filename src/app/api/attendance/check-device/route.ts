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
      where: { deviceId },
      include: { student: true },
    })

    if (!binding || !binding.student) {
      return NextResponse.json({ bound: false })
    }

    return NextResponse.json({
      bound: true,
      redirect: `/student?regNo=${encodeURIComponent(binding.student.regNo)}`,
    })
  } catch (err) {
    console.error('Error checking device binding:', err)
    return NextResponse.json({ bound: false })
  }
}
