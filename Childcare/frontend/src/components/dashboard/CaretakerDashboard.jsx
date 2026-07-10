// File Path: src/components/dashboard/CaretakerDashboard.jsx
// Updated: All pages connected — Messages, Payments, Reviews, Notifications, Training, Profile Edit
// Added: Real invoice generation functionality

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, notificationsAPI, authAPI, twoFAAPI } from '../../services/api';
import { generateInvoicePDF } from '../../utils/exportUtils';

/* ── Animated counter ── */
const AnimatedNumber = ({ target }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{val}</span>;
};

/* ── Assignment Row ── */
const row = {
  wrap:   { display:'flex', alignItems:'center', gap:'16px', padding:'14px 0', borderBottom:'1px solid #F0F7FF' },
  avatar: { width:'46px', height:'46px', borderRadius:'50%', background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 },
  info:   { flex:1 },
  name:   { fontWeight:700, color:'#1A237E', margin:0, fontSize:'0.95rem' },
  sub:    { color:'#90A4AE', fontSize:'0.82rem', margin:'3px 0 0', fontWeight:600 },
  right:  { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' },
  amount: { fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'#2E7D32', margin:0 },
  badge:  { display:'inline-block', padding:'4px 13px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700 },
};

const AssignmentRow = ({ a, statusColor, full, onClick }) => {
  const sc = statusColor[a.status] || statusColor.Pending;
  return (
    <div style={{ ...row.wrap, cursor: onClick ? 'pointer' : 'default' }} onClick={() => onClick && onClick(a)}>
      <div style={row.avatar}>{a.avatar}</div>
      <div style={row.info}>
        <p style={row.name}>{a.parentName}</p>
        <p style={row.sub}>👶 {a.childName} • 📅 {a.date} • 🕐 {a.startTime}–{a.endTime}</p>
      </div>
      <div style={row.right}>
        {full && <p style={row.amount}>₹{a.amount}</p>}
        <span style={{ ...row.badge, background:sc.bg, color:sc.color }}>{a.status}</span>
      </div>
    </div>
  );
};

/* ── Assignment Modal ── */
const AssignmentModal = ({ assignment, onClose, onConfirm, onCancel, onComplete, processing }) => {
  if (!assignment) return null;
  
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:'24px', padding:'32px', maxWidth:'480px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.5rem', color:'#1A237E', margin:0 }}>Assignment Details</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#90A4AE' }}>✕</button>
        </div>
        
        <div style={{ marginBottom:'20px' }}>
          <div style={modalDetail}><span style={modalLabel}>Parent</span><span style={modalValue}>{assignment.parentName}</span></div>
          <div style={modalDetail}><span style={modalLabel}>Child</span><span style={modalValue}>{assignment.childName}</span></div>
          <div style={modalDetail}><span style={modalLabel}>Date</span><span style={modalValue}>{assignment.date}</span></div>
          <div style={modalDetail}><span style={modalLabel}>Time</span><span style={modalValue}>{assignment.startTime} – {assignment.endTime}</span></div>
          <div style={modalDetail}><span style={modalLabel}>Amount</span><span style={{ ...modalValue, color:'#2E7D32' }}>₹{assignment.amount}</span></div>
          <div style={{ ...modalDetail, borderBottom:'none' }}><span style={modalLabel}>Status</span><span style={modalValue}>{assignment.status}</span></div>
        </div>
        
        <div style={{ display:'flex', gap:'12px', flexDirection:'column' }}>
          {assignment.status === 'Pending' && (
            <>
              <button onClick={() => onConfirm(assignment.id)} disabled={processing} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'none', background:'#2E7D32', color:'white', fontWeight:700, cursor:processing?'not-allowed':'pointer', opacity:processing?0.6:1 }}>
                {processing ? 'Processing...' : '✅ Confirm Booking'}
              </button>
              <button onClick={() => onCancel(assignment.id)} disabled={processing} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #FFEBEE', background:'white', color:'#C62828', fontWeight:700, cursor:processing?'not-allowed':'pointer', opacity:processing?0.6:1 }}>
                {processing ? 'Processing...' : '❌ Cancel Booking'}
              </button>
            </>
          )}
          
          {assignment.status === 'Confirmed' && (
            <>
              <button onClick={() => onComplete(assignment.id)} disabled={processing} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'none', background:'#1565C0', color:'white', fontWeight:700, cursor:processing?'not-allowed':'pointer', opacity:processing?0.6:1 }}>
                {processing ? 'Processing...' : '✅ Mark as Completed'}
              </button>
              <button onClick={() => onCancel(assignment.id)} disabled={processing} style={{ flex:1, padding:'14px', borderRadius:'12px', border:'2px solid #FFEBEE', background:'white', color:'#C62828', fontWeight:700, cursor:processing?'not-allowed':'pointer', opacity:processing?0.6:1 }}>
                {processing ? 'Processing...' : '❌ Cancel Booking'}
              </button>
            </>
          )}
          
          {assignment.status === 'Completed' && (
            <div style={{ flex:1, padding:'14px', borderRadius:'12px', background:'#E8F5E9', color:'#2E7D32', textAlign:'center', fontWeight:700 }}>
              ✅ Session Completed
            </div>
          )}
          
          {assignment.status === 'Cancelled' && (
            <div style={{ flex:1, padding:'14px', borderRadius:'12px', background:'#FFEBEE', color:'#C62828', textAlign:'center', fontWeight:700 }}>
              ❌ Booking Cancelled
            </div>
          )}
        </div>
        
        <button onClick={onClose} style={{ width:'100%', marginTop:'12px', padding:'10px', borderRadius:'12px', border:'2px solid #E3F2FD', background:'white', color:'#0288D1', fontWeight:700, cursor:'pointer' }}>
          💬 Message Parent
        </button>
      </div>
    </div>
  );
};

const modalDetail = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F5F5F5' };
const modalLabel = { color:'#90A4AE', fontWeight:600, fontSize:'0.9rem' };
const modalValue = { color:'#1A237E', fontWeight:700, fontSize:'0.95rem' };

