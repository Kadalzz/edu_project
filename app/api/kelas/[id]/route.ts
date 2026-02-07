import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get single class by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        siswa: {
          select: {
            nama: true,
            nilai: true
          }
        },
        kuis: {
          select: {
            id: true,
            judul: true,
            status: true,
            createdAt: true
          }
        },
        materi: {
          select: {
            id: true,
            judul: true,
            mataPelajaran: true,
            createdAt: true
          }
        }
      }
    })

    if (!kelas) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: kelas })
  } catch (error) {
    console.error("Error fetching kelas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch class" },
      { status: 500 }
    )
  }
}

// PATCH - Update class
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nama, tingkat, tahunAjaran, guruId } = body

    // Check if class exists
    const existingKelas = await prisma.kelas.findUnique({
      where: { id }
    })

    if (!existingKelas) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (nama !== undefined) updateData.nama = nama
    if (tingkat !== undefined) updateData.tingkat = tingkat
    if (tahunAjaran !== undefined) updateData.tahunAjaran = tahunAjaran
    if (guruId !== undefined) updateData.guruId = guruId

    const kelas = await prisma.kelas.update({
      where: { id },
      data: updateData,
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: kelas })
  } catch (error) {
    console.error("Error updating kelas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update class" },
      { status: 500 }
    )
  }
}

// DELETE - Delete class
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if class exists
    const existingKelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        siswa: true
      }
    })

    if (!existingKelas) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      )
    }

    // Check if class has students
    if (existingKelas.siswa.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete class with enrolled students" 
        },
        { status: 400 }
      )
    }

    // Delete class
    await prisma.kelas.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Class deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting kelas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete class" },
      { status: 500 }
    )
  }
}
