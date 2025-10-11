"use client"; // wajib di paling atas
import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import Sidebar from "@/components/SideBar";
import styles from "../../../../../components/DetailArticleAdmin.module.css";
import Image from "next/image";
import { getWebsiteConfig, WebsiteConfigData } from "../../../../../services/ConfigServices";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  source: string;
  reporter: string;
  editor: string;
  category: string;
  type: number;
  content: string;
  coverImage: File | null;
  caption: string;
}

// Import the article service
import { 
  createArticleWithImage, 
  validateArticleForm, 
  getJenis, 
  JenisData 
} from '../../../../../services/ArticleServices';

export default function AddArticlePage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    source: '',
    reporter: '',
    editor: '',
    category: 'artikel',
    type: 0, // Changed to 0 as default to represent no selection
    content: '',
    coverImage: null,
    caption: '',
  });

  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jenisData, setJenisData] = useState<JenisData[]>([]);
  const [isLoadingJenis, setIsLoadingJenis] = useState<boolean>(true);
  const editorRef = useRef<HTMLDivElement>(null);

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

  // Fetch jenis data on component mount
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

    const fetchJenisData = async () => {
      try {
        setIsLoadingJenis(true);
        const response = await getJenis();
        if (response.success) {
          setJenisData(response.data);
        }
      } catch (error) {
        console.error('Error fetching jenis data:', error);
        // You might want to show a toast or alert here
      } finally {
        setIsLoadingJenis(false);
      }
    };

    fetchJenisData();
  }, []);

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
      // Use the service to handle image upload and article creation
      const result = await createArticleWithImage(formData);
      
      console.log('Article created successfully:', result);
      alert('Artikel berhasil disimpan!');
      
      // Reset form
      setFormData({
        title: '',
        source: '',
        reporter: '',
        editor: '',
        category: 'artikel',
        type: 0,
        content: '',
        coverImage: null,
        caption: '',
      });
      setImagePreview(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }

    } catch (error) {
      console.error('Error creating article:', error);
      alert(`Gagal menyimpan artikel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      // Reset form
      setFormData({
        title: '',
        source: '',
        reporter: '',
        editor: '',
        category: 'artikel',
        type: 0,
        content: '',
        coverImage: null,
        caption: '',
      });
      setImagePreview(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      console.log('Form cleared');
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, coverImage: null }));
  };

  return (
    <section>
      <div className={styles.maincontainer}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <div className={styles.mainheader}>
            <p className={styles.TextHeaderOne}>Artikel</p>
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

                {/* Metadata Section */}
                <div className={styles.metadataSection}>
                  <div className={styles.metadataRow}>
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
                      <label>Penulis</label>
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

                <div className={styles.captionInputContainer} style={{ marginBottom: '10px' }}>
                  <h2> Caption </h2>
                  <textarea
                    name="caption"
                    value={formData.caption}
                    onChange={handleInputChange}
                    placeholder="caption"
                    className={styles.captionTextarea}
                    disabled={isLoading}
                    rows={3} // Membuat area cukup besar
                      style={{
                          width: '100%',
                          resize: 'vertical',
                          padding: '8px',
                          fontSize: '14px',
                          borderRadius: '12px',
                          border: '1px solid #ccc',
                          outline: 'none',
                          transition: 'border-color 0.3s ease'
                        }}
                  />
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
                          <p>Unggah Cover</p>
                          <span>Pilih gambar untuk cover artikel</span>
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
                  <button type="button" onClick={handleDelete} className={styles.deleteBtn} disabled={isLoading}>
                    Hapus
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? 'Mengunggah...' : 'Unggah'}
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