import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// DELETE user by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { role: string }
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await context.params

    // Check if user exists and is not an admin
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Tidak dapat menghapus admin" },
        { status: 403 }
      )
    }

    // Handle deletion based on user role
    if (user.role === 'GURU') {
      // Get guru record
      const guru = await prisma.guru.findUnique({
        where: { userId: id },
        include: {
          kelas: true,
          nilai: true,
          tugas: true,
          progressReports: true,
          jadwalTemu: true,
          materi: true,
          badges: true,
        }
      })

      if (guru) {
        // Check if guru has any students in their classes
        const siswaCount = await prisma.siswa.count({
          where: { kelasId: { in: guru.kelas.map(k => k.id) } }
        })

        if (siswaCount > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Tidak dapat menghapus guru yang masih memiliki ${siswaCount} siswa di kelasnya. Pindahkan siswa terlebih dahulu.` 
            },
            { status: 400 }
          )
        }

        // Delete all related records in correct order
        await prisma.$transaction(async (tx) => {
          // Delete badges
          await tx.badge.deleteMany({ where: { guruId: guru.id } })
          
          // Delete materi
          await tx.materi.deleteMany({ where: { guruId: guru.id } })
          
          // Delete jadwal temu
          await tx.jadwalTemu.deleteMany({ where: { guruId: guru.id } })
          
          // Delete progress reports
          await tx.progressReport.deleteMany({ where: { guruId: guru.id } })
          
          // Delete tugas and related data
          const tugasList = await tx.tugas.findMany({ 
            where: { guruId: guru.id },
            select: { id: true }
          })
          for (const tugas of tugasList) {
            await tx.jawaban.deleteMany({ 
              where: { 
                hasilTugas: { tugasId: tugas.id } 
              } 
            })
            await tx.hasilTugas.deleteMany({ where: { tugasId: tugas.id } })
            await tx.pertanyaan.deleteMany({ where: { tugasId: tugas.id } })
          }
          await tx.tugas.deleteMany({ where: { guruId: guru.id } })
          
          // Delete nilai
          await tx.nilai.deleteMany({ where: { guruId: guru.id } })
          
          // Delete kelas (no students at this point)
          await tx.kelas.deleteMany({ where: { guruId: guru.id } })
          
          // Delete guru record
          await tx.guru.delete({ where: { id: guru.id } })
          
          // Delete user (this will cascade to chats, notifications, activity logs)
          await tx.user.delete({ where: { id } })
        })
      } else {
        // No guru record, just delete user
        await prisma.user.delete({ where: { id } })
      }
    } else if (user.role === 'PARENT') {
      // Check if parent has children
      const siswaCount = await prisma.siswa.count({
        where: { parentId: id }
      })

      if (siswaCount > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Tidak dapat menghapus orang tua yang masih memiliki ${siswaCount} anak terdaftar. Hapus atau pindahkan anak terlebih dahulu.` 
          },
          { status: 400 }
        )
      }

      // Delete laporan belajar rumah and related dokumentasi
      const laporanList = await prisma.laporanBelajarRumah.findMany({
        where: { parentId: id },
        select: { id: true }
      })
      
      await prisma.$transaction(async (tx) => {
        for (const laporan of laporanList) {
          await tx.dokumentasi.deleteMany({ where: { laporanId: laporan.id } })
        }
        await tx.laporanBelajarRumah.deleteMany({ where: { parentId: id } })
        
        // Delete user (this will cascade to chats, notifications, activity logs)
        await tx.user.delete({ where: { id } })
      })
    } else {
      // For other roles, just delete user
      await prisma.user.delete({ where: { id } })
    }

    return NextResponse.json({ 
      success: true, 
      message: "User berhasil dihapus" 
    })
  } catch (error: any) {
    console.error("Delete user error:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus user karena masih memiliki data terkait. Silakan hubungi administrator." },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menghapus user" },
      { status: 500 }
    )
  }
}
