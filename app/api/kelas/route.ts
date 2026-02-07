import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all classes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const guruId = searchParams.get("guruId")
    const tingkat = searchParams.get("tingkat")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (guruId) {
      where.guruId = guruId
    }

    if (tingkat) {
      where.tingkat = tingkat
    }

    if (search) {
      where.nama = { contains: search, mode: "insensitive" }
    }

    const kelas = await prisma.kelas.findMany({
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
        siswa: {
          select: {
            nama: true
          }
        },
        _count: {
          select: {
            siswa: true,
            kuis: true,
            materi: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: kelas })
  } catch (error) {
    console.error("Error fetching kelas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

// POST - Create new class
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guruId, nama, tingkat, tahunAjaran } = body

    // Validate required fields
    if (!guruId || !nama || !tingkat) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (guruId, nama, tingkat)" },
        { status: 400 }
      )
    }

    const kelas = await prisma.kelas.create({
      data: {
        guruId,
        nama,
        tingkat,
        tahunAjaran
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
        }
      }
    })

    return NextResponse.json({ success: true, data: kelas }, { status: 201 })
  } catch (error) {
    console.error("Error creating kelas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create class" },
      { status: 500 }
    )
  }
}
