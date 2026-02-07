import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get student by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id },
      include: {
        kelas: true,
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        nilai: {
          orderBy: { createdAt: "desc" }
        },
        hasilKuis: {
          include: {
            kuis: {
              select: {
                judul: true,
                mataPelajaran: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        absensi: {
          orderBy: { tanggal: "desc" },
          take: 30
        },
        progressReports: {
          orderBy: { createdAt: "desc" }
        },
        badges: {
          orderBy: { earnedAt: "desc" }
        }
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: siswa })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

// PATCH - Update student
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const siswa = await prisma.siswa.update({
      where: { id: params.id },
      data: {
        ...body,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined
      },
      include: {
        kelas: true,
        parent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: siswa })
  } catch (error) {
    console.error("Error updating siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.siswa.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: "Student deleted successfully" })
  } catch (error) {
    console.error("Error deleting siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete student" },
      { status: 500 }
    )
  }
}
