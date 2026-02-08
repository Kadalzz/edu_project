import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get all schedules for parent
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

    // Get all schedules (jadwal temu) for parent's children
    const jadwals = await prisma.jadwalTemu.findMany({
      where: {
        siswaId: { in: childIds }
      },
      include: {
        guru: {
          include: {
            user: { select: { name: true, email: true } }
          }
        },
        siswa: true
      },
      orderBy: { tanggal: 'desc' }
    })

    // Transform data for frontend
    const schedules = jadwals.map((j: any) => {
      const tanggal = new Date(j.tanggal)
      const now = new Date()
      const isPast = tanggal < now

      let statusDisplay = 'Akan Datang'
      if (j.status === 'COMPLETED') {
        statusDisplay = 'Selesai'
      } else if (j.status === 'REJECTED') {
        statusDisplay = 'Ditolak'
      } else if (j.status === 'PENDING') {
        statusDisplay = 'Menunggu Konfirmasi'
      } else if (j.status === 'APPROVED' && isPast) {
        statusDisplay = 'Selesai'
      } else if (j.status === 'APPROVED') {
        statusDisplay = 'Akan Datang'
      }

      return {
        id: j.id,
        title: j.topik || 'Pertemuan dengan Guru',
        childName: childMap.get(j.siswaId) || j.siswa.nama,
        childId: j.siswaId,
        date: j.tanggal.toISOString(),
        time: j.waktu,
        location: 'Sekolah',
        teacher: j.guru?.user?.name || '-',
        teacherEmail: j.guru?.user?.email || '-',
        type: 'Tatap Muka',
        status: statusDisplay,
        rawStatus: j.status,
        catatan: j.catatan
      }
    })

    return NextResponse.json({ success: true, data: schedules })
  } catch (error: any) {
    console.error('Error fetching schedules:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}

// POST - Request a new meeting schedule
export async function POST(request: Request) {
  try {
    const { requireRole } = await import('@/lib/auth')
    const user = await requireRole(['PARENT'])

    const body = await request.json()
    const { siswaId, tanggal, waktu, topik, catatan } = body

    if (!siswaId || !tanggal || !waktu) {
      return NextResponse.json(
        { success: false, error: 'siswaId, tanggal, dan waktu wajib diisi' },
        { status: 400 }
      )
    }

    // Verify parent owns this child
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        parentId: user.userId
      },
      include: {
        kelas: {
          include: {
            guru: true
          }
        }
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan atau bukan anak Anda' },
        { status: 404 }
      )
    }

    if (!siswa.kelas?.guru) {
      return NextResponse.json(
        { success: false, error: 'Guru wali kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create the schedule request
    const jadwal = await prisma.jadwalTemu.create({
      data: {
        guruId: siswa.kelas.guru.id,
        parentId: user.userId,
        siswaId,
        tanggal: new Date(tanggal),
        waktu,
        topik,
        catatan,
        status: 'PENDING'
      },
      include: {
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      }
    })

    // Create notification for guru
    try {
      await prisma.notification.create({
        data: {
          userId: siswa.kelas.guru.userId,
          title: 'Permintaan Jadwal Temu Baru',
          content: `Orang tua dari ${siswa.nama} meminta jadwal pertemuan pada ${new Date(tanggal).toLocaleDateString('id-ID')} pukul ${waktu}`,
          type: 'info',
          link: '/guru/jadwal'
        }
      })
    } catch (e) {
      console.error('Failed to create notification:', e)
    }

    return NextResponse.json({ success: true, data: jadwal }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating schedule:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal membuat jadwal' },
      { status: 500 }
    )
  }
}
