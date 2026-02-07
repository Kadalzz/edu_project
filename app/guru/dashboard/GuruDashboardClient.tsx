"use client"

import { Users, BookOpen, GraduationCap, TrendingUp, Calendar, Settings, Bell, LogOut, Search, ClipboardList, MessageSquare, FileText, Award, BarChart2, Clock } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const notifications = [
  { id: 1, title: 'Tugas baru dari Andi Pratama', message: 'Matematika', time: '5 menit lalu', unread: true },
  { id: 2, title: 'Kuis diselesaikan oleh Siti', message: 'Bahasa Indonesia', time: '20 menit lalu', unread: true },
  { id: 3, title: 'Pesan dari Orang Tua', message: 'Ibu Sarah mengirim pesan', time: '1 jam lalu', unread: false },
  { id: 4, title: 'Reminder: Meeting', message: 'Meeting dengan wali murid jam 14:00', time: '2 jam lalu', unread: false },
]

interface Props {
  userName: string
}

export default function GuruDashboardClient({ userName }: Props) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalKuis: 0,
    totalMateri: 0,
    avgKehadiran: 0
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch students
      const siswaRes = await fetch('/api/siswa')
      const siswaData = await siswaRes.json()
      const students = siswaData.data || []
      
      // Calculate stats
      const totalSiswa = students.length
      
      // Get materials count from localStorage (temporary until API available)
      const savedMaterials = localStorage.getItem('materials')
      const materials = savedMaterials ? JSON.parse(savedMaterials) : []
      const totalMateri = materials.length
      
      // Get quiz count from localStorage
      const savedQuizzes = localStorage.getItem('quizList')
      const quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : []
      const totalKuis = quizzes.length
      
      // Calculate average attendance
      let avgKehadiran = 0
      if (students.length > 0) {
        const totalAttendance = students.reduce((sum: number, s: any) => {
          if (s.absensi && s.absensi.length > 0) {
            const hadirCount = s.absensi.filter((a: any) => a.status === 'hadir').length
            return sum + (hadirCount / s.absensi.length) * 100
          }
          return sum + 100 // default if no attendance data
        }, 0)
        avgKehadiran = Math.round(totalAttendance / students.length)
      }
      
      // Build recent activities from students
      const activities = students.slice(0, 3).map((s: any) => {
        const initials = s.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        return {
          siswa: s.nama,
          activity: `Terdaftar dengan kebutuhan khusus ${s.kebutuhanKhusus || 'khusus'}`,
          time: new Date(s.createdAt).toLocaleDateString('id-ID'),
          avatar: initials
        }
      })
      
      // Generate weekly data (simplified)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const weekData = days.map(name => ({
        name,
        kehadiran: Math.round(avgKehadiran * (0.9 + Math.random() * 0.2)),
        kuis: Math.round(totalKuis * (0.6 + Math.random() * 0.4)),
        tugas: Math.round(totalMateri * (0.7 + Math.random() * 0.3))
      }))
      
      setStats({
        totalSiswa,
        totalKuis,
        totalMateri,
        avgKehadiran
      })
      setRecentActivities(activities)
      setWeeklyData(weekData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <Link href="/guru/dashboard" className="flex items-center px-4 py-3 text-green-600 bg-green-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-green-600" />
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
          <Link href="/guru/materi" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
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
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="search student or class"
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl">
              <img src="https://ui-avatars.com/api/?name=Guru&background=10b981&color=fff" alt="Guru" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
            
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Selamat Datang, {userName}!</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-5 shadow-sm">
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <p className="text-sm text-blue-600 font-medium">Total Siswa</p>
                  <p className="text-3xl font-bold text-blue-700">{loading ? '-' : stats.totalSiswa}</p>
                  <p className="text-xs text-blue-500 mt-1">1 kelas aktif</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-5 shadow-sm">
                  <FileText className="w-8 h-8 text-green-600 mb-3" />
                  <p className="text-sm text-green-600 font-medium">Materi Tersedia</p>
                  <p className="text-3xl font-bold text-green-700">{loading ? '-' : stats.totalMateri}</p>
                  <p className="text-xs text-green-500 mt-1">{stats.totalMateri > 0 ? 'Siap digunakan' : 'Belum ada materi'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-5 shadow-sm">
                  <Award className="w-8 h-8 text-purple-600 mb-3" />
                  <p className="text-sm text-purple-600 font-medium">Kuis Tersedia</p>
                  <p className="text-3xl font-bold text-purple-700">{loading ? '-' : stats.totalKuis}</p>
                  <p className="text-xs text-purple-500 mt-1">{loading ? '-' : `Rata-rata kehadiran ${stats.avgKehadiran}%`}</p>
                </div>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Aktivitas Kelas Minggu Ini</h3>
              </div>
              
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Memuat data...</p>
                  </div>
                </div>
              ) : weeklyData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="kehadiran" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Kehadiran" />
                      <Line type="monotone" dataKey="tugas" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Materi" />
                      <Line type="monotone" dataKey="kuis" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Kuis" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Belum ada data aktivitas</p>
                </div>
              )}
            </div>

            {/* Quick Info Cards */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Ringkasan Cepat</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Total Murid</p>
                      <p className="text-xs text-gray-500">Terdaftar aktif</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{loading ? '-' : stats.totalSiswa}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Materi Pembelajaran</p>
                      <p className="text-xs text-gray-500">Tersedia untuk murid</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{loading ? '-' : stats.totalMateri}</p>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Kuis & Penilaian</p>
                      <p className="text-xs text-gray-500">Total kuis dibuat</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{loading ? '-' : stats.totalKuis}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 text-center shadow-lg">
                <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-orange-600 font-medium mb-1">Kehadiran</p>
                <p className="text-2xl font-bold text-orange-700">{loading ? '-' : `${stats.avgKehadiran}%`}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-pink-600 font-medium mb-1">Chat Aktif</p>
                <p className="text-2xl font-bold text-pink-700">-</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">Aksi Cepat</h4>
              <div className="space-y-3">
                <Link href="/guru/murid" className="block">
                  <div className="p-4 rounded-xl bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100 transition">
                    <p className="text-sm font-semibold text-gray-800">Lihat Daftar Murid</p>
                    <p className="text-xs text-gray-600 mt-1">Kelola data murid Anda</p>
                  </div>
                </Link>
                <Link href="/guru/kuis" className="block">
                  <div className="p-4 rounded-xl bg-purple-50 border-l-4 border-purple-500 hover:bg-purple-100 transition">
                    <p className="text-sm font-semibold text-gray-800">Buat Kuis Baru</p>
                    <p className="text-xs text-gray-600 mt-1">Tambah kuis & penilaian</p>
                  </div>
                </Link>
                <Link href="/guru/materi" className="block">
                  <div className="p-4 rounded-xl bg-green-50 border-l-4 border-green-500 hover:bg-green-100 transition">
                    <p className="text-sm font-semibold text-gray-800">Upload Materi</p>
                    <p className="text-xs text-gray-600 mt-1">Tambah materi pembelajaran</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">Aktivitas Terbaru</h4>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Memuat...</p>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-3 bg-green-50 rounded-xl p-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {activity.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{activity.siswa}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.activity}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Belum ada aktivitas</p>
                  <p className="text-xs text-gray-400 mt-1">Aktivitas akan muncul saat ada murid yang mendaftar</p>
                </div>
              )}
            </div>

            {/* Mini Calendar */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="text-center">
                <h4 className="font-bold text-gray-800 mb-4">Februari 2026</h4>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="font-semibold text-gray-500">{day}</div>
                  ))}
                  {[30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 1, 2, 3, 4].map((date, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg ${date === 3 ? 'bg-green-500 text-white font-bold' : date > 28 && idx < 7 ? 'text-gray-300' : idx > 31 ? 'text-gray-300' : 'text-gray-700 hover:bg-green-100'}`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
