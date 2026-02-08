"use client"

import { ClipboardList, Plus, Search, Eye, Edit, Trash2, Users, Clock, BookOpen, Home, Building2, CheckCircle, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
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
    hasilTugas: number
  }
  kelas: {
    nama: string
  } | null
}

export default function TugasPage() {
  const [tugas, setTugas] = useState<Tugas[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<'all' | 'LIVE' | 'HOMEWORK'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Form state
  const [tugasForm, setTugasForm] = useState({
    judul: '',
    mataPelajaran: '',
    mode: 'LIVE' as 'LIVE' | 'HOMEWORK',
    deskripsi: '',
    durasi: 30,
    deadline: '',
    tanggalTampil: '',
    file: null as File | null,
    kirimNotifikasi: true
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchTugas()
  }, [])

  const fetchTugas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tugas')
      const result = await response.json()
      
      if (result.success) {
        setTugas(result.data)
      } else {
        alert(result.error || 'Gagal mengambil data tugas')
      }
    } catch (error) {
      console.error('Error fetching tugas:', error)
      alert('Terjadi kesalahan saat mengambil data tugas')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!tugasForm.judul) newErrors.judul = 'Judul wajib diisi'
    if (!tugasForm.mataPelajaran) newErrors.mataPelajaran = 'Mata pelajaran wajib diisi'
    
    // Validasi mode-specific requirements
    if (tugasForm.mode === 'LIVE' && (!tugasForm.durasi || tugasForm.durasi < 5)) {
      newErrors.durasi = 'Durasi minimal 5 menit untuk mode LIVE'
    }
    
    if (tugasForm.mode === 'HOMEWORK' && !tugasForm.deadline) {
      newErrors.deadline = 'Deadline wajib diisi untuk Pekerjaan Rumah'
    }
    
    // Validasi tanggal
    if (tugasForm.tanggalTampil && tugasForm.deadline) {
      const tampil = new Date(tugasForm.tanggalTampil)
      const deadline = new Date(tugasForm.deadline)
      if (deadline <= tampil) {
        newErrors.deadline = 'Deadline harus setelah tanggal tampil'
      }
    }
    
    if (tugasForm.deadline) {
      const deadline = new Date(tugasForm.deadline)
      const now = new Date()
      if (deadline < now) {
        newErrors.deadline = 'Deadline tidak boleh di masa lalu'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateTugas = async (isDraft: boolean = false) => {
    if (!validateForm()) return

    try {
      // Upload file if exists
      let fileUrl = null
      if (tugasForm.file) {
        const formData = new FormData()
        formData.append('file', tugasForm.file)
        // Note: Implement file upload endpoint later
        // For now, we'll just log it
        console.log('File to upload:', tugasForm.file.name)
      }

      const response = await fetch('/api/tugas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: tugasForm.judul,
          mataPelajaran: tugasForm.mataPelajaran,
          mode: tugasForm.mode,
          deskripsi: tugasForm.deskripsi || null,
          durasi: tugasForm.mode === 'LIVE' ? tugasForm.durasi : null,
          deadline: tugasForm.deadline || null,
          tanggalTampil: tugasForm.tanggalTampil || null,
          status: isDraft ? 'DRAFT' : 'ACTIVE',
          fileUrl: fileUrl,
          kirimNotifikasi: !isDraft && tugasForm.kirimNotifikasi
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(isDraft ? 'Tugas berhasil disimpan sebagai draft!' : 'Tugas berhasil dipublikasikan!')
        setShowCreateModal(false)
        setTugasForm({
          judul: '',
          mataPelajaran: '',
          mode: 'LIVE',
          deskripsi: '',
          durasi: 30,
          deadline: '',
          tanggalTampil: '',
          file: null,
          kirimNotifikasi: true
        })
        setErrors({})
        fetchTugas()
      } else {
        alert(result.error || 'Gagal membuat tugas')
      }
    } catch (error) {
      console.error('Error creating tugas:', error)
      alert('Terjadi kesalahan saat membuat tugas')
    }
  }

  const handleDeleteTugas = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tugas ini?')) return

    try {
      const response = await fetch(`/api/tugas/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('Tugas berhasil dihapus')
        fetchTugas()
      } else {
        alert(result.error || 'Gagal menghapus tugas')
      }
    } catch (error) {
      console.error('Error deleting tugas:', error)
      alert('Terjadi kesalahan saat menghapus tugas')
    }
  }

  const filteredTugas = tugas.filter(task => {
    const matchSearch = task.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       task.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
    const matchMode = filterMode === 'all' || task.mode === filterMode
    return matchSearch && matchMode
  })

  // Calculate statistics
  const totalTugas = tugas.length
  const liveTugas = tugas.filter(t => t.mode === 'LIVE').length
  const homeworkTugas = tugas.filter(t => t.mode === 'HOMEWORK').length
  const activeTugas = tugas.filter(t => t.status === 'ACTIVE').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Tugas</h1>
              <p className="text-gray-600">Kelola tugas onsite dan pekerjaan rumah siswa</p>
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
                  <p className="text-3xl font-bold text-gray-800">{totalTugas}</p>
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
                  <p className="text-3xl font-bold text-purple-600">{liveTugas}</p>
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
                  <p className="text-3xl font-bold text-green-600">{homeworkTugas}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktif</p>
                  <p className="text-3xl font-bold text-orange-600">{activeTugas}</p>
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
                onClick={() => setFilterMode('all')}
                className={`px-4 py-3 rounded-xl transition ${
                  filterMode === 'all' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterMode('LIVE')}
                className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                  filterMode === 'LIVE' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Onsite
              </button>
              <button
                onClick={() => setFilterMode('HOMEWORK')}
                className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                  filterMode === 'HOMEWORK' 
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
          ) : filteredTugas.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-2 py-12">
              <ClipboardList className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">
                {searchQuery || filterMode !== 'all' ? 'Tidak ada tugas yang sesuai' : 'Belum ada tugas'}
              </p>
              {!searchQuery && filterMode === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  Buat Tugas Pertama
                </button>
              )}
            </div>
          ) : (
            filteredTugas.map((task) => (
              <div key={task.id} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.mode === 'LIVE' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {task.mode === 'LIVE' ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            Onsite
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            PR
                          </span>
                        )}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === 'ACTIVE' 
                          ? 'bg-blue-100 text-blue-700' 
                          : task.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {task.status === 'ACTIVE' ? 'Aktif' : task.status === 'DRAFT' ? 'Draft' : 'Selesai'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{task.judul}</h3>
                    <p className="text-sm text-gray-600">{task.mataPelajaran}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {task.tanggalTampil && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Tampil: {new Date(task.tanggalTampil).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  {task.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{task._count.hasilTugas} siswa mengerjakan</span>
                  </div>
                </div>

                {task.deskripsi && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.deskripsi}</p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/guru/tugas/${task.id}`}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition text-sm font-medium text-center"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Detail
                  </Link>
                  <button
                    onClick={() => handleDeleteTugas(task.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Buat Tugas Baru</h2>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Tugas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tugasForm.judul}
                      onChange={(e) => setTugasForm({...tugasForm, judul: e.target.value})}
                      placeholder="Contoh: Tugas Matematika Bab 5"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none ${errors.judul ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.judul && <p className="text-red-500 text-xs mt-1">{errors.judul}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Pelajaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tugasForm.mataPelajaran}
                      onChange={(e) => setTugasForm({...tugasForm, mataPelajaran: e.target.value})}
                      placeholder="Contoh: Matematika"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none ${errors.mataPelajaran ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.mataPelajaran && <p className="text-red-500 text-xs mt-1">{errors.mataPelajaran}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Tugas</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTugasForm({...tugasForm, mode: 'LIVE'})}
                        className={`p-4 border-2 rounded-xl transition ${
                          tugasForm.mode === 'LIVE'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                          tugasForm.mode === 'LIVE' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          tugasForm.mode === 'LIVE' ? 'text-purple-700' : 'text-gray-700'
                        }`}>Tugas Onsite</p>
                        <p className="text-xs text-gray-500 mt-1">Dikerjakan di sekolah</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTugasForm({...tugasForm, mode: 'HOMEWORK'})}
                        className={`p-4 border-2 rounded-xl transition ${
                          tugasForm.mode === 'HOMEWORK'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Home className={`w-6 h-6 mx-auto mb-2 ${
                          tugasForm.mode === 'HOMEWORK' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <p className={`font-semibold ${
                          tugasForm.mode === 'HOMEWORK' ? 'text-green-700' : 'text-gray-700'
                        }`}>Pekerjaan Rumah</p>
                        <p className="text-xs text-gray-500 mt-1">Dikerjakan di rumah</p>
                      </button>
                    </div>
                  </div>

                  {/* Durasi field for LIVE mode */}
                  {tugasForm.mode === 'LIVE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durasi Pengerjaan <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tugasForm.durasi}
                          onChange={(e) => setTugasForm({...tugasForm, durasi: parseInt(e.target.value) || 30})}
                          min={5}
                          max={180}
                          className="w-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none"
                        />
                        <span className="text-gray-600">menit</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Waktu yang diberikan untuk mengerjakan (5-180 menit)</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi <span className="text-gray-400 text-xs">(Opsional)</span>
                    </label>
                    <textarea
                      value={tugasForm.deskripsi}
                      onChange={(e) => setTugasForm({...tugasForm, deskripsi: e.target.value})}
                      placeholder="Jelaskan detail tugas..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                    <p className="text-xs text-gray-400 mt-1">{tugasForm.deskripsi.length}/500 karakter</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Tampil <span className="text-gray-400 text-xs">(Opsional)</span>
                      </label>
                      <input
                        type="date"
                        value={tugasForm.tanggalTampil}
                        onChange={(e) => setTugasForm({...tugasForm, tanggalTampil: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kapan tugas mulai terlihat siswa</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline <span className="text-gray-400 text-xs">(Opsional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={tugasForm.deadline}
                        onChange={(e) => setTugasForm({...tugasForm, deadline: e.target.value})}
                        min={tugasForm.tanggalTampil || new Date().toISOString().slice(0, 16)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-300 focus:outline-none ${errors.deadline ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                      <p className="text-xs text-gray-500 mt-1">Batas waktu pengerjaan (tanggal & jam)</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      File Lampiran <span className="text-gray-400 text-xs">(Opsional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-400 transition">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={(e) => setTugasForm({...tugasForm, file: e.target.files?.[0] || null})}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                        <BookOpen className="w-8 h-8 text-gray-400 mb-2" />
                        {tugasForm.file ? (
                          <div className="text-center">
                            <p className="text-sm font-medium text-green-600">{tugasForm.file.name}</p>
                            <p className="text-xs text-gray-500">{(tugasForm.file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Klik untuk upload file</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, atau Gambar (Max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tugasForm.kirimNotifikasi}
                        onChange={(e) => setTugasForm({...tugasForm, kirimNotifikasi: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-300"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Kirim Notifikasi ke Siswa</p>
                        <p className="text-xs text-gray-600">Siswa akan menerima notifikasi saat tugas dipublikasikan</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => handleCreateTugas(false)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-xl transition"
                    >
                      Publikasikan
                    </button>
                    <button
                      onClick={() => handleCreateTugas(true)}
                      className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition"
                    >
                      Simpan Draft
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false)
                        setErrors({})
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
