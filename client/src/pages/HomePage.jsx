import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import CaseCard from '../components/CaseCard';
import JobCard from '../components/JobCard';
import { FaHeart, FaHandHoldingHeart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function AnimatedNumber({ target, inView, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const increment = target / 80;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(current));
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <>{val.toLocaleString('ar-EG')}{suffix}</>;
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [cases, setCases] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [inView, setInView] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    api.get('/cases?urgent=true').then(({ data }) => setCases(data.data?.slice(0, 3) || [])).catch(() => { });
    api.get('/jobs').then(({ data }) => setJobs(data.data?.slice(0, 3) || [])).catch(() => { });
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const STATS = [
    { icon: '👥', target: 1240, suffix: '+', label: t('home.stats_donors') },
    { icon: '💰', target: 520000, suffix: ' جنيه', label: t('home.stats_donated') },
    { icon: '🤲', target: 850, suffix: '+', label: t('home.stats_beneficiaries') },
    { icon: '✅', target: 42, suffix: '', label: t('home.stats_cases') },
  ];

  const STORIES = [
    { name: 'أحمد السيد', before: 'كان يعاني من مرض مزمن ولا يملك ثمن العلاج', after: 'تعافى تماماً بفضل تبرعاتكم وأصبح يعمل ويعيش حياة كريمة', icon: '🏥', cat: 'علاج' },
    { name: 'فاطمة حسن', before: 'اضطرت للانقطاع عن الدراسة بسبب الفقر', after: 'حصلت على منحة تعليمية كاملة وتفوقت في دراستها', icon: '📚', cat: 'تعليم' },
    { name: 'عائلة محمود', before: 'كانت تعيش في منزل متداعٍ غير صالح للسكن', after: 'الآن تسكن في منزل آمن وملائم بفضل حملة البناء', icon: '🏠', cat: 'بناء' },
  ];

  return (
    <div className="fade-in">
      {/* ======= HERO ======= */}
      <section className="hero">
        <div className="container">
          <div className="hero-content slide-up">
            <div className="hero-tag">🌟 منصة الخير الرقمية</div>
            <h1>
              {t('home.hero_title')} <span className="highlight">{t('home.hero_highlight')}</span>
            </h1>
            <p>{t('home.hero_sub')}</p>
            <div className="hero-btns">
              <Link to="/cases" className="btn btn-primary btn-lg">
                <FaHeart /> {t('home.donate_now')}
              </Link>
              <Link to="/cases" className="hero-btn-secondary btn btn-lg">
                {t('home.explore_cases')}
                {i18n.language === 'ar'
                  ? <FaArrowLeft style={{ marginRight: 6 }} />
                  : <FaArrowRight style={{ marginLeft: 6 }} />}
              </Link>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '10%', insetInlineEnd: '8%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(52,210,123,0.07)', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '15%', insetInlineEnd: '20%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(52,210,123,0.05)', animation: 'float 8s ease-in-out infinite reverse' }} />
        <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>
      </section>

      {/* ======= STATS ======= */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-number">
                  <AnimatedNumber target={s.target} inView={inView} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= URGENT CASES ======= */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2>🚨 {t('home.urgent_cases')}</h2>
            <p>هذه الحالات تحتاج لمساعدتك فوراً</p>
            <div className="section-line" />
          </div>
          {cases.length > 0 ? (
            <div className="grid-3">
              {cases.map((c) => <CaseCard key={c._id} c={c} />)}
            </div>
          ) : (
            <div className="spinner" />
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/cases" className="btn btn-outline btn-lg">{t('home.see_all')} الحالات</Link>
          </div>
        </div>
      </section>

      {/* ======= SUCCESS STORIES ======= */}
      <section className="section" style={{ background: 'linear-gradient(135deg,#f0faf4,#e8f5e9)' }}>
        <div className="container">
          <div className="section-header">
            <h2>✨ {t('home.success_stories')}</h2>
            <p>قصص حقيقية لأشخاص غيّرت حياتهم بفضل تبرعاتكم</p>
            <div className="section-line" />
          </div>
          <div className="grid-3">
            {STORIES.map((s, i) => (
              <div key={i}
                style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{s.name}</h3>
                    <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>{s.cat}</span>
                  </div>
                </div>
                <div style={{ marginBottom: '0.85rem', padding: '0.75rem', background: '#fff5f5', borderRadius: 'var(--radius)', borderInlineStart: '3px solid var(--danger)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#dc2626' }}><strong>قبل:</strong> {s.before}</p>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--secondary)', borderRadius: 'var(--radius)', borderInlineStart: '3px solid var(--primary)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}><strong>بعد:</strong> {s.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= LATEST JOBS ======= */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="section-header">
            <h2>💼 {t('home.latest_jobs')}</h2>
            <p>انضم لفريقنا وكن جزءاً من التغيير</p>
            <div className="section-line" />
          </div>
          {jobs.length > 0 ? (
            <div className="grid-3">
              {jobs.map((j) => <JobCard key={j._id} job={j} />)}
            </div>
          ) : (
            <div className="spinner" />
          )}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link to="/jobs" className="btn btn-outline btn-lg">{t('home.see_all')} الوظائف</Link>
          </div>
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section style={{ background: 'linear-gradient(135deg,var(--primary-dark),var(--primary))', padding: '5rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
          <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '2rem' }}>ساهم في صنع مستقبل أفضل</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            كل جنيه تتبرع به هو خطوة نحو مساعدة أسرة محتاجة
          </p>
          <Link to="/cases" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>
            <FaHandHoldingHeart /> تبرع الآن
          </Link>
        </div>
      </section>
    </div>
  );
}
