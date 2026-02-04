"use client"

import { Users, BookOpen, GraduationCap, TrendingUp, Calendar, Settings, Bell, LogOut, Search, UserCheck, UserX, Clock } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const weeklyData = [
  { name: 'Sun', kehadiran: 85, nilai: 78, aktivitas: 65 },
  { name: 'Mon', kehadiran: 92, nilai: 85, aktivitas: 88 },
  { name: 'Tue', kehadiran: 78, nilai: 82, aktivitas: 75 },
  { name: 'Wed', kehadiran: 95, nilai: 88, aktivitas: 92 },
  { name: 'Thu', kehadiran: 88, nilai: 90, aktivitas: 85 },
  { name: 'Fri', kehadiran: 82, nilai: 79, aktivitas: 78 },
  { name: 'Sat', kehadiran: 70, nilai: 75, aktivitas: 68 },
]

const pieData = [
  { name: 'Hadir', value: 142, color: '#8b5cf6' },
  { name: 'Izin', value: 10, color: '#ec4899' },
  { name: 'Sakit', value: 4, color: '#f59e0b' },
]

const topPrograms = [
  { name: 'Matematika', icon: '📊', color: 'bg-blue-500' },
  { name: 'Terapi Wicara', icon: '💬', color: 'bg-purple-500' },
  { name: 'Seni & Kreativitas', icon: '🎨', color: 'bg-pink-500' },
]

const birthdays = [
  { name: 'Andi Pratama', class: 'Kelas A' },
]

const holidays = [
  { name: 'Sarah', status: 'Sakit', date: 'Hari ini', color: 'text-red-500' },
  { name: 'Budi', status: 'Izin keluarga', date: '2-4 Feb', color: 'text-orange-500' },
]

interface Props {
  userName: string
}

export default function AdminDashboardClient({ userName }: Props) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-purple-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Management</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Attendance</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Siswa</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Analytics</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Report Attendance</span>
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Settings</span>
          </a>
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
                placeholder="search student"
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl">
              <img src="https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff" alt="Admin" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">{userName}</span>
            </div>
            <button className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome Admin!</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Total Students with Pie Chart */}
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Siswa</p>
                      <p className="text-4xl font-bold text-gray-800">156</p>
                      <p className="text-xs text-purple-600 mt-1">12 siswa baru</p>
                    </div>
                    <div className="w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={40}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Top Programs */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 font-medium">Top Programs</p>
                  {topPrograms.map((program, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-white/80 rounded-xl p-3 shadow-sm">
                      <div className={`w-10 h-10 ${program.color} rounded-lg flex items-center justify-center text-xl`}>
                        {program.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{program.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Weekly Activity</h3>
                <select className="px-4 py-2 bg-purple-50 rounded-xl text-sm font-medium text-purple-600 border-0 focus:ring-2 focus:ring-purple-300">
                  <option>Februari, 1 - 7</option>
                </select>
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kehadiran" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="nilai" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="aktivitas" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex items-center justify-center space-x-8 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Kehadiran</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Nilai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Aktivitas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 text-center shadow-lg">
                <UserCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-blue-600 font-medium mb-1">Attendance</p>
                <p className="text-2xl font-bold text-blue-700">142</p>
              </div>
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center shadow-lg">
                <Clock className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-xs text-pink-600 font-medium mb-1">Late</p>
                <p className="text-2xl font-bold text-pink-700">10</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center shadow-lg">
                <UserX className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-purple-600 font-medium mb-1">Absent</p>
                <p className="text-2xl font-bold text-purple-700">4</p>
              </div>
            </div>

            {/* Birthday Notification */}
            {birthdays.map((person, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 text-6xl opacity-20">🎈</div>
                <img src="https://ui-avatars.com/api/?name=Andi+Pratama&background=8b5cf6&color=fff" alt={person.name} className="w-12 h-12 rounded-full border-4 border-white shadow-lg mb-3" />
                <h4 className="font-bold text-gray-800 text-lg">{person.name}</h4>
                <p className="text-sm text-gray-600 mb-2">Has birthday today</p>
                <button className="w-full py-2 bg-white rounded-xl font-medium text-purple-600 hover:bg-purple-50 transition shadow-sm">
                  Wish Him 🎉
                </button>
              </div>
            ))}

            {/* Students on Holiday */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <h4 className="font-bold text-gray-800 mb-4">Siswa Tidak Hadir</h4>
              <div className="space-y-3">
                {holidays.map((student, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-purple-50 rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <img src={`https://ui-avatars.com/api/?name=${student.name}&background=random`} alt={student.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.status}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${student.color}`}>{student.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Calendar */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="text-center">
                <h4 className="font-bold text-gray-800 mb-4">Februari</h4>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="font-semibold text-gray-500">{day}</div>
                  ))}
                  {[30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 1, 2, 3, 4].map((date, idx) => (
                    <div 
                      key={idx} 
                      className={`p-2 rounded-lg ${date === 3 ? 'bg-purple-500 text-white font-bold' : date > 28 && idx < 7 ? 'text-gray-300' : idx > 31 ? 'text-gray-300' : 'text-gray-700 hover:bg-purple-100'}`}
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
