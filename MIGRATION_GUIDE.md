# Migration Guide: localStorage to API

## Overview
This guide shows how to migrate from localStorage to backend API calls.

---

## Example 1: Kuis Management

### Before (localStorage)

```typescript
"use client"
import { useState, useEffect } from "react"

export default function KuisPage() {
  const [kuisList, setKuisList] = useState([])
  const [loading, setLoading] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("kuis")
    if (stored) {
      setKuisList(JSON.parse(stored))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("kuis", JSON.stringify(kuisList))
  }, [kuisList])

  const handleCreate = (newKuis) => {
    setKuisList([...kuisList, { ...newKuis, id: Date.now().toString() }])
  }

  const handleDelete = (id) => {
    setKuisList(kuisList.filter(k => k.id !== id))
  }

  // ... rest of component
}
```

### After (API)

```typescript
"use client"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export default function KuisPage() {
  const [kuisList, setKuisList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const guruId = "current-guru-id" // Get from session/auth

  // Load from API
  useEffect(() => {
    loadKuis()
  }, [])

  const loadKuis = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.kuis.getAll({ guruId })
      setKuisList(data)
    } catch (err) {
      setError(err.message)
      console.error("Failed to load kuis:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (newKuis) => {
    try {
      setLoading(true)
      const created = await apiClient.kuis.create({
        guruId,
        ...newKuis
      })
      setKuisList([...kuisList, created])
      // Show success notification
    } catch (err) {
      setError(err.message)
      // Show error notification
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      await apiClient.kuis.delete(id)
      setKuisList(kuisList.filter(k => k.id !== id))
      // Show success notification
    } catch (err) {
      setError(err.message)
      // Show error notification
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // ... rest of component
}
```

---

## Example 2: Chat Messages

### Before (localStorage)

```typescript
const [messages, setMessages] = useState([])

useEffect(() => {
  const stored = localStorage.getItem(`chat_${userId}_${otherUserId}`)
  if (stored) {
    setMessages(JSON.parse(stored))
  }
}, [userId, otherUserId])

const sendMessage = (text) => {
  const newMsg = {
    id: Date.now(),
    from: userId,
    to: otherUserId,
    message: text,
    timestamp: new Date().toISOString()
  }
  setMessages([...messages, newMsg])
  localStorage.setItem(`chat_${userId}_${otherUserId}`, JSON.stringify([...messages, newMsg]))
}
```

### After (API)

```typescript
const [messages, setMessages] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  loadMessages()
}, [userId, otherUserId])

const loadMessages = async () => {
  try {
    setLoading(true)
    const data = await apiClient.chat.getMessages(userId, otherUserId)
    setMessages(data)
  } catch (err) {
    console.error("Failed to load messages:", err)
  } finally {
    setLoading(false)
  }
}

const sendMessage = async (text) => {
  try {
    const newMsg = await apiClient.chat.sendMessage({
      fromUserId: userId,
      toUserId: otherUserId,
      message: text
    })
    setMessages([...messages, newMsg])
  } catch (err) {
    console.error("Failed to send message:", err)
  }
}

// Mark messages as read when viewing conversation
useEffect(() => {
  if (messages.length > 0) {
    apiClient.chat.markAsRead(userId, otherUserId)
  }
}, [messages, userId, otherUserId])
```

---

## Example 3: Notifications

### Before (localStorage)

```typescript
const [notifications, setNotifications] = useState([])

useEffect(() => {
  const stored = localStorage.getItem("notifications")
  if (stored) {
    setNotifications(JSON.parse(stored))
  }
}, [])

const markAllAsRead = () => {
  const updated = notifications.map(n => ({ ...n, isRead: true }))
  setNotifications(updated)
  localStorage.setItem("notifications", JSON.stringify(updated))
}
```

### After (API)

```typescript
const [notifications, setNotifications] = useState([])
const [unreadCount, setUnreadCount] = useState(0)

useEffect(() => {
  loadNotifications()
}, [])

const loadNotifications = async () => {
  try {
    const { data, unreadCount } = await apiClient.notifications.getAll(userId)
    setNotifications(data)
    setUnreadCount(unreadCount)
  } catch (err) {
    console.error("Failed to load notifications:", err)
  }
}

const markAllAsRead = async () => {
  try {
    await apiClient.notifications.markAsRead(userId) // No notificationId = mark all
    await loadNotifications() // Reload to get updated data
  } catch (err) {
    console.error("Failed to mark as read:", err)
  }
}

// Delete all read notifications
const clearReadNotifications = async () => {
  try {
    await apiClient.notifications.deleteAllRead(userId)
    await loadNotifications()
  } catch (err) {
    console.error("Failed to delete notifications:", err)
  }
}
```

---

## Example 4: Student (Siswa) Management

### Before (localStorage)

```typescript
const [students, setStudents] = useState([])

useEffect(() => {
  const stored = localStorage.getItem("students")
  if (stored) {
    setStudents(JSON.parse(stored))
  }
}, [])

const addStudent = (student) => {
  const newStudent = { ...student, id: Date.now().toString() }
  const updated = [...students, newStudent]
  setStudents(updated)
  localStorage.setItem("students", JSON.stringify(updated))
}
```

### After (API)

