import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingDonateBtn from './components/FloatingDonateBtn';

import HomePage from './pages/HomePage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import CampaignsPage from './pages/CampaignsPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import JobApplyPage from './pages/JobApplyPage';
import ContactPage from './pages/ContactPage';
import ActivitiesPage from './pages/ActivitiesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';

// Protected route wrappers
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '10rem' }} />;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '10rem' }} />;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

// Layout with Navbar + Footer
const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
    <FloatingDonateBtn />
  </>
);

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontFamily: 'Tajawal, sans-serif', fontSize: '0.95rem', padding: '0.85rem 1.25rem' } }} />
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/cases" element={<Layout><CasesPage /></Layout>} />
        <Route path="/cases/:id" element={<Layout><CaseDetailPage /></Layout>} />
        <Route path="/campaigns" element={<Layout><CampaignsPage /></Layout>} />
        <Route path="/jobs" element={<Layout><JobsPage /></Layout>} />
        <Route path="/jobs/:id" element={<Layout><JobDetailPage /></Layout>} />
        <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
        <Route path="/activities" element={<Layout><ActivitiesPage /></Layout>} />

        {/* Job apply - requires auth */}
        <Route path="/jobs/:id/apply" element={<Layout><ProtectedRoute><JobApplyPage /></ProtectedRoute></Layout>} />

        {/* Auth pages - no footer/layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User dashboard */}
        <Route path="/dashboard" element={<Layout><ProtectedRoute><DashboardPage /></ProtectedRoute></Layout>} />

        {/* Admin - no public layout */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<Layout><div style={{ textAlign: 'center', padding: '8rem 1rem' }}><h1 style={{ fontSize: '5rem' }}>404</h1><h2>الصفحة غير موجودة</h2></div></Layout>} />
      </Routes>
    </>
  );
}
