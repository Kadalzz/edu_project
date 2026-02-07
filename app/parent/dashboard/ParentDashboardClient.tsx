"use client"

import { Users, BookOpen, GraduationCap, TrendingUp, Calendar, Settings, Bell, LogOut, Search, FileText, MessageSquare, Award, BarChart2, Clock, User, ArrowRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useState, useRef, useEffect } from "react"
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
  recentGrades: Array<{ subject: string, grade: number, date: string }>
  recentQuizzes: Array<{ title: string, score: number, date: string }>
  weeklyAttendance: Array<{ date: string, status: string }>
}

const recentReports = [
  { title: 'Laporan Mingguan', date: '1 Feb 2026', teacher: 'Bu Sarah', status: 'new' },
  { title: 'Progress Report', date: '28 Jan 2026', teacher: 'Pak Budi', status: 'read' },
  { title: 'Perkembangan Sosial', date: '25 Jan 2026', teacher: 'Bu Sarah', status: 'read' },
]

const upcomingSchedule = [
  { event: 'Pertemuan Orang Tua', date: '5 Feb', time: '14:00', type: 'meeting' },
  { event: 'Presentasi Proyek', date: '7 Feb', time: '10:00', type: 'presentation' },
  { event: 'Evaluasi Bulanan', date: '10 Feb', time: '15:00', type: 'evaluation' },
]

const notifications = [
  { id: 1, title: 'Update Nilai Anak', message: 'Nilai kuis Matematika sudah keluar', time: '10 menit lalu', unread: true },
  { id: 2, title: 'Pesan dari Guru', message: 'Guru mengirim pesan tentang perkembangan anak', time: '30 menit lalu', unread: true },
  { id: 3, title: 'Reminder: Meeting', message: 'Meeting dengan guru besok jam 14:00', time: '1 jam lalu', unread: false },
  { id: 4, title: 'Tugas Baru', message: 'Anak mendapat tugas baru untuk dikerjakan', time: '2 jam lalu', unread: false },
]

interface Props {
  userName: string
  userId: string
}

