import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaHandsHelping, FaTimes } from 'react-icons/fa';

export default function VolunteerModal({ project, onClose }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    fullName: '', nationalId: '', email: '', phone: '',
    governorate: '', city: '', age: '', education: '',
    profession: '', skills: '', motivation: '',
    availableDays: [], cvFile: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!project) return null;

  const governorates = i18n.language === 'en' ? [
    'Cairo', 'Giza', 'Alexandria', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Aswan', 'Luxor',
    'Beni Suef', 'Fayoum', 'Monufia', 'Gharbia', 'Dakahlia', 'Sharqia', 'Kafr El Sheikh',
    'Damietta', 'Port Said', 'Ismailia', 'Suez', 'North Sinai', 'South Sinai',
    'Beheira', 'Matrouh', 'New Valley', 'Red Sea', 'Other'
  ] : [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'أسوان', 'الأقصر',
    'بني سويف', 'الفيوم', 'المنوفية', 'الغربية', 'الدقهلية', 'الشرقية', 'كفر الشيخ',
    'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
    'البحيرة', 'مرسى مطروح', 'الوادي الجديد', 'البحر الأحمر', 'أخرى'
  ];

  const educationLevels = i18n.language === 'en' ? [
    'Below Preparatory', 'Preparatory', 'Secondary', 'Technical Diploma', 'Bachelor', 'License',
    'Master', 'PhD', 'Other'
  ] : [
    'أقل من الإعدادية', 'إعدادية', 'ثانوية', 'دبلوم فني', 'بكالوريوس', 'ليسانس',
    'ماجستير', 'دكتوراه', 'أخرى'
  ];

  const days = [
    { key: 'saturday',  label: i18n.language === 'en' ? 'Saturday' : 'السبت' },
    { key: 'sunday',    label: i18n.language === 'en' ? 'Sunday' : 'الأحد' },
    { key: 'monday',    label: i18n.language === 'en' ? 'Monday' : 'الإثنين' },
    { key: 'tuesday',   label: i18n.language === 'en' ? 'Tuesday' : 'الثلاثاء' },
    { key: 'wednesday', label: i18n.language === 'en' ? 'Wednesday' : 'الأربعاء' },
    { key: 'thursday',  label: i18n.language === 'en' ? 'Thursday' : 'الخميس' },
    { key: 'friday',    label: i18n.language === 'en' ? 'Friday' : 'الجمعة' },
  ];

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'email', 'phone', 'governorate', 'city', 'age', 'education', 'motivation'];
    for (const field of required) {
      if (!form[field]) {
        toast.error(i18n.language === 'en' ? 'Please fill out all required fields (*)' : 'يرجى ملء جميع الحقول المطلوبة (*)');
        return;
      }
    }
    setSubmitting(true);
    try {
      await api.post('/volunteers', { ...form, projectId: project._id });
      setSubmitted(true);
      toast.success(t('volunteer.success'));
    } catch (err) {
      toast.error(err.response?.data?.message || (i18n.language === 'en' ? 'An error occurred, please try again' : 'حدث خطأ، يرجى المحاولة مجدداً'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1100, padding: '1rem', backdropFilter: 'blur(6px)'
        }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.88 }}
          style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 700, maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 40px 100px rgba(0,0,0,0.3)', overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #0f2419 0%, #1b7a3e 100%)',
            color: '#fff', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaHandsHelping /> {t('volunteer.title')}
              </h3>
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>{project.title}</p>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                <h3 style={{ color: '#1b7a3e', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                  {i18n.language === 'en' ? 'Application Submitted!' : 'تم إرسال طلبك بنجاح!'}
                </h3>
                <p style={{ color: 'var(--text-body)', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.8 }}>
                  {i18n.language === 'en' ? 'Thank you for volunteering! Our team will contact you shortly to review your request.' : 'شكراً لتطوعك! سيتواصل معك فريق جمعية بناء قريباً لمراجعة طلبك.'}
                </p>
                <button onClick={onClose} className="btn btn-primary">
                  {i18n.language === 'en' ? 'Close' : 'إغلاق'}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Personal Info */}
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1.25rem', border: '1px solid rgba(52,210,123,0.15)' }}>
                  <h4 style={{ color: '#1b7a3e', margin: '0 0 1rem', fontSize: '0.95rem' }}>
                    {i18n.language === 'en' ? '📋 Personal Information' : '📋 البيانات الشخصية'}
                  </h4>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.full_name')}</label>
                      <input className="form-control" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder={i18n.language === 'en' ? 'Full Name' : 'الاسم الكامل'} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{i18n.language === 'en' ? 'National ID (Optional)' : 'الرقم القومي (اختياري)'}</label>
                      <input className="form-control" value={form.nationalId} onChange={e => setForm({...form, nationalId: e.target.value})} placeholder="14 digits" maxLength={14} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.email')}</label>
                      <input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="example@mail.com" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.phone')}</label>
                      <input className="form-control" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01XXXXXXXXX" required />
                    </div>
                  </div>
                </div>

                {/* Location & Age */}
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1.25rem', border: '1px solid rgba(52,210,123,0.15)' }}>
                  <h4 style={{ color: '#1b7a3e', margin: '0 0 1rem', fontSize: '0.95rem' }}>
                    {i18n.language === 'en' ? '📍 Location & Age' : '📍 الموقع والسن'}
                  </h4>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.governorate')}</label>
                      <select className="form-control" value={form.governorate} onChange={e => setForm({...form, governorate: e.target.value})} required>
                        <option value="">{i18n.language === 'en' ? 'Select Governorate' : 'اختر المحافظة'}</option>
                        {governorates.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.city')}</label>
                      <input className="form-control" value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder={i18n.language === 'en' ? 'City or Village' : 'المدينة أو القرية'} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.age')}</label>
                      <input className="form-control" type="number" min="16" max="80" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder={i18n.language === 'en' ? 'Age in years' : 'العمر بالسنوات'} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{t('volunteer.education')}</label>
                      <select className="form-control" value={form.education} onChange={e => setForm({...form, education: e.target.value})} required>
                        <option value="">{i18n.language === 'en' ? 'Select Education Level' : 'اختر المؤهل'}</option>
                        {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills & Motivation */}
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1.25rem', border: '1px solid rgba(52,210,123,0.15)' }}>
                  <h4 style={{ color: '#1b7a3e', margin: '0 0 1rem', fontSize: '0.95rem' }}>
                    {i18n.language === 'en' ? '💡 Skills & Motivation' : '💡 المهارات والدوافع'}
                  </h4>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{i18n.language === 'en' ? 'Profession' : 'المهنة'}</label>
                      <input className="form-control" value={form.profession} onChange={e => setForm({...form, profession: e.target.value})} placeholder={i18n.language === 'en' ? 'Current job' : 'الوظيفة الحالية'} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{i18n.language === 'en' ? 'Skills' : 'المهارات'}</label>
                      <input className="form-control" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder={i18n.language === 'en' ? 'e.g. Medicine, Teaching, Photography...' : 'مثال: طب، تدريس، تصوير...'} />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                    <label className="form-label">{t('volunteer.motivation')}</label>
                    <textarea className="form-control" rows={3} value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})} placeholder={i18n.language === 'en' ? 'Tell us why you want to volunteer...' : 'اكتب لنا عن دوافعك ورغبتك في التطوع...'} required />
                  </div>
                </div>

                {/* Available Days */}
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1.25rem', border: '1px solid rgba(52,210,123,0.15)' }}>
                  <h4 style={{ color: '#1b7a3e', margin: '0 0 1rem', fontSize: '0.95rem' }}>
                    {i18n.language === 'en' ? '📅 Available Days' : '📅 أيام التفرغ'}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {days.map(day => (
                      <button
                        key={day.key} type="button"
                        onClick={() => toggleDay(day.key)}
                        style={{
                          padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.88rem', fontWeight: 600,
                          border: `2px solid ${form.availableDays.includes(day.key) ? '#1b7a3e' : 'var(--border)'}`,
                          background: form.availableDays.includes(day.key) ? 'rgba(27,122,62,0.1)' : '#fff',
                          color: form.availableDays.includes(day.key) ? '#1b7a3e' : 'var(--text-body)',
                          cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                      >
                        {form.availableDays.includes(day.key) ? '✓ ' : ''}{day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CV Link */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{i18n.language === 'en' ? 'CV / Resume Link (Optional)' : 'رابط السيرة الذاتية (اختياري)'}</label>
                  <input className="form-control" value={form.cvFile} onChange={e => setForm({...form, cvFile: e.target.value})}
                    placeholder={i18n.language === 'en' ? 'Google Drive or Dropbox link' : 'رابط Google Drive أو Dropbox للسيرة الذاتية'} />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {i18n.language === 'en' ? 'You can upload your CV to Google Drive and paste the link here' : 'يمكنك رفع السيرة الذاتية على Google Drive ولصق الرابط هنا'}
                  </small>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}
                  style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {submitting ? (
                    i18n.language === 'en' ? 'Submitting...' : 'جاري الإرسال...'
                  ) : (
                    <><FaHandsHelping /> {t('volunteer.submit')}</>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
