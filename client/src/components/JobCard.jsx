import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaBriefcase, FaClock } from 'react-icons/fa';

const TYPE_LABELS = {
  fulltime: { ar: 'دوام كامل', en: 'Full Time', color: '#1d4ed8', bg: '#eff6ff' },
  parttime: { ar: 'دوام جزئي', en: 'Part Time', color: '#7c3aed', bg: '#f5f3ff' },
  volunteer: { ar: 'تطوع', en: 'Volunteer', color: '#059669', bg: '#ecfdf5' },
  remote: { ar: 'عن بُعد', en: 'Remote', color: '#d97706', bg: '#fffbeb' },
};

export default function JobCard({ job }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const typeInfo = TYPE_LABELS[job.type] || TYPE_LABELS.fulltime;

  return (
    <div className="card job-card">
      <div className="job-card-body">
        <div className="job-card-header">
          <span className="badge job-type-badge" style={{ background: typeInfo.bg, color: typeInfo.color }}>
            {typeInfo[lang] || typeInfo.ar}
          </span>
          {job.salary && <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>💰 {job.salary}</span>}
        </div>
        <h3>{job.title}</h3>
        <div className="job-meta">
          <span><FaMapMarkerAlt /> {job.location}</span>
          {job.deadline && <span><FaClock /> {new Date(job.deadline).toLocaleDateString('ar-EG')}</span>}
          <span><FaBriefcase /> {job.applicantCount || 0} متقدم</span>
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.75rem 0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {job.description}
        </p>
        <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
          عرض التفاصيل ←
        </Link>
      </div>
    </div>
  );
}
