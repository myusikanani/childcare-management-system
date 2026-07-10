// File Path: src/routes/AppRoutes.jsx
// Description: Updated routing with new auth flow for all 3 roles


import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CaretakerSignup from '../pages/CaretakerSignup';
import Signup from '../pages/Signup';

/* ── Lazy load pages ── */
const Home               = lazy(() => import('../pages/Home'));
const Login              = lazy(() => import('../pages/Login'));
const ParentSignup       = lazy(() => import('../pages/ParentSignup'));
// CaretakerSignup is loaded eagerly to avoid chunk load errors
const AdminSignup        = lazy(() => import('../pages/AdminSignup'));
const ParentDashboard    = lazy(() => import('../components/dashboard/ParentDashboard'));
const CaretakerDashboard = lazy(() => import('../components/dashboard/CaretakerDashboard'));
const AdminDashboard     = lazy(() => import('../components/dashboard/AdminDashboard'));
const Reports           = lazy(() => import('../pages/Reports'));
const Training           = lazy(() => import('../pages/Training'));
const ChildInformation   = lazy(() => import('../pages/ChildInformation'));
const NannyList          = lazy(() => import('../pages/NannyList'));
const NannyProfile       = lazy(() => import('../pages/NannyProfile')); // FIX 10: NannyDetails.jsx deprecated, use NannyProfile
const BookingCalendar    = lazy(() => import('../pages/BookingCalendar')); // FIX 4 & 5: was missing
const Payment            = lazy(() => import('../pages/Payment'));
const Payments           = lazy(() => import('../pages/Payments'));       // FIX 2 & 6: replaces PaymentHistory, adds /payments
const Messages           = lazy(() => import('../pages/Messages'));        // FIX 1: was MessagingSystem
const Learning           = lazy(() => import('../pages/Learning'));
const About              = lazy(() => import('../pages/About'));

// FIX 7: Reviews page — lazy import (create a simple one if it doesn't exist)
const Reviews            = lazy(() => import('../pages/Reviews').catch(() => ({ default: PlaceholderPage('⭐', 'Reviews', 'Rate your nanny sessions') })));
// FIX 8: Notifications page
const Notifications      = lazy(() => import('../pages/Notifications').catch(() => ({ default: PlaceholderPage('🔔', 'Notifications', 'Your latest updates and alerts') })));
// FIX 9: Profile edit page
const ProfileEdit        = lazy(() => import('../pages/ProfileEdit').catch(() => ({ default: PlaceholderPage('👤', 'Edit Profile', 'Update your account details') })));
// Questions page for parents
const Questions          = lazy(() => import('../pages/Questions'));
// Course detail page
const CourseDetail       = lazy(() => import('../pages/CourseDetail'));

/* ── Placeholder for pages not yet created ── */
function PlaceholderPage(icon, title, subtitle) {
  return function Page() {
    return (
      <div style={{ minHeight:'100vh', background:'#F0F7FF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", flexDirection:'column', gap:'12px' }}>
        <span style={{ fontSize:'4rem' }}>{icon}</span>
        <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'#1A237E', margin:0 }}>{title}</h1>
        <p style={{ color:'#90A4AE', fontWeight:700, fontSize:'0.95rem', margin:0 }}>{subtitle}</p>
        <p style={{ color:'#B0BEC5', fontSize:'0.82rem', fontWeight:600 }}>🚧 This page is coming soon</p>
        <a href="javascript:history.back()" style={{ background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', padding:'11px 28px', borderRadius:'999px', textDecoration:'none', fontWeight:800, fontSize:'0.9rem', marginTop:'8px' }}>
          ← Go Back
        </a>
      </div>
    );
  };
}

/* ── Loading Spinner ── */
const PageLoader = () => (
  <div style={loader.page}>
    <div style={loader.box}>
      <span style={loader.emoji}>👶</span>
      <div style={loader.bar}><div style={loader.barFill} /></div>
      <p style={loader.text}>Loading...</p>
    </div>
  </div>
);
const loader = {
  page:    { minHeight:'100vh', background:'#F0F7FF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif" },
  box:     { textAlign:'center', padding:'48px 40px', background:'white', borderRadius:'24px', boxShadow:'0 8px 32px rgba(26,35,126,0.1)' },
  emoji:   { fontSize:'3rem', display:'block', marginBottom:'16px', animation:'bounce 1s ease-in-out infinite' },
  bar:     { width:'200px', height:'6px', background:'#E3F2FD', borderRadius:'999px', overflow:'hidden', margin:'0 auto 12px' },
  barFill: { height:'100%', background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', borderRadius:'999px', animation:'loading 1.4s ease-in-out infinite' },
  text:    { color:'#90A4AE', fontWeight:700, fontSize:'0.9rem', margin:0 },
};

/* ── Protected Route — must be logged in ── */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dashPaths = { user:'/parent-dashboard', caretaker:'/caretaker-dashboard', admin:'/admin-dashboard' };
    return <Navigate to={dashPaths[user?.role] || '/'} replace />;
  }
  return children;
};

/* ── Public Route — redirect to dashboard if already logged in ── */
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) {
    const dashPaths = { user:'/parent-dashboard', caretaker:'/caretaker-dashboard', admin:'/admin-dashboard' };
    return <Navigate to={dashPaths[user?.role] || '/'} replace />;
  }
  return children;
};

