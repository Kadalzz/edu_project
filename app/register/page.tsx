"use client"

import Link from "next/link"
import { BookOpen, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EduSpecial</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Ditutup</h1>
          <p className="text-gray-600">Pembuatan akun hanya dapat dilakukan oleh admin</p>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Registrasi Mandiri Tidak Tersedia</h2>
              <p className="text-sm text-gray-600">
                Untuk mendapatkan akun EduSpecial, silakan hubungi administrator sekolah. 
                Admin akan membuatkan akun untuk Anda dengan informasi yang diperlukan.
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">Sudah punya akun?</p>
            <Link 
              href="/login"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition text-center"
            >
              Masuk ke Akun
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Hubungi admin sekolah untuk informasi lebih lanjut
        </p>
      </div>
    </div>
  )
}
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data: any = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as string,
    }
    
    // Add student data if role is PARENT
    if (data.role === "PARENT") {
      data.studentData = {
        studentName: formData.get("studentName") as string,
        nis: formData.get("nis") as string,
        phone: formData.get("phone") as string,
        specialNeeds: formData.get("specialNeeds") as string,
      }
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
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Pilih role</option>
                <option value="PARENT">Orang Tua</option>
                <option value="GURU">Guru</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {selectedRole === "PARENT" ? "Anda akan mendaftarkan anak Anda sebagai murid" : "Admin akan dibuat oleh sistem administrator"}
              </p>
            </div>
            
            {/* Student Data Fields - Only show if PARENT */}
            {selectedRole === "PARENT" && (
              <>
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Murid</h3>
                </div>
                
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Murid <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    required={selectedRole === "PARENT"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Nama lengkap murid"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nis" className="block text-sm font-medium text-gray-700 mb-2">
                      NIS <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nis"
                      name="nis"
                      type="text"
                      required={selectedRole === "PARENT"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      No. Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required={selectedRole === "PARENT"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="08123456789"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 mb-2">
                    Kebutuhan Khusus <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="specialNeeds"
                    name="specialNeeds"
                    required={selectedRole === "PARENT"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Pilih kebutuhan khusus</option>
                    <option value="Autisme">Autisme</option>
                    <option value="ADHD">ADHD</option>
                    <option value="Disleksia">Disleksia</option>
                    <option value="Diskalkulia">Diskalkulia</option>
                    <option value="Down Syndrome">Down Syndrome</option>
                    <option value="Slow Learner">Slow Learner</option>
                    <option value="Cerebral Palsy">Cerebral Palsy</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </>
            )}

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
