"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Clock, Calendar, FileText, CheckCircle, XCircle, Home, Building2, Download, Eye } from "lucide-react"
import Link from "next/link"

interface Tugas {
  id: string
  judul: string
  mataPelajaran: string
  mode: 'LIVE' | 'HOMEWORK'
  deskripsi: string | null
  deadline: string | null
  tanggalTampil: string | null
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  createdAt: string
  _count: {
    pertanyaan: number
    hasilKuis: number
  }
}

interface Submission {
  id: string
  siswa: {
    id: string
    name: string
  }
  nilai: number | null
  fileUrl: string | null
  videoUrl: string | null
  catatan: string | null
  submittedAt: string
  gradedAt: string | null
}

export default function DetailTugasPage() {
  const params = useParams()
  const router = useRouter()
  const [tugas, setTugas] = useState<Tugas | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'submissions'>('info')

  useEffect(() => {
    fetchTugasDetail()
  }, [params.id])

  const fetchTugasDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/kuis/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setTugas(result.data)
        // Fetch submissions
        const submissionsRes = await fetch(`/api/kuis/${params.id}/submissions`)
        const submissionsData = await submissionsRes.json()
        if (submissionsData.success) {
          setSubmissions(submissionsData.data || [])
        }
      } else {
        alert(result.error || 'Gagal mengambil detail tugas')
      }
    } catch (error) {
      console.error('Error fetching tugas detail:', error)
      alert('Terjadi kesalahan saat mengambil detail tugas')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (submissionId: string, nilai: number, catatan: string) => {
    try {
      const response = await fetch(`/api/kuis/${params.id}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nilai, catatan })
      })

      const result = await response.json()
      if (result.success) {
        alert('Nilai berhasil disimpan!')
        fetchTugasDetail()
      } else {
        alert(result.error || 'Gagal menyimpan nilai')
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Terjadi kesalahan saat menyimpan nilai')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail tugas...</p>
        </div>
      </div>
    )
  }

  if (!tugas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tugas Tidak Ditemukan</h2>
          <Link href="/guru/tugas" className="text-blue-600 hover:underline">
            Kembali ke Daftar Tugas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/guru/tugas"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Tugas
          </Link>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tugas.mode === 'LIVE' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {tugas.mode === 'LIVE' ? (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Onsite
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        Pekerjaan Rumah
                      </span>
                    )}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tugas.status === 'ACTIVE' 
                      ? 'bg-blue-100 text-blue-700' 
                      : tugas.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {tugas.status === 'ACTIVE' ? 'Aktif' : tugas.status === 'DRAFT' ? 'Draft' : 'Selesai'}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{tugas.judul}</h1>
                <p className="text-lg text-gray-600 mb-4">{tugas.mataPelajaran}</p>
                
                <div className="flex flex-wrap gap-4">
                  {tugas.tanggalTampil && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Tampil: {new Date(tugas.tanggalTampil).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  {tugas.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {new Date(tugas.deadline).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{tugas._count.hasilKuis} siswa mengerjakan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'info'
                ? 'bg-white text-gray-800 shadow-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Informasi Tugas
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'submissions'
                ? 'bg-white text-gray-800 shadow-lg'
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Pengumpulan ({submissions.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'info' ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Deskripsi Tugas</h2>
            {tugas.deskripsi ? (
              <p className="text-gray-700 whitespace-pre-wrap">{tugas.deskripsi}</p>
            ) : (
              <p className="text-gray-500 italic">Tidak ada deskripsi</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-12 text-center shadow-lg">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada siswa yang mengumpulkan tugas</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{submission.siswa.name}</h3>
                      <p className="text-sm text-gray-600">
                        Dikumpulkan: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      {submission.nilai !== null ? (
                        <div className={`text-2xl font-bold ${
                          submission.nilai >= 75 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {submission.nilai}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Belum dinilai</span>
                      )}
                    </div>
                  </div>

                  {submission.videoUrl && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video Pengerjaan:</label>
                      <video controls className="w-full max-w-2xl rounded-lg">
                        <source src={submission.videoUrl} type="video/mp4" />
                        Browser Anda tidak mendukung video.
                      </video>
                    </div>
                  )}

                  {submission.catatan && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Catatan Guru:</p>
                      <p className="text-gray-600">{submission.catatan}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nilai</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={submission.nilai || ''}
                        placeholder="0-100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        id={`nilai-${submission.id}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                      <input
                        type="text"
                        defaultValue={submission.catatan || ''}
                        placeholder="Catatan untuk siswa..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                        id={`catatan-${submission.id}`}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const nilaiInput = document.getElementById(`nilai-${submission.id}`) as HTMLInputElement
                      const catatanInput = document.getElementById(`catatan-${submission.id}`) as HTMLInputElement
                      const nilai = parseInt(nilaiInput.value)
                      
                      if (isNaN(nilai) || nilai < 0 || nilai > 100) {
                        alert('Nilai harus antara 0-100')
                        return
                      }
                      
                      handleGradeSubmission(submission.id, nilai, catatanInput.value)
                    }}
                    className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                  >
                    Simpan Nilai
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
