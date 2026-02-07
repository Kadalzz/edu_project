import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all materials
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const guruId = searchParams.get("guruId")
    const kelasId = searchParams.get("kelasId")
    const mataPelajaran = searchParams.get("mataPelajaran")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (guruId) {
      where.guruId = guruId
    }

    if (kelasId) {
      where.kelasId = kelasId
    }

    if (mataPelajaran) {
      where.mataPelajaran = mataPelajaran
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: "insensitive" } },
        { deskripsi: { contains: search, mode: "insensitive" } }
      ]
    }

    const materi = await prisma.materi.findMany({
      where,
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
          select: {
            nama: true,
            tingkat: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: materi })
  } catch (error) {
    console.error("Error fetching materi:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch materials" },
      { status: 500 }
    )
  }
}

// POST - Create new material
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      guruId,
      kelasId,
      judul,
      deskripsi,
      konten,
      mataPelajaran,
      fileUrl,
      tipeMateri
    } = body

    // Validate required fields
    if (!guruId || !judul || !tipeMateri) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (guruId, judul, tipeMateri)" },
        { status: 400 }
      )
    }

    const materi = await prisma.materi.create({
      data: {
        guruId,
        kelasId,
        judul,
        deskripsi,
        konten,
        mataPelajaran,
        fileUrl,
        tipeMateri
      },
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

    return NextResponse.json({ success: true, data: materi }, { status: 201 })
  } catch (error) {
    console.error("Error creating materi:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create material" },
      { status: 500 }
    )
  }
}
