import { FaWhatsapp, FaEnvelope, FaFacebook, FaInstagram, FaPhone, FaTwitter } from 'react-icons/fa';

export default function ContactPage() {
  const contacts = [
    { icon: <FaWhatsapp style={{ color: '#25D366' }} />, label: 'واتساب', value: '01000000000+', href: 'https://wa.me/201000000000', bg: '#f0fdf4' },
    { icon: <FaPhone style={{ color: 'var(--primary)' }} />, label: 'هاتف', value: '01000000000+', href: 'tel:+201000000000', bg: 'var(--secondary)' },
    { icon: <FaEnvelope style={{ color: '#ea4335' }} />, label: 'البريد الإلكتروني', value: 'info@jam3iyati.eg', href: 'mailto:info@jam3iyati.eg', bg: '#fff5f5' },
    { icon: <FaFacebook style={{ color: '#1877f2' }} />, label: 'فيسبوك', value: 'Jam3iyati', href: '#', bg: '#eff6ff' },
    { icon: <FaInstagram style={{ color: '#e1306c' }} />, label: 'انستجرام', value: '@jam3iyati', href: '#', bg: '#fdf2f8' },
    { icon: <FaTwitter style={{ color: '#1da1f2' }} />, label: 'تويتر', value: '@jam3iyati', href: '#', bg: '#eff6ff' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>📞 تواصل معنا</h1>
          <p>نحن هنا دائماً للإجابة على استفساراتك</p>
        </div>
      </div>

      <div className="container section-sm">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
          {contacts.map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noreferrer" className="contact-card" style={{ textDecoration: 'none' }}>
              <div className="contact-icon" style={{ background: c.bg, fontSize: '1.6rem' }}>
                {c.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.label}</p>
                <p style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{c.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>💬 أرسل رسالة</h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>سنرد عليك في أقرب وقت ممكن</p>
          <div className="form-group"><label className="form-label">الاسم</label><input className="form-control" placeholder="اسمك الكريم" /></div>
          <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input className="form-control" type="email" placeholder="example@email.com" /></div>
          <div className="form-group"><label className="form-label">الموضوع</label><input className="form-control" placeholder="موضوع رسالتك" /></div>
          <div className="form-group"><label className="form-label">الرسالة</label><textarea className="form-control" rows={5} placeholder="اكتب رسالتك هنا..." /></div>
          <button className="btn btn-primary btn-block">📤 إرسال الرسالة</button>
        </div>
      </div>
    </div>
  );
}
