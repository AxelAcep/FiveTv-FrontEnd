"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "../../../components/ArtikelPage.module.css";
import { getArtikelData, getProgramData } from "../../../services/UserServices";

// Tipe
interface ArtikelItem {
  kodeKonten: string;
  judul: string;
  tanggal: string;
  kategori: string;
  linkGambar?: string;
  isiHTML: string;
}

interface ProgramResponse {
  programTerbaru: ArtikelItem[];
  programTerpopuler: ArtikelItem[];
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("id-ID", options);
  };

export default function ArticlePage() {
  const [query, setQuery] = useState("");
  const [artikelTerbaru, setArtikelTerbaru] = useState<ArtikelItem[]>([]);
  const [artikelTerpopuler, setArtikelTerpopuler] = useState<ArtikelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // scroll state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  // fetch pertama
  useEffect(() => {
    const fetchData = async () => {
      try {
        const programData: ProgramResponse = await getProgramData(1, 5);
        setArtikelTerbaru(programData.programTerbaru);
        setArtikelTerpopuler(programData.programTerpopuler);
      } catch (err) {
        console.error("Error fetching artikel:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // load more
  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const artikelData = await getProgramData(page + 1, 5);
      setArtikelTerbaru((prev) => [...prev, ...artikelData.programTerbaru]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // fungsi search
  const searchKontenArtikel = (query: string): ArtikelItem[] => {
    const allArtikel = [...artikelTerbaru, ...artikelTerpopuler];
    return allArtikel.filter((item) =>
      item.judul.toLowerCase().includes(query.toLowerCase())
    );
  };

  const isSearching = query.trim() !== "";

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <div className={styles.loadingText}>Memuat data...</div>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      {/* Search */}
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

      {/* Kalau query kosong → tampil layout default */}
      {!isSearching ? (
        <>
          {/* Top3 */}
          <div className={styles.top3}>
            <div className={styles.top3container}>
              {/* Right column kiri */}
              <div className={styles.rightColumn}>
                {artikelTerbaru.slice(1, 3).map((item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.card}
                    href={`/artikel/${item.kodeKonten}`}
                  >
                    <Image
                      src={item.linkGambar || "/images/dummy.png"}
                      alt={item.judul}
                      fill
                      className={styles.cardImage}
                    />
                    <div className={styles.cardOverlay}>
                      <span
                        className={`${styles.tag} ${
                          item.kategori === "program"
                            ? styles.program
                            : styles.article
                        }`}
                      >
                        {item.kategori}
                      </span>
                      <h3>{item.judul}</h3>
                      <p className={styles.date}>
                        📅 {new Date(item.tanggal).toISOString().split("T")[0]}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Big card */}
              {artikelTerbaru[0] && (
                <a
                  className={`${styles.card} ${styles.bigCard}`}
                  href={`/artikel/${artikelTerbaru[0].kodeKonten}`}
                >
                  <Image
                    src={artikelTerbaru[0].linkGambar || "/images/dummy.png"}
                    alt={artikelTerbaru[0].judul}
                    fill
                    className={styles.cardImage}
                  />
                  <div className={styles.cardOverlay}>
                    <span
                      className={`${styles.tag} ${
                        artikelTerbaru[0].kategori === "program"
                          ? styles.program
                          : styles.article
                      }`}
                    >
                      {artikelTerbaru[0].kategori}
                    </span>
                    <h2>{artikelTerbaru[0].judul}</h2>
                    <p className={styles.date}>
                      📅{" "}
                      {new Date(artikelTerbaru[0].tanggal)
                        .toISOString()
                        .split("T")[0]}
                    </p>
                  </div>
                </a>
              )}

              {/* Right column kanan */}
              <div className={styles.rightColumn}>
                {artikelTerbaru.slice(3, 5).map((item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.card}
                    href={`/artikel/${item.kodeKonten}`}
                  >
                    <Image
                      src={item.linkGambar || "/images/dummy.png"}
                      alt={item.judul}
                      fill
                      className={styles.cardImage}
                    />
                    <div className={styles.cardOverlay}>
                      <span
                        className={`${styles.tag} ${
                          item.kategori === "program"
                            ? styles.program
                            : styles.article
                        }`}
                      >
                        {item.kategori}
                      </span>
                      <h3>{item.judul}</h3>
                      <p className={styles.date}>
                        📅 {new Date(item.tanggal).toISOString().split("T")[0]}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Artikel list + populer */}
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
                <span className={styles.arrow}>→</span>
              </div>

              <div className={styles.container}>
                {/* Kiri: Artikel Terbaru */}
                <div className={styles.leftColumn}>
                  {artikelTerbaru.map((item) => (
                    <a
                      key={item.kodeKonten}
                      className={styles.artikelCard}
                      href={`/artikel/${item.kodeKonten}`}
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
                          📅{" "}
                          {new Date(item.tanggal)
                            .toISOString()
                            .split("T")[0]}
                        </p>

                        <p className={styles.cardDeskripsi}>
                        {item.isiHTML.replace(/<[^>]+>/g, "").substring(0, 100)}
                        ...
                      </p>
                      </div>
                    </a>
                  ))}

                  {/* tombol load more */}
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className={styles.loadMoreBtn}
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>

                {/* Kanan: Artikel Terpopuler */}
                <div className={styles.rightColumn2}>
                  <h2 className={styles.populerTitle}>Artikel Terpopuler</h2>
                  {artikelTerpopuler.map((item) => (
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
                          {new Date(item.tanggal)
                            .toISOString()
                            .split("T")[0]}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Row */}
          <div className={styles.newest}>
            <div className={styles.newestContainer}>
              <h1 className={styles.sectionTitle}>Artikel Terbaru</h1>
              <div
                className={styles.scrollRow}
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {artikelTerbaru.map((item) => (
                  <a
                    key={item.kodeKonten}
                    className={styles.cardSmall}
                    href={`/artikel/${item.kodeKonten}`}
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
                          className={`${styles.tag} ${
                            item.kategori === "program"
                              ? styles.program
                              : styles.article
                          }`}
                        >
                          {item.kategori}
                        </div>
                        <p className={styles.date2}>
                          📅{" "}
                          {new Date(item.tanggal)
                            .toISOString()
                            .split("T")[0]}
                        </p>
                      </div>
                      <h3>{item.judul}</h3>
                      <p className={styles.cardDeskripsi}>
                        {item.isiHTML
                          .replace(/<[^>]+>/g, "")
                          .substring(0, 100)}
                        ...
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Kalau query ada → tampilkan hasil pencarian
        <div className={styles.searchResult}>
          <h2>Hasil Pencarian untuk: "{query}"</h2>
          {searchKontenArtikel(query).length > 0 ? (
            <div className={styles.resultContainer}>
              {searchKontenArtikel(query).map((item) => (
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
          ) : (
            <p>Tidak ada hasil ditemukan.</p>
          )}
        </div>
      )}
    </section>
  );
}
