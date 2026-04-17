import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`أهلاً ${data.user.name}! 👋`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'بيانات الدخول غير صحيحة');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🌿 {t('nav.brand')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>منصة الخير الرقمية</p>
        </div>
        <h2>تسجيل الدخول</h2>
        <p className="auth-sub">أهلاً بعودتك! سجّل دخولك للمتابعة</p>


        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-control"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                style={{ paddingInlineEnd: '3rem' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', top: '50%', insetInlineEnd: '0.75rem', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? '⏳ جاري الدخول...' : '🚀 تسجيل الدخول'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
}
