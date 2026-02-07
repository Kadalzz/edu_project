"use client"

import { FileText, Plus, Search, Filter, Download, Eye, Edit, Trash2, Upload, BookOpen, Video, FileImage, File, FolderOpen, Clock, Users, GraduationCap, ClipboardList, MessageSquare, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Material {
  id: number
  title: string
  subject: string
  class: string
  type: string
  size: string
  sizeBytes: number
  downloads: number
  views: number
  createdAt: string
  description: string
}

const defaultMaterials: Material[] = [
  // Data materi akan bertambah ketika guru upload materi
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-6 h-6 text-red-500" />
    case 'video':
      return <Video className="w-6 h-6 text-blue-500" />
    case 'image':
      return <FileImage className="w-6 h-6 text-green-500" />
    default:
      return <File className="w-6 h-6 text-gray-500" />
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 text-red-700'
    case 'video':
      return 'bg-blue-100 text-blue-700'
    case 'image':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const notifications = [
  { id: 1, title: 'Tugas baru dari Andi Pratama', message: 'Matematika Kelas A', time: '5 menit lalu', unread: true },
  { id: 2, title: 'Kuis diselesaikan oleh Siti', message: 'Bahasa Indonesia', time: '20 menit lalu', unread: true },
  { id: 3, title: 'Pesan dari Orang Tua', message: 'Ibu Sarah mengirim pesan', time: '1 jam lalu', unread: false },
  { id: 4, title: 'Reminder: Meeting', message: 'Meeting dengan wali murid jam 14:00', time: '2 jam lalu', unread: false },
]

export default function MateriPage() {
  // Load materials from localStorage or use default
  const [materials, setMaterials] = useState<Material[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('materials')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing materials from localStorage:', e)
        }
      }
    }
    return defaultMaterials
  })
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Save materials to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('materials', JSON.stringify(materials))
    }
  }, [materials])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const filteredMaterials = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = selectedType === "all" || m.type === selectedType
    return matchSearch && matchType
  })
  
  // Calculate statistics
  const totalDownloads = materials.reduce((sum, m) => sum + m.downloads, 0)
  const totalViews = materials.reduce((sum, m) => sum + m.views, 0)
  const totalStorageMB = materials.reduce((sum, m) => sum + m.sizeBytes, 0) / (1024 * 1024)
  const storageText = totalStorageMB > 0 ? `${Math.round(totalStorageMB)} MB` : '0 MB'

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-green-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Guru Panel</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/guru/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/guru/murid" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Daftar Murid</span>
          </Link>
          <Link href="/guru/kuis" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Kuis & Penilaian</span>
          </Link>
          <Link href="/guru/materi" className="flex items-center px-4 py-3 text-green-600 bg-green-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/guru/chat" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Chat</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Materi Pembelajaran</h1>
            <p className="text-gray-600">Kelola dan bagikan materi pembelajaran Anda</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Upload Materi
            </button>

            {/* Notification Button with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${notif.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Materi</p>
                <p className="text-3xl font-bold text-gray-800">{materials.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Unduhan</p>
                <p className="text-3xl font-bold text-blue-600">{totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Dilihat</p>
                <p className="text-3xl font-bold text-green-600">{totalViews > 0 ? totalViews.toLocaleString() : 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-3xl font-bold text-orange-600">{storageText}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari materi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select 
                className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-600"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Semua Tipe</option>
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="image">Gambar</option>
              </select>
              <select className="px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                <option>Semua Mata Pelajaran</option>
                <option>Matematika</option>
                <option>Bahasa Indonesia</option>
                <option>Seni</option>
                <option>Keterampilan</option>
              </select>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-5 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    {getTypeIcon(material.type)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getTypeBadge(material.type)}`}>
                    {material.type}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{material.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{material.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {material.subject}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {material.class}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {material.views} views
                  </span>
                  <span className="flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    {material.downloads} unduhan
                  </span>
                  <span>{material.size}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {material.createdAt}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="Lihat">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition" title="Edit">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada materi yang ditemukan</p>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Materi Baru</h3>
            <p className="text-sm text-gray-500 mb-4">Drag & drop file atau klik untuk memilih</p>
            <p className="text-xs text-gray-400 mb-4">Mendukung: PDF, Video (MP4), Gambar (JPG, PNG) - Max 500MB</p>
            <button className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition">
              Pilih File
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
