// File Path: src/components/dashboard/ParentDashboard.jsx
// Updated: All pages connected — Learning, Messages, Payments, Reviews, Notifications, Profile, Booking, NannyList

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI, usersAPI, notificationsAPI, authAPI, twoFAAPI, childrenAPI } from '../../services/api';

/* ── Animated Number ── */
const AnimatedNumber = ({ target, prefix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40) || 1;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 28);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{val}</span>;
};

/* ── Star Rating ── */
const Stars = ({ rating }) => (
  <span>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ color: i <= Math.round(rating) ? '#FFD54F' : '#E0E0E0', fontSize: '0.9rem' }}>★</span>
    ))}
    <span style={{ color: '#90A4AE', fontSize: '0.78rem', fontWeight: 700, marginLeft: '4px' }}>{rating}</span>
  </span>
);

/* ── Review Modal ── */
const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover]   = useState(0);
  const [comment, setComment] = useState('');
  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={modal.box} onClick={e => e.stopPropagation()}>
        <h2 style={modal.title}>⭐ Rate Your Session</h2>
        <p style={modal.sub}>How was your experience with <strong>{booking.nannyName}</strong>?</p>
        <div style={modal.stars}>
          {[1,2,3,4,5].map(i => (
            <span key={i}
              style={{ fontSize: '2.5rem', cursor: 'pointer', color: i <= (hover || rating) ? '#FFD54F' : '#E0E0E0', transition: 'all 0.15s' }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}>★</span>
          ))}
        </div>
        <textarea style={modal.textarea} placeholder="Share your experience (optional)..."
          value={comment} onChange={e => setComment(e.target.value)} />
        <div style={modal.btns}>
          <button style={modal.btnSubmit} onClick={() => { onSubmit(booking.id, rating, comment); onClose(); }}>Submit Review</button>
          <button style={modal.btnCancel} onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  );
};

const modal = {
  overlay:   { position:'fixed',inset:0,background:'rgba(26,35,126,0.4)',backdropFilter:'blur(5px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px' },
  box:       { background:'white',borderRadius:'24px',padding:'36px',maxWidth:'440px',width:'100%',boxShadow:'0 32px 80px rgba(26,35,126,0.2)',textAlign:'center' },
  title:     { fontFamily:"'Fredoka One',cursive",fontSize:'1.6rem',color:'#1A237E',margin:'0 0 8px' },
  sub:       { color:'#90A4AE',fontSize:'0.9rem',fontWeight:600,margin:'0 0 20px' },
  stars:     { display:'flex',justifyContent:'center',gap:'6px',margin:'0 0 20px' },
  textarea:  { width:'100%',height:'90px',border:'2px solid #E3F2FD',borderRadius:'14px',padding:'12px 16px',fontFamily:"'Nunito',sans-serif",fontSize:'0.9rem',resize:'none',outline:'none',marginBottom:'20px',color:'#37474F' },
  btns:      { display:'flex',gap:'10px' },
  btnSubmit: { flex:1,background:'linear-gradient(135deg,#4FC3F7,#43C6AC)',color:'white',border:'none',padding:'13px',borderRadius:'999px',fontFamily:"'Nunito',sans-serif",fontWeight:800,cursor:'pointer',fontSize:'0.93rem' },
  btnCancel: { flex:1,background:'#F0F7FF',color:'#90A4AE',border:'none',padding:'13px',borderRadius:'999px',fontFamily:"'Nunito',sans-serif",fontWeight:700,cursor:'pointer',fontSize:'0.93rem' },
};

