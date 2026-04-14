import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import { FaSearch } from 'react-icons/fa';

const TYPES = [
  { key: 'all', label: 'جميع الأنواع', icon: '🌐' },
  { key: 'fulltime', label: 'دوام كامل', icon: '💼' },
  { key: 'parttime', label: 'دوام جزئي', icon: '⏰' },
  { key: 'volunteer', label: 'تطوع', icon: '🤝' },
  { key: 'remote', label: 'عن بُعد', icon: '💻' },
];

export default function JobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchJobs(); }, [type]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'all') params.set('type', type);
      if (search) params.set('search', search);
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.data || []);
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>💼 {t('jobs.title')}</h1>
          <p>انضم لفريق جمعيتي وكن جزءاً من مسيرة الخير</p>
        </div>
      </div>

      <div className="container section-sm">
        <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input className="form-control" placeholder="ابحث عن وظيفة..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary"><FaSearch /></button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {TYPES.map((tp) => (
            <button
              key={tp.key}
              onClick={() => setType(tp.key)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 999,
                border: `2px solid ${type === tp.key ? 'var(--primary)' : 'var(--border)'}`,
                background: type === tp.key ? 'var(--primary)' : '#fff',
                color: type === tp.key ? '#fff' : 'var(--text-body)',
                fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}
            >
              {tp.icon} {tp.label}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : jobs.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔍</div><h3>لا توجد وظائف متاحة حالياً</h3></div>
        ) : (
          <div className="grid-3">{jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>
        )}
      </div>
    </div>
  );
}
