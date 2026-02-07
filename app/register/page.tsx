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
