import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { FaShareAlt, FaPlus, FaTimes } from 'react-icons/fa';

export default function CampaignsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', goal: '' });

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data.data || []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', form);
      toast.success(i18n.language === 'en' ? 'Campaign created successfully!' : 'تم إنشاء الحملة بنجاح!');
      setShowForm(false);
      setForm({ title: '', description: '', goal: '' });
      fetchCampaigns();
    } catch (err) { toast.error(err.message || 'Error occurred'); }
  };

  const handleShare = async (c) => {
    await api.post(`/campaigns/${c._id}/share`);
    const url = `${window.location.origin}/campaigns/${c._id}`;
    if (navigator.share) {
      navigator.share({ title: c.title, text: c.description, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success(i18n.language === 'en' ? 'Campaign link copied!' : 'تم نسخ رابط الحملة!');
    }
  };

  return (
    <div className="fade-in">
      <SEO 
        title={i18n.language === 'en' ? 'Charity Campaigns' : 'الحملات الخيرية'} 
        description={t('home.hero_sub')}
        canonicalUrl="https://benaa-for-all.org/campaigns" 
      />
      <div className="page-header">
        <div className="container">
          <h1>🌟 {i18n.language === 'en' ? 'Charity Campaigns' : 'الحملات الخيرية'}</h1>
          <p>{i18n.language === 'en' ? 'Join our noble campaigns or start your own to gather donations for good causes' : 'شارك في حملات الخير أو أنشئ حملتك الخاصة'}</p>
        </div>
      </div>

      <div className="container section-sm">
        {user && (
          <div style={{ marginBottom: '2rem' }}>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? (
                <><FaTimes /> {i18n.language === 'en' ? 'Cancel' : 'إلغاء'}</>
              ) : (
                <><FaPlus /> {i18n.language === 'en' ? 'Create New Campaign' : 'إنشاء حملة جديدة'}</>
              )}
            </button>
          </div>
        )}

        {showForm && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              📋 {i18n.language === 'en' ? 'Create New Campaign' : 'إنشاء حملة جديدة'}
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">{i18n.language === 'en' ? 'Campaign Title *' : 'عنوان الحملة *'}</label>
                <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{i18n.language === 'en' ? 'Campaign Description *' : 'وصف الحملة *'}</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">{i18n.language === 'en' ? 'Financial Goal *' : 'الهدف المالي (جنيه) *'}</label>
                <input className="form-control" type="number" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} required />
              </div>
              <button className="btn btn-primary" type="submit">
                🚀 {i18n.language === 'en' ? 'Launch Campaign' : 'إطلاق الحملة'}
              </button>
            </form>
          </div>
        )}

        {loading ? <div className="spinner" /> : (
          <div className="grid-3">
            {campaigns.map((c) => {
              const percent = Math.min(Math.round((c.raised / c.goal) * 100), 100);
              return (
                <div key={c._id} className="card">
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>🌙</span>
                      <span className="badge badge-green">
                        {c.status === 'active' ? (i18n.language === 'en' ? 'Active' : 'نشطة') : (i18n.language === 'en' ? 'Completed' : 'مكتملة')}
                      </span>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>{c.title}</h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>{c.description}</p>

                    <div className="case-progress">
                      <div className="case-progress-info">
                        <span className="percent">{percent}%</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {i18n.language === 'en' ? `${c.raised?.toLocaleString('en-US')} of ${c.goal?.toLocaleString('en-US')} EGP` : `${c.raised?.toLocaleString('ar-EG')} من ${c.goal?.toLocaleString('ar-EG')} جنيه`}
                        </span>
                      </div>
                      <div className="progress-wrap"><div className="progress-bar" style={{ width: `${percent}%` }} /></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <Link to={`/campaigns/${c._id}`} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                        {i18n.language === 'en' ? 'View' : 'عرض'}
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleShare(c)}>
                        <FaShareAlt /> {i18n.language === 'en' ? 'Share' : 'مشاركة'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
