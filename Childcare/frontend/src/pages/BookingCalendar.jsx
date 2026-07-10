import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   CSS Injector — UNCHANGED
───────────────────────────────────────────── */
const injectCSS = () => {
  if (document.getElementById('booking-styles')) return;
  const style = document.createElement('style');
  style.id = 'booking-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');

    .bk-root {
      font-family: 'Quicksand', sans-serif;
      background: #F0F9FF;
      min-height: 100vh;
      color: #0F172A;
    }
    .bk-hero {
      background: linear-gradient(135deg, #7C3AED 0%, #0EA5E9 100%);
      padding: 72px 48px 52px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .bk-hero::before {
      content: '';
      position: absolute; top: -80px; right: -80px;
      width: 280px; height: 280px; border-radius: 50%;
      background: rgba(255,255,255,0.07);
      animation: bkBlob 10s ease-in-out infinite;
    }
    .bk-hero::after {
      content: '';
      position: absolute; bottom: -60px; left: -60px;
      width: 220px; height: 220px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
      animation: bkBlob 13s ease-in-out infinite reverse;
    }
    @keyframes bkBlob {
      0%,100% { transform: translate(0,0) scale(1); }
      50%      { transform: translate(20px,-25px) scale(1.08); }
    }
    .bk-hero-tag {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      color: white; font-weight: 700; font-size: 0.82rem;
      padding: 5px 16px; border-radius: 999px;
      letter-spacing: 1px; text-transform: uppercase;
      margin-bottom: 14px; position: relative; z-index: 1;
    }
    .bk-hero h1 {
      font-family: 'Baloo 2', cursive;
      font-size: 2.6rem; font-weight: 800; color: white;
      margin-bottom: 10px;
      position: relative; z-index: 1;
      animation: bkFade 0.6s ease;
    }
    .bk-hero p {
      color: rgba(255,255,255,0.82); font-size: 1rem;
      position: relative; z-index: 1;
    }
    @keyframes bkFade {
      from { opacity:0; transform:translateY(-16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .bk-steps {
      display: flex; align-items: center; justify-content: center;
      gap: 0; padding: 28px 48px;
      background: white;
      border-bottom: 1px solid #E0F2FE;
    }
    .bk-step {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.88rem; font-weight: 700; color: #94A3B8;
    }
    .bk-step.active { color: #7C3AED; }
    .bk-step.done { color: #34D399; }
    .bk-step-circle {
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.82rem; font-weight: 800;
      background: #F1F5F9; color: #94A3B8;
      transition: all 0.3s;
    }
    .bk-step.active .bk-step-circle {
      background: #7C3AED; color: white;
      box-shadow: 0 4px 12px rgba(124,58,237,0.35);
    }
    .bk-step.done .bk-step-circle { background: #34D399; color: white; }
    .bk-step-line {
      width: 60px; height: 2px;
      background: #E0F2FE; margin: 0 4px;
      transition: background 0.3s;
    }
    .bk-step-line.done { background: #34D399; }
    .bk-body {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 28px;
      max-width: 1140px; margin: 0 auto;
      padding: 36px 24px 60px;
    }
    .bk-panel {
      background: white; border-radius: 24px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      animation: panelIn 0.4s ease;
    }
    @keyframes panelIn {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .bk-panel-title {
      font-family: 'Baloo 2', cursive;
      font-size: 1.25rem; font-weight: 800;
      margin-bottom: 24px; color: #0F172A;
      display: flex; align-items: center; gap: 10px;
    }
    .nanny-select-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
    }
    .nanny-opt {
      border: 2px solid #E0F2FE; border-radius: 18px;
      padding: 16px; cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      transition: all 0.2s;
      position: relative;
    }
    .nanny-opt:hover { border-color: #A78BFA; background: #FAF5FF; }
    .nanny-opt.selected {
      border-color: #7C3AED;
      background: linear-gradient(135deg, #FAF5FF, #EFF6FF);
      box-shadow: 0 4px 16px rgba(124,58,237,0.15);
    }
    .nanny-opt-check {
      position: absolute; top: 10px; right: 10px;
      width: 22px; height: 22px; border-radius: 50%;
      background: #7C3AED; color: white;
      font-size: 0.75rem;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transform: scale(0);
      transition: all 0.2s cubic-bezier(.34,1.56,.64,1);
    }
    .nanny-opt.selected .nanny-opt-check { opacity:1; transform:scale(1); }
    .nanny-opt-avatar {
      width: 48px; height: 48px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; flex-shrink: 0;
    }
    .nanny-opt-name { font-weight: 700; font-size: 0.9rem; color: #0F172A; }
    .nanny-opt-role { font-size: 0.75rem; color: #7C3AED; font-weight: 600; }
    .nanny-opt-rate { font-size: 0.75rem; color: #64748B; margin-top: 2px; }
    .nanny-opt-stars { color: #F59E0B; font-size: 0.75rem; }
    .cal-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
    }
    .cal-month {
      font-family: 'Baloo 2', cursive;
      font-size: 1.15rem; font-weight: 800; color: #0F172A;
    }
    .cal-nav {
      width: 36px; height: 36px; border-radius: 10px;
      border: 2px solid #E0F2FE; background: white;
      cursor: pointer; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .cal-nav:hover { border-color: #7C3AED; color: #7C3AED; }
    .cal-weekdays {
      display: grid; grid-template-columns: repeat(7,1fr);
      margin-bottom: 8px;
    }
    .cal-wd {
      text-align: center; font-size: 0.72rem;
      font-weight: 700; color: #94A3B8;
      padding: 6px 0;
    }
    .cal-days {
      display: grid; grid-template-columns: repeat(7,1fr);
      gap: 4px;
    }
    .cal-day {
      aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      border-radius: 10px; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      position: relative;
    }
    .cal-day:hover:not(.empty):not(.past) { background: #FAF5FF; color: #7C3AED; }
    .cal-day.past { color: #CBD5E1; cursor: not-allowed; }
    .cal-day.empty { cursor: default; }
    .cal-day.today { color: #7C3AED; font-weight: 800; }
    .cal-day.today::after {
      content: '';
      position: absolute; bottom: 4px;
      width: 4px; height: 4px; border-radius: 50%;
      background: #7C3AED;
    }
    .cal-day.selected {
      background: #7C3AED; color: white !important;
      box-shadow: 0 4px 12px rgba(124,58,237,0.35);
    }
    .cal-day.has-slots::before {
      content: '';
      position: absolute; top: 4px; right: 4px;
      width: 5px; height: 5px; border-radius: 50%;
      background: #34D399;
    }
    .slots-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
      margin-top: 8px;
    }
    .slot {
      padding: 10px 6px; border-radius: 12px;
      border: 2px solid #E0F2FE;
      text-align: center; cursor: pointer;
      font-size: 0.8rem; font-weight: 700;
      color: #64748B;
      transition: all 0.2s;
    }
    .slot:hover:not(.booked) { border-color: #7C3AED; color: #7C3AED; background: #FAF5FF; }
    .slot.selected { background: #7C3AED; color: white; border-color: #7C3AED; box-shadow: 0 4px 12px rgba(124,58,237,0.3); }
    .slot.booked { background: #F8FAFC; color: #CBD5E1; cursor: not-allowed; border-style: dashed; }
    .slot-time { font-size: 0.82rem; }
    .slot-label { font-size: 0.68rem; font-weight: 600; opacity: 0.7; margin-top: 2px; }
    .duration-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .dur-btn {
      padding: 10px 20px; border-radius: 999px;
      border: 2px solid #E0F2FE;
      background: white; color: #64748B;
      font-family: 'Quicksand',sans-serif;
      font-size: 0.85rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
    }
    .dur-btn:hover { border-color: #7C3AED; color: #7C3AED; }
    .dur-btn.selected {
      background: #7C3AED; color: white; border-color: #7C3AED;
      box-shadow: 0 4px 12px rgba(124,58,237,0.3);
    }
    .bk-textarea {
      width: 100%; padding: 14px;
      border: 2px solid #E0F2FE; border-radius: 14px;
      font-family: 'Quicksand',sans-serif;
      font-size: 0.9rem; font-weight: 600; color: #0F172A;
      resize: none; outline: none;
      transition: all 0.2s;
      background: #F8FAFC;
      box-sizing: border-box;
    }
    .bk-textarea:focus { border-color: #7C3AED; background: white; box-shadow: 0 0 0 4px rgba(124,58,237,0.1); }
    .bk-summary { position: sticky; top: 24px; align-self: start; }
    .summary-card {
      background: white; border-radius: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .summary-header {
      background: linear-gradient(135deg, #7C3AED, #0EA5E9);
      padding: 20px 24px;
    }
    .summary-header h3 {
      font-family: 'Baloo 2',cursive;
      font-size: 1.1rem; font-weight: 800; color: white;
      margin-bottom: 4px;
    }
    .summary-header p { color: rgba(255,255,255,0.75); font-size: 0.82rem; }
    .summary-body { padding: 24px; }
    .sum-nanny {
      display: flex; align-items: center; gap: 14px;
      padding: 14px; border-radius: 16px;
      background: #F8FAFC; margin-bottom: 20px;
    }
    .sum-nanny-av {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; flex-shrink: 0;
    }
    .sum-nanny-name { font-weight: 800; font-size: 0.95rem; }
    .sum-nanny-role { font-size: 0.78rem; color: #7C3AED; font-weight: 600; }
    .sum-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #F1F5F9;
      font-size: 0.88rem;
    }
    .sum-row:last-of-type { border-bottom: none; }
    .sum-row-label { color: #64748B; font-weight: 600; }
    .sum-row-val { font-weight: 800; color: #0F172A; }
    .sum-empty { color: #CBD5E1; font-style: italic; }
    .sum-total {
      background: linear-gradient(135deg, #FAF5FF, #EFF6FF);
      border-radius: 14px; padding: 16px;
      margin: 16px 0;
      display: flex; justify-content: space-between; align-items: center;
      border: 1.5px solid #DDD6FE;
    }
    .sum-total-label { font-weight: 700; color: #7C3AED; }
    .sum-total-amt {
      font-family: 'Baloo 2',cursive;
      font-size: 1.6rem; font-weight: 800; color: #7C3AED;
    }
    .bk-confirm-btn {
      width: 100%; padding: 15px;
      background: linear-gradient(135deg, #7C3AED, #0EA5E9);
      color: white; border: none; border-radius: 16px;
      font-family: 'Quicksand',sans-serif;
      font-size: 1rem; font-weight: 800;
      cursor: pointer;
      transition: all 0.25s;
      position: relative; overflow: hidden;
    }
    .bk-confirm-btn::after {
      content:''; position:absolute; inset:0;
      background: rgba(255,255,255,0.2);
      transform: translateX(-100%);
      transition: transform 0.4s;
    }
    .bk-confirm-btn:hover::after { transform: translateX(100%); }
    .bk-confirm-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
    .bk-confirm-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; box-shadow:none; }
    .sum-checklist { margin-bottom: 14px; }
    .sum-check {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem; color: #64748B; font-weight: 600;
      margin-bottom: 6px;
    }
    .sum-check.done { color: #059669; }
    .success-overlay {
      position: fixed; inset: 0; z-index: 300;
      background: rgba(15,23,42,0.6); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.2s ease;
    }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .success-modal {
      background: white; border-radius: 28px;
      padding: 48px 40px; text-align: center;
      max-width: 440px; width: 90%;
      box-shadow: 0 32px 80px rgba(0,0,0,0.25);
      animation: popSpring 0.5s cubic-bezier(.34,1.56,.64,1);
    }
    @keyframes popSpring {
      from { opacity:0; transform:scale(0.8) translateY(30px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
    .success-icon { font-size: 4.5rem; margin-bottom: 16px; animation: bounce 1s ease infinite; }
    @keyframes bounce {
      0%,100% { transform:translateY(0); }
      50%      { transform:translateY(-12px); }
    }
    .success-modal h2 {
      font-family:'Baloo 2',cursive; font-size:1.8rem; font-weight:800;
      color:#0F172A; margin-bottom:10px;
    }
    .success-modal p { color:#64748B; font-size:0.95rem; line-height:1.65; margin-bottom:28px; }
    .success-ref {
      background: #F0FDF4; border-radius: 12px;
      padding: 12px 20px; margin-bottom: 24px;
      font-weight: 700; color: #059669; font-size: 0.9rem;
    }
    .success-btn {
      background: linear-gradient(135deg,#7C3AED,#0EA5E9);
      color:white; border:none; border-radius:999px;
      padding:13px 36px;
      font-family:'Quicksand',sans-serif;
      font-size:1rem; font-weight:800;
      cursor:pointer; transition:all 0.25s;
    }
    .success-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(124,58,237,0.4); }
    @media (max-width: 900px) {
      .bk-body { grid-template-columns: 1fr; }
      .bk-summary { position: static; }
      .bk-hero { padding: 56px 24px 40px; }
      .bk-hero h1 { font-size:2rem; }
      .bk-steps { padding: 20px 16px; gap: 0; flex-wrap: wrap; }
      .bk-step-line { width: 30px; }
      .nanny-select-grid { grid-template-columns: 1fr; }
      .slots-grid { grid-template-columns: repeat(4,1fr); }
    }
  `;
  document.head.appendChild(style);
};

/* ─────────────────────────────────────────────
   Constants — UNCHANGED
───────────────────────────────────────────── */
const BG_COLORS = [
  'linear-gradient(135deg,#BAE6FD,#7DD3FC)',
  'linear-gradient(135deg,#BBF7D0,#6EE7B7)',
  'linear-gradient(135deg,#EDE9FE,#C4B5FD)',
  'linear-gradient(135deg,#CFFAFE,#A5F3FC)',
];
const EMOJIS = ['👩','👨','👩‍🦳','👩‍🏫'];

const DURATIONS = [
  { label:'2 Hours', hours:2 },
  { label:'4 Hours', hours:4 },
  { label:'6 Hours', hours:6 },
  { label:'Full Day', hours:8 },
];

const TIME_SLOTS = [
  { time:'07:00', label:'Early Morning' },
  { time:'08:00', label:'Morning' },
  { time:'09:00', label:'Morning' },
  { time:'10:00', label:'Late Morning' },
  { time:'11:00', label:'Late Morning' },
  { time:'12:00', label:'Noon' },
  { time:'13:00', label:'Afternoon' },
  { time:'14:00', label:'Afternoon' },
  { time:'15:00', label:'Late Afternoon' },
  { time:'16:00', label:'Evening' },
  { time:'17:00', label:'Evening' },
  { time:'18:00', label:'Late Evening' },
];

const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function BookingCalendar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const today     = new Date();

  const preSelected = location.state?.nanny || null;

  const [step,          setStep]     = useState(preSelected ? 2 : 1);
  const [selectedNanny, setNanny]    = useState(preSelected);
  const [nannies,       setNannies]  = useState([]);
  const [calYear,       setCalYear]  = useState(today.getFullYear());
  const [calMonth,      setCalMonth] = useState(today.getMonth());
  const [selectedDate,  setDate]     = useState(null);
  const [selectedTime,  setTime]     = useState(null);
  const [bookedSlots,   setBooked]   = useState([]);
  const [duration,      setDuration] = useState(null);
  const [notes,         setNotes]    = useState('');
  const [success,       setSuccess]  = useState(false);
  const [refCode,       setRefCode]  = useState('');
  const [submitting,    setSubmitting] = useState(false);
  const [error,         setError]    = useState('');

  useEffect(() => {
    injectCSS();
    fetchNannies();
  }, []);

  // Fetch real booked slots whenever date or nanny changes
  useEffect(() => {
    if (selectedDate && selectedNanny?.id) {
      fetchBookedSlots();
    }
  }, [selectedDate, selectedNanny]);

  const fetchNannies = async () => {
    try {
      const res = await usersAPI.getCaretakers();
      const mapped = (res.caretakers || []).map((c, i) => ({
        id:    c._id,
        emoji: EMOJIS[i % EMOJIS.length],
        name:  c.name,
        role:  c.specializations?.[0] || 'Caretaker',
        rate:  c.hourlyRate || 0,
        stars: Math.round(c.rating) || 5,
        bg:    BG_COLORS[i % BG_COLORS.length],
      }));
      setNannies(mapped);
    } catch {
      // silently fail — preSelected nanny still works
    }
  };

  const fetchBookedSlots = async () => {
    try {
      // Format date as YYYY-MM-DD for backend
      const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2,'0')}-${String(selectedDate.day).padStart(2,'0')}`;
      const res = await bookingsAPI.getSlots(selectedNanny.id, dateStr);
      // res.slots = [{ startTime, endTime }]
      // Extract startTime values to match against TIME_SLOTS
      const taken = (res.slots || []).map(s => s.startTime);
      setBooked(taken);
    } catch {
      setBooked([]);
    }
  };

  /* Build calendar days — UNCHANGED */
  const calDays = useMemo(() => {
    const firstDay    = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calYear, calMonth]);

  const isPast = (d) => {
    const dt = new Date(calYear, calMonth, d);
    dt.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return dt < t;
  };
  const isToday = (d) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const isSelected = (d) =>
    selectedDate?.day === d && selectedDate?.month === calMonth && selectedDate?.year === calYear;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setDate(null); setTime(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setDate(null); setTime(null);
  };

  const total = selectedNanny && duration
    ? selectedNanny.rate * duration.hours
    : null;

  const formattedDate = selectedDate
    ? `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2,'0')}-${String(selectedDate.day).padStart(2,'0')}`
    : null;

  const displayDate = selectedDate
    ? `${selectedDate.day} ${MONTHS[selectedDate.month]} ${selectedDate.year}`
    : null;

  /* Confirm booking — now calls real backend */
  const confirmBooking = async () => {
    if (!selectedNanny || !selectedDate || !selectedTime || !duration) return;
    setSubmitting(true);
    setError('');

    try {
      // Calculate endTime from startTime + duration hours
      const [h, m]   = selectedTime.split(':').map(Number);
      const endH     = h + duration.hours;
      const endTime  = `${String(endH).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

      const res = await bookingsAPI.create({
        caretakerId:   selectedNanny.id,
        date:          formattedDate,       // YYYY-MM-DD
        startTime:     selectedTime,        // HH:MM
        endTime,                            // HH:MM
        childrenCount: 1,
        notes,
      });

      setRefCode(res.booking?._id || 'confirmed');
      
      // Store booking info for payment
      if (res.booking) {
        localStorage.setItem('pendingBooking', JSON.stringify({
          bookingId: res.booking._id,
          nanny: selectedNanny,
          amount: res.booking.totalAmount,
        }));
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ['Choose Nanny', 'Pick Date & Time', 'Booking Details'];

  return (
    <div className="bk-root">

      {/* Hero — UNCHANGED */}
      <div className="bk-hero">
        <div className="bk-hero-tag">📅 Easy Booking</div>
        <h1>Book a Caretaker 🌟</h1>
        <p>3 simple steps — choose your nanny, pick a time, and you're done!</p>
      </div>

      {/* Step Progress — UNCHANGED */}
      <div className="bk-steps">
        {stepLabels.map((label, i) => (
          <React.Fragment key={i}>
            <div className={`bk-step ${step === i+1 ? 'active' : step > i+1 ? 'done' : ''}`}>
              <div className="bk-step-circle">{step > i+1 ? '✓' : i+1}</div>
              {label}
            </div>
            {i < 2 && <div className={`bk-step-line ${step > i+1 ? 'done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bk-body">
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

          {/* STEP 1 — Choose Nanny — UNCHANGED UI */}
          <div className="bk-panel">
            <div className="bk-panel-title">👩‍🍼 Step 1 — Choose a Caretaker</div>
            <div className="nanny-select-grid">
              {nannies.map(n => (
                <div
                  key={n.id}
                  className={`nanny-opt ${selectedNanny?.id === n.id ? 'selected' : ''}`}
                  onClick={() => { setNanny(n); if (step < 2) setStep(2); }}
                >
                  <div className="nanny-opt-check">✓</div>
                  <div className="nanny-opt-avatar" style={{ background: n.bg }}>{n.emoji}</div>
                  <div>
                    <div className="nanny-opt-name">{n.name}</div>
                    <div className="nanny-opt-role">{n.role}</div>
                    <div className="nanny-opt-stars">{'★'.repeat(n.stars)}</div>
                    <div className="nanny-opt-rate">₹{n.rate}/hr</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2 — Calendar — UNCHANGED UI */}
          {step >= 2 && (
            <div className="bk-panel">
              <div className="bk-panel-title">📅 Step 2 — Pick a Date</div>
              <div className="cal-header">
                <button className="cal-nav" onClick={prevMonth}>‹</button>
                <div className="cal-month">{MONTHS[calMonth]} {calYear}</div>
                <button className="cal-nav" onClick={nextMonth}>›</button>
              </div>
              <div className="cal-weekdays">
                {WEEKDAYS.map(w => <div className="cal-wd" key={w}>{w}</div>)}
              </div>
              <div className="cal-days">
                {calDays.map((d, i) => (
                  <div
                    key={i}
                    className={[
                      'cal-day',
                      !d ? 'empty' : '',
                      d && isPast(d) ? 'past' : '',
                      d && isToday(d) ? 'today' : '',
                      d && isSelected(d) ? 'selected' : '',
                      d && !isPast(d) ? 'has-slots' : '',
                    ].join(' ')}
                    onClick={() => {
                      if (!d || isPast(d)) return;
                      setDate({ day: d, month: calMonth, year: calYear });
                      setTime(null);
                      if (step < 3) setStep(3);
                    }}
                  >{d}</div>
                ))}
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div style={{ marginTop: 28 }}>
                  <div className="bk-panel-title" style={{ fontSize:'1rem', marginBottom:14 }}>
                    🕐 Available Time Slots — {displayDate}
                  </div>
                  <div className="slots-grid">
                    {TIME_SLOTS.map(s => (
                      <div
                        key={s.time}
                        className={[
                          'slot',
                          bookedSlots.includes(s.time) ? 'booked' : '',
                          selectedTime === s.time ? 'selected' : '',
                        ].join(' ')}
                        onClick={() => !bookedSlots.includes(s.time) && setTime(s.time)}
                      >
                        <div className="slot-time">{s.time}</div>
                        <div className="slot-label">
                          {bookedSlots.includes(s.time) ? 'Booked' : s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Details — UNCHANGED UI */}
          {step >= 3 && (
            <div className="bk-panel">
              <div className="bk-panel-title">📋 Step 3 — Booking Details</div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:12, color:'#0F172A' }}>
                  ⏱️ Session Duration
                </div>
                <div className="duration-row">
                  {DURATIONS.map(d => (
                    <button
                      key={d.label}
                      className={`dur-btn ${duration?.hours === d.hours ? 'selected' : ''}`}
                      onClick={() => setDuration(d)}
                    >{d.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10, color:'#0F172A' }}>
                  📝 Special Instructions (optional)
                </div>
                <textarea
                  className="bk-textarea"
                  rows={4}
                  placeholder="Any allergies, special routines, emergency contacts..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              {error && (
                <div style={{ marginTop:12, padding:'10px 14px', background:'#FEF2F2', borderRadius:10, color:'#DC2626', fontSize:'0.88rem', fontWeight:600 }}>
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Sidebar — UNCHANGED UI */}
        <div className="bk-summary">
          <div className="summary-card">
            <div className="summary-header">
              <h3>📋 Booking Summary</h3>
              <p>Review your details before confirming</p>
            </div>
            <div className="summary-body">
              {selectedNanny ? (
                <div className="sum-nanny">
                  <div className="sum-nanny-av" style={{ background: selectedNanny.bg }}>{selectedNanny.emoji}</div>
                  <div>
                    <div className="sum-nanny-name">{selectedNanny.name}</div>
                    <div className="sum-nanny-role">{selectedNanny.role}</div>
                    <div style={{ fontSize:'0.75rem', color:'#64748B', marginTop:2 }}>₹{selectedNanny.rate}/hr</div>
                  </div>
                </div>
              ) : (
                <div className="sum-nanny">
                  <div style={{ fontSize:'0.85rem', color:'#94A3B8', fontWeight:600 }}>No caretaker selected yet</div>
                </div>
              )}
              <div className="sum-row">
                <span className="sum-row-label">📅 Date</span>
                <span className="sum-row-val">{displayDate || <span className="sum-empty">Not selected</span>}</span>
              </div>
              <div className="sum-row">
                <span className="sum-row-label">🕐 Time</span>
                <span className="sum-row-val">{selectedTime || <span className="sum-empty">Not selected</span>}</span>
              </div>
              <div className="sum-row">
                <span className="sum-row-label">⏱️ Duration</span>
                <span className="sum-row-val">{duration?.label || <span className="sum-empty">Not selected</span>}</span>
              </div>
              <div className="sum-row">
                <span className="sum-row-label">💰 Rate</span>
                <span className="sum-row-val">{selectedNanny ? `₹${selectedNanny.rate}/hr` : <span className="sum-empty">—</span>}</span>
              </div>
              {total !== null && (
                <div className="sum-total">
                  <div className="sum-total-label">Total Amount</div>
                  <div className="sum-total-amt">₹{total}</div>
                </div>
              )}
              <div className="sum-checklist">
                <div className={`sum-check ${selectedNanny ? 'done' : ''}`}>{selectedNanny ? '✅' : '⬜'} Caretaker selected</div>
                <div className={`sum-check ${selectedDate  ? 'done' : ''}`}>{selectedDate  ? '✅' : '⬜'} Date chosen</div>
                <div className={`sum-check ${selectedTime  ? 'done' : ''}`}>{selectedTime  ? '✅' : '⬜'} Time slot picked</div>
                <div className={`sum-check ${duration      ? 'done' : ''}`}>{duration      ? '✅' : '⬜'} Duration set</div>
              </div>
              <button
                className="bk-confirm-btn"
                disabled={!selectedNanny || !selectedDate || !selectedTime || !duration || submitting}
                onClick={confirmBooking}
              >
                {submitting
                  ? '⏳ Confirming...'
                  : selectedNanny && selectedDate && selectedTime && duration
                    ? '🎉 Confirm Booking'
                    : '⬆️ Complete all steps'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal — UNCHANGED UI */}
      {success && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">🎉</div>
            <h2>Booking Created!</h2>
            <p>
              Your session with <strong>{selectedNanny?.name}</strong> has been booked for{' '}
              <strong>{displayDate}</strong> at <strong>{selectedTime}</strong> ({duration?.label}).
            </p>
            <div className="success-ref">Booking ID: #{refCode?.slice(-8)}</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                className="success-btn" 
                style={{ background: 'linear-gradient(135deg, #059669, #34D399)' }}
                onClick={() => {
                  const paymentData = {
                    bookingType: 'nanny',
                    nanny: selectedNanny,
                    amount: total,
                    bookingData: {
                      bookingId: refCode,
                      startDate: formattedDate,
                      startTime: selectedTime,
                      endTime: duration ? `${String(parseInt(selectedTime.split(':')[0]) + duration.hours).padStart(2,'0')}:00` : '',
                    }
                  };
                  // Save to localStorage for persistence
                  localStorage.setItem('pendingBooking', JSON.stringify(paymentData));
                  navigate('/payment', { state: paymentData });
                }}
              >
                💳 Proceed to Payment
              </button>
              <button className="success-btn" onClick={() => navigate('/parent-dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}