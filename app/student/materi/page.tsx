"use client"

import Link from "next/link"
import { GraduationCap, BookOpen, ClipboardList, FileText, Video, Link as LinkIcon, Download, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentMateriPage() {
  const router = useRouter()
  const [materi, setMateri] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMateri()
  }, [])

  const fetchMateri = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/materi')
      const result = await response.json()
      
      if (result.success) {
        setMateri(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching materi:', error)
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

  const getMateriIcon = (tipe: string) => {
    switch (tipe) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'video':
        return <Video className="w-6 h-6 text-blue-500" />
      case 'link':
        return <LinkIcon className="w-6 h-6 text-green-500" />
      default:
        return <BookOpen className="w-6 h-6 text-purple-500" />
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
          <Link href="/student/materi" className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/student/tugas" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-gray-600" />
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Materi Pembelajaran</h1>
          <p className="text-gray-600">Akses materi yang dibagikan oleh guru</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materi.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Belum ada materi tersedia</p>
                <p className="text-gray-400 text-sm mt-2">Materi dari guru akan muncul di sini</p>
              </div>
            ) : (
              materi.map((item) => (
                <div key={item.id} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mr-4">
                      {getMateriIcon(item.tipeMateri)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.judul}</h3>
                      <p className="text-sm text-gray-600">{item.mataPelajaran || 'Umum'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {item.deskripsi && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.deskripsi}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      item.tipeMateri === 'pdf' ? 'bg-red-100 text-red-700' :
                      item.tipeMateri === 'video' ? 'bg-blue-100 text-blue-700' :
                      item.tipeMateri === 'link' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {item.tipeMateri === 'pdf' ? 'PDF' :
                       item.tipeMateri === 'video' ? 'Video' :
                       item.tipeMateri === 'link' ? 'Link' : 'Teks'}
                    </span>
                    
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                      >
                        {item.tipeMateri === 'link' ? (
                          <>
                            <LinkIcon className="w-4 h-4" />
                            Buka
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Unduh
                          </>
                        )}
                      </a>
                    ) : (
                      <button
                        onClick={() => router.push(`/student/materi/${item.id}`)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
