"use client"

import { Users, Search, Filter, Download, UserPlus, BookOpen, TrendingUp, Award, Calendar, Mail, Phone, MapPin, ChevronRight } from "lucide-react"
import { useState } from "react"

const students = [
  {
    id: 1,
    name: "Andi Pratama",
    class: "Kelas A",
    nis: "2024001",
    avatar: "AP",
    email: "andi@example.com",
    phone: "081234567890",
    parent: "Budi Pratama",
    attendance: 95,
    avgScore: 85,
    status: "active",
    specialNeeds: "Disleksia",
    joinDate: "Jan 2024"
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    class: "Kelas A",
    nis: "2024002",
    avatar: "SN",
    email: "siti@example.com",
    phone: "081234567891",
    parent: "Ahmad Nurdin",
    attendance: 92,
    avgScore: 88,
    status: "active",
    specialNeeds: "Autisme",
    joinDate: "Jan 2024"
  },
  {
    id: 3,
    name: "Budi Santoso",
    class: "Kelas B",
    nis: "2024003",
    avatar: "BS",
    email: "budi@example.com",
    phone: "081234567892",
    parent: "Santoso",
    attendance: 88,
    avgScore: 82,
    status: "active",
    specialNeeds: "ADHD",
    joinDate: "Feb 2024"
  },
  {
    id: 4,
    name: "Dewi Lestari",
    class: "Kelas B",
    nis: "2024004",
    avatar: "DL",
    email: "dewi@example.com",
    phone: "081234567893",
    parent: "Lestari Wati",
    attendance: 97,
    avgScore: 90,
    status: "active",
    specialNeeds: "Slow Learner",
    joinDate: "Jan 2024"
  },
  {
    id: 5,
    name: "Eko Prasetyo",
    class: "Kelas C",
    nis: "2024005",
    avatar: "EP",
    email: "eko@example.com",
    phone: "081234567894",
    parent: "Prasetyo",
    attendance: 90,
    avgScore: 86,
    status: "active",
    specialNeeds: "Diskalkulia",
    joinDate: "Feb 2024"
  }
]

export default function DaftarMuridPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null)

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       student.nis.includes(searchQuery)
    const matchClass = selectedClass === "all" || student.class === selectedClass
    return matchSearch && matchClass
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Daftar Murid</h1>
              <p className="text-gray-600">Kelola dan pantau perkembangan murid Anda</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Tambah Murid
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Murid</p>
                  <p className="text-3xl font-bold text-gray-800">{students.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kehadiran Rata-rata</p>
                  <p className="text-3xl font-bold text-green-600">92%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nilai Rata-rata</p>
                  <p className="text-3xl font-bold text-purple-600">86</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kelas Aktif</p>
                  <p className="text-3xl font-bold text-orange-600">3</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS murid..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
              />
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
            >
              <option value="all">Semua Kelas</option>
              <option value="Kelas A">Kelas A</option>
              <option value="Kelas B">Kelas B</option>
              <option value="Kelas C">Kelas C</option>
            </select>

            <button className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Murid</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">NIS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kelas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kebutuhan Khusus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kehadiran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nilai Rata-rata</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {student.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{student.nis}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {student.specialNeeds}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${student.attendance}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{student.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-800">{student.avgScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center gap-2"
                      >
                        Detail
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedStudent(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.name}</h2>
                      <p className="text-gray-600">{selectedStudent.nis} • {selectedStudent.class}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Kebutuhan Khusus</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.specialNeeds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tanggal Masuk</p>
                      <p className="font-semibold text-gray-800">{selectedStudent.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Status</p>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-medium text-gray-800">{selectedStudent.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Orang Tua</p>
                        <p className="font-medium text-gray-800">{selectedStudent.parent}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-green-600 mb-1">Kehadiran</p>
                    <p className="text-3xl font-bold text-green-700">{selectedStudent.attendance}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-blue-600 mb-1">Nilai Rata-rata</p>
                    <p className="text-3xl font-bold text-blue-700">{selectedStudent.avgScore}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                    <p className="text-sm text-purple-600 mb-1">Tugas Selesai</p>
                    <p className="text-3xl font-bold text-purple-700">12/15</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition">
                    Lihat Progress Detail
                  </button>
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition">
                    Chat Orang Tua
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
