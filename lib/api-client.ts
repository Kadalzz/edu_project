/**
 * API Client Helper Functions
 * 
 * Usage:
 * import { apiClient } from '@/lib/api-client'
 * const data = await apiClient.kuis.getAll({ guruId: 'xxx' })
 */

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
  unreadCount?: number
}

// Base fetch wrapper
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const result: ApiResponse<T> = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'API request failed')
  }

  return result.data as T
}

// Siswa API
export const siswaApi = {
  async getAll(filters?: { kelasId?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.kelasId) params.set('kelasId', filters.kelasId)
    if (filters?.search) params.set('search', filters.search)
    
    return apiFetch<any[]>(`/api/siswa?${params}`)
  },

  async getById(id: string) {
    return apiFetch<any>(`/api/siswa/${id}`)
  },

  async create(data: {
    userId: string
    kelasId?: string
    nisn: string
    tanggalLahir?: string
    alamat?: string
    nomorHP?: string
    parentId?: string
  }) {
    return apiFetch<any>('/api/siswa', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<any>) {
    return apiFetch<any>(`/api/siswa/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/siswa/${id}`, {
      method: 'DELETE',
    })
  },
}

// Kuis API
export const kuisApi = {
  async getAll(filters?: {
    guruId?: string
    kelasId?: string
    status?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.guruId) params.set('guruId', filters.guruId)
    if (filters?.kelasId) params.set('kelasId', filters.kelasId)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.search) params.set('search', filters.search)
    
    return apiFetch<any[]>(`/api/kuis?${params}`)
  },

  async getById(id: string) {
    return apiFetch<any>(`/api/kuis/${id}`)
  },

  async create(data: {
    guruId: string
    kelasId?: string
    judul: string
    deskripsi?: string
    mode: 'REALTIME' | 'FLEXIBLE'
    durasi?: number
    deadline?: string
    mataPelajaran?: string
    pertanyaan?: Array<{
      soal: string
      tipeJawaban: string
      pilihan?: string[]
      jawabanBenar?: string
      poin: number
    }>
  }) {
    return apiFetch<any>('/api/kuis', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<any>) {
    return apiFetch<any>(`/api/kuis/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/kuis/${id}`, {
      method: 'DELETE',
    })
  },
}

// Materi API
export const materiApi = {
  async getAll(filters?: {
    guruId?: string
    kelasId?: string
    mataPelajaran?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.guruId) params.set('guruId', filters.guruId)
    if (filters?.kelasId) params.set('kelasId', filters.kelasId)
    if (filters?.mataPelajaran) params.set('mataPelajaran', filters.mataPelajaran)
    if (filters?.search) params.set('search', filters.search)
    
    return apiFetch<any[]>(`/api/materi?${params}`)
  },

  async getById(id: string) {
    return apiFetch<any>(`/api/materi/${id}`)
  },

  async create(data: {
    guruId: string
    kelasId?: string
    judul: string
    deskripsi?: string
    konten: string
    mataPelajaran?: string
    fileUrl?: string
  }) {
    return apiFetch<any>('/api/materi', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<any>) {
    return apiFetch<any>(`/api/materi/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/materi/${id}`, {
      method: 'DELETE',
    })
  },
}

// Chat API
export const chatApi = {
  async getConversations(userId: string) {
    return apiFetch<{
      conversations: Array<{
        partnerId: string
        partner: any
        lastMessage: any
        unreadCount: number
      }>
    }>(`/api/chat?userId=${userId}`)
  },

  async getMessages(userId: string, otherUserId: string, limit?: number) {
    const params = new URLSearchParams()
    params.set('userId', userId)
    params.set('otherUserId', otherUserId)
    if (limit) params.set('limit', limit.toString())
    
    return apiFetch<any[]>(`/api/chat?${params}`)
  },

  async sendMessage(data: {
    fromUserId: string
    toUserId: string
    message: string
  }) {
    return apiFetch<any>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async markAsRead(userId: string, otherUserId: string) {
    return apiFetch<void>('/api/chat', {
      method: 'PATCH',
      body: JSON.stringify({ userId, otherUserId }),
    })
  },
}

// Kelas API
export const kelasApi = {
  async getAll(filters?: {
    guruId?: string
    tingkat?: string
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.guruId) params.set('guruId', filters.guruId)
    if (filters?.tingkat) params.set('tingkat', filters.tingkat)
    if (filters?.search) params.set('search', filters.search)
    
    return apiFetch<any[]>(`/api/kelas?${params}`)
  },

  async getById(id: string) {
    return apiFetch<any>(`/api/kelas/${id}`)
  },

  async create(data: {
    guruId: string
    nama: string
    tingkat: string
    tahunAjaran?: string
  }) {
    return apiFetch<any>('/api/kelas', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<any>) {
    return apiFetch<any>(`/api/kelas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/kelas/${id}`, {
      method: 'DELETE',
    })
  },
}

// Nilai API
export const nilaiApi = {
  async getAll(filters?: {
    siswaId?: string
    guruId?: string
    mataPelajaran?: string
    semester?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.siswaId) params.set('siswaId', filters.siswaId)
    if (filters?.guruId) params.set('guruId', filters.guruId)
    if (filters?.mataPelajaran) params.set('mataPelajaran', filters.mataPelajaran)
    if (filters?.semester) params.set('semester', filters.semester)
    
    return apiFetch<any[]>(`/api/nilai?${params}`)
  },

  async getById(id: string) {
    return apiFetch<any>(`/api/nilai/${id}`)
  },

  async create(data: {
    siswaId: string
    guruId: string
    mataPelajaran: string
    semester: string
    tahunAjaran?: string
    nilaiTugas?: number
    nilaiUTS?: number
    nilaiUAS?: number
    catatan?: string
  }) {
    return apiFetch<any>('/api/nilai', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(id: string, data: Partial<any>) {
    return apiFetch<any>(`/api/nilai/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/nilai/${id}`, {
      method: 'DELETE',
    })
  },
}

// Notifications API
export const notificationsApi = {
  async getAll(userId: string, filters?: { isRead?: boolean; limit?: number }) {
    const params = new URLSearchParams()
    params.set('userId', userId)
    if (filters?.isRead !== undefined) params.set('isRead', filters.isRead.toString())
    if (filters?.limit) params.set('limit', filters.limit.toString())
    
    const response = await fetch(`/api/notifications?${params}`)
    const result: ApiResponse<any[]> = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch notifications')
    }
    
    return {
      data: result.data || [],
      unreadCount: result.unreadCount || 0,
    }
  },

  async create(data: {
    userId: string
    title: string
    message: string
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  }) {
    return apiFetch<any>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async markAsRead(userId: string, notificationId?: string) {
    return apiFetch<void>('/api/notifications', {
      method: 'PATCH',
      body: JSON.stringify({
        userId,
        notificationId,
        markAllAsRead: !notificationId,
      }),
    })
  },

  async delete(id: string) {
    return apiFetch<void>(`/api/notifications?id=${id}`, {
      method: 'DELETE',
    })
  },

  async deleteAllRead(userId: string) {
    return apiFetch<void>(`/api/notifications?userId=${userId}&deleteAll=true`, {
      method: 'DELETE',
    })
  },
}

// Export combined API client
export const apiClient = {
  siswa: siswaApi,
  kuis: kuisApi,
  materi: materiApi,
  chat: chatApi,
  kelas: kelasApi,
  nilai: nilaiApi,
  notifications: notificationsApi,
}
