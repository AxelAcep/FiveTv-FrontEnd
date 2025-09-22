"use client";
import Image from "next/image";
import styles from "./StatCard.module.css";

interface StatCardProps {
  icon: string;      // path ke image icon
  bgColor: string;   // warna background soft
  value: number;
  label: string;
}

export default function StatCard({ icon, bgColor, value, label }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper} style={{ backgroundColor: bgColor }}>
        <Image src={icon} alt={label} width={28} height={28} />
      </div>
      <div className={styles.textWrapper}>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
}
