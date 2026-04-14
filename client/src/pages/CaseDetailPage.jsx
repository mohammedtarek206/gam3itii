import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import DonateModal from '../components/DonateModal';
import { FaHeart, FaArrowLeft, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const CATEGORY_MAP = {
  education: { label: 'تعليم', icon: '📚' },
  medical: { label: 'علاج', icon: '🏥' },
  zakat: { label: 'زكاة', icon: '🌙' },
  construction: { label: 'بناء', icon: '🏠' },
  food: { label: 'غذاء', icon: '🍞' },
  orphans: { label: 'أيتام', icon: '👦' },
  other: { label: 'أخرى', icon: '💛' },
};

export default function CaseDetailPage() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donateOpen, setDonateOpen] = useState(false);

  useEffect(() => {
    api.get(`/cases/${id}`).then(({ data }) => setC(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
  if (!c) return <div style={{ textAlign: 'center', padding: '5rem' }}>الحالة غير موجودة</div>;

  const percent = Math.min(Math.round((c.collectedAmount / c.targetAmount) * 100), 100);
  const cat = CATEGORY_MAP[c.category] || CATEGORY_MAP.other;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>{cat.icon} {c.title}</h1>
          <p>تفاصيل الحالة والمستجدات</p>
        </div>
      </div>

      <div className="container section-sm">
        <Link to="/cases" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
          <FaArrowLeft /> العودة للحالات
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
          {/* Left */}
          <div>
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', background: 'var(--secondary)', minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.image ? (
                <img src={c.image} alt={c.title} style={{ width: '100%', height: 350, objectFit: 'cover' }} />
              ) : (
                <div style={{ fontSize: '5rem' }}>{cat.icon}</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">{cat.icon} {cat.label}</span>
              {c.urgent && <span className="badge badge-red">🚨 عاجل</span>}
              {c.status === 'completed' && <span className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>✅ مكتملة</span>}
              {c.location && <span className="badge badge-gray"><FaMapMarkerAlt /> {c.location}</span>}
            </div>

            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{c.title}</h2>
            <p style={{ color: 'var(--text-body)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '1.5rem' }}>{c.description}</p>

            {/* Donors */}
            {c.donors && c.donors.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaUsers style={{ color: 'var(--primary)' }} /> المتبرعون ({c.donors.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 200, overflowY: 'auto' }}>
                  {c.donors.slice(0, 10).map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                      <span>💚 {d.user?.name || 'متبرع كريم'}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{d.amount?.toLocaleString('ar-EG')} جنيه</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Sticky card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem' }}>📊 تفاصيل التبرع</h3>

              {/* Progress */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{percent}%</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', alignSelf: 'flex-end' }}>مكتمل</span>
                </div>
                <div className="progress-wrap" style={{ height: 14 }}>
                  <div className="progress-bar" style={{ width: `${percent}%` }} />
                </div>
              </div>

              {[
                { label: 'المبلغ المطلوب', value: c.targetAmount, color: 'var(--text-dark)' },
                { label: 'تم جمع', value: c.collectedAmount, color: 'var(--primary)' },
                { label: 'المتبقي', value: Math.max(0, c.targetAmount - c.collectedAmount), color: 'var(--danger)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.label}</span>
                  <span style={{ fontWeight: 800, color: item.color, fontSize: '1rem' }}>{item.value?.toLocaleString('ar-EG')} جنيه</span>
                </div>
              ))}

              <button
                className="btn btn-primary btn-block btn-lg"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setDonateOpen(true)}
                disabled={c.status === 'completed'}
              >
                <FaHeart /> تبرع لهذه الحالة
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                🔒 عملية تبرع آمنة ومضمونة
              </p>
            </div>
          </div>
        </div>
      </div>

      {donateOpen && <DonateModal caseId={c._id} caseTitle={c.title} onClose={() => setDonateOpen(false)} />}
    </div>
  );
}
