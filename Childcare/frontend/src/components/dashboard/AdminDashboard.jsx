// File Path: src/components/dashboard/AdminDashboard.jsx
// Updated: All pages connected — Messages, Payments, Notifications, Profile Edit
// Added: Real PDF and CSV export functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, bookingsAPI, notificationsAPI, authAPI, settingsAPI, twoFAAPI, adminCourseAPI } from '../../services/api';
import { generateInvoicePDF, exportToCSV } from '../../utils/exportUtils';

/* ── Animated Counter ── */
const AnimatedNumber = ({ target, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
};

/* ── Setting Row Component ── */
const SettingRow = ({ icon, title, desc, checked, onChange, type = 'checkbox', value, suffix, prefix, options }) => {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', background:'#F8FAFC', borderRadius:'12px' }}>
      <div style={{ flex:1, display:'flex', gap:'12px', alignItems:'center' }}>
        <span style={{ fontSize:'1.5rem' }}>{icon}</span>
        <div>
          <p style={{ fontWeight:700, color:'#1A237E', margin:'0 0 2px', fontSize:'0.9rem' }}>{title}</p>
          <p style={{ fontSize:'0.78rem', color:'#90A4AE', margin:0 }}>{desc}</p>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {prefix && <span style={{ color:'#90A4AE', fontWeight:600 }}>{prefix}</span>}
        {type === 'checkbox' ? (
          <label style={{ position:'relative', display:'inline-block', width:'48px', height:'26px', cursor:'pointer' }}>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity:0, width:0, height:0 }} />
            <span style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background: checked ? 'linear-gradient(135deg,#43C6AC,#00C853)' : '#CBD5E1', borderRadius:'13px', transition:'0.3s' }}>
              <span style={{ position:'absolute', top:'2px', left: checked ? '24px' : '2px', width:'22px', height:'22px', background:'white', borderRadius:'50%', transition:'0.3s', boxShadow:'0 2px 4px rgba(0,0,0,0.2)' }}/>
            </span>
          </label>
        ) : type === 'select' ? (
          <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            style={{ padding:'8px 12px', borderRadius:'8px', border:'2px solid #E3F2FD', fontSize:'0.85rem', fontWeight:600, color:'#1A237E', cursor:'pointer' }}
          >
            {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            style={{ width:type==='text' ? '140px' : '70px', padding:'8px 10px', borderRadius:'8px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontWeight:700, textAlign:'center', color:'#1A237E' }}
          />
        )}
        {suffix && !prefix && <span style={{ color:'#90A4AE', fontSize:'0.8rem', fontWeight:600 }}>{suffix}</span>}
      </div>
    </div>
  );
};

