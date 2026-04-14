import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaMedal, FaStar, FaHeart, FaBriefcase, FaRunning, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const BADGE_ICONS = { 'فاعل خير': '⭐', 'سفير الخير': '🏆' };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [tab, setTab] = useState('donations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      api.get('/donations/my'),
      api.get('/applications/my'),
      api.get('/activities/my/registrations'),
    ])
      .then(([d, a, act]) => {
        setDonations(d.data.data || []);
        setApplications(a.data.data || []);
        setMyActivities(act.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleCancelActivity = async (activityId) => {
    if (!window.confirm('هل تريد إلغاء التسجيل في هذا النشاط؟')) return;
    try {
      await api.delete(`/activities/${activityId}/register`);
      setMyActivities((prev) => prev.filter((r) => r.activity?._id !== activityId));
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const STATUS_COLORS = { pending: 'badge-gray', reviewing: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red' };
  const STATUS_LABELS = { pending: 'قيد المراجعة', reviewing: 'جاري المراجعة', accepted: 'مقبول ✅', rejected: 'مرفوض ❌' };
  const ACT_STATUS = { upcoming: { label: 'قادم', cls: 'badge-blue' }, ongoing: { label: 'جارٍ الآن', cls: 'badge-green' }, completed: { label: 'منتهي', cls: 'badge-gray' }, cancelled: { label: 'ملغى', cls: 'badge-red' } };

  if (!user) return null;

  const tabStyle = (key) => ({
    padding: '0.6rem 1.4rem',
    borderRadius: 'var(--radius)',
    border: `2px solid ${tab === key ? 'var(--primary)' : 'var(--border)'}`,
    background: tab === key ? 'var(--primary)' : '#fff',
    color: tab === key ? '#fff' : 'var(--text-body)',
    fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    transition: 'var(--transition)',
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>👤 لوحتي الشخصية</h1>
          <p>أهلاً {user.name}! هنا تجد كل تبرعاتك وطلباتك وأنشطتك</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '0.25rem' }}>{user.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.badges?.map((b) => (
                  <span key={b} className="badge badge-gold">{BADGE_ICONS[b] || '🏅'} {b}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{user.points || 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>نقاط</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{donations.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تبرع</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{applications.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>طلب وظيفي</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{myActivities.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>نشاط</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('donations')} style={tabStyle('donations')}>
            <FaHeart /> تبرعاتي ({donations.length})
          </button>
          <button onClick={() => setTab('applications')} style={tabStyle('applications')}>
            <FaBriefcase /> طلباتي ({applications.length})
          </button>
          <button onClick={() => setTab('activities')} style={tabStyle('activities')}>
            <FaRunning /> أنشطتي ({myActivities.length})
          </button>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            {/* DONATIONS TAB */}
            {tab === 'donations' && (
              donations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💚</div>
                  <h3>لم تتبرع بعد</h3>
                  <Link to="/cases" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>اكتشف الحالات</Link>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الحالة / الحملة</th>
                        <th>المبلغ</th>
                        <th>طريقة الدفع</th>
                        <th>النوع</th>
                        <th>التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((d) => (
                        <tr key={d._id}>
                          <td>{d.case?.title || d.campaign?.title || 'تبرع عام'}</td>
                          <td><strong style={{ color: 'var(--primary)' }}>{d.amount?.toLocaleString('ar-EG')} جنيه</strong></td>
                          <td>{d.method === 'vodafone_cash' ? '📱 فودافون' : d.method === 'bank_card' ? '💳 كارت' : '⚡ InstaPay'}</td>
                          <td><span className="badge badge-gray">{d.recurring === 'none' ? 'مرة واحدة' : d.recurring === 'monthly' ? 'شهري' : 'أسبوعي'}</span></td>
                          <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* APPLICATIONS TAB */}
            {tab === 'applications' && (
              applications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💼</div>
                  <h3>لم تتقدم على أي وظيفة بعد</h3>
                  <Link to="/jobs" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>استعرض الوظائف</Link>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>الوظيفة</th>
                        <th>الموقع</th>
                        <th>النوع</th>
                        <th>الحالة</th>
                        <th>تاريخ التقديم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((a) => (
                        <tr key={a._id}>
                          <td><strong>{a.job?.title}</strong></td>
                          <td>{a.job?.location}</td>
                          <td><span className="badge badge-blue">{a.job?.type}</span></td>
                          <td><span className={`badge ${STATUS_COLORS[a.status] || 'badge-gray'}`}>{STATUS_LABELS[a.status]}</span></td>
                          <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{new Date(a.createdAt).toLocaleDateString('ar-EG')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* ACTIVITIES TAB */}
            {tab === 'activities' && (
              myActivities.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎯</div>
                  <h3>لم تسجّل في أي نشاط بعد</h3>
                  <Link to="/activities" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                    <FaRunning /> استعرض الأنشطة
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {myActivities.map((reg) => {
                    const act = reg.activity;
                    if (!act) return null;
                    const st = ACT_STATUS[act.status] || ACT_STATUS.upcoming;
                    const canCancel = act.status === 'upcoming';
                    return (
                      <div key={reg._id} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🎯</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                            <strong style={{ fontSize: '1rem' }}>{act.title}</strong>
                            <span className={`badge ${st.cls}`} style={{ fontSize: '0.72rem' }}>{st.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <FaCalendarAlt /> {new Date(act.date).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <FaMapMarkerAlt /> {act.location}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            سُجِّل: {new Date(reg.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          {canCancel && (
                            <button
                              onClick={() => handleCancelActivity(act._id)}
                              style={{ fontSize: '0.8rem', color: 'var(--danger)', background: 'none', padding: '0.2rem 0.5rem', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', cursor: 'pointer' }}
                            >
                              إلغاء التسجيل
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
