import React, { useState } from 'react';
import { postAdminLogin } from '../../services/api'; // Path ke fungsi login
import { useNavigate } from 'react-router-dom'; // ← untuk redirect

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate(); // React Router v6

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await postAdminLogin(email, password);
      console.log('Login Berhasil:', data);

      // ✅ Simpan token ke localStorage
      localStorage.setItem('adminToken', data.token);

      // ✅ Redirect ke halaman dashboard admin
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error Login:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message?: string }).message || 'Gagal login.'
          : 'Gagal login.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login Admin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default AdminLoginPage;
