"use client"

import Link from "next/link"
import { BookOpen, LogOut, ClipboardList, FileText, Award, BarChart3 } from "lucide-react"

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <span className="text-xl font-bold">EduSpecial</span>
        </div>

        <nav className="space-y-2">
          <Link href="/student/dashboard" className="flex items-center gap-3 px-4 py-3 text-purple-600 bg-purple-50 rounded-lg">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/student/quiz" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <ClipboardList className="h-5 w-5" />
            <span className="font-medium">Kuis</span>
          </Link>
          <Link href="/student/materi" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5" />
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/student/nilai" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Nilai Saya</span>
          </Link>
          <Link href="/student/achievements" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Award className="h-5 w-5" />
            <span className="font-medium">Achievement</span>
          </Link>
        </nav>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900 mb-2">Switch Mode</p>
          <Link href="/parent/dashboard" className="block w-full px-4 py-2 bg-white text-purple-600 rounded-lg text-center text-sm font-medium hover:bg-purple-100 transition">
            Mode Orang Tua
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="text-gray-600 mt-1">Halo! Ayo semangat belajar hari ini 🎉</p>
        </div>

        {/* Student Profile Card */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
              👦
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pilih Profil Siswa</h2>
              <p className="text-purple-100">Belum ada data siswa</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-gray-600 text-sm">Kuis Pending</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-gray-600 text-sm">Materi Baru</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">-</h3>
            <p className="text-gray-600 text-sm">Rata-rata Nilai</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-gray-600 text-sm">Badges</p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kuis Hari Ini</h2>
            <p className="text-gray-500 text-center py-8">Tidak ada kuis aktif</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Materi Terbaru</h2>
            <p className="text-gray-500 text-center py-8">Belum ada materi</p>
          </div>
        </div>
      </main>
    </div>
  )
}
