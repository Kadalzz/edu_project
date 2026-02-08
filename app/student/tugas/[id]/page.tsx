"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Clock, Calendar, FileText, Upload, Video, CheckCircle, Home, Building2, AlertCircle } from "lucide-react"
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
}

interface MySubmission {
  id: string
  nilai: number | null
  videoUrl: string | null
  catatan: string | null
  submittedAt: string
  gradedAt: string | null
}

function KerjakanTugasContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')
  const [tugas, setTugas] = useState<Tugas | null>(null)
  const [mySubmission, setMySubmission] = useState<MySubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchTugasDetail()
  }, [params.id, studentId])

  const fetchTugasDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tugas/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setTugas(result.data)
        
        // Check if already submitted (pass studentId if available)
        const submissionUrl = studentId 
          ? `/api/tugas/${params.id}/my-submission?siswaId=${studentId}`
          : `/api/tugas/${params.id}/my-submission`
        const submissionRes = await fetch(submissionUrl)
        const submissionData = await submissionRes.json()
        if (submissionData.success && submissionData.data) {
          setMySubmission(submissionData.data)
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('Ukuran video tidak boleh lebih dari 100MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('File harus berupa video')
        return
      }

      setVideoFile(file)
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!videoFile) {
      alert('Mohon pilih video terlebih dahulu')
      return
    }

    if (!studentId) {
      alert('Siswa ID tidak ditemukan. Silakan kembali ke halaman sebelumnya.')
      return
    }

    try {
      setUploading(true)

      // In production, upload to cloud storage (e.g., AWS S3, Cloudinary)
      // For now, we'll use a data URL (not recommended for large files in production)
      const reader = new FileReader()
      
      const submitVideo = (videoDataUrl: string) => {
        return fetch(`/api/tugas/${params.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siswaId: studentId,
            videoUrl: videoDataUrl // In production, this would be the cloud URL
          })
        })
      }
      
      reader.onloadend = async () => {
        try {
          const videoDataUrl = reader.result as string
          const response = await submitVideo(videoDataUrl)
          const result = await response.json()

          if (result.success) {
            alert('Tugas berhasil dikumpulkan!')
            fetchTugasDetail()
          } else {
            alert(result.error || 'Gagal mengumpulkan tugas')
          }
        } catch (error) {
          console.error('Error submitting tugas:', error)
          alert('Terjadi kesalahan saat mengumpulkan tugas')
        } finally {
          setUploading(false)
        }
      }
      
      reader.onerror = () => {
        alert('Gagal membaca file video')
        setUploading(false)
      }

      reader.readAsDataURL(videoFile)
    } catch (error) {
      console.error('Error submitting tugas:', error)
      alert('Terjadi kesalahan saat mengumpulkan tugas')
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat tugas...</p>
        </div>
      </div>
    )
  }

  if (!tugas) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tugas Tidak Ditemukan</h2>
          <Link href="/student/tugas" className="text-blue-600 hover:underline">
            Kembali ke Daftar Tugas
          </Link>
        </div>
      </div>
    )
  }

  const isDeadlinePassed = tugas.deadline && new Date(tugas.deadline) < new Date()
  const canSubmit = !isDeadlinePassed && tugas.status === 'ACTIVE' && !mySubmission

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/student/tugas"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Tugas
          </Link>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
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
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{tugas.judul}</h1>
            <p className="text-lg text-gray-600 mb-6">{tugas.mataPelajaran}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              {tugas.deadline && (
                <div className={`flex items-center gap-2 text-sm ${
                  isDeadlinePassed ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {new Date(tugas.deadline).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            {tugas.deskripsi && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Deskripsi Tugas
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{tugas.deskripsi}</p>
              </div>
            )}

            {/* Submission Status */}
            {mySubmission ? (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-800 mb-2">
                      Tugas Sudah Dikumpulkan
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Dikumpulkan pada: {new Date(mySubmission.submittedAt).toLocaleString('id-ID')}
                    </p>

                    {mySubmission.videoUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Pengerjaan:</label>
                        <video controls className="w-full rounded-lg shadow-lg">
                          <source src={mySubmission.videoUrl} type="video/mp4" />
                          Browser Anda tidak mendukung video.
                        </video>
                      </div>
                    )}

                    {mySubmission.nilai !== null ? (
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Nilai:</span>
                          <span className={`text-3xl font-bold ${
                            mySubmission.nilai >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {mySubmission.nilai}
                          </span>
                        </div>
                        {mySubmission.catatan && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-1">Catatan Guru:</p>
                            <p className="text-gray-600">{mySubmission.catatan}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          ⏳ Tugas sedang dinilai oleh guru
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : isDeadlinePassed ? (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-1">Deadline Terlewat</h3>
                    <p className="text-sm text-red-700">
                      Maaf, waktu pengumpulan tugas sudah berakhir
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Upload Form */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Video Pengerjaan <span className="text-red-500">*</span>
                  </label>
                  
                  {!videoFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-400 transition">
                      <input
                        type="file"
                        id="video-upload"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                        disabled={uploading}
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Klik untuk upload video
                        </p>
                        <p className="text-sm text-gray-500">
                          Format: MP4, MOV, AVI (Max 100MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Video className="w-6 h-6 text-purple-600" />
                            <div>
                              <p className="font-medium text-gray-800">{videoFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setVideoFile(null)
                              setVideoPreview(null)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                            disabled={uploading}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {videoPreview && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preview:
                          </label>
                          <video controls className="w-full rounded-lg shadow-lg">
                            <source src={videoPreview} type={videoFile.type} />
                            Browser Anda tidak mendukung video.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!videoFile || uploading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition ${
                    !videoFile || uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Upload className="w-5 h-5" />
                      Kumpulkan Tugas
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Pastikan video Anda menunjukkan proses pengerjaan tugas dengan jelas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KerjakanTugasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat tugas...</p>
        </div>
      </div>
    }>
      <KerjakanTugasContent />
    </Suspense>
  )
}
