import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { submitApplication, getMyApplications } from '../utils/api';

const DEPARTMENTS = ['Accounts', 'Library', 'Sports Dept', 'Program Office'];

export default function StudentPortal() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [view, setView] = useState('form'); // 'form' or 'track'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student_name: '',
    prn: '',
    program: '',
    reason: '',
  });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'student') { router.push('/'); return; }
    setUser(parsed);
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 4 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchApplications, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      setApplications(res.data.applications || []);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!form.student_name || !form.prn || !form.program || !form.reason) {
      alert('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await submitApplication(form);
      setForm({ student_name: '', prn: '', program: '', reason: '' });
      await fetchApplications();
      setView('track');
    } catch {
      alert('Submission failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getApprovalForDept = (application, dept) => {
    return application.approvals?.find(a => a.department === dept);
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#10B981';
    if (status === 'rejected') return '#EF4444';
    return '#F59E0B';
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return '✓';
    if (status === 'rejected') return '✗';
    return '⏳';
  };

  const getProgressPercent = (application) => {
    if (!application.approvals) return 0;
    const approved = application.approvals.filter(a => a.status === 'approved').length;
    return Math.round((approved / DEPARTMENTS.length) * 100);
  };

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navAccent} />
          <div>
            <div style={styles.navUniversity}>MIT-WPU</div>
            <div style={styles.navTitle}>Student Portal</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user?.display_name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(view === 'form' ? styles.tabActive : {}) }}
            onClick={() => setView('form')}
          >
            📋 New Application
          </button>
          <button
            style={{ ...styles.tab, ...(view === 'track' ? styles.tabActive : {}) }}
            onClick={() => setView('track')}
          >
            📊 Track Status {applications.length > 0 && <span style={styles.badge}>{applications.length}</span>}
          </button>
        </div>

        {/* Form View */}
        {view === 'form' && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Apply for Transfer / Leaving Certificate</div>
            <div style={styles.cardSubtitle}>Fill in your details below to initiate the TC request</div>

            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  placeholder="As per university records"
                  value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>PRN Number</label>
                <input
                  style={styles.input}
                  placeholder="e.g. 1032210001"
                  value={form.prn}
                  onChange={e => setForm({ ...form, prn: e.target.value })}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Program</label>
                <input
                  style={styles.input}
                  placeholder="e.g. B.Tech Computer Engineering"
                  value={form.program}
                  onChange={e => setForm({ ...form, program: e.target.value })}
                />
              </div>
              <div style={{ ...styles.field, gridColumn: 'span 2' }}>
                <label style={styles.label}>Reason for TC</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'none' }}
                  placeholder="e.g. Pursuing higher education at another university"
                  value={form.reason}
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.feeNote}>
              ✅ Demo Mode — Fee payment bypassed (₹400 will be collected online in production)
            </div>

            <button
              style={{ ...styles.submitBtn, opacity: submitting ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit TC Request →'}
            </button>
          </div>
        )}

        {/* Track View */}
        {view === 'track' && (
          <div>
            {applications.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                <div style={{ color: '#94A3B8' }}>No applications yet. Submit one first.</div>
              </div>
            ) : (
              applications.map(app => {
                const progress = getProgressPercent(app);
                return (
                  <div key={app.id} style={styles.appCard}>
                    {/* App Header */}
                    <div style={styles.appHeader}>
                      <div>
                        <div style={styles.appName}>{app.student_name}</div>
                        <div style={styles.appMeta}>PRN: {app.prn} · {app.program}</div>
                        <div style={styles.appMeta}>Reason: {app.reason}</div>
                      </div>
                      <div style={{
                        ...styles.statusBadge,
                        background: app.status === 'all_cleared' ? '#10B98122' : '#F59E0B22',
                        color: app.status === 'all_cleared' ? '#10B981' : '#F59E0B',
                        border: `1px solid ${app.status === 'all_cleared' ? '#10B98144' : '#F59E0B44'}`,
                      }}>
                        {app.status === 'all_cleared' ? '🎉 All Cleared' : '⏳ In Review'}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.progressSection}>
                      <div style={styles.progressLabel}>
                        <span>Department Approvals</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>{progress}%</span>
                      </div>
                      <div style={styles.progressTrack}>
                        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Department Status */}
                    <div style={styles.deptGrid}>
                      {DEPARTMENTS.map(dept => {
                        const approval = getApprovalForDept(app, dept);
                        const status = approval?.status || 'pending';
                        return (
                          <div key={dept} style={{
                            ...styles.deptCard,
                            borderColor: `${getStatusColor(status)}44`,
                            background: `${getStatusColor(status)}11`,
                          }}>
                            <div style={{ fontSize: '20px', marginBottom: '6px' }}>
                              {getStatusIcon(status)}
                            </div>
                            <div style={styles.deptName}>{dept}</div>
                            <div style={{ ...styles.deptStatus, color: getStatusColor(status) }}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                            {approval?.remarks && (
                              <div style={styles.deptRemarks}>&ldquo;{approval.remarks}&rdquo;</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0F172A', fontFamily: "'Segoe UI', sans-serif", color: '#F1F5F9' },
  navbar: { background: '#1E293B', borderBottom: '1px solid #334155', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navAccent: { width: '4px', height: '36px', background: '#3B82F6', borderRadius: '2px' },
  navUniversity: { fontSize: '10px', color: '#64748B', letterSpacing: '3px', textTransform: 'uppercase' },
  navTitle: { fontSize: '16px', fontWeight: 700, color: '#F1F5F9' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  navUser: { fontSize: '13px', color: '#94A3B8' },
  logoutBtn: { background: 'transparent', border: '1px solid #334155', borderRadius: '6px', padding: '6px 14px', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' },
  content: { maxWidth: '860px', margin: '32px auto', padding: '0 24px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px', background: '#1E293B', padding: '4px', borderRadius: '10px', width: 'fit-content' },
  tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: 500 },
  tabActive: { background: '#3B82F6', color: '#fff' },
  badge: { background: '#3B82F6', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', marginLeft: '6px' },
  card: { background: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '28px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '4px' },
  cardSubtitle: { fontSize: '13px', color: '#64748B', marginBottom: '24px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#94A3B8', fontWeight: 500 },
  input: { background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#F1F5F9', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
  feeNote: { background: '#10B98111', border: '1px solid #10B98133', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#10B981', marginBottom: '20px' },
  submitBtn: { background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '8px', padding: '13px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%' },
  empty: { textAlign: 'center', padding: '60px', color: '#64748B' },
  appCard: { background: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '24px', marginBottom: '16px' },
  appHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  appName: { fontSize: '17px', fontWeight: 700, marginBottom: '4px' },
  appMeta: { fontSize: '12px', color: '#64748B', marginBottom: '2px' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' },
  progressSection: { marginBottom: '20px' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '8px' },
  progressTrack: { background: '#0F172A', borderRadius: '4px', height: '8px', overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg, #3B82F6, #10B981)', height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  deptGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  deptCard: { border: '1px solid', borderRadius: '10px', padding: '14px', textAlign: 'center' },
  deptName: { fontSize: '11px', color: '#94A3B8', marginBottom: '4px' },
  deptStatus: { fontSize: '12px', fontWeight: 600 },
  deptRemarks: { fontSize: '10px', color: '#64748B', marginTop: '4px', fontStyle: 'italic' },
};