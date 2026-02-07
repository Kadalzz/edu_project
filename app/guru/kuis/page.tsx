"use client"

import { ClipboardList, Plus, Search, Eye, Edit, Trash2, Users, Clock, BookOpen, Home, Building2, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface Task {
  id: string
  title: string
  subject: string
  type: 'onsite' | 'homework'
  description: string
  dueDate: string
  createdAt: string
  participants: number
  completed: number
  status: 'active' | 'closed'
}

interface TaskGrade {
  id: string
  taskId: string
  studentId: string
  studentName: string
  score: number
  gradedBy: 'teacher' | 'parent'
  graderName: string
  notes: string
  submittedAt: string
}

export default function TugasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskGrades, setTaskGrades] = useState<TaskGrade[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'onsite' | 'homework'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    subject: '',
    type: 'onsite' as 'onsite' | 'homework',
    description: '',
    dueDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch students
      const response = await fetch('/api/siswa')
      const result = await response.json()
      if (result.success) {
        setStudents(result.data)
      }

      // Load tasks and grades from localStorage (temporary)
      const savedTasks = localStorage.getItem('taskList')
      const savedGrades = localStorage.getItem('taskGrades')
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks))
      }
      if (savedGrades) {
        setTaskGrades(JSON.parse(savedGrades))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.subject || !taskForm.dueDate) {
      alert('Mohon lengkapi semua field')
      return
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      subject: taskForm.subject,
      type: taskForm.type,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      createdAt: new Date().toISOString(),
      participants: students.length,
      completed: 0,
      status: 'active'
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    localStorage.setItem('taskList', JSON.stringify(updatedTasks))

    setTaskForm({ title: '', subject: '', type: 'onsite', description: '', dueDate: '' })
    setShowCreateModal(false)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return

    const updatedTasks = tasks.filter(t => t.id !== taskId)
    const updatedGrades = taskGrades.filter(g => g.taskId !== taskId)

    setTasks(updatedTasks)
    setTaskGrades(updatedGrades)
    localStorage.setItem('taskList', JSON.stringify(updatedTasks))
    localStorage.setItem('taskGrades', JSON.stringify(updatedGrades))
  }

  const openGradeModal = (task: Task) => {
    setSelectedTask(task)
    setShowGradeModal(true)
  }

  const getTaskGrades = (taskId: string) => {
    return taskGrades.filter(g => g.taskId === taskId)
  }

  const filteredTasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = filterType === 'all' || task.type === filterType
    return matchSearch && matchType
  })

  // Calculate statistics
  const totalTasks = tasks.length
  const onsiteTasks = tasks.filter(t => t.type === 'onsite').length
  const homeworkTasks = tasks.filter(t => t.type === 'homework').length
  const completedTasks = tasks.filter(t => t.status === 'closed').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Tugas</h1>
              <p className="text-gray-600">Kelola tugas onsite dan pekerjaan rumah murid</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Buat Tugas Baru
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tugas</p>
                  <p className="text-3xl font-bold text-gray-800">{totalTasks}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tugas Onsite</p>
                  <p className="text-3xl font-bold text-purple-600">{onsiteTasks}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pekerjaan Rumah</p>
                  <p className="text-3xl font-bold text-green-600">{homeworkTasks}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selesai</p>
                  <p className="text-3xl font-bold text-orange-600">{completedTasks}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-orange-600" />
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
                placeholder="Cari judul tugas atau mata pelajaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 rounded-xl transition ${
                  filterType === 'all' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('onsite')}
                className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                  filterType === 'onsite' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Onsite
              </button>
              <button
                onClick={() => setFilterType('homework')}
                className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                  filterType === 'homework' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                <Home className="w-4 h-4" />
                PR
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex flex-col items-center gap-2 py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-gray-500">Memuat data tugas...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 py-12">
              <ClipboardList className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">
                {searchQuery || filterType !== 'all' ? 'Tidak ada tugas yang sesuai' : 'Belum ada tugas'}
              </p>
              {!searchQuery && filterType === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  Buat Tugas Pertama
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.type === 'onsite' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {task.type === 'onsite' ? (
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
                        task.status === 'active' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {task.status === 'active' ? 'Aktif' : 'Selesai'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.subject}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {new Date(task.dueDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{task.completed}/{task.participants} selesai</span>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openGradeModal(task)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Nilai
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {task.type === 'homework' && (
                  <p className="text-xs text-gray-500 mt-3 italic">
                    * Guru dan orang tua dapat menilai
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Buat Tugas Baru</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Judul Tugas</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="Contoh: Tugas Matematika Bab 5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran</label>
                    <input
                      type="text"
                      value={taskForm.subject}
                      onChange={(e) => setTaskForm({...taskForm, subject: e.target.value})}
                      placeholder="Contoh: Matematika"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Tugas</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTaskForm({...taskForm, type: 'onsite'})}
                        className={`p-4 border-2 rounded-xl transition ${
                          taskForm.type === 'onsite'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                          taskForm.type === 'onsite' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          taskForm.type === 'onsite' ? 'text-purple-700' : 'text-gray-700'
                        }`}>Tugas Onsite</p>
                        <p className="text-xs text-gray-500 mt-1">Dinilai oleh guru</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTaskForm({...taskForm, type: 'homework'})}
                        className={`p-4 border-2 rounded-xl transition ${
                          taskForm.type === 'homework'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Home className={`w-6 h-6 mx-auto mb-2 ${
                          taskForm.type === 'homework' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          taskForm.type === 'homework' ? 'text-green-700' : 'text-gray-700'
                        }`}>Pekerjaan Rumah</p>
                        <p className="text-xs text-gray-500 mt-1">Dinilai oleh guru & orang tua</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      placeholder="Jelaskan detail tugas..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCreateTask}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                    >
                      Buat Tugas
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grade Modal */}
        {showGradeModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowGradeModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h2>
                    <p className="text-sm text-gray-600">{selectedTask.subject}</p>
                  </div>
                  <button onClick={() => setShowGradeModal(false)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedTask.type === 'onsite' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedTask.type === 'onsite' ? '🏢 Tugas Onsite - Dinilai oleh Guru' : '🏠 Pekerjaan Rumah - Dinilai oleh Guru & Orang Tua'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">No</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nama Murid</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Nilai</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Dinilai Oleh</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            Belum ada murid terdaftar
                          </td>
                        </tr>
                      ) : (
                        students.map((student, index) => {
                          const grade = getTaskGrades(selectedTask.id).find(g => g.studentId === student.id)
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{index + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-semibold">{student.nama}</p>
                                <p className="text-xs text-gray-500">NIS: {student.nis || '-'}</p>
                              </td>
                              <td className="px-4 py-3 text-center">
                                {grade ? (
                                  <span className={`px-3 py-1 rounded-lg font-bold ${
                                    grade.score >= 80 ? 'bg-green-100 text-green-700' :
                                    grade.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {grade.score}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {grade ? (
                                  <span className="text-sm text-gray-600">
                                    {grade.gradedBy === 'teacher' ? '👨‍🏫 Guru' : '👪 Orang Tua'}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {grade ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                    Selesai
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                    Belum dinilai
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-700">
                    <strong>Catatan:</strong> Fitur penilaian untuk orang tua akan tersedia di dashboard orang tua. 
                    Guru dapat menilai semua jenis tugas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
