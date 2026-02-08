"use client"

import Link from "next/link"
import { Users, GraduationCap, Settings as SettingsIcon, Bell, LogOut, Search, ArrowLeft, BarChart3, Shield, Database, Mail, Key, Globe, Clock } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

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

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl shadow-xl rounded-r-3xl">
        <div className="p-6 text-center border-b border-purple-100">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EDUSPECIAL</h1>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Management</p>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Kelola User</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition">
            <div className="w-8 h-8 mr-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
            <span className="font-medium">Analytics</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-xl shadow-sm">
            <div className="w-8 h-8 mr-3 bg-purple-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">Settings</span>
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
                placeholder="search student"
                className="w-full pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-2xl">
              <img src="https://ui-avatars.com/api/?name=Admin&background=8b5cf6&color=fff" alt="Admin" className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl hover:bg-white/90 transition relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                  </div>
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500">Belum ada notifikasi</p>
                  </div>
                </div>
              )}
            </div>

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
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="mr-4 p-2 hover:bg-purple-50 rounded-xl transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Pengaturan dan konfigurasi sistem</p>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Settings */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mr-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Keamanan Sistem</h3>
                  <p className="text-xs text-gray-500">Kelola keamanan dan akses</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Tingkatkan keamanan akun</p>
                  </div>
                  <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition">
                    Aktifkan
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Session Timeout</p>
                    <p className="text-xs text-gray-500">Auto logout setelah 30 menit</p>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" checked readOnly className="mr-2" />
                    <span className="text-xs text-green-600 font-medium">Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Management */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mr-3">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Database</h3>
                  <p className="text-xs text-gray-500">Backup dan maintenance</p>
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">Backup Database</p>
                    <p className="text-xs text-gray-500">Terakhir: Belum ada backup</p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">Backup</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-700">Optimize Database</p>
                    <p className="text-xs text-gray-500">Bersihkan data tidak terpakai</p>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">Optimize</span>
                </button>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mr-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Notifikasi Email</h3>
                  <p className="text-xs text-gray-500">Kelola pengiriman email</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Notifikasi Guru</p>
                    <p className="text-xs text-gray-500">Kirim update ke guru</p>
                  </div>
                  <input type="checkbox" defaultChecked className="scale-110" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email Notifikasi Orang Tua</p>
                    <p className="text-xs text-gray-500">Kirim laporan ke orang tua</p>
                  </div>
                  <input type="checkbox" defaultChecked className="scale-110" />
                </div>
                <button className="w-full p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition text-sm font-medium">
                  Konfigurasi SMTP
                </button>
              </div>
            </div>

            {/* API & Integration */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mr-3">
                  <Key className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">API & Integration</h3>
                  <p className="text-xs text-gray-500">Kelola API keys</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">API Key</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value="••••••••••••••••" 
                      readOnly 
                      className="flex-1 px-3 py-2 bg-white rounded-lg text-xs border border-gray-200"
                    />
                    <button className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-200 transition">
                      Generate
                    </button>
                  </div>
                </div>
                <button className="w-full p-3 bg-orange-50 text-orange-700 rounded-xl hover:bg-orange-100 transition text-sm font-medium">
                  Dokumentasi API
                </button>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mr-3">
                  <Globe className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Pengaturan Umum</h3>
                  <p className="text-xs text-gray-500">Konfigurasi dasar sistem</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Nama Sekolah</label>
                  <input 
                    type="text" 
                    defaultValue="EDUSPECIAL" 
                    className="w-full px-3 py-2 bg-white rounded-lg text-sm border border-gray-200 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Zona Waktu</label>
                  <select className="w-full px-3 py-2 bg-white rounded-lg text-sm border border-gray-200 focus:ring-2 focus:ring-purple-500">
                    <option>WIB (GMT+7)</option>
                    <option>WITA (GMT+8)</option>
                    <option>WIT (GMT+9)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mr-3">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Informasi Sistem</h3>
                  <p className="text-xs text-gray-500">Status dan versi</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Versi Aplikasi</span>
                  <span className="text-sm font-medium text-gray-800">v1.0.0</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Database Status</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-800">8 Feb 2026</span>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Environment</span>
                  <span className="text-sm font-medium text-gray-800">Production</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perubahan akan disimpan secara otomatis</p>
                <p className="text-xs text-gray-500 mt-1">Terakhir disimpan: Baru saja</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-medium shadow-lg">
                Simpan Semua Perubahan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
