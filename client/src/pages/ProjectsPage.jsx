import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import SEO from '../components/SEO';
import VolunteerModal from '../components/VolunteerModal';
import {
  FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEye, FaHandsHelping,
  FaCheckCircle, FaClock, FaPause, FaLightbulb
} from 'react-icons/fa';

const STATUS_LABELS = {
  planning:  { label: 'تحت التخطيط', cls: 'badge-blue',   icon: <FaLightbulb /> },
  active:    { label: 'جارٍ التنفيذ', cls: 'badge-green',  icon: <FaClock /> },
  completed: { label: 'مكتمل',        cls: 'badge-gray',   icon: <FaCheckCircle /> },
  suspended: { label: 'متوقف',        cls: 'badge-red',    icon: <FaPause /> },
};

function ProjectCard({ project, onVolunteer, onViewDetails }) {
  const { i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const status = STATUS_LABELS[project.status] || STATUS_LABELS.active;

  const getLocalized = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'en' && field.en ? field.en : field.ar;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: 'linear-gradient(135deg, #1b7a3e, #34d27b)' }}>
        {project.mainImage && !imgError ? (
          <img
            src={project.mainImage}
            alt={project.title}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '4rem', opacity: 0.4 }}>🌿</div>
        )}
        {/* Overlay badge */}
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span className={`badge ${status.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
            {status.icon} {status.label}
          </span>
        </div>
        {/* Type badge */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <span className={`badge ${project.type === 'current' ? 'badge-green' : 'badge-gray'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
            {project.type === 'current' ? 'حالي' : 'سابق'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
          {getLocalized(project.title)}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.7, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {getLocalized(project.description)}
        </p>

        {/* Meta info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 'auto' }}>
          {project.startDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <FaCalendarAlt style={{ color: '#1b7a3e' }} />
              {new Date(project.startDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
            </span>
          )}
          {project.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <FaMapMarkerAlt style={{ color: '#1b7a3e' }} />
              {project.location}
            </span>
          )}
          {project.beneficiaries > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <FaUsers style={{ color: '#1b7a3e' }} />
              {project.beneficiaries.toLocaleString('ar-EG')} مستفيد
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => onViewDetails(project)}
            className="btn btn-outline btn-sm"
            style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FaEye /> عرض التفاصيل
          </button>
          {project.type === 'current' && (
            <button
              onClick={() => onVolunteer(project)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FaHandsHelping /> تطوع معنا
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectDetailModal({ project, onClose, onVolunteer }) {
  const { i18n } = useTranslation();
  const [imgError, setImgError] = useState(false);
  if (!project) return null;

  const getLocalized = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'en' && field.en ? field.en : field.ar;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9 }}
          style={{
            background: '#fff', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 720, maxHeight: '90vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 30px 80px rgba(0,0,0,0.25)', overflow: 'hidden'
          }}
        >
          {/* Header image */}
          <div style={{ position: 'relative', height: '240px', background: 'linear-gradient(135deg, #102e1c, #1b7a3e)', flexShrink: 0 }}>
            {project.mainImage && !imgError ? (
              <img src={project.mainImage} alt={project.title} onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '5rem', opacity: 0.3 }}>🌿</div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
            <button onClick={onClose}
              style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
              ✕
            </button>
            <div style={{ position: 'absolute', bottom: '1rem', right: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{getLocalized(project.title)}</h2>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <span className={`badge ${STATUS_LABELS[project.status]?.cls || 'badge-gray'}`}>
                {STATUS_LABELS[project.status]?.label}
              </span>
              <span className={`badge ${project.type === 'current' ? 'badge-green' : 'badge-gray'}`}>
                {project.type === 'current' ? '🟢 مشروع حالي' : '⚪ مشروع سابق'}
              </span>
            </div>

            <p style={{ fontSize: '1rem', color: 'var(--text-body)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              {getLocalized(project.description)}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {project.startDate && (
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>تاريخ البداية</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                    {new Date(project.startDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              {project.endDate && (
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>تاريخ الانتهاء</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                    {new Date(project.endDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
              {project.location && (
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>الموقع</p>
                  <p style={{ fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>{project.location}</p>
                </div>
              )}
              {project.beneficiaries > 0 && (
                <div style={{ background: '#f8fdf9', borderRadius: 'var(--radius)', padding: '1rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.3rem' }}>عدد المستفيدين</p>
                  <p style={{ fontWeight: 700, color: '#1b7a3e', margin: 0 }}>{project.beneficiaries.toLocaleString('ar-EG')}</p>
                </div>
              )}
            </div>

            {/* Additional images */}
            {project.images?.length > 1 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.75rem', fontSize: '1rem' }}>صور المشروع</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                  {project.images.slice(1).map((img, i) => (
                    <img key={i} src={img} alt={`صورة ${i + 2}`}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {project.type === 'current' && (
            <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border)', background: '#f9fdf9', flexShrink: 0, display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { onClose(); onVolunteer(project); }} className="btn btn-primary btn-block" style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaHandsHelping /> تطوع في هذا المشروع
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('current');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [volunteerProject, setVolunteerProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/projects?type=${activeTab}`);
      setProjects(data.data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'current', label: '🟢 المشروعات الحالية' },
    { key: 'past',    label: '⚪ المشروعات السابقة' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fdf9' }}>
      <SEO
        title="مشروعات الجمعية"
        description="تعرف على مشروعات جمعية بناء للتنمية بالمنيا الحالية والسابقة وكيف يمكنك المشاركة في التغيير."
        canonicalUrl="https://benaa-for-all.org/projects"
      />

      {/* Page Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2419 0%, #1b7a3e 100%)',
        color: '#fff', padding: '5rem 1rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(circle at 20% 50%, #34d27b 0%, transparent 50%), radial-gradient(circle at 80% 50%, #34d27b 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ background: 'rgba(52,210,123,0.2)', color: '#34d27b', padding: '0.4rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(52,210,123,0.3)', display: 'inline-block', marginBottom: '1rem' }}>
              🌱 Benaa For All Foundation
            </span>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 1rem', lineHeight: 1.2 }}>
              مشروعات الجمعية
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 600, margin: '0 auto' }}>
              نُنجز مشروعات تنموية مستدامة تخدم الفئات الأكثر احتياجاً في محافظة المنيا
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div className="container" style={{ display: 'flex', gap: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '1.1rem 2rem',
                fontWeight: 700, fontSize: '0.95rem',
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? '3px solid #1b7a3e' : '3px solid transparent',
                color: activeTab === tab.key ? '#1b7a3e' : 'var(--text-muted)',
                transition: 'all 0.25s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container section">
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 'var(--radius-lg)', height: 380, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🌿</div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
              {activeTab === 'current' ? 'لا توجد مشروعات حالية' : 'لا توجد مشروعات سابقة'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>سيتم إضافة المشروعات قريباً</p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {projects.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <ProjectCard
                  project={p}
                  onVolunteer={setVolunteerProject}
                  onViewDetails={setSelectedProject}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onVolunteer={p => { setSelectedProject(null); setVolunteerProject(p); }}
        />
      )}

      {/* Volunteer Modal */}
      {volunteerProject && (
        <VolunteerModal
          project={volunteerProject}
          onClose={() => setVolunteerProject(null)}
        />
      )}
    </div>
  );
}