/* ══════════════════════════════════════
   MAIN ROUTES
══════════════════════════════════════ */
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* ── Public ── */}
      <Route path="/"      element={<Home />} />
      <Route path="/about" element={<About />} />

      {/* ── Auth (redirect if logged in) ── */}
      <Route path="/login"             element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup"            element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/signup/parent"     element={<PublicRoute><ParentSignup /></PublicRoute>} />
      <Route path="/signup/caretaker"  element={<PublicRoute><CaretakerSignup /></PublicRoute>} />
      <Route path="/signup/admin"      element={<PublicRoute><AdminSignup /></PublicRoute>} />

      {/* ── Parent only ── */}
      <Route path="/parent-dashboard"  element={<ProtectedRoute allowedRoles={['user']}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/child-information" element={<ProtectedRoute allowedRoles={['user']}><ChildInformation /></ProtectedRoute>} />
      <Route path="/booking-calendar"  element={<ProtectedRoute allowedRoles={['user']}><BookingCalendar /></ProtectedRoute>} />
      <Route path="/booking"           element={<ProtectedRoute allowedRoles={['user']}><BookingCalendar /></ProtectedRoute>} />
      <Route path="/questions"         element={<ProtectedRoute allowedRoles={['user']}><Questions /></ProtectedRoute>} />
      <Route path="/payments"          element={<ProtectedRoute allowedRoles={['user','caretaker','admin']}><Payments /></ProtectedRoute>} />
      <Route path="/payment"           element={<ProtectedRoute allowedRoles={['user']}><Payment /></ProtectedRoute>} />
      <Route path="/payment-history"   element={<Navigate to="/payments" replace />} />

      {/* ── Caretaker only ── */}
      <Route path="/caretaker-dashboard" element={<ProtectedRoute allowedRoles={['caretaker']}><CaretakerDashboard /></ProtectedRoute>} />
      <Route path="/training"            element={<ProtectedRoute allowedRoles={['caretaker']}><Training /></ProtectedRoute>} />

      {/* ── Admin only ── */}
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />

      {/* ── All logged-in roles ── */}
      <Route path="/messages"       element={<ProtectedRoute allowedRoles={['user','caretaker','admin']}><Messages /></ProtectedRoute>} />
      <Route path="/reviews"        element={<ProtectedRoute allowedRoles={['user','caretaker','admin']}><Reviews /></ProtectedRoute>} />
      <Route path="/notifications"  element={<ProtectedRoute allowedRoles={['user','caretaker','admin']}><Notifications /></ProtectedRoute>} />
      <Route path="/profile/edit"   element={<ProtectedRoute allowedRoles={['user','caretaker','admin']}><ProfileEdit /></ProtectedRoute>} />
      <Route path="/profile"        element={<Navigate to="/profile/edit" replace />} />

      {/* ── Semi-public (accessible without login) ── */}
      <Route path="/nannies"   element={<NannyList />} />
      <Route path="/nanny/:id" element={<NannyProfile />} />
      <Route path="/learning"  element={<Learning />} />
      <Route path="/course/:courseId" element={<CourseDetail />} />

      {/* ── 404 ── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  </Suspense>
);

/* ── 404 Page ── */
const NotFound = () => (
  <div style={{ minHeight:'100vh', background:'#F0F7FF', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Nunito',sans-serif", flexDirection:'column', gap:'16px' }}>
    <span style={{ fontSize:'5rem' }}>🌸</span>
    <h1 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'3rem', color:'#1A237E', margin:0 }}>404</h1>
    <p style={{ color:'#90A4AE', fontWeight:700, fontSize:'1rem', margin:0 }}>Oops! Page not found.</p>
    <a href="/" style={{ background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', padding:'12px 28px', borderRadius:'999px', textDecoration:'none', fontWeight:800, fontSize:'0.95rem', boxShadow:'0 4px 14px rgba(79,195,247,0.35)' }}>
      Go Home
    </a>
  </div>
);

if (!document.getElementById('loader-kf')) {
  const t = document.createElement('style');
  t.id = 'loader-kf';
  t.innerHTML = `
    @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes loading { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  `;
  document.head.appendChild(t);
}

export default AppRoutes;