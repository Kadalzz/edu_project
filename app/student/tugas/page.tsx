"use client"

import Link from "next/link"
import { GraduationCap, BookOpen, ClipboardList, User, Bell, LogOut, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function StudentTugasContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const [tugas, setTugas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTugas()
  }, [])

  const fetchTugas = async () => {
    try {
      setLoading(true)
      // This will fetch tugas/kuis for the student  
      const response = await fetch('/api/tugas')
      const result = await response.json()
      
      if (result.success) {
        // Filter tugas yang sudah bisa ditampilkan (tanggalTampil <= now)
        const now = new Date()
        const availableTugas = (result.data || []).filter((t: any) => {
          if (!t.tanggalTampil) return true // Jika tidak ada tanggalTampil, tampilkan
          return new Date(t.tanggalTampil) <= now
        })
        setTugas(availableTugas)
      }
    } catch (error) {
      console.error('Error fetching tugas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Aktif</span>
      case 'DRAFT':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Draft</span>
      case 'CLOSED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Ditutup</span>
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-purple-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Student</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/student/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/student/materi" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/student/tugas" className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Tugas</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Tugas</h1>
          <p className="text-gray-600">Lihat dan kerjakan tugas dari guru</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tugas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Belum ada tugas tersedia</p>
                <p className="text-gray-400 text-sm mt-2">Tugas dari guru akan muncul di sini</p>
              </div>
            ) : (
              tugas.map((item) => (
                <div key={item.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.judul}</h3>
                      <p className="text-sm text-gray-600">{item.mataPelajaran || 'Umum'}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {item.deskripsi && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.deskripsi}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {item.deadline && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        <span>Deadline: {new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                    {item.durasi && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Durasi: {item.durasi} menit</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        item.mode === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.mode === 'LIVE' ? 'Live' : 'Take Home'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/student/tugas/${item.id}${studentId ? `?studentId=${studentId}` : ''}`)}
                    disabled={item.status !== 'ACTIVE'}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {item.status === 'ACTIVE' ? 'Kerjakan Tugas' : 'Tidak Tersedia'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function StudentTugasPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-200">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    }>
      <StudentTugasContent />
    </Suspense>
  )
}
