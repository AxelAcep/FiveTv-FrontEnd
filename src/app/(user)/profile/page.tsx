"use client";

import { useEffect, useState } from "react";
import styles from "../../../components/ProfilePage.module.css";
import { getProfile } from "../../../services/UserServices";
import { ProfileResponse, Pengurus } from "../../../model/UserModel";

export default function Profile() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProfile();
        setData(res);
      } catch (err) {
        console.error("Error fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 if (loading) {
  return (
    <div className={styles.loadingWrapper}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>Memuat data...</div>
    </div>
  );
}

  if (!data) {
    return <div className={styles.loading}>Data tidak ditemukan</div>;
  }

  const { websiteConfig, semuaPengurus } = data;

  return (
    <main className={styles.noPaddingMain}>
      <section className={styles.Container}>
        {/* Section 1 - Banner & Desc */}
        <div className={styles.Section1}>
          <h1 className={styles.HeaderText}> About Us </h1>
          {websiteConfig.banner && (
            <img
              src={websiteConfig.banner}
              alt="Banner"
              className={styles.bannerImage}
            />
          )}
          <p className={styles.DescText}>{websiteConfig.desc_satu}</p>
        </div>

        {/* Section 2 - Desc 2 */}
        <div className={styles.Section2}>
          <img
            src="/images/StarIcon.png"
            alt="Star Icon"
            width="60"
            height="60"
          />
          <p className={styles.DescText2}>{websiteConfig.desc_dua}</p>
        </div>

        {/* Section 3 - Misi & Visi */}
        <div className={styles.Section3}>
          <div className={styles.down1}>
            <h1 className={styles.HeaderText}> Misi </h1>
            <p
              className={styles.DescText}
              style={{ textAlign: "center" }}
              dangerouslySetInnerHTML={{ __html: websiteConfig.misi }}
            />
          </div>
          <div className={styles.down1}>
            <h1 className={styles.HeaderText}> Visi </h1>
            <p className={styles.DescText}>{websiteConfig.visi}</p>
          </div>
        </div>

        {/* Section 4 - Struktur */}
        <div className={styles.Section4}>
          <h1 className={styles.HeaderText2}> Struktur Organisasi </h1>
          {websiteConfig.struktur && (
            <img
              src={websiteConfig.struktur}
              alt="Struktur Organisasi"
              width="80%"
              height="auto"
            />
          )}
        </div>

        {/* Section 5 - Pengurus */}
        <div className={styles.Section5}>
          <h1 className={styles.HeaderText3}> Kepengurusan </h1>

          <div className={styles.LoopColumn}>
            {semuaPengurus.map((p: Pengurus) => (
              <div key={p.id} className={styles.Card}>
                <img
                  src={p.fotoLink || "/images/pengurus.png"}
                  alt={p.nama}
                  className={styles.CardImage}
                />

                <div className={styles.CardBody}>
                  <span className={styles.CardJabatan}>{p.jabatan}</span>
                  <h3 className={styles.CardNama}>{p.nama}</h3>

                  <div className={styles.CardLinks}>
                    {p.Instagram && (
                      <a
                        href={p.Instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src="/images/instagram.png" alt="Instagram" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
