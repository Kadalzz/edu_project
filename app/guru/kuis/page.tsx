"use client"

import { ClipboardList, Plus, Search, Filter, Eye, Edit, Trash2, Users, Clock, BarChart3, Award, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { useState } from "react"

const quizzes = [
  {
    id: 1,
    title: "Matematika Dasar - Penjumlahan",
    subject: "Matematika",
    class: "Kelas A",
    questions: 10,
    duration: 30,
    participants: 15,
    completed: 12,
    avgScore: 85,
    status: "active",
    createdAt: "2 Feb 2026",
    dueDate: "10 Feb 2026"
  },
  {
    id: 2,
    title: "Membaca Pemahaman",
    subject: "Bahasa Indonesia",
    class: "Kelas B",
    questions: 8,
    duration: 20,
    participants: 18,
    completed: 18,
    avgScore: 78,
    status: "completed",
    createdAt: "28 Jan 2026",
    dueDate: "3 Feb 2026"
  },
  {
    id: 3,
    title: "Mengenal Warna dan Bentuk",
    subject: "Seni",
    class: "Kelas A",
    questions: 12,
    duration: 25,
    participants: 15,
    completed: 8,
    avgScore: 0,
    status: "active",
    createdAt: "1 Feb 2026",
    dueDate: "8 Feb 2026"
  }
]

const recentGrades = [
  { student: "Andi Pratama", quiz: "Matematika Dasar", score: 90, class: "Kelas A", date: "3 Feb", status: "excellent" },
  { student: "Siti Nurhaliza", quiz: "Membaca Pemahaman", score: 85, class: "Kelas B", date: "3 Feb", status: "good" },
  { student: "Budi Santoso", quiz: "Matematika Dasar", score: 75, class: "Kelas A", date: "2 Feb", status: "good" },
  { student: "Dewi Lestari", quiz: "Membaca Pemahaman", score: 92, class: "Kelas B", date: "2 Feb", status: "excellent" },
]

export default function KuisPenilaianPage() {
  const [activeTab, setActiveTab] = useState<"quiz" | "grades">("quiz")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = selectedStatus === "all" || quiz.status === selectedStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Kuis & Penilaian</h1>
              <p className="text-gray-600">Kelola kuis dan pantau hasil penilaian murid</p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buat Kuis Baru
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Kuis</p>
                  <p className="text-3xl font-bold text-gray-800">{quizzes.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kuis Aktif</p>
                  <p className="text-3xl font-bold text-green-600">
                    {quizzes.filter(q => q.status === "active").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
                  <p className="text-3xl font-bold text-purple-600">82</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Perlu Direview</p>
                  <p className="text-3xl font-bold text-orange-600">5</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-6 py-3 rounded-2xl font-medium transition ${
                activeTab === "quiz"
                  ? "bg-white/70 backdrop-blur-xl shadow-lg text-green-600"
                  : "bg-white/30 text-gray-600 hover:bg-white/50"
              }`}
            >
              Daftar Kuis
            </button>
            <button
              onClick={() => setActiveTab("grades")}
              className={`px-6 py-3 rounded-2xl font-medium transition ${
                activeTab === "grades"
                  ? "bg-white/70 backdrop-blur-xl shadow-lg text-green-600"
                  : "bg-white/30 text-gray-600 hover:bg-white/50"
              }`}
            >
              Nilai Terbaru
            </button>
          </div>

          {/* Search & Filter */}
          {activeTab === "quiz" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kuis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="completed">Selesai</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}
        </div>

        {/* Quiz List */}
        {activeTab === "quiz" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 hover:shadow-2xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      quiz.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {quiz.status === "active" ? "Aktif" : "Selesai"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-3 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600">{quiz.subject} • {quiz.class}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Soal
                    </span>
                    <span className="font-semibold text-gray-800">{quiz.questions} soal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Durasi
                    </span>
                    <span className="font-semibold text-gray-800">{quiz.duration} menit</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Partisipan
                    </span>
                    <span className="font-semibold text-gray-800">{quiz.completed}/{quiz.participants}</span>
                  </div>
                  {quiz.status === "completed" && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Rata-rata
                      </span>
                      <span className="font-bold text-green-600">{quiz.avgScore}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Dibuat: {quiz.createdAt}</span>
                    <span>Deadline: {quiz.dueDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grades Table */}
        {activeTab === "grades" && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Murid</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Kuis</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Kelas</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nilai</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentGrades.map((grade, idx) => (
                    <tr key={idx} className="hover:bg-white/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{grade.student}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{grade.quiz}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {grade.class}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${
                            grade.score >= 85 ? "text-green-600" :
                            grade.score >= 75 ? "text-blue-600" :
                            "text-orange-600"
                          }`}>
                            {grade.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {grade.status === "excellent" ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Excellent</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Good</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{grade.date}</td>
                      <td className="px-6 py-4">
                        <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
