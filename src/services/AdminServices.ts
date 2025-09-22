// services/admin.services.ts

export interface LoginAdminPayload {
  email: string;
  password: string;
}

export interface LoginAdminResponse {
  message: string;
  token?: string;
  email?: string;
  error?: string;
}

// Interface for content/konten data
export interface KontenItem {
  kodeKonten: string;
  penulis: string;
  judul: string;
  Editor: string;
  Reporter: string;
  linkGambar: string;
  view: number;
  viewMonth: number;
  tanggal: string;
  kategori: string;
  jenisId: number;
  jenis: {
    nama: string;
  };
}

export interface KontenResponse {
  success: boolean;
  data: KontenItem[];
}

import { DashboardAdminResponse } from "../model/AdminModel";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin`;

export const loginAdmin = async (payload: LoginAdminPayload): Promise<LoginAdminResponse> => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { message: data.message || "Login gagal", error: data.error };
    }

    const token = data.token;
    if (token) sessionStorage.setItem("adminToken", token);

    return data;
  } catch (error: any) {
    return { message: "Terjadi kesalahan jaringan.", error: error.message };
  }
};

export const getAdminDashboardData = async (periode?: number): Promise<DashboardAdminResponse> => {
  try {
    const url = periode ? `${API_URL}/dashboard?periode=${periode}` : `${API_URL}/dashboard`;

    // Ambil token dari sessionStorage
    const token = sessionStorage.getItem("adminToken");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data dashboard admin");
    }

    const data: DashboardAdminResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    throw error;
  }
};

// Interface for search parameters
export interface SearchKontenParams {
  penulis?: string;
  judul?: string;
  jenis?: string;
  kategori?: 'program' | 'artikel';
  tanggal?: string; // yyyy-mm-dd format
}

// New function to get konten/content data
export const getAdminKontenData = async (): Promise<KontenResponse> => {
  try {
    // Ambil token dari sessionStorage
    const token = sessionStorage.getItem("adminToken");

    const res = await fetch(`${API_URL}/konten`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Gagal mengambil data konten admin");
    }

    const data: KontenResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching admin konten data:", error);
    throw error;
  }
};

// New function to search konten/content data
export const searchAdminKonten = async (searchParams: SearchKontenParams): Promise<KontenResponse> => {
  try {
    // Ambil token dari sessionStorage
    const token = sessionStorage.getItem("adminToken");

    // Build query string from search parameters
    const queryParams = new URLSearchParams();
    if (searchParams.penulis) queryParams.append('penulis', searchParams.penulis);
    if (searchParams.judul) queryParams.append('judul', searchParams.judul);
    if (searchParams.jenis) queryParams.append('jenis', searchParams.jenis);
    if (searchParams.kategori) queryParams.append('kategori', searchParams.kategori);
    if (searchParams.tanggal) queryParams.append('tanggal', searchParams.tanggal);

    const queryString = queryParams.toString();
    const url = `${API_URL}/search${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Gagal mencari data konten admin");
    }

    const data: KontenResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error searching admin konten data:", error);
    throw error;
  }
};