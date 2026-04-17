import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FaTachometerAlt, FaUsers, FaHandHoldingHeart, FaBullhorn,
  FaBriefcase, FaFileAlt, FaMoneyBillWave, FaSignOutAlt,
  FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaDownload, FaEye,
  FaRunning, FaCalendarAlt,
} from 'react-icons/fa';

const NAV_ITEMS = [
  { key: 'stats', label: 'الإحصائيات', icon: <FaTachometerAlt /> },
  { key: 'cases', label: 'الحالات', icon: <FaHandHoldingHeart /> },
  { key: 'campaigns', label: 'الحملات', icon: <FaBullhorn /> },
  { key: 'activities', label: 'الأنشطة', icon: <FaRunning /> },
  { key: 'jobs', label: 'الوظائف', icon: <FaBriefcase /> },
  { key: 'applications', label: 'المتقدمون', icon: <FaFileAlt /> },
  { key: 'donations', label: 'التبرعات', icon: <FaMoneyBillWave /> },
  { key: 'users', label: 'المستخدمون', icon: <FaUsers /> },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityRegsModal, setActivityRegsModal] = useState(null); // { activityId, title }
  const [activityRegs, setActivityRegs] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [caseForm, setCaseForm] = useState({ title: '', description: '', category: 'medical', targetAmount: '', location: '', urgent: false });
  const [jobForm, setJobForm] = useState({ title: '', description: '', location: '', type: 'fulltime', requirements: '', tasks: '', salary: '' });
  const [activityForm, setActivityForm] = useState({ title: '', description: '', category: 'volunteer', location: '', date: '', endDate: '', maxParticipants: '', status: 'upcoming' });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchData(tab);
  }, [user, tab]);

  const fetchData = async (currentTab) => {
    setLoading(true);
    try {
      if (currentTab === 'stats') { const { data } = await api.get('/admin/stats'); setStats(data.data); }
      else if (currentTab === 'cases') { const { data } = await api.get('/cases'); setCases(data.data || []); }
      else if (currentTab === 'campaigns') { const { data } = await api.get('/campaigns'); setCampaigns(data.data || []); }
      else if (currentTab === 'jobs') { const { data } = await api.get('/jobs'); setJobs(data.data || []); }
      else if (currentTab === 'applications') { const { data } = await api.get('/applications'); setApplications(data.data || []); }
      else if (currentTab === 'donations') { const { data } = await api.get('/donations'); setDonations(data.data || []); }
      else if (currentTab === 'users') { const { data } = await api.get('/admin/users'); setUsers(data.data || []); }
      else if (currentTab === 'activities') { const { data } = await api.get('/activities'); setActivities(data.data || []); }
    } finally { setLoading(false); }
  };

  // Case actions
  const handleAddCase = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/cases/${editItem._id}`, caseForm);
        toast.success('تم تعديل الحالة');
      } else {
        await api.post('/cases', caseForm);
        toast.success('تم إضافة الحالة');
      }
      setShowCaseForm(false); setEditItem(null);
      setCaseForm({ title: '', description: '', category: 'medical', targetAmount: '', location: '', urgent: false });
      fetchData('cases');
    } catch (err) { toast.error(err.message || 'حدث خطأ'); }
  };

  const handleDeleteCase = async (id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try { await api.delete(`/cases/${id}`); toast.success('تم الحذف'); fetchData('cases'); }
    catch (err) { toast.error(err.message); }
  };

  // Job actions
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.split('\n').filter(Boolean),
        tasks: jobForm.tasks.split('\n').filter(Boolean),
      };
      if (editItem) { await api.put(`/jobs/${editItem._id}`, jobData); toast.success('تم التعديل'); }
      else { await api.post('/jobs', jobData); toast.success('تم إضافة الوظيفة'); }
      setShowJobForm(false); setEditItem(null);
      setJobForm({ title: '', description: '', location: '', type: 'fulltime', requirements: '', tasks: '', salary: '' });
      fetchData('jobs');
    } catch (err) { toast.error(err.message || 'حدث خطأ'); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف الوظيفة؟')) return;
    try { await api.delete(`/jobs/${id}`); toast.success('تم الحذف'); fetchData('jobs'); }
    catch (err) { toast.error(err.message); }
  };

  // Activity actions
  const ACTIVITY_BLANK = { title: '', description: '', category: 'volunteer', location: '', date: '', endDate: '', maxParticipants: '', status: 'upcoming' };
  const ACT_CAT_LABELS = { educational: 'تعليمي', social: 'اجتماعي', health: 'صحي', sports: 'رياضي', cultural: 'ثقافي', volunteer: 'تطوعي', other: 'أخرى' };
  const ACT_STATUS_LABELS = { upcoming: 'قادم', ongoing: 'جارٍ', completed: 'منتهي', cancelled: 'ملغى' };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...activityForm, maxParticipants: Number(activityForm.maxParticipants) || 0 };
      if (editItem) { await api.put(`/activities/${editItem._id}`, payload); toast.success('تم تعديل النشاط'); }
      else { await api.post('/activities', payload); toast.success('تم إضافة النشاط'); }
      setShowActivityForm(false); setEditItem(null); setActivityForm(ACTIVITY_BLANK);
      fetchData('activities');
    } catch (err) { toast.error(err.response?.data?.message || err.message || 'حدث خطأ'); }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف النشاط؟')) return;
    try { await api.delete(`/activities/${id}`); toast.success('تم الحذف'); fetchData('activities'); }
    catch (err) { toast.error(err.message); }
  };

  const openActivityRegs = async (activity) => {
    try {
      const { data } = await api.get(`/activities/${activity._id}/registrations`);
      setActivityRegs(data.data || []);
      setActivityRegsModal({ activityId: activity._id, title: activity.title });
    } catch (err) { toast.error('تعذر تحميل المسجلين'); }
  };

  // Application status
  const handleAppStatus = async (id, status) => {
    try {
      await api.put(`/applications/${id}/status`, { status });
      toast.success(status === 'accepted' ? 'تم قبول المتقدم ✅' : 'تم رفض المتقدم');
      fetchData('applications');
    } catch (err) { toast.error(err.message); }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('تم الحذف'); fetchData('users'); }
    catch (err) { toast.error(err.message); }
  };

  const STATUS_MAP = { pending: { label: 'قيد المراجعة', cls: 'badge-gray' }, reviewing: { label: 'جاري المراجعة', cls: 'badge-blue' }, accepted: { label: 'مقبول', cls: 'badge-green' }, rejected: { label: 'مرفوض', cls: 'badge-red' } };
  const CAT_LABELS = { medical: 'علاج', education: 'تعليم', food: 'غذاء', orphans: 'أيتام', zakat: 'زكاة', construction: 'بناء', other: 'أخرى' };

  return (
    <>
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">🌿 بناء <span>Admin</span></div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} className={`admin-nav-item${tab === item.key ? ' active' : ''}`} onClick={() => setTab(item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>{user?.name}</div>
          <button className="admin-nav-item" onClick={() => { logout(); navigate('/'); }} style={{ padding: '0.6rem 0', color: '#fca5a5' }}>
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* ===== STATS ===== */}
        {tab === 'stats' && (
          <div className="fade-in">
            <div className="admin-header"><h1>📊 لوحة التحكم</h1></div>
            {!stats ? <div className="spinner" /> : (
              <>
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                  {[
                    { label: 'المستخدمون', value: stats.users, icon: '👥', bg: '#eff6ff', color: '#1d4ed8' },
                    { label: 'الحالات', value: stats.cases, icon: '🤲', bg: '#f0fdf4', color: 'var(--primary)' },
                    { label: 'إجمالي التبرعات', value: `${(stats.totalDonations || 0).toLocaleString('ar-EG')} جنيه`, icon: '💰', bg: '#fef3c7', color: '#d97706' },
                    { label: 'الحالات المكتملة', value: stats.completedCases, icon: '✅', bg: '#ecfdf5', color: '#059669' },
                    { label: 'الحملات', value: stats.campaigns, icon: '🌟', bg: '#f5f3ff', color: '#7c3aed' },
                    { label: 'عدد التبرعات', value: stats.donationCount, icon: '❤️', bg: '#fdf2f8', color: '#db2777' },
                    { label: 'الوظائف', value: stats.jobs, icon: '💼', bg: '#fff7ed', color: '#ea580c' },
                    { label: 'طلبات التوظيف', value: stats.applications, icon: '📋', bg: '#fef2f2', color: '#dc2626' },
                  ].map((s, i) => (
                    <div key={i} className="stat-card-admin">
                      <div className="stat-icon-admin" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                      <div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== CASES ===== */}
        {tab === 'cases' && (
          <div className="fade-in">
            <div className="admin-header">
              <h1>🤲 إدارة الحالات</h1>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowCaseForm(!showCaseForm); setEditItem(null); setCaseForm({ title: '', description: '', category: 'medical', targetAmount: '', location: '', urgent: false }); }}>
                <FaPlus /> إضافة حالة
              </button>
            </div>

            {showCaseForm && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>{editItem ? 'تعديل الحالة' : 'إضافة حالة جديدة'}</h3>
                <form onSubmit={handleAddCase}>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">العنوان *</label><input className="form-control" value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">الفئة</label>
                      <select className="form-control" value={caseForm.category} onChange={(e) => setCaseForm({ ...caseForm, category: e.target.value })}>
                        {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">المبلغ المطلوب *</label><input className="form-control" type="number" value={caseForm.targetAmount} onChange={(e) => setCaseForm({ ...caseForm, targetAmount: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">الموقع</label><input className="form-control" value={caseForm.location} onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">الوصف *</label><textarea className="form-control" rows={3} value={caseForm.description} onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })} required /></div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', fontWeight: 500 }}>
                    <input type="checkbox" checked={caseForm.urgent} onChange={(e) => setCaseForm({ ...caseForm, urgent: e.target.checked })} /> 🚨 حالة عاجلة
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" type="submit">{editItem ? 'حفظ التعديلات' : 'إضافة الحالة'}</button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowCaseForm(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>العنوان</th><th>الفئة</th><th>المطلوب</th><th>تم جمع</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {cases.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.title}</strong>{c.urgent && <span className="badge badge-red" style={{ marginInlineStart: '0.4rem', fontSize: '0.7rem' }}>عاجل</span>}</td>
                        <td><span className="badge badge-green">{CAT_LABELS[c.category]}</span></td>
                        <td>{c.targetAmount?.toLocaleString('ar-EG')} جنيه</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.collectedAmount?.toLocaleString('ar-EG')} جنيه</span></td>
                        <td><span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{c.status === 'active' ? 'نشطة' : 'مكتملة'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(c); setCaseForm({ title: c.title, description: c.description, category: c.category, targetAmount: c.targetAmount, location: c.location || '', urgent: c.urgent }); setShowCaseForm(true); }}>
                              <FaEdit />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCase(c._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== ACTIVITIES ===== */}
        {tab === 'activities' && (
          <div className="fade-in">
            <div className="admin-header">
              <h1>🎯 إدارة الأنشطة</h1>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowActivityForm(!showActivityForm); setEditItem(null); setActivityForm(ACTIVITY_BLANK); }}>
                <FaPlus /> إضافة نشاط
              </button>
            </div>

            {showActivityForm && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>{editItem ? 'تعديل النشاط' : 'إضافة نشاط جديد'}</h3>
                <form onSubmit={handleAddActivity}>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">العنوان *</label><input className="form-control" value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">الفئة</label>
                      <select className="form-control" value={activityForm.category} onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}>
                        {Object.entries(ACT_CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">تاريخ البدء *</label><input className="form-control" type="datetime-local" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">تاريخ الانتهاء</label><input className="form-control" type="datetime-local" value={activityForm.endDate} onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">المكان *</label><input className="form-control" value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">الحد الأقصى للمشاركين (0 = غير محدود)</label><input className="form-control" type="number" min="0" value={activityForm.maxParticipants} onChange={(e) => setActivityForm({ ...activityForm, maxParticipants: e.target.value })} placeholder="0" /></div>
                    <div className="form-group"><label className="form-label">الحالة</label>
                      <select className="form-control" value={activityForm.status} onChange={(e) => setActivityForm({ ...activityForm, status: e.target.value })}>
                        {Object.entries(ACT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">الوصف *</label><textarea className="form-control" rows={3} value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} required /></div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" type="submit">{editItem ? 'حفظ التعديلات' : 'إضافة النشاط'}</button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowActivityForm(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>العنوان</th><th>الفئة</th><th>التاريخ</th><th>المكان</th><th>المشاركون</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {activities.map((a) => (
                      <tr key={a._id}>
                        <td><strong>{a.title}</strong></td>
                        <td><span className="badge badge-green">{ACT_CAT_LABELS[a.category]}</span></td>
                        <td style={{ fontSize: '0.83rem' }}>{new Date(a.date).toLocaleDateString('ar-EG')}</td>
                        <td>{a.location}</td>
                        <td>
                          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{a.registeredCount}</span>
                          {a.maxParticipants > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> / {a.maxParticipants}</span>}
                        </td>
                        <td><span className={`badge ${a.status === 'upcoming' ? 'badge-blue' : a.status === 'ongoing' ? 'badge-green' : a.status === 'cancelled' ? 'badge-red' : 'badge-gray'}`}>{ACT_STATUS_LABELS[a.status]}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-ghost btn-sm" title="المسجلون" onClick={() => openActivityRegs(a)}><FaEye /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(a); setActivityForm({ title: a.title, description: a.description, category: a.category, location: a.location, date: a.date ? new Date(a.date).toISOString().slice(0,16) : '', endDate: a.endDate ? new Date(a.endDate).toISOString().slice(0,16) : '', maxParticipants: a.maxParticipants || '', status: a.status }); setShowActivityForm(true); }}><FaEdit /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(a._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== JOBS ===== */}
        {tab === 'jobs' && (
          <div className="fade-in">
            <div className="admin-header">
              <h1>💼 إدارة الوظائف</h1>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowJobForm(!showJobForm); setEditItem(null); setJobForm({ title: '', description: '', location: '', type: 'fulltime', requirements: '', tasks: '', salary: '' }); }}>
                <FaPlus /> إضافة وظيفة
              </button>
            </div>

            {showJobForm && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1.25rem' }}>{editItem ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}</h3>
                <form onSubmit={handleAddJob}>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">المسمى الوظيفي *</label><input className="form-control" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">نوع الوظيفة</label>
                      <select className="form-control" value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}>
                        <option value="fulltime">دوام كامل</option>
                        <option value="parttime">دوام جزئي</option>
                        <option value="volunteer">تطوع</option>
                        <option value="remote">عن بُعد</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">الموقع *</label><input className="form-control" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">الراتب</label><input className="form-control" value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="مثال: 3000 - 5000 جنيه" /></div>
                  </div>
                  <div className="form-group"><label className="form-label">الوصف *</label><textarea className="form-control" rows={3} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} required /></div>
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">المتطلبات (كل متطلب في سطر)</label><textarea className="form-control" rows={4} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} placeholder="بكالوريوس محاسبة&#10;خبرة 2 سنة&#10;إجادة Excel" /></div>
                    <div className="form-group"><label className="form-label">المهام (كل مهمة في سطر)</label><textarea className="form-control" rows={4} value={jobForm.tasks} onChange={(e) => setJobForm({ ...jobForm, tasks: e.target.value })} placeholder="إعداد التقارير&#10;متابعة الحسابات" /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-primary" type="submit">{editItem ? 'حفظ التعديلات' : 'إضافة الوظيفة'}</button>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowJobForm(false)}>إلغاء</button>
                  </div>
                </form>
              </div>
            )}

            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>المسمى الوظيفي</th><th>النوع</th><th>الموقع</th><th>المتقدمون</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j._id}>
                        <td><strong>{j.title}</strong></td>
                        <td><span className="badge badge-blue">{j.type}</span></td>
                        <td>{j.location}</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{j.applicantCount || 0}</span></td>
                        <td><span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-gray'}`}>{j.status === 'open' ? 'مفتوح' : 'مغلق'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setEditItem(j); setJobForm({ title: j.title, description: j.description, location: j.location, type: j.type, requirements: (j.requirements || []).join('\n'), tasks: (j.tasks || []).join('\n'), salary: j.salary || '' }); setShowJobForm(true); }}><FaEdit /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(j._id)}><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== APPLICATIONS ===== */}
        {tab === 'applications' && (
          <div className="fade-in">
            <div className="admin-header"><h1>📋 المتقدمون على الوظائف</h1></div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>المتقدم</th><th>البريد</th><th>الهاتف</th><th>الوظيفة</th><th>السيرة الذاتية</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a._id}>
                        <td><strong>{a.name}</strong></td>
                        <td style={{ fontSize: '0.83rem' }}>{a.email}</td>
                        <td>{a.phone}</td>
                        <td>{a.job?.title}</td>
                        <td>
                          {a.cvFile ? (
                            <a href={a.cvFile} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><FaDownload /> CV</a>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>لا يوجد</span>}
                        </td>
                        <td><span className={`badge ${STATUS_MAP[a.status]?.cls || 'badge-gray'}`}>{STATUS_MAP[a.status]?.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {a.status !== 'accepted' && <button className="btn btn-sm" style={{ background: '#ecfdf5', color: '#059669', borderRadius: 'var(--radius)' }} onClick={() => handleAppStatus(a._id, 'accepted')}><FaCheckCircle /> قبول</button>}
                            {a.status !== 'rejected' && <button className="btn btn-danger btn-sm" onClick={() => handleAppStatus(a._id, 'rejected')}><FaTimesCircle /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== CAMPAIGNS ===== */}
        {tab === 'campaigns' && (
          <div className="fade-in">
            <div className="admin-header"><h1>🌟 الحملات</h1></div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>العنوان</th><th>الهدف</th><th>تم جمع</th><th>المنظم</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c._id}>
                        <td><strong>{c.title}</strong></td>
                        <td>{c.goal?.toLocaleString('ar-EG')} جنيه</td>
                        <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.raised?.toLocaleString('ar-EG')} جنيه</span></td>
                        <td>{c.organizer?.name || '-'}</td>
                        <td><span className={`badge ${c.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{c.status === 'active' ? 'نشطة' : 'مكتملة'}</span></td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={async () => { if (window.confirm('حذف؟')) { await api.delete(`/campaigns/${c._id}`); fetchData('campaigns'); } }}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== DONATIONS ===== */}
        {tab === 'donations' && (
          <div className="fade-in">
            <div className="admin-header"><h1>💰 التبرعات</h1></div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>المتبرع</th><th>المبلغ</th><th>طريقة الدفع</th><th>الحالة / الحملة</th><th>النوع</th><th>التاريخ</th></tr></thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d._id}>
                        <td>{d.anonymous ? 'مجهول' : (d.user?.name || d.donorName)}</td>
                        <td><strong style={{ color: 'var(--primary)' }}>{d.amount?.toLocaleString('ar-EG')} جنيه</strong></td>
                        <td>{d.method === 'vodafone_cash' ? '📱 فودافون' : d.method === 'bank_card' ? '💳 كارت' : '⚡ InstaPay'}</td>
                        <td style={{ fontSize: '0.83rem' }}>{d.case?.title || d.campaign?.title || 'عام'}</td>
                        <td><span className="badge badge-gray">{d.recurring === 'none' ? 'مرة واحدة' : d.recurring}</span></td>
                        <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString('ar-EG')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== USERS ===== */}
        {tab === 'users' && (
          <div className="fade-in">
            <div className="admin-header"><h1>👥 المستخدمون</h1></div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>الاسم</th><th>البريد</th><th>الدور</th><th>النقاط</th><th>تاريخ الانضمام</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                              {u.name.charAt(0)}
                            </div>
                            <strong>{u.name}</strong>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.83rem' }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-green'}`}>
                            {u.role === 'admin' ? '👑 أدمن' : '👤 مستخدم'}
                          </span>
                        </td>
                        <td><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{u.points || 0}</span></td>
                        <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}><FaTrash /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>

    {/* ===== ACTIVITY REGISTRATIONS MODAL ===== */}
    {activityRegsModal && (
      <div
        onClick={(e) => { if (e.target === e.currentTarget) setActivityRegsModal(null); }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      >
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>👥 المسجلون في النشاط</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activityRegsModal.title} — {activityRegs.length} مشارك</p>
            </div>
            <button onClick={() => setActivityRegsModal(null)} style={{ background: 'none', fontSize: '1.3rem', color: 'var(--text-muted)', padding: '0.2rem' }}>✕</button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {activityRegs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>لا يوجد مسجلون بعد</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                <tbody>
                  {activityRegs.map((r, i) => (
                    <tr key={r._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{i + 1}</td>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.phone}</td>
                      <td style={{ fontSize: '0.83rem' }}>{r.email || '-'}</td>
                      <td><span className={`badge ${r.status === 'attended' ? 'badge-green' : r.status === 'cancelled' ? 'badge-red' : 'badge-blue'}`}>{r.status === 'attended' ? 'حضر' : r.status === 'cancelled' ? 'ملغى' : 'مسجّل'}</span></td>
                      <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
