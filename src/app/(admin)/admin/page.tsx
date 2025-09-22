"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../../components/LoginPage.module.css";
import { loginAdmin } from "../../../services/AdminServices";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await loginAdmin({ email, password });
    setLoading(false);

    if (response.token) {
      // Simpan token
      localStorage.setItem("adminToken", response.token);
      setMessage("Login berhasil! Redirecting...");

      // Redirect ke halaman admin/home
      router.push("/admin/home");
    } else {
      setMessage(response.message || "Login gagal");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoWrapper}>
          <Image
            src="/images/Logo.png"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <h1 className={styles.title}>Admin</h1>
        <form className={styles.form} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
