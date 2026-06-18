import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-canvas">
      <div className="card-hover p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">404</div>
        <h2 className="font-playfair italic text-2xl text-white mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-text-secondary text-sm mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link href="/" className="btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
