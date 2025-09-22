"use client"; // wajib di paling atas
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/SideBar";
import styles from "../../../../components/ListArticleAdmin.module.css";
import Image from "next/image";
import { getAdminKontenData, searchAdminKonten, KontenItem, SearchKontenParams } from "../../../../services/AdminServices";
import { getWebsiteConfig, WebsiteConfigData } from "../../../../services/ConfigServices";

interface Article {
  id: string;
  author: string;
  title: string;
  date: string;
  type: 'Artikel' | 'Program';
  totalViews: number;
  views: number;
  editor: string;
  reporter: string;
  imageLink: string;
  category: string;
}

export default function ListArticlePage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<SearchKontenParams>({});
  const [searchText, setSearchText] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const itemsPerPage = 10;

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

  // Function to transform API data to Article interface
  const transformKontenToArticle = (kontenItem: KontenItem): Article => {
    return {
      id: kontenItem.kodeKonten,
      author: kontenItem.penulis,
      title: kontenItem.judul,
      date: new Date(kontenItem.tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      type: kontenItem.kategori === 'artikel' ? 'Artikel' : 'Program',
      totalViews: kontenItem.view,
      views: kontenItem.viewMonth,
      editor: kontenItem.Editor,
      reporter: kontenItem.Reporter,
      imageLink: kontenItem.linkGambar,
      category: kontenItem.jenis.nama
    };
  };

  // Fetch data from API
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

    const fetchArticles = async () => {
      try {
        setLoading(true);
        let response;
        
        // Check if there are search parameters
        const hasSearchParams = Object.keys(searchParams).some(key => searchParams[key as keyof SearchKontenParams]);
        
        if (hasSearchParams) {
          response = await searchAdminKonten(searchParams);
        } else {
          response = await getAdminKontenData();
        }
        
        if (response.success && response.data) {
          const transformedArticles = response.data.map(transformKontenToArticle);
          setArticles(transformedArticles);
          setCurrentPage(1); // Reset to first page on new search
        } else {
          setError("Failed to fetch articles data");
        }
      } catch (err) {
        setError("Error loading articles: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchParams]); // Re-fetch when search parameters change

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = articles.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!selectedColumn || !searchText.trim()) {
      // If no column selected or empty search, clear search and fetch all data
      setSearchParams({});
      return;
    }

    const newSearchParams: SearchKontenParams = {};
    
    switch (selectedColumn) {
      case 'Author':
        newSearchParams.penulis = searchText.trim();
        break;
      case 'Title':
        newSearchParams.judul = searchText.trim();
        break;
      case 'Type':
        // Map display values to API values
        if (searchText.toLowerCase().includes('artikel')) {
          newSearchParams.kategori = 'artikel';
        } else if (searchText.toLowerCase().includes('program')) {
          newSearchParams.kategori = 'program';
        }
        break;
      case 'Category':
        newSearchParams.jenis = searchText.trim();
        break;
      case 'Date':
        // Assuming date format is yyyy-mm-dd
        newSearchParams.tanggal = searchText.trim();
        break;
      default:
        // Search in title by default
        newSearchParams.judul = searchText.trim();
    }
    
    setSearchParams(newSearchParams);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchText('');
    setSelectedColumn('');
    setSearchParams({});
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle edit button click
  const handleEditClick = (articleId: string) => {
    router.push(`/admin/artikel/${articleId}`);
  };

  if (loading) {
    return (
      <section>
        <div className={styles.maincontainer}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p>Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className={styles.maincontainer}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <p style={{ color: 'red' }}>{error}</p>
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
          
          <div className={styles.articleContainer}>
            <div className={styles.tableHeader}>
              <div className={styles.headerControls}>
                <select 
                  className={styles.columnSelect}
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  <option value="">Select column...</option>
                  <option value="ID">ID</option>
                  <option value="Author">Author</option>
                  <option value="Title">Title</option>
                  <option value="Date">Date (yyyy-mm-dd)</option>
                  <option value="Type">Type (artikel/program)</option>
                  <option value="Category">Category</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search text..." 
                  className={styles.searchInput}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className={styles.addButton} 
                  onClick={handleSearch}
                  style={{ marginRight: '8px' }}
                >
                  Search
                </button>
                {(selectedColumn || searchText) && (
                  <button 
                    className={styles.addButton} 
                    onClick={handleClearSearch}
                    style={{ backgroundColor: '#6c757d', marginRight: '8px' }}
                  >
                    Clear
                  </button>
                )}
                <a href="artikel/tambah">
                <button className={styles.addButton}>Buat Berita</button>
              </a>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.articleTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Author</th>
                    <th>Title</th>
                    <th>Tanggal</th>
                    <th>Jenis</th>
                    <th>Total Views</th>
                    <th>Views (Month)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentArticles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.id}</td>
                      <td>{article.author}</td>
                      <td className={styles.titleCell}>{article.title}</td>
                      <td>{article.date}</td>
                      <td>
                        <span className={`${styles.typeTag} ${article.type === 'Artikel' ? styles.artikel : styles.program}`}>
                          ● {article.type}
                        </span>
                      </td>
                      <td className={styles.viewsCell}>{article.totalViews.toLocaleString()}</td>
                      <td className={styles.viewsCell}>{article.views.toLocaleString()}</td>
                      <td>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleEditClick(article.id)}
                        >
                          <Image src="/images/editicon.png" alt="Edit" width={16} height={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <button 
                className={styles.paginationBtn}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              <span className={styles.currentPage}>{currentPage}</span>
              <span className={styles.pageNumber}>{totalPages}</span>
              <button 
                className={styles.paginationBtn}
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              
              {/* Search status info */}
              {Object.keys(searchParams).some(key => searchParams[key as keyof SearchKontenParams]) && (
                <div style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                  Search results: {articles.length} items found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}