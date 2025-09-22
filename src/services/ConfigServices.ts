// services/ConfigServices.ts

import { createClient } from '@supabase/supabase-js';

// Backend API configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '';
const SUPABASE_BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'FiveTv';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interfaces
export interface JenisData {
  id: number;
  nama: string;
}

export interface GetAllJenisResponse {
  success: boolean;
  data: JenisData[];
  message?: string;
}

export interface AddJenisData {
  nama: string;
}

export interface AddJenisResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface WebsiteConfigData {
  desc_satu: string;
  desc_dua: string;
  visi: string;
  misi: string;
  struktur: string; // image link
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  banner: string; // image link
  kontenI_id: string;
  kontenII_id: string;
  kontenIII_id: string;
}

export interface GetWebsiteConfigResponse {
  success: boolean;
  data: WebsiteConfigData;
  message?: string;
}

export interface UpdateWebsiteConfigResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UploadImageResponse {
  success: boolean;
  url?: string;
  message?: string;
}

// Jenis Management Functions
/**
 * Get all jenis
 */
export const getAllJenis = async (): Promise<GetAllJenisResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/admin/jenis`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      throw new Error('Access denied. Please check your permissions or login again.');
    }

    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching jenis:', error);
    throw error;
  }
};

/**
 * Add new jenis
 */
export const addJenis = async (jenisData: AddJenisData): Promise<AddJenisResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/jenis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(jenisData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error adding jenis:', error);
    throw error;
  }
};

// Website Config Functions
/**
 * Get website configuration
 */
export const getWebsiteConfig = async (): Promise<GetWebsiteConfigResponse> => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 403) {
      throw new Error('Access denied. Please check your permissions or login again.');
    }

    if (response.status === 401) {
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching website config:', error);
    throw error;
  }
};

/**
 * Update website configuration
 */
export const updateWebsiteConfig = async (configData: WebsiteConfigData): Promise<UpdateWebsiteConfigResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(configData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error updating website config:', error);
    throw error;
  }
};

// Image Upload Functions
/**
 * Upload image to Supabase storage
 */
export const uploadConfigImage = async (file: File, type: 'struktur' | 'banner'): Promise<UploadImageResponse> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.'
      };
    }

    // Validate file size (max 10MB for config images)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 10MB.'
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `config/${type}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        message: 'Gagal mengunggah gambar ke server.'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      return {
        success: false,
        message: 'Gagal mendapatkan URL gambar.'
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      message: 'Gambar berhasil diunggah!'
    };

  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengunggah gambar.'
    };
  }
};

/**
 * Delete image from Supabase storage
 */
export const deleteConfigImage = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || imageUrl === '-') return true;

    // Extract filename from URL
    const url = new URL(imageUrl);
    const pathSegments = url.pathname.split('/');
    const fileName = pathSegments.slice(-2).join('/'); // Get 'config/filename.ext'

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.warn('Failed to delete old image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error deleting image:', error);
    return false;
  }
};

/**
 * Validate jenis form data
 */
export const validateJenisForm = (formData: { nama: string }): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.nama.trim()) {
    errors.push('Nama jenis harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate website config form data
 */
export const validateWebsiteConfigForm = (formData: WebsiteConfigData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.desc_satu.trim()) {
    errors.push('Deskripsi satu harus diisi');
  }

  if (!formData.desc_dua.trim()) {
    errors.push('Deskripsi dua harus diisi');
  }

  if (!formData.visi.trim()) {
    errors.push('Visi harus diisi');
  }

  if (!formData.misi.trim()) {
    errors.push('Misi harus diisi');
  }

  // Validate social media URLs
  const urlFields = ['instagram', 'twitter', 'youtube', 'tiktok', 'linkedin'];
  urlFields.forEach(field => {
    const value = formData[field as keyof WebsiteConfigData] as string;
    if (value && value.trim() && !isValidUrl(value.trim())) {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} harus berupa URL yang valid`);
    }
  });

  // Validate konten IDs - now as strings
  if (!formData.kontenI_id || !formData.kontenI_id.trim()) {
    errors.push('Konten I ID harus diisi');
  }

  if (!formData.kontenII_id || !formData.kontenII_id.trim()) {
    errors.push('Konten II ID harus diisi');
  }

  if (!formData.kontenIII_id || !formData.kontenIII_id.trim()) {
    errors.push('Konten III ID harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Helper function to validate URL
 */
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};