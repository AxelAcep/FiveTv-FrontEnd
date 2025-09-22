"use client"; // wajib di paling atas

import Sidebar from "@/components/SideBar";
import styles from "../../../../components/HomeAdmin.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import { getArtikelData } from "../../../../services/UserServices";
import { getProgramData } from "../../../../services/UserServices";
import ChartPengunjung from "@/components/Chart";
import ChartKategori from "@/components/Barchart";
import { getAdminDashboardData } from "../../../../services/AdminServices";
import { DashboardAdminResponse } from "../../../../model/AdminModel";
import { getWebsiteConfig, WebsiteConfigData } from "../../../../services/ConfigServices";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
   const [socialLinks, setSocialLinks] = useState<{
    instagram: string;
    twitter: string;
    youtube: string;
    tiktok: string;
    linkedin: string;
  }>({
    instagram: "#",
    twitter: "#",
    youtube: "#",
    tiktok: "#",
    linkedin: "#"
  });

  const router = useRouter();


  const [adminDashboardData, setAdminDashboardData] = useState<DashboardAdminResponse | null>(null);
   const [artikelTerpopuler, setArtikelTerpopuler] = useState<ArtikelItem[]>([]);
   const [programTerpopuler, setProgramTerpopuler] = useState<ArtikelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface ArtikelItem {
  kodeKonten: string;
  judul: string;
  tanggal: string;
  kategori: string;
  linkGambar?: string;
  isiHTML: string;
}

interface ArtikelResponse {
  artikelTerbaru: ArtikelItem[];
  artikelTerpopuler: ArtikelItem[];
}

interface ProgramResponse {
  programTerbaru: ArtikelItem[];
  programTerpopuler: ArtikelItem[];
}


  // Selection periode
  const options = [
    { label: "3 Bulan", value: 3 },
    { label: "6 Bulan", value: 6 },
    { label: "9 Bulan", value: 9 },
    { label: "12 Bulan", value: 12 },
    { label: "Semua", value: 999 }
  ];
  const [selected, setSelected] = useState("3 Bulan");
  const [periode, setPeriode] = useState<number>(3);

  // Handle klik selection button
  const handleSelect = (option: { label: string; value: number }) => {
    setSelected(option.label);
    setPeriode(option.value);
  };

  const getTagClass = (kategori: string) => kategori === "program" ? styles.program : styles.article;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  // Fetch data tiap kali periode berubah
  useEffect(() => {


    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      alert('Authentication required. Please login first.');
      router.push('/admin'); // Adjust this path as needed
      return;
    }

    const fetchSocialLinks = async () => {
      try {
        const response = await getWebsiteConfig();
        if (response.success) {
          setSocialLinks({
            instagram: response.data.instagram || "#",
            twitter: response.data.twitter || "#",
            youtube: response.data.youtube || "#",
            tiktok: response.data.tiktok || "#",
            linkedin: response.data.linkedin || "#"
          });
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
        // Keep default "#" values if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();

    const fetchData = async () => {
      setLoading(true);
      try {
        const artikelData: ArtikelResponse = await getArtikelData(1, 5);
        const programData: ProgramResponse = await getProgramData(1, 5);
        setArtikelTerpopuler(artikelData.artikelTerpopuler);
        setProgramTerpopuler(programData.programTerpopuler);

        const dataAdmin = await getAdminDashboardData(periode);
        setAdminDashboardData(dataAdmin);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periode]);

  return (
    <section>
      <div className={styles.maincontainer}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <div className={styles.mainheader}>
            <p className={styles.TextHeaderOne}>Dashboard</p>
            <div className={styles.socials}>
              <a href={socialLinks.instagram}><Image src="/images/binstagram.png" alt="Instagram" width={24} height={24} /></a>
              <a href={socialLinks.twitter}><Image src="/images/btwitter.png" alt="Twitter" width={24} height={24} /></a>
              <a href={socialLinks.youtube}><Image src="/images/byoutube.png" alt="YouTube" width={24} height={24} /></a>
              <a href={socialLinks.tiktok}><Image src="/images/bticktok.png" alt="TikTok" width={24} height={24} /></a>
              <a href={socialLinks.linkedin}><Image src="/images/blinkedin.png" alt="LinkedIn" width={24} height={24} /></a>
            </div>
            <a href="../"><p className={styles.TextHeaderTwo}>Halaman Utama</p></a>
          </div>

          {/* Selection periode */}
          <div className={styles.Selectioncontainer}>
            {options.map((option) => (
              <button
                key={option.label}
                className={`${styles.option} ${selected === option.label ? styles.active : ""}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Stat cards */}
          <div className={styles.statContainer}>
            <StatCard icon="/images/file-text.png" bgColor="#e0f8e5" value={adminDashboardData?.data.totalViewsThisMonth ?? 0} label="Views" />
            <StatCard icon="/images/watch.png" bgColor="#fff4e6" value={adminDashboardData?.data.countArtikel ?? 0} label="Artikel" />
            <StatCard icon="/images/crosshair.png" bgColor="#e0eef8" value={adminDashboardData?.data.countProgram ?? 0} label="Program" />
            <StatCard icon="/images/total.png" bgColor="#f9f3fc" value={adminDashboardData?.data.totalAllViews ?? 0} label="Total views" />
          </div>

          <div className={styles.mainconten}>
            {/* Charts */}
            <div className={styles.leftContainer}>
              <ChartPengunjung viewsPerPeriode={adminDashboardData?.data.viewsPerPeriode || {}} />
              <ChartKategori mostViewsByJenis={adminDashboardData?.data.mostViewsByJenis || []} />
            </div>

            {/* Berita terpopuler */}
            <div className={styles.rightContainer}>
              <div className={styles.rightColumn2}>
                <h2 className={styles.populerTitle}>Artikel Terpopuler</h2>
                {artikelTerpopuler.map((item) => (
                  <a key={item.kodeKonten} className={styles.populerItem} href={`/${item.kategori}/${item.kodeKonten}`}>
                    <span className={styles.icon}>✦</span>
                    <div>
                      <h4>{item.judul}</h4>
                      <span className={`${styles.tag} ${getTagClass(item.kategori)}`}>{item.kategori}</span>
                      <span className={styles.date}>📅 {formatDate(item.tanggal)}</span>
                    </div>
                  </a>
                ))}
              </div>
               <div className={styles.rightColumn2}>
                <h2 className={styles.populerTitle}>Berita Terpopuler</h2>
                {programTerpopuler.map((item) => (
                  <a key={item.kodeKonten} className={styles.populerItem} href={`/${item.kategori}/${item.kodeKonten}`}>
                    <span className={styles.icon}>✦</span>
                    <div>
                      <h4>{item.judul}</h4>
                      <span className={`${styles.tag} ${getTagClass(item.kategori)}`}>{item.kategori}</span>
                      <span className={styles.date}>📅 {formatDate(item.tanggal)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
