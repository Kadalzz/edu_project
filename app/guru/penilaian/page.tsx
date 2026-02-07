"use client"

import { BarChart2, Search, Plus, Filter, Download, Award, TrendingUp, Users, Edit, Trash2, Save } from "lucide-react"
import { useState, useEffect } from "react"

interface Student {
  id: string
  nama: string
  nis: string
}

interface Category {
  id: string
  name: string
}

interface GradeEntry {
  studentId: string
  categoryId: string
  score: number
}

export default function PenilaianPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCell, setEditingCell] = useState<{studentId: string, categoryId: string} | null>(null)

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
        setStudents(result.data.map((s: any) => ({
          id: s.id,
          nama: s.nama,
          nis: s.nis || '-'
        })))
      }

      // Load categories and grades from localStorage (temporary)
      const savedCategories = localStorage.getItem('penilaianCategories')
      const savedGrades = localStorage.getItem('penilaianGrades')
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      }
      if (savedGrades) {
        setGrades(JSON.parse(savedGrades))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    
    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim()
    }
    
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    localStorage.setItem('penilaianCategories', JSON.stringify(updatedCategories))
    
    setNewCategoryName("")
    setShowAddCategoryModal(false)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua nilai di kategori ini akan terhapus.')) return
    
    const updatedCategories = categories.filter(c => c.id !== categoryId)
    const updatedGrades = grades.filter(g => g.categoryId !== categoryId)
    
    setCategories(updatedCategories)
    setGrades(updatedGrades)
    localStorage.setItem('penilaianCategories', JSON.stringify(updatedCategories))
    localStorage.setItem('penilaianGrades', JSON.stringify(updatedGrades))
  }

  const getGrade = (studentId: string, categoryId: string): number => {
    const entry = grades.find(g => g.studentId === studentId && g.categoryId === categoryId)
    return entry ? entry.score : 0
  }

  const handleGradeChange = (studentId: string, categoryId: string, score: number) => {
    const numericScore = Math.max(0, Math.min(100, score || 0))
    
    const existingIndex = grades.findIndex(g => g.studentId === studentId && g.categoryId === categoryId)
    let updatedGrades: GradeEntry[]
    
    if (existingIndex >= 0) {
      updatedGrades = [...grades]
      updatedGrades[existingIndex] = { studentId, categoryId, score: numericScore }
    } else {
      updatedGrades = [...grades, { studentId, categoryId, score: numericScore }]
    }
    
    setGrades(updatedGrades)
    localStorage.setItem('penilaianGrades', JSON.stringify(updatedGrades))
  }

  const calculateAverage = (studentId: string): number => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.score > 0)
    if (studentGrades.length === 0) return 0
    const sum = studentGrades.reduce((acc, g) => acc + g.score, 0)
    return Math.round(sum / studentGrades.length)
  }

  const calculateAccumulation = (studentId: string): number => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.score > 0)
    const sum = studentGrades.reduce((acc, g) => acc + g.score, 0)
    return Math.round(sum)
  }

  const filteredStudents = students.filter(student => 
    student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.nis.includes(searchQuery)
  )

  // Calculate statistics
  const totalEntries = grades.filter(g => g.score > 0).length
  const allScores = grades.filter(g => g.score > 0).map(g => g.score)
  const avgScore = allScores.length > 0 
    ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
    : 0
  const highScoreCount = allScores.filter(s => s >= 80).length
  const needsImprovementCount = allScores.filter(s => s < 60).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Nilai Post Test</h1>
              <p className="text-gray-600">Kelola penilaian kemampuan murid Anda</p>
            </div>
            <button 
              onClick={() => setShowAddCategoryModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl font-medium hover:shadow-xl transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tambah Kategori Kemampuan
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Penilaian</p>
                  <p className="text-3xl font-bold text-gray-800">{totalEntries}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BarChart2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nilai Rata-rata</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totalEntries > 0 ? avgScore : '-'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nilai Tinggi</p>
                  <p className="text-3xl font-bold text-purple-600">{highScoreCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Nilai ≥ 80</p>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Perlu Perbaikan</p>
                  <p className="text-3xl font-bold text-orange-600">{needsImprovementCount}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Nilai &lt; 60</p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama murid atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-green-300"
              />
            </div>

            <button className="px-6 py-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-gray-500">Memuat data penilaian...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <BarChart2 className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500">Belum ada kategori kemampuan</p>
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  Tambah Kategori Pertama
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <th className="px-4 py-3 text-center text-sm font-semibold border border-white/20 sticky left-0 bg-gradient-to-r from-green-500 to-blue-500 z-10">
                      No
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border border-white/20 sticky left-12 bg-gradient-to-r from-green-500 to-blue-500 z-10 min-w-[180px]">
                      Nama
                    </th>
                    {categories.map((category) => (
                      <th key={category.id} className="px-4 py-3 text-center text-sm font-semibold border border-white/20 min-w-[140px]">
                        <div className="flex flex-col items-center gap-1">
                          <span>{category.name}</span>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-xs text-white/70 hover:text-white transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold border border-white/20 min-w-[140px]">
                      Akumulasi Nilai
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border border-white/20 min-w-[120px]">
                      Kemampuan Rata-rata
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={categories.length + 3} className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'Tidak ada murid yang sesuai dengan pencarian' : 'Belum ada murid terdaftar'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-white/50 transition">
                        <td className="px-4 py-3 text-center border border-gray-200 sticky left-0 bg-white/70 backdrop-blur-sm font-medium">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 border border-gray-200 sticky left-12 bg-white/70 backdrop-blur-sm z-10">
                          <div>
                            <p className="font-semibold text-gray-800">{student.nama}</p>
                            <p className="text-xs text-gray-500">NIS: {student.nis}</p>
                          </div>
                        </td>
                        {categories.map((category) => {
                          const currentGrade = getGrade(student.id, category.id)
                          const isEditing = editingCell?.studentId === student.id && editingCell?.categoryId === category.id
                          
                          return (
                            <td 
                              key={category.id} 
                              className="px-2 py-3 text-center border border-gray-200"
                              onClick={() => setEditingCell({studentId: student.id, categoryId: category.id})}
                            >
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={currentGrade || ''}
                                  onChange={(e) => handleGradeChange(student.id, category.id, parseFloat(e.target.value))}
                                  onBlur={() => setEditingCell(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingCell(null)
                                  }}
                                  className="w-full px-2 py-1 text-center border border-green-300 rounded focus:ring-2 focus:ring-green-400 focus:outline-none"
                                  autoFocus
                                />
                              ) : (
                                <div className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                                  currentGrade === 0 ? 'bg-gray-100 text-gray-400' :
                                  currentGrade >= 80 ? 'bg-green-100 text-green-700' :
                                  currentGrade >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {currentGrade > 0 ? currentGrade : '-'}
                                </div>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-4 py-3 text-center border border-gray-200">
                          <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                            calculateAccumulation(student.id) === 0 ? 'bg-gray-100 text-gray-400' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {calculateAccumulation(student.id) > 0 ? calculateAccumulation(student.id) : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border border-gray-200">
                          <div className={`inline-block px-4 py-2 rounded-lg font-bold ${
                            calculateAverage(student.id) === 0 ? 'bg-gray-100 text-gray-400' :
                            calculateAverage(student.id) >= 80 ? 'bg-green-100 text-green-700' :
                            calculateAverage(student.id) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {calculateAverage(student.id) > 0 ? calculateAverage(student.id) : '-'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowAddCategoryModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Tambah Kategori Kemampuan</h2>
                  <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Kategori Kemampuan
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Contoh: Kemampuan Mengepel Lantai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCategory()
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Kategori akan muncul sebagai kolom baru di tabel penilaian
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tambah Kategori
                    </button>
                    <button
                      onClick={() => {
                        setNewCategoryName("")
                        setShowAddCategoryModal(false)
                      }}
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
      </div>
    </div>
  )
}
