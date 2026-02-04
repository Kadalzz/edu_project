"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Login gagal")
        setLoading(false)
        return
      }

      // Redirect based on role
      if (result.user.role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (result.user.role === "GURU") {
        router.push("/guru/dashboard")
      } else if (result.user.role === "PARENT") {
        router.push("/parent/dashboard")
      } else {
        router.push("/student/dashboard")
      }
      
      router.refresh()
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
          <p className="text-gray-600">Masuk ke akun Anda</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Dengan masuk, Anda menyetujui{" "}
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Syarat & Ketentuan
          </Link>
        </p>
      </div>
    </div>
  )
}
