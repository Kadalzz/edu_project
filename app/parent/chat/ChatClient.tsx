"use client"

import Link from "next/link"
import { Users, BookOpen, User, FileText, MessageSquare, Calendar, ArrowRight, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  userName: string
  userId: string
}

export default function ChatClient({ userName, userId }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState('')

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
          <Link href="/parent/laporan" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Laporan Belajar</span>
          </Link>
          <Link href="/parent/chat" className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-orange-600" />
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
      <main className="flex-1 flex flex-col p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chat dengan Guru</h1>
          <p className="text-gray-600 mt-1">Komunikasi langsung dengan wali kelas</p>
        </div>

        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-100 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                G
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Guru Wali Kelas</h3>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Example messages */}
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-md">
                  <p className="text-sm text-gray-800">Selamat pagi Bapak/Ibu. Bagaimana kabar anak Anda hari ini?</p>
                  <p className="text-xs text-gray-500 mt-1">08:30</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-md">
                  <p className="text-sm text-white">Pagi Bu. Alhamdulillah baik. Terima kasih Bu.</p>
                  <p className="text-xs text-orange-100 mt-1">08:32</p>
                </div>
              </div>

              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Mulai percakapan dengan guru</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition shadow-md flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span className="font-medium">Kirim</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
