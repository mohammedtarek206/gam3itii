import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  FaHeart, FaBell, FaBars, FaTimes, FaUser, FaSignOutAlt,
  FaTachometerAlt, FaCog, FaChevronDown
} from 'react-icons/fa';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch { }
  };

  const toggleLang = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.body.classList.toggle('ltr', newLang === 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/cases', label: t('nav.cases') },
    { to: '/campaigns', label: t('nav.campaigns') },
    { to: '/activities', label: 'الأنشطة' },
    { to: '/jobs', label: t('nav.jobs') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            🌿 جمعيتي
          </Link>

          <div className="navbar-links">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            <button className="lang-toggle" onClick={toggleLang}>
              {i18n.language === 'ar' ? 'EN' : 'ع'}
            </button>

            {user && (
              <div className="notif-bell-wrap" ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  style={{ background: 'none', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'var(--text-body)', fontSize: '1.1rem' }}
                >
                  <FaBell />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>الإشعارات</span>
                      {unreadCount > 0 && (
                        <button onClick={async () => { await api.put('/notifications/read-all'); fetchNotifications(); }} style={{ fontSize: '0.78rem', color: 'var(--primary)', background: 'none' }}>
                          تحديد الكل كمقروء
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد إشعارات</div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div key={n._id} className={`notif-item${!n.read ? ' unread' : ''}`}>
                          <h5>{n.title}</h5>
                          <p>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--secondary)', border: '2px solid var(--accent-light)', borderRadius: 'var(--radius)', padding: '0.4rem 0.85rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary)' }}
                >
                  <FaUser /> {user.name.split(' ')[0]} <FaChevronDown style={{ fontSize: '0.7rem' }} />
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', insetInlineEnd: 0, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', minWidth: 180, zIndex: 200, overflow: 'hidden' }}>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-body)', borderBottom: '1px solid var(--border)' }}>
                      <FaTachometerAlt /> لوحتي الشخصية
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--text-body)', borderBottom: '1px solid var(--border)' }}>
                        <FaCog /> لوحة التحكم
                      </Link>
                    )}
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1rem', fontSize: '0.9rem', color: 'var(--danger)', background: 'none', width: '100%', textAlign: 'inherit' }}>
                      <FaSignOutAlt /> تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
              </>
            )}

            <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <><div className="hamburger-line" /><div className="hamburger-line" /><div className="hamburger-line" /></>}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', color: 'var(--text-body)', fontWeight: 500 }}>
            {l.label}
          </NavLink>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {!user ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>{t('nav.register')}</Link>
            </>
          ) : (
            <button className="btn btn-danger btn-sm" onClick={handleLogout} style={{ flex: 1 }}>تسجيل الخروج</button>
          )}
        </div>
      </div>
    </>
  );
}

