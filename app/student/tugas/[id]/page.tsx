"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Clock, Calendar, FileText, Upload, Video, CheckCircle, Home, Building2, AlertCircle, Play } from "lucide-react"
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
  durasi: number | null
  pertanyaan: Pertanyaan[]
}

interface Pertanyaan {
  id: string
  soal: string
  tipeJawaban: 'multiple_choice' | 'essay' | 'true_false'
  pilihan: string[] | null
  poin: number
  urutan: number
}

interface HasilTugas {
  id: string
  tugasId: string
  siswaId: string
  skor: number
  skorMaksimal: number
  waktuMulai: string
  waktuSelesai: string | null
  submittedAt: string | null
  nilai: number | null
  catatan: string | null
  gradedAt: string | null
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
  const [hasilTugas, setHasilTugas] = useState<HasilTugas | null>(null)
  const [mySubmission, setMySubmission] = useState<MySubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [pinCode, setPinCode] = useState('')
  const [starting, setStarting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [timeDisplay, setTimeDisplay] = useState<string>('')

  useEffect(() => {
    fetchTugasDetail()
  }, [params.id, studentId])

  // Timer for LIVE mode
  useEffect(() => {
    if (tugas?.mode === 'LIVE' && hasilTugas && tugas.durasi && !mySubmission) {
      const waktuMulai = new Date(hasilTugas.waktuMulai).getTime()
      const durasiMs = tugas.durasi * 60 * 1000
      const waktuSelesai = waktuMulai + durasiMs
      
      const interval = setInterval(() => {
        const now = Date.now()
        const remaining = waktuSelesai - now
        
        if (remaining <= 0) {
          clearInterval(interval)
          setTimeRemaining(0)
          setTimeDisplay('00:00')
          // Auto-submit
          handleFinalSubmit()
        } else {
          setTimeRemaining(remaining)
          const minutes = Math.floor(remaining / 60000)
          const seconds = Math.floor((remaining % 60000) / 1000)
          setTimeDisplay(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [tugas, hasilTugas, mySubmission])

  const fetchTugasDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tugas/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setTugas(result.data)
        
        // Check if already submitted
        const submissionUrl = studentId 
          ? `/api/tugas/${params.id}/my-submission?siswaId=${studentId}`
          : `/api/tugas/${params.id}/my-submission`
        const submissionRes = await fetch(submissionUrl)
        const submissionData = await submissionRes.json()
        if (submissionData.success && submissionData.data) {
          setMySubmission(submissionData.data)
          setHasilTugas(submissionData.data)
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

  const handleStartTugas = async () => {
    if (!studentId) {
      alert('Siswa ID tidak ditemukan.')
      return
    }

    if (tugas?.mode === 'LIVE' && !pinCode) {
      alert('Mohon masukkan PIN terlebih dahulu')
      return
    }

    try {
      setStarting(true)
      const response = await fetch(`/api/tugas/${params.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: studentId,
          pinCode: tugas?.mode === 'LIVE' ? pinCode : undefined
        })
      })

      const result = await response.json()
      if (result.success) {
        setHasilTugas(result.data)
        alert('Tugas dimulai! Selamat mengerjakan.')
      } else {
        alert(result.error || 'Gagal memulai tugas')
      }
    } catch (error) {
      console.error('Error starting tugas:', error)
      alert('Terjadi kesalahan saat memulai tugas')
    } finally {
      setStarting(false)
    }
  }

  const handleAnswerChange = async (pertanyaanId: string, jawaban: string) => {
    if (!hasilTugas || !studentId) return
    
    setAnswers(prev => ({ ...prev, [pertanyaanId]: jawaban }))
    
    // Auto-save answer
    try {
      await fetch(`/api/tugas/${params.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: studentId,
          pertanyaanId,
          jawaban,
          hasilTugasId: hasilTugas.id
        })
      })
    } catch (error) {
      console.error('Error saving answer:', error)
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

  const handleFinalSubmit = async () => {
    if (!studentId) {
      alert('Siswa ID tidak ditemukan. Silakan kembali ke halaman sebelumnya.')
      return
    }

    // For HOMEWORK mode with video requirement
    if (tugas?.mode === 'HOMEWORK' && !videoFile) {
      const confirmWithoutVideo = confirm('Anda belum mengupload video. Lanjutkan submit?')
      if (!confirmWithoutVideo) return
    }

    try {
      setUploading(true)

      let videoDataUrl = null
      if (videoFile) {
        // In production, upload to cloud storage (e.g., AWS S3, Cloudinary)
        // For now, we'll use a data URL (not recommended for large files in production)
        const reader = new FileReader()
        
        await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            videoDataUrl = reader.result as string
            resolve(null)
          }
          reader.onerror = reject
          reader.readAsDataURL(videoFile)
        })
      }

      const response = await fetch(`/api/tugas/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: studentId,
          videoUrl: videoDataUrl
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message || 'Tugas berhasil dikumpulkan!')
        if (result.autoGraded && result.data.nilai !== null) {
          alert(`Nilai Anda: ${result.data.nilai.toFixed(0)}`)
        }
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

  const isDeadlinePassed = tugas?.deadline && new Date(tugas.deadline) < new Date()
  const canStart = tugas?.status === 'ACTIVE' && !hasilTugas && !mySubmission && !isDeadlinePassed
  const canSubmit = hasilTugas && !mySubmission && !isDeadlinePassed

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
            {/* Timer - Show only during LIVE mode */}
            {tugas?.mode === 'LIVE' && hasilTugas && !mySubmission && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    <span className="font-semibold">Waktu Tersisa:</span>
                  </div>
                  <div className="text-3xl font-bold font-mono">
                    {timeDisplay}
                  </div>
                </div>
                {timeRemaining !== null && timeRemaining < 60000 && (
                  <p className="text-sm mt-2 text-center">⚠️ Kurang dari 1 menit!</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                tugas?.mode === 'LIVE' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {tugas?.mode === 'LIVE' ? (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    LIVE Session
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    Pekerjaan Rumah
                  </span>
                )}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{tugas?.judul}</h1>
            <p className="text-lg text-gray-600 mb-6">{tugas?.mataPelajaran}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              {tugas?.deadline && (
                <div className={`flex items-center gap-2 text-sm ${
                  isDeadlinePassed ? 'text-red-600 font-semibold' : 'text-gray-600'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {new Date(tugas.deadline).toLocaleString('id-ID')}</span>
                </div>
              )}
              {tugas?.durasi && tugas.mode === 'LIVE' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Durasi: {tugas.durasi} menit</span>
                </div>
              )}
            </div>

            {tugas?.deskripsi && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Deskripsi Tugas
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{tugas.deskripsi}</p>
              </div>
            )}

            {/* Already Submitted */}
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
            ) : !hasilTugas ? (
              /* Start Tugas Form */
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Siap Memulai?</h3>
                  
                  {tugas?.mode === 'LIVE' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Masukkan PIN untuk join LIVE session:
                      </label>
                      <input
                        type="text"
                        placeholder="000000"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-center text-2xl font-bold tracking-widest focus:border-purple-500 focus:outline-none"
                        disabled={starting}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Tanyakan PIN kepada guru Anda
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleStartTugas}
                    disabled={starting || (tugas?.mode === 'LIVE' && pinCode.length !== 6)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-2 ${
                      starting || (tugas?.mode === 'LIVE' && pinCode.length !== 6)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl'
                    }`}
                  >
                    {starting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Memulai...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        {tugas?.mode === 'LIVE' ? 'Join LIVE Session' : 'Mulai Mengerjakan'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Questions Form */
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800">
                    💡 Jawaban Anda otomatis tersimpan saat mengisi
                  </p>
                </div>

                {tugas?.pertanyaan.map((pertanyaan, index) => (
                  <div key={pertanyaan.id} className="p-6 bg-white rounded-2xl shadow-lg">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-3">{pertanyaan.soal}</p>
                        <span className="text-xs text-gray-500">({pertanyaan.poin} poin)</span>
                      </div>
                    </div>

                    {pertanyaan.tipeJawaban === 'multiple_choice' && pertanyaan.pilihan && (
                      <div className="space-y-2 ml-11">
                        {pertanyaan.pilihan.map((pilihan: string) => (
                          <label
                            key={pilihan}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                              answers[pertanyaan.id] === pilihan
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={pertanyaan.id}
                              value={pilihan}
                              checked={answers[pertanyaan.id] === pilihan}
                              onChange={(e) => handleAnswerChange(pertanyaan.id, e.target.value)}
                              className="w-5 h-5 text-purple-500"
                            />
                            <span className="text-gray-700">{pilihan}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {pertanyaan.tipeJawaban === 'essay' && (
                      <div className="ml-11">
                        <textarea
                          value={answers[pertanyaan.id] || ''}
                          onChange={(e) => handleAnswerChange(pertanyaan.id, e.target.value)}
                          placeholder="Tulis jawaban Anda di sini..."
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                        />
                      </div>
                    )}

                    {pertanyaan.tipeJawaban === 'true_false' && (
                      <div className="space-y-2 ml-11">
                        {['Benar', 'Salah'].map((option) => (
                          <label
                            key={option}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                              answers[pertanyaan.id] === option
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={pertanyaan.id}
                              value={option}
                              checked={answers[pertanyaan.id] === option}
                              onChange={(e) => handleAnswerChange(pertanyaan.id, e.target.value)}
                              className="w-5 h-5 text-purple-500"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Video Upload for HOMEWORK mode */}
                {tugas?.mode === 'HOMEWORK' && (
                  <div className="p-6 bg-white rounded-2xl shadow-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Upload Video Pengerjaan (Opsional)
                    </label>
                    
                    {!videoFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition">
                        <input
                          type="file"
                          id="video-upload"
                          accept="video/*"
                          onChange={handleVideoChange}
                          className="hidden"
                          disabled={uploading}
                        />
                        <label htmlFor="video-upload" className="cursor-pointer">
                          <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                           Klik untuk upload video
                          </p>
                          <p className="text-xs text-gray-500">
                            Format: MP4, MOV, AVI (Max 100MB)
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-gray-50 rounded-xl p-4 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Video className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="font-medium text-gray-800 text-sm">{videoFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setVideoFile(null)
                                setVideoPreview(null)
                              }}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                              disabled={uploading}
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleFinalSubmit}
                  disabled={uploading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition ${
                    uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mengirim...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Kumpulkan Tugas
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  {tugas?.mode === 'LIVE' 
                    ? 'Pastikan Anda sudah menjawab semua soal sebelum waktu habis'
                    : 'Pastikan semua jawaban sudah benar sebelum dikumpulkan'}
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
