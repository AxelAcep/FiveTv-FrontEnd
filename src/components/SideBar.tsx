"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Draggable from "react-draggable";
import styles from "./Sidebar.module.css";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: <Image src="/images/home.png" alt="Dashboard" width={24} height={24} />, href: "/admin/home" },
  { label: "Artikel/Program", icon: <Image src="/images/Article.png" alt="Artikel" width={24} height={24} />, href: "/admin/artikel" },
  { label: "Edit Website", icon: <Image src="/images/edit.png" alt="Edit" width={24} height={24} />, href: "/admin/edit" },
  { label: "Anggota", icon: <Image src="/images/users.png" alt="Anggota" width={24} height={24} />, href: "/admin/anggota" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Deteksi ukuran layar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsMobile(true);
        setIsOpen(false); // default tertutup
      } else {
        setIsMobile(false);
        setIsOpen(true); // default terbuka di desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin";
  };

  return (
    <>
      {/* Tombol hamburger (hanya muncul di mobile) */}
      {isMobile && (
        <Draggable nodeRef={nodeRef}>
          <div ref={nodeRef}>
            <button
              className={styles.hamburger}
              onClick={() => setIsOpen(!isOpen)}
            >
              ☰
            </button>
          </div>
        </Draggable>
      )}

      {/* Overlay gelap */}
      {isMobile && isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar utama */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.logoWrapper}>
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            fill 
            style={{ objectFit: "contain", margin: "auto" }} 
          />
        </div>

        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={styles.menuItem}
              onClick={() => isMobile && setIsOpen(false)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.logout} onClick={handleLogout}>
          <div className={styles.logoutIcon}>SB</div>
          <span>Logout</span>
        </div>
      </div>
    </>
  );
}
