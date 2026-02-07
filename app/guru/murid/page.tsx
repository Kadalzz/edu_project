"use client"

import { Users, Search, Filter, Download, UserPlus, BookOpen, TrendingUp, Award, Calendar, Mail, Phone, MapPin, ChevronRight, Trash2, Edit } from "lucide-react"
import { useState, useEffect } from "react"

interface Student {
  id: number
  originalId: string // Store the actual cuid from database
  name: string
  nis: string
  avatar: string
  email: string
  phone: string
  parent: string
  attendance: number
  avgScore: number
  status: string
  specialNeeds: string
  joinDate: string
}

const defaultStudents: Student[] = [
  // Data murid akan bertambah ketika guru menambahkan murid
]

export default function DaftarMuridPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  // Fetch students from database
  useEffect(() => {
    fetchStudents()
  }, [])
  
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/siswa')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform database format to UI format
        const transformedStudents: Student[] = result.data.map((siswa: any) => {
          // Calculate attendance percentage from absensi data
          let attendance = 100 // default
          if (siswa.absensi && siswa.absensi.length > 0) {
            const hadirCount = siswa.absensi.filter((a: any) => a.status === 'hadir').length
            attendance = Math.round((hadirCount / siswa.absensi.length) * 100)
          }
          
          // Calculate average score from nilai data
          let avgScore = 0
          if (siswa.nilai && siswa.nilai.length > 0) {
            const totalNilai = siswa.nilai.reduce((sum: number, n: any) => sum + n.nilai, 0)
            avgScore = Math.round(totalNilai / siswa.nilai.length)
          }
          
          // Generate avatar initials from name
          const initials = siswa.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          
          return {
            id: parseInt(siswa.id.slice(-8), 36), // Convert cuid to number for UI
            originalId: siswa.id, // Store original cuid for API calls
            name: siswa.nama,
            nis: siswa.nis || '-',
            avatar: initials,
            email: siswa.parent?.email || '-',
            phone: siswa.catatan?.includes('Telepon') ? siswa.catatan.replace('No. Telepon: ', '') : '-',
            parent: siswa.parent?.name || '-',
            attendance,
            avgScore,
            status: 'active', // All registered students are active
            specialNeeds: siswa.kebutuhanKhusus || '-',
            joinDate: new Date(siswa.createdAt).toLocaleDateString('id-ID')
          }
        })
        
        setStudents(transformedStudents)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       student.nis.includes(searchQuery)
    return matchSearch
  })
  
  // Calculate statistics
  const calculateAvgAttendance = () => {
    if (students.length === 0) return 0
    const total = students.reduce((sum, s) => sum + s.attendance, 0)
    return Math.round(total / students.length)
  }
  
  const calculateAvgScore = () => {
    if (students.length === 0) return 0
    const total = students.reduce((sum, s) => sum + s.avgScore, 0)
    return Math.round(total / students.length)
  }
  
  const totalActiveStudents = students.filter(s => s.status === 'active').length
  const avgAttendance = calculateAvgAttendance()
  const avgScore = calculateAvgScore()
  
  const handleDeleteStudent = async (id: number) => {
    const student = students.find(s => s.id === id)
    if (!student) return
    
    if (confirm(`Apakah Anda yakin ingin menghapus data murid ${student.name}?`)) {
      try {
        const response = await fetch(`/api/siswa/${student.originalId}`, {
          method: 'DELETE',
        })
        
        const result = await response.json()
        
        if (result.success) {
          // Remove from UI state
          setStudents(students.filter(s => s.id !== id))
          setSelectedStudent(null)
          alert('Data murid berhasil dihapus')
        } else {
          alert('Gagal menghapus data murid: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Terjadi kesalahan saat menghapus data murid')
      }
    }
  }

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
                  <p className="text-3xl font-bold text-green-600">
                    {students.length > 0 ? `${avgAttendance}%` : '-'}
                  </p>
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
                  <p className="text-3xl font-bold text-purple-600">
                    {students.length > 0 ? avgScore : '-'}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Murid Aktif</p>
                  <p className="text-3xl font-bold text-orange-600">{totalActiveStudents}</p>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kebutuhan Khusus</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kehadiran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nilai Rata-rata</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        <p className="text-gray-500">Memuat data murid...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">
                          {searchQuery ? 'Tidak ada murid yang sesuai dengan pencarian' : 'Belum ada data murid'}
                        </p>
                        {!searchQuery && (
                          <p className="text-sm text-gray-400 mt-2">
                            Murid akan otomatis muncul ketika orang tua mendaftar
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
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
                )))}
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
                      <p className="text-gray-600">NIS: {selectedStudent.nis}</p>
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
                  <button 
                    onClick={() => handleDeleteStudent(selectedStudent.id)}
                    className="px-6 py-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Hapus
                  </button>
                  <button 
                    onClick={() => setSelectedStudent(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition"
                  >
                    Tutup
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
