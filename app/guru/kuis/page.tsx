"use client"

import { ClipboardList, Plus, Search, Filter, Eye, Edit, Trash2, Users, Clock, BarChart3, Award, CheckCircle, XCircle, TrendingUp, BookOpen, GraduationCap, FileText, MessageSquare, Bell, LogOut, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

const defaultGrades = [
  { id: 1, student: "Andi Pratama", quiz: "Matematika Dasar", score: 90, class: "Kelas A", date: "3 Feb", status: "excellent" },
  { id: 2, student: "Siti Nurhaliza", quiz: "Membaca Pemahaman", score: 85, class: "Kelas B", date: "3 Feb", status: "good" },
  { id: 3, student: "Budi Santoso", quiz: "Matematika Dasar", score: 75, class: "Kelas A", date: "2 Feb", status: "good" },
  { id: 4, student: "Dewi Lestari", quiz: "Membaca Pemahaman", score: 92, class: "Kelas B", date: "2 Feb", status: "excellent" },
]

const notifications = [
  { id: 1, title: 'Tugas baru dari Andi Pratama', message: 'Matematika Kelas A', time: '5 menit lalu', unread: true },
  { id: 2, title: 'Kuis diselesaikan oleh Siti', message: 'Bahasa Indonesia', time: '20 menit lalu', unread: true },
  { id: 3, title: 'Pesan dari Orang Tua', message: 'Ibu Sarah mengirim pesan', time: '1 jam lalu', unread: false },
  { id: 4, title: 'Reminder: Meeting', message: 'Meeting dengan wali murid jam 14:00', time: '2 jam lalu', unread: false },
]

interface Quiz {
  id: number
  title: string
  subject: string
  class: string
  questions: number
  duration: number
  participants: number
  completed: number
  avgScore: number
  status: string
  createdAt: string
  dueDate: string
}

interface Grade {
  id: number
  student: string
  quiz: string
  score: number
  class: string
  date: string
  status: string
}

export default function KuisPenilaianPage() {
  // Load initial quiz data from localStorage or use default
  const [quizList, setQuizList] = useState<Quiz[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quizList')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing quizList from localStorage:', e)
        }
      }
    }
    return quizzes
  })
  
  // Load initial grades data from localStorage or use default
  const [gradesList, setGradesList] = useState<Grade[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gradesList')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Error parsing gradesList from localStorage:', e)
        }
      }
    }
    return defaultGrades
  })

  const [activeTab, setActiveTab] = useState<"quiz" | "grades">("quiz")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [selectedGrade, setSelectedGrade] = useState<any>(null)
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Form state for create/edit quiz
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    class: "",
    questions: 10,
    duration: 30,
    dueDate: ""
  })

  // Save quizList to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quizList', JSON.stringify(quizList))
    }
  }, [quizList])
  
  // Save gradesList to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gradesList', JSON.stringify(gradesList))
    }
  }, [gradesList])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleCreateQuiz = () => {
    if (!formData.title || !formData.subject || !formData.class || !formData.dueDate) {
      alert("Mohon lengkapi semua field")
      return
    }

    const newQuiz: Quiz = {
      id: quizList.length + 1,
      title: formData.title,
      subject: formData.subject,
      class: formData.class,
      questions: formData.questions,
      duration: formData.duration,
      participants: 0,
      completed: 0,
      avgScore: 0,
      status: "active",
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueDate: formData.dueDate
    }

    setQuizList([...quizList, newQuiz])
    setShowCreateModal(false)
    setFormData({ title: "", subject: "", class: "", questions: 10, duration: 30, dueDate: "" })
  }

  const handleEditQuiz = () => {
    if (!selectedQuiz || !formData.title || !formData.subject || !formData.class) {
      alert("Mohon lengkapi semua field")
      return
    }

    const updatedQuizzes = quizList.map(quiz => 
      quiz.id === selectedQuiz.id 
        ? { ...quiz, ...formData }
        : quiz
    )
    
    setQuizList(updatedQuizzes)
    setShowEditModal(false)
    setSelectedQuiz(null)
    setFormData({ title: "", subject: "", class: "", questions: 10, duration: 30, dueDate: "" })
  }

  const handleDeleteQuiz = (quizId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus kuis ini?")) {
      setQuizList(quizList.filter(quiz => quiz.id !== quizId))
    }
  }
  
  const handleDeleteGrade = (gradeId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data nilai ini?")) {
      setGradesList(gradesList.filter(grade => grade.id !== gradeId))
    }
  }

  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setFormData({
      title: quiz.title,
      subject: quiz.subject,
      class: quiz.class,
      questions: quiz.questions,
      duration: quiz.duration,
      dueDate: quiz.dueDate
    })
    setShowEditModal(true)
  }

  const openDetailModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowDetailModal(true)
  }

  const openGradeModal = (grade: any) => {
    setSelectedGrade(grade)
    setShowGradeModal(true)
  }

  const filteredQuizzes = quizList.filter(quiz => {
    const matchSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = selectedStatus === "all" || quiz.status === selectedStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-green-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Guru Panel</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/guru/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/guru/murid" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Daftar Murid</span>
          </Link>
          <Link href="/guru/kuis" className="flex items-center px-4 py-3 text-green-600 bg-green-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Kuis & Penilaian</span>
          </Link>
          <Link href="/guru/materi" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/guru/chat" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Chat</span>
          </Link>
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
                placeholder="search student or class"
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl">
              <img src="https://ui-avatars.com/api/?name=Guru&background=10b981&color=fff" alt="Guru" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Guru</span>
            </div>
            
            {/* Notification Button with Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${notif.unread ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </h4>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-100 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Kuis & Penilaian</h1>
                <p className="text-gray-600">Kelola kuis dan pantau hasil penilaian murid</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition flex items-center gap-2"
              >
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
                    <p className="text-3xl font-bold text-gray-800">{quizList.length}</p>
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
                    {quizList.filter(q => q.status === "active").length}
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
                    <button 
                      onClick={() => openDetailModal(quiz)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                    <button 
                      onClick={() => openEditModal(quiz)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                    >
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
                  {gradesList.map((grade) => (
                    <tr key={grade.id} className="hover:bg-white/50 transition">
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openGradeModal(grade)}
                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Create Quiz */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Buat Kuis Baru</h2>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Kuis</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Contoh: Matematika Dasar - Penjumlahan"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Seni">Seni</option>
                      <option value="Olahraga">Olahraga</option>
                      <option value="IPA">IPA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                    <select 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Pilih Kelas</option>
                      <option value="Kelas A">Kelas A</option>
                      <option value="Kelas B">Kelas B</option>
                      <option value="Kelas C">Kelas C</option>
                      <option value="Semua Kelas">Semua Kelas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Soal</label>
                    <input 
                      type="number"
                      value={formData.questions}
                      onChange={(e) => setFormData({...formData, questions: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (menit)</label>
                    <input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleCreateQuiz}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                  >
                    Buat Kuis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Quiz */}
        {showEditModal && selectedQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Edit Kuis</h2>
                  <button 
                    onClick={() => { setShowEditModal(false); setSelectedQuiz(null); }}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Judul Kuis</label>
                  <input 
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Matematika">Matematika</option>
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="Seni">Seni</option>
                      <option value="Olahraga">Olahraga</option>
                      <option value="IPA">IPA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                    <select 
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Kelas A">Kelas A</option>
                      <option value="Kelas B">Kelas B</option>
                      <option value="Kelas C">Kelas C</option>
                      <option value="Semua Kelas">Semua Kelas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Soal</label>
                    <input 
                      type="number"
                      value={formData.questions}
                      onChange={(e) => setFormData({...formData, questions: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durasi (menit)</label>
                    <input 
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input 
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => { setShowEditModal(false); setSelectedQuiz(null); }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleEditQuiz}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Detail Quiz */}
        {showDetailModal && selectedQuiz && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Detail Kuis</h2>
                  <button 
                    onClick={() => { setShowDetailModal(false); setSelectedQuiz(null); }}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedQuiz.title}</h3>
                  <p className="text-gray-600">{selectedQuiz.subject} • {selectedQuiz.class}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Jumlah Soal</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedQuiz.questions}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Durasi</p>
                    <p className="text-2xl font-bold text-green-600">{selectedQuiz.duration} menit</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Partisipan</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedQuiz.completed}/{selectedQuiz.participants}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Rata-rata Nilai</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedQuiz.avgScore || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedQuiz.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedQuiz.status === "active" ? "Aktif" : "Selesai"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dibuat:</span>
                      <span className="font-medium text-gray-800">{selectedQuiz.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium text-gray-800">{selectedQuiz.dueDate}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { setShowDetailModal(false); setSelectedQuiz(null); }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Grade Detail */}
        {showGradeModal && selectedGrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Detail Nilai</h2>
                  <button 
                    onClick={() => { setShowGradeModal(false); setSelectedGrade(null); }}
                    className="p-2 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {selectedGrade.score}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedGrade.student}</h3>
                  <p className="text-gray-600">{selectedGrade.class}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kuis:</span>
                    <span className="font-medium text-gray-800">{selectedGrade.quiz}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium text-gray-800">{selectedGrade.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedGrade.status === "excellent" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {selectedGrade.status === "excellent" ? "Excellent" : "Good"}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Catatan Guru:</strong> Siswa menunjukkan pemahaman yang baik terhadap materi. 
                    Perlu latihan lebih lanjut untuk peningkatan.
                  </p>
                </div>

                <button 
                  onClick={() => { setShowGradeModal(false); setSelectedGrade(null); }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
    </div>
  )
}
