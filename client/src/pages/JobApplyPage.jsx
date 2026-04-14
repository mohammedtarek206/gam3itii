import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUpload, FaPaperPlane } from 'react-icons/fa';

export default function JobApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', coverLetter: '' });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data.data));
    if (user) setForm((f) => ({ ...f, name: user.name, email: user.email }));
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error('يرجى ملء جميع الحقول المطلوبة'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('jobId', id);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cvFile) fd.append('cv', cvFile);
      await api.post('/applications', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>📋 التقديم على وظيفة</h1>
          {job && <p>{job.title} — {job.location}</p>}
        </div>
      </div>

      <div className="container section-sm" style={{ maxWidth: 700 }}>
        <Link to={`/jobs/${id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
          <FaArrowLeft /> العودة للوظيفة
        </Link>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>🌟 بيانات المتقدم</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            يرجى التأكد من صحة بياناتك قبل الإرسال
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">الاسم الكامل *</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="أحمد محمد" required />
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني *</label>
                <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">رقم الهاتف *</label>
              <input className="form-control" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" required />
            </div>

            <div className="form-group">
              <label className="form-label">السيرة الذاتية (PDF أو Word)</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '2px dashed var(--border)',
                borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'var(--transition)',
                background: cvFile ? 'var(--secondary)' : '#fff',
                borderColor: cvFile ? 'var(--primary)' : 'var(--border)',
              }}>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => setCvFile(e.target.files[0])} />
                <FaUpload style={{ color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', color: cvFile ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {cvFile ? `✅ ${cvFile.name}` : 'انقر لرفع ملف السيرة الذاتية'}
                </span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">رسالة التقديم</label>
              <textarea
                className="form-control"
                rows={5}
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                placeholder="اكتب هنا سبب اهتمامك بهذه الوظيفة وما الذي تقدمه لفريقنا..."
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? '⏳ جاري الإرسال...' : <><FaPaperPlane /> إرسال الطلب</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