```typescript
const [students, setStudents] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  loadStudents()
}, [])

const loadStudents = async (kelasId?: string, search?: string) => {
  try {
    setLoading(true)
    const data = await apiClient.siswa.getAll({ kelasId, search })
    setStudents(data)
  } catch (err) {
    console.error("Failed to load students:", err)
  } finally {
    setLoading(false)
  }
}

const addStudent = async (student) => {
  try {
    setLoading(true)
    const created = await apiClient.siswa.create(student)
    setStudents([...students, created])
  } catch (err) {
    console.error("Failed to add student:", err)
  } finally {
    setLoading(false)
  }
}

const updateStudent = async (id: string, updates: Partial<any>) => {
  try {
    setLoading(true)
    const updated = await apiClient.siswa.update(id, updates)
    setStudents(students.map(s => s.id === id ? updated : s))
  } catch (err) {
    console.error("Failed to update student:", err)
  } finally {
    setLoading(false)
  }
}
```

---

## Example 5: Grades (Nilai) with Auto-Calculation

### After (API)

```typescript
const [grades, setGrades] = useState([])

useEffect(() => {
  loadGrades()
}, [])

const loadGrades = async (siswaId?: string) => {
  try {
    const data = await apiClient.nilai.getAll({ siswaId })
    setGrades(data)
  } catch (err) {
    console.error("Failed to load grades:", err)
  }
}

const createGrade = async (data: {
  siswaId: string
  guruId: string
  mataPelajaran: string
  semester: string
  nilaiTugas: number
  nilaiUTS: number
  nilaiUAS: number
}) => {
  try {
    // API will auto-calculate nilaiAkhir and predikat
    const created = await apiClient.nilai.create(data)
    setGrades([...grades, created])
    console.log(`Final grade: ${created.nilaiAkhir}, Predicate: ${created.predikat}`)
  } catch (err) {
    console.error("Failed to create grade:", err)
  }
}

const updateGrade = async (id: string, updates: {
  nilaiTugas?: number
  nilaiUTS?: number
  nilaiUAS?: number
}) => {
  try {
    // API will auto-recalculate based on new values
    const updated = await apiClient.nilai.update(id, updates)
    setGrades(grades.map(g => g.id === id ? updated : g))
  } catch (err) {
    console.error("Failed to update grade:", err)
  }
}
```

---

## Best Practices

### 1. Error Handling

```typescript
const handleApiCall = async (apiFunc: () => Promise<any>) => {
  try {
    setLoading(true)
    setError(null)
    const result = await apiFunc()
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : "An error occurred"
    setError(message)
    // Show toast notification
    console.error(message)
  } finally {
    setLoading(false)
  }
}

// Usage
await handleApiCall(() => apiClient.kuis.create(data))
```

### 2. Optimistic Updates

```typescript
const handleDelete = async (id: string) => {
  // Optimistic update
  const previousList = [...kuisList]
  setKuisList(kuisList.filter(k => k.id !== id))
  
  try {
    await apiClient.kuis.delete(id)
    // Success - UI already updated
  } catch (err) {
    // Rollback on error
    setKuisList(previousList)
    console.error("Failed to delete:", err)
  }
}
```

### 3. Loading States

```typescript
const [loading, setLoading] = useState({
  list: false,
  create: false,
  update: false,
  delete: false
})

const loadKuis = async () => {
  setLoading(prev => ({ ...prev, list: true }))
  try {
    const data = await apiClient.kuis.getAll({ guruId })
    setKuisList(data)
  } finally {
    setLoading(prev => ({ ...prev, list: false }))
  }
}

// In render
{loading.list && <Spinner />}
{loading.create && <ButtonSpinner />}
```

### 4. Debounced Search

```typescript
import { useDebounce } from "@/hooks/useDebounce"

const [search, setSearch] = useState("")
const debouncedSearch = useDebounce(search, 500)

useEffect(() => {
  loadKuis()
}, [debouncedSearch])

const loadKuis = async () => {
  const data = await apiClient.kuis.getAll({
    guruId,
    search: debouncedSearch
  })
  setKuisList(data)
}

// In input
<input 
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search..."
/>
```

### 5. Pagination (if implemented)

```typescript
const [page, setPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const loadMore = async () => {
  try {
    const data = await apiClient.kuis.getAll({
      guruId,
      page,
      limit: 10
    })
    
    if (data.length < 10) {
      setHasMore(false)
    }
    
    setKuisList([...kuisList, ...data])
    setPage(page + 1)
  } catch (err) {
    console.error("Failed to load more:", err)
  }
}
```

---

## Migration Checklist

- [ ] Replace localStorage reads with API GET calls
- [ ] Replace localStorage writes with API POST/PATCH calls
- [ ] Add loading states
- [ ] Add error handling
- [ ] Remove localStorage cleanup
- [ ] Test all CRUD operations
- [ ] Handle edge cases (empty data, errors)
- [ ] Add optimistic updates where appropriate
- [ ] Implement proper TypeScript types
- [ ] Add user feedback (toasts, notifications)

---

## Testing Migration

1. **Remove old localStorage data**
   ```typescript
   localStorage.removeItem('kuis')
   localStorage.removeItem('students')
   // etc.
   ```

2. **Test each operation:**
   - Create new item
   - Read/list items
   - Update item
   - Delete item
   - Refresh page to verify persistence

3. **Test error scenarios:**
   - Network offline
   - Invalid data
   - Server errors
   - Concurrent modifications

---

## Next Steps After Migration

1. Add authentication checks
2. Implement real-time updates (WebSocket/polling)
3. Add caching with SWR or React Query
4. Implement pagination for large datasets
5. Add filtering and sorting
6. Optimize with server components where possible
