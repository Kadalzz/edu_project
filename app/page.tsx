import Link from "next/link";
import { BookOpen, Users, BarChart3, MessageSquare, Award, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">EduSpecial</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
              >
                Masuk
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistem Manajemen Pembelajaran
            <span className="block text-blue-600 mt-2">Anak Berkebutuhan Khusus</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform terpadu untuk guru, orang tua, dan siswa. 
            Monitoring perkembangan, pembelajaran interaktif, dan komunikasi yang lebih erat.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Mulai Sekarang
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Fitur Unggulan
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pembelajaran Interaktif
            </h3>
            <p className="text-gray-600">
              Kuis live & homework, materi digital, dan konten multimedia untuk pengalaman belajar yang menarik.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Monitoring Orang Tua
            </h3>
            <p className="text-gray-600">
              Pantau perkembangan anak real-time, laporan belajar di rumah, dan komunikasi langsung dengan guru.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Analisis & Laporan
            </h3>
            <p className="text-gray-600">
              Dashboard analytics, progress report, dan visualisasi perkembangan siswa yang komprehensif.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Komunikasi Terpadu
            </h3>
            <p className="text-gray-600">
              Chat real-time guru-orang tua, pengajuan jadwal temu, dan notifikasi penting.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gamifikasi
            </h3>
            <p className="text-gray-600">
              Badges, rewards, dan achievement system untuk meningkatkan motivasi belajar siswa.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Khusus ABK
            </h3>
            <p className="text-gray-600">
              Disesuaikan untuk anak berkebutuhan khusus dengan pendekatan individual dan dokumentasi terapi.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siap Memulai Perjalanan Pembelajaran?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Bergabunglah dengan sekolah-sekolah yang sudah mempercayai kami
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold text-white">EduSpecial</span>
              </div>
              <p className="text-sm">
                Platform manajemen pembelajaran untuk anak berkebutuhan khusus
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Fitur</h3>
              <ul className="space-y-2 text-sm">
                <li>Pembelajaran Interaktif</li>
                <li>Monitoring Orang Tua</li>
                <li>Analisis & Laporan</li>
                <li>Komunikasi Terpadu</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Kontak</h3>
              <p className="text-sm">
                Email: info@eduspecial.com<br />
                Support: support@eduspecial.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 EduSpecial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

