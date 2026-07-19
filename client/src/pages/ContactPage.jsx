import { FaWhatsapp, FaEnvelope, FaFacebook, FaInstagram, FaPhone, FaTwitter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';

export default function ContactPage() {
  const { t, i18n } = useTranslation();

  const contacts = [
    { 
      icon: <FaWhatsapp style={{ color: '#25D366' }} />, 
      label: i18n.language === 'en' ? 'WhatsApp' : 'واتساب', 
      value: '+20 100 000 0000', 
      href: 'https://wa.me/201000000000', 
      bg: '#f0fdf4' 
    },
    { 
      icon: <FaPhone style={{ color: 'var(--primary)' }} />, 
      label: i18n.language === 'en' ? 'Phone' : 'هاتف', 
      value: '+20 100 000 0000', 
      href: 'tel:+201000000000', 
      bg: 'var(--secondary)' 
    },
    { 
      icon: <FaEnvelope style={{ color: '#ea4335' }} />, 
      label: i18n.language === 'en' ? 'Email' : 'البريد الإلكتروني', 
      value: 'info@benaa-for-all.org', 
      href: 'mailto:info@benaa-for-all.org', 
      bg: '#fff5f5' 
    },
    { 
      icon: <FaFacebook style={{ color: '#1877f2' }} />, 
      label: i18n.language === 'en' ? 'Facebook' : 'فيسبوك', 
      value: 'Benaa For All', 
      href: '#', 
      bg: '#eff6ff' 
    },
    { 
      icon: <FaInstagram style={{ color: '#e1306c' }} />, 
      label: i18n.language === 'en' ? 'Instagram' : 'انستجرام', 
      value: '@benaaforall', 
      href: '#', 
      bg: '#fdf2f8' 
    },
    { 
      icon: <FaTwitter style={{ color: '#1da1f2' }} />, 
      label: i18n.language === 'en' ? 'Twitter' : 'تويتر', 
      value: '@benaaforall', 
      href: '#', 
      bg: '#eff6ff' 
    },
  ];

  return (
    <div className="fade-in">
      <SEO 
        title={i18n.language === 'en' ? 'Contact Us' : 'تواصل معنا'} 
        description={t('home.hero_sub')}
        canonicalUrl="https://benaa-for-all.org/contact" 
      />
      <div className="page-header">
        <div className="container">
          <h1>📞 {i18n.language === 'en' ? 'Contact Us' : 'تواصل معنا'}</h1>
          <p>{i18n.language === 'en' ? 'We are here to answer all your inquiries' : 'نحن هنا دائماً للإجابة على استفساراتك'}</p>
        </div>
      </div>

      <div className="container section-sm">
        <div className="grid-3" style={{ marginBottom: '4rem' }}>
          {contacts.map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noreferrer" className="contact-card" style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#fff' }}>
              <div className="contact-icon" style={{ background: c.bg, fontSize: '1.6rem', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{c.label}</p>
                <p style={{ fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{c.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            {i18n.language === 'en' ? '💬 Send a Message' : '💬 أرسل رسالة'}
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {i18n.language === 'en' ? 'We will get back to you as soon as possible' : 'سنرد عليك في أقرب وقت ممكن'}
          </p>
          <div className="form-group">
            <label className="form-label">{i18n.language === 'en' ? 'Name' : 'الاسم'}</label>
            <input className="form-control" placeholder={i18n.language === 'en' ? 'Your name' : 'اسمك الكريم'} />
          </div>
          <div className="form-group">
            <label className="form-label">{i18n.language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}</label>
            <input className="form-control" type="email" placeholder="example@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">{i18n.language === 'en' ? 'Subject' : 'الموضوع'}</label>
            <input className="form-control" placeholder={i18n.language === 'en' ? 'Message Subject' : 'موضوع رسالتك'} />
          </div>
          <div className="form-group">
            <label className="form-label">{i18n.language === 'en' ? 'Message' : 'الرسالة'}</label>
            <textarea className="form-control" rows={5} placeholder={i18n.language === 'en' ? 'Write your message here...' : 'اكتب رسالتك هنا...'} />
          </div>
          <button className="btn btn-primary btn-block">
            {i18n.language === 'en' ? '📤 Send Message' : '📤 إرسال الرسالة'}
          </button>
        </div>
      </div>
    </div>
  );
}
