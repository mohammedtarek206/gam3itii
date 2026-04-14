import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { FaMapMarkerAlt, FaBriefcase, FaArrowLeft, FaCheckCircle, FaTasks } from 'react-icons/fa';

const TYPE_LABELS = { fulltime: 'دوام كامل', parttime: 'دوام جزئي', volunteer: 'تطوع', remote: 'عن بُعد' };

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => setJob(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" style={{ marginTop: '5rem' }} />;
  if (!job) return <div style={{ textAlign: 'center', padding: '5rem' }}>الوظيفة غير موجودة</div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="container">
          <h1>💼 {job.title}</h1>
          <p>{TYPE_LABELS[job.type]} • {job.location}</p>
        </div>
      </div>

      <div className="container section-sm">
        <Link to="/jobs" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
          <FaArrowLeft /> العودة للوظائف
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          <div>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>📌 عن الوظيفة</h3>
              <p style={{ lineHeight: 1.8, color: 'var(--text-body)' }}>{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCheckCircle style={{ color: 'var(--primary)' }} /> المتطلبات
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {job.requirements.map((r, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.93rem' }}>
                      <span style={{ color: 'var(--primary)', marginTop: '0.1rem', flexShrink: 0 }}>✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.tasks?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaTasks style={{ color: 'var(--primary)' }} /> المهام والمسؤوليات
                </h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {job.tasks.map((task, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.93rem' }}>
                      <span style={{ color: 'var(--accent)', marginTop: '0.1rem', flexShrink: 0 }}>◆</span> {task}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.75rem', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>معلومات الوظيفة</h3>
              {[
                { label: 'النوع', value: TYPE_LABELS[job.type], icon: '💼' },
                { label: 'الموقع', value: job.location, icon: '📍' },
                { label: 'الراتب', value: job.salary || 'غير محدد', icon: '💰' },
                { label: 'عدد المتقدمين', value: `${job.applicantCount || 0} متقدم`, icon: '👥' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.label}</p>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to={`/jobs/${id}/apply`} className="btn btn-primary btn-block btn-lg">
              📋 التقديم الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
