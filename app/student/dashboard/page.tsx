"use client"

import Link from "next/link"
import { BookOpen, LogOut, ClipboardList, FileText, Award, BarChart3, Users, TrendingUp } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface StudentData {
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
  pendingQuizzes: number
  recentGrades: Array<{ id: string, subject: string, grade: number, date: string }>
  recentQuizzes: Array<{ id: string, title: string, score: number, passed: boolean, date: string }>
  weeklyAttendance: Array<{ date: string, status: string }>
  allBadges: Array<{ id: string, name: string, description: string, earnedAt: string }>
}

function StudentDashboardContent() {
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')

  useEffect(() => {
    if (studentId) {
      fetchStudentData(studentId)
    } else {
      setLoading(false)
    }
  }, [studentId])

  const fetchStudentData = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setStudentData(result.data)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const weeklyData = studentData?.weeklyAttendance.map((att, idx) => ({
    name: new Date(att.date).toLocaleDateString('en-US', { weekday: 'short' }),
    kehadiran: att.status === 'hadir' ? 100 : 0,
    nilai: studentData.recentGrades[idx]?.grade || 0
  })) || []

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <span className="text-xl font-bold">EduSpecial</span>
        </div>

        <nav className="space-y-2">
          <Link href={`/student/dashboard${studentId ? `?studentId=${studentId}` : ''}`} className="flex items-center gap-3 px-4 py-3 text-purple-600 bg-purple-50 rounded-lg">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/student/quiz" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <ClipboardList className="h-5 w-5" />
            <span className="font-medium">Kuis</span>
          </Link>
          <Link href="/student/materi" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5" />
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/student/nilai" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Nilai Saya</span>
          </Link>
          <Link href="/student/achievements" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">
            <Award className="h-5 w-5" />
            <span className="font-medium">Achievement</span>
          </Link>
        </nav>

        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900 mb-2">Switch Mode</p>
          <Link href="/parent/dashboard" className="block w-full px-4 py-2 bg-white text-purple-600 rounded-lg text-center text-sm font-medium hover:bg-purple-100 transition">
            Mode Orang Tua
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="text-gray-600 mt-1">Halo! Ayo semangat belajar hari ini 🎉</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : !studentData ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Silakan pilih profil siswa dari dashboard orang tua</p>
            <Link href="/parent/dashboard" className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition inline-block">
              Ke Dashboard Orang Tua
            </Link>
          </div>
        ) : (
          <>
            {/* Student Profile Card */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl">
                  {studentData.nama.split(' ')[0][0]}{studentData.nama.split(' ')[1]?.[0] || ''}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{studentData.nama}</h2>
                  <p className="text-purple-100">NIS: {studentData.nis} | Kelas: {studentData.kelas}</p>
                  <p className="text-purple-100 text-sm">Wali Kelas: {studentData.guruNama}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-100">Kehadiran</p>
                  <p className="text-3xl font-bold">{studentData.attendance}%</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{studentData.pendingQuizzes}</h3>
                <p className="text-gray-600 text-sm">Kuis Pending</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{studentData.assignmentsCompleted}/{studentData.totalAssignments}</h3>
                <p className="text-gray-600 text-sm">Tugas Selesai</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{studentData.avgGrade}</h3>
                <p className="text-gray-600 text-sm">Rata-rata Nilai</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{studentData.badges}</h3>
                <p className="text-gray-600 text-sm">Badges</p>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Mingguan</h2>
              {weeklyData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nilai" stroke="#8b5cf6" strokeWidth={2} name="Nilai" />
                      <Line type="monotone" dataKey="kehadiran" stroke="#10b981" strokeWidth={2} name="Kehadiran" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Belum ada data progress</p>
              )}
            </div>

            {/* Recent Grades and Quizzes */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Nilai Terbaru</h2>
                {studentData.recentGrades.length > 0 ? (
                  <div className="space-y-3">
                    {studentData.recentGrades.slice(0, 5).map(grade => (
                      <div key={grade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">{grade.subject}</p>
                          <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className={`text-2xl font-bold ${
                          grade.grade >= 80 ? 'text-green-600' :
                          grade.grade >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {grade.grade}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Belum ada nilai</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Hasil Kuis Terbaru</h2>
                {studentData.recentQuizzes.length > 0 ? (
                  <div className="space-y-3">
                    {studentData.recentQuizzes.slice(0, 5).map(quiz => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{quiz.title}</p>
                          <p className="text-xs text-gray-500">{new Date(quiz.date).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {quiz.score}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {quiz.passed ? 'Lulus' : 'Tidak Lulus'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Belum ada hasil kuis</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  )
}
