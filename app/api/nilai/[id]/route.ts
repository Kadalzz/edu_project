import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get single grade by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const nilai = await prisma.nilai.findUnique({
      where: { id },
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: {
              select: {
                nama: true,
                tingkat: true
              }
            }
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!nilai) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: nilai })
  } catch (error) {
    console.error("Error fetching nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch grade" },
      { status: 500 }
    )
  }
}

// PATCH - Update grade
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const {
      nilai,
      nilaiMaksimal,
      jenisNilai,
      catatan,
      tanggal,
      mataPelajaran
    } = body

    // Check if grade exists
    const existingNilai = await prisma.nilai.findUnique({
      where: { id }
    })

    if (!existingNilai) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (nilai !== undefined) updateData.nilai = parseFloat(nilai)
    if (nilaiMaksimal !== undefined) updateData.nilaiMaksimal = parseFloat(nilaiMaksimal)
    if (jenisNilai !== undefined) updateData.jenisNilai = jenisNilai
    if (catatan !== undefined) updateData.catatan = catatan
    if (tanggal !== undefined) updateData.tanggal = new Date(tanggal)
    if (mataPelajaran !== undefined) updateData.mataPelajaran = mataPelajaran

    const nilaiRecord = await prisma.nilai.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
          select: {
            nama: true
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: nilaiRecord })
  } catch (error) {
    console.error("Error updating nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update grade" },
      { status: 500 }
    )
  }
}

// DELETE - Delete grade
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if grade exists
    const existingNilai = await prisma.nilai.findUnique({
      where: { id }
    })

    if (!existingNilai) {
      return NextResponse.json(
        { success: false, error: "Grade not found" },
        { status: 404 }
      )
    }

    // Delete grade
    await prisma.nilai.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Grade deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete grade" },
      { status: 500 }
    )
  }
}
