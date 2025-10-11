"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "../../components/HomePage.module.css";
import { getDashboardData } from "../../services/UserServices";
import { DashboardResponse, Konten } from "../../model/UserModel";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ambil data dari API saat mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

  const getTagClass = (kategori: string) => {
    return kategori === "program" ? styles.program : styles.article;
  };

  // mouse drag scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingText}>Terjadi kesalahan: {error}</div>
      </div>
    );
  }

  // data awal
  const kontenTerbaru = dashboardData?.kontenTerbaru || [];
  const kontenTerpopuler = dashboardData?.kontenTerpopuler || [];
  const artikelTerbaru = dashboardData?.artikelTerbaru || [];
  const programTerbaru = dashboardData?.programTerbaru || [];

  // fungsi filter
  const filterAll = (data: Konten[], query: string) => {
    return data.filter((item) =>
      item.judul.toLowerCase().includes(query.toLowerCase())
    );
  };

  const isSearching = query.trim() !== "";

  // data setelah filter
  const filteredKontenTerbaru = filterAll(kontenTerbaru, query);
  const filteredKontenTerpopuler = filterAll(kontenTerpopuler, query);
  const filteredArtikelTerbaru = filterAll(artikelTerbaru, query);
  const filteredProgramTerbaru = filterAll(programTerbaru, query);

  return (
    <section className={styles.section}>
      {/* search bar */}
      <div className={styles.searchContainer}>
        <form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
          <Image
            src="/images/search-icon.png"
            alt="Search"
            width={20}
            height={20}
            className={styles.searchIcon}
          />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>
      </div>

      {/* kalau tidak search tampil default */}
      {!isSearching ? (
        <>
          {/* ===== TOP 3 ===== */}
          <div className={styles.top3}>
            <div className={styles.top3container}>
              {kontenTerbaru[0] && (
                <a
                  className={`${styles.card} ${styles.bigCard}`}
                  href={`/${kontenTerbaru[0].kategori}/${kontenTerbaru[0].kodeKonten}`}
                >
                  <Image
                    src={kontenTerbaru[0].linkGambar || "/images/dummy.png"}
                    alt={kontenTerbaru[0].judul}
                    fill
                    className={styles.cardImage}
                  />
                  <div className={styles.cardOverlay}>
                    <span
                      className={`${styles.tag} ${getTagClass(
                        kontenTerbaru[0].kategori
                      )}`}
                    >
                      {kontenTerbaru[0].kategori}
                    </span>
                    <h2 className={styles.titlesmallcard}>{kontenTerbaru[0].judul}</h2>
                    <p className={styles.date}>
                      📅 {formatDate(kontenTerbaru[0].tanggal)}
                    </p>
                  </div>
                </a>
              )}

              <div className={styles.rightColumn}>
                {kontenTerbaru.slice(1, 3).map((item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.card}
                    href={`/${item.kategori}/${item.kodeKonten}`}
                  >
                    <Image
                      src={item.linkGambar || "/images/dummy.png"}
                      alt={item.judul}
                      fill
                      className={styles.cardImage}
                    />
                    <div className={styles.cardOverlay}>
                      <span
                        className={`${styles.tag} ${getTagClass(item.kategori)}`}
                      >
                        {item.kategori}
                      </span>
                      <h3 className={styles.titlesmallcard}>{item.judul}</h3>
                      <p className={styles.date}>
                        📅 {formatDate(item.tanggal)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ===== NEWEST ===== */}
          <div className={styles.newest}>
            <div className={styles.newestContainer}>
              <h1 className={styles.sectionTitle}>Berita Terbaru</h1>
              <div
                className={styles.scrollRow}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {kontenTerbaru.map((item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.cardSmall}
                    href={`/${item.kategori}/${item.kodeKonten}`}
                  >
                    <img
                      src={item.linkGambar || "/images/dummy.png"}
                      alt={item.judul}
                      className={styles.cardImageSmall}
                    />
                    <div className={styles.cardContent}>
                      <div className={styles.rowCard}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "start",
                            justifyContent: "start",
                            margin: 0,
                          }}
                          className={`${styles.tag} ${getTagClass(
                            item.kategori
                          )}`}
                        >
                          {item.kategori}
                        </div>
                        <p className={styles.date2}>
                          📅 {formatDate(item.tanggal)}
                        </p>
                      </div>
                      <h3 className={styles.titlesmallcard}>{item.judul}</h3>
                      <p className={styles.cardDeskripsi}>
                        {item.isiHTML.replace(/<[^>]+>/g, "").substring(0, 100)}
                        ...
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ===== ARTIKEL & POPULER ===== */}
          <div className={styles.artikelHolder}>
            <div className={styles.artikelContainer}>
              <div className={styles.headerText}>
                <div
                  style={{
                    width: "4px",
                    height: "30px",
                    backgroundColor: "#AB23B3",
                    borderRadius: "8px",
                    border: "1px solid #AB23B3",
                  }}
                ></div>
                <h1>Artikel</h1>
                <a href="/artikel">
                  {" "}
                  <span className={styles.arrow}>→</span>{" "}
                </a>
              </div>

              <div className={styles.container}>
                <div className={styles.leftColumn}>
                  {artikelTerbaru.map((item) => (
                    <a
                      key={item.kodeKonten}
                      className={styles.artikelCard}
                      href={`/${item.kategori}/${item.kodeKonten}`}
                    >
                      <Image
                        src={item.linkGambar || "/images/dummy.png"}
                        alt={item.judul}
                        width={300}
                        height={200}
                        className={styles.artikelImage}
                      />
                      <div className={styles.artikelContent}>
                        <h3>{item.judul}</h3>
                        <p className={styles.date}>
                          📅 {formatDate(item.tanggal)}
                        </p>
                         <p className={styles.cardDeskripsi}>
                        {item.isiHTML.replace(/<[^>]+>/g, "").substring(0, 100)}
                        ...
                      </p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className={styles.rightColumn2}>
                  <h2 className={styles.populerTitle}>Berita Terpopuler </h2>
                  {kontenTerpopuler.map((item) => (
                    <a
                      key={item.kodeKonten}
                      className={styles.populerItem}
                      href={`/${item.kategori}/${item.kodeKonten}`}
                    >
                      <span className={styles.icon}>✦</span>
                      <div>
                        <h4 className={styles.titlesmallcard}>{item.judul}</h4>
                        <span
                          className={`${styles.tag} ${getTagClass(
                            item.kategori
                          )}`}
                        >
                          {item.kategori}
                        </span>
                        <span className={styles.date}>
                          📅 {formatDate(item.tanggal)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== PROGRAM ===== */}
          <div className={styles.programHolder}>
            <div className={styles.programContainer}>
              <div className={styles.programLeft}>
                {programTerbaru.slice(0, 2).map((item) => (
                  <div key={item.kodeKonten} className={styles.cardProgram}>
                    <a
                      className={styles.bigCard}
                      href={`/${item.kategori}/${item.kodeKonten}`}
                    >
                      <Image
                        src={item.linkGambar || "/images/dummy.png"}
                        alt={item.judul}
                        fill
                        className={styles.cardImage}
                      />
                      <div className={styles.cardOverlay}>
                        <span
                          className={`${styles.tag} ${getTagClass(
                            item.kategori
                          )}`}
                        >
                          {item.kategori}
                        </span>
                        <h2 className={styles.titlesmallcard}>{item.judul}</h2>
                        <p className={styles.date}>
                          📅 {formatDate(item.tanggal)}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              <div className={styles.programRight}>
                <div className={styles.headerText}>
                  <div
                    style={{
                      width: "4px",
                      height: "30px",
                      backgroundColor: "#AB23B3",
                      borderRadius: "8px",
                      border: "1px solid #AB23B3",
                    }}
                  ></div>
                  <h1>Program</h1>
                  <a href="/program">
                    {" "}
                    <span className={styles.arrow}>→</span>{" "}
                  </a>
                </div>

                <div className={styles.leftColumn}>
                  {programTerbaru.slice(2, 6).map((item) => (
                    <a
                      key={item.kodeKonten}
                      className={styles.artikelCard}
                      href={`/${item.kategori}/${item.kodeKonten}`}
                    >
                      <Image
                        src={item.linkGambar || "/images/dummy.png"}
                        alt={item.judul}
                        width={300}
                        height={200}
                        className={styles.artikelImage}
                      />
                      <div className={styles.artikelContent}>
                        <h3>{item.judul}</h3>
                        <p className={styles.date}>
                          📅 {formatDate(item.tanggal)}
                        </p>
                         <p className={styles.cardDeskripsi}>
                        {item.isiHTML.replace(/<[^>]+>/g, "").substring(0, 100)}
                        ...
                      </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // ===== SEARCH RESULT =====
        <div className={styles.searchResult}>
          <h2>Hasil Pencarian: "{query}"</h2>

          {[...filteredKontenTerbaru, ...filteredArtikelTerbaru, ...filteredProgramTerbaru, ...filteredKontenTerpopuler].length === 0 ? (
            <p>Tidak ada hasil ditemukan.</p>
          ) : (
            <div className={styles.resultGrid}>
              {[...filteredKontenTerbaru, ...filteredArtikelTerbaru, ...filteredProgramTerbaru, ...filteredKontenTerpopuler].map(
                (item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.artikelCard}
                    href={`/${item.kategori}/${item.kodeKonten}`}
                  >
                    <Image
                      src={item.linkGambar || "/images/dummy.png"}
                      alt={item.judul}
                      width={300}
                      height={200}
                      className={styles.artikelImage}
                    />
                    <div className={styles.artikelContent}>
                      <h3>{item.judul}</h3>
                      <p className={styles.date}>
                        📅 {formatDate(item.tanggal)}
                      </p>
                       <p className={styles.cardDeskripsi}>
                        {item.isiHTML.replace(/<[^>]+>/g, "").substring(0, 100)}
                        ...
                      </p>
                    </div>
                  </a>
                )
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
