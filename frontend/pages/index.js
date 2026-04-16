import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login(username, password);
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'student') router.push('/student');
      else router.push('/department');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.accent} />
          <div>
            <div style={styles.university}>MIT-WPU</div>
            <div style={styles.title}>TC Management System</div>
          </div>
        </div>
        <div style={styles.subtitle}>Transfer & Leaving Certificate Portal</div>

        {/* Form */}
        <div style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        {/* Demo credentials */}
        <div style={styles.demoBox}>
          <div style={styles.demoTitle}>Demo Credentials</div>
          <div style={styles.demoGrid}>
            {[
              { role: 'Student', user: 'student', pass: 'student123' },
              { role: 'Accounts', user: 'accounts', pass: 'dept123' },
              { role: 'Library', user: 'library', pass: 'dept123' },
              { role: 'Sports', user: 'sports', pass: 'dept123' },
              { role: 'Program Office', user: 'programoff', pass: 'dept123' },
            ].map(c => (
              <div
                key={c.user}
                style={styles.demoCard}
                onClick={() => { setUsername(c.user); setPassword(c.pass); }}
              >
                <div style={styles.demoRole}>{c.role}</div>
                <div style={styles.demoUser}>{c.user}</div>
              </div>
            ))}
          </div>
          <div style={styles.demoHint}>Click any card to autofill</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0F172A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '24px',
  },
  card: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  accent: {
    width: '4px',
    height: '44px',
    background: '#3B82F6',
    borderRadius: '2px',
  },
  university: {
    fontSize: '11px',
    color: '#94A3B8',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#F1F5F9',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    marginBottom: '32px',
    marginLeft: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '28px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#94A3B8',
    fontWeight: 500,
  },
  input: {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#F1F5F9',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
  },
  error: {
    background: '#EF444422',
    border: '1px solid #EF444444',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#EF4444',
    fontSize: '13px',
  },
  demoBox: {
    background: '#0F172A',
    border: '1px solid #334155',
    borderRadius: '10px',
    padding: '16px',
  },
  demoTitle: {
    fontSize: '11px',
    color: '#64748B',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '10px',
  },
  demoCard: {
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
  },
  demoRole: {
    fontSize: '10px',
    color: '#64748B',
    marginBottom: '2px',
  },
  demoUser: {
    fontSize: '12px',
    color: '#3B82F6',
    fontWeight: 600,
  },
  demoHint: {
    fontSize: '10px',
    color: '#475569',
    textAlign: 'center',
  },
};
