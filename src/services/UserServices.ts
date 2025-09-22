// services/konten.service.ts

import {
  Konten,
  DashboardResponse,
  ArtikelResponse,
  ProgramResponse,
  DetailResponse,
  ProfileResponse
} from '../model/UserModel';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`;
// Fungsi untuk mendapatkan data dashboard
export const getDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data artikel
// services/UserServices.ts
export const getArtikelData = async (
  page: number = 1,
  limit: number = 5
): Promise<ArtikelResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/artikel?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch artikel data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getArtikelData:", error);
    throw error;
  }
};


// Fungsi untuk mendapatkan data program
export const getProgramData = async (
  page: number = 1,
  limit: number = 5
): Promise<ProgramResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/program?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch program data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in getProgramData:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan detail konten berdasarkan kode
export const getDetailByKode = async (kodeKonten: string): Promise<DetailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/konten/${kodeKonten}`);
    if (!response.ok) {
      throw new Error('Failed to fetch content detail');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getDetailByKode:', error);
    throw error;
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/profile`); 
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch profile data with status ${response.status}: ${errorText}`);
    }
    const data: ProfileResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    throw error;
  }
};

// Search all konten
export const searchAllKonten = async (q: string): Promise<Konten[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error("Failed to search konten");
    }
    const data: Konten[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error in searchAllKonten:", error);
    throw error;
  }
};

// Search konten kategori artikel
export const searchKontenArtikel = async (q: string): Promise<Konten[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/artikel?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error("Failed to search artikel konten");
    }
    const data: Konten[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error in searchKontenArtikel:", error);
    throw error;
  }
};

// Search konten kategori program
export const searchKontenProgram = async (q: string): Promise<Konten[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/program?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      throw new Error("Failed to search program konten");
    }
    const data: Konten[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error in searchKontenProgram:", error);
    throw error;
  }
};