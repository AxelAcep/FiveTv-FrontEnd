const BASE_URL = process.env.REACT_APP_API_BASE_URL
;

async function handleResponse(res: Response) {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const errorMessage = errorBody && errorBody.message ? errorBody.message : 'Terjadi kesalahan saat memproses permintaan.';
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorMessage}`);
  }
  return res.json();
}

export async function getAllArticle() {
  console.log("DEBUG: Fetching URL:", `${BASE_URL}/api/user/artikel`); 
  const res = await fetch(`${BASE_URL}/api/user/artikel`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function getAllKegiatan() {
  const res = await fetch(`${BASE_URL}/api/user/kegiatan`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function getTrending() {
  const res = await fetch(`${BASE_URL}/api/user/trending`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function getDetailKonten(kodeKonten: string) {
  const res = await fetch(`${BASE_URL}/api/user/${kodeKonten}`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function postAdminLogin(email: string, password: string) {
  const url = `${BASE_URL}/api/admin/login`; // Endpoint yang baru kita buat
  console.log("DEBUG: Mengirim login admin ke URL:", url);

  try {
    const res = await fetch(url, {
      method: 'POST', // Metode HTTP POST
      headers: {
        'Content-Type': 'application/json', // Memberi tahu server kita mengirim JSON
      },
      body: JSON.stringify({ // Mengubah objek JS menjadi string JSON
        email: email,
        password: password,
      }),
    });

    return handleResponse(res); // Memproses respons
  } catch (error) {
    console.error("Kesalahan saat permintaan login admin:", error);
    throw error; // Meneruskan error untuk ditangani di komponen
  }
}