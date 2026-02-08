"use client"

import Link from "next/link"
import { Users, BookOpen, User, FileText, MessageSquare, Calendar, ArrowRight, Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

interface Props {
  userName: string
  userId: string
}

interface Conversation {
  partnerId: string
  partner: { id: string; name: string; email: string; role: string }
  lastMessage: any
  unreadCount: number
}

interface Message {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  createdAt: string
  fromUser: { id: string; name: string }
  toUser: { id: string; name: string }
}

export default function ChatClient({ userName, userId }: Props) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.partnerId)
    }
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chat?userId=${userId}`)
      const data = await response.json()
      if (data.success && data.data?.conversations) {
        setConversations(data.data.conversations)
        // Auto-select first conversation
        if (data.data.conversations.length > 0) {
          setSelectedConversation(data.data.conversations[0])
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/chat?userId=${userId}&otherUserId=${otherUserId}`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.data.reverse())
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedConversation) return

    try {
      setSending(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: userId,
          toUserId: selectedConversation.partnerId,
          message: message.trim()
        })
      })
      const data = await response.json()
      if (data.success) {
        setMessage('')
        fetchMessages(selectedConversation.partnerId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-orange-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Parent Portal</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/parent/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/parent/anak-saya" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Anak Saya</span>
          </Link>
          <Link href="/parent/laporan" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Laporan Belajar</span>
          </Link>
          <Link href="/parent/chat" className="flex items-center px-4 py-3 text-orange-600 bg-orange-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-orange-600" />
            </div>
            <span className="font-medium">Chat Guru</span>
          </Link>
          <Link href="/parent/jadwal" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Jadwal Temu</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-3">
            <p className="text-xs font-semibold text-purple-800 mb-2">Mode Siswa</p>
            <Link href="/student/dashboard" className="flex items-center justify-between text-purple-600 hover:text-purple-700">
              <span className="text-sm font-medium">Switch Mode</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Chat dengan Guru</h1>
          <p className="text-gray-600 mt-1">Komunikasi langsung dengan wali kelas</p>
        </div>

        <div className="flex-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-100 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-pink-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {selectedConversation?.partner?.name?.charAt(0) || 'G'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedConversation?.partner?.name || 'Guru Wali Kelas'}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedConversation?.partner?.role === 'GURU' ? 'Guru' : 'Online'}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-orange-400 mx-auto mb-3 animate-spin" />
                <p className="text-gray-400 text-sm">Memuat pesan...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Belum ada pesan. Mulai percakapan dengan guru</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromMe = msg.fromUserId === userId
                    return (
                      <div key={msg.id} className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-2xl px-4 py-3 max-w-md ${
                          isFromMe 
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 rounded-tr-none' 
                            : 'bg-gray-100 rounded-tl-none'
                        }`}>
                          <p className={`text-sm ${isFromMe ? 'text-white' : 'text-gray-800'}`}>{msg.message}</p>
                          <p className={`text-xs mt-1 ${isFromMe ? 'text-orange-100' : 'text-gray-500'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ketik pesan..."
                disabled={!selectedConversation || sending}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-50"
              />
              <button 
                onClick={sendMessage}
                disabled={!message.trim() || !selectedConversation || sending}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="font-medium">Kirim</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
