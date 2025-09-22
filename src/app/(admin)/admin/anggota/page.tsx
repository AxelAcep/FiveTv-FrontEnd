"use client";
import { useState, useEffect, useRef } from 'react';
import Sidebar from "@/components/SideBar";
import styles from "../../../../components/ListArticleAdmin.module.css";
import styles2 from "../../../../components/MemberList.module.css";
import Image from "next/image";
import { getWebsiteConfig, WebsiteConfigData } from "../../../../services/ConfigServices";
import { useRouter } from "next/navigation";
// Import member services
import { 
  getAllMembers, 
  getMemberById, 
  updateMember, 
  deleteMember, 
  addMember,
  validateMemberForm, 
  uploadMemberPhoto,
  deleteMemberPhoto,
  MemberData 
} from '../../../../services/MemberSercives';

export default function ListAnggota() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('edit');
  const [editFormData, setEditFormData] = useState({
    nama: '',
    nim: '',
    prodi: '',
    jabatan: '',
    fotoLink: '',
    divisi: '',
    linkedin: '',
    Instagram: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  // Photo upload states
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch members on component mount
  useEffect(() => {

    const token = sessionStorage.getItem("adminToken");
    if (!token) {
      alert('Authentication required. Please login first.');
      router.push('/admin'); // Adjust this path as needed
      return;
    }

    fetchMembers();

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
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllMembers();
      if (response.success) {
        setMembers(response.data);
      } else {
        console.error('Failed to fetch members:', response.message);
        alert('Gagal memuat data anggota');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Gagal memuat data anggota');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMembers = members.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(members.length / itemsPerPage);

  const handleEdit = async (nim: string) => {
    try {
      setIsLoading(true);
      const response = await getMemberById(nim);
      if (response.success && response.data) {
        setSelectedMember(response.data);
        setModalMode('edit');
        setEditFormData({
          nama: response.data.nama || '',
          nim: response.data.nim || '',
          prodi: response.data.prodi || '',
          jabatan: response.data.jabatan || '',
          fotoLink: response.data.fotoLink || '',
          divisi: response.data.divisi || '',
          linkedin: response.data.linkedin || '',
          Instagram: response.data.Instagram || ''
        });
        setPhotoPreview(response.data.fotoLink || '');
        setSelectedPhoto(null);
        setIsModalOpen(true);
      } else {
        alert('Gagal memuat data anggota');
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      alert('Gagal memuat data anggota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = () => {
    setModalMode('add');
    setSelectedMember(null);
    setEditFormData({
      nama: '',
      nim: '',
      prodi: '',
      jabatan: '',
      fotoLink: '',
      divisi: '',
      linkedin: '',
      Instagram: ''
    });
    setSelectedPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setModalMode('edit');
    setEditFormData({
      nama: '',
      nim: '',
      prodi: '',
      jabatan: '',
      fotoLink: '',
      divisi: '',
      linkedin: '',
      Instagram: ''
    });
    setSelectedPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setSelectedPhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;
    
    // For add mode, use nim from form data, for edit mode use selectedMember nim
    const nimForUpload = modalMode === 'add' ? editFormData.nim : selectedMember?.nim;
    
    if (!nimForUpload) {
      alert('NIM harus diisi terlebih dahulu sebelum mengunggah foto');
      return;
    }

    try {
      setIsUploadingPhoto(true);

      // Delete old photo if exists (only in edit mode)
      if (modalMode === 'edit' && selectedMember?.fotoLink && selectedMember.fotoLink !== '-') {
        await deleteMemberPhoto(selectedMember.fotoLink);
      }

      // Upload new photo
      const uploadResponse = await uploadMemberPhoto(selectedPhoto, nimForUpload);
      
      if (uploadResponse.success && uploadResponse.url) {
        setEditFormData(prev => ({
          ...prev,
          fotoLink: uploadResponse.url!
        }));
        setPhotoPreview(uploadResponse.url!);
        alert('Foto berhasil diunggah!');
      } else {
        alert(uploadResponse.message || 'Gagal mengunggah foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Gagal mengunggah foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Remove photo
  const handlePhotoRemove = () => {
    setSelectedPhoto(null);
    setPhotoPreview('');
    setEditFormData(prev => ({
      ...prev,
      fotoLink: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateMemberForm({
      nama: editFormData.nama,
      nim: editFormData.nim,
      prodi: editFormData.prodi,
      jabatan: editFormData.jabatan,
      divisi: editFormData.divisi
    });

    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (modalMode === 'add') {
        // Add new member
        const response = await addMember({
          nama: editFormData.nama,
          nim: editFormData.nim,
          prodi: editFormData.prodi,
          jabatan: editFormData.jabatan,
          fotoLink: editFormData.fotoLink,
          divisi: editFormData.divisi,
          linkedin: editFormData.linkedin,
          Instagram: editFormData.Instagram
        });
        
        if (response.success) {
          alert('Anggota baru berhasil ditambahkan!');
          handleModalClose();
          fetchMembers(); // Refresh the member list
        } else {
          alert('Gagal menambahkan anggota baru');
        }
      } else {
        // Update existing member
        if (!selectedMember) return;
        
        const response = await updateMember(selectedMember.nim, {
          nama: editFormData.nama,
          prodi: editFormData.prodi,
          jabatan: editFormData.jabatan,
          fotoLink: editFormData.fotoLink,
          divisi: editFormData.divisi,
          linkedin: editFormData.linkedin,
          Instagram: editFormData.Instagram
        });
        
        if (response.success) {
          alert('Data anggota berhasil diperbarui!');
          handleModalClose();
          fetchMembers(); // Refresh the member list
        } else {
          alert('Gagal memperbarui data anggota');
        }
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert(modalMode === 'add' ? 'Gagal menambahkan anggota baru' : 'Gagal memperbarui data anggota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (nim: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus anggota "${nama}" dengan NIM ${nim}?\n\nData yang sudah dihapus tidak dapat dikembalikan!`)) {
      try {
        setIsLoading(true);
        const response = await deleteMember(nim);
        if (response.success) {
          alert('Anggota berhasil dihapus!');
          fetchMembers(); // Refresh the member list
        } else {
          alert('Gagal menghapus anggota');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Gagal menghapus anggota');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && members.length === 0) {
    return (
      <section>
        <div className={styles.maincontainer}>
          <Sidebar />
          <div className={styles2.loadingContainer}>
            <div className={styles2.loadingContent}>
              <div className={styles2.spinner}></div>
              <div className={styles2.loadingText}>Memuat data anggota...</div>
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
        <div className={styles2.mainContent}>
          <div className={styles.mainheader}>
            <p className={styles.TextHeaderOne}>Anggota</p>
            <div className={styles.socials}>
              <a href={socialLinks.instagram}><Image src="/images/binstagram.png" alt="Instagram" width={24} height={24} /></a>
              <a href={socialLinks.twitter}><Image src="/images/btwitter.png" alt="Twitter" width={24} height={24} /></a>
              <a href={socialLinks.youtube}><Image src="/images/byoutube.png" alt="YouTube" width={24} height={24} /></a>
              <a href={socialLinks.tiktok}><Image src="/images/bticktok.png" alt="TikTok" width={24} height={24} /></a>
              <a href={socialLinks.linkedin}><Image src="/images/blinkedin.png" alt="LinkedIn" width={24} height={24} /></a>
            </div>
            <a href="../"><p className={styles.TextHeaderTwo}>Halaman Utama</p></a>
          </div>
          
          <div className={`${styles.contentContainer} ${styles2.contentContainer}`}>
            {/* Add Member Button */}
            <div className={styles2.addButtonContainer}>
              <button 
                onClick={handleAddMember}
                className={styles2.addButton}
              >
                + Tambah Anggota
              </button>
            </div>

            {/* Member Table */}
            <div className={styles2.tableContainer}>
              {members.length === 0 ? (
                <div className={styles2.noDataMessage}>
                  Tidak ada data anggota
                </div>
              ) : (
                <>
                  <table className={styles2.table}>
                    <thead>
                      <tr className={styles2.tableHeader}>
                        <th className={styles2.tableHeaderCell}>No</th>
                        <th className={styles2.tableHeaderCell}>NIM</th>
                        <th className={styles2.tableHeaderCell}>Anggota</th>
                        <th className={styles2.tableHeaderCell}>Jabatan</th>
                        <th className={styles2.tableHeaderCell}>Divisi</th>
                        <th className={styles2.tableHeaderCellCenter}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentMembers.map((member, index) => (
                        <tr key={member.id} className={styles2.tableRow}>
                          <td className={styles2.tableCell}>
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className={styles2.tableCell}>
                            {member.nim}
                          </td>
                          <td className={styles2.tableCell}>
                            <div className={styles2.memberProfile}>
                              <div 
                                className={styles2.memberAvatar}
                                style={{
                                  backgroundImage: member.fotoLink && member.fotoLink !== '-' ? `url(${member.fotoLink})` : 'none',
                                  backgroundColor: member.fotoLink && member.fotoLink !== '-' ? 'transparent' : '#e9ecef'
                                }}
                              >
                                {(!member.fotoLink || member.fotoLink === '-') && member.nama.charAt(0).toUpperCase()}
                              </div>
                              <span className={styles2.memberName}>{member.nama}</span>
                            </div>
                          </td>
                          <td className={styles2.tableCell}>
                            {member.jabatan}
                          </td>
                          <td className={styles2.tableCell}>
                            {member.divisi}
                          </td>
                          <td className={styles2.tableCellCenter}>
                            <div className={styles2.actionButtons}>
                              <button 
                                onClick={() => handleEdit(member.nim)}
                                disabled={isLoading}
                                className={styles2.actionButton}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M12.854 2.146a.5.5 0 0 0-.708 0L4 10.293V12h1.707l8.147-8.146a.5.5 0 0 0 0-.708l-1-1Z" fill="#6c757d"/>
                                  <path d="M2 3.5v11A1.5 1.5 0 0 0 3.5 16h11A1.5 1.5 0 0 0 16 14.5V8a.5.5 0 0 0-1 0v6.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H8a.5.5 0 0 0 0-1H3.5A1.5 1.5 0 0 0 2 3.5Z" fill="#6c757d"/>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDelete(member.nim, member.nama)}
                                disabled={isLoading}
                                className={`${styles2.actionButton} ${styles2.deleteButton}`}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" fill="#dc3545"/>
                                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" fill="#dc3545"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className={styles2.pagination}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={styles2.paginationButton}
                    >
                      ‹
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`${styles2.paginationButton} ${currentPage === pageNum ? styles2.paginationButtonActive : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={styles2.paginationButton}
                    >
                      ›
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className={styles2.modalOverlay}>
          <div className={styles2.modalContainer}>
            {/* Modal Header */}
            <div className={styles2.modalHeader}>
              <div className={styles2.modalHeaderBg}></div>
              <div className={styles2.modalHeaderContent}>
                <h2 className={styles2.modalTitle}>
                  {modalMode === 'add' ? 'Tambah Anggota' : 'Edit Anggota'}
                </h2>
                <p className={styles2.modalSubtitle}>
                  {modalMode === 'add' 
                    ? 'Tambahkan anggota baru ke dalam sistem' 
                    : `Perbarui informasi anggota • ${selectedMember?.nim}`
                  }
                </p>
              </div>
              <button
                onClick={handleModalClose}
                disabled={isSubmitting}
                className={styles2.modalCloseButton}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles2.modalBody}>
              <form onSubmit={handleFormSubmit} className={styles2.modalForm}>
                {/* Profile Photo Upload Section */}
                <div className={styles2.modalProfileContainer}>
                  <div 
                    className={styles2.modalProfilePhoto}
                    style={{
                      backgroundImage: photoPreview ? `url(${photoPreview})` : 'none'
                    }}
                  >
                    {!photoPreview && (editFormData.nama ? editFormData.nama.charAt(0).toUpperCase() : '?')}
                  </div>
                  
                  <div className={styles2.photoUploadButtons}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className={styles2.hiddenFileInput}
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSubmitting || isUploadingPhoto}
                      className={styles2.photoButton}
                    >
                      Pilih Foto
                    </button>
                    
                    {selectedPhoto && (
                      <button
                        type="button"
                        onClick={handlePhotoUpload}
                        disabled={isSubmitting || isUploadingPhoto || !editFormData.nim.trim()}
                        className={`${styles2.photoButton} ${styles2.photoButtonPrimary}`}
                      >
                        {isUploadingPhoto ? 'Mengunggah...' : 'Upload'}
                      </button>
                    )}
                    
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handlePhotoRemove}
                        disabled={isSubmitting || isUploadingPhoto}
                        className={`${styles2.photoButton} ${styles2.photoButtonDanger}`}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  
                  <p className={styles2.photoHint}>
                    Format: JPG, PNG, WebP • Maksimal 5MB
                    {modalMode === 'add' && selectedPhoto && (
                      <span style={{color: '#dc3545'}}>* Isi NIM terlebih dahulu sebelum upload</span>
                    )}
                  </p>
                </div>

                {/* Form Fields */}
                <div className={styles2.formGrid}>
                  <div className={styles2.formFieldFull}>
                    <label className={styles2.formLabel}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={editFormData.nama}
                      onChange={handleFormChange}
                      required
                      disabled={isSubmitting}
                      className={styles2.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      NIM *
                    </label>
                    <input
                      type="text"
                      name="nim"
                      value={editFormData.nim}
                      onChange={handleFormChange}
                      required
                      disabled={isSubmitting || modalMode === 'edit'}
                      className={styles2.formInput}
                      placeholder="Contoh: 2021110001"
                    />
                    {modalMode === 'edit' && (
                      <small style={{color: '#666', fontSize: '11px'}}>
                        NIM tidak dapat diubah
                      </small>
                    )}
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      Program Studi *
                    </label>
                    <input
                      type="text"
                      name="prodi"
                      value={editFormData.prodi}
                      onChange={handleFormChange}
                      required
                      disabled={isSubmitting}
                      className={styles2.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      name="jabatan"
                      value={editFormData.jabatan}
                      onChange={handleFormChange}
                      required
                      disabled={isSubmitting}
                      className={styles2.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      Divisi *
                    </label>
                    <input
                      type="text"
                      name="divisi"
                      value={editFormData.divisi}
                      onChange={handleFormChange}
                      required
                      disabled={isSubmitting}
                      className={styles2.formInput}
                    />
                  </div>

                  <div className={styles2.formFieldFull}>
                    <label className={styles2.formLabel}>
                      Link Foto Profil
                    </label>
                    <input
                      type="url"
                      name="fotoLink"
                      value={editFormData.fotoLink}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                      placeholder="https://example.com/photo.jpg"
                      className={styles2.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="linkedin"
                      value={editFormData.linkedin}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                      placeholder="https://linkedin.com/in/username"
                      className={styles2.formInput}
                    />
                  </div>

                  <div>
                    <label className={styles2.formLabel}>
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="Instagram"
                      value={editFormData.Instagram}
                      onChange={handleFormChange}
                      disabled={isSubmitting}
                      placeholder="https://instagram.com/username"
                      className={styles2.formInput}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className={styles2.modalFooter}>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={isSubmitting}
                    className={styles2.modalButtonSecondary}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles2.modalButtonPrimary}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles2.buttonSpinner}></div>
                        {modalMode === 'add' ? 'Menambahkan...' : 'Menyimpan...'}
                      </>
                    ) : (
                      modalMode === 'add' ? 'Tambah Anggota' : 'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}