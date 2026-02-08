"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Users, Clock, Calendar, FileText, CheckCircle, XCircle, Home, Building2, Download, Eye, Award, Edit } from "lucide-react"
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
  pertanyaan: Pertanyaan[]
  _count: {
    pertanyaan: number
    hasilTugas: number
  }
}

interface Pertanyaan {
  id: string
  soal: string
  tipeJawaban: 'multiple_choice' | 'essay' | 'true_false'
  pilihan: string[] | null
  jawabanBenar: string | null
  poin: number
  urutan: number
}

interface Jawaban {
  id: string
  pertanyaanId: string
  jawaban: string
  poin: number
}

interface Submission {
  id: string
  skor: number
  skorMaksimal: number
  siswa: {
    id: string
    nama: string
    nis: string
  }
  nilai: number | null
  fileUrl: string | null
  videoUrl: string | null
  catatan: string | null
  submittedAt: string
  gradedAt: string | null
  jawaban?: Jawaban[]
}

export default function DetailTugasPage() {
  const params = useParams()
  const router = useRouter()
  const [tugas, setTugas] = useState<Tugas | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'submissions'>('info')
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null)
  const [essayScores, setEssayScores] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchTugasDetail()
  }, [params.id])

  const fetchTugasDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tugas/${params.id}`)
      const result = await response.json()

      if (result.success) {
        setTugas(result.data)
        // Fetch submissions
        const submissionsRes = await fetch(`/api/tugas/${params.id}/submissions`)
        const submissionsData = await submissionsRes.json()
        if (submissionsData.success) {
          // Fetch jawaban for each submission
          const submissionsWithJawaban = await Promise.all(
            (submissionsData.data || []).map(async (sub: Submission) => {
              try {
                const jawabanRes = await fetch(`/api/tugas/${params.id}/submissions/${sub.id}/jawaban`)
                const jawabanData = await jawabanRes.json()
                return {
                  ...sub,
                  jawaban: jawabanData.success ? jawabanData.data : []
                }
              } catch (error) {
                console.error(`Error fetching jawaban for ${sub.id}:`, error)
                return { ...sub, jawaban: [] }
              }
            })
          )
          setSubmissions(submissionsWithJawaban)
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

  const fetchSubmissionDetail = async (submissionId: string) => {
    try {
      // Fetch jawaban for this submission
      const response = await fetch(`/api/tugas/${params.id}/submissions`)
      const result = await response.json()
      
      if (result.success) {
        const submission = result.data.find((s: Submission) => s.id === submissionId)
        if (submission) {
          // Fetch jawaban details
          const jawabanRes = await fetch(`/api/tugas/${params.id}/submissions`)
          // In a real implementation, you'd have a specific endpoint
          // For now, we'll mock the structure based on the database schema
          setExpandedSubmission(submissionId)
        }
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error)
    }
  }

  const handleGradeSubmission = async (submission: Submission, catatan: string) => {
    try {
      setGradingSubmission(submission.id)
      
      // Find essay questions and their scores
      const essayGrades: Array<{jawabanId: string, poin: number}> = []
      const essayQuestions = tugas?.pertanyaan.filter(q => q.tipeJawaban === 'essay') || []
      
      for (const question of essayQuestions) {
        const jawaban = submission.jawaban?.find(j => j.pertanyaanId === question.id)
        if (jawaban) {
          const score = essayScores[jawaban.id]
          if (score !== undefined) {
            essayGrades.push({
              jawabanId: jawaban.id,
              poin: score
            })
          }
        }
      }

      // If there are essay questions, use essayGrades approach
      const body = essayGrades.length > 0 
        ? { essayGrades, catatan }
        : { 
            nilai: submission.nilai || (submission.skor / submission.skorMaksimal) * 100, 
            catatan 
          }

      const response = await fetch(`/api/tugas/${params.id}/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      if (result.success) {
        alert('Nilai berhasil disimpan!')
        setEssayScores({})
        fetchTugasDetail()
      } else {
        alert(result.error || 'Gagal menyimpan nilai')
      }
    } catch (error) {
      console.error('Error grading submission:', error)
      alert('Terjadi kesalahan saat menyimpan nilai')
    } finally {
      setGradingSubmission(null)
    }
  }

  const calculateTotalScore = (submission: Submission) => {
    if (!tugas?.pertanyaan || !submission.jawaban) return submission.skor
    
    let total = 0
    for (const question of tugas.pertanyaan) {
      const jawaban = submission.jawaban.find(j => j.pertanyaanId === question.id)
      if (jawaban) {
        if (question.tipeJawaban === 'essay') {
          // Use custom score from input
          total += essayScores[jawaban.id] || jawaban.poin
        } else {
          // Use auto-graded score
          total += jawaban.poin
        }
      }
    }
    return total
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
                    <span>{tugas._count.hasilTugas} siswa mengerjakan</span>
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
              submissions.map((submission) => {
                const totalScore = calculateTotalScore(submission)
                const finalNilai = submission.nilai !== null 
                  ? submission.nilai 
                  : (totalScore / submission.skorMaksimal) * 100
                const hasEssayQuestions = tugas?.pertanyaan.some(q => q.tipeJawaban === 'essay')

                return (
                  <div key={submission.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
                    {/* Student Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{submission.siswa.nama}</h3>
                        <p className="text-sm text-gray-600">NIS: {submission.siswa.nis}</p>
                        <p className="text-sm text-gray-600">
                          Dikumpulkan: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                        </p>
                        {submission.gradedAt && (
                          <p className="text-xs text-green-600">
                            ✓ Dinilai: {new Date(submission.gradedAt).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${
                          finalNilai >= 75 ? 'text-green-600' : finalNilai >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {finalNilai.toFixed(0)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {totalScore} / {submission.skorMaksimal} poin
                        </p>
                      </div>
                    </div>

                    {/* Video if available */}
                    {submission.videoUrl && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          📹 Video Pengerjaan:
                        </label>
                        <video controls className="w-full max-w-2xl rounded-lg shadow-md">
                          <source src={submission.videoUrl} type="video/mp4" />
                          Browser Anda tidak mendukung video.
                        </video>
                      </div>
                    )}

                    {/* Questions and Answers */}
                    {tugas?.pertanyaan && submission.jawaban && (
                      <div className="mb-4 space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Jawaban ({submission.jawaban.length} soal)
                        </h4>
                        
                        {tugas.pertanyaan.map((question, index) => {
                          const jawaban = submission.jawaban?.find(j => j.pertanyaanId === question.id)
                          const isCorrect = jawaban && jawaban.poin > 0
                          const isEssay = question.tipeJawaban === 'essay'
                          
                          return (
                            <div 
                              key={question.id} 
                              className={`p-4 rounded-xl border-2 ${
                                isEssay 
                                  ? 'border-yellow-200 bg-yellow-50' 
                                  : isCorrect 
                                  ? 'border-green-200 bg-green-50' 
                                  : 'border-red-200 bg-red-50'
                              }`}
                            >
                              {/* Question */}
                              <div className="flex items-start gap-2 mb-2">
                                <span className="w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-gray-800 font-medium">{question.soal}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Tipe: {question.tipeJawaban === 'multiple_choice' ? 'Pilihan Ganda' : question.tipeJawaban === 'essay' ? 'Essay' : 'Benar/Salah'} • {question.poin} poin
                                  </p>
                                </div>
                              </div>

                              {/* Student Answer */}
                              <div className="ml-8 mt-2">
                                <p className="text-xs font-semibold text-gray-600 mb-1">
                                  Jawaban Siswa:
                                </p>
                                <p className={`text-sm ${
                                  isEssay ? 'text-gray-700' : isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'
                                }`}>
                                  {jawaban?.jawaban || <span className="text-gray-400 italic">Tidak dijawab</span>}
                                </p>

                                {/* Show correct answer for MC/TF */}
                                {!isEssay && question.jawabanBenar && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    ✓ Jawaban Benar: <span className="font-semibold text-green-700">{question.jawabanBenar}</span>
                                  </p>
                                )}

                                {/* Essay Grading Input */}
                                {isEssay && jawaban && (
                                  <div className="mt-3 flex items-center gap-3">
                                    <label className="text-xs font-medium text-gray-700">
                                      Poin:
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={question.poin}
                                      defaultValue={jawaban.poin}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0
                                        setEssayScores(prev => ({
                                          ...prev,
                                          [jawaban.id]: Math.min(value, question.poin)
                                        }))
                                      }}
                                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none text-sm"
                                      placeholder={`0-${question.poin}`}
                                    />
                                    <span className="text-xs text-gray-500">/ {question.poin} poin</span>
                                  </div>
                                )}

                                {/* Auto-graded score display */}
                                {!isEssay && (
                                  <div className="mt-2 flex items-center gap-2">
                                    {isCorrect ? (
                                      <span className="text-xs font-semibold text-green-700 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        +{jawaban?.poin} poin
                                      </span>
                                    ) : (
                                      <span className="text-xs font-semibold text-red-700 flex items-center gap-1">
                                        <XCircle className="w-3 h-3" />
                                        0 poin
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Score Summary */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Skor Total</p>
                          <p className="text-2xl font-bold text-blue-600">{totalScore}</p>
                          <p className="text-xs text-gray-500">dari {submission.skorMaksimal}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Persentase</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {((totalScore / submission.skorMaksimal) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Nilai Akhir</p>
                          <p className={`text-2xl font-bold ${
                            finalNilai >= 75 ? 'text-green-600' : finalNilai >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {finalNilai.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Guru */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan untuk Siswa:
                      </label>
                      <textarea
                        defaultValue={submission.catatan || ''}
                        placeholder="Tambahkan catatan atau feedback untuk siswa..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none"
                        id={`catatan-${submission.id}`}
                      />
                    </div>

                    {/* Submit Button */}
                    {hasEssayQuestions && !submission.gradedAt ? (
                      <button
                        onClick={() => {
                          const catatanInput = document.getElementById(`catatan-${submission.id}`) as HTMLTextAreaElement
                          handleGradeSubmission(submission, catatanInput.value)
                        }}
                        disabled={gradingSubmission === submission.id}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {gradingSubmission === submission.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Award className="w-5 h-5" />
                            Simpan Nilai & Kirim ke Siswa
                          </>
                        )}
                      </button>
                    ) : submission.gradedAt ? (
                      <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Tugas sudah dinilai. Nilai telah dikirim ke siswa dan orang tua.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ Semua soal sudah ter-grading otomatis. Nilai final: <strong>{finalNilai.toFixed(0)}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
