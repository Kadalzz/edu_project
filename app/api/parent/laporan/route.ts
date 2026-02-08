import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get all reports for parent's children
export async function GET(request: Request) {
  try {
    const { requireRole } = await import('@/lib/auth')
    const user = await requireRole(['PARENT'])

    // Get all children for this parent
    const children = await prisma.siswa.findMany({
      where: { parentId: user.userId },
      select: { id: true, nama: true }
    })

    const childIds = children.map(c => c.id)
    const childMap = new Map(children.map(c => [c.id, c.nama]))

    // Get progress reports from teachers
    const progressReports = await prisma.progressReport.findMany({
      where: {
        siswaId: { in: childIds }
      },
      include: {
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get home learning reports (laporan belajar rumah)
    const laporanBelajar = await prisma.laporanBelajarRumah.findMany({
      where: {
        siswaId: { in: childIds }
      },
      include: {
        dokumentasi: true
      },
      orderBy: { tanggal: 'desc' }
    })

    // Transform data
    const reports = [
      ...progressReports.map((r: any) => ({
        id: r.id,
        title: r.judulLaporan,
        childName: childMap.get(r.siswaId) || '-',
        childId: r.siswaId,
        date: r.createdAt.toISOString(),
        type: 'Laporan Guru',
        status: 'Baru',
        content: r.catatan,
        periode: r.periode,
        perkembangan: r.perkembangan,
        guruName: r.guru?.user?.name || '-'
      })),
      ...laporanBelajar.map((l: any) => ({
        id: l.id,
        title: `Laporan Belajar - ${l.materi}`,
        childName: childMap.get(l.siswaId) || '-',
        childId: l.siswaId,
        date: l.tanggal.toISOString(),
        type: 'Laporan Rumah',
        status: 'Tersimpan',
        content: l.catatan,
        durasi: l.durasi,
        materi: l.materi,
        kendala: l.kendala,
        mood: l.mood,
        dokumentasi: l.dokumentasi.map((d: any) => ({
          id: d.id,
          fileName: d.fileName,
          fileUrl: d.fileUrl,
          fileType: d.fileType
        }))
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ success: true, data: reports })
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST - Create a new home learning report
export async function POST(request: Request) {
  try {
    const { requireRole } = await import('@/lib/auth')
    const user = await requireRole(['PARENT'])

    const body = await request.json()
    const { siswaId, materi, durasi, kendala, catatan, mood, dokumentasi } = body

    if (!siswaId || !materi) {
      return NextResponse.json(
        { success: false, error: 'siswaId dan materi wajib diisi' },
        { status: 400 }
      )
    }

    // Verify parent owns this child
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        parentId: user.userId
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan atau bukan anak Anda' },
        { status: 404 }
      )
    }

    // Create the report
    const laporan = await prisma.laporanBelajarRumah.create({
      data: {
        siswaId,
        parentId: user.userId,
        materi,
        durasi: durasi ? parseInt(durasi) : null,
        kendala,
        catatan,
        mood,
        dokumentasi: dokumentasi?.length > 0 ? {
          create: dokumentasi.map((d: any) => ({
            fileName: d.fileName,
            fileUrl: d.fileUrl,
            fileType: d.fileType,
            fileSize: d.fileSize
          }))
        } : undefined
      },
      include: {
        dokumentasi: true
      }
    })

    return NextResponse.json({ success: true, data: laporan }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating report:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal membuat laporan' },
      { status: 500 }
    )
  }
}
