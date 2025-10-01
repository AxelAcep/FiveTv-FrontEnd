"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../../../components/DetailArtikelPage.module.css";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaWhatsapp, FaXTwitter, FaLink } from "react-icons/fa6";
import { getDetailByKode, getRekomenKonten } from "../../../../services/UserServices";
import { DetailResponse, Konten } from "../../../../model/UserModel";
import RecomendationCard from "../../../../components/Recomendation";

export default function DetailArticle() {
  const params = useParams();
  const kodeKonten = params?.kodeKonten as string;

  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rekomen, setRekomen] = useState<Konten | null>(null);

  useEffect(() => {
    if (!kodeKonten) return;

    const fetchData = async () => {
      try {
        const result = await getDetailByKode(kodeKonten);
        setData(result);
      } catch (err) {
        console.error("Error fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRekomen = async () => {
      try {
        const result = await getRekomenKonten();
        setRekomen(result);
      } catch (err) {
        console.error("Error fetch rekomen:", err);
      }
    };

    fetchData();
    fetchRekomen();
  }, [kodeKonten]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Memuat data...</div>
      </div>
    );
  }

  if (!data) {
    return <p className={styles.loading}>Data tidak ditemukan</p>;
  }

  const { konten, kontenTerpopuler, kontenTerbaru } = data;

  // Dapatkan URL halaman sekarang secara dinamis, hanya di client side
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Encode judul artikel sebagai teks share
  const shareText = encodeURIComponent(konten.judul || 'Baca artikel menarik ini');

  // URL share untuk WhatsApp
  const whatsappShareUrl = `https://wa.me/?text=${shareText}%20${encodeURIComponent(currentUrl)}`;

  // URL share untuk Twitter
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(currentUrl)}`;

  return (
    <section className={styles.noPaddingMain}>
      {/* Cover */}
      <img
        className={styles.coverImage}
        src={konten.linkGambar || "/images/dummy.png"}
        alt={konten.judul}
      />

      {/* Judul */}
      <h1 className={styles.HeaderText}>{konten.judul}</h1>

      {/* Info Row */}
      <div className={styles.infoRow}>
        <div className={styles.infoLeft}>
          <span className={styles.infoItem}>
            <FaRegCalendarAlt />{" "}
            {new Date(konten.tanggal).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.infoItem}>
            Sumber : <a href="#">FiveTv</a>
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.infoItem}>
            Reporter : <a href="#">{konten.Reporter}</a>
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.infoItem}>
            Editor : <a href="#">{konten.Editor}</a>
          </span>
          <span className={styles.separator}>|</span>
          <span className={styles.infoItem}>
            Views : <a href="#">{konten.view}</a>
          </span>
        </div>

        {/* Share */}
        <div className={styles.infoRight}>
          <span>Bagikan :</span>
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            className={styles.icon}
          >
            <FaWhatsapp />
          </a>
          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
            className={styles.icon}
          >
            <FaXTwitter />
          </a>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(currentUrl);
                alert('Link telah disalin ke clipboard!');
              } else {
                alert('Fitur salin clipboard tidak tersedia di browser ini.');
              }
            }}
            aria-label="Copy link"
            className={styles.icon}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <FaLink />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.infoRow}>
        <div className={styles.leftArticle}>
          <div
            className={styles.articleContent}
            dangerouslySetInnerHTML={{ __html: konten.isiHTML }}
          />
        </div>

        {/* Sidebar */}
        <div className={styles.rightArticle}>
          {/* Populer */}
          <div className={styles.rightColumn2}>
            <h2 className={styles.populerTitle}>Berita Terpopuler</h2>
            {kontenTerpopuler.map((item) => (
              <a
                key={item.kodeKonten}
                className={styles.populerItem}
                href={`/artikel/${item.kodeKonten}`}
              >
                <span className={styles.icon}>✦</span>
                <div>
                  <h4>{item.judul}</h4>
                  <span
                    className={`${styles.tag} ${
                      item.kategori === "program"
                        ? styles.program
                        : styles.article
                    }`}
                  >
                    {item.kategori}
                  </span>
                  <span className={styles.date}>
                    📅{" "}
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Terbaru */}
          <div className={styles.rightColumn2}>
            <h2 className={styles.populerTitle}>Berita Terbaru</h2>
            {kontenTerbaru.map((item) => (
              <a
                key={item.kodeKonten}
                className={styles.populerItem}
                href={`/artikel/${item.kodeKonten}`}
              >
                <span className={styles.icon}>✦</span>
                <div>
                  <h4>{item.judul}</h4>
                  <span
                    className={`${styles.tag} ${
                      item.kategori === "program"
                        ? styles.program
                        : styles.article
                    }`}
                  >
                    {item.kategori}
                  </span>
                  <span className={styles.date}>
                    📅{" "}
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* 🔹 Rekomendasi Card */}
        {rekomen && (
          <RecomendationCard
            imageUrl={rekomen.linkGambar || "/images/dummy.png"}
            title={rekomen.judul}
            description={rekomen.isiHTML}
            kodeKonten={rekomen.kodeKonten}
          />
        )}
      </div>
    </section>
  );
}
