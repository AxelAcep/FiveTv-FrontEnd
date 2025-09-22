// services/articleService.ts

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || '';
const SUPABASE_BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'FiveTv';

// Backend API configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface ArticleData {
  penulis: string;
  judul: string;
  Editor?: string | null;
  Reporter?: string | null;
  linkGambar?: string | null;
  kategori: string;
  jenisId?: number | null;
  isiHTML: string;
}

export interface CreateArticleResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface JenisData {
  id: number;
  nama: string;
}

export interface GetJenisResponse {
  success: boolean;
  data: JenisData[];
}

/**
 * Fetch jenis data from API
 */
export const getJenis = async (): Promise<GetJenisResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/jenis`, {
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
    console.error('Error fetching jenis data:', error);
    throw error;
  }
};

/**
 * Upload image to Supabase Storage
 */
export const uploadImageToSupabase = async (file: File): Promise<string> => {
  try {
    if (!SUPABASE_URL) {
      throw new Error('Supabase URL is missing. Please check your environment variables.');
    }

    // Use service role key for admin uploads if available, otherwise use anon key
    const authKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY;
    
    if (!authKey) {
      throw new Error('Supabase authentication key is missing. Please check your environment variables.');
    }

    // Generate unique filename with public folder structure
    const fileExt = file.name.split('.').pop();
    const fileName = `public/artikel-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload to Supabase Storage using REST API
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET_NAME}/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase upload error:', errorText);
      
      // If RLS error, provide helpful message
      if (errorText.includes('row-level security policy')) {
        throw new Error('Storage permission denied. Please check Supabase RLS policies or use service role key.');
      }
      
      throw new Error(`Failed to upload image to Supabase: ${response.status} ${response.statusText}`);
    }

    // Return public URL
    const publicURL = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_NAME}/${fileName}`;
    return publicURL;
    
  } catch (error) {
    console.error('Error uploading image to Supabase:', error);
    throw error;
  }
};

/**
 * Create article via API
 */
export const createArticle = async (articleData: ArticleData): Promise<CreateArticleResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/konten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(articleData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

/**
 * Helper function to map article type to jenisId
 * Now directly returns the integer type since it's already a number
 */
export const getJenisIdFromType = (type: number): number | null => {
  // Validate that type is between 1-5
  if (type >= 1 && type <= 5) {
    return type;
  }
  return null;
};

/**
 * Complete article creation process (upload image + create article)
 */
export const createArticleWithImage = async (
  formData: {
    title: string;
    source: string;
    reporter: string;
    editor: string;
    category: string;
    type: number;
    content: string;
    coverImage: File | null;
  }
): Promise<CreateArticleResponse> => {
  try {
    let linkGambar: string | null = null;

    // Step 1: Upload image to Supabase if exists
    if (formData.coverImage) {
      console.log('📤 Uploading image to Supabase...');
      linkGambar = await uploadImageToSupabase(formData.coverImage);
      console.log('✅ Image uploaded successfully:', linkGambar);
    }

    // Step 2: Prepare article data according to your API requirements
    const articleData: ArticleData = {
      penulis: formData.source || 'Admin', // Use source as penulis, default to 'Admin'
      judul: formData.title,
      Editor: formData.editor || null,
      Reporter: formData.reporter || null,
      linkGambar: linkGambar,
      kategori: formData.category, // Use the selected category (artikel/program)
      jenisId: formData.type, // Direct integer mapping
      isiHTML: formData.content
    };

    // Step 3: Submit to your backend API
    console.log('📡 Submitting article data to backend...');
    console.log('Article data:', articleData);
    
    const result = await createArticle(articleData);
    console.log('✅ Article created successfully:', result);

    return result;
    
  } catch (error) {
    console.error('❌ Error in createArticleWithImage:', error);
    throw error;
  }
};

/**
 * Validate form data before submission
 */
export const validateArticleForm = (formData: {
  title: string;
  content: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.title.trim()) {
    errors.push('Judul artikel harus diisi');
  }

  if (!formData.content.trim() || formData.content === '<div><br></div>') {
    errors.push('Konten artikel harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export interface KontenData {
  kodeKonten: string;
  penulis: string;
  judul: string;
  Editor: string | null;
  Reporter: string | null;
  linkGambar: string | null;
  view: number;
  viewMonth: number;
  tanggal: string;
  kategori: string;
  jenisId: number | null;
  jenis: { nama: string } | null;
  isiHTML: string;
}

export interface GetKontenResponse {
  success: boolean;
  data?: KontenData;
  message?: string;
}

export interface UpdateArticleData {
  penulis?: string;
  judul?: string;
  Editor?: string | null;
  Reporter?: string | null;
  linkGambar?: string | null;
  kategori?: string;
  jenisId?: number | null;
  isiHTML?: string;
}

export interface UpdateArticleResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Fetch article by kodeKonten for editing
 */
export const getKontenByKode = async (kodeKonten: string): Promise<GetKontenResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/konten/${kodeKonten}`, {
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
    console.error('Error fetching konten by kode:', error);
    throw error;
  }
};

/**
 * Update article via API
 */
export const updateKonten = async (
  kodeKonten: string, 
  articleData: UpdateArticleData
): Promise<UpdateArticleResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/konten/${kodeKonten}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(articleData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    return result;
    
  } catch (error) {
    console.error('Error updating konten:', error);
    throw error;
  }
};

/**
 * Complete article update process (upload new image if provided + update article)
 */
export const updateArticleWithImage = async (
  kodeKonten: string,
  formData: {
    title: string;
    source: string;
    reporter: string;
    editor: string;
    category: string;
    type: number;
    content: string;
    coverImage: File | null;
    currentImageUrl?: string | null;
  }
): Promise<UpdateArticleResponse> => {
  try {
    let linkGambar: string | null = formData.currentImageUrl || null;

    // Step 1: Upload new image to Supabase if a new image is provided
    if (formData.coverImage) {
      console.log('📤 Uploading new image to Supabase...');
      linkGambar = await uploadImageToSupabase(formData.coverImage);
      console.log('✅ New image uploaded successfully:', linkGambar);
    }

    // Step 2: Prepare update data according to your API requirements
    const updateData: UpdateArticleData = {
      penulis: formData.source || 'Admin',
      judul: formData.title,
      Editor: formData.editor || null,
      Reporter: formData.reporter || null,
      linkGambar: linkGambar,
      kategori: formData.category,
      jenisId: formData.type,
      isiHTML: formData.content
    };

    // Step 3: Submit update to your backend API
    console.log('📡 Submitting article update to backend...');
    console.log('Update data:', updateData);
    
    const result = await updateKonten(kodeKonten, updateData);
    console.log('✅ Article updated successfully:', result);

    return result;
    
  } catch (error) {
    console.error('❌ Error in updateArticleWithImage:', error);
    throw error;
  }
};

export interface DeleteArticleResponse {
  success: boolean;
  message?: string;
}

export const deleteKonten = async (kodeKonten: string): Promise<DeleteArticleResponse> => {
  try {
    const token = sessionStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/api/admin/konten/${kodeKonten}`, {
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
    console.error('Error deleting konten:', error);
    throw error;
  }
};