"use client"

import Link from "next/link"
import { Users, BookOpen, User, FileText, MessageSquare, Calendar, LogOut, ArrowRight, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  userName: string
  userId: string
}

export default function LaporanClient({ userName, userId }: Props) {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])

  // TODO: Fetch reports from API
  // const fetchReports = async () => {
  //   const response = await fetch(`/api/parent/reports?parentId=${userId}`)
  //   const data = await response.json()
  //   setReports(data)
  // }

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
          <Link href="/parent/anak-saya" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Anak Saya</span>
          </Link>
          <Link href="/parent/laporan" className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-orange-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Laporan Belajar</h1>
          <p className="text-gray-600 mt-1">Laporan perkembangan belajar anak Anda</p>
        </div>

        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-orange-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{report.title}</h3>
                    {report.status === 'Baru' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                        BARU
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Siswa: {report.childName}</p>
                  <p className="text-sm text-gray-500">Tanggal: {new Date(report.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                    {report.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-orange-100 hover:bg-orange-200 rounded-xl transition">
                    <Eye className="w-5 h-5 text-orange-600" />
                  </button>
                  <button className="p-3 bg-green-100 hover:bg-green-200 rounded-xl transition">
                    <Download className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada laporan tersedia</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