/* ── Day Schedule Modal ── */
const DayScheduleModal = ({ dayData, onClose, onSelectSession }) => {
  if (!dayData) return null;
  
  const statusColors = {
    Confirmed: { bg: '#E3F2FD', color: '#1565C0' },
    Pending: { bg: '#FFF8E1', color: '#F57F17' },
    Completed: { bg: '#E8F5E9', color: '#2E7D32' },
    Cancelled: { bg: '#FFEBEE', color: '#C62828' },
  };
  
  const statusBadge = statusColors[dayData.sessions[0]?.status] || statusColors.Pending;
  
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'white', borderRadius:'24px', padding:'32px', maxWidth:'500px', width:'90%', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', animation:'popIn 0.3s ease' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <div>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.5rem', color:'#1A237E', margin:0 }}>
              {dayData.day}'s Schedule
            </h2>
            <p style={{ color:'#90A4AE', fontSize:'0.9rem', margin:'4px 0 0', fontWeight:600 }}>
              {new Date(dayData.fullDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#90A4AE' }}>✕</button>
        </div>
        
        {dayData.sessions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ fontSize:'4rem', marginBottom:'16px' }}>📭</div>
            <h3 style={{ fontFamily:"'Fredoka One',cursive", color:'#1A237E', margin:'0 0 8px' }}>No Sessions</h3>
            <p style={{ color:'#90A4AE', fontSize:'0.9rem', margin:0 }}>You have a free day! Enjoy your time off.</p>
          </div>
        ) : (
          <div style={{ maxHeight:'400px', overflowY:'auto' }}>
            {dayData.sessions.map((session, idx) => (
              <div 
                key={session.id || idx}
                onClick={() => onSelectSession && onSelectSession(session)}
                style={{ 
                  background: '#F8FAFC', 
                  borderRadius:'16px', 
                  padding:'16px', 
                  marginBottom:'12px',
                  cursor: 'pointer',
                  border: `2px solid ${session.status === 'Confirmed' ? '#E3F2FD' : session.status === 'Pending' ? '#FFF8E1' : '#F5F5F5'}`,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>
                      {session.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:'#1A237E', fontSize:'0.95rem' }}>{session.parentName}</div>
                      <div style={{ color:'#90A4AE', fontSize:'0.8rem', fontWeight:600 }}>👶 {session.childName}</div>
                    </div>
                  </div>
                  <span style={{ 
                    padding:'4px 10px', 
                    borderRadius:'999px', 
                    fontSize:'0.75rem', 
                    fontWeight:700,
                    background: statusColors[session.status]?.bg || '#F5F5F5',
                    color: statusColors[session.status]?.color || '#90A4AE'
                  }}>
                    {session.status}
                  </span>
                </div>
                
                <div style={{ display:'flex', gap:'16px', color:'#607D8B', fontSize:'0.85rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span>🕐</span>
                    <span>{session.startTime} – {session.endTime}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span>💰</span>
                    <span style={{ fontWeight:700, color:'#2E7D32' }}>₹{session.amount}</span>
                  </div>
                </div>
                
                <div style={{ marginTop:'10px', color:'#0288D1', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}>
                  View Details →
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          onClick={onClose} 
          style={{ 
            width:'100%', 
            marginTop:'16px', 
            padding:'12px', 
            borderRadius:'12px', 
            border:'2px solid #E3F2FD', 
            background:'white', 
            color:'#0288D1', 
            fontWeight:700, 
            cursor:'pointer' 
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab,       setActiveTab]       = useState('overview');
  const [sidebarOpen,     setSidebarOpen]     = useState(true);
  const [assignments,     setAssignments]     = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [schedule,        setSchedule]        = useState([]);
  const [earnings,        setEarnings]        = useState({ total: 0, thisMonth: 0, pending: 0 });
  const [showNotifPanel,  setShowNotifPanel]  = useState(false);
  const [toast,           setToast]           = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [caretakerPhoto, setCaretakerPhoto] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const caretakerPhotoInputRef = useRef(null);

  // Fetch 2FA status
  useEffect(() => {
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

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('/uploads/') || photo.startsWith('http')) {
      return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
    }
    return null;
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await authAPI.updateProfile({ avatar: file });
      localStorage.setItem('user', JSON.stringify(result));
      setCaretakerPhoto(getPhotoUrl(result.avatar));
      showToast('✅ Profile photo updated!');
    } catch (err) {
      showToast('❌ Failed to update photo');
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Generate Invoice for caretaker
  const handleGenerateInvoice = async () => {
    try {
      const bookingsRes = await bookingsAPI.getAll();
      const bookings = bookingsRes.bookings || [];
      
      if (bookings.length > 0) {
        const latestBooking = bookings[0];
        generateInvoicePDF(latestBooking, user, 'caretaker');
        showToast('✅ Invoice downloaded!');
      } else {
        showToast('No bookings found');
      }
    } catch (err) {
      console.error('Invoice generation error:', err);
      showToast('❌ Error generating invoice');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, notificationsData] = await Promise.all([
          bookingsAPI.getAll(),
          notificationsAPI.getAll(),
        ]);

        const bookings = bookingsData.bookings || [];
        
        const transformedBookings = bookings.map(b => ({
          id: b._id,
          parentName: b.parentName || b.parent?.name || 'Parent',
          childName: b.childName || 'Child',
          date: b.date ? new Date(b.date).toISOString().split('T')[0] : '',
          startTime: b.startTime || '09:00',
          endTime: b.endTime || '17:00',
          status: capitalizeStatus(b.status),
          amount: b.totalAmount || b.amount || 0,
          avatar: b.parent?.avatar || '👩',
          caretakerId: b.caretaker?._id,
        }));

        setAssignments(transformedBookings);

        const completed = transformedBookings.filter(b => b.status === 'Completed');
        const pending = transformedBookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed');
        const completedTotal = completed.reduce((s, b) => s + (b.amount || 0), 0);
        const pendingTotal = pending.reduce((s, b) => s + (b.amount || 0), 0);
        setEarnings({
          total: completedTotal + pendingTotal,
          thisMonth: completedTotal,
          pending: pendingTotal,
        });

        const transformedNotifications = (notificationsData.notifications || []).slice(0, 10).map((n, i) => ({
          id: n._id || i,
          text: n.message || n.text || 'New notification',
          time: formatTimeAgo(n.createdAt),
          read: n.isRead || false,
          icon: getNotificationIcon(n.type),
        }));

        setNotifications(transformedNotifications);

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const scheduleData = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          const dayBookings = bookings.filter(b => b.date && new Date(b.date).toISOString().split('T')[0] === dateStr && b.status !== 'cancelled');
          const slots = dayBookings.length;
          const colors = ['#4FC3F7', '#69F0AE', '#FFD54F', '#CE93D8', '#4FC3F7', '#69F0AE', '#CE93D8'];
          scheduleData.push({
            day: weekDays[date.getDay()],
            date: date.getDate().toString(),
            fullDate: dateStr,
            slots,
            color: colors[date.getDay()],
            sessions: dayBookings,
          });
        }
        setSchedule(scheduleData);

      } catch (error) {
        console.error('Error fetching caretaker data:', error);
        setAssignments([]);
        setNotifications([]);
        setSchedule([]);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const capitalizeStatus = (status) => {
    if (!status) return 'Pending';
    const statusMap = {
      'confirmed': 'Confirmed',
      'pending': 'Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const confirmBooking = async (bookingId) => {
    setProcessingBooking(true);
    try {
      const res = await bookingsAPI.confirm(bookingId);
      if (res.success) {
        setAssignments(prev => prev.map(a => a.id === bookingId ? { ...a, status: 'Confirmed' } : a));
        setSelectedAssignment(null);
        showToast('Booking confirmed! Parent has been notified.');
      } else {
        showToast(res.message || 'Failed to confirm booking');
      }
    } catch (err) {
      showToast(err.message || 'Failed to confirm booking');
    } finally {
      setProcessingBooking(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setProcessingBooking(true);
    try {
      const res = await bookingsAPI.cancel(bookingId);
      if (res.success) {
        setAssignments(prev => prev.map(a => a.id === bookingId ? { ...a, status: 'Cancelled' } : a));
        setSelectedAssignment(null);
        showToast('Booking cancelled.');
      } else {
        showToast(res.message || 'Failed to cancel booking');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking');
    } finally {
      setProcessingBooking(false);
    }
  };

  const completeBooking = async (bookingId) => {
    setProcessingBooking(true);
    try {
      const res = await bookingsAPI.complete(bookingId);
      if (res.success) {
        setAssignments(prev => prev.map(a => a.id === bookingId ? { ...a, status: 'Completed' } : a));
        setSelectedAssignment(null);
        showToast('Session marked as completed!');
      } else {
        showToast(res.message || 'Failed to complete booking');
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete booking');
    } finally {
      setProcessingBooking(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id===id ? {...n, read:true} : n));

  const statusColor = {
    Confirmed: { bg:'#E3F2FD', color:'#1565C0' },
    Pending:   { bg:'#FFF8E1', color:'#F57F17' },
    Completed: { bg:'#E8F5E9', color:'#2E7D32' },
    Cancelled: { bg:'#FFEBEE', color:'#C62828' },
  };

  const upcoming  = assignments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const completed = assignments.filter(a => a.status === 'Completed');

  // ── Sidebar nav ──
  const sidebarMain = [
    { icon:'🏠', label:'Overview',    tab:'overview'    },
    { icon:'📅', label:'My Schedule', tab:'schedule'    },
    { icon:'👶', label:'Assignments',  tab:'assignments' },
    { icon:'💰', label:'Earnings',    tab:'earnings'    },
    { icon:'💎', label:'Pricing',    tab:'pricing'     },
  ];

  const sidebarMore = [
    { icon:'💬', label:'Messages',      action:() => navigate('/messages')      },
    { icon:'💳', label:'Payments',      action:() => navigate('/payments')      },
    { icon:'⭐', label:'My Reviews',    action:() => navigate('/reviews')       },
    { icon:'🔔', label:'Notifications', action:() => navigate('/notifications') },
    { icon:'📚', label:'Training',      action:() => navigate('/training')      },
    { icon:'👤', label:'Edit Profile',  action:() => navigate('/profile/edit')  },
  ];

  const [pricing, setPricing] = useState({
    hourlyRate: user?.hourlyRate || 500,
    halfDayRate: Math.round((user?.hourlyRate || 500) * 4),
    fullDayRate: Math.round((user?.hourlyRate || 500) * 8),
    weeklyRate: Math.round((user?.hourlyRate || 500) * 40),
    monthlyRate: Math.round((user?.hourlyRate || 500) * 160),
    serviceFee: 10,
    minHours: 2,
    maxHours: 12,
  });
  const [pricingSaved, setPricingSaved] = useState(false);

  const savePricing = async () => {
    try {
      await authAPI.updateProfile({ hourlyRate: Number(pricing.hourlyRate) });
      setPricingSaved(true);
      showToast('💰 Pricing updated successfully!');
      setTimeout(() => setPricingSaved(false), 3000);
    } catch (error) {
      showToast('❌ Failed to update pricing');
    }
  };

  return (
    <div style={s.page}>
      <div style={s.blob1}/><div style={s.blob2}/><div style={s.blob3}/>

      {toast && (
        <div style={{ position:'fixed', top:'24px', right:'24px', zIndex:9999, background:'linear-gradient(135deg,#43C6AC,#4FC3F7)', color:'white', padding:'14px 24px', borderRadius:'14px', fontWeight:700, fontSize:'0.92rem', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', fontFamily:FONT }}>
          ✅ {toast}
        </div>
      )}

      <nav style={s.nav}>
        <div style={s.navLeft}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div style={s.brand}>
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ ...s.brandIcon, height: '32px', width: 'auto' }} />
            <span style={s.brandText}>Trusted Care</span>
          </div>
        </div>

        <div style={s.navCenter}>
          <span style={s.greeting}>
            Good {new Date().getHours() < 12 ? '🌅 Morning' : new Date().getHours() < 17 ? '☀️ Afternoon' : '🌙 Evening'}, {user?.name}!
          </span>
        </div>

        <div style={s.navRight}>
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

          <div style={{ position:'relative' }}>
            <button style={s.iconBtn} onClick={() => setShowNotifPanel(o => !o)}>
              🔔
              {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
            </button>
            {showNotifPanel && (
              <div style={s.notifPanel}>
                <div style={s.notifHeader}>
                  <strong>Notifications</strong>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <span style={s.notifCount}>{unreadCount} new</span>
                    <button
                      style={{ background:'none', border:'none', color:'#4FC3F7', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:FONT }}
                      onClick={() => { setShowNotifPanel(false); navigate('/notifications'); }}
                    >View All →</button>
                  </div>
                </div>
                {notifications.map(n => (
                  <div key={n.id}
                    style={{ ...s.notifItem, background: n.read ? 'transparent' : 'rgba(79,195,247,0.08)' }}
                    onClick={() => markRead(n.id)}>
                    <span style={s.notifIcon}>{n.icon}</span>
                    <div>
                      <p style={s.notifText}>{n.text}</p>
                      <span style={s.notifTime}>{n.time}</span>
                    </div>
                    {!n.read && <span style={s.notifDot}/>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...s.avatarCircle, cursor:'pointer', overflow:'hidden' }}
            onClick={() => navigate('/profile/edit')} title="Edit Profile">
            {caretakerPhoto || user?.avatar ? (
              <img src={caretakerPhoto || getPhotoUrl(user.avatar)} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'C'
            )}
          </div>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={s.body}>
        <aside style={{ ...s.sidebar, width: sidebarOpen ? '240px' : '0', overflow:'hidden' }}>
          <div style={s.sidebarInner}>

            <p style={s.sidebarLabel}>MAIN MENU</p>
            {sidebarMain.map(item => (
              <button key={item.tab}
                style={{ ...s.sideBtn, ...(activeTab===item.tab ? s.sideBtnActive : {}) }}
                onClick={() => setActiveTab(item.tab)}>
                <span style={s.sideBtnIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {activeTab===item.tab && <span style={s.sideBtnBar}/>}
              </button>
            ))}

            <p style={{ ...s.sidebarLabel, marginTop:'24px' }}>FEATURES</p>
            {sidebarMore.map((item, i) => (
              <button key={i} style={s.sideBtn} onClick={item.action}>
                <span style={s.sideBtnIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <div style={s.profileCard}>
              <div style={{ ...s.profileAvatar, cursor:'pointer', overflow:'hidden' }} onClick={() => navigate('/profile/edit')}>
                {caretakerPhoto || user?.avatar ? (
                  <img src={caretakerPhoto || getPhotoUrl(user.avatar)} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'C'
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={s.profileName}>{user?.name}</p>
                <p style={s.profileRole}>Caretaker · {completed.length} sessions done</p>
              </div>
              <button style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.9rem' }}
                onClick={() => navigate('/profile/edit')} title="Edit Profile">✏️</button>
            </div>
          </div>
        </aside>

        <main style={s.main}>

          {activeTab === 'overview' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>Dashboard Overview</h1>
                  <p style={s.subtitle}>Monday, February 24, 2026</p>
                </div>
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                  <button style={s.btnOutline} onClick={() => navigate('/reviews')}>⭐ My Reviews</button>
                  <button style={s.btnPrimary} onClick={() => navigate('/messages')}>💬 Message Parents</button>
                </div>
              </div>

              {/* Profile Photo Section */}
              <div style={{ background:'white', borderRadius:'20px', padding:'24px', marginBottom:'24px', boxShadow:'0 2px 16px rgba(26,35,126,0.08)', display:'flex', alignItems:'center', gap:'20px' }}>
                <input type="file" ref={caretakerPhotoInputRef} accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
                <div 
                  onClick={() => caretakerPhotoInputRef.current?.click()}
                  style={{ 
                    width:'100px', height:'100px', borderRadius:'50%', 
                    background: caretakerPhoto || user?.avatar ? 'transparent' : 'linear-gradient(135deg,#E3F2FD,#F3E5F5)',
                    border:'3px solid #4FC3F7', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    overflow:'hidden', transition:'all 0.2s',
                    boxShadow:'0 4px 12px rgba(79,195,247,0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {caretakerPhoto || user?.avatar ? (
                    <img 
                      src={caretakerPhoto || getPhotoUrl(user.avatar)} 
                      alt="Profile" 
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} 
                    />
                  ) : (
                    <span style={{ fontSize:'2.5rem' }}>👩‍🍼</span>
                  )}
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:"'Fredoka One',cursive", color:'#1A237E', margin:'0 0 8px' }}>Your Profile Photo</h3>
                  <p style={{ color:'#90A4AE', fontSize:'0.9rem', margin:'0 0 12px' }}>A professional photo helps parents recognize you and builds trust.</p>
                  <button 
                    style={{ 
                      padding:'10px 20px', borderRadius:'999px', border:'none',
                      background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white',
                      fontWeight:700, cursor:'pointer', fontSize:'0.9rem'
                    }}
                    onClick={() => caretakerPhotoInputRef.current?.click()}
                  >
                    📷 {caretakerPhoto || user?.avatar ? 'Change Photo' : 'Add Photo'}
                  </button>
                </div>
              </div>

              <div style={s.statsRow}>
                {[
                  { icon:'📅', label:'Upcoming Sessions',  value:upcoming.length,               color:'#4FC3F7', bg:'#E3F2FD' },
                  { icon:'✅', label:'Completed Sessions', value:completed.length,               color:'#43A047', bg:'#E8F5E9' },
                  { icon:'💰', label:'This Month (₹)',     value:Math.round(earnings.thisMonth), color:'#FB8C00', bg:'#FFF8E1' },
                  { icon:'⏳', label:'Pending Pay (₹)',    value:Math.round(earnings.pending),   color:'#8E24AA', bg:'#F3E5F5' },
                ].map((stat, i) => (
                  <div key={i} style={{ ...s.statCard, animationDelay:`${i*0.1}s` }}>
                    <div style={{ ...s.statIconBox, background:stat.bg }}>
                      <span style={{ fontSize:'1.6rem' }}>{stat.icon}</span>
                    </div>
                    <div>
                      <div style={{ ...s.statValue, color:stat.color }}><AnimatedNumber target={stat.value}/></div>
                      <div style={s.statLabel}>{stat.label}</div>
                    </div>
                    <div style={{ ...s.statBar, background:stat.color+'22' }}>
                      <div style={{ ...s.statBarFill, background:stat.color, width:`${Math.min(100,stat.value*10)}%` }}/>
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.quickGrid}>
                {[
                  { icon:'💬', label:'Messages',      action:() => navigate('/messages'),      grad:'linear-gradient(135deg,#4FC3F7,#43C6AC)' },
                  { icon:'💳', label:'Payments',      action:() => navigate('/payments'),      grad:'linear-gradient(135deg,#FFD54F,#FF8F00)' },
                  { icon:'⭐', label:'My Reviews',    action:() => navigate('/reviews'),       grad:'linear-gradient(135deg,#FFCC80,#F4511E)' },
                  { icon:'🔔', label:'Notifications', action:() => navigate('/notifications'), grad:'linear-gradient(135deg,#F48FB1,#E91E63)' },
                  { icon:'📚', label:'Training',      action:() => navigate('/training'),      grad:'linear-gradient(135deg,#81D4FA,#0288D1)' },
                  { icon:'👤', label:'Edit Profile',  action:() => navigate('/profile/edit'),  grad:'linear-gradient(135deg,#B39DDB,#512DA8)' },
                  { icon:'📅', label:'My Schedule',   action:() => setActiveTab('schedule'),   grad:'linear-gradient(135deg,#69F0AE,#00C853)' },
                  { icon:'💰', label:'Earnings',      action:() => setActiveTab('earnings'),   grad:'linear-gradient(135deg,#CE93D8,#9C27B0)' },
                ].map((q, i) => (
                  <button key={i}
                    style={{ ...s.quickBtn, background:q.grad, animationDelay:`${i*0.06}s` }}
                    onClick={q.action}>
                    <span style={s.quickIcon}>{q.icon}</span>
                    <span style={s.quickLabel}>{q.label}</span>
                  </button>
                ))}
              </div>

              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>📆 This Week's Schedule</h2>
                <div style={s.weekStrip}>
                  {schedule.map((d, i) => (
                    <div 
                      key={i} 
                      style={{ ...s.dayCell, borderTop:`4px solid ${d.color}`, cursor:'pointer' }}
                      onClick={() => setSelectedDate(d)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 20px ${d.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={s.dayName}>{d.day}</span>
                      <span style={s.dayDate}>{d.date}</span>
                      {d.slots > 0
                        ? <span style={{ ...s.daySlot, background:d.color+'22', color:d.color }}>{d.slots} session{d.slots>1?'s':''}</span>
                        : <span style={s.dayOff}>Free</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>🗓️ Upcoming Assignments</h2>
                  <button style={s.btnOutline} onClick={() => setActiveTab('assignments')}>View All</button>
                </div>
                {upcoming.length === 0
                  ? <div style={s.empty}>🎉 No upcoming sessions. Enjoy your day!</div>
                  : upcoming.slice(0,3).map(a => <AssignmentRow key={a.id} a={a} statusColor={statusColor} onClick={(assignment) => setSelectedAssignment(assignment)}/>)}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginBottom:'24px' }}>
                {[
                  { icon:'⭐', title:'My Reviews',    desc:'See ratings from parents',        path:'/reviews',       bg:'#FFF8E1', color:'#F57F17' },
                  { icon:'🔔', title:'Notifications',  desc:'Your latest updates & alerts',    path:'/notifications', bg:'#F3E5F5', color:'#8E24AA' },
                  { icon:'💳', title:'Payments',       desc:'Track your earnings & payouts',   path:'/payments',      bg:'#E8F5E9', color:'#2E7D32' },
                  { icon:'👤', title:'Edit Profile',   desc:'Update your caretaker profile',   path:'/profile/edit',  bg:'#E3F2FD', color:'#0288D1' },
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

              <div style={s.tipsRow}>
                {[
                  { icon:'🧸', tip:'Always carry a small activity kit to keep children engaged.' },
                  { icon:'🥗', tip:'Note any food allergies before each session starts.' },
                  { icon:'📞', tip:'Keep parent contact saved and reachable at all times.' },
                ].map((t, i) => (
                  <div key={i} style={s.tipCard}>
                    <span style={s.tipIcon}>{t.icon}</span>
                    <p style={s.tipText}>{t.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>My Schedule</h1><p style={s.subtitle}>All your upcoming & past sessions</p></div>
                <button style={s.btnPrimary} onClick={() => navigate('/messages')}>💬 Message Parents</button>
              </div>
              
              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>📆 Weekly Overview</h2>
                <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'10px' }}>
                  {schedule.map((d, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        minWidth:'120px',
                        background: d.sessions.length > 0 ? '#F8FAFC' : '#FAFAFA',
                        borderRadius:'16px', 
                        padding:'16px', 
                        textAlign:'center',
                        cursor:'pointer',
                        border: `2px solid ${d.sessions.length > 0 ? d.color : '#E3F2FD'}`,
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedDate(d)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 8px 20px ${d.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontWeight:700, color:'#90A4AE', fontSize:'0.8rem' }}>{d.day}</div>
                      <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', color:'#1A237E' }}>{d.date}</div>
                      {d.slots > 0 ? (
                        <div style={{ 
                          background:d.color+'22', 
                          color:d.color, 
                          padding:'4px 10px', 
                          borderRadius:'999px', 
                          fontSize:'0.75rem',
                          fontWeight:700,
                          marginTop:'8px'
                        }}>
                          {d.slots} session{d.slots>1?'s':''}
                        </div>
                      ) : (
                        <div style={{ 
                          background:'#F5F5F5', 
                          color:'#90A4AE', 
                          padding:'4px 10px', 
                          borderRadius:'999px', 
                          fontSize:'0.75rem',
                          fontWeight:700,
                          marginTop:'8px'
                        }}>
                          Free Day
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>📅 Upcoming Sessions ({upcoming.length})</h2>
                {upcoming.length === 0
                  ? <div style={s.empty}>No upcoming sessions booked yet.</div>
                  : upcoming.map(a => <AssignmentRow key={a.id} a={a} statusColor={statusColor} full onClick={(assignment) => setSelectedAssignment(assignment)}/>)}
              </div>
              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>✅ Completed Sessions ({completed.length})</h2>
                {completed.length === 0
                  ? <div style={s.empty}>No completed sessions yet.</div>
                  : completed.map(a => <AssignmentRow key={a.id} a={a} statusColor={statusColor} full onClick={(assignment) => setSelectedAssignment(assignment)}/>)}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>All Assignments</h1><p style={s.subtitle}>{assignments.length} total assignments</p></div>
                <button style={s.btnOutline} onClick={() => navigate('/reviews')}>⭐ View Reviews</button>
              </div>
              <div style={s.filterRow}>
                {['All','Confirmed','Pending','Completed'].map(f => (
                  <button key={f} style={s.filterPill}>{f}</button>
                ))}
              </div>
              <div style={s.sectionCard}>
                {assignments.length === 0
                  ? <div style={s.empty}>No assignments yet. Your bookings will appear here.</div>
                  : assignments.map(a => <AssignmentRow key={a.id} a={a} statusColor={statusColor} full onClick={(assignment) => setSelectedAssignment(assignment)}/>)}
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>💰 My Earnings</h1><p style={s.subtitle}>Track your income, payouts and completed sessions</p></div>
                <button style={s.btnPrimary} onClick={() => navigate('/payments')}>💳 Full Payment Page →</button>
              </div>

              <div style={s.earningsRow}>
                {[
                  { label:'Total Earned', value:earnings.total,     icon:'💎', grad:'linear-gradient(135deg,#4FC3F7,#43C6AC)' },
                  { label:'This Month',   value:earnings.thisMonth, icon:'📈', grad:'linear-gradient(135deg,#69F0AE,#00C853)' },
                  { label:'Pending Payout', value:earnings.pending,   icon:'⏳', grad:'linear-gradient(135deg,#FFD54F,#FF8F00)' },
                ].map((e, i) => (
                  <div key={i} style={{ ...s.earningCard, background:e.grad }}>
                    <span style={s.earningIcon}>{e.icon}</span>
                    <p style={s.earningValue}>₹<AnimatedNumber target={Math.round(e.value)}/></p>
                    <p style={s.earningLabel}>{e.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ ...s.sectionCard, marginBottom:'20px' }}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>🏦 Payout Settings</h2>
                </div>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
                  <div style={{ flex:1, minWidth:'200px', background:'#F8FAFC', padding:'16px', borderRadius:'12px' }}>
                    <p style={{ fontSize:'0.78rem', color:'#90A4AE', fontWeight:600, margin:'0 0 4px' }}>Bank Account</p>
                    <p style={{ fontWeight:700, color:'#1A237E', margin:0 }}>
                      {user?.bankAccount ? `****${user.bankAccount.slice(-4)}` : 'Not Set'}
                    </p>
                  </div>
                  <div style={{ flex:1, minWidth:'200px', background:'#F8FAFC', padding:'16px', borderRadius:'12px' }}>
                    <p style={{ fontSize:'0.78rem', color:'#90A4AE', fontWeight:600, margin:'0 0 4px' }}>UPI ID</p>
                    <p style={{ fontWeight:700, color:'#1A237E', margin:0 }}>
                      {user?.upiId || 'Not Set'}
                    </p>
                  </div>
                  <button style={{ ...s.btnOutline, fontSize:'0.88rem' }} onClick={() => navigate('/profile/edit')}>
                    ✏️ Update Payout Details
                  </button>
                </div>
              </div>

              <div style={{ ...s.sectionCard, marginBottom:'20px' }}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>⚡ Quick Actions</h2>
                </div>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  <button style={{ ...s.btnPrimary, fontSize:'0.88rem' }} onClick={() => {
                    if (earnings.pending > 0) {
                      showToast(`🏦 Payout request for ₹${earnings.pending} sent! Arrives in 2-3 days.`);
                    } else {
                      showToast('No pending payout to request.');
                    }
                  }}>
                    🏦 Request Payout
                  </button>
                  <button style={{ ...s.btnOutline, fontSize:'0.88rem' }} onClick={() => navigate('/payments')}>
                    📊 Full Payment History
                  </button>
                  <button style={{ ...s.btnOutline, fontSize:'0.88rem' }} onClick={handleGenerateInvoice}>
                    📄 Generate Invoice
                  </button>
                </div>
              </div>

              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>💳 Session Earnings</h2>
                {assignments.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px', color:'#90A4AE' }}>
                    <p style={{ fontSize:'1.5rem', margin:'0 0 8px' }}>📭</p>
                    <p style={{ fontWeight:700, margin:0 }}>No sessions yet</p>
                    <p style={{ fontSize:'0.82rem', margin:'8px 0 0' }}>Complete bookings to start earning!</p>
                  </div>
                ) : (
                  <table style={s.table}>
                    <thead>
                      <tr style={s.thead}>
                        <th style={s.th}>Parent</th>
                        <th style={s.th}>Child</th>
                        <th style={s.th}>Date</th>
                        <th style={s.th}>Amount</th>
                        <th style={s.th}>Status</th>
                        <th style={s.th}>Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, i) => (
                        <tr key={a.id} style={{ ...s.tr, animationDelay:`${i*0.05}s` }}>
                          <td style={s.td}>{a.avatar} {a.parentName}</td>
                          <td style={s.td}>{a.childName}</td>
                          <td style={s.td}>{a.date}</td>
                          <td style={{ ...s.td, fontWeight:700, color:'#2E7D32' }}>₹{a.amount}</td>
                          <td style={s.td}>
                            <span style={{
                              ...s.statusBadge,
                              background:(statusColor[a.status]||statusColor.Pending).bg,
                              color:(statusColor[a.status]||statusColor.Pending).color,
                            }}>{a.status}</span>
                          </td>
                          <td style={s.td}>
                            {a.status === 'Completed' ? (
                              <span style={{ color:'#10B981', fontWeight:700, fontSize:'0.82rem' }}>✅ Ready</span>
                            ) : a.status === 'Confirmed' ? (
                              <span style={{ color:'#F59E0B', fontWeight:700, fontSize:'0.82rem' }}>⏳ Pending</span>
                            ) : (
                              <span style={{ color:'#90A4AE', fontSize:'0.82rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>💎 Pricing Management</h1>
                  <p style={s.subtitle}>Set your rates for different booking durations</p>
                </div>
              </div>

              <div style={s.sectionCard}>
                <h2 style={s.sectionTitle}>Your Rates</h2>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'20px', marginBottom:'28px' }}>
                  {[
                    { label:'Hourly Rate', key:'hourlyRate', icon:'⏰', prefix:'₹', placeholder:'500' },
                    { label:'Half Day (4 hrs)', key:'halfDayRate', icon:'🌤️', prefix:'₹', placeholder:'2000' },
                    { label:'Full Day (8 hrs)', key:'fullDayRate', icon:'☀️', prefix:'₹', placeholder:'4000' },
                    { label:'Weekly (40 hrs)', key:'weeklyRate', icon:'📅', prefix:'₹', placeholder:'20000' },
                    { label:'Monthly (160 hrs)', key:'monthlyRate', icon:'🗓️', prefix:'₹', placeholder:'80000' },
                  ].map((field, i) => (
                    <div key={i} style={{ background:'#F8FAFC', borderRadius:'12px', padding:'16px', border:'1px solid #E3F2FD' }}>
                      <label style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700, color:'#546E7A', fontSize:'0.9rem', marginBottom:'8px' }}>
                        <span>{field.icon}</span> {field.label}
                      </label>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontWeight:800, color:'#1A237E', fontSize:'1.1rem' }}>{field.prefix}</span>
                        <input
                          type="number"
                          value={pricing[field.key]}
                          onChange={e => setPricing(p => ({ ...p, [field.key]: Number(e.target.value) }))}
                          style={{ flex:1, padding:'12px 14px', border:'2px solid #E3F2FD', borderRadius:'10px', fontSize:'1rem', fontWeight:700, color:'#1A237E', outline:'none', fontFamily:FONT }}
                          placeholder={field.placeholder}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', borderRadius:'12px', padding:'20px', marginBottom:'24px' }}>
                  <h3 style={{ fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'#1A237E', margin:'0 0 12px' }}>📊 Platform Fee Information</h3>
                  <p style={{ margin:0, fontSize:'0.88rem', color:'#37474F', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                    <span>ℹ️</span>
                    <span>Platform fee: {pricing.serviceFee}% per booking</span>
                  </p>
                  <p style={{ margin:'8px 0 0', fontSize:'0.88rem', color:'#37474F', display:'flex', gap:'8px', alignItems:'flex-start' }}>
                    <span>✅</span>
                    <span>You keep {(100-pricing.serviceFee)}% of each booking amount</span>
                  </p>
                </div>

                <button
                  onClick={savePricing}
                  style={{ ...s.btnPrimary, width:'100%', padding:'16px' }}
                >
                  {pricingSaved ? '✅ Pricing Saved!' : '💾 Save Pricing'}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onConfirm={confirmBooking}
          onCancel={cancelBooking}
          onComplete={completeBooking}
          processing={processingBooking}
        />
      )}

      {selectedDate && (
        <DayScheduleModal
          dayData={selectedDate}
          onClose={() => setSelectedDate(null)}
          onSelectSession={(session) => {
            setSelectedDate(null);
            setSelectedAssignment(session);
          }}
        />
      )}
    </div>
  );
};

/* ── Helpers ── */
function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type) {
  const icons = {
    booking: '📅',
    payment: '💰',
    message: '💬',
    review: '⭐',
    reminder: '🔔',
    alert: '⚠️',
    default: '📌'
  };
  return icons[type] || icons.default;
}

/* ── Styles ── */
const FONT = "'Nunito', sans-serif";

const s = {
  page:    { minHeight:'100vh', background:'#F0F7FF', fontFamily:FONT, position:'relative', overflow:'hidden' },
  body:    { display:'flex', position:'relative', zIndex:1 },
  main:    { flex:1, padding:'32px 40px', minHeight:'calc(100vh - 70px)', overflowX:'hidden' },
  blob1:   { position:'fixed', top:'-120px', left:'-120px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,195,247,0.18) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob2:   { position:'fixed', bottom:'-80px', right:'-80px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle,rgba(206,147,216,0.15) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob3:   { position:'fixed', top:'40%', left:'40%', width:'250px', height:'250px', borderRadius:'50%', background:'radial-gradient(circle,rgba(105,240,174,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  nav:     { position:'sticky', top:0, zIndex:100, height:'70px', background:'linear-gradient(135deg,#1A237E 0%,#283593 100%)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', boxShadow:'0 4px 20px rgba(26,35,126,0.3)' },
  navLeft: { display:'flex', alignItems:'center', gap:'16px' },
  navCenter:{ flex:1, display:'flex', justifyContent:'center' },
  navRight:{ display:'flex', alignItems:'center', gap:'12px' },
  menuBtn: { background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.2rem', width:'38px', height:'38px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  brand:   { display:'flex', alignItems:'center', gap:'8px' },
  brandIcon:{ fontSize:'1.6rem' },
  brandText:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.5rem', color:'white', letterSpacing:'1px' },
  greeting:{ color:'rgba(255,255,255,0.85)', fontSize:'0.9rem', fontWeight:600 },
  iconBtn: { position:'relative', background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.2rem', width:'40px', height:'40px', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  badge:   { position:'absolute', top:'4px', right:'4px', background:'#FF5252', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  avatarCircle:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#4FC3F7,#69F0AE)', color:'#1A237E', fontWeight:800, fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' },
  logoutBtn:{ background:'linear-gradient(135deg,#FF5252,#FF1744)', color:'white', border:'none', padding:'8px 20px', borderRadius:'999px', fontFamily:FONT, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 12px rgba(255,23,68,0.35)' },
  notifPanel:  { position:'absolute', top:'52px', right:0, width:'320px', background:'white', borderRadius:'16px', boxShadow:'0 16px 48px rgba(26,35,126,0.18)', zIndex:200, overflow:'hidden', border:'1px solid #E3F2FD' },
  notifHeader: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #E3F2FD', fontFamily:FONT },
  notifCount:  { background:'#E3F2FD', color:'#1565C0', padding:'3px 10px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700 },
  notifItem:   { padding:'14px 20px', display:'flex', gap:'12px', alignItems:'flex-start', borderBottom:'1px solid #F5F5F5', cursor:'pointer', transition:'background 0.2s' },
  notifIcon:   { fontSize:'1.3rem', flexShrink:0, marginTop:'2px' },
  notifText:   { fontSize:'0.87rem', color:'#37474F', fontWeight:600, margin:0, lineHeight:1.4 },
  notifTime:   { fontSize:'0.75rem', color:'#90A4AE', marginTop:'3px', display:'block' },
  notifDot:    { width:'8px', height:'8px', borderRadius:'50%', background:'#4FC3F7', flexShrink:0, marginTop:'6px' },
  sidebar:     { background:'linear-gradient(180deg,#1A237E 0%,#283593 60%,#3949AB 100%)', transition:'width 0.35s cubic-bezier(0.4,0,0.2,1)', flexShrink:0 },
  sidebarInner:{ padding:'24px 16px', width:'240px', height:'100%', display:'flex', flexDirection:'column' },
  sidebarLabel:{ color:'rgba(255,255,255,0.45)', fontSize:'0.72rem', fontWeight:700, letterSpacing:'1.5px', marginBottom:'8px', marginTop:'4px', paddingLeft:'12px' },
  sideBtn:     { width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:'transparent', border:'none', borderRadius:'12px', color:'rgba(255,255,255,0.75)', fontFamily:FONT, fontSize:'0.9rem', fontWeight:600, cursor:'pointer', marginBottom:'3px', textAlign:'left', position:'relative', transition:'all 0.2s ease' },
  sideBtnActive:{ background:'rgba(255,255,255,0.15)', color:'white' },
  sideBtnIcon: { fontSize:'1.1rem' },
  sideBtnBar:  { position:'absolute', left:0, top:'20%', height:'60%', width:'3px', background:'#4FC3F7', borderRadius:'0 3px 3px 0' },
  profileCard: { marginTop:'auto', background:'rgba(255,255,255,0.1)', borderRadius:'14px', padding:'14px 16px', display:'flex', gap:'10px', alignItems:'center' },
  profileAvatar:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#4FC3F7,#69F0AE)', color:'#1A237E', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 },
  profileName: { color:'white', fontWeight:700, fontSize:'0.85rem', margin:0 },
  profileRole: { color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', margin:0 },
  fadeIn:    { animation:'fadeUp 0.5s ease' },
  pageTitle: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px', flexWrap:'wrap', gap:'16px' },
  h1:        { fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'#1A237E', margin:0 },
  subtitle:  { color:'#90A4AE', fontSize:'0.9rem', marginTop:'4px' },
  btnPrimary:{ background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'12px 28px', borderRadius:'999px', fontFamily:FONT, fontWeight:700, fontSize:'0.95rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,195,247,0.4)' },
  btnOutline:{ background:'transparent', border:'2px solid #4FC3F7', color:'#0288D1', padding:'10px 20px', borderRadius:'999px', fontFamily:FONT, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' },
  statsRow:   { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'20px', marginBottom:'24px' },
  statCard:   { background:'white', borderRadius:'20px', padding:'22px', boxShadow:'0 4px 20px rgba(79,195,247,0.15)', border:'1px solid #E3F2FD', display:'flex', alignItems:'center', gap:'16px', animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both', position:'relative', overflow:'hidden' },
  statIconBox:{ width:'54px', height:'54px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  statValue:  { fontFamily:"'Fredoka One',cursive", fontSize:'1.9rem', lineHeight:1 },
  statLabel:  { color:'#90A4AE', fontSize:'0.8rem', fontWeight:600, marginTop:'4px' },
  statBar:    { position:'absolute', bottom:0, left:0, right:0, height:'4px', borderRadius:'0 0 20px 20px' },
  statBarFill:{ height:'100%', borderRadius:'inherit', transition:'width 1s ease' },
  quickGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' },
  quickBtn:   { border:'none', borderRadius:'16px', padding:'18px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', boxShadow:'0 6px 18px rgba(0,0,0,0.1)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' },
  quickIcon:  { fontSize:'1.6rem' },
  quickLabel: { color:'white', fontWeight:800, fontSize:'0.78rem', textAlign:'center' },
  sectionCard:{ background:'white', borderRadius:'20px', padding:'24px', marginBottom:'24px', boxShadow:'0 4px 20px rgba(79,195,247,0.12)', border:'1px solid #E3F2FD' },
  sectionHead:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' },
  sectionTitle:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.3rem', color:'#1A237E', margin:0, marginBottom:'18px' },
  weekStrip:  { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'10px' },
  dayCell:    { background:'#F9FBFF', borderRadius:'12px', padding:'14px 8px', textAlign:'center', border:'1px solid #E3F2FD', transition:'transform 0.2s ease' },
  dayName:    { display:'block', color:'#90A4AE', fontSize:'0.75rem', fontWeight:700, letterSpacing:'1px', marginBottom:'4px' },
  dayDate:    { display:'block', fontFamily:"'Fredoka One',cursive", fontSize:'1.3rem', color:'#1A237E', marginBottom:'8px' },
  daySlot:    { display:'inline-block', padding:'3px 8px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 },
  dayOff:     { display:'inline-block', color:'#CFD8DC', fontSize:'0.75rem', fontWeight:600 },
  empty:      { textAlign:'center', padding:'48px', color:'#90A4AE', fontSize:'1rem', fontWeight:600, background:'#F9FBFF', borderRadius:'12px', border:'2px dashed #E3F2FD' },
  tipsRow:    { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px', marginBottom:'24px' },
  tipCard:    { background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', borderRadius:'16px', padding:'20px', display:'flex', gap:'14px', alignItems:'flex-start', border:'1px solid #E3F2FD' },
  tipIcon:    { fontSize:'2rem', flexShrink:0 },
  tipText:    { color:'#37474F', fontSize:'0.88rem', lineHeight:1.55, fontWeight:600 },
  filterRow:  { display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' },
  filterPill: { padding:'8px 20px', border:'2px solid #E3F2FD', borderRadius:'999px', background:'white', fontFamily:FONT, fontWeight:700, fontSize:'0.85rem', cursor:'pointer', color:'#1A237E' },
  earningsRow:{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px', marginBottom:'28px' },
  earningCard:{ borderRadius:'20px', padding:'28px 24px', color:'white', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', position:'relative', overflow:'hidden' },
  earningIcon:{ fontSize:'2.2rem', display:'block', marginBottom:'14px' },
  earningValue:{ fontFamily:"'Fredoka One',cursive", fontSize:'2.2rem', margin:0, lineHeight:1 },
  earningLabel:{ fontSize:'0.85rem', opacity:0.85, marginTop:'6px', fontWeight:600 },
  table:     { width:'100%', borderCollapse:'collapse' },
  thead:     { background:'linear-gradient(135deg,#1A237E,#283593)' },
  th:        { padding:'13px 18px', textAlign:'left', color:'rgba(255,255,255,0.85)', fontSize:'0.8rem', fontWeight:700, letterSpacing:'0.5px', textTransform:'uppercase' },
  tr:        { borderBottom:'1px solid #F0F7FF', transition:'background 0.2s' },
  td:        { padding:'14px 18px', fontSize:'0.9rem', color:'#37474F' },
  statusBadge:{ display:'inline-block', padding:'4px 13px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700 },
};

if (!document.head.querySelector('#ct-styles')) {
  const t = document.createElement('style');
  t.id = 'ct-styles';
  t.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
    @keyframes floatBlob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-20px) scale(1.06)} 66%{transform:translate(-15px,15px) scale(0.96)} }
    aside button:hover { background: rgba(255,255,255,0.15) !important; color: white !important; transform: translateX(4px); }
    tbody tr:hover td  { background: rgba(79,195,247,0.05); }
  `;
  document.head.appendChild(t);
}

export default CaretakerDashboard;
