"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/SideBar";
import styles from "../../../../components/ListArticleAdmin.module.css";
import configStyles from "../../../../components/ConfigPage.module.css";
import Image from "next/image";
// Import config services
import {
  getAllJenis,
  addJenis,
  getWebsiteConfig,
  updateWebsiteConfig,
  uploadConfigImage,
  deleteConfigImage,
  validateJenisForm,
  validateWebsiteConfigForm,
  JenisData,
  WebsiteConfigData,
} from "../../../../services/ConfigServices";

export default function EditWebsitePage() {
  // Router
  const router = useRouter();

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


  // Jenis Management State
  const [jenisList, setJenisList] = useState<JenisData[]>([]);
  const [newJenisName, setNewJenisName] = useState('');
  const [isAddingJenis, setIsAddingJenis] = useState(false);

  // Website Config State
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfigData>({
    desc_satu: '',
    desc_dua: '',
    visi: '',
    misi: '',
    struktur: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    linkedin: '',
    banner: '',
    kontenI_id: '',
    kontenII_id: '',
    kontenIII_id: '',
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Image Upload State
  const [selectedStrukturImage, setSelectedStrukturImage] = useState<File | null>(null);
  const [selectedBannerImage, setSelectedBannerImage] = useState<File | null>(null);
  const [isUploadingStruktur, setIsUploadingStruktur] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const strukturFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Loading States
  const [isLoadingJenis, setIsLoadingJenis] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    // Check if user is authenticated
    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      alert('Authentication required. Please login first.');
      router.push('/admin'); // Adjust this path as needed
      return;
    }
    
    fetchJenis();
    fetchWebsiteConfig();
  }, [router]);

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
        console.error('Error fetching social links:', error);
        // Keep default "#" values if fetch fails
      } finally {
        setIsLoadingJenis(false);
      }   
    };

    fetchSocialLinks();


  // Fetch Jenis List
  const fetchJenis = async () => {
    try {
      setIsLoadingJenis(true);
      const response = await getAllJenis();
      if (response.success) {
        setJenisList(response.data);
        setError(null);
      } else {
        setError('Gagal memuat data jenis');
      }
    } catch (error) {
      console.error('Error fetching jenis:', error);
      setError('Gagal memuat data jenis');
    } finally {
      setIsLoadingJenis(false);
    }
  };

  // Fetch Website Config
  const fetchWebsiteConfig = async () => {
    try {
      setIsLoadingConfig(true);
      const response = await getWebsiteConfig();
      if (response.success) {
        // Ensure string values are properly set
        const configData = {
          ...response.data,
          kontenI_id: response.data.kontenI_id || '',
          kontenII_id: response.data.kontenII_id || '',
          kontenIII_id: response.data.kontenIII_id || '',
        };
        setWebsiteConfig(configData);
        setError(null);
      } else {
        setError('Gagal memuat konfigurasi website');
      }
    } catch (error) {
      console.error('Error fetching website config:', error);
      setError('Gagal memuat konfigurasi website');
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Add New Jenis
  const handleAddJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateJenisForm({ nama: newJenisName });
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      setIsAddingJenis(true);
      const response = await addJenis({ nama: newJenisName });
      if (response.success) {
        alert('Jenis berhasil ditambahkan!');
        setNewJenisName('');
        fetchJenis(); // Refresh list
      } else {
        alert('Gagal menambahkan jenis');
      }
    } catch (error) {
      console.error('Error adding jenis:', error);
      alert('Gagal menambahkan jenis');
    } finally {
      setIsAddingJenis(false);
    }
  };

  // Handle Website Config Form Changes
  const handleConfigChange = (field: keyof WebsiteConfigData, value: string) => {
    setWebsiteConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle Image Selection
  const handleImageSelect = (type: 'struktur' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    if (type === 'struktur') {
      setSelectedStrukturImage(file);
    } else {
      setSelectedBannerImage(file);
    }
  };

  // Handle Image Upload
  const handleImageUpload = async (type: 'struktur' | 'banner') => {
    const file = type === 'struktur' ? selectedStrukturImage : selectedBannerImage;
    if (!file) return;

    try {
      if (type === 'struktur') {
        setIsUploadingStruktur(true);
        // Delete old image if exists
        if (websiteConfig.struktur) {
          await deleteConfigImage(websiteConfig.struktur);
        }
      } else {
        setIsUploadingBanner(true);
        // Delete old image if exists
        if (websiteConfig.banner) {
          await deleteConfigImage(websiteConfig.banner);
        }
      }

      const uploadResponse = await uploadConfigImage(file, type);
      
      if (uploadResponse.success && uploadResponse.url) {
        handleConfigChange(type, uploadResponse.url);
        if (type === 'struktur') {
          setSelectedStrukturImage(null);
          if (strukturFileInputRef.current) {
            strukturFileInputRef.current.value = '';
          }
        } else {
          setSelectedBannerImage(null);
          if (bannerFileInputRef.current) {
            bannerFileInputRef.current.value = '';
          }
        }
        alert('Gambar berhasil diunggah!');
      } else {
        alert(uploadResponse.message || 'Gagal mengunggah gambar');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Gagal mengunggah gambar');
    } finally {
      if (type === 'struktur') {
        setIsUploadingStruktur(false);
      } else {
        setIsUploadingBanner(false);
      }
    }
  };

  // Handle Image Remove
  const handleImageRemove = (type: 'struktur' | 'banner') => {
    if (type === 'struktur') {
      setSelectedStrukturImage(null);
      if (strukturFileInputRef.current) {
        strukturFileInputRef.current.value = '';
      }
    } else {
      setSelectedBannerImage(null);
      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = '';
      }
    }
    handleConfigChange(type, '');
  };

  // Save Website Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateWebsiteConfigForm(websiteConfig);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      setIsSavingConfig(true);
      const response = await updateWebsiteConfig(websiteConfig);
      if (response.success) {
        alert('Konfigurasi website berhasil disimpan!');
      } else {
        alert('Gagal menyimpan konfigurasi website');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Gagal menyimpan konfigurasi website');
    } finally {
      setIsSavingConfig(false);
    }
  };

  if (isLoadingJenis && isLoadingConfig) {
    return (
      <section>
        <div className={styles.maincontainer}>
          <Sidebar />
          <div style={{ flex: 1 }}>
            <div className={styles.mainheader}>
              <p className={styles.TextHeaderOne}>Konfigurasi Website</p>
             <div className={styles.socials}>
              <a href={websiteConfig.instagram}><Image src="/images/binstagram.png" alt="Instagram" width={24} height={24} /></a>
              <a href={websiteConfig.twitter}><Image src="/images/btwitter.png" alt="Twitter" width={24} height={24} /></a>
              <a href={websiteConfig.youtube}><Image src="/images/byoutube.png" alt="YouTube" width={24} height={24} /></a>
              <a href={websiteConfig.tiktok}><Image src="/images/bticktok.png" alt="TikTok" width={24} height={24} /></a>
              <a href={websiteConfig.linkedin}><Image src="/images/blinkedin.png" alt="LinkedIn" width={24} height={24} /></a>
              </div>

              <a href="../"><p className={styles.TextHeaderTwo}>Halaman Utama</p></a>
            </div>
            
            <div className={configStyles.loadingContainer}>
              <div className={configStyles.loadingContent}>
                <div className={configStyles.spinner}></div>
                <div className={configStyles.loadingText}>Memuat konfigurasi...</div>
              </div>
            </div>
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
            <p className={styles.TextHeaderOne}>Konfigurasi Website</p>
            <div className={styles.socials}>
              <a href="#"><Image src="/images/binstagram.png" alt="Instagram" width={24} height={24} /></a>
              <a href="#"><Image src="/images/btwitter.png" alt="Twitter" width={24} height={24} /></a>
              <a href="#"><Image src="/images/byoutube.png" alt="YouTube" width={24} height={24} /></a>
              <a href="#"><Image src="/images/bticktok.png" alt="TikTok" width={24} height={24} /></a>
              <a href="#"><Image src="/images/blinkedin.png" alt="LinkedIn" width={24} height={24} /></a>
            </div>
            <a href="../"><p className={styles.TextHeaderTwo}>Halaman Utama</p></a>
          </div>
          
          <div className={configStyles.configContainer}>
            {/* Error Display */}
            {error && (
              <div className={configStyles.errorContainer}>
                {error}
              </div>
            )}

            {/* Jenis Management Section */}
            <div className={configStyles.configSection}>
              <div className={configStyles.sectionHeader}>
                <h2 className={configStyles.sectionTitle}>Manajemen Jenis</h2>
                <p className={configStyles.sectionSubtitle}>Kelola jenis konten yang tersedia</p>
              </div>
              <div className={configStyles.sectionContent}>
                <div className={configStyles.jenisContainer}>
                  {/* Add New Jenis Form */}
                  <div className={configStyles.jenisAddForm}>
                    <h3>Tambah Jenis Baru</h3>
                    <form onSubmit={handleAddJenis}>
                      <div className={configStyles.jenisInputGroup}>
                        <input
                          type="text"
                          value={newJenisName}
                          onChange={(e) => setNewJenisName(e.target.value)}
                          placeholder="Nama jenis konten..."
                          disabled={isAddingJenis}
                          className={configStyles.jenisInput}
                        />
                        <button
                          type="submit"
                          disabled={isAddingJenis || !newJenisName.trim()}
                          className={configStyles.jenisAddButton}
                        >
                          {isAddingJenis ? 'Menambah...' : 'Tambah'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Jenis List */}
                  <div className={configStyles.jenisList}>
                    <h3 className={configStyles.jenisListTitle}>Daftar Jenis ({jenisList.length})</h3>
                    {jenisList.length > 0 ? (
                      <div className={configStyles.jenisItems}>
                        {jenisList.map((jenis) => (
                          <div key={jenis.id} className={configStyles.jenisItem}>
                            {jenis.nama}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={configStyles.jenisEmpty}>
                        Belum ada jenis konten yang ditambahkan
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Website Configuration Section */}
            <div className={configStyles.configSection}>
              <div className={configStyles.sectionHeader}>
                <h2 className={configStyles.sectionTitle}>Konfigurasi Website</h2>
                <p className={configStyles.sectionSubtitle}>Atur informasi dan tampilan website</p>
              </div>
              <div className={configStyles.sectionContent}>
                <form onSubmit={handleSaveConfig} className={configStyles.configForm}>
                  {/* Basic Information */}
                  <div className={configStyles.formGrid}>
                    <div className={`${configStyles.formGroup} ${configStyles.formGridFull}`}>
                      <label className={configStyles.formLabel}>Deskripsi Satu *</label>
                      <textarea
                        value={websiteConfig.desc_satu}
                        onChange={(e) => handleConfigChange('desc_satu', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formTextarea}
                        placeholder="Deskripsi utama website..."
                      />
                    </div>

                    <div className={`${configStyles.formGroup} ${configStyles.formGridFull}`}>
                      <label className={configStyles.formLabel}>Deskripsi Dua *</label>
                      <textarea
                        value={websiteConfig.desc_dua}
                        onChange={(e) => handleConfigChange('desc_dua', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formTextarea}
                        placeholder="Deskripsi tambahan website..."
                      />
                    </div>

                    <div className={`${configStyles.formGroup} ${configStyles.formGridFull}`}>
                      <label className={configStyles.formLabel}>Visi *</label>
                      <textarea
                        value={websiteConfig.visi}
                        onChange={(e) => handleConfigChange('visi', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formTextarea}
                        placeholder="Visi organisasi..."
                      />
                    </div>

                    <div className={`${configStyles.formGroup} ${configStyles.formGridFull}`}>
                      <label className={configStyles.formLabel}>Misi *</label>
                      <textarea
                        value={websiteConfig.misi}
                        onChange={(e) => handleConfigChange('misi', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formTextarea}
                        placeholder="Misi organisasi..."
                      />
                    </div>
                  </div>

                  {/* Image Uploads */}
                  <div className={configStyles.formGrid}>
                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Gambar Struktur Organisasi</label>
                      <div className={configStyles.imageUploadContainer}>
                        {websiteConfig.struktur && (
                          <img 
                            src={websiteConfig.struktur} 
                            alt="Struktur" 
                            className={configStyles.imagePreview}
                          />
                        )}
                        
                        <input
                          type="file"
                          ref={strukturFileInputRef}
                          onChange={(e) => handleImageSelect('struktur', e)}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className={configStyles.hiddenFileInput}
                        />
                        
                        <div className={configStyles.imageUploadButtons}>
                          <button
                            type="button"
                            onClick={() => strukturFileInputRef.current?.click()}
                            disabled={isSavingConfig || isUploadingStruktur}
                            className={configStyles.imageButton}
                          >
                            Pilih Gambar
                          </button>
                          
                          {selectedStrukturImage && (
                            <button
                              type="button"
                              onClick={() => handleImageUpload('struktur')}
                              disabled={isSavingConfig || isUploadingStruktur}
                              className={`${configStyles.imageButton} ${configStyles.imageButtonPrimary}`}
                            >
                              {isUploadingStruktur ? 'Mengunggah...' : 'Upload'}
                            </button>
                          )}
                          
                          {websiteConfig.struktur && (
                            <button
                              type="button"
                              onClick={() => handleImageRemove('struktur')}
                              disabled={isSavingConfig || isUploadingStruktur}
                              className={`${configStyles.imageButton} ${configStyles.imageButtonDanger}`}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        
                        <p className={configStyles.imageHint}>
                          Format: JPG, PNG, WebP • Maksimal 10MB
                        </p>
                      </div>
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Gambar Banner</label>
                      <div className={configStyles.imageUploadContainer}>
                        {websiteConfig.banner && (
                          <img 
                            src={websiteConfig.banner} 
                            alt="Banner" 
                            className={configStyles.imagePreview}
                          />
                        )}
                        
                        <input
                          type="file"
                          ref={bannerFileInputRef}
                          onChange={(e) => handleImageSelect('banner', e)}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className={configStyles.hiddenFileInput}
                        />
                        
                        <div className={configStyles.imageUploadButtons}>
                          <button
                            type="button"
                            onClick={() => bannerFileInputRef.current?.click()}
                            disabled={isSavingConfig || isUploadingBanner}
                            className={configStyles.imageButton}
                          >
                            Pilih Gambar
                          </button>
                          
                          {selectedBannerImage && (
                            <button
                              type="button"
                              onClick={() => handleImageUpload('banner')}
                              disabled={isSavingConfig || isUploadingBanner}
                              className={`${configStyles.imageButton} ${configStyles.imageButtonPrimary}`}
                            >
                              {isUploadingBanner ? 'Mengunggah...' : 'Upload'}
                            </button>
                          )}
                          
                          {websiteConfig.banner && (
                            <button
                              type="button"
                              onClick={() => handleImageRemove('banner')}
                              disabled={isSavingConfig || isUploadingBanner}
                              className={`${configStyles.imageButton} ${configStyles.imageButtonDanger}`}
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                        
                        <p className={configStyles.imageHint}>
                          Format: JPG, PNG, WebP • Maksimal 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className={configStyles.formGrid}>
                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Instagram</label>
                      <input
                        type="url"
                        value={websiteConfig.instagram}
                        onChange={(e) => handleConfigChange('instagram', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="https://instagram.com/username"
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Twitter</label>
                      <input
                        type="url"
                        value={websiteConfig.twitter}
                        onChange={(e) => handleConfigChange('twitter', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="https://twitter.com/username"
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>YouTube</label>
                      <input
                        type="url"
                        value={websiteConfig.youtube}
                        onChange={(e) => handleConfigChange('youtube', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="https://youtube.com/channel/..."
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>TikTok</label>
                      <input
                        type="url"
                        value={websiteConfig.tiktok}
                        onChange={(e) => handleConfigChange('tiktok', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="https://tiktok.com/@username"
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>LinkedIn</label>
                      <input
                        type="url"
                        value={websiteConfig.linkedin}
                        onChange={(e) => handleConfigChange('linkedin', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                  </div>

                  {/* Content IDs */}
                  <div className={configStyles.formGrid}>
                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Konten I ID *</label>
                      <input
                        type="text"
                        value={websiteConfig.kontenI_id || ''}
                        onChange={(e) => handleConfigChange('kontenI_id', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="ID konten untuk bagian I"
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Konten II ID *</label>
                      <input
                        type="text"
                        value={websiteConfig.kontenII_id || ''}
                        onChange={(e) => handleConfigChange('kontenII_id', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="ID konten untuk bagian II"
                      />
                    </div>

                    <div className={configStyles.formGroup}>
                      <label className={configStyles.formLabel}>Konten III ID *</label>
                      <input
                        type="text"
                        value={websiteConfig.kontenIII_id || ''}
                        onChange={(e) => handleConfigChange('kontenIII_id', e.target.value)}
                        disabled={isSavingConfig}
                        className={configStyles.formInput}
                        placeholder="ID konten untuk bagian III"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className={configStyles.saveButtonContainer}>
                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className={configStyles.saveButton}
                    >
                      {isSavingConfig ? (
                        <>
                          <div className={configStyles.saveButtonSpinner}></div>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Konfigurasi'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}