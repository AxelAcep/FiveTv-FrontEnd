import React, { useState, useEffect } from 'react';
// Pastikan path ke file API kamu sudah benar
import { getAllArticle, getAllKegiatan, getTrending } from '../../services/api'; // Sesuaikan path

// Define interfaces for your data
interface Konten {
  kodeKonten: string;
  penulis: string;
  tanggal: string;
  isiHTML: string;
  linkGambar?: string;
  view: number;
  kategori?: string;
}

const Home = () => {
  const [articles, setArticles] = useState<Konten[]>([]);
  const [kegiatan, setKegiatan] = useState<Konten[]>([]);
  const [trending, setTrending] = useState<Konten[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Ambil semua artikel
        const articlesData = await getAllArticle();
        setArticles(articlesData);

        // Ambil semua kegiatan
        const kegiatanData = await getAllKegiatan();
        setKegiatan(kegiatanData);

        // Ambil konten trending
        const trendingData = await getTrending();
        setTrending(trendingData);

        setLoading(false); // Selesai memuat data
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        setLoading(false); // Selesai memuat (dengan error)
      }
    }

    fetchData();
  }, []); // Array dependensi kosong agar hanya berjalan sekali saat komponen di-mount

  if (loading) {
    return <h1>Memuat Data...</h1>;
  }

  if (error) {
    return <h1 style={{ color: 'red' }}>Error: {error}</h1>;
  }

  return (
    <div>
      <h1>Home Page</h1>

      ---

      <h2>Artikel Terbaru</h2>
      {articles.length > 0 ? (
        <ul>
          {articles.map((article) => (
            <li key={article.kodeKonten}>
              <h3>{article.penulis} - {new Date(article.tanggal).toLocaleDateString()}</h3>
              <p>{article.isiHTML.substring(0, 100)}...</p> {/* Tampilkan sebagian isiHTML */}
              {article.linkGambar && <img src={article.linkGambar} alt="Gambar Artikel" style={{ maxWidth: '200px' }} />}
              <p>Views: {article.view}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada artikel yang tersedia.</p>
      )}

      ---

      <h2>Kegiatan Terbaru</h2>
      {kegiatan.length > 0 ? (
        <ul>
          {kegiatan.map((item) => (
            <li key={item.kodeKonten}>
              <h3>{item.penulis} - {new Date(item.tanggal).toLocaleDateString()}</h3>
              <p>{item.isiHTML.substring(0, 100)}...</p>
              {item.linkGambar && <img src={item.linkGambar} alt="Gambar Kegiatan" style={{ maxWidth: '200px' }} />}
              <p>Views: {item.view}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada kegiatan yang tersedia.</p>
      )}

      ---

      <h2>Konten Trending (Paling Banyak Dilihat)</h2>
      {trending.length > 0 ? (
        <ul>
          {trending.map((item) => (
            <li key={item.kodeKonten}>
              <h3>{item.penulis} - {item.kategori}</h3>
              <p>{item.isiHTML.substring(0, 100)}...</p>
              {item.linkGambar && <img src={item.linkGambar} alt="Gambar Trending" style={{ maxWidth: '200px' }} />}
              <p>Total Views: {item.view}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Tidak ada konten trending saat ini.</p>
      )}
    </div>
  );
};

export default Home;