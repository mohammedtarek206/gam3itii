import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers,
  FaCheckCircle, FaTimes, FaRunning,
} from 'react-icons/fa';

const CATEGORIES = [
  { key: 'all', label: 'الجميع', icon: '🌐' },
  { key: 'educational', label: 'تعليمي', icon: '📚' },
  { key: 'social', label: 'اجتماعي', icon: '🤝' },
  { key: 'health', label: 'صحي', icon: '🏥' },
  { key: 'sports', label: 'رياضي', icon: '⚽' },
  { key: 'cultural', label: 'ثقافي', icon: '🎭' },
  { key: 'volunteer', label: 'تطوعي', icon: '💚' },
  { key: 'other', label: 'أخرى', icon: '✨' },
];

const STATUS_MAP = {
  upcoming:  { label: 'قادم', cls: 'badge-blue' },
  ongoing:   { label: 'جارٍ الآن', cls: 'badge-green' },
  completed: { label: 'منتهي', cls: 'badge-gray' },
  cancelled: { label: 'ملغى', cls: 'badge-red' },
};

function RegisterModal({ activity, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone) { toast.error('رقم الهاتف مطلوب'); return; }
    setLoading(true);
    try {
      await api.post(`/activities/${activity._id}/register`, form);
      toast.success('🎉 تم تسجيلك بنجاح!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem',
        width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-xl)',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>📋 تسجيل في النشاط</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activity.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', fontSize: '1.2rem', color: 'var(--text-muted)', padding: '0.2rem' }}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل *</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">رقم الهاتف *</label>
            <input className="form-control" type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">ملاحظات (اختياري)</label>
            <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="أي ملاحظات إضافية..." />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><FaCheckCircle /> تأكيد التسجيل</>}
            </button>
            <button className="btn btn-ghost" type="button" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActivityCard({ activity, myRegistrations, onRegister, onCancel }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRegistered = myRegistrations.some((r) => r.activity?._id === activity._id);
  const isFull = activity.maxParticipants > 0 && activity.registeredCount >= activity.maxParticipants;
  const canRegister = activity.status === 'upcoming' || activity.status === 'ongoing';
  const cat = CATEGORIES.find((c) => c.key === activity.category);
  const st = STATUS_MAP[activity.status] || STATUS_MAP.upcoming;

  const spotsLeft = activity.maxParticipants > 0
    ? activity.maxParticipants - activity.registeredCount
    : null;

  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
      overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Color bar based on category */}
      <div style={{ height: 5, background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
              {cat?.icon} {cat?.label}
            </span>
            <span className={`badge ${st.cls}`} style={{ fontSize: '0.75rem' }}>{st.label}</span>
          </div>
          {isRegistered && (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--secondary)', padding: '0.2rem 0.6rem', borderRadius: 999 }}>
              ✅ مسجّل
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.4 }}>{activity.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {activity.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
            <FaCalendarAlt style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{new Date(activity.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
            <FaMapMarkerAlt style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{activity.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-body)' }}>
            <FaUsers style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>
              {activity.registeredCount} مشارك
              {activity.maxParticipants > 0 && ` / ${activity.maxParticipants} (${spotsLeft > 0 ? `${spotsLeft} متبقية` : 'اكتمل'})`}
            </span>
          </div>
        </div>

        {/* Capacity bar */}
        {activity.maxParticipants > 0 && (
          <div style={{ background: '#f1f5f9', borderRadius: 999, height: 6, marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: isFull ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary), var(--accent))',
              width: `${Math.min(100, (activity.registeredCount / activity.maxParticipants) * 100)}%`,
              transition: 'width 0.5s ease',
            }} />
          </div>
        )}

        {canRegister && (
          isRegistered ? (
            <button
              onClick={() => onCancel(activity._id)}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              إلغاء التسجيل
            </button>
          ) : isFull ? (
            <button disabled className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
              اكتمل العدد
            </button>
          ) : (
            <button
              onClick={() => {
                if (!user) { navigate('/login'); return; }
                onRegister(activity);
              }}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FaRunning /> سجّل الآن
            </button>
          )
        )}

        {!canRegister && activity.status === 'completed' && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>انتهى هذا النشاط</div>
        )}
      </div>
    </div>
  );
}

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => { fetchActivities(); }, [category]);
  useEffect(() => { if (user) fetchMyRegistrations(); }, [user]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);
      const { data } = await api.get(`/activities?${params}`);
      setActivities(data.data || []);
    } finally { setLoading(false); }
  };

  const fetchMyRegistrations = async () => {
    try {
      const { data } = await api.get('/activities/my/registrations');
      setMyRegistrations(data.data || []);
    } catch {}
  };

  const handleCancel = async (activityId) => {
    if (!window.confirm('هل تريد إلغاء تسجيلك في هذا النشاط؟')) return;
    try {
      await api.delete(`/activities/${activityId}/register`);
      toast.success('تم إلغاء التسجيل');
      fetchMyRegistrations();
      fetchActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>🎯 الأنشطة والفعاليات</h1>
          <p>اكتشف أنشطة جمعيتي وسجّل في الفعاليات القادمة</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Search */}
        <form onSubmit={(e) => { e.preventDefault(); fetchActivities(); }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className="form-control"
            placeholder="ابحث عن نشاط..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary"><FaSearch /></button>
        </form>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              style={{
                padding: '0.5rem 1.1rem', borderRadius: 999,
                border: `2px solid ${category === cat.key ? 'var(--primary)' : 'var(--border)'}`,
                background: category === cat.key ? 'var(--primary)' : '#fff',
                color: category === cat.key ? '#fff' : 'var(--text-body)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* User banner if registered in some */}
        {user && myRegistrations.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            color: '#fff', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem',
            marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <FaCheckCircle style={{ fontSize: '1.4rem', flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>
              أنت مسجّل في {myRegistrations.filter(r => r.activity?.status !== 'completed').length} نشاط — شاهد <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'underline' }}>لوحتك الشخصية</Link>
            </span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="spinner" style={{ margin: '5rem auto' }} />
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>لا توجد أنشطة متاحة حالياً</h3>
            <p style={{ color: 'var(--text-muted)' }}>تابعنا لمعرفة أحدث الفعاليات</p>
          </div>
        ) : (
          <div className="grid-3">
            {activities.map((a) => (
              <ActivityCard
                key={a._id}
                activity={a}
                myRegistrations={myRegistrations}
                onRegister={setSelectedActivity}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {selectedActivity && (
        <RegisterModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onSuccess={() => { fetchMyRegistrations(); fetchActivities(); }}
        />
      )}
    </div>
  );
}
