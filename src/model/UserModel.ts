// types/konten.type.ts

export type KategoriKonten = 'artikel' | 'program';

export interface Pengurus {
  id: number;
  nama: string;
  nim: string;
  prodi: string;
  jabatan: string;
  fotoLink: string;
  divisi: string;
  linkedin: string;
  Instagram: string; // Perhatikan huruf kapital 'I'
}

export interface Konten {
  kodeKonten: string;
  penulis: string;
  judul: string;
  Editor?: string;
  Reporter?: string;
  linkGambar?: string;
  view: number;
  viewMonth: number;
  tanggal: string; // Tanggal akan datang sebagai string dari API
  isiHTML: string;
  kategori: KategoriKonten;
  caption: string;
}

export interface DashboardResponse {
  kontenTerbaru: Konten[];
  kontenTerpopuler: Konten[];
  artikelTerbaru: Konten[];
  programTerbaru: Konten[];
}

export interface ArtikelResponse {
  artikelTerbaru: Konten[];
  artikelTerpopuler: Konten[];
  semuaArtikel: Konten[];
}

export interface ProgramResponse {
  programTerbaru: Konten[];
  programTerpopuler: Konten[];
  semuaProgram: Konten[];
}

export interface DetailResponse {
  konten: Konten;
  kontenTerpopuler: Konten[];
  kontenTerbaru: Konten[];
}

export interface WebsiteConfig {
  id: number;
  desc_satu: string;
  desc_dua: string;
  visi: string;
  misi: string;
  struktur: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  banner: string;
  kontenI_id: string;
  kontenII_id: string;
  kontenIII_id: string;
}

export interface ProfileResponse {
  websiteConfig: WebsiteConfig;
  semuaPengurus: Pengurus[];
}