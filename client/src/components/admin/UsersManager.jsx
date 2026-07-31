import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus, FaEdit, FaTrash, FaShieldAlt, FaUserTimes, FaUserCheck, FaKey, FaSearch, FaTimes, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ROLE_MAP = {
    superadmin: { label: 'سوبر أدمن', color: 'badge-blue' },
    admin: { label: 'مدير النظام', color: 'badge-gold' },
    content_manager: { label: 'مدير المحتوى', color: 'badge-gray' },
    hr_manager: { label: 'مدير الموارد البشرية', color: 'badge-orange' },
    volunteer_manager: { label: 'مدير المتطوعين', color: 'badge-green' },
    editor: { label: 'محرر', color: 'badge-gray' },
    user: { label: 'مستخدم عادي', color: 'badge-gray' },
};

export default function UsersManager() {
    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === 'superadmin';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user', isActive: true, avatar: ''
    });

    const [showPassModal, setShowPassModal] = useState(false);
    const [passData, setPassData] = useState({ password: '', confirmPassword: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data.data || []);
        } catch (err) {
            toast.error('تعذر تحميل المستخدمين');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            toast.error('هذا الإجراء مخصص للسوبر أدمن فقط');
            return;
        }

        if (!editItem && formData.password !== formData.confirmPassword) {
            toast.error('عدم تطابق كلمتي المرور');
            return;
        }

        setSubmitting(true);
        try {
            if (editItem) {
                // Update user
                const { password, confirmPassword, ...updatePayload } = formData;
                const { data } = await api.put(`/admin/users/${editItem._id}`, updatePayload);
                setUsers(prev => prev.map(u => u._id === data.data._id ? data.data : u));
                toast.success('تم تعديل بيانات المستخدم بنجاح');
            } else {
                // Create user
                if (formData.password.length < 6) {
                    toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                    setSubmitting(false);
                    return;
                }
                const { data } = await api.post('/admin/users', formData);
                setUsers(prev => [data.data, ...prev]);
                toast.success('تم إضافة المستخدم بنجاح');
            }
            setShowModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'حدث خطأ');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!isSuperAdmin) return toast.error('صلاحية سوبر أدمن مطلوبة');
        if (!window.confirm(`هل أنت متأكد من حذف الحساب "${name}" نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success('تم حذف المستخدم نهائياً');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleToggleStatus = async (id, name, isActive) => {
        if (!isSuperAdmin) return toast.error('صلاحية سوبر أدمن مطلوبة');
        if (!window.confirm(`هل تريد ${isActive ? 'تعطيل' : 'تفعيل'} حساب "${name}"؟`)) return;

        try {
            const { data } = await api.put(`/admin/users/${id}/status`);
            setUsers(prev => prev.map(u => u._id === id ? data.data : u));
            toast.success(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) return toast.error('صلاحية سوبر أدمن مطلوبة');
        if (passData.password !== passData.confirmPassword) return toast.error('كلمات المرور غير متطابقة');

        setSubmitting(true);
        try {
            await api.put(`/admin/users/${editItem._id}/password`, { password: passData.password });
            toast.success('تم إعادة تعيين كلمة المرور بنجاح');
            setShowPassModal(false);
            setPassData({ password: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="component-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="sh-header">
                <div>
                    <h2>👥 إدارة المستخدمين والصلاحيات</h2>
                    <p>تحكم كامل في الحسابات والأدوار والنظام (RBAC)</p>
                </div>
                {isSuperAdmin && (
                    <button
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)' }}
                        onClick={() => {
                            setEditItem(null);
                            setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'user', isActive: true, avatar: '' });
                            setShowModal(true);
                        }}
                    >
                        <FaPlus /> إضافة مستخدم
                    </button>
                )}
            </div>

            {!isSuperAdmin && (
                <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', color: '#9a3412', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaExclamationTriangle size={24} style={{ color: '#ea580c' }} />
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 700, color: '#7c2d12' }}>صلاحية مشاهدة فقط</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>نظرًا لأنك لست (Super Admin)، يمكنك فقط استعراض المستخدمين دون القدرة على تعديلهم أو إضافة مستخدمين جدد.</p>
                    </div>
                </div>
            )}

            {/* Main Table Container */}
            <div className="sh-table-container">
                {/* Toolbar */}
                <div className="sh-toolbar" style={{ justifyContent: 'space-between' }}>
                    <div className="sh-search">
                        <FaSearch className="sh-search-icon" />
                        <input type="text" className="form-control" placeholder="بحث بالاسم أو البريد الإلكتروني..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: '#fff', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        إجمالي الحسابات: <strong style={{ color: 'var(--text-dark)' }}>{users.length}</strong>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive" style={{ flex: 1, margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>المستخدم</th>
                                <th>الصلاحية (Role)</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                                <th style={{ textAlign: 'center' }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" style={{ padding: '1.5rem' }}><div className="sh-skeleton"></div></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <strong style={{ display: 'block', fontSize: '1.2rem' }}>لا يوجد مستخدمين</strong>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((u) => (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={u._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="sh-avatar" style={{ borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontWeight: 'bold' }}>
                                                    {u.avatar ? <img src={u.avatar} alt="avatar" /> : u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.2rem' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} dir="ltr" className="text-right">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${ROLE_MAP[u.role]?.color || 'badge-gray'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <FaShieldAlt /> {ROLE_MAP[u.role]?.label || u.role}
                                            </span>
                                        </td>
                                        <td dir="ltr" className="text-right" style={{ fontWeight: '500', color: 'var(--text-muted)' }}>{u.phone || '-'}</td>
                                        <td>
                                            <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                                                {u.isActive ? 'مفعل' : 'معطل'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                {isSuperAdmin && currentUser._id !== u._id && (
                                                    <>
                                                        <button onClick={() => handleToggleStatus(u._id, u.name, u.isActive)} className="btn-icon" title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'} style={{ color: u.isActive ? 'var(--warning)' : 'var(--accent)' }}>
                                                            {u.isActive ? <FaUserTimes /> : <FaUserCheck />}
                                                        </button>
                                                        <button onClick={() => { setEditItem(u); setShowPassModal(true); }} className="btn-icon" style={{ color: '#6366f1' }} title="تغيير كلمة المرور">
                                                            <FaKey />
                                                        </button>
                                                        <button onClick={() => {
                                                            setEditItem(u);
                                                            setFormData({ name: u.name, email: u.email, phone: u.phone || '', role: u.role, isActive: u.isActive, avatar: u.avatar || '', password: '', confirmPassword: '' });
                                                            setShowModal(true);
                                                        }} className="btn-icon text-primary" title="تعديل">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDelete(u._id, u.name)} className="btn-icon text-danger" title="حذف">
                                                            <FaTrash />
                                                        </button>
                                                    </>
                                                )}
                                                {isSuperAdmin && currentUser._id === u._id && (
                                                    <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>حسابك (أدمن)</span>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Main User Modal */}
            <AnimatePresence>
                {showModal && isSuperAdmin && (
                    <div className="sh-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="sh-modal-content" style={{ maxWidth: '700px' }}>

                            <div className="sh-modal-header">
                                <h3>{editItem ? 'تعديل بيانات المستخدم' : 'إنشاء حساب جديد'}</h3>
                                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div className="sh-modal-body">
                                    <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">الاسم بالكامل <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">البريد الإلكتروني <span className="text-danger">*</span></label>
                                            <input type="email" dir="ltr" className="form-control text-right" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">رقم الهاتف</label>
                                            <input type="text" dir="ltr" className="form-control text-right" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">الصلاحية (Role) <span className="text-danger">*</span></label>
                                            <select className="form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required>
                                                {Object.entries(ROLE_MAP).map(([key, val]) => (
                                                    <option key={key} value={key}>{key} - {val.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {!editItem && (
                                            <>
                                                <div className="form-group">
                                                    <label className="form-label">كلمة المرور الإفتراضية <span className="text-danger">*</span></label>
                                                    <input type="password" dir="ltr" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={6} placeholder="******" />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">تأكيد كلمة المرور <span className="text-danger">*</span></label>
                                                    <input type="password" dir="ltr" className="form-control" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required minLength={6} />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">رابط صورة الحساب (اختياري)</label>
                                        <input type="text" dir="ltr" className="form-control text-right" value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>

                                <div className="sh-modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" disabled={submitting}>إلغاء</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                                        {submitting ? <span className="spinner" style={{ width: 16, height: 16, margin: 0, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', verticalAlign: 'middle', marginRight: '0.5rem' }} /> : <FaCheckCircle style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />}
                                        {editItem ? 'تحديث البيانات' : 'إنشاء المستخدم'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {showPassModal && isSuperAdmin && (
                    <div className="sh-modal-overlay" style={{ zIndex: 1100 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="sh-modal-content" style={{ maxWidth: '450px' }}>
                            <div className="sh-modal-header">
                                <h3 style={{ fontSize: '1.1rem' }}>تغيير كلمة المرور</h3>
                                <button onClick={() => setShowPassModal(false)} className="btn-icon"><FaTimes /></button>
                            </div>
                            <form onSubmit={handlePasswordReset}>
                                <div className="sh-modal-body">
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                        أنت على وشك تعيين كلمة مرور جديدة للمستخدم <strong style={{ color: '#4f46e5' }}>{editItem?.name}</strong>.
                                    </p>
                                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label className="form-label">كلمة المرور الجديدة</label>
                                        <input type="password" dir="ltr" className="form-control" required value={passData.password} onChange={e => setPassData({ ...passData, password: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">تأكيد كلمة المرور</label>
                                        <input type="password" dir="ltr" className="form-control" required value={passData.confirmPassword} onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })} />
                                    </div>
                                </div>
                                <div className="sh-modal-footer">
                                    <button type="button" onClick={() => setShowPassModal(false)} className="btn btn-ghost">إلغاء</button>
                                    <button type="submit" disabled={submitting} className="btn btn-primary" style={{ background: '#4f46e5' }}>تعيين كلمة المرور</button>
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
                
                .sh-table-container { background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; flex: 1; overflow: hidden; }
                
                .sh-toolbar { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); display: flex; gap: 1rem; flex-wrap: wrap; background: rgba(250,250,250,0.5); }
                .sh-search { position: relative; flex: 1; min-width: 250px; max-width: 400px; }
                .sh-search-icon { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
                .sh-search input { padding-right: 2.5rem; width: 100%; border-radius: var(--radius); }
                
                .sh-avatar { width: 45px; height: 45px; border-radius: 8px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border); }
                .sh-avatar img { width: 100%; height: 100%; object-fit: cover; }
                
                .sh-skeleton { height: 2.5rem; background: #f3f4f6; border-radius: var(--radius); animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

                .sh-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 1rem; }
                .sh-modal-content { background: var(--card-bg); width: 100%; max-width: 900px; max-height: 90vh; border-radius: var(--radius-lg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; }
                .sh-modal-header { padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #fafafa; }
                .sh-modal-header h3 { margin: 0; font-size: 1.2rem; }
                .sh-modal-body { padding: 1.75rem; flex: 1; overflow-y: auto; }
                .sh-modal-footer { padding: 1rem 1.75rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem; background: #fafafa; }
            `}} />
        </div>
    );
}