/* ── Mini Bar Chart ── */
const MiniBar = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'60px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
          <div style={{ width:'100%', background:color, height:`${(d.value/max)*52}px`, borderRadius:'4px 4px 0 0', opacity:0.85, transition:`height 1s cubic-bezier(0.34,1.56,0.64,1) ${i*0.07}s` }} />
          <span style={{ fontSize:'0.65rem', color:'#90A4AE', fontWeight:700 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Donut Chart ── */
const DonutChart = ({ segments }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  return (
    <svg width="110" height="110" viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F7FF" strokeWidth="14" />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const gap  = circ - dash;
        const rotate = offset * 360 - 90;
        offset += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotate} ${cx} ${cy})`}
            style={{ transition:`stroke-dasharray 1s ease ${i*0.2}s` }}
          />
        );
      })}
      <text x="50" y="54" textAnchor="middle" style={{ fontSize:'13px', fontWeight:800, fill:'#1A237E', fontFamily:"'Fredoka One',cursive" }}>
        {total}
      </text>
    </svg>
  );
};

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab,     setActiveTab]     = useState('overview');
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [showNotif,     setShowNotif]     = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [userFilter,    setUserFilter]    = useState('All');
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [toast,         setToast]         = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    caretakerRequirePhoto: true,
    caretakerRequireCertification: false,
    caretakerMinExperience: 0,
    platformCommission: 10,
    minimumPayout: 500,
    currency: 'INR',
    currencySymbol: '₹',
    cancellationHoursBefore: 24,
    allowCancellation: true,
    refundPercentage: 100,
    adminSecretCode: 'ADMIN2024',
    sessionTimeout: 60,
    require2FA: false,
    maintenanceMode: false,
    emailAlerts: true,
    lowBalanceAlert: true,
    lowBalanceThreshold: 10000,
    paymentGateway: 'razorpay',
  });
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Course management state
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title:'', banner:'📚', color:'#059669', background:'#E8F5E9', category:'development', description:'', duration:'1h', xpReward:50 });
  const [managingCourse, setManagingCourse] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonIdx, setEditingLessonIdx] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title:'', duration:5, videoUrl:'', content:'', tip:'' });

  const stats = {
    totalUsers: allUsers.length,
    parents: allUsers.filter(u => u.role === 'user').length,
    caretakers: allUsers.filter(u => u.role === 'caretaker').length,
    pendingApproval: allUsers.filter(u => u.role === 'caretaker' && !u.isVerified && !u.isRejected).length,
    totalBookings: allBookings.length,
    activeBookings: allBookings.filter(b => b.status === 'Confirmed' || b.status === 'confirmed').length,
    revenue: allBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
    pendingBookings: allBookings.filter(b => b.status === 'Pending' || b.status === 'pending').length,
  };

  // Calculate chart data from real bookings
  const getWeeklyBookings = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    const weekTotal = { bookings: 0, revenue: 0 };
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check both booking date and createdAt
      const dayBookings = allBookings.filter(b => {
        const bookingDate = b.date || (b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '');
        return bookingDate === dateStr;
      });
      
      const count = dayBookings.length;
      const revenue = dayBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      weekData.push({ label: days[date.getDay()], value: count });
      weekTotal.bookings += count;
      weekTotal.revenue += revenue;
    }
    return { data: weekData, total: weekTotal };
  };

  const getMonthlyRevenue = () => {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const monthData = [];
    const now = new Date();
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthLabel = monthNames[date.getMonth()];
      const revenue = allBookings
        .filter(b => b.date && b.date.startsWith(monthStr))
        .reduce((sum, b) => sum + (b.amount || 0), 0);
      monthData.push({ label: monthLabel, value: revenue });
    }
    return monthData;
  };

  const weeklyData = getWeeklyBookings();
  const weeklyBookings = weeklyData.data;
  const monthlyRevenue = getMonthlyRevenue();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, bookingsData, notificationsData] = await Promise.all([
          usersAPI.getAllUsers(),
          bookingsAPI.getAll(),
          notificationsAPI.getAll(),
        ]);

        // Transform users
        const transformedUsers = (usersData.users || []).map(u => {
          let status = 'Active';
          if (u.role === 'caretaker') {
            if (u.isRejected) status = 'Rejected';
            else if (!u.isVerified) status = 'Pending';
            else status = 'Active';
          } else {
            status = 'Active';
          }
          return {
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            status,
            isVerified: u.isVerified || false,
            isRejected: u.isRejected || false,
            joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
            children: 0,
            bookings: 0,
            rating: u.rating || 0,
            sessions: 0,
            hourlyRate: u.hourlyRate || 0,
            avatar: u.avatar || '',
          };
        });
        setAllUsers(transformedUsers);

        // Check which caretakers have active bookings (for "Working" status)
        const bookings = bookingsData.bookings || [];
        const caretakerBookingCounts = {};
        bookings
          .filter(b => ['pending', 'confirmed'].includes(b.status?.toLowerCase()))
          .forEach(b => {
            const caretakId = b.caretaker?._id || b.caretaker;
            caretakerBookingCounts[caretakId] = (caretakerBookingCounts[caretakId] || 0) + 1;
          });
        
        // Update caretakers with active bookings to "Working" status
        setAllUsers(prev => prev.map(u => {
          if (u.role === 'caretaker' && caretakerBookingCounts[u.id]) {
            return { ...u, status: 'Working', activeBookings: caretakerBookingCounts[u.id] };
          }
          return u;
        }));

        // Transform bookings
        const formatDate = (dateStr) => {
          if (!dateStr) return '';
          if (typeof dateStr === 'string' && dateStr.includes('T')) {
            return dateStr.split('T')[0];
          }
          if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            return dateStr.substring(0, 10);
          }
          return new Date(dateStr).toISOString().split('T')[0];
        };

        const transformedBookings = (bookingsData.bookings || []).map(b => ({
          id: b._id,
          parent: b.parentName || b.parent?.fullName || 'Parent',
          caretaker: b.caretakerName || b.caretaker?.fullName || 'Caretaker',
          child: b.childName || 'Child',
          date: formatDate(b.date),
          createdAt: b.createdAt,
          amount: b.totalAmount || b.amount || 0,
          totalAmount: b.totalAmount || b.amount || 0,
          status: capitalizeStatus(b.status),
          paymentStatus: b.paymentStatus || b.status || 'pending',
          paymentMethod: b.paymentMethod || 'cash',
          createdAt: b.createdAt,
          paidAt: b.paidAt,
        }));
        setAllBookings(transformedBookings);

        // Transform notifications
        const transformedNotifications = (notificationsData.notifications || []).slice(0, 10).map((n, i) => ({
          id: n._id || i,
          text: n.message || n.text || 'New notification',
          time: formatTimeAgo(n.createdAt),
          icon: getNotificationIcon(n.type),
          read: n.isRead || false,
        }));

        setNotifications(transformedNotifications);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setAllUsers([]);
        setAllBookings([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        if (res.settings) {
          setSettings(prev => ({
            ...prev,
            caretakerRequirePhoto: res.settings.caretakerRequirePhoto ?? true,
            caretakerRequireCertification: res.settings.caretakerRequireCertification ?? false,
            caretakerMinExperience: res.settings.caretakerMinExperience ?? 0,
            platformCommission: res.settings.platformCommission ?? 10,
            minimumPayout: res.settings.minimumPayout ?? 500,
            currency: res.settings.currency ?? 'INR',
            currencySymbol: res.settings.currencySymbol ?? '₹',
            cancellationHoursBefore: res.settings.cancellationHoursBefore ?? 24,
            allowCancellation: res.settings.allowCancellation ?? true,
            refundPercentage: res.settings.refundPercentage ?? 100,
            adminSecretCode: res.settings.adminSecretCode ?? 'ADMIN2024',
            sessionTimeout: res.settings.sessionTimeout ?? 60,
            require2FA: res.settings.require2FA ?? false,
            maintenanceMode: res.settings.maintenanceMode ?? false,
            emailAlerts: res.settings.emailAlerts ?? true,
            lowBalanceAlert: res.settings.lowBalanceAlert ?? true,
            lowBalanceThreshold: res.settings.lowBalanceThreshold ?? 10000,
            paymentGateway: res.settings.paymentGateway ?? 'razorpay',
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();

    // Fetch 2FA status
    const fetch2FAStatus = async () => {
      try {
        const res = await twoFAAPI.getStatus();
        setIs2FAEnabled(res.is2FAEnabled);
      } catch (err) {
        console.log('2FA status check failed');
      }
    };
    fetch2FAStatus();
  }, []);

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = await settingsAPI.updateSettings(settings);
      if (res.success) {
        showToast('Settings saved successfully!');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  // ── Course Management Functions ──
  const fetchCourses = async () => {
    setCourseLoading(true);
    try {
      const res = await adminCourseAPI.getCourses();
      if (res.success) setCourses(res.courses);
    } catch (err) { console.error(err); }
    setCourseLoading(false);
  };

  useEffect(() => { if (activeTab === 'courses') fetchCourses(); }, [activeTab]);

  const handleSaveCourse = async () => {
    try {
      if (editingCourse) {
        await adminCourseAPI.updateCourse(editingCourse._id, courseForm);
        showToast('Course updated!');
      } else {
        await adminCourseAPI.createCourse(courseForm);
        showToast('Course created!');
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseForm({ title:'', banner:'📚', color:'#059669', background:'#E8F5E9', category:'development', description:'', duration:'1h', xpReward:50 });
      fetchCourses();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await adminCourseAPI.deleteCourse(id);
      showToast('Course deleted');
      fetchCourses();
      if (managingCourse?._id === id) setManagingCourse(null);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleCourseActive = async (course) => {
    try {
      await adminCourseAPI.updateCourse(course._id, { isActive: !course.isActive });
      showToast(course.isActive ? 'Course deactivated' : 'Course activated');
      fetchCourses();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleSaveLesson = async () => {
    try {
      if (editingLessonIdx !== null) {
        await adminCourseAPI.updateLesson(managingCourse._id, editingLessonIdx, lessonForm);
        showToast('Lesson updated!');
      } else {
        await adminCourseAPI.addLesson(managingCourse._id, lessonForm);
        showToast('Lesson added!');
      }
      setShowLessonForm(false);
      setEditingLessonIdx(null);
      setLessonForm({ title:'', duration:5, videoUrl:'', content:'', tip:'' });
      const res = await adminCourseAPI.getCourse(managingCourse._id);
      if (res.success) { setManagingCourse(res.course); fetchCourses(); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDeleteLesson = async (idx) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await adminCourseAPI.deleteLesson(managingCourse._id, idx);
      showToast('Lesson deleted');
      const res = await adminCourseAPI.getCourse(managingCourse._id);
      if (res.success) { setManagingCourse(res.course); fetchCourses(); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  // Backup database
  const handleBackup = async () => {
    try {
      showToast('📦 Generating backup...', 'info');
      const res = await settingsAPI.backupDatabase();
      if (res.backup) {
        const blob = new Blob([JSON.stringify(res.backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chidcare_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✅ Backup downloaded successfully!');
      }
    } catch (error) {
      showToast('❌ Backup failed', 'error');
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    if (!window.confirm('Clear application cache?')) return;
    try {
      await settingsAPI.clearCache();
      showToast('✅ Cache cleared successfully!');
    } catch (error) {
      showToast('❌ Failed to clear cache', 'error');
    }
  };

  const capitalizeStatus = (status) => {
    if (!status) return 'Pending';
    const statusMap = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return statusMap[status?.toLowerCase?.()] || status;
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'booking_request': '📅',
      'booking_confirmed': '✅',
      'booking_cancelled': '❌',
      'booking_completed': '🎉',
      'payment_received': '💰',
      'refund_requested': '💸',
      'review_received': '⭐',
      'message': '💬',
      'system': '🔔',
      'alert': '⚠️',
      'training': '🎓',
      'profile_incomplete': '📝',
      'user': '👤',
    };
    return iconMap[type] || '🔔';
  };

  const unread = notifications.filter(n => !n.read).length;

  const showToast = (msg, type='success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // Delete user permanently
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      showToast(`🗑️ Deleting ${userName}...`, 'info');
      await authAPI.deleteUser(userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      showToast(`✅ ${userName} has been permanently deleted`);
    } catch (err) {
      showToast(`❌ Failed to delete ${userName}`, 'error');
    }
  };

  // Approve caretaker
  const handleApproveCaretaker = async (caretakerId, caretakerName) => {
    try {
      showToast(`✅ Approving ${caretakerName}...`, 'info');
      await authAPI.verifyCaretaker(caretakerId);
      setAllUsers(prev => prev.map(u => 
        u.id === caretakerId ? { ...u, isVerified: true, status: 'Active' } : u
      ));
      showToast(`✅ ${caretakerName} has been approved!`);
    } catch (err) {
      showToast(`❌ Failed to approve ${caretakerName}`, 'error');
    }
  };

  // Reject caretaker
  const handleRejectCaretaker = async (caretakerId, caretakerName) => {
    if (!window.confirm(`Are you sure you want to reject "${caretakerName}"?`)) {
      return;
    }
    try {
      showToast(`❌ Rejecting ${caretakerName}...`, 'info');
      await authAPI.rejectCaretaker(caretakerId);
      setAllUsers(prev => prev.map(u => 
        u.id === caretakerId ? { ...u, isRejected: true } : u
      ));
      showToast(`❌ ${caretakerName} has been rejected`);
    } catch (err) {
      showToast(`❌ Failed to reject ${caretakerName}`, 'error');
    }
  };

  // Export handlers for admin - use allBookings state
  const handleExportReport = async () => {
    try {
      if (allBookings.length === 0) {
        showToast('No booking data to export', 'error');
        return;
      }
      showToast('📊 Generating CSV report...', 'info');
      exportToCSV(allBookings.map(b => ({ booking: b })), `chidcare_admin_report_${new Date().toISOString().split('T')[0]}`);
      showToast('✅ CSV Report downloaded!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('❌ Export failed', 'error');
    }
  };

  const handleDownloadReport = async () => {
    try {
      if (allBookings.length === 0) {
        showToast('No booking data to export', 'error');
        return;
      }
      showToast('📥 Generating PDF report...', 'info');
      generateInvoicePDF(allBookings[0], user, 'admin');
      showToast('✅ PDF Report downloaded!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('❌ PDF generation failed', 'error');
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const roleMatch = userFilter === 'All' || 
      (userFilter === 'Parent' && u.role === 'user') ||
      (userFilter === 'Caretaker' && u.role === 'caretaker') ||
      (userFilter === 'Admin' && u.role === 'admin') ||
      u.role === userFilter;
    const statusMatch = ['Pending', 'Active', 'Working', 'Rejected'].includes(userFilter) ? u.status === userFilter : true;
    const matchFilter = userFilter === 'All' ? true : (roleMatch || statusMatch);
    return matchSearch && matchFilter;
  });

  const statusColor = {
    Confirmed: { bg:'#E3F2FD', color:'#1565C0' },
    Pending:   { bg:'#FFF8E1', color:'#F57F17' },
    Completed: { bg:'#E8F5E9', color:'#2E7D32' },
    Cancelled: { bg:'#FFEBEE', color:'#C62828' },
    Active:    { bg:'#E8F5E9', color:'#2E7D32' },
    Working:   { bg:'#EDE7F6', color:'#7C3AED' },
    Inactive:  { bg:'#F5F5F5', color:'#757575' },
    Rejected:  { bg:'#FFEBEE', color:'#C62828' },
    confirmed: { bg:'#E3F2FD', color:'#1565C0' },
    pending:   { bg:'#FFF8E1', color:'#F57F17' },
    completed: { bg:'#E8F5E9', color:'#2E7D32' },
    cancelled: { bg:'#FFEBEE', color:'#C62828' },
  };

  // ── Sidebar nav ──
  const sidebarMain = [
    { icon:'📊', label:'Overview',       tab:'overview' },
    { icon:'👥', label:'User Management',tab:'users'    },
    { icon:'📅', label:'Bookings',       tab:'bookings' },
    { icon:'💰', label:'Revenue',        tab:'revenue'  },
    { icon:'📚', label:'Courses',         tab:'courses'  },
    { icon:'⚙️', label:'Settings',       tab:'settings' },
  ];

  const sidebarMore = [
    { icon:'💬', label:'Messages',      action:() => navigate('/messages')      },
    { icon:'💳', label:'Payments',      action:() => navigate('/payments')      },
    { icon:'🔔', label:'Notifications', action:() => navigate('/notifications') },
    { icon:'👤', label:'Edit Profile',  action:() => navigate('/profile/edit')  },
    { icon:'📊', label:'Reports',      action:() => navigate('/admin/reports')  },
  ];

  return (
    <div style={s.page}>
      <div style={s.blob1}/><div style={s.blob2}/><div style={s.blob3}/>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type==='success' ? 'linear-gradient(135deg,#43C6AC,#4FC3F7)' : 'linear-gradient(135deg,#FF5252,#FF1744)' }}>
          {toast.type==='success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div style={s.modalOverlay} onClick={() => setShowUserModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalAvatar}>{selectedUser.name?.[0] || '?'}</div>
              <div>
                <h2 style={s.modalName}>{selectedUser.name}</h2>
                <p style={s.modalEmail}>{selectedUser.email}</p>
              </div>
              <button style={s.modalClose} onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div style={s.modalBody}>
              {[
                { label:'Role',    value:selectedUser.role   },
                { label:'Status',  value:selectedUser.status },
                { label:'Joined',  value:selectedUser.joined },
                selectedUser.role==='Parent'
                  ? { label:'Children', value:selectedUser.children }
                  : { label:'Sessions', value:selectedUser.sessions },
                selectedUser.role==='Parent'
                  ? { label:'Bookings', value:selectedUser.bookings }
                  : { label:'Rating',   value:selectedUser.rating || 'N/A' },
              ].map((item, i) => (
                <div key={i} style={s.modalRow}>
                  <span style={s.modalLabel}>{item.label}</span>
                  <span style={s.modalValue}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={s.modalFooter}>
              {selectedUser.status === 'Pending' && (
                <>
                  <button style={s.btnApprove} onClick={() => { handleApproveCaretaker(selectedUser.id, selectedUser.name); setShowUserModal(false); }}>✅ Approve</button>
                  <button style={s.btnDanger} onClick={() => { handleRejectCaretaker(selectedUser.id, selectedUser.name); setShowUserModal(false); }}>❌ Reject</button>
                </>
              )}
              {!selectedUser.status === 'Pending' && (
                <button style={s.btnMsg} onClick={() => { setShowUserModal(false); navigate('/messages'); }}>💬 Message</button>
              )}
              <button style={s.btnOutline} onClick={() => setShowUserModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ NAVBAR ════ */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div style={s.brand}>
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height:'32px', width:'auto' }} />
            <span style={s.brandText}>Trusted Care <span style={s.adminBadge}>Admin</span></span>
          </div>
        </div>

        <div style={s.navCenter}>
          <div style={s.searchBox}>
            <span style={{ fontSize:'1rem', color:'rgba(255,255,255,0.5)' }}>🔍</span>
            <input style={s.searchInput} placeholder="Search users, bookings..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div style={s.navRight}>
          {/* Messages quick link */}
          <button style={s.iconBtn} onClick={() => navigate('/messages')} title="Messages">💬</button>
          <div
            onClick={() => navigate('/profile/edit')}
            title={is2FAEnabled ? "2FA Protected" : "Enable 2FA for extra security"}
            style={{
              padding: '6px 10px',
              borderRadius: '20px',
              background: is2FAEnabled ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,#F59E0B,#EF4444)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {is2FAEnabled ? '🛡️ 2FA' : '⚠️ 2FA'}
          </div>

          {/* Notifications bell */}
          <div style={{ position:'relative' }}>
            <button style={s.iconBtn} onClick={() => setShowNotif(o => !o)}>
              🔔 {unread > 0 && <span style={s.badge}>{unread}</span>}
            </button>
            {showNotif && (
              <div style={s.notifPanel}>
                <div style={s.notifHead}>
                  <strong>Notifications</strong>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={s.notifCount}>{unread} new</span>
                    <button
                      style={{ background:'none', border:'none', color:'#4FC3F7', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:F }}
                      onClick={() => { setShowNotif(false); navigate('/notifications'); }}
                    >View All →</button>
                  </div>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{ ...s.notifItem, background:n.read?'transparent':'rgba(79,195,247,0.07)' }}>
                    <span style={{ fontSize:'1.2rem' }}>{n.icon}</span>
                    <div><p style={s.notifText}>{n.text}</p><span style={s.notifTime}>{n.time}</span></div>
                    {!n.read && <span style={s.notifDot}/>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar → profile */}
          <div style={{ ...s.avatarCircle, cursor:'pointer' }} onClick={() => navigate('/profile/edit')} title="Edit Profile">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={s.layout}>
        {/* ════ SIDEBAR ════ */}
        <aside style={{ ...s.sidebar, width:sidebarOpen?'240px':'0', overflow:'hidden' }}>
          <div style={s.sideInner}>

            <p style={s.sideLabel}>DASHBOARD</p>
            {sidebarMain.map(item => (
              <button key={item.tab}
                style={{ ...s.sideBtn, ...(activeTab===item.tab ? s.sideBtnActive : {}) }}
                onClick={() => setActiveTab(item.tab)}>
                <span>{item.icon}</span><span>{item.label}</span>
                {activeTab===item.tab && <span style={s.sideBar}/>}
              </button>
            ))}

            <p style={{ ...s.sideLabel, marginTop:'20px' }}>FEATURES</p>
            {sidebarMore.map((item, i) => (
              <button key={i} style={s.sideBtn} onClick={item.action}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}

            <div style={s.profileCard}>
              <div style={{ ...s.profileAvatar, cursor:'pointer' }} onClick={() => navigate('/profile/edit')}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={s.profileName}>{user?.name}</p>
                <p style={s.profileRole}>Administrator</p>
              </div>
              <button style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.9rem' }}
                onClick={() => navigate('/profile/edit')} title="Edit Profile">✏️</button>
            </div>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main style={s.main}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>Admin Overview</h1>
                  <p style={s.subtitle}>Tuesday, February 24, 2026 — Full system status</p>
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <button style={s.btnSecondary} onClick={() => navigate('/messages')}>💬 Messages</button>
                  <button style={s.btnPrimary}   onClick={() => setActiveTab('users')}>👥 Manage Users</button>
                </div>
              </div>

              {/* Stat Cards */}
              <div style={s.statsGrid}>
                {[
                  { icon:'👥',    label:'Total Users',       value:stats.totalUsers,      color:'#4FC3F7', bg:'linear-gradient(135deg,#E3F2FD,#F0F7FF)' },
                  { icon:'👨‍👩‍👧', label:'Parents',           value:stats.parents,          color:'#43A047', bg:'linear-gradient(135deg,#E8F5E9,#F1F8E9)' },
                  { icon:'👩‍🍼',  label:'Caretakers',         value:stats.caretakers,       color:'#FB8C00', bg:'linear-gradient(135deg,#FFF8E1,#FFFDE7)' },
                  { icon:'⏳',    label:'Pending Approval',  value:stats.pendingApproval,  color:'#E53935', bg:'linear-gradient(135deg,#FFEBEE,#FCE4EC)' },
                  { icon:'📅',    label:'Total Bookings',    value:stats.totalBookings,    color:'#8E24AA', bg:'linear-gradient(135deg,#F3E5F5,#EDE7F6)' },
                  { icon:'✅',    label:'Active Bookings',   value:stats.activeBookings,   color:'#00897B', bg:'linear-gradient(135deg,#E0F2F1,#E8F5E9)' },
                  { icon:'💰',    label:'Revenue (₹)',        value:stats.revenue,          color:'#1565C0', bg:'linear-gradient(135deg,#E3F2FD,#EDE7F6)' },
                  { icon:'🔔',    label:'Pending Bookings',  value:stats.pendingBookings,  color:'#F57F17', bg:'linear-gradient(135deg,#FFF8E1,#FFF3E0)' },
                ].map((stat, i) => (
                  <div key={i} style={{ ...s.statCard, background:stat.bg, animationDelay:`${i*0.07}s` }}>
                    <div style={s.statTop}>
                      <span style={s.statIcon}>{stat.icon}</span>
                      <span style={{ ...s.statValue, color:stat.color }}><AnimatedNumber target={stat.value}/></span>
                    </div>
                    <p style={s.statLabel}>{stat.label}</p>
                    <div style={s.statPulse}/>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={s.chartsRow}>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>📊 Weekly Bookings</h3>
                  <MiniBar data={weeklyBookings} color="#4FC3F7"/>
                  <p style={s.chartNote}>
                    This week — <strong>{weeklyData.total.bookings}</strong> bookings | 
                    ₹<strong>{weeklyData.total.revenue.toLocaleString()}</strong> revenue
                  </p>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>👥 User Breakdown</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:'20px', marginTop:'8px' }}>
                    <DonutChart segments={[
                      { value:stats.parents,         color:'#4FC3F7' },
                      { value:stats.caretakers,      color:'#69F0AE' },
                      { value:stats.pendingApproval, color:'#FFD54F' },
                    ]}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {[
                        { label:'Parents',    val:stats.parents,         color:'#4FC3F7' },
                        { label:'Caretakers', val:stats.caretakers,      color:'#69F0AE' },
                        { label:'Pending',    val:stats.pendingApproval, color:'#FFD54F' },
                      ].map((seg, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:seg.color, flexShrink:0 }}/>
                          <span style={{ fontSize:'0.82rem', color:'#90A4AE', fontWeight:600 }}>{seg.label}: <strong style={{ color:'#1A237E' }}>{seg.val}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={s.chartCard}>
                  <h3 style={s.chartTitle}>💰 Monthly Revenue (₹)</h3>
                  <MiniBar data={monthlyRevenue.map(m => ({ ...m, value:m.value/1000 }))} color="#CE93D8"/>
                  <p style={s.chartNote}>Values in thousands (₹k)</p>
                </div>
              </div>

              {/* Pending approval alert */}
              {stats.pendingApproval > 0 && (
                <div style={s.alertCard}>
                  <span style={s.alertIcon}>⚠️</span>
                  <div style={{ flex:1 }}>
                    <p style={s.alertTitle}>{stats.pendingApproval} Caretaker{stats.pendingApproval>1?'s':''} Awaiting Approval</p>
                    <p style={s.alertSub}>Review and approve new caretaker registrations</p>
                  </div>
                  <button style={s.btnPrimary} onClick={() => setActiveTab('users')}>Review Now →</button>
                </div>
              )}

              {/* ── Quick Actions — all pages ── */}
              <div style={s.quickGrid}>
                {[
                  { icon:'👥', label:'Manage Users',   action:() => setActiveTab('users'),        grad:'linear-gradient(135deg,#1A237E,#3949AB)' },
                  { icon:'💬', label:'Messages',        action:() => navigate('/messages'),         grad:'linear-gradient(135deg,#4FC3F7,#43C6AC)' },
                  { icon:'💳', label:'Payments',        action:() => navigate('/payments'),         grad:'linear-gradient(135deg,#FFD54F,#FF8F00)' },
                  { icon:'🔔', label:'Notifications',   action:() => navigate('/notifications'),    grad:'linear-gradient(135deg,#F48FB1,#E91E63)' },
                  { icon:'📅', label:'All Bookings',    action:() => setActiveTab('bookings'),     grad:'linear-gradient(135deg,#CE93D8,#9C27B0)' },
                  { icon:'💰', label:'Revenue',         action:() => setActiveTab('revenue'),      grad:'linear-gradient(135deg,#69F0AE,#00C853)' },
                  { icon:'👤', label:'Edit Profile',    action:() => navigate('/profile/edit'),    grad:'linear-gradient(135deg,#B39DDB,#512DA8)' },
                  { icon:'📥', label:'Export Report',   action:handleExportReport, grad:'linear-gradient(135deg,#80CBC4,#00897B)' },
                ].map((q, i) => (
                  <button key={i} style={{ ...s.quickBtn, background:q.grad, animationDelay:`${i*0.06}s` }} onClick={q.action}>
                    <span style={s.quickIcon}>{q.icon}</span>
                    <span style={s.quickLabel}>{q.label}</span>
                  </button>
                ))}
              </div>

              {/* ── Feature shortcut cards ── */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginBottom:'24px' }}>
                {[
                  { icon:'💬', title:'Messages',      desc:'Chat with parents & caretakers', path:'/messages',      bg:'#E3F2FD', color:'#0288D1' },
                  { icon:'💳', title:'Payments',      desc:'Platform revenue & payouts',     path:'/payments',      bg:'#E8F5E9', color:'#2E7D32' },
                  { icon:'🔔', title:'Notifications', desc:'System alerts & updates',        path:'/notifications', bg:'#F3E5F5', color:'#8E24AA' },
                  { icon:'👤', title:'Edit Profile',  desc:'Update admin account details',   path:'/profile/edit',  bg:'#FFF8E1', color:'#F57F17' },
                ].map((item, i) => (
                  <div key={i}
                    style={{ background:'white', borderRadius:'18px', padding:'20px', border:'1px solid #E3F2FD', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 2px 10px rgba(26,35,126,0.05)' }}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(26,35,126,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 10px rgba(26,35,126,0.05)'; }}
                  >
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', marginBottom:'12px' }}>{item.icon}</div>
                    <div style={{ fontWeight:800, color:'#1A237E', fontSize:'0.9rem', marginBottom:'4px' }}>{item.title}</div>
                    <div style={{ color:'#90A4AE', fontSize:'0.78rem', fontWeight:600 }}>{item.desc}</div>
                    <div style={{ color:item.color, fontSize:'0.78rem', fontWeight:700, marginTop:'10px' }}>Open →</div>
                  </div>
                ))}
              </div>

              {/* Recent Bookings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>📋 Recent Bookings</h2>
                  <button style={s.btnOutline} onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                {allBookings.slice(0,4).map(b => <BookingRow key={b.id} b={b} statusColor={statusColor}/>)}
              </div>
            </div>
          )}

          {/* ── USER MANAGEMENT ── */}
          {activeTab === 'users' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>User Management</h1><p style={s.subtitle}>{filteredUsers.length} users found</p></div>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button style={s.btnSecondary} onClick={() => navigate('/messages')}>💬 Message Users</button>
                  <button style={s.btnPrimary} onClick={() => showToast('Export ready!')}>📥 Export CSV</button>
                </div>
              </div>

              <div style={s.filterBar}>
                <div style={s.searchBoxSmall}>
                  <span>🔍</span>
                  <input style={s.searchInputSmall} placeholder="Search users..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div style={s.filterPills}>
                  {['All','Parent','Caretaker','Pending','Active','Working','Rejected'].map(f => (
                    <button key={f} style={{ ...s.pill, ...(userFilter===f ? s.pillActive : {}) }}
                      onClick={() => setUserFilter(f)}>{f}</button>
                  ))}
                </div>
              </div>

              <div style={s.usersGrid}>
                {filteredUsers.map((u, i) => (
                  <div key={u.id} style={{ ...s.userCard, animationDelay:`${i*0.06}s` }}
                    onClick={() => { setSelectedUser(u); setShowUserModal(true); }}>
                    <div style={s.userCardTop}>
                      <div style={{ ...s.userAvatar, background:u.role==='Parent'?'linear-gradient(135deg,#4FC3F7,#43C6AC)':'linear-gradient(135deg,#CE93D8,#9C27B0)' }}>
                        {u.name?.[0] || '?'}
                      </div>
                      <span style={{ ...s.userStatusDot, background:u.status==='Active'?'#43A047':u.status==='Pending'?'#FB8C00':'#90A4AE' }}/>
                    </div>
                    <h3 style={s.userName}>{u.name}</h3>
                    <p style={s.userEmail}>{u.email}</p>
                    <div style={s.userMeta}>
                      <span style={{ ...s.roleBadge, background:u.role==='Parent'?'#E3F2FD':'#F3E5F5', color:u.role==='Parent'?'#1565C0':'#7B1FA2' }}>{u.role}</span>
                       <span style={{ ...s.statusBadge, background:(statusColor[u.status?.charAt(0).toUpperCase() + u.status?.slice(1)]||statusColor.Pending).bg, color:(statusColor[u.status?.charAt(0).toUpperCase() + u.status?.slice(1)]||statusColor.Pending).color }}>{u.status}</span>
                    </div>
                    <p style={s.userJoined}>Joined {u.joined}</p>
                    {u.status === 'Working' && u.activeBookings > 0 && (
                      <p style={{ fontSize:'0.75rem', color:'#7C3AED', fontWeight:700, margin:'4px 0 0' }}>
                        🔄 {u.activeBookings} active booking{u.activeBookings > 1 ? 's' : ''}
                      </p>
                    )}
                    <div style={{ display:'flex', gap:'6px', marginTop:'10px' }}>
                      {u.status === 'Pending' && (
                        <>
                          <button style={{ ...s.approveBtn, flex:1 }}
                            onClick={e => { e.stopPropagation(); handleApproveCaretaker(u.id, u.name); }}>
                            ✅ Approve
                          </button>
                          <button style={{ ...s.rejectBtn, flex:0 }}
                            onClick={e => { e.stopPropagation(); handleRejectCaretaker(u.id, u.name); }}
                            title="Reject">
                            ❌
                          </button>
                        </>
                      )}
                      <button style={{ ...s.msgBtn, flex: u.status==='Pending' ? '0 0 30px' : 1 }}
                        onClick={e => { e.stopPropagation(); navigate('/messages'); }}
                        title="Message">💬</button>
                      <button style={{ ...s.deleteBtn, flex: 0 }}
                        onClick={e => { e.stopPropagation(); handleDeleteUser(u.id, u.name); }}
                        title="Delete User">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === 'bookings' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>All Bookings</h1><p style={s.subtitle}>{allBookings.length} total bookings in the system</p></div>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button style={s.btnSecondary} onClick={() => navigate('/payments')}>💳 Payments Page</button>
                  <button style={s.btnPrimary} onClick={handleExportReport}>📥 Export CSV</button>
                </div>
              </div>

              <div style={s.summaryRow}>
                {[
                  { label:'Total',     val:allBookings.length, color:'#4FC3F7' },
                  { label:'Confirmed', val:allBookings.filter(b=>b.status?.toLowerCase()==='confirmed').length, color:'#1565C0' },
                  { label:'Pending',   val:allBookings.filter(b=>b.status?.toLowerCase()==='pending').length, color:'#F57F17' },
                  { label:'Completed', val:allBookings.filter(b=>b.status?.toLowerCase()==='completed').length, color:'#2E7D32' },
                  { label:'Cancelled', val:allBookings.filter(b=>b.status?.toLowerCase()==='cancelled').length, color:'#C62828' },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.summaryPill, borderTop:`3px solid ${item.color}` }}>
                    <span style={{ ...s.summaryVal, color:item.color }}>{item.val}</span>
                    <span style={s.summaryLabel}>{item.label}</span>
                  </div>
                ))}
              </div>

              <div style={s.sectionCard}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      {['#','Parent','Caretaker','Child','Date','Amount','Status','Action'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b, i) => {
                      const statusLower = b.status?.toLowerCase() || 'pending';
                      const sc = statusColor[statusLower.charAt(0).toUpperCase() + statusLower.slice(1)] || statusColor.Pending;
                      return (
                        <tr key={b.id} style={s.tr}>
                          <td style={s.td}><span style={s.rowNum}>{b.id}</span></td>
                          <td style={s.td}><span style={s.tdBold}>{b.parent}</span></td>
                          <td style={s.td}>{b.caretaker}</td>
                          <td style={s.td}>{b.child}</td>
                          <td style={s.td}>{b.date}</td>
                          <td style={{ ...s.td, fontWeight:700, color:'#2E7D32' }}>₹{b.amount}</td>
                          <td style={s.td}><span style={{ ...s.badge, background:sc.bg, color:sc.color }}>{b.status}</span></td>
                          <td style={s.td}>
                            <div style={{ display:'flex', gap:'6px' }}>
                              <button style={s.actionBtn} onClick={() => showToast(`Booking #${b.id} updated`)}>✏️</button>
                              <button style={{ ...s.actionBtn, background:'#E3F2FD' }} onClick={() => navigate('/messages')} title="Message">💬</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── REVENUE ── */}
          {activeTab === 'revenue' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>💰 Revenue Overview</h1><p style={s.subtitle}>Platform financial summary, commission tracking and payouts</p></div>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button style={s.btnSecondary} onClick={() => navigate('/payments')}>💳 Full Payments Page</button>
                  <button style={s.btnPrimary} onClick={handleDownloadReport}>📥 Download Report</button>
                </div>
              </div>

              <div style={s.revenueGrid}>
                {(() => {
                  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amount || b.totalAmount || 0), 0);
                  const thisMonth = new Date().toISOString().slice(0, 7);
                  const monthRevenue = allBookings
                    .filter(b => b.date && b.date.startsWith(thisMonth))
                    .reduce((sum, b) => sum + (b.amount || b.totalAmount || 0), 0);
                  const collected = allBookings
                    .filter(b => b.paymentStatus === 'paid')
                    .reduce((sum, b) => sum + (b.amount || b.totalAmount || 0), 0);
                  const pendingPayouts = allBookings
                    .filter(b => b.paymentStatus !== 'paid' && b.status === 'completed')
                    .reduce((sum, b) => sum + (b.amount || b.totalAmount || 0), 0);
                  const commission = totalRevenue * 0.10; // 10% platform commission
                  
                  return [
                    { icon:'💎', label:'Total Revenue',   value:totalRevenue, grad:'linear-gradient(135deg,#4FC3F7 0%,#43C6AC 100%)' },
                    { icon:'📈', label:'This Month',      value:monthRevenue, grad:'linear-gradient(135deg,#CE93D8 0%,#9C27B0 100%)' },
                    { icon:'🏛️', label:'Platform Commission', value:commission, grad:'linear-gradient(135deg,#FFD54F 0%,#FF8F00 100%)' },
                    { icon:'⏳', label:'Pending Payouts', value:pendingPayouts, grad:'linear-gradient(135deg,#69F0AE 0%,#00C853 100%)' },
                  ].map((card, i) => (
                    <div key={i} style={{ ...s.revCard, background:card.grad, animationDelay:`${i*0.1}s` }}>
                      <span style={s.revIcon}>{card.icon}</span>
                      <p style={s.revValue}>₹<AnimatedNumber target={Math.round(card.value)}/></p>
                      <p style={s.revLabel}>{card.label}</p>
                      <div style={s.revGlow}/>
                    </div>
                  ));
                })()}
              </div>

              {/* Platform Stats */}
              <div style={{ ...s.sectionCard, marginBottom:'20px', background:'linear-gradient(135deg,#F0F9FF,#E8F5E9)' }}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>📊 Platform Statistics</h2>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'16px' }}>
                  {(() => {
                    const confirmedBookings = allBookings.filter(b => b.status?.toLowerCase() === 'confirmed');
                    const completedBookings = allBookings.filter(b => b.status?.toLowerCase() === 'completed');
                    const cancelledBookings = allBookings.filter(b => b.status?.toLowerCase() === 'cancelled');
                    const pendingBookings = allBookings.filter(b => b.status?.toLowerCase() === 'pending');
                    const paidBookings = confirmedBookings.concat(completedBookings);
                    
                    const totalAmount = paidBookings.reduce((sum, b) => sum + (b.totalAmount || b.amount || 0), 0);
                    const avgTransaction = paidBookings.length > 0 ? totalAmount / paidBookings.length : 0;
                    const successRate = allBookings.length > 0 ? (paidBookings.length / allBookings.length * 100) : 0;
                    const refundedBookings = allBookings.filter(b => b.paymentStatus?.toLowerCase() === 'refunded' || b.refundRequested);
                    const refundRate = paidBookings.length > 0 ? (refundedBookings.length / paidBookings.length * 100) : 0;
                    
                    // Calculate avg time to payment (from booking creation to paid)
                    let avgTimeToPayment = 'N/A';
                    const bookingsWithPaymentTime = paidBookings.filter(b => b.paidAt && b.createdAt);
                    if (bookingsWithPaymentTime.length > 0) {
                      const totalHours = bookingsWithPaymentTime.reduce((sum, b) => {
                        const created = new Date(b.createdAt);
                        const paid = new Date(b.paidAt);
                        return sum + (paid - created) / (1000 * 60 * 60);
                      }, 0);
                      const avgHours = totalHours / bookingsWithPaymentTime.length;
                      avgTimeToPayment = avgHours < 1 ? `${Math.round(avgHours * 60)} min` : `${Math.round(avgHours)} hrs`;
                    }

                    return [
                      { label:'Total Bookings', value:allBookings.length, icon:'📅', color:'#4FC3F7' },
                      { label:'Confirmed', value:confirmedBookings.length, icon:'✅', color:'#2E7D32' },
                      { label:'Completed', value:completedBookings.length, icon:'🎉', color:'#1565C0' },
                      { label:'Cancelled', value:cancelledBookings.length, icon:'❌', color:'#C62828' },
                      { label:'Pending', value:pendingBookings.length, icon:'⏳', color:'#F57F17' },
                      { label:'Total Revenue', value:`₹${totalAmount.toLocaleString()}`, icon:'💰', color:'#7B1FA2' },
                      { label:'Avg Booking', value:`₹${Math.round(avgTransaction)}`, icon:'📊', color:'#00897B' },
                    ].map((stat, i) => (
                      <div key={i} style={{ textAlign:'center', padding:'12px', background:'white', borderRadius:'12px', borderLeft:`3px solid ${stat.color}` }}>
                        <span style={{ fontSize:'1.3rem' }}>{stat.icon}</span>
                        <p style={{ fontSize:'1.3rem', fontWeight:800, color:'#1A237E', margin:'4px 0' }}>{stat.value}</p>
                        <p style={{ fontSize:'0.72rem', color:'#90A4AE', fontWeight:600, margin:0 }}>{stat.label}</p>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ ...s.sectionCard, marginBottom:'20px' }}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>⚡ Quick Actions</h2>
                </div>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  <button style={{ ...s.btnPrimary }} onClick={() => showToast('Processing all caretaker payouts...')}>💸 Process All Payouts</button>
                  <button style={{ ...s.btnSecondary }} onClick={() => navigate('/payments')}>📊 Full Payment History</button>
                  <button style={{ ...s.btnOutline }} onClick={() => showToast('Monthly report generated!')}>📄 Generate Report</button>
                  <button style={{ ...s.btnOutline }} onClick={() => showToast('Refund requests: 0')}>💰 Manage Refunds</button>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div style={{ ...s.sectionCard, marginBottom:'20px', border:'2px solid #E3F2FD' }}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>💳 Payment Method Breakdown</h2>
                  <span style={{ fontSize:'0.78rem', color:'#90A4AE', fontWeight:600 }}>Based on paid transactions</span>
                </div>
                {(() => {
                  const paidBookings = allBookings.filter(b => b.paymentStatus === 'paid');
                  
                  const methodCounts = {};
                  const methodAmounts = {};
                  paidBookings.forEach(b => {
                    const rawMethod = b.paymentMethod || 'Unknown';
                    const method = rawMethod.charAt(0).toUpperCase() + rawMethod.slice(1);
                    methodCounts[method] = (methodCounts[method] || 0) + 1;
                    methodAmounts[method] = (methodAmounts[method] || 0) + (b.totalAmount || 0);
                  });
                  
                  const totalPaid = paidBookings.length;
                  
                  const methodIcons = {
                    'Upi': '💳', 'Card': '💰', 'Netbanking': '🏦', 'Wallet': '👛', 'Cash': '💵', 'Unknown': '❓',
                  };
                  
                  const methodColors = {
                    'Upi': '#4FC3F7', 'Card': '#7B1FA2', 'Netbanking': '#FF8F00', 'Wallet': '#2E7D32', 'Cash': '#C62828', 'Unknown': '#90A4AE',
                  };
                  
                  const methodNames = {
                    'Upi': 'UPI', 'Card': 'Card', 'Netbanking': 'Net Banking', 'Wallet': 'Wallet', 'Cash': 'Cash', 'Unknown': 'Unknown',
                  };
                  
                  const sortedMethods = Object.entries(methodCounts)
                    .map(([method, count]) => ({
                      method,
                      displayName: methodNames[method] || method,
                      count,
                      percentage: totalPaid > 0 ? (count / totalPaid * 100) : 0,
                      amount: methodAmounts[method] || 0,
                    }))
                    .sort((a, b) => b.count - a.count);
                  
                  const mostUsed = sortedMethods[0];
                  
                  return (
                    <>
                      {totalPaid === 0 ? (
                        <div style={{ textAlign:'center', padding:'40px', color:'#90A4AE' }}>
                          <p style={{ fontSize:'1.5rem', margin:'0 0 8px' }}>📭</p>
                          <p style={{ fontWeight:700, margin:0 }}>No paid transactions yet</p>
                        </div>
                      ) : (
                        <>
                          {mostUsed && (
                            <div style={{ 
                              background:`linear-gradient(135deg, ${methodColors[mostUsed.method] || '#4FC3F7'}15, ${methodColors[mostUsed.method] || '#4FC3F7'}08)`,
                              border:`2px solid ${methodColors[mostUsed.method] || '#4FC3F7'}30`,
                              borderRadius:'12px', padding:'12px 16px', marginBottom:'16px',
                              display:'flex', alignItems:'center', justifyContent:'space-between'
                            }}>
                              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                                <span style={{ fontSize:'2rem' }}>{methodIcons[mostUsed.method] || '💳'}</span>
                                <div>
                                  <p style={{ fontWeight:800, color:'#1A237E', margin:0, fontSize:'0.95rem' }}>Most Popular Method</p>
                                  <p style={{ color:'#90A4AE', margin:0, fontSize:'0.82rem' }}>{mostUsed.displayName} - {mostUsed.percentage.toFixed(1)}% of transactions</p>
                                </div>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <p style={{ fontWeight:800, color:methodColors[mostUsed.method] || '#4FC3F7', fontSize:'1.3rem', margin:0 }}>{mostUsed.count} txns</p>
                                <p style={{ color:'#90A4AE', margin:0, fontSize:'0.72rem' }}>₹{mostUsed.amount.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
                            {sortedMethods.map((item, i) => (
                              <div key={i} style={{ 
                                background:'white', borderRadius:'12px', padding:'16px',
                                border:`2px solid ${methodColors[item.method] || '#90A4AE'}30`,
                                textAlign:'center'
                              }}>
                                <span style={{ fontSize:'1.8rem' }}>{methodIcons[item.method] || '💳'}</span>
                                <p style={{ fontWeight:800, color:'#1A237E', margin:'8px 0 4px', fontSize:'0.95rem' }}>{item.displayName}</p>
                                <div style={{ background:`${methodColors[item.method] || '#90A4AE'}20`, borderRadius:'8px', padding:'4px 8px', display:'inline-block' }}>
                                  <span style={{ fontWeight:800, color:methodColors[item.method] || '#90A4AE', fontSize:'1.1rem' }}>{item.percentage.toFixed(0)}%</span>
                                </div>
                                <p style={{ fontSize:'0.78rem', color:'#90A4AE', margin:'8px 0 0' }}>{item.count} transactions</p>
                                <p style={{ fontWeight:700, color:'#2E7D32', fontSize:'0.88rem', margin:'4px 0 0' }}>₹{item.amount.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                          
                          {(methodCounts['Cash'] || 0) > 0 && (
                            <div style={{ background:'#FFF8E1', border:'2px solid #F57F17', borderRadius:'12px', padding:'12px 16px', marginTop:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
                              <span style={{ fontSize:'1.5rem' }}>⚠️</span>
                              <div style={{ flex:1 }}>
                                <p style={{ fontWeight:700, color:'#F57F17', margin:0, fontSize:'0.88rem' }}>Cash Transactions Detected</p>
                                <p style={{ color:'#90A4AE', margin:0, fontSize:'0.78rem' }}>{methodCounts['Cash'] || 0} cash transactions worth ₹{(methodAmounts['Cash'] || 0).toLocaleString()} - For compliance tracking</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
                <div style={s.sectionCard}>
                  <h2 style={s.sectionTitle}>📊 Revenue Trend</h2>
                  <MiniBar data={monthlyRevenue.map(m => ({ label:m.label, value:m.value/1000 }))} color="#4FC3F7"/>
                  <p style={{ color:'#90A4AE', fontSize:'0.82rem', marginTop:'8px', fontWeight:600 }}>Revenue in ₹ thousands</p>
                </div>

                <div style={s.sectionCard}>
                  <h2 style={s.sectionTitle}>📈 Commission Earned</h2>
                  <div style={{ textAlign:'center', padding:'20px' }}>
                    <p style={{ fontSize:'3rem', fontWeight:800, color:'#FF8F00', margin:'0' }}>₹{(allBookings.reduce((sum, b) => sum + (b.amount || b.totalAmount || 0), 0) * 0.10).toLocaleString()}</p>
                    <p style={{ color:'#90A4AE', fontSize:'0.88rem', margin:'8px 0 16px' }}>10% commission on all transactions</p>
                    <div style={{ background:'#F0F9FF', padding:'12px', borderRadius:'12px' }}>
                      <p style={{ fontSize:'0.82rem', color:'#90A4AE', margin:'0' }}>
                        <strong style={{ color:'#1A237E' }}>Revenue Share:</strong> Platform keeps 10%, Caretakers receive 90%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>👩‍🍼 Revenue by Caretaker</h2>
                  <button style={s.btnOutline} onClick={() => setActiveTab('users')}>View All Caretakers</button>
                </div>
                {(() => {
                  const caretakerEarnings = {};
                  allBookings.forEach(b => {
                    const caretakerName = typeof b.caretaker === 'object' ? b.caretaker?.name : (b.caretakerName || 'Unknown');
                    if (!caretakerEarnings[caretakerName]) {
                      caretakerEarnings[caretakerName] = { sessions: 0, earned: 0 };
                    }
                    caretakerEarnings[caretakerName].sessions += 1;
                    caretakerEarnings[caretakerName].earned += (b.amount || b.totalAmount || 0);
                  });
                  
                  const sorted = Object.entries(caretakerEarnings)
                    .map(([name, data]) => ({ name, ...data, net: data.earned * 0.90 }))
                    .sort((a, b) => b.earned - a.earned);
                  const maxEarned = sorted[0]?.earned || 1;
                  
                  return sorted.length > 0 ? sorted.slice(0, 5).map((c, i) => (
                    <div key={i} style={s.caretakerRow}>
                      <div style={s.caretakerAvatar}>{c.name?.[0] || '?'}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                          <span style={{ fontWeight:700, color:'#1A237E', fontSize:'0.93rem' }}>{c.name}</span>
                          <span style={{ fontWeight:800, color:'#2E7D32', fontSize:'0.93rem' }}>₹{c.earned.toLocaleString()}</span>
                        </div>
                        <div style={s.progressTrack}>
                          <div style={{ ...s.progressFill, width:`${(c.earned/maxEarned)*100}%`, animationDelay:`${i*0.2}s` }}/>
                        </div>
                        <span style={{ color:'#90A4AE', fontSize:'0.78rem', fontWeight:600 }}>{c.sessions} sessions • Net: ₹{c.net.toLocaleString()}</span>
                      </div>
                    </div>
                  )) : (
                    <p style={{ color:'#90A4AE', textAlign:'center', padding:'20px' }}>No earnings data yet</p>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── COURSES ── */}
          {activeTab === 'courses' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>📚 Course Management</h1><p style={s.subtitle}>Create and manage learning courses with video lessons</p></div>
                {!managingCourse && (
                  <button style={s.btnPrimary} onClick={() => { setEditingCourse(null); setCourseForm({ title:'', banner:'📚', color:'#059669', background:'#E8F5E9', category:'development', description:'', duration:'1h', xpReward:50 }); setShowCourseForm(true); }}>
                    + New Course
                  </button>
                )}
                {managingCourse && (
                  <button style={s.btnOutline} onClick={() => setManagingCourse(null)}>← Back to Courses</button>
                )}
              </div>

              {/* Course Form Modal */}
              {showCourseForm && (
                <div style={s.modalOverlay} onClick={() => setShowCourseForm(false)}>
                  <div style={{ ...s.modal, width:'520px' }} onClick={e => e.stopPropagation()}>
                    <div style={s.modalHeader}>
                      <span style={{ fontSize:'1.5rem' }}>{courseForm.banner}</span>
                      <h2 style={{ ...s.modalName, flex:1 }}>{editingCourse ? 'Edit Course' : 'New Course'}</h2>
                      <button style={s.modalClose} onClick={() => setShowCourseForm(false)}>✕</button>
                    </div>
                    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Title *</label>
                        <input value={courseForm.title} onChange={e => setCourseForm({...courseForm, title:e.target.value})} placeholder="Course title" style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit' }} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Banner Emoji</label>
                          <input value={courseForm.banner} onChange={e => setCourseForm({...courseForm, banner:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'1.2rem', textAlign:'center' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Category</label>
                          <select value={courseForm.category} onChange={e => setCourseForm({...courseForm, category:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit' }}>
                            <option value="development">Development</option>
                            <option value="play">Play</option>
                            <option value="nutrition">Nutrition</option>
                            <option value="emotional">Emotional</option>
                            <option value="health">Health</option>
                            <option value="education">Education</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Color</label>
                          <input type="color" value={courseForm.color} onChange={e => setCourseForm({...courseForm, color:e.target.value})} style={{ width:'100%', height:'40px', borderRadius:'10px', border:'2px solid #E3F2FD', cursor:'pointer' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Background</label>
                          <input type="color" value={courseForm.background} onChange={e => setCourseForm({...courseForm, background:e.target.value})} style={{ width:'100%', height:'40px', borderRadius:'10px', border:'2px solid #E3F2FD', cursor:'pointer' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Description</label>
                        <textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description:e.target.value})} placeholder="Course description..." rows={3} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit', resize:'vertical' }} />
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Duration</label>
                          <input value={courseForm.duration} onChange={e => setCourseForm({...courseForm, duration:e.target.value})} placeholder="e.g. 2h" style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>XP Reward</label>
                          <input type="number" value={courseForm.xpReward} onChange={e => setCourseForm({...courseForm, xpReward:parseInt(e.target.value)||0})} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem' }} />
                        </div>
                      </div>
                      <button style={{ ...s.btnPrimary, width:'100%', marginTop:8, padding:'14px' }} onClick={handleSaveCourse}>
                        {editingCourse ? 'Update Course' : 'Create Course'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson Form Modal */}
              {showLessonForm && (
                <div style={s.modalOverlay} onClick={() => setShowLessonForm(false)}>
                  <div style={{ ...s.modal, width:'560px' }} onClick={e => e.stopPropagation()}>
                    <div style={s.modalHeader}>
                      <span style={{ fontSize:'1.5rem' }}>📺</span>
                      <h2 style={{ ...s.modalName, flex:1 }}>{editingLessonIdx !== null ? 'Edit Lesson' : 'Add Lesson'}</h2>
                      <button style={s.modalClose} onClick={() => setShowLessonForm(false)}>✕</button>
                    </div>
                    <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'14px' }}>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Lesson Title *</label>
                        <input value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title:e.target.value})} placeholder="e.g. Introduction to the Course" style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Video URL</label>
                        <input value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl:e.target.value})} placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..." style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit' }} />
                        <p style={{ fontSize:'0.75rem', color:'#90A4AE', margin:'4px 0 0', fontWeight:600 }}>Paste a YouTube or Vimeo link. The video will be embedded automatically.</p>
                      </div>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Duration (minutes)</label>
                        <input type="number" value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration:parseInt(e.target.value)||0})} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Content (HTML)</label>
                        <textarea value={lessonForm.content} onChange={e => setLessonForm({...lessonForm, content:e.target.value})} placeholder="<h3>Lesson Title</h3><p>Lesson content here...</p>" rows={5} style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'monospace', resize:'vertical' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#1A237E', display:'block', marginBottom:4 }}>Tip (optional)</label>
                        <input value={lessonForm.tip} onChange={e => setLessonForm({...lessonForm, tip:e.target.value})} placeholder="A helpful tip for parents..." style={{ width:'100%', padding:'10px 14px', borderRadius:'10px', border:'2px solid #E3F2FD', fontSize:'0.9rem', fontFamily:'inherit' }} />
                      </div>
                      <button style={{ ...s.btnPrimary, width:'100%', marginTop:8, padding:'14px' }} onClick={handleSaveLesson}>
                        {editingLessonIdx !== null ? 'Update Lesson' : 'Add Lesson'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manage Lessons View */}
              {managingCourse ? (
                <div>
                  <div style={{ ...s.sectionCard, background:`linear-gradient(135deg, ${managingCourse.color}22, ${managingCourse.background})`, border:`2px solid ${managingCourse.color}44` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
                      <span style={{ fontSize:'2.5rem' }}>{managingCourse.banner}</span>
                      <div style={{ flex:1 }}>
                        <h2 style={{ ...s.sectionTitle, margin:0 }}>{managingCourse.title}</h2>
                        <p style={{ color:'#607D8B', fontSize:'0.85rem', margin:'4px 0 0' }}>{managingCourse.lessons?.length || 0} lessons • {managingCourse.duration} • {managingCourse.xpReward} XP</p>
                      </div>
                      <button style={s.btnPrimary} onClick={() => { setEditingLessonIdx(null); setLessonForm({ title:'', duration:5, videoUrl:'', content:'', tip:'' }); setShowLessonForm(true); }}>
                        + Add Lesson
                      </button>
                    </div>
                  </div>

                  {managingCourse.lessons?.length === 0 && (
                    <div style={{ textAlign:'center', padding:'48px', color:'#90A4AE' }}>
                      <p style={{ fontSize:'2.5rem', marginBottom:'12px' }}>📺</p>
                      <p style={{ fontWeight:700, fontSize:'1.1rem' }}>No lessons yet</p>
                      <p>Click "Add Lesson" to create the first lesson with a video.</p>
                    </div>
                  )}

                  {managingCourse.lessons?.map((lesson, idx) => (
                    <div key={idx} style={{ ...s.sectionCard, display:'flex', alignItems:'center', gap:'16px', marginBottom:'12px' }}>
                      <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,#1A237E,#3949AB)', color:'white', fontWeight:800, fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, color:'#1A237E', margin:'0 0 4px', fontSize:'0.95rem' }}>{lesson.title}</p>
                        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                          <span style={{ fontSize:'0.75rem', color:'#607D8B', fontWeight:600 }}>⏱ {lesson.duration} min</span>
                          {lesson.videoUrl && <span style={{ fontSize:'0.75rem', color:'#2E7D32', fontWeight:600 }}>📺 Video attached</span>}
                          {!lesson.videoUrl && <span style={{ fontSize:'0.75rem', color:'#F57F17', fontWeight:600 }}>⚠ No video</span>}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button style={{ ...s.btnOutline, padding:'6px 14px', fontSize:'0.8rem' }} onClick={() => {
                          setEditingLessonIdx(idx);
                          setLessonForm({ title:lesson.title, duration:lesson.duration, videoUrl:lesson.videoUrl||'', content:lesson.content||'', tip:lesson.tip||'' });
                          setShowLessonForm(true);
                        }}>Edit</button>
                        <button style={{ background:'rgba(239,68,68,0.1)', border:'1.5px solid #EF4444', color:'#EF4444', padding:'6px 14px', borderRadius:'999px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }} onClick={() => handleDeleteLesson(idx)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Course List */
                <div>
                  {courseLoading ? (
                    <div style={{ textAlign:'center', padding:'48px' }}>
                      <p style={{ color:'#90A4AE', fontWeight:700 }}>Loading courses...</p>
                    </div>
                  ) : courses.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'48px', color:'#90A4AE' }}>
                      <p style={{ fontSize:'3rem', marginBottom:'12px' }}>📚</p>
                      <p style={{ fontWeight:700, fontSize:'1.1rem' }}>No courses yet</p>
                      <p>Create your first course to get started.</p>
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'18px' }}>
                      {courses.map(course => (
                        <div key={course._id} style={{ background:'white', borderRadius:'20px', overflow:'hidden', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD', transition:'all 0.25s' }}>
                          <div style={{ background:`linear-gradient(135deg, ${course.color}, ${course.color}CC)`, padding:'24px', textAlign:'center' }}>
                            <span style={{ fontSize:'3rem' }}>{course.banner}</span>
                            <h3 style={{ color:'white', fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', margin:'8px 0 0' }}>{course.title}</h3>
                          </div>
                          <div style={{ padding:'18px' }}>
                            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
                              <span style={{ background:'#E3F2FD', color:'#1565C0', padding:'4px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 }}>{course.category}</span>
                              <span style={{ background:'#E8F5E9', color:'#2E7D32', padding:'4px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 }}>{course.lessons?.length || 0} lessons</span>
                              <span style={{ background: course.isActive ? '#E8F5E9' : '#FFEBEE', color: course.isActive ? '#2E7D32' : '#C62828', padding:'4px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 }}>{course.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            <p style={{ fontSize:'0.82rem', color:'#607D8B', margin:'0 0 14px', lineHeight:1.5 }}>{course.description?.substring(0, 100)}{course.description?.length > 100 ? '...' : ''}</p>
                            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                              <button style={{ ...s.btnPrimary, padding:'8px 16px', fontSize:'0.82rem' }} onClick={() => setManagingCourse(course)}>Manage Lessons</button>
                              <button style={{ ...s.btnOutline, padding:'6px 14px', fontSize:'0.8rem' }} onClick={() => {
                                setEditingCourse(course);
                                setCourseForm({ title:course.title, banner:course.banner, color:course.color, background:course.background, category:course.category, description:course.description, duration:course.duration, xpReward:course.xpReward });
                                setShowCourseForm(true);
                              }}>Edit</button>
                              <button style={{ ...s.btnOutline, padding:'6px 14px', fontSize:'0.8rem' }} onClick={() => handleToggleCourseActive(course)}>
                                {course.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button style={{ background:'rgba(239,68,68,0.1)', border:'1.5px solid #EF4444', color:'#EF4444', padding:'6px 14px', borderRadius:'999px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }} onClick={() => handleDeleteCourse(course._id)}>Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>⚙️ Settings</h1><p style={s.subtitle}>Configure platform requirements and rules</p></div>
              </div>

              {/* Caretaker Requirements */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>👩‍🍼 Caretaker Requirements</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px 0' }}>
                  <SettingRow 
                    icon="📷" title="Require Profile Photo" 
                    desc="Caretakers must upload a profile photo"
                    checked={settings.caretakerRequirePhoto}
                    onChange={(v) => setSettings({...settings, caretakerRequirePhoto: v})}
                  />
                  <SettingRow 
                    icon="📜" title="Require Certification" 
                    desc="At least one certification required"
                    checked={settings.caretakerRequireCertification}
                    onChange={(v) => setSettings({...settings, caretakerRequireCertification: v})}
                  />
                  <SettingRow 
                    icon="⏱️" title="Minimum Experience" 
                    desc="Years of experience required"
                    type="number"
                    value={settings.caretakerMinExperience}
                    onChange={(v) => setSettings({...settings, caretakerMinExperience: parseInt(v) || 0})}
                    suffix="years"
                  />
                </div>
              </div>

              {/* Platform Settings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>💰 Platform Settings</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px 0' }}>
                  <SettingRow 
                    icon="📊" title="Platform Commission" 
                    desc="Percentage platform takes from caretakers"
                    type="number"
                    value={settings.platformCommission}
                    onChange={(v) => setSettings({...settings, platformCommission: parseInt(v) || 0})}
                    suffix="%"
                  />
                  <SettingRow 
                    icon="💵" title="Minimum Payout" 
                    desc="Minimum amount for caretaker payout"
                    type="number"
                    value={settings.minimumPayout}
                    onChange={(v) => setSettings({...settings, minimumPayout: parseInt(v) || 0})}
                    prefix="₹"
                  />
                  <SettingRow 
                    icon="💱" title="Currency" 
                    desc="Currency for transactions"
                    type="select"
                    value={settings.currency}
                    options={[{value:'INR',label:'INR - Indian Rupee'},{value:'USD',label:'USD - US Dollar'},{value:'EUR',label:'EUR - Euro'}]}
                    onChange={(v) => setSettings({...settings, currency: v})}
                  />
                </div>
              </div>

              {/* Booking Settings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>📅 Booking Settings</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px 0' }}>
                  <SettingRow 
                    icon="🗑️" title="Allow Cancellation" 
                    desc="Parents can cancel bookings"
                    checked={settings.allowCancellation}
                    onChange={(v) => setSettings({...settings, allowCancellation: v})}
                  />
                  <SettingRow 
                    icon="⏰" title="Cancellation Notice" 
                    desc="Hours before session to cancel"
                    type="number"
                    value={settings.cancellationHoursBefore}
                    onChange={(v) => setSettings({...settings, cancellationHoursBefore: parseInt(v) || 0})}
                    suffix="hours"
                  />
                  <SettingRow 
                    icon="💸" title="Refund Percentage" 
                    desc="Refund percentage on cancellation"
                    type="number"
                    value={settings.refundPercentage}
                    onChange={(v) => setSettings({...settings, refundPercentage: parseInt(v) || 0})}
                    suffix="%"
                  />
                </div>
              </div>

              {/* Security Settings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>🔒 Security Settings</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px 0' }}>
                  <SettingRow 
                    icon="🔑" title="Admin Secret Code" 
                    desc="Code for new admin registration"
                    type="text"
                    value={settings.adminSecretCode}
                    onChange={(v) => setSettings({...settings, adminSecretCode: v})}
                  />
                  <SettingRow 
                    icon="⏱️" title="Session Timeout" 
                    desc="Auto logout after inactivity"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(v) => setSettings({...settings, sessionTimeout: parseInt(v) || 0})}
                    suffix="minutes"
                  />
                  <SettingRow 
                    icon="🔐" title="Require 2FA" 
                    desc="Two-factor authentication for admins"
                    checked={settings.require2FA}
                    onChange={(v) => setSettings({...settings, require2FA: v})}
                  />
                </div>
              </div>

              {/* System Settings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>⚙️ System Settings</h2>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', padding:'8px 0' }}>
                  <SettingRow 
                    icon="🔧" title="Maintenance Mode" 
                    desc="Put site in maintenance mode"
                    checked={settings.maintenanceMode}
                    onChange={(v) => setSettings({...settings, maintenanceMode: v})}
                  />
                  <SettingRow 
                    icon="📧" title="Email Alerts" 
                    desc="Send email notifications"
                    checked={settings.emailAlerts}
                    onChange={(v) => setSettings({...settings, emailAlerts: v})}
                  />
                  <SettingRow 
                    icon="⚠️" title="Low Balance Alert" 
                    desc="Alert when balance is low"
                    checked={settings.lowBalanceAlert}
                    onChange={(v) => setSettings({...settings, lowBalanceAlert: v})}
                  />
                  <SettingRow 
                    icon="💰" title="Low Balance Threshold" 
                    desc="Threshold for balance alert"
                    type="number"
                    value={settings.lowBalanceThreshold}
                    onChange={(v) => setSettings({...settings, lowBalanceThreshold: parseInt(v) || 0})}
                    prefix="₹"
                  />
                </div>
              </div>

              {/* System Actions */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>🔧 System Actions</h2>
                </div>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', padding:'8px 0' }}>
                  <button style={{ ...s.btnPrimary }} onClick={handleBackup}>
                    📦 Download Backup
                  </button>
                  <button style={{ ...s.btnSecondary }} onClick={handleClearCache}>
                    🧹 Clear Cache
                  </button>
                  <button style={{ ...s.btnOutline }} onClick={handleSaveSettings} disabled={settingsLoading}>
                    {settingsLoading ? '💾 Saving...' : '💾 Save All Settings'}
                  </button>
                </div>
              </div>

              {/* Settings Summary */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>📋 Settings Summary</h2>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'12px' }}>
                  {[
                    { icon:'👩‍🍼', label:'Profile Photo', value: settings.caretakerRequirePhoto ? 'Required' : 'Optional', color: settings.caretakerRequirePhoto ? '#2E7D32' : '#F57F17' },
                    { icon:'📜', label:'Certification', value: settings.caretakerRequireCertification ? 'Required' : 'Optional', color: settings.caretakerRequireCertification ? '#2E7D32' : '#F57F17' },
                    { icon:'⏱️', label:'Experience', value: `${settings.caretakerMinExperience}yr`, color:'#1565C0' },
                    { icon:'📊', label:'Commission', value: `${settings.platformCommission}%`, color:'#7B1FA2' },
                    { icon:'💵', label:'Min Payout', value: `₹${settings.minimumPayout}`, color:'#2E7D32' },
                    { icon:'🔧', label:'Maintenance', value: settings.maintenanceMode ? 'ON' : 'OFF', color: settings.maintenanceMode ? '#C62828' : '#2E7D32' },
                  ].map((item, i) => (
                    <div key={i} style={{ textAlign:'center', padding:'16px', background:'#F8FAFC', borderRadius:'12px' }}>
                      <span style={{ fontSize:'2rem' }}>{item.icon}</span>
                      <p style={{ fontSize:'0.72rem', color:'#90A4AE', fontWeight:600, margin:'6px 0 2px' }}>{item.label}</p>
                      <p style={{ fontWeight:800, color:item.color, fontSize:'1rem', margin:0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

/* ── Booking Row ── */
const BookingRow = ({ b, statusColor }) => {
  const statusLower = b.status?.toLowerCase() || 'pending';
  const sc = statusColor[statusLower.charAt(0).toUpperCase() + statusLower.slice(1)] || statusColor.Pending;
  return (
    <div style={br.wrap}>
      <div style={br.icon}>📅</div>
      <div style={{ flex:1 }}>
        <p style={br.title}>{b.parent} → {b.caretaker}</p>
        <p style={br.sub}>👶 {b.child} • {b.date}</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'5px' }}>
        <span style={{ fontWeight:800, color:'#2E7D32', fontSize:'0.93rem' }}>₹{b.amount}</span>
        <span style={{ ...br.badge, background:sc.bg, color:sc.color }}>{b.status}</span>
      </div>
    </div>
  );
};

const br = {
  wrap:  { display:'flex', alignItems:'center', gap:'14px', padding:'13px 0', borderBottom:'1px solid #F0F7FF' },
  icon:  { width:'40px', height:'40px', borderRadius:'12px', background:'#E3F2FD', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 },
  title: { fontWeight:700, color:'#1A237E', margin:0, fontSize:'0.92rem' },
  sub:   { color:'#90A4AE', fontSize:'0.8rem', margin:'3px 0 0', fontWeight:600 },
  badge: { display:'inline-block', padding:'3px 11px', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700 },
};

/* ── Styles ── */
const F = "'Nunito', sans-serif";

const s = {
  page:   { minHeight:'100vh', background:'#F0F7FF', fontFamily:F, position:'relative', overflow:'hidden' },
  layout: { display:'flex', position:'relative', zIndex:1 },
  main:   { flex:1, padding:'32px 40px', minHeight:'calc(100vh - 70px)', overflowX:'hidden' },
  blob1:  { position:'fixed', top:'-100px', left:'-100px', width:'380px', height:'380px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,195,247,0.15) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob2:  { position:'fixed', bottom:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle,rgba(206,147,216,0.13) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob3:  { position:'fixed', top:'50%', left:'50%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(105,240,174,0.08) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  toast:  { position:'fixed', top:'24px', right:'24px', zIndex:9999, color:'white', padding:'14px 24px', borderRadius:'14px', fontWeight:700, fontSize:'0.92rem', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', fontFamily:F },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(26,35,126,0.35)', backdropFilter:'blur(4px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' },
  modal:        { background:'white', borderRadius:'24px', width:'420px', maxWidth:'90vw', boxShadow:'0 32px 80px rgba(26,35,126,0.2)', animation:'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', overflow:'hidden' },
  modalHeader:  { background:'linear-gradient(135deg,#1A237E,#3949AB)', padding:'28px', display:'flex', gap:'16px', alignItems:'center' },
  modalAvatar:  { width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#4FC3F7,#69F0AE)', color:'#1A237E', fontWeight:800, fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  modalName:    { color:'white', fontFamily:"'Fredoka One',cursive", fontSize:'1.3rem', margin:0 },
  modalEmail:   { color:'rgba(255,255,255,0.7)', fontSize:'0.85rem', margin:'3px 0 0' },
  modalClose:   { marginLeft:'auto', background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F },
  modalBody:    { padding:'24px 28px' },
  modalRow:     { display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F0F7FF' },
  modalLabel:   { color:'#90A4AE', fontWeight:700, fontSize:'0.85rem' },
  modalValue:   { color:'#1A237E', fontWeight:700, fontSize:'0.9rem' },
  modalFooter:  { padding:'16px 28px 24px', display:'flex', gap:'10px', flexWrap:'wrap' },
  btnApprove:   { background:'linear-gradient(135deg,#43C6AC,#00C853)', color:'white', border:'none', padding:'10px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer' },
  btnMsg:       { background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'10px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer' },
  btnDanger:    { background:'linear-gradient(135deg,#FF5252,#FF1744)', color:'white', border:'none', padding:'10px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer' },
  nav:       { position:'sticky', top:0, zIndex:100, height:'70px', background:'linear-gradient(135deg,#1A237E 0%,#283593 100%)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', boxShadow:'0 4px 20px rgba(26,35,126,0.3)' },
  navLeft:   { display:'flex', alignItems:'center', gap:'16px' },
  navCenter: { flex:1, display:'flex', justifyContent:'center' },
  navRight:  { display:'flex', alignItems:'center', gap:'12px' },
  menuBtn:   { background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.2rem', width:'38px', height:'38px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F },
  brand:     { display:'flex', alignItems:'center', gap:'8px' },
  brandText: { fontFamily:"'Fredoka One',cursive", fontSize:'1.4rem', color:'white', letterSpacing:'0.5px' },
  adminBadge:{ background:'linear-gradient(135deg,#FFD54F,#FF8F00)', color:'#1A237E', fontSize:'0.7rem', padding:'2px 10px', borderRadius:'999px', fontFamily:F, fontWeight:800, marginLeft:'4px', verticalAlign:'middle' },
  searchBox: { background:'rgba(255,255,255,0.12)', borderRadius:'999px', padding:'0 20px', display:'flex', alignItems:'center', gap:'10px', height:'40px', width:'340px' },
  searchInput:{ background:'transparent', border:'none', outline:'none', color:'white', fontFamily:F, fontSize:'0.9rem', width:'100%' },
  iconBtn:   { position:'relative', background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.1rem', width:'40px', height:'40px', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F },
  badge:     { position:'absolute', top:'4px', right:'4px', background:'#FF5252', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  avatarCircle:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#FFD54F,#FF8F00)', color:'#1A237E', fontWeight:800, fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' },
  logoutBtn: { background:'linear-gradient(135deg,#FF5252,#FF1744)', color:'white', border:'none', padding:'8px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 12px rgba(255,23,68,0.35)' },
  notifPanel:{ position:'absolute', top:'52px', right:0, width:'320px', background:'white', borderRadius:'16px', boxShadow:'0 16px 48px rgba(26,35,126,0.18)', zIndex:200, overflow:'hidden', border:'1px solid #E3F2FD' },
  notifHead: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #E3F2FD', fontFamily:F, color:'#1A237E' },
  notifCount:{ background:'#E3F2FD', color:'#1565C0', padding:'3px 10px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700 },
  notifItem: { padding:'13px 20px', display:'flex', gap:'12px', alignItems:'flex-start', borderBottom:'1px solid #F5F5F5' },
  notifText: { fontSize:'0.85rem', color:'#37474F', fontWeight:600, margin:0, lineHeight:1.4 },
  notifTime: { fontSize:'0.74rem', color:'#90A4AE', marginTop:'3px', display:'block' },
  notifDot:  { width:'8px', height:'8px', borderRadius:'50%', background:'#4FC3F7', flexShrink:0, marginTop:'6px' },
  sidebar:     { background:'linear-gradient(180deg,#1A237E 0%,#283593 60%,#3949AB 100%)', transition:'width 0.35s ease', flexShrink:0 },
  sideInner:   { padding:'24px 16px', width:'240px', height:'100%', display:'flex', flexDirection:'column' },
  sideLabel:   { color:'rgba(255,255,255,0.4)', fontSize:'0.7rem', fontWeight:700, letterSpacing:'1.5px', marginBottom:'8px', marginTop:'4px', paddingLeft:'12px' },
  sideBtn:     { width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:'transparent', border:'none', borderRadius:'12px', color:'rgba(255,255,255,0.72)', fontFamily:F, fontSize:'0.9rem', fontWeight:600, cursor:'pointer', marginBottom:'3px', textAlign:'left', position:'relative', transition:'all 0.2s' },
  sideBtnActive:{ background:'rgba(255,255,255,0.15)', color:'white' },
  sideBar:     { position:'absolute', left:0, top:'20%', height:'60%', width:'3px', background:'#FFD54F', borderRadius:'0 3px 3px 0' },
  profileCard: { marginTop:'auto', background:'rgba(255,255,255,0.1)', borderRadius:'14px', padding:'14px 16px', display:'flex', gap:'10px', alignItems:'center' },
  profileAvatar:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#FFD54F,#FF8F00)', color:'#1A237E', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 },
  profileName: { color:'white', fontWeight:700, fontSize:'0.85rem', margin:0 },
  profileRole: { color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', margin:0 },
  fadeIn:    { animation:'fadeUp 0.5s ease' },
  pageTitle: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'16px' },
  h1:        { fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'#1A237E', margin:0 },
  subtitle:  { color:'#90A4AE', fontSize:'0.9rem', marginTop:'4px', fontWeight:600 },
  btnPrimary:  { background:'linear-gradient(135deg,#1A237E,#3949AB)', color:'white', border:'none', padding:'11px 24px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(26,35,126,0.3)', whiteSpace:'nowrap' },
  btnSecondary:{ background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'11px 24px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,195,247,0.3)', whiteSpace:'nowrap' },
  btnOutline:  { background:'transparent', border:'2px solid #1A237E', color:'#1A237E', padding:'8px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:'16px', marginBottom:'24px' },
  statCard:  { borderRadius:'18px', padding:'20px', border:'1px solid rgba(255,255,255,0.6)', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', position:'relative', overflow:'hidden' },
  statTop:   { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' },
  statIcon:  { fontSize:'1.6rem' },
  statValue: { fontFamily:"'Fredoka One',cursive", fontSize:'2rem', lineHeight:1 },
  statLabel: { color:'#607D8B', fontSize:'0.78rem', fontWeight:700 },
  statPulse: { position:'absolute', bottom:'-20px', right:'-20px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.3)' },
  chartsRow: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'20px', marginBottom:'24px' },
  chartCard: { background:'white', borderRadius:'20px', padding:'22px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD' },
  chartTitle:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.05rem', color:'#1A237E', marginBottom:'14px' },
  chartNote: { color:'#90A4AE', fontSize:'0.75rem', marginTop:'8px', fontWeight:600 },
  alertCard: { background:'linear-gradient(135deg,#FFF8E1,#FFF3E0)', border:'1.5px solid #FFD54F', borderRadius:'16px', padding:'18px 22px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' },
  alertIcon: { fontSize:'1.8rem', flexShrink:0 },
  alertTitle:{ color:'#F57F17', fontWeight:700, margin:0, fontSize:'0.95rem' },
  alertSub:  { color:'#90A4AE', fontSize:'0.82rem', margin:'3px 0 0', fontWeight:600 },
  quickGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' },
  quickBtn:  { border:'none', borderRadius:'16px', padding:'18px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', boxShadow:'0 6px 18px rgba(0,0,0,0.1)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' },
  quickIcon: { fontSize:'1.6rem' },
  quickLabel:{ color:'white', fontWeight:800, fontSize:'0.78rem', textAlign:'center' },
  sectionCard:{ background:'white', borderRadius:'20px', padding:'24px', marginBottom:'24px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD' },
  sectionHead:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' },
  sectionTitle:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.2rem', color:'#1A237E', margin:'0 0 16px' },
  filterBar:       { display:'flex', gap:'14px', marginBottom:'22px', flexWrap:'wrap', alignItems:'center' },
  searchBoxSmall:  { display:'flex', alignItems:'center', gap:'8px', background:'white', border:'2px solid #E3F2FD', borderRadius:'999px', padding:'8px 18px', flex:1, minWidth:'200px' },
  searchInputSmall:{ border:'none', outline:'none', fontFamily:F, fontSize:'0.9rem', width:'100%', color:'#37474F' },
  filterPills:     { display:'flex', gap:'8px', flexWrap:'wrap' },
  pill:            { padding:'8px 18px', border:'2px solid #E3F2FD', borderRadius:'999px', background:'white', fontFamily:F, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', color:'#607D8B', transition:'all 0.2s' },
  pillActive:      { background:'#1A237E', color:'white', border:'2px solid #1A237E' },
  usersGrid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'18px' },
  userCard:        { background:'white', borderRadius:'20px', padding:'22px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD', cursor:'pointer', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' },
  userCardTop:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' },
  userAvatar:      { width:'52px', height:'52px', borderRadius:'16px', color:'white', fontWeight:800, fontSize:'1.3rem', display:'flex', alignItems:'center', justifyContent:'center' },
  userStatusDot:   { width:'10px', height:'10px', borderRadius:'50%' },
  userName:        { fontWeight:800, color:'#1A237E', fontSize:'0.95rem', margin:'0 0 4px' },
  userEmail:       { color:'#90A4AE', fontSize:'0.78rem', margin:'0 0 12px', fontWeight:600 },
  userMeta:        { display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px' },
  roleBadge:       { padding:'3px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 },
  statusBadge:     { padding:'3px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 },
  userJoined:      { color:'#B0BEC5', fontSize:'0.74rem', fontWeight:600, margin:0 },
  approveBtn:      { background:'linear-gradient(135deg,#43C6AC,#00C853)', color:'white', border:'none', padding:'9px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.82rem', cursor:'pointer' },
  rejectBtn:       { background:'rgba(239,68,68,0.1)', border:'1.5px solid #EF4444', color:'#EF4444', padding:'9px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  msgBtn:          { background:'rgba(79,195,247,0.12)', border:'1.5px solid #4FC3F7', color:'#0288D1', padding:'9px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  deleteBtn:       { background:'rgba(239,68,68,0.1)', border:'1.5px solid #EF4444', color:'#EF4444', padding:'9px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  summaryRow:  { display:'flex', gap:'14px', marginBottom:'22px', flexWrap:'wrap' },
  summaryPill: { background:'white', borderRadius:'14px', padding:'16px 20px', minWidth:'100px', boxShadow:'0 4px 12px rgba(26,35,126,0.07)', border:'1px solid #E3F2FD', textAlign:'center' },
  summaryVal:  { display:'block', fontFamily:"'Fredoka One',cursive", fontSize:'1.6rem' },
  summaryLabel:{ display:'block', color:'#90A4AE', fontSize:'0.76rem', fontWeight:700, marginTop:'3px' },
  table:       { width:'100%', borderCollapse:'collapse' },
  thead:       { background:'linear-gradient(135deg,#1A237E,#283593)' },
  th:          { padding:'12px 16px', textAlign:'left', color:'rgba(255,255,255,0.85)', fontSize:'0.76rem', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase' },
  tr:          { borderBottom:'1px solid #F0F7FF', transition:'background 0.18s' },
  td:          { padding:'13px 16px', fontSize:'0.88rem', color:'#37474F' },
  tdBold:      { fontWeight:700, color:'#1A237E' },
  rowNum:      { background:'#E3F2FD', color:'#1565C0', width:'26px', height:'26px', borderRadius:'8px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:800 },
  badge:       { display:'inline-block', padding:'4px 12px', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700 },
  actionBtn:   { background:'#F0F7FF', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'0.85rem', fontFamily:F },
  revenueGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'18px', marginBottom:'24px' },
  revCard:     { borderRadius:'20px', padding:'28px 22px', color:'white', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', position:'relative', overflow:'hidden', animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' },
  revIcon:     { fontSize:'2.2rem', display:'block', marginBottom:'14px' },
  revValue:    { fontFamily:"'Fredoka One',cursive", fontSize:'2rem', margin:0, lineHeight:1 },
  revLabel:    { fontSize:'0.84rem', opacity:0.85, marginTop:'6px', fontWeight:600 },
  revGlow:     { position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.15)' },
  caretakerRow:{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'18px' },
  caretakerAvatar:{ width:'44px', height:'44px', borderRadius:'14px', background:'linear-gradient(135deg,#CE93D8,#9C27B0)', color:'white', fontWeight:800, fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  progressTrack:{ height:'8px', background:'#F0F7FF', borderRadius:'999px', overflow:'hidden', marginBottom:'4px' },
  progressFill: { height:'100%', background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', borderRadius:'999px', transition:'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' },
};

if (!document.getElementById('admin-kf')) {
  const t = document.createElement('style');
  t.id = 'admin-kf';
  t.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    @keyframes floatBlob { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
    tbody tr:hover td { background: rgba(79,195,247,0.04); }
    aside button:hover { background: rgba(255,255,255,0.15) !important; color: white !important; }
  `;
  document.head.appendChild(t);
}

export default AdminDashboard;