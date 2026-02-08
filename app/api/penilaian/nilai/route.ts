import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get all grades for categories
export async function GET(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get('kelasId')

    // Get categories for this guru
    const categories = await prisma.kategoriPenilaian.findMany({
      where: { guruId: guru.id },
      orderBy: { urutan: 'asc' }
    })

    // Get students - optionally filtered by class
    const whereClause: any = {}
    if (kelasId) {
      whereClause.kelasId = kelasId
    } else {
      // Get students from classes taught by this guru
      const kelasList = await prisma.kelas.findMany({
        where: { guruId: guru.id },
        select: { id: true }
      })
      whereClause.kelasId = { in: kelasList.map(k => k.id) }
    }

    const students = await prisma.siswa.findMany({
      where: whereClause,
      orderBy: { nama: 'asc' },
      include: {
        kelas: true,
        nilaiKategori: {
          where: {
            kategoriId: { in: categories.map(c => c.id) }
          }
        }
      }
    })

    // Transform data for frontend
    const data = {
      categories: categories.map(c => ({
        id: c.id,
        name: c.nama,
        deskripsi: c.deskripsi,
        urutan: c.urutan
      })),
      students: students.map(s => ({
        id: s.id,
        nama: s.nama,
        nis: s.nis || '-',
        kelas: s.kelas?.nama || '-',
        nilaiKategori: s.nilaiKategori.map(n => ({
          kategoriId: n.kategoriId,
          nilai: n.nilai
        }))
      }))
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching grades:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grades' },
      { status: 500 }
    )
  }
}

// POST - Save/update a grade
export async function POST(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const body = await request.json()
    const { siswaId, kategoriId, nilai } = body

    if (!siswaId || !kategoriId || nilai === undefined) {
      return NextResponse.json(
        { success: false, error: 'siswaId, kategoriId, dan nilai wajib diisi' },
        { status: 400 }
      )
    }

    // Verify category belongs to this guru
    const category = await prisma.kategoriPenilaian.findFirst({
      where: { id: kategoriId, guruId: guru.id }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    // Upsert the grade
    const grade = await prisma.nilaiKategori.upsert({
      where: {
        siswaId_kategoriId: { siswaId, kategoriId }
      },
      update: {
        nilai: parseFloat(nilai)
      },
      create: {
        siswaId,
        kategoriId,
        nilai: parseFloat(nilai)
      }
    })

    return NextResponse.json({ success: true, data: grade })
  } catch (error: any) {
    console.error('Error saving grade:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan nilai' },
      { status: 500 }
    )
  }
}

// PUT - Bulk save grades
export async function PUT(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const body = await request.json()
    const { grades } = body // Array of { siswaId, kategoriId, nilai }

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { success: false, error: 'grades array wajib diisi' },
        { status: 400 }
      )
    }

    // Get category IDs that belong to this guru
    const guruCategories = await prisma.kategoriPenilaian.findMany({
      where: { guruId: guru.id },
      select: { id: true }
    })
    const validCategoryIds = new Set(guruCategories.map(c => c.id))

    // Filter only valid grades
    const validGrades = grades.filter((g: any) => validCategoryIds.has(g.kategoriId))

    // Upsert all grades
    const results = await Promise.all(
      validGrades.map((g: any) =>
        prisma.nilaiKategori.upsert({
          where: {
            siswaId_kategoriId: { siswaId: g.siswaId, kategoriId: g.kategoriId }
          },
          update: {
            nilai: parseFloat(g.nilai)
          },
          create: {
            siswaId: g.siswaId,
            kategoriId: g.kategoriId,
            nilai: parseFloat(g.nilai)
          }
        })
      )
    )

    return NextResponse.json({ success: true, data: { saved: results.length } })
  } catch (error: any) {
    console.error('Error saving grades:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan nilai' },
      { status: 500 }
    )
  }
}
