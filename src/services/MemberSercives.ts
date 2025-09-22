// services/MemberServices.ts

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

export interface MemberData {
  id: number;
  nama: string;
  nim: string;
  prodi: string;
  jabatan: string;
  fotoLink: string;
  divisi: string;
  linkedin: string;
  Instagram: string;
}

export interface GetAllMembersResponse {
  success: boolean;
  data: MemberData[];
  message?: string;
}

export interface GetMemberByIdResponse {
  success: boolean;
  data?: MemberData;
  message?: string;
}

export interface UpdateMemberData {
  nama?: string;
  prodi?: string;
  jabatan?: string;
  fotoLink?: string;
  divisi?: string;
  linkedin?: string;
  Instagram?: string;
}

export interface UpdateMemberResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface DeleteMemberResponse {
  success: boolean;
  message?: string;
}

export interface AddMemberData {
  nama: string;
  nim: string;
  prodi: string;
  jabatan: string;
  fotoLink?: string;
  divisi: string;
  linkedin?: string;
  Instagram?: string;
}

export interface AddMemberResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  url?: string;
  message?: string;
}

/**
 * Upload photo to Supabase storage
 */
export const uploadMemberPhoto = async (file: File, nim: string): Promise<UploadPhotoResponse> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.'
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 5MB.'
      };
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const fileName = `members/${nim}-${Date.now()}.${fileExtension}`;

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
        message: 'Gagal mengunggah foto ke server.'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      return {
        success: false,
        message: 'Gagal mendapatkan URL foto.'
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      message: 'Foto berhasil diunggah!'
    };

  } catch (error) {
    console.error('Error uploading photo:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengunggah foto.'
    };
  }
};

/**
 * Delete photo from Supabase storage
 */
export const deleteMemberPhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    if (!photoUrl || photoUrl === '-') return true;

    // Extract filename from URL
    const url = new URL(photoUrl);
    const pathSegments = url.pathname.split('/');
    const fileName = pathSegments.slice(-2).join('/'); // Get 'members/filename.ext'

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.warn('Failed to delete old photo:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error deleting photo:', error);
    return false;
  }
};

/**
 * Fetch all members from API
 */
export const getAllMembers = async (): Promise<GetAllMembersResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/anggota`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

/**
 * Fetch member by NIM for editing
 */
export const getMemberById = async (nim: string): Promise<GetMemberByIdResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/anggota/${nim}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Error fetching member by NIM:', error);
    throw error;
  }
};

/**
 * Add new member via API
 */
export const addMember = async (memberData: AddMemberData): Promise<AddMemberResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/anggota`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(memberData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

/**
 * Update member via API
 */
export const updateMember = async (
  nim: string, 
  memberData: UpdateMemberData
): Promise<UpdateMemberResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/anggota/${nim}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(memberData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

/**
 * Delete member by NIM
 */
export const deleteMember = async (nim: string): Promise<DeleteMemberResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/anggota/${nim}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

/**
 * Validate member form data before submission
 */
export const validateMemberForm = (formData: {
  nama: string;
  nim: string;
  prodi: string;
  jabatan: string;
  divisi: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.nama.trim()) {
    errors.push('Nama harus diisi');
  }

  if (!formData.nim.trim()) {
    errors.push('NIM harus diisi');
  } else if (!/^\d+$/.test(formData.nim.trim())) {
    errors.push('NIM harus berupa angka');
  }

  if (!formData.prodi.trim()) {
    errors.push('Program Studi harus diisi');
  }

  if (!formData.jabatan.trim()) {
    errors.push('Jabatan harus diisi');
  }

  if (!formData.divisi.trim()) {
    errors.push('Divisi harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};