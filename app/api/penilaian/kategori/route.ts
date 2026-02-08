import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Get all categories for the authenticated guru
export async function GET(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const categories = await prisma.kategoriPenilaian.findMany({
      where: { guruId: guru.id },
      orderBy: { urutan: 'asc' },
      include: {
        _count: {
          select: { nilaiKategori: true }
        }
      }
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const body = await request.json()
    const { nama, deskripsi, urutan } = body

    if (!nama) {
      return NextResponse.json(
        { success: false, error: 'Nama kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Get the next order number if not provided
    let orderNum = urutan
    if (orderNum === undefined) {
      const lastCategory = await prisma.kategoriPenilaian.findFirst({
        where: { guruId: guru.id },
        orderBy: { urutan: 'desc' }
      })
      orderNum = (lastCategory?.urutan || 0) + 1
    }

    const category = await prisma.kategoriPenilaian.create({
      data: {
        guruId: guru.id,
        nama,
        deskripsi,
        urutan: orderNum
      }
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating category:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal membuat kategori' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(request: Request) {
  try {
    const { getAuthGuru } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kategori wajib diisi' },
        { status: 400 }
      )
    }

    // Verify ownership
    const category = await prisma.kategoriPenilaian.findFirst({
      where: { id, guruId: guru.id }
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Kategori tidak ditemukan' },
        { status: 404 }
      )
    }

    await prisma.kategoriPenilaian.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Kategori berhasil dihapus' })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (error.message?.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus kategori' },
      { status: 500 }
    )
  }
}
