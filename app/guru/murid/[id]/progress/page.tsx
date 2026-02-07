"use client"

import { ArrowLeft, Calendar, Award, TrendingUp, BookOpen, ClipboardCheck, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function StudentProgressPage() {
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentProgress()
  }, [])

  const fetchStudentProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/siswa/${studentId}`)
      const result = await response.json()
      
      if (result.success) {
        setStudent(result.data)
      }
    } catch (error) {
      console.error('Error fetching student progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data progress...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Data siswa tidak ditemukan</p>
          <Link href="/guru/murid" className="text-green-600 hover:text-green-700 font-medium">
            Kembali ke Daftar Murid
          </Link>
        </div>
      </div>
    )
  }

  const initials = student.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  
  // Calculate stats
  const totalNilai = student.nilai?.length || 0
  const avgNilai = totalNilai > 0 
    ? Math.round(student.nilai.reduce((sum: number, n: any) => sum + n.nilai, 0) / totalNilai)
    : 0
  
  const totalAbsensi = student.absensi?.length || 0
  const hadirCount = student.absensi?.filter((a: any) => a.status === 'hadir').length || 0
  const attendancePercentage = totalAbsensi > 0 ? Math.round((hadirCount / totalAbsensi) * 100) : 100

  const totalKuis = student.hasilKuis?.length || 0
  const kuisLulus = student.hasilKuis?.filter((k: any) => k.nilai >= 60).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/guru/murid"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Murid
          </Link>
          
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{student.nama}</h1>
                <p className="text-gray-600">NIS: {student.nis || '-'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Kebutuhan Khusus: {student.kebutuhanKhusus || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">{attendancePercentage}%</span>
            </div>
            <p className="text-sm text-gray-600">Kehadiran</p>
            <p className="text-xs text-gray-500 mt-1">{hadirCount} dari {totalAbsensi} hari</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-700">{avgNilai}</span>
            </div>
            <p className="text-sm text-gray-600">Nilai Rata-rata</p>
            <p className="text-xs text-gray-500 mt-1">{totalNilai} tugas dinilai</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <ClipboardCheck className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">{kuisLulus}/{totalKuis}</span>
            </div>
            <p className="text-sm text-gray-600">Kuis Lulus</p>
            <p className="text-xs text-gray-500 mt-1">Minimal nilai 60</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-700">{student.badges?.length || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Badge Diraih</p>
            <p className="text-xs text-gray-500 mt-1">Prestasi khusus</p>
          </div>
        </div>

        {/* Recent Grades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              Nilai Terbaru
            </h2>
            {totalNilai > 0 ? (
              <div className="space-y-3">
                {student.nilai.slice(0, 5).map((nilai: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{nilai.mataPelajaran || 'Tugas'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(nilai.tanggal).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold ${
                      nilai.nilai >= 80 ? 'bg-green-100 text-green-700' :
                      nilai.nilai >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {nilai.nilai}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Belum ada nilai</p>
              </div>
            )}
          </div>

          {/* Recent Quiz Results */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
              Hasil Kuis Terbaru
            </h2>
            {totalKuis > 0 ? (
              <div className="space-y-3">
                {student.hasilKuis.slice(0, 5).map((hasil: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{hasil.kuis?.judul || 'Kuis'}</p>
                      <p className="text-xs text-gray-500">{hasil.kuis?.mataPelajaran || '-'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg font-bold ${
                      hasil.nilai >= 80 ? 'bg-green-100 text-green-700' :
                      hasil.nilai >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {hasil.nilai || '-'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400">Belum ada hasil kuis</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Riwayat Kehadiran (30 Hari Terakhir)
          </h2>
          {totalAbsensi > 0 ? (
            <div className="space-y-2">
              {student.absensi.slice(0, 10).map((absensi: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <p className="font-medium text-gray-800">
                      {new Date(absensi.tanggal).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    absensi.status === 'hadir' ? 'bg-green-100 text-green-700' :
                    absensi.status === 'izin' ? 'bg-yellow-100 text-yellow-700' :
                    absensi.status === 'sakit' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {absensi.status.charAt(0).toUpperCase() + absensi.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">Belum ada data kehadiran</p>
            </div>
          )}
        </div>

        {/* Badges */}
        {student.badges && student.badges.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Badge & Prestasi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {student.badges.map((badge: any, idx: number) => (
                <div key={idx} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
                    🏆
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{badge.nama}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
