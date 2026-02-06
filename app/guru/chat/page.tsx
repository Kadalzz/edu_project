"use client"

import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile, Image, FileText, GraduationCap, Users, ClipboardList, MessageSquare, Bell, LogOut, BookOpen, Check, CheckCheck, Circle } from "lucide-react"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

const conversations = [
  {
    id: 1,
    name: "Ibu Sarah (Ortu Ahmad)",
    avatar: "S",
    lastMessage: "Terima kasih bu guru untuk update kemajuan Ahmad",
    time: "10:30",
    unread: 2,
    online: true,
    role: "Orang Tua"
  },
  {
    id: 2,
    name: "Bpk. Rudi (Ortu Budi)",
    avatar: "R",
    lastMessage: "Baik bu, akan saya pantau di rumah",
    time: "09:15",
    unread: 0,
    online: true,
    role: "Orang Tua"
  },
  {
    id: 3,
    name: "Ibu Dewi (Ortu Citra)",
    avatar: "D",
    lastMessage: "Apakah ada tugas untuk minggu depan?",
    time: "Kemarin",
    unread: 1,
    online: false,
    role: "Orang Tua"
  },
  {
    id: 4,
    name: "Bpk. Agus (Ortu Dani)",
    avatar: "A",
    lastMessage: "Foto kegiatan sudah saya terima ya bu",
    time: "Kemarin",
    unread: 0,
    online: false,
    role: "Orang Tua"
  },
  {
    id: 5,
    name: "Ibu Rina (Ortu Eva)",
    avatar: "R",
    lastMessage: "Eva hari ini tidak masuk ya bu, sedang demam",
    time: "2 hari",
    unread: 0,
    online: false,
    role: "Orang Tua"
  },
  {
    id: 6,
    name: "Admin Sekolah",
    avatar: "A",
    lastMessage: "Jadwal rapat sudah dikirim ke email",
    time: "3 hari",
    unread: 0,
    online: true,
    role: "Admin"
  },
]

const messages = [
  {
    id: 1,
    sender: "other",
    text: "Selamat pagi bu guru, bagaimana perkembangan Ahmad di kelas hari ini?",
    time: "09:00",
    status: "read"
  },
  {
    id: 2,
    sender: "me",
    text: "Selamat pagi Ibu Sarah. Ahmad hari ini menunjukkan kemajuan yang baik dalam kegiatan mengenal angka. Dia sudah bisa mengidentifikasi angka 1-5 dengan bantuan minimal.",
    time: "09:05",
    status: "read"
  },
  {
    id: 3,
    sender: "other",
    text: "Alhamdulillah, senang mendengarnya bu. Apakah ada yang perlu kami latih di rumah?",
    time: "09:10",
    status: "read"
  },
  {
    id: 4,
    sender: "me",
    text: "Iya bu, mohon bantuannya untuk melatih Ahmad menghitung benda-benda di sekitar rumah. Bisa mulai dari menghitung mainan atau buah-buahan. Repetisi yang konsisten akan sangat membantu.",
    time: "09:15",
    status: "read"
  },
  {
    id: 5,
    sender: "me",
    text: "Saya juga akan mengirimkan beberapa flashcard angka yang bisa dicetak untuk latihan di rumah.",
    time: "09:16",
    status: "read"
  },
  {
    id: 6,
    sender: "other",
    text: "Baik bu, akan kami lakukan. Terima kasih banyak atas bimbingannya.",
    time: "10:25",
    status: "read"
  },
  {
    id: 7,
    sender: "other",
    text: "Terima kasih bu guru untuk update kemajuan Ahmad",
    time: "10:30",
    status: "delivered"
  },
]

const notifications = [
  { id: 1, title: 'Tugas baru dari Andi Pratama', message: 'Matematika Kelas A', time: '5 menit lalu', unread: true },
  { id: 2, title: 'Kuis diselesaikan oleh Siti', message: 'Bahasa Indonesia', time: '20 menit lalu', unread: true },
  { id: 3, title: 'Pesan dari Orang Tua', message: 'Ibu Sarah mengirim pesan', time: '1 jam lalu', unread: false },
  { id: 4, title: 'Reminder: Meeting', message: 'Meeting dengan wali murid jam 14:00', time: '2 jam lalu', unread: false },
]

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSend = () => {
    if (newMessage.trim()) {
      // Handle send message
      setNewMessage("")
    }
  }

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
          <Link href="/guru/kuis" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Kuis & Penilaian</span>
          </Link>
          <Link href="/guru/materi" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Materi</span>
          </Link>
          <Link href="/guru/chat" className="flex items-center px-4 py-3 text-green-600 bg-green-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">Chat</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content - Chat Interface */}
      <main className="flex-1 flex overflow-hidden p-4">
        {/* Conversation List */}
        <div className="w-80 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl mr-4 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Pesan</h2>
              <div className="flex items-center space-x-2">
                {/* Notification Button with Dropdown */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 bg-white rounded-xl hover:bg-gray-100 transition relative"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
                  className="p-2 bg-white rounded-xl hover:bg-gray-100 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari percakapan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-300 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full flex items-center p-3 rounded-xl mb-1 transition text-left ${
                  selectedConversation.id === conv.id 
                    ? 'bg-green-50 border border-green-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    conv.role === 'Admin' ? 'bg-purple-500' : 'bg-gradient-to-br from-green-400 to-blue-500'
                  }`}>
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-400">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedConversation.avatar}
                </div>
                {selectedConversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-800">{selectedConversation.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedConversation.online ? (
                    <span className="flex items-center">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-1" />
                      Online
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Hari ini</span>
            </div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-3 rounded-2xl ${
                  msg.sender === 'me' 
                    ? 'bg-green-500 text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    msg.sender === 'me' ? 'text-green-100' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === 'me' && (
                      msg.status === 'read' 
                        ? <CheckCheck className="w-4 h-4" />
                        : <Check className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
                <Image className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Ketik pesan..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent text-sm"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Smile className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <button 
                onClick={handleSend}
                className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
