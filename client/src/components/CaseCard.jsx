import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaHeart } from 'react-icons/fa';
import DonateModal from './DonateModal';

const CATEGORY_MAP = {
  education: { label: 'تعليم', icon: '📚', color: '#1d4ed8' },
  medical: { label: 'علاج', icon: '🏥', color: '#dc2626' },
  zakat: { label: 'زكاة', icon: '🌙', color: '#7c3aed' },
  construction: { label: 'بناء', icon: '🏠', color: '#d97706' },
  food: { label: 'غذاء', icon: '🍞', color: '#16a34a' },
  orphans: { label: 'أيتام', icon: '👦', color: '#0891b2' },
  other: { label: 'أخرى', icon: '💛', color: '#6b7280' },
};

export default function CaseCard({ c }) {
  const { t } = useTranslation();
  const [donateOpen, setDonateOpen] = useState(false);
  const percent = Math.min(Math.round((c.collectedAmount / c.targetAmount) * 100), 100);
  const cat = CATEGORY_MAP[c.category] || CATEGORY_MAP.other;

  return (
    <>
      <div className="card case-card">
        <div className="case-card-img">
          {c.image ? (
            <img src={c.image} alt={c.title} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', background: 'var(--secondary)' }}>
              {cat.icon}
            </div>
          )}
          {c.urgent && <span className="case-card-urgent">🚨 عاجل</span>}
          {c.status === 'completed' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(27,122,62,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
              ✅ مكتملة
            </div>
          )}
        </div>
        <div className="case-card-body">
          <div className="case-category" style={{ color: cat.color }}>{cat.icon} {cat.label}</div>
          <h3>{c.title}</h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.description}
          </p>

          <div className="case-progress">
            <div className="case-progress-info">
              <span className="percent">{percent}%</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>تم جمع {c.collectedAmount?.toLocaleString('ar-EG')} جنيه</span>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <div className="case-amounts">
              <span>المطلوب: <strong style={{ color: 'var(--text-dark)' }}>{c.targetAmount?.toLocaleString('ar-EG')}</strong></span>
              <span>المتبقي: <strong style={{ color: 'var(--danger)' }}>{Math.max(0, c.targetAmount - c.collectedAmount)?.toLocaleString('ar-EG')}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => setDonateOpen(true)}
              disabled={c.status === 'completed'}
            >
              <FaHeart /> تبرع
            </button>
            <Link to={`/cases/${c._id}`} className="btn btn-outline btn-sm">التفاصيل</Link>
          </div>
        </div>
      </div>

      {donateOpen && (
        <DonateModal caseId={c._id} caseTitle={c.title} onClose={() => setDonateOpen(false)} />
      )}
    </>
  );
}