/* ── Add Child Modal ── */
const AddChildModal = ({ onClose, onAdd }) => {
  const [childName, setChildName] = useState('');
  const [age, setAge]             = useState('');
  const [gender, setGender]       = useState('');
  const [allergies, setAllergies] = useState('None');
  const [notes, setNotes]         = useState('');
  const [error, setError]         = useState('');

  const handleAdd = () => {
    if (!childName.trim()) { setError('Please enter child\'s name'); return; }
    if (!age)              { setError('Please select age group'); return; }
    if (!gender)           { setError('Please select gender'); return; }
    onAdd({ childName: childName.trim(), age, gender, allergies, notes });
    onClose();
  };

  const inputStyle = { width:'100%', padding:'11px 14px', border:'2px solid #E3F2FD', borderRadius:'12px', fontFamily:"'Nunito',sans-serif", fontSize:'0.9rem', fontWeight:600, color:'#1A237E', background:'#F9FBFF', outline:'none', marginTop:'6px', boxSizing:'border-box' };
  const labelStyle = { display:'block', fontWeight:800, fontSize:'0.78rem', color:'#90A4AE', textTransform:'uppercase', letterSpacing:'0.4px' };

  return (
    <div style={modal.overlay} onClick={onClose}>
      <div style={{ ...modal.box, maxWidth:'500px', textAlign:'left', padding:'32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h2 style={{ ...modal.title, margin:0, fontSize:'1.4rem' }}>👶 Add a Child</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.4rem', cursor:'pointer', color:'#90A4AE' }}>✕</button>
        </div>
        {error && (
          <div style={{ background:'#FFF1F2', border:'1.5px solid #FECDD3', borderRadius:'10px', padding:'10px 14px', marginBottom:'14px', color:'#E11D48', fontWeight:700, fontSize:'0.83rem' }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Child's Name *</label>
          <input style={inputStyle} placeholder="Enter child's name" value={childName} onChange={e => { setChildName(e.target.value); setError(''); }} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
          <div>
            <label style={labelStyle}>Age Group *</label>
            <select style={inputStyle} value={age} onChange={e => { setAge(e.target.value); setError(''); }}>
              <option value="">Select age</option>
              <option>Under 1 year (Infant)</option>
              <option>1-3 years (Toddler)</option>
              <option>3-5 years (Preschool)</option>
              <option>5-8 years (Early School)</option>
              <option>8-12 years (School Age)</option>
              <option>12+ years (Teen)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Gender *</label>
            <select style={inputStyle} value={gender} onChange={e => { setGender(e.target.value); setError(''); }}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom:'14px' }}>
          <label style={labelStyle}>Allergies</label>
          <select style={inputStyle} value={allergies} onChange={e => setAllergies(e.target.value)}>
            <option>None</option><option>Nuts</option><option>Dairy</option>
            <option>Gluten</option><option>Eggs</option><option>Seafood</option>
            <option>Multiple - see notes</option>
          </select>
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={labelStyle}>Special Notes (Optional)</label>
          <textarea style={{ ...inputStyle, height:'70px', resize:'none' }}
            placeholder="Medical conditions, routines, special care requirements..."
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button style={modal.btnSubmit} onClick={handleAdd}>✅ Add Child</button>
          <button style={modal.btnCancel} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab,     setActiveTab]     = useState('overview');
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [showNotif,     setShowNotif]     = useState(false);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [showAddChild,  setShowAddChild]  = useState(false);
  const [toast,         setToast]         = useState(null);
  const [bookings,      setBookings]      = useState([]);
  const [children,      setChildren]      = useState([]);
  const [activeFilter,  setActiveFilter]  = useState('All');
  const [featuredNannies, setFeaturedNannies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Photo upload refs and state
  const parentPhotoInputRef = useRef(null);
  const fatherPhotoInputRef = useRef(null);
  const childPhotoInputRefs = useRef({});
  const [parentPhoto, setParentPhoto] = useState(null);
  const [fatherPhoto, setFatherPhoto] = useState(null);
  const [childPhotos, setChildPhotos] = useState({});

  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('/uploads/') || photo.startsWith('http')) {
      return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
    }
    return null;
  };

  const handleParentPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await authAPI.updateProfile({ parentPhoto: file });
      const userData = result.user || result;
      localStorage.setItem('user', JSON.stringify(userData));
      setParentPhoto(getPhotoUrl(userData.parentPhoto));
      showToast('✅ Mother\'s photo updated!');
    } catch (err) {
      showToast('❌ Failed to update photo');
    }
  };

  const handleFatherPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await authAPI.updateProfile({ fatherPhoto: file });
      const userData = result.user || result;
      localStorage.setItem('user', JSON.stringify(userData));
      setFatherPhoto(getPhotoUrl(userData.fatherPhoto));
      showToast('✅ Father\'s photo updated!');
    } catch (err) {
      showToast('❌ Failed to update photo');
    }
  };

  const handleChildPhotoUpload = async (childId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      // Try to upload to MongoDB first
      const result = await childrenAPI.updatePhoto(childId, file);
      
      if (result.success) {
        // Update local state with new photo
        const photoUrl = result.photo;
        setChildPhotos(prev => ({ ...prev, [childId]: getPhotoUrl(photoUrl) }));
        
        // Update children state
        setChildren(prev => prev.map(c => 
          c.id === childId ? { ...c, photo: photoUrl } : c
        ));
        
        // Also update localStorage as backup
        const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
        const localChildIndex = allChildren.findIndex(c => c.id === childId);
        if (localChildIndex >= 0) {
          allChildren[localChildIndex].photo = photoUrl;
          localStorage.setItem('childcare_children', JSON.stringify(allChildren));
        }
        
        showToast('✅ Child\'s photo updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback to local method
      try {
        const formData = new FormData();
        formData.append('photo', file);
        
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          method: 'PUT',
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          body: formData,
        });
        const result = await res.json();
        
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        
        // Update local children storage
        const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
        const localChildIndex = allChildren.findIndex(c => c.id === childId);
        if (localChildIndex >= 0) {
          const photoUrl = result.user?.children?.[localChildIndex]?.photo || result.children?.[localChildIndex]?.photo;
          allChildren[localChildIndex].photo = photoUrl;
          localStorage.setItem('childcare_children', JSON.stringify(allChildren));
          
          // Update children state
          const updatedChildren = [...children];
          updatedChildren[localChildIndex] = { ...updatedChildren[localChildIndex], photo: photoUrl };
          setChildren(updatedChildren);
          setChildPhotos(prev => ({ ...prev, [childId]: getPhotoUrl(photoUrl) }));
        }
        
        showToast('✅ Child\'s photo updated!');
      } catch (err) {
        console.error('Fallback upload error:', err);
        showToast('❌ Failed to update photo');
      }
    }
  };

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

  useEffect(() => {
    const fetchNannies = async () => {
      try {
        const res = await usersAPI.getCaretakers();
        if (res.success && res.caretakers) {
          const mapped = res.caretakers.slice(0, 3).map((c, i) => ({
            id: c._id,
            name: c.name,
            rating: c.rating || 0,
            exp: c.experience ? `${c.experience} years` : 'New',
            tags: c.specializations?.length ? c.specializations.slice(0, 2) : ['Childcare'],
            price: c.hourlyRate || 0,
            avatar: ['👩', '👨', '👩‍🦱', '👩‍🦳'][i % 4],
            available: c.availability !== false,
          }));
          setFeaturedNannies(mapped);
        }
      } catch (err) {
        console.log('Failed to fetch nannies');
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await notificationsAPI.getAll();
        if (res.success) {
          const mapped = (res.notifications || []).map(n => ({
            id: n._id,
            type: n.type,
            icon: n.type === 'booking_request' ? '📅' : n.type === 'booking_confirmed' ? '✅' : n.type === 'booking_cancelled' ? '❌' : n.type === 'booking_completed' ? '🎉' : n.type === 'payment_received' ? '💰' : n.type === 'refund_requested' ? '💸' : n.type === 'review_received' ? '⭐' : n.type === 'message' ? '💬' : n.type === 'alert' ? '⚠️' : n.type === 'training' ? '🎓' : n.type === 'profile_incomplete' ? '📝' : '🔔',
            text: n.message || n.title,
            time: formatTimeAgo(n.createdAt),
            read: n.isRead,
          }));
          setNotifications(mapped);
          setShowNotif(true);
        }
      } catch (err) {
        console.log('Failed to fetch notifications');
      }
    };

    const formatTimeAgo = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    fetchNannies();
    fetchNotifications();

    // Check for profile completion notification
    const profileNotif = localStorage.getItem('showProfileNotif');
    if (profileNotif) {
      localStorage.removeItem('showProfileNotif');
      const notif = JSON.parse(profileNotif);
      showToast(notif.message, 'info');
    }
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const parentEmail = user?.email;
    if (!parentEmail) return;
    
    // Fetch bookings from backend
    const fetchData = async () => {
      try {
        const bookingsRes = await bookingsAPI.getAll();
        if (bookingsRes.success) {
          setBookings(bookingsRes.bookings || []);
        }
      } catch (err) {
        console.log('Failed to fetch bookings');
      }
    };
    
    // Load children from MongoDB first, fallback to localStorage
    const fetchChildren = async () => {
      try {
        const childrenRes = await childrenAPI.getAll();
        if (childrenRes.success && childrenRes.children && childrenRes.children.length > 0) {
          // Transform MongoDB children to local format
          const transformed = childrenRes.children.map(c => ({
            id: c._id,
            childName: c.name,
            age: c.age,
            gender: c.gender,
            allergies: c.allergies,
            notes: c.notes,
            photo: c.photo,
            emoji: c.gender === 'Female' ? '👧' : '👦',
          }));
          setChildren(transformed);
          // Also update localStorage as backup
          localStorage.setItem('childcare_children', JSON.stringify(transformed));
        } else {
          // No MongoDB children, try localStorage
          const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
          const userChildren = allChildren.filter(c => 
            !c.parentId || 
            c.parentId === user?.id || 
            c.parentId === user?._id || 
            c.parentId === user?.email ||
            c.parentEmail === user?.email
          );
          setChildren(userChildren);
        }
      } catch (error) {
        console.log('Failed to fetch children from MongoDB, using localStorage');
        // Fallback to localStorage
        const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
        const userChildren = allChildren.filter(c => 
          !c.parentId || 
          c.parentId === user?.id || 
          c.parentId === user?._id || 
          c.parentId === user?.email ||
          c.parentEmail === user?.email
        );
        setChildren(userChildren);
      }
    };
    
    fetchData();
    fetchChildren();
  }, [user]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddChild = async (childData) => {
    try {
      const result = await childrenAPI.add({
        name: childData.childName,
        age: childData.age,
        gender: childData.gender,
        allergies: childData.allergies,
        notes: childData.notes,
      });
      
      if (result.success) {
        // Refresh children from MongoDB
        const childrenRes = await childrenAPI.getAll();
        if (childrenRes.success) {
          // Transform MongoDB children to local format
          const transformed = childrenRes.children.map(c => ({
            id: c._id,
            childName: c.name,
            age: c.age,
            gender: c.gender,
            allergies: c.allergies,
            notes: c.notes,
            photo: c.photo,
            emoji: c.gender === 'Female' ? '👧' : '👦',
          }));
          setChildren(transformed);
        }
        showToast(`✅ ${childData.childName} added successfully!`);
      }
    } catch (error) {
      console.error('Error adding child:', error);
      // Fallback to localStorage if API fails
      const newChild = {
        id: Date.now().toString(), 
        parentId: user?.id || user?._id,
        parentEmail: user?.email,
        childName: childData.childName, 
        age: childData.age,
        gender: childData.gender, 
        allergies: childData.allergies,
        notes: childData.notes,
        emoji: childData.gender === 'Female' ? '👧' : '👦',
        createdAt: new Date().toISOString(),
      };
      const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
      allChildren.push(newChild);
      localStorage.setItem('childcare_children', JSON.stringify(allChildren));
      setChildren(prev => [...prev, newChild]);
      showToast(`✅ ${childData.childName} added! (Saved locally)`);
    }
  };

  const handleRemoveChild = async (childId) => {
    if (!window.confirm('Are you sure you want to remove this child?')) return;
    try {
      await childrenAPI.delete(childId);
      setChildren(prev => prev.filter(c => c.id !== childId));
      showToast('Child removed successfully.');
    } catch (error) {
      console.error('Error removing child:', error);
      // Fallback to localStorage
      const allChildren = JSON.parse(localStorage.getItem('childcare_children') || '[]');
      localStorage.setItem('childcare_children', JSON.stringify(allChildren.filter(c => c.id !== childId)));
      setChildren(prev => prev.filter(c => c.id !== childId));
      showToast('Child removed.');
    }
  };

  const cancelBooking = async (id) => {
    try {
      await bookingsAPI.cancel(id, 'Cancelled by parent');
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status:'cancelled' } : b));
      showToast('Booking cancelled successfully.');
    } catch (err) {
      showToast('Failed to cancel booking', 'error');
    }
  };

  const submitReview = async (id, rating, comment) => {
    try {
      await bookingsAPI.addReview(id, rating, comment);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, rated:true, rating, review:comment } : b));
      showToast('Thank you for your review! ⭐');
    } catch (err) {
      showToast('Failed to submit review', 'error');
    }
  };

  const upcoming    = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed   = bookings.filter(b => b.status === 'completed');
  const pendingPayment = bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid');
  const totalSpent = completed.reduce((s, b) => s + (b.totalAmount || b.amount || b.total || 0), 0);

  // ✅ FIX 3: filtered bookings for the bookings tab
  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  const statusColor = {
    confirmed:  { bg:'#E3F2FD', color:'#1565C0' },
    pending:    { bg:'#FFF8E1', color:'#F57F17' },
    completed:  { bg:'#E8F5E9', color:'#2E7D32' },
    cancelled:  { bg:'#FFEBEE', color:'#C62828' },
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  const sidebarMain = [
    { icon:'🏠', label:'Overview',    action:() => setActiveTab('overview'),  tab:'overview'  },
    { icon:'👧', label:'My Children', action:() => setActiveTab('children'),  tab:'children'  },
    { icon:'📅', label:'My Bookings', action:() => setActiveTab('bookings'),  tab:'bookings'  },
    { icon:'👩‍🍼',label:'Find a Nanny',action:() => setActiveTab('nannies'),   tab:'nannies'   },
    { icon:'💰', label:'Payments',    action:() => navigate('/payments'),     tab:'payments'  },
  ];

  const sidebarMore = [
    { icon:'💬', label:'Messages',      action:() => navigate('/messages')      },
    { icon:'❓', label:'Questions',     action:() => navigate('/questions')      },
    { icon:'📚', label:'Learning Hub',  action:() => navigate('/learning')      },
    { icon:'⭐', label:'Reviews',       action:() => navigate('/reviews')       },
    { icon:'🔔', label:'Notifications', action:() => navigate('/notifications') },
    { icon:'👤', label:'Edit Profile',  action:() => navigate('/profile/edit')  },
  ];

  return (
    <div style={s.page}>
      <div style={s.blob1}/><div style={s.blob2}/><div style={s.blob3}/>

      {/* Toast */}
      {toast && (
        <div style={{ ...s.toast, background: toast.type === 'success' ? 'linear-gradient(135deg,#43C6AC,#4FC3F7)' : 'linear-gradient(135deg,#FF5252,#FF1744)' }}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {reviewBooking && <ReviewModal booking={reviewBooking} onClose={() => setReviewBooking(null)} onSubmit={submitReview} />}
      {showAddChild  && <AddChildModal onClose={() => setShowAddChild(false)} onAdd={handleAddChild} />}

      {/* ════ NAVBAR ════ */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <button style={s.menuBtn} onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div style={{ ...s.brand, cursor:'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.chidcare.png" alt="Trusted Care" style={{ height:'32px', width:'auto' }} />
            <span style={s.brandText}>Trusted Care</span>
          </div>
        </div>
        <span style={s.navGreet}>{greeting}, {user?.name}!</span>
        <div style={s.navRight}>
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
                      style={{ background:'none', border:'none', color:'#4FC3F7', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" }}
                      onClick={() => { setShowNotif(false); navigate('/notifications'); }}
                    >View All →</button>
                  </div>
                </div>
                {notifications.map(n => (
                  <div key={n.id} style={{ ...s.notifItem, background: n.read ? 'transparent' : 'rgba(79,195,247,0.07)' }}>
                    <span style={{ fontSize:'1.2rem' }}>{n.icon}</span>
                    <div><p style={s.notifText}>{n.text}</p><span style={s.notifTime}>{n.time}</span></div>
                    {!n.read && <span style={s.notifDot}/>}
                  </div>
                ))}
              </div>
            )}
          </div>
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
          {/* ✅ FIX 1: removed invalid css={} prop — cursor already in s.avatarCircle */}
          <div
            style={{ ...s.avatarCircle, overflow:'hidden' }}
            onClick={() => navigate('/profile/edit')}
            title="Edit Profile"
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate('/profile/edit')}
          >
            {parentPhoto || user?.avatar || user?.parentPhoto ? (
              <img src={parentPhoto || getPhotoUrl(user.avatar || user.parentPhoto)} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'P'
            )}
          </div>
          <button style={s.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={s.layout}>
        {/* ════ SIDEBAR ════ */}
        <aside style={{ ...s.sidebar, width: sidebarOpen ? '240px' : '0', overflow:'hidden' }}>
          <div style={s.sideInner}>
            <p style={s.sideLabel}>MAIN MENU</p>
            {sidebarMain.map(item => (
              <button key={item.tab}
                style={{ ...s.sideBtn, ...(activeTab === item.tab ? s.sideBtnActive : {}) }}
                onClick={item.action}>
                <span>{item.icon}</span><span>{item.label}</span>
                {activeTab === item.tab && <span style={s.sideBar}/>}
              </button>
            ))}

            <p style={{ ...s.sideLabel, marginTop:'20px' }}>FEATURES</p>
            {sidebarMore.map((item, i) => (
              <button key={i} style={s.sideBtn} onClick={item.action}>
                <span>{item.icon}</span><span>{item.label}</span>
              </button>
            ))}

            <div style={s.profileCard}>
              <div style={{ ...s.profileAvatar, cursor:'pointer', overflow:'hidden' }} onClick={() => navigate('/profile/edit')}>
                {parentPhoto || user?.avatar || user?.parentPhoto ? (
                  <img src={parentPhoto || getPhotoUrl(user.avatar || user.parentPhoto)} alt="Profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'P'
                )}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={s.profileName}>{user?.name}</p>
                <p style={s.profileRole}>Parent • {children.length} child{children.length !== 1 ? 'ren' : ''}</p>
              </div>
              <button
                style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'0.9rem' }}
                onClick={() => navigate('/profile/edit')} title="Edit Profile"
              >✏️</button>
            </div>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main style={s.main}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={s.fadeIn}>
              {/* Hidden file inputs */}
              <input type="file" ref={parentPhotoInputRef} accept="image/*" style={{ display:'none' }} onChange={handleParentPhotoUpload} />
              <input type="file" ref={fatherPhotoInputRef} accept="image/*" style={{ display:'none' }} onChange={handleFatherPhotoUpload} />

              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>Parent Dashboard</h1>
                  <p style={s.subtitle}>Welcome back, {user?.name?.split(' ')[0]}!</p>
                </div>
                <button style={s.btnPrimary} onClick={() => setActiveTab('nannies')}>👩‍🍼 Book a Nanny</button>
              </div>

              {/* Family Photos Section */}
              <div style={{ background:'white', borderRadius:'20px', padding:'24px', marginBottom:'24px', boxShadow:'0 2px 16px rgba(26,35,126,0.08)' }}>
                <h3 style={{ fontFamily:"'Fredoka One',cursive", color:'#1A237E', margin:'0 0 16px', fontSize:'1.1rem' }}>📸 Family Photos</h3>
                <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', alignItems:'center' }}>
                  
                  {/* Mother's Photo */}
                  <div style={{ textAlign:'center' }}>
                    <div 
                      onClick={() => parentPhotoInputRef.current?.click()}
                      style={{ 
                        width:'80px', height:'80px', borderRadius:'50%', 
                        background: user?.parentPhoto ? 'transparent' : 'linear-gradient(135deg,#FCE7F3,#FBCFE8)',
                        border:'3px solid #EC4899', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        overflow:'hidden', transition:'all 0.2s',
                        boxShadow:'0 4px 12px rgba(236,72,153,0.2)'
                      }}
                    >
                      {parentPhoto || user?.parentPhoto ? (
                        <img src={parentPhoto || getPhotoUrl(user.parentPhoto)} alt="Mother" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <span style={{ fontSize:'2rem' }}>👩</span>
                      )}
                    </div>
                    <p style={{ fontSize:'0.78rem', color:'#90A4AE', fontWeight:600, margin:'8px 0 0' }}>Mother</p>
                    <button 
                      onClick={() => parentPhotoInputRef.current?.click()}
                      style={{ fontSize:'0.72rem', color:'#EC4899', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}
                    >
                      {user?.parentPhoto ? 'Change' : 'Add'}
                    </button>
                  </div>

                  {/* Father's Photo */}
                  <div style={{ textAlign:'center' }}>
                    <div 
                      onClick={() => fatherPhotoInputRef.current?.click()}
                      style={{ 
                        width:'80px', height:'80px', borderRadius:'50%', 
                        background: user?.fatherPhoto ? 'transparent' : 'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
                        border:'3px solid #3B82F6', cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        overflow:'hidden', transition:'all 0.2s',
                        boxShadow:'0 4px 12px rgba(59,130,246,0.2)'
                      }}
                    >
                      {fatherPhoto || user?.fatherPhoto ? (
                        <img src={fatherPhoto || getPhotoUrl(user.fatherPhoto)} alt="Father" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <span style={{ fontSize:'2rem' }}>👨</span>
                      )}
                    </div>
                    <p style={{ fontSize:'0.78rem', color:'#90A4AE', fontWeight:600, margin:'8px 0 0' }}>Father</p>
                    <button 
                      onClick={() => fatherPhotoInputRef.current?.click()}
                      style={{ fontSize:'0.72rem', color:'#3B82F6', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}
                    >
                      {user?.fatherPhoto ? 'Change' : 'Add'}
                    </button>
                  </div>

                  <div style={{ width:'1px', height:'60px', background:'#E3F2FD', margin:'0 8px' }} />

                  {/* Children Photos */}
                  {children.slice(0, 4).map((child, i) => (
                    <div key={child.id} style={{ textAlign:'center' }}>
                      <input 
                        type="file" 
                        ref={el => childPhotoInputRefs.current[child.id] = el} 
                        accept="image/*" 
                        style={{ display:'none' }} 
                        onChange={(e) => handleChildPhotoUpload(child.id, e)} 
                      />
                      <div 
                        onClick={() => childPhotoInputRefs.current[child.id]?.click()}
                        style={{ 
                          width:'70px', height:'70px', borderRadius:'50%', 
                          background: childPhotos[child.id] || child.photo ? 'transparent' : child.gender === 'Female' ? 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' : 'linear-gradient(135deg,#DBEAFE,#BFDBFE)',
                          border:`3px solid ${child.gender === 'Female' ? '#EC4899' : '#3B82F6'}`, cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          overflow:'hidden', transition:'all 0.2s',
                          boxShadow:`0 4px 12px ${child.gender === 'Female' ? 'rgba(236,72,153,0.2)' : 'rgba(59,130,246,0.2)'}`,
                          fontSize:'1.8rem'
                        }}
                      >
                        {childPhotos[child.id] || child.photo ? (
                          <img src={childPhotos[child.id] || getPhotoUrl(child.photo)} alt={child.childName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <span>{child.gender === 'Female' ? '👧' : '👦'}</span>
                        )}
                      </div>
                      <p style={{ fontSize:'0.72rem', color:'#90A4AE', fontWeight:600, margin:'6px 0 0', maxWidth:'70px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{child.childName}</p>
                    </div>
                  ))}

                  {children.length === 0 && (
                    <div style={{ textAlign:'center', padding:'10px 20px' }}>
                      <p style={{ fontSize:'0.82rem', color:'#90A4AE', margin:'0 0 8px' }}>No children added yet</p>
                      <button 
                        onClick={() => setShowAddChild(true)}
                        style={{ fontSize:'0.78rem', color:'#4FC3F7', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}
                      >
                        + Add Child
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stat Cards */}
              <div style={s.statsRow}>
                {[
                  { icon:'👧', label:'My Children',     value:children.length, color:'#4FC3F7', bg:'#E3F2FD' },
                  { icon:'📅', label:'Active Bookings', value:upcoming.length, color:'#43A047', bg:'#E8F5E9' },
                  { icon:'✅', label:'Completed',       value:completed.length,color:'#FB8C00', bg:'#FFF8E1' },
                  { icon:'💰', label:'Total Spent (₹)', value:totalSpent,      color:'#8E24AA', bg:'#F3E5F5' },
                ].map((stat, i) => (
                  <div key={i} style={{ ...s.statCard, animationDelay:`${i*0.1}s` }}>
                    <div style={{ ...s.statIcon, background:stat.bg }}>{stat.icon}</div>
                    <div>
                      <div style={{ ...s.statVal, color:stat.color }}><AnimatedNumber target={stat.value}/></div>
                      <div style={s.statLabel}>{stat.label}</div>
                    </div>
                    <div style={{ ...s.statStripe, background:stat.color }}/>
                  </div>
                ))}
              </div>

              {/* Pending Payment Alert */}
              {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').length > 0 && (
                <div style={{ background:'linear-gradient(135deg,#FEF3C7,#FDE68A)', border:'2px solid #F59E0B', borderRadius:'16px', padding:'20px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <span style={{ fontSize:'2.5rem' }}>💳</span>
                    <div>
                      <p style={{ fontWeight:800, color:'#92400E', fontSize:'1rem', margin:0 }}>Payment Pending!</p>
                      <p style={{ color:'#B45309', fontSize:'0.85rem', margin:'4px 0 0' }}>
                        You have {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').length} confirmed booking(s) awaiting payment
                      </p>
                    </div>
                  </div>
                  <button 
                    style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'white', border:'none', padding:'12px 24px', borderRadius:'999px', fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}
                    onClick={() => setActiveTab('bookings')}
                  >
                    💳 Pay Now
                  </button>
                </div>
              )}

              {/* Quick Actions */}
              <div style={s.quickGrid}>
                {[
                  { icon:'👩‍🍼', label:'Find Nanny',     action:() => setActiveTab('nannies'),   grad:'linear-gradient(135deg,#4FC3F7,#43C6AC)' },
                  { icon:'👧',  label:'Add Child',       action:() => setShowAddChild(true),     grad:'linear-gradient(135deg,#CE93D8,#9C27B0)' },
                  { icon:'💬',  label:'Messages',        action:() => navigate('/messages'),     grad:'linear-gradient(135deg,#69F0AE,#00C853)' },
                  { icon:'💰',  label:'Payments',        action:() => navigate('/payments'),     grad:'linear-gradient(135deg,#FFD54F,#FF8F00)' },
                  { icon:'📚',  label:'Learning Hub',    action:() => navigate('/learning'),     grad:'linear-gradient(135deg,#81D4FA,#0288D1)' },
                  { icon:'⭐',  label:'Reviews',         action:() => navigate('/reviews'),      grad:'linear-gradient(135deg,#FFCC80,#F4511E)' },
                  { icon:'🔔',  label:'Notifications',   action:() => navigate('/notifications'),grad:'linear-gradient(135deg,#F48FB1,#E91E63)' },
                  { icon:'👤',  label:'Edit Profile',    action:() => navigate('/profile/edit'), grad:'linear-gradient(135deg,#B39DDB,#512DA8)' },
                ].map((q, i) => (
                  <button key={i} style={{ ...s.quickBtn, background:q.grad, animationDelay:`${i*0.06}s` }} onClick={q.action}>
                    <span style={s.quickIcon}>{q.icon}</span>
                    <span style={s.quickLabel}>{q.label}</span>
                  </button>
                ))}
              </div>

              {/* Upcoming Bookings */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>📅 Upcoming Bookings</h2>
                  <button style={s.btnOutline} onClick={() => setActiveTab('bookings')}>View All</button>
                </div>
                {upcoming.length === 0
                  ? <EmptyState msg="No upcoming bookings" action={() => setActiveTab('nannies')} actionLabel="Book a Nanny"/>
                  : upcoming.slice(0,3).map(b => {
                    const caretakerData = typeof b.caretaker === 'object' ? b.caretaker : { _id: b.caretaker, name: b.caretakerName };
                    return (
                      <BookingCard key={b._id} b={b} statusColor={statusColor}
                        onCancel={() => cancelBooking(b._id)} onReview={() => setReviewBooking(b)}
                        onPay={(booking) => navigate('/payment', { 
                          state: { 
                            bookingType: 'nanny', 
                            nanny: { name: caretakerData.name || 'Caregiver', _id: caretakerData._id }, 
                            amount: booking.totalAmount || booking.amount || 0, 
                            bookingData: { 
                              bookingId: booking._id, 
                              startDate: booking.date,
                              caretakerId: caretakerData._id 
                            } 
                          } 
                        })}/>
                    );
                  })}
              </div>

              {/* Children preview */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>👧 My Children</h2>
                  <button style={s.btnPrimary} onClick={() => setShowAddChild(true)}>+ Add Child</button>
                </div>
                {children.length === 0
                  ? (
                    <div style={e.wrap}>
                      <span style={e.emoji}>👶</span>
                      <p style={e.msg}>No children added yet</p>
                      <button style={e.btn} onClick={() => setShowAddChild(true)}>+ Add Your First Child</button>
                    </div>
                  ) : (
                    <div style={s.childrenGrid}>
                      {children.map(c => <ChildCard key={c.id} c={c}/>)}
                      <div style={s.addChildCard} onClick={() => setShowAddChild(true)}>
                        <span style={{ fontSize:'2rem' }}>+</span>
                        <span style={{ fontWeight:700, color:'#90A4AE', fontSize:'0.88rem', marginTop:'6px' }}>Add Child</span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Featured Nannies */}
              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>⭐ Featured Nannies</h2>
                  <button style={s.btnOutline} onClick={() => navigate('/nannies')}>See All</button>
                </div>
                <div style={s.nanniesRow}>
                  {featuredNannies.map(n => (
                    <div key={n.id} style={s.nannyCard}>
                      <div style={s.nannyAvatarBox}>{n.avatar}</div>
                      <h3 style={s.nannyName}>{n.name}</h3>
                      <Stars rating={n.rating}/>
                      <p style={s.nannyExp}>{n.exp} experience</p>
                      <div style={s.nannyTags}>{n.tags.map((t,i) => <span key={i} style={s.nannyTag}>{t}</span>)}</div>
                      <div style={s.nannyFooter}>
                        <span style={s.nannyPrice}>₹{n.price}/hr</span>
                        <span style={{ ...s.availBadge, background:n.available?'#E8F5E9':'#F5F5F5', color:n.available?'#2E7D32':'#90A4AE' }}>
                          {n.available ? '🟢 Available' : '⚫ Busy'}
                        </span>
                      </div>
                      <button style={{ ...s.bookBtn, opacity:n.available?1:0.5 }}
                        disabled={!n.available} onClick={() => navigate('/booking')}>
                        {n.available ? '📅 Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature shortcuts row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginBottom:'22px' }}>
                {[
                  { icon:'📚', title:'Learning Hub',  desc:'Expert parenting courses & tips', path:'/learning',      bg:'#E3F2FD', color:'#0288D1'  },
                  { icon:'⭐', title:'Reviews',        desc:'Rate your nanny sessions',        path:'/reviews',       bg:'#FFF8E1', color:'#F57F17'  },
                  { icon:'🔔', title:'Notifications',  desc:'Your latest updates & alerts',    path:'/notifications', bg:'#F3E5F5', color:'#8E24AA'  },
                  { icon:'👤', title:'Edit Profile',   desc:'Update your account details',     path:'/profile/edit',  bg:'#E8F5E9', color:'#2E7D32'  },
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
            </div>
          )}

          {/* ── CHILDREN TAB ── */}
          {activeTab === 'children' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div>
                  <h1 style={s.h1}>My Children</h1>
                  <p style={s.subtitle}>{children.length} child{children.length !== 1 ? 'ren' : ''} registered</p>
                </div>
                <button style={s.btnPrimary} onClick={() => setShowAddChild(true)}>+ Add Child</button>
              </div>
              {children.length === 0 ? (
                <div style={{ ...e.wrap, padding:'60px 20px' }}>
                  <span style={{ fontSize:'4rem', display:'block', marginBottom:'16px' }}>👶</span>
                  <p style={{ ...e.msg, fontSize:'1.05rem' }}>No children added yet</p>
                  <p style={{ color:'#94A3B8', fontSize:'0.88rem', marginBottom:'20px' }}>Add your child's information so caretakers can provide the best care</p>
                  <button style={e.btn} onClick={() => setShowAddChild(true)}>+ Add Your First Child</button>
                </div>
              ) : (
                <div style={s.childrenGridFull}>
                  {children.map((c, i) => (
                    <div key={c.id} style={{ ...s.childCardFull, animationDelay:`${i*0.1}s` }}>
                      <div style={s.childCardHeader}>
                        <div style={{ ...s.childEmojiBig, overflow:'hidden', background:'white' }}>
                          {c.photo ? (
                            <img src={getPhotoUrl(c.photo)} alt={c.childName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          ) : (
                            <span>{c.emoji || (c.gender === 'Female' ? '👧' : '👦')}</span>
                          )}
                        </div>
                        <div style={{ flex:1 }}>
                          <h2 style={s.childNameBig}>{c.childName}</h2>
                          <p style={s.childGender}>{c.gender}</p>
                        </div>
                        <div style={{ display:'flex', gap:'8px' }}>
                          <input 
                            type="file" 
                            ref={el => childPhotoInputRefs.current[c.id] = el} 
                            accept="image/*" 
                            style={{ display:'none' }} 
                            onChange={(e) => handleChildPhotoUpload(c.id, e)} 
                          />
                          <button 
                            onClick={() => childPhotoInputRefs.current[c.id]?.click()}
                            style={{ background:'rgba(255,255,255,0.3)', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center' }}
                            title="Add photo"
                          >📷</button>
                          <button onClick={() => handleRemoveChild(c.id)}
                            style={{ background:'rgba(255,255,255,0.3)', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', fontSize:'0.9rem', color:'#E11D48', display:'flex', alignItems:'center', justifyContent:'center' }}
                            title="Remove child">✕</button>
                        </div>
                      </div>
                      <div style={s.childDetails}>
                        {[
                          { label:'Age',       value: c.age },
                          { label:'Gender',    value: c.gender },
                          { label:'Allergies', value: c.allergies || 'None' },
                          ...(c.notes ? [{ label:'Notes', value: c.notes }] : []),
                        ].map((row, j) => (
                          <div key={j} style={s.childDetailRow}>
                            <span style={s.childDetailLabel}>{row.label}</span>
                            <span style={s.childDetailValue}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div style={s.childBookings}>
                        <span style={s.childBookingCount}>
                          {bookings.filter(b => b.childName === c.childName).length} bookings
                        </span>
                      </div>
                    </div>
                  ))}
                  <div style={s.addChildCardFull} onClick={() => setShowAddChild(true)}>
                    <span style={{ fontSize:'2.5rem' }}>+</span>
                    <span style={{ fontWeight:700, color:'#90A4AE', marginTop:'10px' }}>Add Another Child</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>My Bookings</h1><p style={s.subtitle}>{bookings.length} total bookings</p></div>
                <button style={s.btnPrimary} onClick={() => navigate('/booking')}>+ New Booking</button>
              </div>

              <div style={s.filterRow}>
                {['All','confirmed','pending','completed','cancelled'].map(f => (
                  <button key={f}
                    style={{
                      ...s.filterPill,
                      background:   activeFilter === f ? '#1A237E' : 'white',
                      color:        activeFilter === f ? 'white'   : '#1A237E',
                      borderColor:  activeFilter === f ? '#1A237E' : '#E3F2FD',
                    }}
                    onClick={() => setActiveFilter(f)}
                  >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>

              {filteredBookings.length === 0
                ? <EmptyState
                    msg={activeFilter === 'All' ? 'No bookings yet' : `No ${activeFilter} bookings`}
                    action={activeFilter === 'All' ? () => navigate('/nannies') : undefined}
                    actionLabel="Book a Nanny"
                  />
                : filteredBookings.map(b => {
                    const caretakerData = typeof b.caretaker === 'object' ? b.caretaker : { _id: b.caretaker, name: b.caretakerName };
                    return (
                      <BookingCard key={b._id} b={b} statusColor={statusColor} full
                        onCancel={() => cancelBooking(b._id)} onReview={() => setReviewBooking(b)}
                        onPay={(booking) => navigate('/payment', { 
                          state: { 
                            bookingType: 'nanny', 
                            nanny: { name: caretakerData.name || 'Caregiver', _id: caretakerData._id }, 
                            amount: booking.totalAmount || booking.amount || 0, 
                            bookingData: { 
                              bookingId: booking._id, 
                              startDate: booking.date,
                              caretakerId: caretakerData._id 
                            } 
                          } 
                        })}/>
                    );
                  })}
            </div>
          )}

          {/* ── NANNIES TAB ── */}
          {activeTab === 'nannies' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>Find a Nanny</h1><p style={s.subtitle}>Browse trusted caretakers near you</p></div>
                <button style={s.btnOutline} onClick={() => navigate('/nannies')}>View Full List</button>
              </div>
              <div style={s.searchBar}>
                <span style={{ fontSize:'1.1rem', color:'#90A4AE' }}>🔍</span>
                <input style={s.searchInput} placeholder="Search by name, skills..."/>
                <button style={s.searchBtn} onClick={() => navigate('/nannies')}>Search</button>
              </div>
              <div style={s.nanniesGridFull}>
                {featuredNannies.map((n, i) => (
                  <div key={n.id} style={{ ...s.nannyCardFull, animationDelay:`${i*0.1}s` }}>
                    <div style={s.nannyCardTop}>
                      <div style={s.nannyAvatarLg}>{n.avatar}</div>
                      <div style={{ flex:1 }}>
                        <h3 style={s.nannyNameLg}>{n.name}</h3>
                        <Stars rating={n.rating}/>
                        <p style={s.nannyExpLg}>{n.exp} of experience</p>
                      </div>
                      <span style={{ ...s.availBadge, background:n.available?'#E8F5E9':'#F5F5F5', color:n.available?'#2E7D32':'#90A4AE' }}>
                        {n.available ? '🟢 Available' : '⚫ Busy'}
                      </span>
                    </div>
                    <div style={s.nannyTagsLg}>{n.tags.map((t,j) => <span key={j} style={s.nannyTag}>{t}</span>)}</div>
                    <div style={s.nannyCardFooter}>
                      <span style={s.nannyPriceLg}>₹{n.price}/hr</span>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button style={{ ...s.btnOutline, padding:'8px 14px', fontSize:'0.8rem' }} onClick={() => navigate('/reviews')}>⭐ Reviews</button>
                        <button style={{ ...s.bookBtnLg, opacity:n.available?1:0.5 }}
                          disabled={!n.available} onClick={() => navigate('/booking')}>
                          {n.available ? '📅 Book Now' : 'Unavailable'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === 'payments' && (
            <div style={s.fadeIn}>
              <div style={s.pageTitle}>
                <div><h1 style={s.h1}>💳 My Payments</h1><p style={s.subtitle}>Track your spending and pay for services</p></div>
                <button style={s.btnPrimary} onClick={() => navigate('/payments')}>Full History →</button>
              </div>

              <div style={s.paySummary}>
                {[
                  { icon:'💰', label:'Total Spent',      value:`₹${totalSpent}`,  color:'#1565C0', bg:'#E3F2FD' },
                  { icon:'✅', label:'Paid Sessions',    value:completed.length,   color:'#2E7D32', bg:'#E8F5E9' },
                  { icon:'⏳', label:'Pending Payments', value:upcoming.length,    color:'#F57F17', bg:'#FFF8E1' },
                ].map((item, i) => (
                  <div key={i} style={{ ...s.paySummaryCard, background:item.bg }}>
                    <span style={s.paySummaryIcon}>{item.icon}</span>
                    <span style={{ ...s.paySummaryVal, color:item.color }}>{item.value}</span>
                    <span style={s.paySummaryLabel}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Quick Pay Section */}
              {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').length > 0 && (
                <div style={{ ...s.sectionCard, marginBottom:'20px', border:'2px solid #F59E0B', background:'linear-gradient(135deg,#FEF3C7,#FFF7ED)' }}>
                  <div style={s.sectionHead}>
                    <h2 style={{ ...s.sectionTitle, color:'#D97706' }}>⚠️ Pending Payments</h2>
                    <button style={{ ...s.btnPrimary, background:'linear-gradient(135deg,#F59E0B,#D97706)' }} onClick={() => navigate('/payments')}>
                      Pay All Now
                    </button>
                  </div>
                  {bookings.filter(b => b.status === 'confirmed' && b.paymentStatus !== 'paid').map(b => {
                    const caretakerData = typeof b.caretaker === 'object' ? b.caretaker : { _id: b.caretaker, name: b.nannyName };
                    return (
                      <div key={b.id || b._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid rgba(245,158,11,0.2)' }}>
                        <div>
                          <p style={{ fontWeight:700, color:'#1A237E', margin:'0 0 4px' }}>{caretakerData?.name || 'Nanny'}</p>
                          <p style={{ fontSize:'0.82rem', color:'#90A4AE', margin:0 }}>{b.childName || 'Child'} • {b.date || b.startDate}</p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <span style={{ fontWeight:800, color:'#D97706', fontSize:'1.1rem' }}>₹{b.amount || b.totalAmount || 0}</span>
                          <button 
                            style={{ background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.82rem' }}
                            onClick={() => navigate('/payment', { 
                              state: { 
                                bookingType: 'nanny', 
                                nanny: { name: caretakerData?.name || 'Caregiver', _id: caretakerData?._id }, 
                                amount: b.amount || b.totalAmount || 0, 
                                bookingData: { bookingId: b.id || b._id, startDate: b.date || b.startDate, caretakerId: caretakerData?._id } 
                              } 
                            })}
                          >Pay Now</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={s.sectionCard}>
                <div style={s.sectionHead}>
                  <h2 style={s.sectionTitle}>💳 Transaction History</h2>
                </div>
                {bookings.length === 0
                  ? <EmptyState msg="No transactions yet"/>
                  : (
                    <table style={s.table}>
                      <thead>
                        <tr style={s.thead}>
                          {['Nanny','Child','Date','Amount','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => {
                          const sc = statusColor[b.status] || statusColor.Pending;
                          const isPaid = b.paymentStatus === 'paid';
                          return (
                            <tr key={b.id || b._id} style={s.tr}>
                              <td style={s.td}><span style={s.tdBold}>{b.nannyName}</span></td>
                              <td style={s.td}>{b.childName || '—'}</td>
                              <td style={s.td}>{b.startDate || b.date || '—'}</td>
                              <td style={{ ...s.td, fontWeight:800, color:'#2E7D32' }}>₹{b.amount || b.totalAmount || 0}</td>
                              <td style={s.td}>
                                <span style={{ ...s.badge, background:sc.bg, color:sc.color }}>{b.status}</span>
                                {isPaid && <span style={{ marginLeft:'6px', fontSize:'0.75rem', color:'#10B981' }}>💳 Paid</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

/* ── Sub Components ── */
const EmptyState = ({ msg, action, actionLabel }) => (
  <div style={e.wrap}>
    <span style={e.emoji}>🌸</span>
    <p style={e.msg}>{msg}</p>
    {action && <button style={e.btn} onClick={action}>{actionLabel}</button>}
  </div>
);
const e = {
  wrap:  { textAlign:'center', padding:'48px 20px', background:'#F9FBFF', borderRadius:'16px', border:'2px dashed #E3F2FD' },
  emoji: { fontSize:'2.5rem', display:'block', marginBottom:'12px' },
  msg:   { color:'#90A4AE', fontWeight:700, fontSize:'0.95rem', margin:'0 0 16px' },
  btn:   { background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'11px 28px', borderRadius:'999px', fontFamily:"'Nunito',sans-serif", fontWeight:800, cursor:'pointer', fontSize:'0.9rem' },
};

const ChildCard = ({ c }) => {
  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('/uploads/') || photo.startsWith('http')) {
      return photo.startsWith('http') ? photo : `http://localhost:5000${photo}`;
    }
    return null;
  };
  
  return (
    <div style={cc.card}>
      <div style={{ ...cc.emoji, overflow:'hidden' }}>
        {c.photo ? (
          <img src={getPhotoUrl(c.photo)} alt={c.childName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        ) : (
          <span>{c.emoji || (c.gender === 'Female' ? '👧' : '👦')}</span>
        )}
      </div>
      <h3 style={cc.name}>{c.childName}</h3>
      <p style={cc.age}>{c.age} • {c.gender}</p>
      {c.allergies && c.allergies !== 'None' && (
        <span style={cc.allergy}>⚠️ {c.allergies}</span>
      )}
    </div>
  );
};
const cc = {
  card:    { background:'linear-gradient(135deg,#F0F7FF,#E3F2FD)', borderRadius:'18px', padding:'20px', textAlign:'center', border:'1px solid #E3F2FD' },
  emoji:   { fontSize:'2.5rem', display:'block', marginBottom:'8px', width:'60px', height:'60px', borderRadius:'50%', background:'white', margin:'0 auto' },
  name:    { fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'#1A237E', margin:'0 0 4px' },
  age:     { color:'#90A4AE', fontSize:'0.82rem', fontWeight:600, margin:'0 0 8px' },
  allergy: { background:'#FFF8E1', color:'#F57F17', padding:'3px 10px', borderRadius:'999px', fontSize:'0.74rem', fontWeight:700, display:'inline-block' },
};

const BookingCard = ({ b, statusColor, onCancel, onReview, onPay }) => {
  const sc = statusColor[b.status] || statusColor.pending;
  // Handle caretaker - can be object or string
  const caretakerObj = typeof b.caretaker === 'object' ? b.caretaker : null;
  const caretakerName = caretakerObj?.name || b.caretakerName || 'Caregiver';
  const caretakerId = caretakerObj?._id || b.caretaker;
  const isPaid = b.paymentStatus === 'paid';
  const showPayButton = b.status === 'confirmed' && !isPaid;
  
  const handlePay = () => {
    if (onPay) {
      onPay({
        ...b,
        caretakerId: caretakerId,
        caretakerName: caretakerName,
        caretakerObj: caretakerObj
      });
    }
  };
  
  return (
    <div style={bc.card}>
      <div style={bc.avatar}>👩</div>
      <div style={{ flex:1 }}>
        <div style={bc.top}>
          <h3 style={bc.name}>{caretakerName}</h3>
          <span style={{ ...bc.badge, background:sc.bg, color:sc.color }}>{b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}</span>
          {isPaid && <span style={{ ...bc.badge, background:'#E8F5E9', color:'#2E7D32' }}>💳 Paid</span>}
        </div>
        <p style={bc.meta}>📅 {b.date || '—'} • 🕐 {b.startTime || '—'} – {b.endTime || '—'} • {b.duration || 0}hrs</p>
        <p style={bc.amount}>₹{b.totalAmount || b.amount || b.total || 0}</p>
      </div>
      <div style={bc.actions}>
        {showPayButton && (
          <button style={bc.btnPay} onClick={handlePay}>💳 Pay Now</button>
        )}
        {(b.status === 'confirmed' || b.status === 'pending') && !showPayButton && (
          <button style={bc.btnCancel} onClick={onCancel}>Cancel</button>
        )}
        {b.status === 'completed' && !b.rating && (
          <button style={bc.btnReview} onClick={onReview}>⭐ Rate</button>
        )}
        {b.rating && <span style={bc.rated}>⭐ {b.rating} Rated</span>}
      </div>
    </div>
  );
};
const bc = {
  card:      { display:'flex', alignItems:'center', gap:'14px', padding:'14px 0', borderBottom:'1px solid #F0F7FF' },
  avatar:    { width:'46px', height:'46px', borderRadius:'50%', background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 },
  top:       { display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' },
  name:      { fontWeight:800, color:'#1A237E', fontSize:'0.95rem', margin:0 },
  badge:     { display:'inline-block', padding:'3px 11px', borderRadius:'999px', fontSize:'0.74rem', fontWeight:700 },
  meta:      { color:'#90A4AE', fontSize:'0.8rem', fontWeight:600, margin:'0 0 3px' },
  amount:    { fontFamily:"'Fredoka One',cursive", fontSize:'1rem', color:'#2E7D32', margin:0 },
  actions:   { display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-end', flexShrink:0 },
  btnPay:    { background:'linear-gradient(135deg,#43C6AC,#4FC3F7)', color:'white', border:'none', padding:'8px 16px', borderRadius:'999px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:'0.78rem', cursor:'pointer', boxShadow:'0 4px 12px rgba(79,195,247,0.3)' },
  btnCancel: { background:'#FFEBEE', color:'#C62828', border:'none', padding:'6px 14px', borderRadius:'999px', fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:'0.78rem', cursor:'pointer' },
  btnReview: { background:'linear-gradient(135deg,#FFD54F,#FF8F00)', color:'#1A237E', border:'none', padding:'6px 14px', borderRadius:'999px', fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:'0.78rem', cursor:'pointer' },
  rated:     { color:'#FFD54F', fontSize:'0.78rem', fontWeight:700 },
};

/* ── Styles ── */
const F = "'Nunito', sans-serif";
const s = {
  page:    { minHeight:'100vh', background:'#F0F7FF', fontFamily:F, position:'relative', overflow:'hidden' },
  layout:  { display:'flex', position:'relative', zIndex:1 },
  main:    { flex:1, padding:'32px 40px', minHeight:'calc(100vh - 70px)', overflowX:'hidden' },
  blob1:   { position:'fixed', top:'-100px', left:'-100px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle,rgba(79,195,247,0.15) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob2:   { position:'fixed', bottom:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(206,147,216,0.13) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  blob3:   { position:'fixed', top:'40%', right:'5%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle,rgba(105,240,174,0.1) 0%,transparent 70%)', pointerEvents:'none', zIndex:0 },
  toast:   { position:'fixed', top:'24px', right:'24px', zIndex:9999, color:'white', padding:'14px 24px', borderRadius:'14px', fontWeight:700, fontSize:'0.92rem', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', fontFamily:F },
  nav:     { position:'sticky', top:0, zIndex:100, height:'70px', background:'linear-gradient(135deg,#1A237E 0%,#283593 100%)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', boxShadow:'0 4px 20px rgba(26,35,126,0.3)' },
  navLeft: { display:'flex', alignItems:'center', gap:'14px' },
  navRight:{ display:'flex', alignItems:'center', gap:'12px' },
  navGreet:{ fontFamily:"'Fredoka One',cursive", color:'rgba(255,255,255,0.88)', fontSize:'1rem' },
  menuBtn: { background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.2rem', width:'38px', height:'38px', borderRadius:'10px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F },
  brand:   { display:'flex', alignItems:'center', gap:'8px' },
  brandText:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.5rem', color:'white' },
  iconBtn: { position:'relative', background:'rgba(255,255,255,0.12)', border:'none', color:'white', fontSize:'1.1rem', width:'40px', height:'40px', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F },
  badge:   { position:'absolute', top:'4px', right:'4px', background:'#FF5252', color:'white', borderRadius:'50%', width:'16px', height:'16px', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' },
  // ✅ FIX 1: cursor:'pointer' added here — removed invalid css={} prop from JSX
  avatarCircle:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#4FC3F7,#CE93D8)', color:'white', fontWeight:800, fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' },
  logoutBtn:{ background:'linear-gradient(135deg,#FF5252,#FF1744)', color:'white', border:'none', padding:'8px 18px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' },
  notifPanel:{ position:'absolute', top:'52px', right:0, width:'320px', background:'white', borderRadius:'16px', boxShadow:'0 16px 48px rgba(26,35,126,0.18)', zIndex:200, overflow:'hidden', border:'1px solid #E3F2FD' },
  notifHead: { padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #E3F2FD', fontFamily:F, color:'#1A237E' },
  notifCount:{ background:'#E3F2FD', color:'#1565C0', padding:'3px 10px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700 },
  notifItem: { padding:'13px 20px', display:'flex', gap:'12px', alignItems:'flex-start', borderBottom:'1px solid #F5F5F5' },
  notifText: { fontSize:'0.85rem', color:'#37474F', fontWeight:600, margin:0, lineHeight:1.4 },
  notifTime: { fontSize:'0.74rem', color:'#90A4AE', marginTop:'3px', display:'block' },
  notifDot:  { width:'8px', height:'8px', borderRadius:'50%', background:'#4FC3F7', flexShrink:0, marginTop:'6px' },
  sidebar:   { background:'linear-gradient(180deg,#1A237E 0%,#283593 60%,#3949AB 100%)', transition:'width 0.35s ease', flexShrink:0 },
  sideInner: { padding:'24px 16px', width:'240px', height:'100%', display:'flex', flexDirection:'column' },
  sideLabel: { color:'rgba(255,255,255,0.4)', fontSize:'0.7rem', fontWeight:700, letterSpacing:'1.5px', marginBottom:'8px', marginTop:'4px', paddingLeft:'12px' },
  sideBtn:   { width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:'transparent', border:'none', borderRadius:'12px', color:'rgba(255,255,255,0.72)', fontFamily:F, fontSize:'0.9rem', fontWeight:600, cursor:'pointer', marginBottom:'3px', textAlign:'left', position:'relative', transition:'all 0.2s' },
  sideBtnActive:{ background:'rgba(255,255,255,0.15)', color:'white' },
  sideBar:   { position:'absolute', left:0, top:'20%', height:'60%', width:'3px', background:'#4FC3F7', borderRadius:'0 3px 3px 0' },
  profileCard:{ marginTop:'auto', background:'rgba(255,255,255,0.1)', borderRadius:'14px', padding:'14px 16px', display:'flex', gap:'10px', alignItems:'center' },
  profileAvatar:{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#4FC3F7,#CE93D8)', color:'white', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 },
  profileName:{ color:'white', fontWeight:700, fontSize:'0.85rem', margin:0 },
  profileRole:{ color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', margin:0 },
  fadeIn:   { animation:'fadeUp 0.5s ease' },
  pageTitle:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'14px' },
  h1:       { fontFamily:"'Fredoka One',cursive", fontSize:'2rem', color:'#1A237E', margin:0 },
  subtitle: { color:'#90A4AE', fontSize:'0.88rem', marginTop:'4px', fontWeight:600 },
  btnPrimary:{ background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'12px 26px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(79,195,247,0.4)', whiteSpace:'nowrap' },
  btnOutline:{ background:'transparent', border:'2px solid #4FC3F7', color:'#0288D1', padding:'9px 20px', borderRadius:'999px', fontFamily:F, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'18px', marginBottom:'24px' },
  statCard: { background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD', display:'flex', alignItems:'center', gap:'14px', position:'relative', overflow:'hidden' },
  statIcon: { width:'50px', height:'50px', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 },
  statVal:  { fontFamily:"'Fredoka One',cursive", fontSize:'1.9rem', lineHeight:1 },
  statLabel:{ color:'#90A4AE', fontSize:'0.78rem', fontWeight:600, marginTop:'3px' },
  statStripe:{ position:'absolute', top:0, left:0, right:0, height:'4px' },
  quickGrid:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'28px' },
  quickBtn: { border:'none', borderRadius:'16px', padding:'18px 10px', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', boxShadow:'0 6px 18px rgba(0,0,0,0.1)', transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' },
  quickIcon:{ fontSize:'1.6rem' },
  quickLabel:{ color:'white', fontWeight:800, fontSize:'0.78rem', textAlign:'center' },
  sectionCard:{ background:'white', borderRadius:'20px', padding:'24px', marginBottom:'22px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD' },
  sectionHead:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' },
  sectionTitle:{ fontFamily:"'Fredoka One',cursive", fontSize:'1.2rem', color:'#1A237E', margin:0 },
  childrenGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'14px' },
  addChildCard:{ background:'#F9FBFF', border:'2px dashed #E3F2FD', borderRadius:'18px', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#90A4AE', fontSize:'1.8rem', transition:'all 0.2s', minHeight:'120px' },
  nanniesRow:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'18px' },
  nannyCard: { background:'#F9FBFF', borderRadius:'18px', padding:'20px', border:'1px solid #E3F2FD', textAlign:'center' },
  nannyAvatarBox:{ width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 10px' },
  nannyName: { fontFamily:"'Fredoka One',cursive", fontSize:'1rem', color:'#1A237E', margin:'0 0 4px' },
  nannyExp:  { color:'#90A4AE', fontSize:'0.78rem', fontWeight:600, margin:'4px 0 8px' },
  nannyTags: { display:'flex', gap:'5px', flexWrap:'wrap', justifyContent:'center', marginBottom:'10px' },
  nannyTag:  { background:'rgba(79,195,247,0.12)', color:'#0288D1', padding:'3px 9px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 },
  nannyFooter:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' },
  nannyPrice:{ fontFamily:"'Fredoka One',cursive", color:'#2E7D32', fontSize:'1rem' },
  availBadge:{ padding:'3px 10px', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700 },
  bookBtn:   { width:'100%', background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'10px', borderRadius:'12px', fontFamily:F, fontWeight:800, cursor:'pointer', fontSize:'0.85rem' },
  childrenGridFull:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'18px' },
  childCardFull:   { background:'white', borderRadius:'20px', overflow:'hidden', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD' },
  childCardHeader: { background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', padding:'24px', display:'flex', gap:'14px', alignItems:'center' },
  childEmojiBig:   { fontSize:'2.8rem' },
  childNameBig:    { fontFamily:"'Fredoka One',cursive", fontSize:'1.4rem', color:'#1A237E', margin:'0 0 3px' },
  childGender:     { color:'#90A4AE', fontSize:'0.85rem', fontWeight:600, margin:0 },
  childDetails:    { padding:'16px 20px' },
  childDetailRow:  { display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #F0F7FF' },
  childDetailLabel:{ color:'#90A4AE', fontWeight:700, fontSize:'0.82rem' },
  childDetailValue:{ color:'#1A237E', fontWeight:700, fontSize:'0.88rem' },
  childBookings:   { padding:'12px 20px', background:'#F9FBFF', borderTop:'1px solid #F0F7FF' },
  childBookingCount:{ color:'#4FC3F7', fontWeight:800, fontSize:'0.85rem' },
  addChildCardFull:{ background:'#F9FBFF', border:'2px dashed #E3F2FD', borderRadius:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', cursor:'pointer', color:'#90A4AE', fontSize:'0.9rem', transition:'all 0.2s' },
  searchBar:  { display:'flex', alignItems:'center', gap:'12px', background:'white', border:'2px solid #E3F2FD', borderRadius:'999px', padding:'0 20px', height:'50px', marginBottom:'24px', boxShadow:'0 4px 12px rgba(26,35,126,0.06)' },
  searchInput:{ flex:1, border:'none', outline:'none', fontFamily:F, fontSize:'0.92rem', color:'#37474F' },
  searchBtn:  { background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'9px 22px', borderRadius:'999px', fontFamily:F, fontWeight:700, cursor:'pointer', fontSize:'0.85rem' },
  nanniesGridFull:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'18px' },
  nannyCardFull:  { background:'white', borderRadius:'20px', padding:'22px', boxShadow:'0 4px 16px rgba(26,35,126,0.08)', border:'1px solid #E3F2FD' },
  nannyCardTop:   { display:'flex', gap:'14px', alignItems:'flex-start', marginBottom:'12px' },
  nannyAvatarLg:  { width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg,#E3F2FD,#F3E5F5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 },
  nannyNameLg:    { fontFamily:"'Fredoka One',cursive", fontSize:'1.1rem', color:'#1A237E', margin:'0 0 4px' },
  nannyExpLg:     { color:'#90A4AE', fontSize:'0.78rem', fontWeight:600, margin:'4px 0 0' },
  nannyTagsLg:    { display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' },
  nannyCardFooter:{ display:'flex', justifyContent:'space-between', alignItems:'center' },
  nannyPriceLg:   { fontFamily:"'Fredoka One',cursive", color:'#2E7D32', fontSize:'1.2rem' },
  bookBtnLg:      { background:'linear-gradient(135deg,#4FC3F7,#43C6AC)', color:'white', border:'none', padding:'11px 24px', borderRadius:'999px', fontFamily:F, fontWeight:800, cursor:'pointer', fontSize:'0.88rem' },
  filterRow:  { display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' },
  filterPill: { padding:'8px 18px', border:'2px solid #E3F2FD', borderRadius:'999px', background:'white', fontFamily:F, fontWeight:700, fontSize:'0.82rem', cursor:'pointer', color:'#1A237E', transition:'all 0.2s' },
  paySummary: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'16px', marginBottom:'24px' },
  paySummaryCard: { borderRadius:'18px', padding:'22px 20px', textAlign:'center', border:'1px solid rgba(255,255,255,0.6)', boxShadow:'0 4px 12px rgba(26,35,126,0.06)' },
  paySummaryIcon: { fontSize:'1.8rem', display:'block', marginBottom:'8px' },
  paySummaryVal:  { fontFamily:"'Fredoka One',cursive", fontSize:'1.8rem', display:'block' },
  paySummaryLabel:{ color:'#90A4AE', fontSize:'0.78rem', fontWeight:700, display:'block', marginTop:'4px' },
  table:      { width:'100%', borderCollapse:'collapse' },
  thead:      { background:'linear-gradient(135deg,#1A237E,#283593)' },
  th:         { padding:'12px 16px', textAlign:'left', color:'rgba(255,255,255,0.85)', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.4px', textTransform:'uppercase' },
  tr:         { borderBottom:'1px solid #F0F7FF' },
  td:         { padding:'13px 16px', fontSize:'0.88rem', color:'#37474F' },
  tdBold:     { fontWeight:700, color:'#1A237E' },
  badge:      { display:'inline-block', padding:'4px 12px', borderRadius:'999px', fontSize:'0.75rem', fontWeight:700 },
};

if (!document.getElementById('parent-kf')) {
  const t = document.createElement('style');
  t.id = 'parent-kf';
  t.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Fredoka+One&display=swap');
    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes popIn   { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
    @keyframes floatBlob { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
    aside button:hover { background: rgba(255,255,255,0.15) !important; color: white !important; }
    tbody tr:hover td  { background: rgba(79,195,247,0.04); }
    .lp-quick-btn:hover { transform: translateY(-3px) !important; }
  `;
  document.head.appendChild(t);
}

export default ParentDashboard;