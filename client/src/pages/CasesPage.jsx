import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import CaseCard from '../components/CaseCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

const CATEGORIES = [
  { key: 'all', label: 'الكل', icon: '🌟' },
  { key: 'medical', label: 'علاج', icon: '🏥' },
  { key: 'education', label: 'تعليم', icon: '📚' },
  { key: 'food', label: 'غذاء', icon: '🍞' },
  { key: 'orphans', label: 'أيتام', icon: '👦' },
  { key: 'zakat', label: 'زكاة', icon: '🌙' },
  { key: 'construction', label: 'بناء', icon: '🏠' },
  { key: 'other', label: 'أخرى', icon: '💛' },
];

const SORTS = [
  { key: '', label: 'الأحدث' },
  { key: 'most_needed', label: 'الأكثر احتياجاً' },
  { key: 'amount', label: 'الأعلى هدفاً' },
];

export default function CasesPage() {
  const { t } = useTranslation();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [category, sort, urgent]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (sort) params.set('sort', sort);
      if (urgent) params.set('urgent', 'true');
      if (search) params.set('search', search);
      const { data } = await api.get(`/cases?${params}`);
      setCases(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1>🤲 الحالات المحتاجة</h1>
          <p>اختر الحالة التي تريد مساعدتها وأحدث فارقاً حقيقياً</p>
        </div>
      </div>

      <div className="container section-sm">
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            className="form-control"
            placeholder="ابحث عن حالة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary"><FaSearch /></button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 999,
                  border: `2px solid ${category === cat.key ? 'var(--primary)' : 'var(--border)'}`,
                  background: category === cat.key ? 'var(--primary)' : '#fff',
                  color: category === cat.key ? '#fff' : 'var(--text-body)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select className="form-control" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>

          {/* Urgent filter */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', flexShrink: 0 }}>
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
            🚨 العاجلة فقط
          </label>
        </div>

        {/* Results count */}
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          عدد الحالات: <strong style={{ color: 'var(--primary)' }}>{cases.length}</strong>
        </p>

        {/* Grid */}
        {loading ? (
          <div className="spinner" />
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>لا توجد حالات تطابق بحثك</h3>
          </div>
        ) : (
          <div className="grid-3">
            {cases.map((c) => <CaseCard key={c._id} c={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
