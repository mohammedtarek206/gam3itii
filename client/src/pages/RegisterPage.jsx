import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('كلمتا المرور غير متطابقتين'); return; }
    if (form.password.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('تم إنشاء حسابك بنجاح! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌿 جمعيتي</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>انضم لمجتمع الخير</p>
        </div>
        <h2>إنشاء حساب جديد</h2>
        <p className="auth-sub">سجّل معنا وابدأ رحلة العطاء اليوم</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">الاسم الكامل</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكريم" required />
          </div>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="6 أحرف على الأقل" required />
          </div>
          <div className="form-group">
            <label className="form-label">تأكيد كلمة المرور</label>
            <input className="form-control" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="أعد كتابة كلمة المرور" required />
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? '⏳ جاري إنشاء الحساب...' : '🌟 إنشاء الحساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
