import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    const { submissionId } = await params

    const { nilai, catatan } = await req.json()

    if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
      return NextResponse.json(
        { success: false, error: 'Nilai must be between 0 and 100' },
        { status: 400 }
      )
    }

    const submission = await prisma.hasilTugas.update({
      where: {
        id: submissionId
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