export default function ParentDashboardClient({ userName, userId }: Props) {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
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
        if (result.data.length > 0) {
          setSelectedChild(result.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate progress data from selected child
  const progressData = selectedChild?.weeklyAttendance.map((att, idx) => {
    const grades = selectedChild.recentGrades.slice(0, 7)
    return {
      name: new Date(att.date).toLocaleDateString('en-US', { weekday: 'short' }),
      nilai: grades[idx]?.grade || 0,
      tugas: selectedChild.assignmentsCompleted > 0 ? Math.round((selectedChild.assignmentsCompleted / selectedChild.totalAssignments) * 100) : 0,
      kehadiran: att.status === 'hadir' ? 100 : 0
    }
  }) || []

  // Generate skills data from recent grades
  const skillsData = selectedChild?.recentGrades.slice(0, 6).map(g => ({
    subject: g.subject,
    nilai: g.grade
  })) || []

  const recentReports = [
    { title: 'Laporan Mingguan', date: '1 Feb 2026', teacher: selectedChild?.guruNama || 'Bu Sarah', status: 'new' as const },
    { title: 'Progress Report', date: '28 Jan 2026', teacher: selectedChild?.guruNama || 'Pak Budi', status: 'read' as const },
  ]

  const upcomingSchedule = [
    { event: 'Pertemuan Orang Tua', date: '5 Feb', time: '14:00', type: 'meeting' },
    { event: 'Evaluasi Bulanan', date: '10 Feb', time: '15:00', type: 'evaluation' },
  ]

  const notifications = [
    { id: 1, title: 'Update Nilai Anak', message: 'Nilai kuis sudah keluar', time: '10 menit lalu', unread: true },
    { id: 2, title: 'Pesan dari Guru', message: 'Guru mengirim pesan', time: '30 menit lalu', unread: true },
  ]

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
          <a href="#" className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Anak Saya</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Laporan Belajar</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Chat Guru</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Jadwal Temu</span>
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-purple-800 mb-2">Mode Siswa</p>
            <a href="/student/dashboard" className="flex items-center justify-between text-purple-600 hover:text-purple-700">
              <span className="text-sm font-medium">Switch Mode</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
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
                placeholder="search reports or activities"
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-orange-300 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl">
              <img src="https://ui-avatars.com/api/?name=Parent&background=f97316&color=fff" alt="Parent" className="w-8 h-8 rounded-full" />
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
            {/* Children Overview */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Anak Saya</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : children.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data anak terdaftar
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {children.map((child) => {
                    const initials = child.nama.split(' ').map(n => n[0]).join('').substring(0, 2)
                    return (
                      <div 
                        key={child.id} 
                        className={`bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-5 shadow-sm border transition ${
                          selectedChild?.id === child.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-orange-100'
                        }`}
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => setSelectedChild(child)}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{child.nama}</p>
                              <p className="text-xs text-gray-600">{child.kelas}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div className="bg-white/80 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Kehadiran</p>
                              <p className="text-lg font-bold text-green-600">{child.attendance}%</p>
                            </div>
                            <div className="bg-white/80 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Nilai</p>
                              <p className="text-lg font-bold text-blue-600">{child.avgGrade}</p>
                            </div>
                            <div className="bg-white/80 rounded-lg p-2">
                              <p className="text-xs text-gray-600">Tugas</p>
                              <p className="text-lg font-bold text-purple-600">{child.assignmentsCompleted}/{child.totalAssignments}</p>
                            </div>
                          </div>
                        </div>
                        <Link 
                          href={`/student/dashboard?studentId=${child.id}`}
                          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-center text-sm font-medium hover:from-orange-600 hover:to-pink-600 transition shadow-md block"
                        >
                          Lihat Dashboard Siswa
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Progress Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Progress Belajar Minggu Ini</h3>
                {children.length > 1 && (
                  <select 
                    className="px-4 py-2 bg-orange-50 rounded-xl text-sm font-medium text-orange-600 border-0 focus:ring-2 focus:ring-orange-300"
                    value={selectedChild?.id || ''}
                    onChange={(e) => {
                      const child = children.find(c => c.id === e.target.value)
                      if (child) setSelectedChild(child)
                    }}
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>{child.nama}</option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedChild && progressData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nilai" stroke="#f97316" strokeWidth={2} name="Nilai" />
                      <Line type="monotone" dataKey="tugas" stroke="#8b5cf6" strokeWidth={2} name="Tugas" />
                      <Line type="monotone" dataKey="kehadiran" stroke="#10b981" strokeWidth={2} name="Kehadiran" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Belum ada data progress
                </div>
              )}
            </div>

            {/* Skills Radar */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Kemampuan per Mata Pelajaran</h3>
              {selectedChild && skillsData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={skillsData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" style={{ fontSize: '12px' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Nilai" dataKey="nilai" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  Belum ada data nilai per mata pelajaran
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center shadow-lg">
                <Award className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xs text-blue-600 font-medium mb-1">Achievement</p>
                <p className="text-2xl font-bold text-blue-700">{selectedChild?.badges || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-blue-600 font-medium mb-1">Pesan Guru</p>
                <p className="text-2xl font-bold text-blue-700">0</p>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">Laporan Terbaru</h4>
              <div className="space-y-3">
                {recentReports.map((report, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${
                    report.status === 'new' ? 'bg-orange-50 border-l-4 border-orange-500' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{report.title}</p>
                        <p className="text-xs text-gray-600 mt-1">oleh {report.teacher}</p>
                      </div>
                      {report.status === 'new' && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">NEW</span>
                      )}
                    </div>
                    <div className="flex items-center mt-2">
                      <Calendar className="w-3 h-3 text-gray-500 mr-1" />
                      <p className="text-xs text-gray-600">{report.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition">
                Lihat Semua Laporan
              </button>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">Jadwal Mendatang</h4>
              <div className="space-y-3">
                {upcomingSchedule.map((schedule, idx) => (
                  <div key={idx} className="flex items-start space-x-3 bg-pink-50 rounded-xl p-3">
                    <div className="w-12 h-12 bg-pink-500 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                      <p className="text-xs font-medium">{schedule.date.split(' ')[0]}</p>
                      <p className="text-xs">{schedule.date.split(' ')[1]}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{schedule.event}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 text-gray-500 mr-1" />
                        <p className="text-xs text-gray-600">{schedule.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      className={`p-2 rounded-lg ${
                        date === 3 ? 'bg-orange-500 text-white font-bold' : 
                        [5, 7, 10].includes(date) && idx >= 7 && idx <= 31 ? 'bg-pink-100 text-pink-600' :
                        date > 28 && idx < 7 ? 'text-gray-300' : 
                        idx > 31 ? 'text-gray-300' : 
                        'text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      {date}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-pink-100 rounded mr-1"></div>
                    <span className="text-gray-600">Ada Jadwal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
