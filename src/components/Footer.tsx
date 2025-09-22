"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Footer.module.css";
import { getWebsiteConfig, WebsiteConfigData } from "../services/ConfigServices";

export default function Footer() {
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

  const [isLoading, setIsLoading] = useState(true);

  // Fetch social links on component mount
  useEffect(() => {
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
        setIsLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  return (
    <footer className={styles.footer}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image src="/images/logo.png" alt="Logo" width={120} height={48} />
      </div>
      
      {/* Navigation */}
      <nav className={styles.nav}>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/artikel">Artikel</a></li>
          <li><a href="/program">Program</a></li>
          <li><a href="/profile">Tentang Kami</a></li>
        </ul>
      </nav>
      
      {/* Social Icons */}
      <div className={styles.socials}>
        <a 
          href={socialLinks.instagram} 
          target={socialLinks.instagram !== "#" ? "_blank" : "_self"}
          rel={socialLinks.instagram !== "#" ? "noopener noreferrer" : ""}
          aria-label="Instagram"
        >
          <Image 
            src="/images/instagram.png" 
            alt="Instagram" 
            width={28} 
            height={28} 
          />
        </a>
        
        <a 
          href={socialLinks.twitter} 
          target={socialLinks.twitter !== "#" ? "_blank" : "_self"}
          rel={socialLinks.twitter !== "#" ? "noopener noreferrer" : ""}
          aria-label="Twitter"
        >
          <Image 
            src="/images/twitter.png" 
            alt="Twitter" 
            width={28} 
            height={28} 
          />
        </a>
        
        <a 
          href={socialLinks.youtube} 
          target={socialLinks.youtube !== "#" ? "_blank" : "_self"}
          rel={socialLinks.youtube !== "#" ? "noopener noreferrer" : ""}
          aria-label="YouTube"
        >
          <Image 
            src="/images/youtube.png" 
            alt="YouTube" 
            width={28} 
            height={28} 
          />
        </a>
        
        <a 
          href={socialLinks.tiktok} 
          target={socialLinks.tiktok !== "#" ? "_blank" : "_self"}
          rel={socialLinks.tiktok !== "#" ? "noopener noreferrer" : ""}
          aria-label="TikTok"
        >
          <Image 
            src="/images/tiktok.png" 
            alt="TikTok" 
            width={28} 
            height={28} 
          />
        </a>
        
        <a 
          href={socialLinks.linkedin} 
          target={socialLinks.linkedin !== "#" ? "_blank" : "_self"}
          rel={socialLinks.linkedin !== "#" ? "noopener noreferrer" : ""}
          aria-label="LinkedIn"
        >
          <Image 
            src="/images/linkedin.png" 
            alt="LinkedIn" 
            width={28} 
            height={28} 
          />
        </a>
      </div>
      
      {/* Copyright */}
      <div className={styles.copy}>
        © Copyright 2025 - FiveTv
      </div>
    </footer>
  );
}