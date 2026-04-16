import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getDepartmentApplications, actionApproval } from '../utils/api';

export default function DepartmentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'department') { router.push('/'); return; }
    setUser(parsed);
    fetchApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 4 seconds
  useEffect(() => {
    const interval = setInterval(fetchApprovals, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await getDepartmentApplications();
      setApprovals(res.data.approvals || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleAction = async (approvalId, status) => {
    setActioning(approvalId);
    try {
      await actionApproval(approvalId, status, remarks[approvalId] || '');
      await fetchApprovals();
      setRemarks(prev => ({ ...prev, [approvalId]: '' }));
    } catch {
      alert('Action failed. Try again.');
    } finally {
      setActioning(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#10B981';
    if (status === 'rejected') return '#EF4444';
    return '#F59E0B';
  };

  const pending = approvals.filter(a => a.status === 'pending');
  const actioned = approvals.filter(a => a.status !== 'pending');

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
            <div style={styles.navTitle}>{user?.department} — Department Dashboard</div>
          </div>
        </div>
        <div style={styles.navRight}>
          <div style={styles.statPill}>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>{pending.length}</span>
            <span style={{ color: '#64748B' }}> pending</span>
          </div>
          <div style={styles.statPill}>
            <span style={{ color: '#10B981', fontWeight: 700 }}>{actioned.length}</span>
            <span style={{ color: '#64748B' }}> actioned</span>
          </div>
          <span style={styles.navUser}>👤 {user?.display_name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Pending Section */}
        <div style={styles.sectionTitle}>
          <div style={{ ...styles.sectionDot, background: '#F59E0B' }} />
          Pending Requests ({pending.length})
        </div>

        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : pending.length === 0 ? (
          <div style={styles.emptyCard}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
            <div style={{ color: '#10B981', fontWeight: 600 }}>All caught up!</div>
            <div style={{ color: '#64748B', fontSize: '13px', marginTop: '4px' }}>No pending requests</div>
          </div>
        ) : (
          pending.map(approval => (
            <div key={approval.id} style={styles.card}>
              {/* Student Info */}
              <div style={styles.cardHeader}>
                <div style={styles.studentIcon}>🎓</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.studentName}>{approval.applications?.student_name}</div>
                  <div style={styles.studentMeta}>
                    PRN: <span style={{ color: '#94A3B8' }}>{approval.applications?.prn}</span>
                    &nbsp;·&nbsp;
                    Program: <span style={{ color: '#94A3B8' }}>{approval.applications?.program}</span>
                  </div>
                  <div style={styles.studentMeta}>
                    Reason: <span style={{ color: '#94A3B8' }}>{approval.applications?.reason}</span>
                  </div>
                </div>
                <div style={styles.pendingBadge}>⏳ Pending</div>
              </div>

              {/* Submitted date */}
              <div style={styles.submittedAt}>
                Submitted: {new Date(approval.applications?.created_at).toLocaleString('en-IN')}
              </div>

              {/* Remarks input */}
              <div style={styles.remarksSection}>
                <label style={styles.label}>Remarks (optional)</label>
                <input
                  style={styles.input}
                  placeholder="Add remarks if any..."
                  value={remarks[approval.id] || ''}
                  onChange={e => setRemarks(prev => ({ ...prev, [approval.id]: e.target.value }))}
                />
              </div>

              {/* Action Buttons */}
              <div style={styles.actions}>
                <button
                  style={{ ...styles.approveBtn, opacity: actioning === approval.id ? 0.7 : 1 }}
                  onClick={() => handleAction(approval.id, 'approved')}
                  disabled={actioning === approval.id}
                >
                  {actioning === approval.id ? 'Processing...' : '✓ Approve — No Dues'}
                </button>
                <button
                  style={{ ...styles.rejectBtn, opacity: actioning === approval.id ? 0.7 : 1 }}
                  onClick={() => handleAction(approval.id, 'rejected')}
                  disabled={actioning === approval.id}
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))
        )}

        {/* Actioned Section */}
        {actioned.length > 0 && (
          <>
            <div style={{ ...styles.sectionTitle, marginTop: '32px' }}>
              <div style={{ ...styles.sectionDot, background: '#64748B' }} />
              Previously Actioned ({actioned.length})
            </div>
            {actioned.map(approval => (
              <div key={approval.id} style={{ ...styles.card, opacity: 0.7 }}>
                <div style={styles.cardHeader}>
                  <div style={styles.studentIcon}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.studentName}>{approval.applications?.student_name}</div>
                    <div style={styles.studentMeta}>
                      PRN: <span style={{ color: '#94A3B8' }}>{approval.applications?.prn}</span>
                      &nbsp;·&nbsp;
                      {approval.applications?.program}
                    </div>
                  </div>
                  <div style={{
                    ...styles.pendingBadge,
                    background: `${getStatusColor(approval.status)}22`,
                    color: getStatusColor(approval.status),
                    border: `1px solid ${getStatusColor(approval.status)}44`,
                  }}>
                    {approval.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                  </div>
                </div>
                {approval.remarks && (
                  <div style={styles.actionedRemarks}>Remarks: &ldquo;{approval.remarks}&rdquo;</div>
                )}
                <div style={styles.submittedAt}>
                  Actioned: {new Date(approval.actioned_at).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0F172A', fontFamily: "'Segoe UI', sans-serif", color: '#F1F5F9' },
  navbar: { background: '#1E293B', borderBottom: '1px solid #334155', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  navAccent: { width: '4px', height: '36px', background: '#10B981', borderRadius: '2px' },
  navUniversity: { fontSize: '10px', color: '#64748B', letterSpacing: '3px', textTransform: 'uppercase' },
  navTitle: { fontSize: '16px', fontWeight: 700, color: '#F1F5F9' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  statPill: { background: '#0F172A', border: '1px solid #334155', borderRadius: '20px', padding: '4px 14px', fontSize: '13px' },
  navUser: { fontSize: '13px', color: '#94A3B8' },
  logoutBtn: { background: 'transparent', border: '1px solid #334155', borderRadius: '6px', padding: '6px 14px', color: '#94A3B8', cursor: 'pointer', fontSize: '12px' },
  content: { maxWidth: '800px', margin: '32px auto', padding: '0 24px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' },
  sectionDot: { width: '8px', height: '8px', borderRadius: '50%' },
  empty: { textAlign: 'center', padding: '40px', color: '#64748B' },
  emptyCard: { background: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '40px', textAlign: 'center' },
  card: { background: '#1E293B', border: '1px solid #334155', borderRadius: '14px', padding: '24px', marginBottom: '16px' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' },
  studentIcon: { fontSize: '28px', marginTop: '2px' },
  studentName: { fontSize: '17px', fontWeight: 700, marginBottom: '4px' },
  studentMeta: { fontSize: '12px', color: '#64748B', marginBottom: '2px' },
  pendingBadge: { background: '#F59E0B22', color: '#F59E0B', border: '1px solid #F59E0B44', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' },
  submittedAt: { fontSize: '11px', color: '#475569', marginBottom: '16px' },
  remarksSection: { marginBottom: '16px' },
  label: { fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' },
  input: { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#F1F5F9', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  actions: { display: 'flex', gap: '12px' },
  approveBtn: { flex: 1, background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  rejectBtn: { background: '#EF444422', color: '#EF4444', border: '1px solid #EF444444', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  actionedRemarks: { fontSize: '12px', color: '#64748B', fontStyle: 'italic', marginBottom: '8px' },
};