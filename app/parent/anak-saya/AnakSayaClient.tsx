"use client"

import Link from "next/link"
import { Users, BookOpen, User, FileText, MessageSquare, Calendar, LogOut, ArrowRight, Award, TrendingUp, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Child {
  id: string
  nama: string
  nis: string
  kelas: string
  guruNama: string
  attendance: number
  avgGrade: number
  assignmentsCompleted: number
  totalAssignments: number
  badges: number
  kebutuhanKhusus: string | null
}

interface Props {
  userName: string
  userId: string
}

export default function AnakSayaClient({ userName, userId }: Props) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchChildren()
  }, [userId])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parent/children?parentId=${userId}`)
      const result = await response.json()
      
      if (result.success) {
        setChildren(result.data)
      }
    } catch (error) {
      console.error('Error fetching children:', error)
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-orange-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Portal</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/parent/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/parent/anak-saya" className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-medium">Anak Saya</span>
          </Link>
          <Link href="/parent/laporan" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Laporan Belajar</span>
          </Link>
          <Link href="/parent/chat" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Chat Guru</span>
          </Link>
          <Link href="/parent/jadwal" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Jadwal Temu</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-purple-800 mb-2">Mode Siswa</p>
            <Link href="/student/dashboard" className="flex items-center justify-between text-purple-600 hover:text-purple-700">
              <span className="text-sm font-medium">Switch Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Anak Saya</h1>
          <p className="text-gray-600 mt-1">Informasi lengkap tentang anak-anak Anda</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data anak terdaftar</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {children.map((child) => {
              const initials = child.nama.split(' ').map(n => n[0]).join('').substring(0, 2)
              return (
                <div key={child.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-orange-100">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{child.nama}</h3>
                      <p className="text-sm text-gray-600">NIS: {child.nis}</p>
                      <p className="text-sm text-gray-600">Kelas: {child.kelas}</p>
                      <p className="text-sm text-gray-600">Wali Kelas: {child.guruNama}</p>
                    </div>
                  </div>

                  {child.kebutuhanKhusus && (
                    <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Kebutuhan Khusus:</p>
                      <p className="text-sm text-blue-900">{child.kebutuhanKhusus}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <p className="text-xs text-green-600 font-medium">Kehadiran</p>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{child.attendance}%</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-600 mr-1" />
                        <p className="text-xs text-blue-600 font-medium">Nilai</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">{child.avgGrade}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-4 h-4 text-purple-600 mr-1" />
                        <p className="text-xs text-purple-600 font-medium">Badges</p>
                      </div>
                      <p className="text-2xl font-bold text-purple-700">{child.badges}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      href={`/student/dashboard?studentId=${child.id}`}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-center text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition shadow-md"
                    >
                      Dashboard Siswa
                    </Link>
                    <Link 
                      href={`/parent/laporan?childId=${child.id}`}
                      className="px-4 py-3 bg-white border-2 border-orange-300 text-orange-600 rounded-xl text-center text-sm font-medium hover:bg-orange-50 transition"
                    >
                      Lihat Laporan
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
