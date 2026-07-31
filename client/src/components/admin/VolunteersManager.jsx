import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSearch, FaTimes, FaCheckCircle, FaExclamationTriangle, FaEye, FaEnvelope, FaTrash, FaHandsHelping, FaFileAlt, FaClock
} from 'react-icons/fa';
import api from '../../api/axios';

const STATUS_MAP = {
    pending: { label: 'قيد المراجعة', color: 'badge-orange', icon: <FaClock /> },
    reviewing: { label: 'جاري المراجعة', color: 'badge-blue', icon: <FaEye /> },
    accepted: { label: 'مقبول', color: 'badge-green', icon: <FaCheckCircle /> },
    rejected: { label: 'مرفوض', color: 'badge-red', icon: <FaExclamationTriangle /> },
};

export default function VolunteersManager() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStr, setFilterStr] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/volunteers');
            setVolunteers(data.data || []);
        } catch (err) {
            toast.error('تعذر تحميل طلبات التطوع');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, close = false) => {
        setSubmitting(true);
        try {
            const { data } = await api.put(`/volunteers/${id}/status`, { status });
            setVolunteers(prev => prev.map(v => v._id === id ? data.data : v));
            setSelectedApp(data.data);
            toast.success('تم تحديث حالة الطلب بنجاح');
            if (close) setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر التحديث');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`هل أنت متأكد من حذف طلب التطوع للمرشح "${name}"؟`)) return;
        try {
            await api.delete(`/volunteers/${id}`);
            setVolunteers(prev => prev.filter(v => v._id !== id));
            toast.success('تم حذف الطلب بنجاح');
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'تعذر الحذف');
        }
    };

    const filtered = volunteers.filter(v => {
        const matchSearch = (v.fullName || '').toLowerCase().includes(search.toLowerCase()) || (v.email || '').toLowerCase().includes(search.toLowerCase());
        if (filterStr === 'all') return matchSearch;
        return matchSearch && v.status === filterStr;
    });

    return (
        <div className="component-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="sh-header">
                <div>
                    <h2><FaHandsHelping style={{ color: '#10b981', marginRight: '0.4rem', verticalAlign: 'middle' }} /> طلبات التطوع</h2>
                    <p>إدارة طلبات التطوع الواردة من المشاريع المختلفة</p>
                </div>
            </div>

            <div className="sh-stats-grid">
                <div className="sh-stat-card">
                    <span>إجمالي الطلبات</span>
                    <strong style={{ color: 'var(--text-dark)' }}>{loading ? '-' : volunteers.length}</strong>
                </div>
                <div className="sh-stat-card" style={{ background: '#fffbeb' }}>
                    <span style={{ color: '#d97706' }}>قيد المراجعة</span>
                    <strong style={{ color: '#d97706' }}>{loading ? '-' : volunteers.filter(v => v.status === 'pending').length}</strong>
                </div>
                <div className="sh-stat-card" style={{ background: '#f0fdf4' }}>
                    <span style={{ color: '#16a34a' }}>الطلبات المقبولة</span>
                    <strong style={{ color: '#16a34a' }}>{loading ? '-' : volunteers.filter(v => v.status === 'accepted').length}</strong>
                </div>
            </div>

            <div className="sh-table-container">
                {/* Toolbar */}
                <div className="sh-toolbar" style={{ justifyContent: 'space-between' }}>
                    <div className="sh-search">
                        <FaSearch className="sh-search-icon" />
                        <input type="text" className="form-control" placeholder="بحث باسم المتطوع أو البريد..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="form-control" style={{ width: 'auto' }} value={filterStr} onChange={e => setFilterStr(e.target.value)}>
                        <option value="all">كل الحالات</option>
                        <option value="pending">قيد المراجعة</option>
                        <option value="reviewing">جاري المراجعة</option>
                        <option value="accepted">مقبول</option>
                        <option value="rejected">مرفوض</option>
                    </select>
                </div>

                {/* Table */}
                <div className="table-responsive" style={{ flex: 1, margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>المتطوع</th>
                                <th>المشروع</th>
                                <th>المحافظة</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'center' }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}><td colSpan="6" style={{ padding: '1.5rem' }}><div className="sh-skeleton"></div></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <FaFileAlt size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
                                        <strong style={{ display: 'block', fontSize: '1.2rem' }}>لا توجد طلبات تطوع</strong>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((v) => (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={v._id}>
                                        <td>
                                            <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{v.fullName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} dir="ltr" className="text-right">{v.email}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} dir="ltr" className="text-right">{v.phone}</div>
                                        </td>
                                        <td style={{ maxWidth: '200px' }}>
                                            <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                                                {v.project?.title?.ar || v.project?.title || 'عام'}
                                            </span>
                                        </td>
                                        <td>{v.governorate} - {v.city}</td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(v.createdAt).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <span className={`badge ${STATUS_MAP[v.status]?.color || 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                {STATUS_MAP[v.status]?.icon} {STATUS_MAP[v.status]?.label || v.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button onClick={() => { setSelectedApp(v); setShowModal(true); }} className="btn-icon text-primary" title="عرض التفاصيل">
                                                    <FaEye />
                                                </button>
                                                <a href={`mailto:${v.email}`} className="btn-icon" style={{ color: '#0ea5e9' }} title="مراسلة عبر البريد">
                                                    <FaEnvelope />
                                                </a>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && selectedApp && (
                    <div className="sh-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="sh-modal-content" style={{ maxWidth: '750px' }}>
                            <div className="sh-modal-header">
                                <h3>تفاصيل طلب التطوع</h3>
                                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>

                            <div className="sh-modal-body" style={{ background: '#f8fafc' }}>
                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', color: 'var(--text-dark)' }}>{selectedApp.fullName}</h4>
                                        <span className={`badge ${STATUS_MAP[selectedApp.status]?.color || 'badge-gray'}`} style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                            {STATUS_MAP[selectedApp.status]?.icon} {STATUS_MAP[selectedApp.status]?.label}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>تاريخ التقديم</div>
                                        <strong>{new Date(selectedApp.createdAt).toLocaleString('ar-EG')}</strong>
                                    </div>
                                </div>

                                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                        <h5 style={{ color: 'var(--primary)', margin: '0 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>بيانات الاتصال</h5>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>البريد:</strong> <span dir="ltr">{selectedApp.email}</span></p>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>الهاتف:</strong> <span dir="ltr">{selectedApp.phone}</span></p>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>الموقع:</strong> {selectedApp.governorate} - {selectedApp.city}</p>
                                        {selectedApp.nationalId && <p style={{ margin: '0' }}><strong>الرقم القومي:</strong> <span dir="ltr">{selectedApp.nationalId}</span></p>}
                                    </div>

                                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                        <h5 style={{ color: 'var(--primary)', margin: '0 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>المؤهلات والمهارات</h5>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>العمر:</strong> {selectedApp.age} سنة</p>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>المؤهل الدراسي:</strong> {selectedApp.education}</p>
                                        <p style={{ margin: '0 0 0.7rem' }}><strong>المهنة:</strong> {selectedApp.profession || '-'}</p>
                                        <p style={{ margin: '0' }}><strong>المهارات:</strong> {selectedApp.skills || '-'}</p>
                                    </div>
                                </div>

                                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                                    <h5 style={{ color: 'var(--primary)', margin: '0 0 0.75rem' }}>تفاصيل التطوع</h5>
                                    {selectedApp.project && (
                                        <p style={{ margin: '0 0 0.75rem', background: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                                            <strong>المشروع المطلوب:</strong> {selectedApp.project.title?.ar || selectedApp.project.title}
                                        </p>
                                    )}
                                    <p style={{ margin: '0 0 0.75rem' }}><strong>سبب الرغبة في التطوع:</strong></p>
                                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                        {selectedApp.motivation}
                                    </div>

                                    <p style={{ margin: '1rem 0 0.5rem' }}><strong>أيام التفرغ المحددة:</strong></p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {selectedApp.availableDays?.length > 0 ? selectedApp.availableDays.map(d => (
                                            <span key={d} className="badge badge-gray">{d}</span>
                                        )) : <span style={{ color: 'var(--text-muted)' }}>لم يحدد أيام للتفرغ</span>}
                                    </div>

                                    {selectedApp.cvFile && (
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <a href={selectedApp.cvFile} target="_blank" rel="noreferrer" className="btn btn-outline">
                                                عرض السيرة الذاتية (CV)
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="sh-modal-footer" style={{ justifyContent: 'space-between' }}>
                                <button onClick={() => handleDelete(selectedApp._id, selectedApp.fullName)} className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                    <FaTrash style={{ marginRight: '0.4rem' }} /> حذف الطلب
                                </button>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button onClick={() => setShowModal(false)} className="btn btn-ghost" disabled={submitting}>إغلاق</button>
                                    {selectedApp.status !== 'accepted' && (
                                        <button onClick={() => handleUpdateStatus(selectedApp._id, 'accepted')} disabled={submitting} className="btn" style={{ background: '#16a34a', color: '#fff' }}>
                                            <FaCheckCircle style={{ marginRight: '0.4rem' }} /> قبول كمتطوع
                                        </button>
                                    )}
                                    {selectedApp.status !== 'rejected' && (
                                        <button onClick={() => handleUpdateStatus(selectedApp._id, 'rejected')} disabled={submitting} className="btn" style={{ background: '#dc2626', color: '#fff' }}>
                                            <FaTimes style={{ marginRight: '0.4rem' }} /> رفض الطلب
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        .text-right { text-align: right; }
        .component-fade-in { animation: compFadeIn 0.4s ease forwards; }
        @keyframes compFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .sh-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .sh-header h2 { font-size: 1.8rem; margin-bottom: 0.2rem; }
        .sh-header p { color: var(--text-muted); font-size: 0.95rem; margin: 0; }
        
        .sh-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .sh-stat-card { background: var(--card-bg); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: center; }
        .sh-stat-card span { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--text-muted); }
        .sh-stat-card strong { font-size: 2rem; font-weight: 800; line-height: 1; }
        
        .sh-table-container { background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .sh-toolbar { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; gap: 1rem; flex-wrap: wrap; background: rgba(250,250,250,0.5); }
        .sh-search { position: relative; flex: 1; min-width: 250px; max-width: 400px; }
        .sh-search-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .sh-search input { padding-right: 2.5rem; width: 100%; border-radius: var(--radius); }
        
        .sh-skeleton { height: 2.5rem; background: #f3f4f6; border-radius: var(--radius); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .sh-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .sh-modal-content { background: var(--card-bg); width: 100%; max-width: 900px; max-height: 90vh; border-radius: var(--radius-lg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; }
        .sh-modal-header { padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fff; }
        .sh-modal-header h3 { margin: 0; font-size: 1.2rem; }
        .sh-modal-body { padding: 1.75rem; flex: 1; overflow-y: auto; }
        .sh-modal-footer { padding: 1rem 1.75rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem; background: #fff; }
      `}} />
        </div>
    );
}
