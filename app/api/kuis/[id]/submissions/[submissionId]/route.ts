import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; submissionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'GURU') {
      return NextResponse.json(
        { success: false, error: 'Only teachers can grade submissions' },
        { status: 403 }
      )
    }

    const { nilai, catatan } = await req.json()

    if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
      return NextResponse.json(
        { success: false, error: 'Nilai must be between 0 and 100' },
        { status: 400 }
      )
    }

    const submission = await prisma.hasilKuis.update({
      where: {
        id: params.submissionId
      },
      data: {
        nilai,
        catatan: catatan || null,
        gradedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Error grading submission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
