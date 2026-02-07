import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get single material by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const materi = await prisma.materi.findUnique({
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
        kelas: {
          include: {
            siswa: {
              select: {
                nama: true
              }
            }
          }
        }
      }
    })

    if (!materi) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: materi })
  } catch (error) {
    console.error("Error fetching materi:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch material" },
      { status: 500 }
    )
  }
}

// PATCH - Update material
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      judul,
      deskripsi,
      konten,
      mataPelajaran,
      kelasId,
      fileUrl
    } = body

    // Check if material exists
    const existingMateri = await prisma.materi.findUnique({
      where: { id }
    })

    if (!existingMateri) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (judul !== undefined) updateData.judul = judul
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi
    if (konten !== undefined) updateData.konten = konten
    if (mataPelajaran !== undefined) updateData.mataPelajaran = mataPelajaran
    if (kelasId !== undefined) updateData.kelasId = kelasId
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl

    const materi = await prisma.materi.update({
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
        kelas: true
      }
    })

    return NextResponse.json({ success: true, data: materi })
  } catch (error) {
    console.error("Error updating materi:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update material" },
      { status: 500 }
    )
  }
}

// DELETE - Delete material
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if material exists
    const existingMateri = await prisma.materi.findUnique({
      where: { id }
    })

    if (!existingMateri) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      )
    }

    // Delete material
    await prisma.materi.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Material deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting materi:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete material" },
      { status: 500 }
    )
  }
}
