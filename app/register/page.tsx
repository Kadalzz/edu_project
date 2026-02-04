"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as string,
    }

    // Validation
    if (data.password !== data.confirmPassword) {
      setError("Password tidak cocok")
      setLoading(false)
      return
    }

    if (data.password.length < 6) {
      setError("Password minimal 6 karakter")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Terjadi kesalahan")
        setLoading(false)
        return
      }

      // Redirect to login
      router.push("/login?registered=true")
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduSpecial</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-600">Daftar untuk memulai</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Daftar Sebagai
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Pilih role</option>
                <option value="PARENT">Orang Tua</option>
                <option value="GURU">Guru</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Admin akan dibuat oleh sistem administrator
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Syarat & Ketentuan
          </Link>
        </p>
      </div>
    </div>
  )
}
