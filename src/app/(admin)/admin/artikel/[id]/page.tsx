"use client";
import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from "@/components/SideBar";
import styles from "../../../../../components/DetailArticleAdmin.module.css";
import Image from "next/image";
import { getWebsiteConfig, WebsiteConfigData } from "../../../../../services/ConfigServices";

interface FormData {
  title: string;
  source: string;
  reporter: string;
  editor: string;
  category: string;
  type: number;
  content: string;
  coverImage: File | null;
  currentImageUrl: string | null;
}

// Import the article services
import { 
  getKontenByKode,
  updateArticleWithImage, 
  deleteKonten,
  validateArticleForm, 
  getJenis, 
  JenisData,
  KontenData
} from '../../../../../services/ArticleServices';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const kodeKonten = params.id as string; // Get the kodeKonten from URL params

  const [formData, setFormData] = useState<FormData>({
    title: '',
    source: '',
    reporter: '',
    editor: '',
    category: 'artikel',
    type: 0,
    content: '',
    coverImage: null,
    currentImageUrl: null
  });

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


  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [jenisData, setJenisData] = useState<JenisData[]>([]);
  const [isLoadingJenis, setIsLoadingJenis] = useState<boolean>(true);
  const [originalData, setOriginalData] = useState<KontenData | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Fetch article data and jenis data on component mount
  useEffect(() => {

    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      alert('Authentication required. Please login first.');
      router.push('/admin'); // Adjust this path as needed
      return;
    }

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
        console.error('Error fetching social links in header:', error);
        // Keep default "#" values if fetch fails
      }
    };

    fetchSocialLinks();

    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch both article data and jenis data concurrently
        const [articleResponse, jenisResponse] = await Promise.all([
          getKontenByKode(kodeKonten),
          getJenis()
        ]);

        // Handle article data
        if (articleResponse.success && articleResponse.data) {
          const article = articleResponse.data;
          setOriginalData(article);
          
          setFormData({
            title: article.judul || '',
            source: article.penulis || '',
            reporter: article.Reporter || '',
            editor: article.Editor || '',
            category: article.kategori || 'artikel',
            type: article.jenisId || 0,
            content: article.isiHTML || '',
            coverImage: null,
            currentImageUrl: article.linkGambar || null
          });

          // Set image preview to current image if exists
          if (article.linkGambar) {
            setImagePreview(article.linkGambar);
          }

          // Set editor content
          if (editorRef.current && article.isiHTML) {
            editorRef.current.innerHTML = article.isiHTML;
          }
        } else {
          console.error('Failed to fetch article:', articleResponse.message);
          alert('Artikel tidak ditemukan atau gagal dimuat');
          router.push('/admin/artikel'); // Redirect to article list
        }

        // Handle jenis data
        if (jenisResponse.success) {
          setJenisData(jenisResponse.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Gagal memuat data artikel');
        router.push('/admin/artikel'); // Redirect to article list
      } finally {
        setIsLoadingData(false);
        setIsLoadingJenis(false);
      }
    };

    if (kodeKonten) {
      fetchData();
    }
  }, [kodeKonten, router]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'type' ? parseInt(value, 10) : value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setImagePreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setFormData(prev => ({
        ...prev,
        content: content
      }));
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const insertLink = () => {
    const url = prompt('Masukkan URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateArticleForm({
      title: formData.title,
      content: formData.content
    });
    
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Validate jenis selection
    if (formData.type === 0) {
      alert('Silakan pilih jenis artikel');
      return;
    }
    
    setIsLoading(true);

    try {
      // Use the service to handle image upload and article update
      const result = await updateArticleWithImage(kodeKonten, {
        ...formData,
        currentImageUrl: formData.currentImageUrl
      });
      
      console.log('Article updated successfully:', result);
      alert('Artikel berhasil diperbarui!');
      
      // Optionally redirect to article list or detail page
      router.push('/admin/artikel');

    } catch (error) {
      console.error('Error updating article:', error);
      alert(`Gagal memperbarui artikel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan perubahan? Semua perubahan yang belum disimpan akan hilang.')) {
      router.push('/admin/artikel');
    }
  };

  const handleDelete = async () => {
    if (!originalData) return;
    
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus artikel "${originalData.judul}"?\n\n` +
      `Kode: ${originalData.kodeKonten}\n` +
      `Tanggal: ${new Date(originalData.tanggal).toLocaleDateString('id-ID')}\n\n` +
      `Artikel yang sudah dihapus tidak dapat dikembalikan!`
    );

    if (!confirmDelete) return;

    // Double confirmation for extra safety
    const finalConfirm = confirm(
      'KONFIRMASI AKHIR: Artikel akan dihapus secara permanen. Lanjutkan?'
    );

    if (!finalConfirm) return;

    setIsLoading(true);

    try {
      console.log('🗑️ Deleting article:', kodeKonten);
      const result = await deleteKonten(kodeKonten);
      
      if (result.success) {
        console.log('✅ Article deleted successfully:', result);
        alert('Artikel berhasil dihapus!');
        router.push('/admin/artikel'); // Redirect to article list
      } else {
        throw new Error(result.message || 'Gagal menghapus artikel');
      }
      
    } catch (error) {
      console.error('❌ Error deleting article:', error);
      alert(`Gagal menghapus artikel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ 
      ...prev, 
      coverImage: null, 
      currentImageUrl: null 
    }));
  };

  const resetToOriginal = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan ke data asli? Semua perubahan akan hilang.') && originalData) {
      setFormData({
        title: originalData.judul || '',
        source: originalData.penulis || '',
        reporter: originalData.Reporter || '',
        editor: originalData.Editor || '',
        category: originalData.kategori || 'artikel',
        type: originalData.jenisId || 0,
        content: originalData.isiHTML || '',
        coverImage: null,
        currentImageUrl: originalData.linkGambar || null
      });

      // Set image preview to original image
      setImagePreview(originalData.linkGambar || null);

      // Reset editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = originalData.isiHTML || '';
      }
    }
  };

  // Show loading state while fetching data
  if (isLoadingData) {
    return (
      <section>
        <div className={styles.maincontainer}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Memuat data artikel...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className={styles.maincontainer}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <div className={styles.mainheader}>
            <p className={styles.TextHeaderOne}>Edit Artikel - {originalData?.kodeKonten}</p>
            <div className={styles.socials}>
              <a href={socialLinks.instagram}><Image src="/images/binstagram.png" alt="Instagram" width={24} height={24} /></a>
              <a href={socialLinks.twitter}><Image src="/images/btwitter.png" alt="Twitter" width={24} height={24} /></a>
              <a href={socialLinks.youtube}><Image src="/images/byoutube.png" alt="YouTube" width={24} height={24} /></a>
              <a href={socialLinks.tiktok}><Image src="/images/bticktok.png" alt="TikTok" width={24} height={24} /></a>
              <a href={socialLinks.linkedin}><Image src="/images/blinkedin.png" alt="LinkedIn" width={24} height={24} /></a>
            </div>
            <a href="../"><p className={styles.TextHeaderTwo}>Halaman Utama</p></a>
          </div>
          
          <div className={styles.articleFormContainer}>
            <form onSubmit={handleSubmit} className={styles.articleForm}>
              {/* Header Section */}
              <div className={styles.formSection}>
                <div className={styles.titleSection}>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="ISI HEADER"
                    className={styles.titleInput}
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Article Info */}
                {originalData && (
                  <div className={styles.articleInfo} style={{ 
                    margin: '10px 0', 
                    padding: '10px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '5px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <p><strong>Kode:</strong> {originalData.kodeKonten}</p>
                    <p><strong>Tanggal:</strong> {new Date(originalData.tanggal).toLocaleDateString('id-ID')}</p>
                    <p><strong>Views:</strong> {originalData.view} | <strong>Views Bulan Ini:</strong> {originalData.viewMonth}</p>
                  </div>
                )}

                {/* Metadata Section */}
                <div className={styles.metadataSection}>
                  <div className={styles.metadataRow}>
                    <div className={styles.inputGroup}>
                      <label>📅</label>
                      <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        placeholder="Sumber: ----"
                        className={styles.metadataInput}
                        disabled={isLoading}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Reporter:</label>
                      <input
                        type="text"
                        name="reporter"
                        value={formData.reporter}
                        onChange={handleInputChange}
                        placeholder="----"
                        className={styles.metadataInput}
                        disabled={isLoading}
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Editor:</label>
                      <input
                        type="text"
                        name="editor"
                        value={formData.editor}
                        onChange={handleInputChange}
                        placeholder="----"
                        className={styles.metadataInput}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div className={styles.coverImageSection}>
                  <div className={styles.imageUploadArea}>
                    {imagePreview ? (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                        {!isLoading && (
                          <button 
                            type="button" 
                            onClick={removeImage}
                            className={styles.removeImageBtn}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className={styles.uploadLabel}>
                        <div className={styles.uploadContent}>
                          <div className={styles.uploadIcon}>📷</div>
                          <p>Unggah Cover Baru</p>
                          <span>Pilih gambar baru untuk cover artikel</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className={styles.hiddenFileInput}
                          disabled={isLoading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Category and Type Dropdowns */}
                <div className={styles.dropdownSection}>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                    disabled={isLoading || isLoadingJenis}
                  >
                    <option value={0}>
                      {isLoadingJenis ? 'Memuat jenis...' : 'Pilih Jenis'}
                    </option>
                    {jenisData.map((jenis) => (
                      <option key={jenis.id} value={jenis.id}>
                        {jenis.nama}
                      </option>
                    ))}
                  </select>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={styles.dropdown}
                    disabled={isLoading}
                  >
                    <option value="artikel">artikel</option>
                    <option value="program">program</option>
                  </select>
                </div>

                {/* Rich Text Editor */}
                <div className={styles.editorSection}>
                  <div className={styles.editorToolbar}>
                    <div className={styles.toolbarGroup}>
                      <button type="button" onClick={() => formatText('bold')} className={styles.toolbarBtn} title="Bold" disabled={isLoading}>
                        <strong>B</strong>
                      </button>
                      <button type="button" onClick={() => formatText('italic')} className={styles.toolbarBtn} title="Italic" disabled={isLoading}>
                        <em>I</em>
                      </button>
                      <button type="button" onClick={() => formatText('underline')} className={styles.toolbarBtn} title="Underline" disabled={isLoading}>
                        <u>U</u>
                      </button>
                    </div>
                    
                    <div className={styles.toolbarGroup}>
                      <button type="button" onClick={() => formatText('formatBlock', 'h1')} className={styles.toolbarBtn} title="Header 1" disabled={isLoading}>
                        H1
                      </button>
                      <button type="button" onClick={() => formatText('formatBlock', 'h2')} className={styles.toolbarBtn} title="Header 2" disabled={isLoading}>
                        H2
                      </button>
                      <button type="button" onClick={() => formatText('formatBlock', 'h3')} className={styles.toolbarBtn} title="Header 3" disabled={isLoading}>
                        H3
                      </button>
                    </div>
                    
                    <div className={styles.toolbarGroup}>
                      <button type="button" onClick={() => formatText('insertUnorderedList')} className={styles.toolbarBtn} title="Bullet List" disabled={isLoading}>
                        •
                      </button>
                      <button type="button" onClick={() => formatText('insertOrderedList')} className={styles.toolbarBtn} title="Numbered List" disabled={isLoading}>
                        1.
                      </button>
                    </div>
                    
                    <div className={styles.toolbarGroup}>
                      <button type="button" onClick={() => formatText('justifyLeft')} className={styles.toolbarBtn} title="Align Left" disabled={isLoading}>
                        ←
                      </button>
                      <button type="button" onClick={() => formatText('justifyCenter')} className={styles.toolbarBtn} title="Align Center" disabled={isLoading}>
                        ↔
                      </button>
                      <button type="button" onClick={() => formatText('justifyRight')} className={styles.toolbarBtn} title="Align Right" disabled={isLoading}>
                        →
                      </button>
                    </div>
                    
                    <div className={styles.toolbarGroup}>
                      <button type="button" onClick={insertLink} className={styles.toolbarBtn} title="Insert Link" disabled={isLoading}>
                        🔗
                      </button>
                      <button type="button" onClick={() => formatText('removeFormat')} className={styles.toolbarBtn} title="Clear Format" disabled={isLoading}>
                        ✖
                      </button>
                    </div>
                  </div>
                  
                  <div
                    ref={editorRef}
                    contentEditable={!isLoading}
                    onInput={handleEditorInput}
                    className={styles.richTextEditor}
                    data-placeholder="Tulis konten artikel di sini..."
                    suppressContentEditableWarning={true}
                  />
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                  <button type="button" onClick={handleCancel} className={styles.deleteBtn} disabled={isLoading}>
                    Batal
                  </button>
                  <button type="button" onClick={handleDelete} className={styles.deleteBtn} disabled={isLoading} style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}>
                    {isLoading ? 'Menghapus...' : 'Hapus Artikel'}
                  </button>
                  <button type="button" onClick={resetToOriginal} className={styles.resetBtn} disabled={isLoading} style={{
                    backgroundColor: '#ffc107',
                    color: '#212529',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}>
                    Reset
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? 'Memperbarui...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}