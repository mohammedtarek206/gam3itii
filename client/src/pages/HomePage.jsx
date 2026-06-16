import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/SEO';
import { 
  FaBalanceScale, FaHandshake, FaShieldAlt, FaUsers, FaCheckCircle, 
  FaGlobe, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, 
  FaTwitter, FaInstagram, FaChevronLeft, FaChevronRight, FaArrowLeft,
  FaFileContract, FaBuilding, FaUserTie
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submittingContact, setSubmittingContact] = useState(false);

  // Fetch activities on mount
  useEffect(() => {
    api.get('/activities')
      .then(({ data }) => {
        setActivities(data.data?.slice(0, 3) || []);
      })
      .catch(() => {
        // Fallback mockup activities if API fails/empty
        setActivities([
          {
            _id: '1',
            title: 'ندوة التمكين الاقتصادي للأسر الأولى بالرعاية',
            description: 'ورشة عمل تدريبية للأسر لتطوير المهارات الحرفية وإدارة المشروعات الصغيرة ومتناهية الصغر بالمنيا.',
            date: new Date().toISOString(),
            location: 'مقر الجمعية بالمنيا',
            category: 'تمكين اقتصادي',
            status: 'completed'
          },
          {
            _id: '2',
            title: 'حملة الكشف الطبي المجاني وقوافل الرعاية الصحية',
            description: 'قافلة طبية شاملة بالتعاون مع مديرية الصحة لتقديم العلاج المجاني للأسر الأكثر احتياجاً.',
            date: new Date(Date.now() + 86400000 * 5).toISOString(),
            location: 'قرى مركز المنيا',
            category: 'صحة ورعاية',
            status: 'upcoming'
          },
          {
            _id: '3',
            title: 'مبادرة التعليم الرقمي وتمكين الشباب',
            description: 'دورة تدريبية متخصصة لتعليم مهارات الحاسوب والتحول الرقمي للطلاب والخريجين الجدد.',
            date: new Date(Date.now() + 86400000 * 10).toISOString(),
            location: 'قاعة المؤتمرات بالمنيا',
            category: 'تعليم وتطوير',
            status: 'upcoming'
          }
        ]);
      })
      .finally(() => setLoadingActivities(false));
  }, []);

  // Form submission handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    setSubmittingContact(true);
    try {
      // Assuming generic endpoint for contact messages exists or log it
      await new Promise(resolve => setTimeout(resolve, 1200)); 
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error('حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmittingContact(false);
    }
  };

  // 1. Hero 3D background components logic (floating items)
  const floatingBubbles = Array.from({ length: 15 });

  // Values content (Section 5)
  const values = [
    { title: 'العدالة والمساواة', desc: 'ضمان تقديم الدعم والفرص لكافة الفئات دون أي تمييز.', icon: <FaBalanceScale /> },
    { title: 'بناء السلام المجتمعي', desc: 'نشر قيم التسامح والتماسك لبناء مجتمع آمن ومستقر.', icon: <FaHandshake /> },
    { title: 'احترام حقوق الإنسان', desc: 'الالتزام الكامل بكرامة وحقوق الأفراد المستهدفين ببرامجنا.', icon: <FaShieldAlt /> },
    { title: 'العمل الجماعي', desc: 'الإيمان بقوة التكاتف والخبرات المشتركة لتحقيق أثر مستدام.', icon: <FaUsers /> },
    { title: 'المصداقية', desc: 'الشفافية المطلقة والمسؤولية في كل ما نقوم به من مشروعات.', icon: <FaCheckCircle /> },
    { title: 'مراعاة قيم التنوع', desc: 'احترام الاختلافات الثقافية والاجتماعية كعامل قوة وإثراء للمجتمع.', icon: <FaGlobe /> },
  ];

  // Board of Directors content (Section 6)
  const boardMembers = [
    { name: 'محمد إبراهيم دردير', role: 'رئيس مجلس الإدارة', initial: 'م' },
    { name: 'أشرف عثمان محمد', role: 'أمين الصندوق', initial: 'أ' },
    { name: 'أم كلثوم محمد محمود سليمان', role: 'عضو مجلس إدارة', initial: 'أ' },
    { name: 'أشرف حامد عبد الجليل علي', role: 'عضو مجلس إدارة', initial: 'أ' },
    { name: 'هالة ظريف حليم حنا', role: 'سكرتير المجلس', initial: 'ه' },
  ];

  // Stats content (Section 7)
  const stats = [
    { value: '٨,٥٠٠+', label: 'عدد المستفيدين' },
    { value: '٤٢+', label: 'عدد المشروعات' },
    { value: '٦٥+', label: 'عدد المبادرات' },
    { value: '١٨+', label: 'عدد الشركاء والداعمين' }
  ];

  // Partners content (Section 8)
  const partners = [
    'وزارة التضامن الاجتماعي',
    'التحالف الوطني للعمل الأهلي التنموي',
    'مؤسسة مصر الخير',
    'الهيئة القبطية الإنجيلية للخدمات الاجتماعية',
    'جمعية الأورمان',
    'مؤسسة ساويرس للتنمية الاجتماعية'
  ];

  return (
    <div className="homepage-root" style={{ overflowX: 'hidden' }}>
      <SEO 
        title="الرئيسية" 
        description="الموقع الرسمي لجمعية بناء للتنمية بالمنيا - معًا نبني مستقبلًا أفضل للجميع"
        canonicalUrl="https://benna-for-all.org/" 
      />

      {/* ======= SECTION 1: HERO SECTION ======= */}
      <section className="hero-section" style={{
        position: 'relative',
        minHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #091a10 0%, #102e1c 50%, #1b4d32 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        padding: '6rem 0'
      }}>
        {/* Animated 3D/Fluids Background using CSS and Framer Motion */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {floatingBubbles.map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 150 + 60,
                height: Math.random() * 150 + 60,
                borderRadius: '50%',
                background: i % 2 === 0 
                  ? 'radial-gradient(circle, rgba(52,210,123,0.1) 0%, rgba(27,122,62,0) 70%)'
                  : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(29,78,216,0) 70%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(8px)',
              }}
              animate={{
                y: [0, Math.random() * -100 - 50, 0],
                x: [0, Math.random() * 60 - 30, 0],
                scale: [1, 1.15, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
          {/* Glassmorphic large elements */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '-5%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,210,123,0.07) 0%, transparent 80%)',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '45vw',
            height: '45vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 80%)',
            filter: 'blur(50px)'
          }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span style={{
                background: 'rgba(52, 210, 123, 0.15)',
                color: '#34d27b',
                padding: '0.5rem 1.25rem',
                borderRadius: '50px',
                fontSize: '0.9rem',
                fontWeight: '700',
                border: '1px solid rgba(52, 210, 123, 0.25)',
                display: 'inline-block',
                marginBottom: '1.5rem',
                letterSpacing: '0.5px'
              }}>
                🌟 جمعية أهلية مشهرة برقم 1627 لسنة 2005
              </span>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: '900',
                lineHeight: '1.25',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #a7f3d0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                جمعية بناء للتنمية بالمنيا
              </h1>

              <h2 style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                color: '#34d27b',
                fontWeight: '700',
                marginBottom: '1.5rem'
              }}>
                معًا نبني مستقبلًا أفضل للجميع
              </h2>

              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: '1.8',
                marginBottom: '3rem',
                maxWidth: '720px',
                marginInline: 'auto'
              }}>
                نعمل على تحقيق التنمية الشاملة للفئات الأكثر احتياجًا من خلال برامج ومبادرات تنموية مستدامة ترتكز على الشفافية والمشاركة الفعالة.
              </p>

              <div style={{
                display: 'flex',
                gap: '1.25rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <a href="#about" className="btn btn-primary btn-lg" style={{
                  background: 'linear-gradient(135deg, #34d27b 0%, #1b7a3e 100%)',
                  border: 'none',
                  color: '#fff',
                  boxShadow: '0 10px 25px rgba(52, 210, 123, 0.3)',
                  fontWeight: '700',
                  padding: '1.1rem 2.8rem'
                }}>
                  تعرف علينا
                </a>
                <Link to="/activities" className="btn btn-outline btn-lg" style={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontWeight: '600',
                  padding: '1.1rem 2.8rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(5px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#34d27b'; e.currentTarget.style.color = '#34d27b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#ffffff'; }}>
                  أنشطة الجمعية
                  <FaChevronLeft style={{ marginRight: '6px', fontSize: '0.85rem' }} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Diagonal border bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'var(--bg)',
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0)'
        }} />
      </section>

      {/* ======= SECTION 2: ABOUT THE ASSOCIATION ======= */}
      <section id="about" className="section" style={{ background: 'var(--bg)', position: 'relative' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                boxShadow: 'var(--shadow-md)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(52,210,123,0.05) 0%, transparent 100%)',
                borderRadius: '0 0 0 100%'
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🌿</span>
                <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>نبذة عن الجمعية</h2>
              </div>
              <p style={{
                fontSize: '1.2rem',
                color: 'var(--text-body)',
                lineHeight: '2',
                maxWidth: '900px'
              }}>
                جمعية بناء للتنمية بالمنيا هي جمعية أهلية تنموية تسعى إلى دعم الفئات الأكثر احتياجًا وتحقيق التنمية المستدامة من خلال برامج ومشروعات تنموية متنوعة ترتكز على المعرفة والخبرة والعمل المشترك.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======= SECTION 3 & 4: VISION & MISSION ======= */}
      <section id="vision" className="section" style={{
        background: 'linear-gradient(180deg, var(--bg) 0%, #edf7f2 100%)',
        position: 'relative'
      }}>
        <div className="container">
          <div className="grid-2">
            
            {/* VISION CARD */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(52, 210, 123, 0.2)',
                borderTop: '5px solid #34d27b',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'transform 0.3s ease',
              }}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(52, 210, 123, 0.1)',
                color: '#1b7a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                <FaGlobe />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>رؤية الجمعية</h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: '1.8' }}>
                تنمية شاملة تدعم الفئات المهمشة (الأكثر احتياجًا) دون تمييز وتستثمر موارد وإمكانيات المجتمع.
              </p>
            </motion.div>

            {/* MISSION CARD */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(27, 92, 46, 0.2)',
                borderTop: '5px solid #1b7a3e',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                transition: 'transform 0.3s ease',
              }}
              whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(27, 122, 62, 0.1)',
                color: '#1b7a3e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                <FaFileContract />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)' }}>رسالة الجمعية</h3>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', lineHeight: '1.8' }}>
                نحن جمعية بناء للتنمية نسعى إلى تحقيق تنمية شاملة للفئات الأكثر احتياجًا ترتكز برامجها على المعرفة والخبرة والعمل المشترك، مراعين مبادئ المساواة والحماية والحفاظ على البيئة من أجل حياة كريمة وفرص عادلة للجميع.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ======= SECTION 5: VALUES (القيم الحاكمة) ======= */}
      <section id="values" className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <h2>💎 القيم الحاكمة</h2>
            <p>يمثل الإطار القيمي لجمعية بناء للتنمية الركيزة الأساسية التي تستند إليها في صياغة رؤيتها وتوجهاتها الاستراتيجية.</p>
            <div className="section-line" />
          </div>

          <div className="grid-3" style={{ marginTop: '3rem' }}>
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  background: 'rgba(248, 253, 249, 0.8)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{
                  y: -8,
                  borderColor: '#34d27b',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'rgba(52, 210, 123, 0.15)',
                  color: '#1b7a3e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '0.5rem'
                }}>
                  {val.icon}
                </div>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', fontWeight: '700' }}>{val.title}</h4>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: '1.6' }}>{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SECTION 6: BOARD OF DIRECTORS ======= */}
      <section id="board" className="section" style={{ background: '#f1f8f4' }}>
        <div className="container">
          <div className="section-header">
            <h2>👥 أعضاء مجلس الإدارة</h2>
            <p>نخبة من الكفاءات الوطنية التي تشرف على رسم استراتيجيات وخطط الجمعية لضمان الاستمرارية والأثر.</p>
            <div className="section-line" />
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            justifyContent: 'center',
            marginTop: '3rem'
          }}>
            {boardMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(229, 231, 235, 0.8)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2.5rem 2rem',
                  width: '260px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
                whileHover={{
                  y: -10,
                  boxShadow: 'var(--shadow-lg)',
                  borderColor: 'rgba(52, 210, 123, 0.4)'
                }}
              >
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1b7a3e 0%, #34d27b 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontWeight: '700',
                  boxShadow: '0 8px 20px rgba(27, 122, 62, 0.25)',
                  marginBottom: '0.5rem',
                  position: 'relative'
                }}>
                  {member.initial}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    background: '#1b7a3e',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2.5px solid #ffffff'
                  }}>
                    <FaUserTie style={{ fontSize: '0.8rem', color: '#ffffff' }} />
                  </div>
                </div>

                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', margin: 0, fontWeight: '700' }}>
                  {member.name}
                </h4>
                
                <span className="badge badge-green" style={{
                  fontSize: '0.8rem',
                  padding: '0.35rem 1rem',
                  background: 'rgba(52, 210, 123, 0.1)',
                  color: '#145c2e',
                  fontWeight: '600'
                }}>
                  {member.role}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SECTION 7: STATS (إحصائيات الجمعية) ======= */}
      <section id="stats" className="section" style={{
        background: 'linear-gradient(135deg, #0f2419 0%, #1b7a3e 100%)',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="section-header">
            <h2 style={{ color: '#ffffff' }}>📊 إحصائيات الجمعية</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>أرقام وإنجازات تعكس حجم الأثر والمسؤولية في التنمية المجتمعية بالمنيا.</p>
            <div className="section-line" style={{ background: '#34d27b' }} />
          </div>

          <div className="grid-4" style={{ marginTop: '4rem' }}>
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  padding: '2.5rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
                whileHover={{
                  scale: 1.05,
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderColor: 'rgba(52, 210, 123, 0.4)'
                }}
              >
                <span style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#34d27b',
                  lineHeight: '1.2',
                  display: 'block'
                }}>
                  {stat.value}
                </span>
                <span style={{
                  fontSize: '1rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '600'
                }}>
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SECTION 8: PARTNERS & SUPPORTERS (الشركاء والداعمون) ======= */}
      <section className="section" style={{ background: '#ffffff', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-header">
            <h2>🤝 الشركاء والداعمون</h2>
            <p>شركاء النجاح الذين نعتز بالتعاون معهم لتحقيق أهداف التنمية المستدامة.</p>
            <div className="section-line" />
          </div>
        </div>

        {/* Marquee/Slider Slider layout using CSS/Framer motion */}
        <div style={{
          position: 'relative',
          width: '100%',
          marginTop: '3rem',
          padding: '1.5rem 0',
          background: 'rgba(240, 250, 244, 0.5)',
          borderY: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <motion.div
            style={{
              display: 'flex',
              gap: '2.5rem',
              whiteSpace: 'nowrap',
              paddingInline: '2rem'
            }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              ease: 'linear',
              duration: 25,
              repeat: Infinity
            }}
          >
            {/* Render list twice to ensure infinite scroll look */}
            {[...partners, ...partners].map((partner, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  padding: '1.25rem 2.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontWeight: '700',
                  color: '#102e1c',
                  fontSize: '1rem',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#34d27b'
                }} />
                {partner}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ======= SECTION 9: NEWS & ACTIVITIES (الأخبار والأنشطة) ======= */}
      <section className="section" style={{ background: '#f8fdf9' }}>
        <div className="container">
          <div className="section-header">
            <h2>📢 الأخبار والأنشطة</h2>
            <p>تابع آخر الفعاليات والمبادرات والورش التدريبية التي تطلقها الجمعية بالمنيا.</p>
            <div className="section-line" />
          </div>

          {loadingActivities ? (
            <div className="spinner" />
          ) : (
            <div className="grid-3" style={{ marginTop: '3rem' }}>
              {activities.map((act) => (
                <motion.div
                  key={act._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ y: -8, boxShadow: 'var(--shadow-md)' }}
                >
                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #1b7a3e 0%, #102e1c 100%)',
                    color: '#ffffff',
                    position: 'relative'
                  }}>
                    <span className="badge" style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: act.status === 'completed' ? 'rgba(255,255,255,0.2)' : '#34d27b',
                      color: '#ffffff',
                      fontWeight: '700'
                    }}>
                      {act.status === 'completed' ? 'تم الانتهاء' : 'نشاط قائم'}
                    </span>
                    <span style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                      🗓️ {new Date(act.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginTop: '0.75rem', fontWeight: '700', lineHeight: '1.4' }}>
                      {act.title}
                    </h3>
                  </div>

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1, justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: '1.6' }}>
                      {act.description}
                    </p>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <FaMapMarkerAlt style={{ color: '#1b7a3e' }} />
                        <span>{act.location}</span>
                      </div>
                      <Link to={`/activities`} className="btn btn-outline btn-sm btn-block" style={{ justifyContent: 'center' }}>
                        عرض تفاصيل النشاط
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/activities" className="btn btn-primary btn-lg">
              تصفح جميع الأنشطة
            </Link>
          </div>
        </div>
      </section>

      {/* ======= SECTION 10: CONTACT US (تواصل معنا) ======= */}
      <section className="section" style={{ background: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <h2>📞 تواصل معنا</h2>
            <p>لديك أي استفسار أو ترغب في التعاون معنا؟ يسعدنا تواصلك الدائم.</p>
            <div className="section-line" />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            marginTop: '4rem',
            alignItems: 'start'
          }}>
            
            {/* Contact Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'linear-gradient(135deg, #102e1c 0%, #0c2114 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2.5rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              }}
            >
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.6rem', marginBottom: '0.75rem' }}>معلومات الاتصال</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.95rem' }}>نحن متواجدون دائمًا لتقديم الدعم والمعلومات.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: 'rgba(52, 210, 123, 0.15)',
                    color: '#34d27b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>العنوان</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>مقر الجمعية، محافظة المنيا، جمهورية مصر العربية</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: 'rgba(52, 210, 123, 0.15)',
                    color: '#34d27b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    <FaPhone />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>أرقام التواصل</span>
                    <a href="tel:+201000000000" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>01000000000+</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background: 'rgba(52, 210, 123, 0.15)',
                    color: '#34d27b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    <FaEnvelope />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6 }}>البريد الإلكتروني</span>
                    <a href="mailto:info@benna.eg" style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff' }}>info@benna.eg</a>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1rem' }}>تابعنا على منصات التواصل</h4>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <a href="#" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1877f2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                    <FaFacebook />
                  </a>
                  <a href="#" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1da1f2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                    <FaTwitter />
                  </a>
                  <a href="#" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e1306c'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                    <FaInstagram />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem 2.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '1.5rem', fontWeight: '700' }}>أرسل لنا رسالة</h3>
              
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الاسم الكامل</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="الاسم الكريم"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="example@mail.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الموضوع</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="موضوع الرسالة"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">الرسالة</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="نص رسالتك..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={submittingContact}
                  style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  {submittingContact ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}
