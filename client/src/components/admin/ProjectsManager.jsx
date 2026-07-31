import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaFileAlt, FaCheckCircle, FaTimesCircle,
    FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTimes, FaImage, FaLink
} from 'react-icons/fa';
import api from '../../api/axios';

const STATUS_MAP = {
    active: { label: 'نشط', class: 'badge-green' },
    completed: { label: 'مكتمل', class: 'badge-blue' },
    planning: { label: 'قيد التخطيط', class: 'badge-orange' },
    suspended: { label: 'موقوف', class: 'badge-red' }
};

export default function ProjectsManager() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [formData, setFormData] = useState({
        titleAr: '', titleEn: '', descAr: '', descEn: '', type: 'current', status: 'active', isHidden: false, order: 0, mainImage: '', images: '', pdfLinks: '', videoLink: ''
    });

    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/projects?includeHidden=true');
            setProjects(data.data || []);
        } catch (err) {
            toast.error('تعذر تحميل المشاريع');
        } finally {
            setLoading(false);
        }
    };

    const handleGDrivePreview = (url) => {
        if (!url) return '';
        try {
            const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            let fileId = fileMatch ? fileMatch[1] : idMatch ? idMatch[1] : null;

            if (!fileId && url.includes('lh3.googleusercontent.com/d/')) {
                fileId = url.split('/d/')[1];
            }

            if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            return url;
        } catch {
            return url;
        }
    };

    const handleImageChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, mainImage: val });
        setPreviewImage(handleGDrivePreview(val));

        if (val.includes('drive.google.com') && !val.includes('usp=sharing')) {
            toast.error('تأكد من أن رابط Google Drive تم تعيينه إلى "Anyone with the link"', { duration: 5000 });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.titleAr || !formData.descAr) {
            toast.error('يرجى تعبئة الحقول المطلوبة');
            return;
        }
        setSubmitting(true);
        try {
            if (editItem) {
                const { data } = await api.put(`/projects/${editItem._id}`, formData);
                setProjects(prev => prev.map(p => p._id === data.data._id ? data.data : p));
                toast.success('تم التعديل بنجاح ✅');
            } else {
                const { data } = await api.post('/projects', formData);
                setProjects(prev => [data.data, ...prev]);
                toast.success('تم إضافة المشروع بنجاح ✅');
            }
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`هل أنت متأكد من حذف مشروع "${title}" نهائياً؟`)) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(prev => prev.filter(p => p._id !== id));
            toast.success('تم الحذف بنجاح');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleHide = async (project) => {
        try {
            const { data } = await api.put(`/projects/${project._id}`, { ...project, images: project.images?.join('\n'), pdfLinks: project.pdfLinks?.join('\n'), isHidden: !project.isHidden });
            setProjects(prev => prev.map(p => p._id === data.data._id ? data.data : p));
            toast.success(project.isHidden ? 'تم إظهار المشروع' : 'تم إخفاء المشروع');
        } catch (err) {
            toast.error('حدث خطأ أثناء التحديث');
        }
    };

    const filtered = projects.filter(p => {
        const titleMatch = (p.title?.ar || p.title || '').toLowerCase().includes(search.toLowerCase());
        if (filterType === 'all') return titleMatch;
        if (filterType === 'current') return titleMatch && p.type === 'current';
        if (filterType === 'past') return titleMatch && p.type === 'past';
        if (filterType === 'hidden') return titleMatch && p.isHidden;
        if (filterType === 'active') return titleMatch && p.status === 'active';
        return titleMatch;
    });

    const paginated = filtered.slice((page - 1) * limit, page * limit);
    const totalPages = Math.ceil(filtered.length / limit) || 1;

    return (
        <div className="component-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div className="sh-header">
                <div>
                    <h2>💼 إدارة المشروعات</h2>
                    <p>متابعة وتحديث كافة مشاريع الجمعية</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditItem(null);
                        setFormData({ titleAr: '', titleEn: '', descAr: '', descEn: '', type: 'current', status: 'active', isHidden: false, order: 0, mainImage: '', images: '', pdfLinks: '', videoLink: '' });
                        setPreviewImage('');
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> إضافة مشروع
                </button>
            </div>

            {/* Stats Cards */}
            <div className="sh-stats-grid">
                <div className="sh-stat-card">
                    <span>إجمالي المشروعات</span>
                    <strong style={{ color: 'var(--text-dark)' }}>{loading ? '-' : projects.length}</strong>
                </div>
                <div className="sh-stat-card" style={{ background: 'var(--secondary)' }}>
                    <span style={{ color: 'var(--primary)' }}>المشروعات الحالية</span>
                    <strong style={{ color: 'var(--primary)' }}>{loading ? '-' : projects.filter(p => p.type === 'current').length}</strong>
                </div>
                <div className="sh-stat-card" style={{ background: '#eff6ff' }}>
                    <span style={{ color: '#1d4ed8' }}>المشروعات السابقة</span>
                    <strong style={{ color: '#1d4ed8' }}>{loading ? '-' : projects.filter(p => p.type === 'past').length}</strong>
                </div>
                <div className="sh-stat-card" style={{ background: '#fef2f2' }}>
                    <span style={{ color: 'var(--danger)' }}>المشروعات المخفية</span>
                    <strong style={{ color: 'var(--danger)' }}>{loading ? '-' : projects.filter(p => p.isHidden).length}</strong>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="sh-table-container">
                {/* Toolbar */}
                <div className="sh-toolbar">
                    <div className="sh-search">
                        <FaSearch className="sh-search-icon" />
                        <input type="text" className="form-control" placeholder="بحث عن مشروع..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="sh-filter">
                        <FaFilter className="sh-filter-icon" />
                        <select className="form-control" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">كل المشروعات</option>
                            <option value="current">الحالية</option>
                            <option value="past">المشاريع السابقة</option>
                            <option value="active">النشطة</option>
                            <option value="hidden">المخفية</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive" style={{ flex: 1, margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>اسم المشروع</th>
                                <th>النوع</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'center' }}>الترتيب</th>
                                <th style={{ textAlign: 'center' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="6" style={{ padding: '1.5rem' }}>
                                            <div className="sh-skeleton"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <FaFileAlt size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'block', margin: '0 auto' }} />
                                        <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>لا توجد مسجلات</strong>
                                        <span>لم يتم العثور على أي مشاريع تطابق بحثك.</span>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((p) => (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={p._id} style={{ opacity: p.isHidden ? 0.6 : 1, filter: p.isHidden ? 'grayscale(0.5)' : 'none' }}>
                                        <td>
                                            <div className="sh-avatar">
                                                {p.mainImage ? <img src={handleGDrivePreview(p.mainImage)} alt={p.title?.ar} referrerPolicy="no-referrer" /> : <FaImage size={24} style={{ color: '#ccc' }} />}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{p.title?.ar || p.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} dir="ltr" className="text-right">{p.title?.en}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${p.type === 'current' ? 'badge-blue' : 'badge-gray'}`}>
                                                {p.type === 'current' ? 'حالي' : 'سابق'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_MAP[p.status]?.class || 'badge-gray'}`}>
                                                {STATUS_MAP[p.status]?.label}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-muted)' }}>{p.order || 0}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button onClick={() => toggleHide(p)} className="btn-icon" title={p.isHidden ? 'إظهار' : 'إخفاء'} style={{ color: p.isHidden ? '#3b82f6' : 'var(--text-muted)' }}>
                                                    {p.isHidden ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                                <button onClick={() => {
                                                    setEditItem(p);
                                                    setFormData({ titleAr: p.title?.ar || p.title || '', titleEn: p.title?.en || '', descAr: p.description?.ar || p.description || '', descEn: p.description?.en || '', type: p.type || 'current', status: p.status || 'active', isHidden: !!p.isHidden, order: p.order || 0, mainImage: p.mainImage || '', images: p.images?.join('\n') || '', pdfLinks: p.pdfLinks?.join('\n') || '', videoLink: p.videoLink || '' });
                                                    setPreviewImage(handleGDrivePreview(p.mainImage));
                                                    setShowModal(true);
                                                }} className="btn-icon text-primary" title="تعديل">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDelete(p._id, p.title?.ar || p.title)} className="btn-icon text-danger" title="حذف">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Details */}
                {!loading && filtered.length > 0 && (
                    <div className="sh-pagination">
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            إظهار {((page - 1) * limit) + 1} إلى {Math.min(page * limit, filtered.length)} من {filtered.length} مشروع
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <select className="form-control" style={{ padding: '0.4rem', width: 'auto', display: 'inline-block' }} value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-icon" style={{ background: '#fff', border: '1px solid var(--border)' }}><FaChevronRight /></button>
                                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn-icon" style={{ background: '#fff', border: '1px solid var(--border)' }}><FaChevronLeft /></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {showModal && (
                    <div className="sh-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="sh-modal-content">

                            <div className="sh-modal-header">
                                <h3>{editItem ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'}</h3>
                                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div className="sh-modal-body">
                                    <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">العنوان (عربي) <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">العنوان (English)</label>
                                            <input type="text" dir="ltr" className="form-control text-right" value={formData.titleEn} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">نوع المشروع</label>
                                            <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="current">مشروع حالي</option>
                                                <option value="past">مشروع سابق</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">حالة التنفيذ</label>
                                            <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="active">نشط</option>
                                                <option value="completed">مكتمل</option>
                                                <option value="planning">قيد التخطيط</option>
                                                <option value="suspended">موقوف</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label">الوصف (عربي) <span className="text-danger">*</span></label>
                                        <textarea rows={4} className="form-control" value={formData.descAr} onChange={e => setFormData({ ...formData, descAr: e.target.value })} required />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                                        <label className="form-label">الوصف (English)</label>
                                        <textarea rows={4} dir="ltr" className="form-control text-left" value={formData.descEn} onChange={e => setFormData({ ...formData, descEn: e.target.value })} />
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

                                    <div className="grid-2" style={{ gap: '1.5rem' }}>
                                        <div>
                                            <div className="form-group">
                                                <label className="form-label"><FaLink style={{ verticalAlign: 'middle' }} /> الصورة الرئيسية (رابط)</label>
                                                <input type="text" dir="ltr" className="form-control text-left" value={formData.mainImage} onChange={handleImageChange} placeholder="https://drive.google.com/..." />
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>ملاحظة: يجب أن تكون صلاحية الملف Anyone with the link</span>
                                            </div>
                                            <div className="form-group text-left" dir="ltr">
                                                <label className="form-label text-right" dir="rtl">معرض صور وتفاصيل إضافية (رابط في كل سطر)</label>
                                                <textarea rows={3} className="form-control" value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} />
                                            </div>
                                            <div className="grid-2">
                                                <div className="form-group">
                                                    <label className="form-label">الترتيب</label>
                                                    <input type="number" className="form-control" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} />
                                                </div>
                                                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                                                        <input type="checkbox" checked={formData.isHidden} onChange={e => setFormData({ ...formData, isHidden: e.target.checked })} /> إخفاء من الموقع
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="sh-image-preview">
                                                {previewImage ? (
                                                    <img src={previewImage} alt="Preview" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                                                ) : null}
                                                <div className="sh-placeholder" style={{ display: previewImage ? 'none' : 'flex' }}>
                                                    <FaImage size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                                    <span>معاينة الصورة</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="sh-modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" disabled={submitting}>إلغاء</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary">
                                        {submitting ? <span className="spinner" style={{ width: 16, height: 16, margin: 0, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', verticalAlign: 'middle', marginRight: '0.5rem' }} /> : <FaCheckCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />}
                                        {editItem ? 'تحديث البيانات' : 'حفظ المشروع'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
        .text-right { text-align: right; }
        .text-left { text-align: left; }
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
        .sh-filter { display: flex; align-items: center; gap: 0.5rem; }
        .sh-filter-icon { color: #9ca3af; }
        
        .sh-avatar { width: 45px; height: 45px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border); }
        .sh-avatar img { width: 100%; height: 100%; object-fit: cover; }
        
        .sh-pagination { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: rgba(250,250,250,0.5); }
        
        .sh-skeleton { height: 2.5rem; background: #f3f4f6; border-radius: var(--radius); animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .sh-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .sh-modal-content { background: var(--card-bg); width: 100%; max-width: 900px; max-height: 90vh; border-radius: var(--radius-lg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; }
        .sh-modal-header { padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
        .sh-modal-header h3 { margin: 0; font-size: 1.2rem; }
        .sh-modal-body { padding: 1.75rem; flex: 1; overflow-y: auto; }
        .sh-modal-footer { padding: 1rem 1.75rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem; background: #fafafa; }
        
        .sh-image-preview { width: 100%; height: 100%; min-height: 200px; border: 2px dashed var(--border); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; background: #fafafa; overflow: hidden; position: relative; }
        .sh-image-preview img { width: 100%; height: 100%; object-fit: contain; }
        .sh-placeholder { flex-direction: column; align-items: center; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; }
      `}} />
        </div>
    );
}
