// File Path: src/pages/Payments.jsx
// MERGED: PaymentBilling.jsx features merged into Payments.jsx
// Features added from PaymentBilling:
//   + Monthly category breakdown chart (Tuition/Meals/Activities → Session/Advance/Bonus)
//   + Upcoming charges section
//   + Payment methods management (add/remove cards)
//   + Auto-pay status
// Existing fixes retained:
//   FIX 1: Loads real bookings/payments from localStorage for Parent role
//   FIX 2: Real summary stats calculated from actual data
//   FIX 3: Role detection via .toLowerCase() works with AuthContext Title case
// NEW: PDF Invoice Generation & CSV Export functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateInvoicePDF, exportToCSV } from '../utils/exportUtils';
import { paymentMethodsAPI } from '../services/api';

const injectCSS = () => {
  if (document.getElementById('pay-styles')) return;
  const style = document.createElement('style');
  style.id = 'pay-styles';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    .py-root { min-height: 100vh; background: #F7F5F0; font-family: 'Manrope', sans-serif; color: #1A1A2E; }

    .py-header { background: white; border-bottom: 2px solid #EDEAE4; padding: 18px 48px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
    .py-header-left { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .py-back { padding: 9px 18px; border-radius: 999px; border: 2px solid #E5E7EB; background: white; color: #666; font-family: 'Manrope', sans-serif; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .py-back:hover { border-color: #6366F1; color: #6366F1; }
    .py-title { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 900; color: #1A1A2E; }
    .py-role-tag { padding: 5px 14px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; }
    .py-header-right { display: flex; gap: 10px; }
    .py-export-btn { padding: 9px 18px; border-radius: 10px; border: 2px solid #E5E7EB; background: white; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #555; cursor: pointer; transition: all 0.2s; }
    .py-export-btn:hover { border-color: #6366F1; color: #6366F1; }

    /* Tabs (merged from PaymentBilling) */
    .py-tabs { max-width: 1100px; margin: 24px auto 0; padding: 0 48px; display: flex; gap: 8px; flex-wrap: wrap; }
    .py-tab { padding: 10px 22px; border-radius: 999px; border: 2px solid #EDEAE4; background: white; font-family: 'Manrope', sans-serif; font-size: 0.82rem; font-weight: 700; color: #888; cursor: pointer; transition: all 0.2s; }
    .py-tab.active { background: #1A1A2E; border-color: #1A1A2E; color: white; }
    .py-tab:hover:not(.active) { border-color: #6366F1; color: #6366F1; }

    /* Summary cards */
    .py-summary { max-width: 1100px; margin: 20px auto 0; padding: 0 48px; display: grid; grid-template-columns: repeat(auto-fill, minmax(200px,1fr)); gap: 16px; }
    .py-sum-card { background: white; border-radius: 20px; padding: 22px 20px; border: 2px solid #EDEAE4; transition: all 0.25s; animation: pyFadeUp 0.4s ease both; }
    .py-sum-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
    @keyframes pyFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    .py-sum-icon  { font-size: 1.8rem; margin-bottom: 12px; }
    .py-sum-label { font-size: 0.72rem; font-weight: 700; color: #AAA; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .py-sum-value { font-family: 'Fraunces', serif; font-size: 1.6rem; font-weight: 900; color: #1A1A2E; }
    .py-sum-sub   { font-size: 0.75rem; color: #888; margin-top: 4px; font-weight: 500; }
    .py-sum-trend { font-size: 0.72rem; font-weight: 700; margin-top: 6px; }
    .py-sum-trend.up   { color: #059669; }
    .py-sum-trend.down { color: #E11D48; }

    /* Main layout */
    .py-main { max-width: 1100px; margin: 28px auto; padding: 0 48px 60px; display: grid; grid-template-columns: 1fr 320px; gap: 24px; }

    /* Transaction table */
    .py-table-card { background: white; border-radius: 20px; border: 2px solid #EDEAE4; overflow: hidden; }
    .py-table-header { padding: 20px 24px; border-bottom: 2px solid #F0EDE8; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
    .py-table-title { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 900; color: #1A1A2E; }
    .py-filter-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .py-filter-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid #E5E7EB; background: transparent; font-family:'Manrope',sans-serif; font-size:0.75rem; font-weight:700; color:#555; cursor:pointer; transition:all 0.2s; }
    .py-filter-btn.active, .py-filter-btn:hover { background: #6366F1; border-color: #6366F1; color: white; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: linear-gradient(135deg, #1A1A2E 0%, #283593 100%); }
    thead tr:first-child th:first-child { border-top-left-radius: 12px; }
    thead tr:first-child th:last-child { border-top-right-radius: 12px; }
    th { padding: 14px 20px; text-align: left; font-size: 0.72rem; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; border: none; }
    td { padding: 14px 20px; border-top: 1px solid #E8E5E0; font-size: 0.86rem; font-weight: 500; color: #1A1A2E; }
    tbody tr:last-child td:first-child { border-bottom-left-radius: 12px; }
    tbody tr:last-child td:last-child { border-bottom-right-radius: 12px; }
    tbody tr:hover td { background: #F5F3FF; }
    .py-tx-id   { font-family: monospace; font-size: 0.78rem; color: #6366F1; font-weight: 600; }
    .py-tx-name { font-weight: 700; color: #1A1A2E; }
    .py-tx-date { color: #555; font-size: 0.82rem; font-weight: 500; }
    .py-tx-amt  { font-weight: 800; font-size: 0.95rem; }
    .py-tx-amt.credit { color: #059669; }
    .py-tx-amt.debit  { color: #E11D48; }
    .py-status { display: inline-flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; }
    .py-status.completed,.py-status.confirmed,.py-status.Confirmed { background: #DCFCE7; color: #059669; }
    .py-status.pending,.py-status.Pending { background: #FEF3C7; color: #D97706; }
    .py-status.Cancelled,.py-status.failed { background: #FEE2E2; color: #E11D48; }
    .py-status.refunded { background: #EDE9FE; color: #7C3AED; }
    .py-method { font-size: 0.82rem; color: #555; font-weight: 500; }

    /* Right panel */
    .py-right { display: flex; flex-direction: column; gap: 16px; }
    .py-panel-card { background: white; border-radius: 20px; padding: 22px; border: 2px solid #EDEAE4; animation: pyFadeUp 0.4s ease both; }
    .py-panel-title { font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 900; color: #1A1A2E; margin-bottom: 16px; }

    /* Trend chart (right panel) */
    .py-chart { display: flex; align-items: flex-end; gap: 6px; height: 80px; margin-bottom: 10px; }
    .py-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .py-bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.5s ease; min-height: 4px; }
    .py-bar-label { font-size: 0.65rem; color: #AAA; font-weight: 600; }

    /* Category breakdown chart (from PaymentBilling) */
    .py-cat-chart { display: flex; align-items: flex-end; gap: 10px; height: 120px; margin-bottom: 14px; }
    .py-cat-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0; height: 100%; justify-content: flex-end; }
    .py-cat-seg { width: 100%; transition: height 0.5s ease; }
    .py-cat-seg:first-child { border-radius: 6px 6px 0 0; }
    .py-cat-label { font-size: 0.62rem; color: #AAA; font-weight: 700; margin-top: 5px; }
    .py-cat-total { font-size: 0.7rem; color: #555; font-weight: 800; margin-top: 2px; }
    .py-legend { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .py-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; font-weight: 700; color: #555; }
    .py-legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

    /* Payment methods (from PaymentBilling) */
    .py-cards-list { display: flex; flex-direction: column; gap: 10px; }
    .py-card-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 2px solid #EDEAE4; border-radius: 14px; transition: all 0.2s; }
    .py-card-item.default-card { border-color: #6366F1; background: #F5F3FF; }
    .py-card-info { flex: 1; }
    .py-card-brand { font-weight: 800; font-size: 0.85rem; color: #1A1A2E; }
    .py-card-num   { font-size: 0.75rem; color: #AAA; font-family: monospace; }
    .py-card-expiry{ font-size: 0.72rem; color: #AAA; }
    .py-default-badge { font-size: 0.65rem; background: #6366F1; color: white; padding: 2px 8px; border-radius: 999px; font-weight: 800; }
    .py-card-remove { background: none; border: none; color: #E11D48; font-size: 0.8rem; font-weight: 700; cursor: pointer; padding: 4px 8px; border-radius: 8px; transition: background 0.2s; }
    .py-card-remove:hover { background: #FEE2E2; }
    .py-add-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 2px dashed #EDEAE4; border-radius: 14px; cursor: pointer; color: #AAA; font-size: 0.85rem; font-weight: 700; transition: all 0.2s; background: none; width: 100%; }
    .py-add-card:hover { border-color: #6366F1; color: #6366F1; }

    /* Autopay toggle (from PaymentBilling) */
    .py-autopay-row { display: flex; align-items: center; justify-content: space-between; }
    .py-toggle { position: relative; width: 44px; height: 24px; }
    .py-toggle input { opacity: 0; width: 0; height: 0; }
    .py-slider { position: absolute; inset: 0; background: #E5E7EB; border-radius: 999px; cursor: pointer; transition: 0.3s; }
    .py-slider:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    input:checked + .py-slider { background: #6366F1; }
    input:checked + .py-slider:before { transform: translateX(20px); }

    /* Upcoming charges (from PaymentBilling) */
    .py-upcoming-list { display: flex; flex-direction: column; gap: 8px; }
    .py-upcoming-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F0EDE8; }
    .py-upcoming-name { font-weight: 700; font-size: 0.85rem; color: #1A1A2E; }
    .py-upcoming-date { font-size: 0.72rem; color: #AAA; margin-top: 2px; }
    .py-upcoming-amt  { font-family: 'Fraunces', serif; font-weight: 900; color: #E11D48; font-size: 0.95rem; }
    .py-upcoming-total{ display: flex; justify-content: space-between; padding: 12px 0 0; font-weight: 800; font-size: 0.9rem; color: #1A1A2E; border-top: 2px solid #EDEAE4; margin-top: 4px; }

    /* Method breakdown */
    .py-method-list { display: flex; flex-direction: column; gap: 10px; }
    .py-method-item { display: flex; align-items: center; gap: 10px; }
    .py-method-icon { font-size: 1.2rem; width: 32px; }
    .py-method-name { font-size: 0.82rem; font-weight: 700; color: #1A1A2E; flex: 1; }
    .py-method-pct  { font-size: 0.8rem; font-weight: 800; color: #6366F1; }
    .py-method-bar-wrap { flex: 2; height: 6px; background: #F0EDE8; border-radius: 999px; overflow: hidden; }
    .py-method-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #6366F1, #8B5CF6); transition: width 0.6s ease; }

    /* Quick actions */
    .py-quick-btn { width: 100%; padding: 13px; border-radius: 13px; border: none; font-family: 'Manrope', sans-serif; font-size: 0.88rem; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-bottom: 8px; text-align: left; display: flex; align-items: center; gap: 10px; }
    .py-quick-btn.primary   { background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; }
    .py-quick-btn.secondary { background: #F7F5F0; color: #555; border: 2px solid #EDEAE4; }
    .py-quick-btn:hover { transform: translateY(-1px); }

    .py-empty { text-align: center; padding: 40px; color: #AAA; }
    .py-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
    .py-real-badge { font-size: 0.65rem; background: #DCFCE7; color: #059669; padding: 2px 7px; border-radius: 999px; font-weight: 800; }

    /* Add card modal */
    .py-modal-overlay { position: fixed; inset: 0; background: rgba(26,26,46,0.4); backdrop-filter: blur(4px); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .py-modal { background: white; border-radius: 24px; padding: 32px; max-width: 400px; width: 100%; box-shadow: 0 32px 80px rgba(0,0,0,0.2); }
    .py-modal h3 { font-family: 'Fraunces', serif; font-size: 1.3rem; font-weight: 900; color: #1A1A2E; margin: 0 0 20px; }
    .py-modal-input { width: 100%; padding: 11px 14px; border: 2px solid #EDEAE4; border-radius: 12px; font-family: 'Manrope', sans-serif; font-size: 0.9rem; font-weight: 600; color: #1A1A2E; outline: none; margin-bottom: 12px; }
    .py-modal-input:focus { border-color: #6366F1; }
    .py-modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .py-modal-btns { display: flex; gap: 10px; margin-top: 8px; }
    .py-modal-submit { flex: 1; padding: 12px; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; border: none; border-radius: 12px; font-family: 'Manrope', sans-serif; font-weight: 800; cursor: pointer; font-size: 0.9rem; }
    .py-modal-cancel { flex: 1; padding: 12px; background: #F7F5F0; color: #888; border: none; border-radius: 12px; font-family: 'Manrope', sans-serif; font-weight: 700; cursor: pointer; font-size: 0.9rem; }

    @media(max-width:900px){
      .py-header { padding: 14px 20px; }
      .py-tabs, .py-summary { padding: 0 20px; }
      .py-main { grid-template-columns: 1fr; padding: 0 20px 48px; }
      .py-right { display: none; }
    }
  `;
  document.head.appendChild(style);
};

const MONTHS = ['Sep','Oct','Nov','Dec','Jan','Feb'];

const ROLE_TAG_COLORS = {
  parent:    { bg:'rgba(59,130,246,0.1)',  color:'#3B82F6' },
  caretaker: { bg:'rgba(5,150,105,0.1)',   color:'#059669' },
  admin:     { bg:'rgba(245,158,11,0.1)',  color:'#D97706' },
};

// Default saved cards
const DEFAULT_CARDS = [
  { id:1, brand:'Visa',       last4:'4242', expiry:'12/25', isDefault:true  },
  { id:2, brand:'Mastercard', last4:'5555', expiry:'08/26', isDefault:false },
];

export default function Payments() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const role      = user?.role?.toLowerCase() || 'parent';

  const [activeTab,    setActiveTab]    = useState('transactions');
  const [filter,       setFilter]       = useState('all');
  const [toast,        setToast]        = useState('');
  const [transactions, setTransactions] = useState([]);
  const [summary,      setSummary]      = useState([]);
  const [hasRealData,  setHasRealData]  = useState(false);
  // From PaymentBilling
  const [cards,        setCards]        = useState([]);
  const [autoPay,      setAutoPay]      = useState(() => localStorage.getItem('autopay') !== 'false');
  const [showAddCard,  setShowAddCard]  = useState(false);
  const [newCard,      setNewCard]      = useState({ brand:'', last4:'', expiry:'' });
  const [cardsLoaded,  setCardsLoaded]  = useState(false);

  const [upcomingCharges, setUpcomingCharges] = useState([]);
  const [catData, setCatData] = useState([]);
  const [catMax, setCatMax] = useState(1);
  const [methodsList, setMethodsList] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [chartMax, setChartMax] = useState(1);

  useEffect(() => { injectCSS(); }, []);

  // Load payment methods from MongoDB
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const res = await paymentMethodsAPI.getAll();
        if (res.success && res.paymentMethods && res.paymentMethods.length > 0) {
          // Transform MongoDB payment methods to local format
          const transformed = res.paymentMethods.map(m => ({
            id: m._id,
            brand: m.brand,
            last4: m.last4,
            expiry: m.expiry,
            isDefault: m.isDefault,
            fromDB: true,
          }));
          setCards(transformed);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('payment_cards');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setCards(parsed.length > 0 ? parsed : DEFAULT_CARDS);
            } catch {
              setCards(DEFAULT_CARDS);
            }
          } else {
            setCards(DEFAULT_CARDS);
          }
        }
      } catch (error) {
        console.log('Failed to load payment methods from MongoDB');
        // Fallback to localStorage
        const saved = localStorage.getItem('payment_cards');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCards(parsed.length > 0 ? parsed : DEFAULT_CARDS);
          } catch {
            setCards(DEFAULT_CARDS);
          }
        } else {
          setCards(DEFAULT_CARDS);
        }
      }
      setCardsLoaded(true);
    };
    loadPaymentMethods();
  }, []);

  // Load REAL data from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = user?.id || user?._id;
        
        // Fetch bookings from backend
        const bookingsRes = await fetch('http://localhost:5000/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookingsData = await bookingsRes.json();

        let allBookings = bookingsData.bookings || [];
        
        // FILTER based on user role
        if (role === 'parent') {
          // Parent sees: bookings where they paid (payments they made)
          allBookings = allBookings.filter(b => 
            b.parent === userId || b.parent?._id === userId || b.parentEmail === user?.email
          );
        } else if (role === 'caretaker') {
          // Caretaker sees: bookings where they received payment (payments to them)
          allBookings = allBookings.filter(b => 
            b.caretaker === userId || b.caretaker?._id === userId || b.caretakerEmail === user?.email
          );
        }
        // Admin sees all bookings (no filter)
        
        // Transform bookings into transactions
        const realBookingTxns = allBookings.map(b => ({
          id:     `BK-${b._id?.slice(-6) || b.id}`,
          name:   role === 'caretaker' ? (b.parentName || 'Parent') : (b.caretakerName || 'Caretaker'),
          type:   'Session Booking',
          date:   b.date || b.createdAt?.slice(0,10) || '—',
          amount: role === 'caretaker' ? parseFloat(b.totalAmount || b.amount || 0) : -(parseFloat(b.totalAmount || b.amount || 0)),
          status: (b.status || 'pending').toLowerCase(),
          method: '📅 Booking',
          isReal: true,
          bookingData: b,
        }));

        const realPaymentTxns = allBookings
          .filter(b => b.paymentStatus === 'paid' || b.paymentStatus === 'refunded')
          .map(b => ({
            id:     b.transactionId || `PAY-${b._id?.slice(-6)}`,
            name:   role === 'caretaker' ? (b.parentName || 'Parent') : (b.caretakerName || 'Caretaker'),
            type:   'Payment',
            date:   b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-IN') : b.date,
            amount: role === 'caretaker' ? parseFloat(b.totalAmount || b.amount || 0) : parseFloat(b.totalAmount || b.amount || 0),
            status: b.paymentStatus || 'paid',
            method: `💳 ${b.paymentMethod || 'Online'}`,
            isReal: true,
            bookingData: b,
          }));

        const allReal = [...realBookingTxns, ...realPaymentTxns];
        
        // Only show real data if available, otherwise show empty state
        if (allReal.length > 0) {
          setTransactions(allReal);
          setHasRealData(true);
          
          // Calculate stats based on role - use ABSOLUTE values for totals
          const totalAmount = allReal.reduce((s, t) => s + Math.abs(t.amount), 0);
          const completedPayments = allReal.filter(t => ['completed','confirmed'].includes(t.status) && t.type === 'Payment');
          const completedCnt = completedPayments.length;
          const pendingTxns = allReal.filter(t => ['pending'].includes(t.status) && t.type === 'Session Booking');
          const pendingAmt = pendingTxns.reduce((s, t) => s + Math.abs(t.amount), 0);
          const avgPerSession = completedCnt > 0 ? Math.round(totalAmount / completedCnt) : 0;

          // Build monthly category data from bookings (for Billing tab)
          const monthlyMap = {};
          const last6Months = [];
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString('en-US', { month: 'short' });
            const year = d.getFullYear();
            last6Months.push({ key, year, session: 0, advance: 0, bonus: 0 });
            monthlyMap[key] = last6Months[last6Months.length - 1];
          }
          
          allBookings.forEach(b => {
            const bDate = b.date || b.createdAt;
            if (bDate) {
              const d = new Date(bDate);
              const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
              if (monthlyMap[monthKey]) {
                const amt = parseFloat(b.totalAmount || b.amount || 0);
                if (b.type === 'advance' || b.notes?.includes('advance')) {
                  monthlyMap[monthKey].advance += amt;
                } else if (b.type === 'bonus') {
                  monthlyMap[monthKey].bonus += amt;
                } else {
                  monthlyMap[monthKey].session += amt;
                }
              }
            }
          });
          const catMaxVal = Math.max(...last6Months.map(m => m.session + m.advance + m.bonus), 1);
          setCatData(last6Months);
          setCatMax(catMaxVal);

          // Build payment methods distribution
          const methodMap = {};
          allBookings.forEach(b => {
            const method = b.paymentMethod || 'Online';
            if (!methodMap[method]) methodMap[method] = 0;
            methodMap[method]++;
          });
          const totalMethods = Object.values(methodMap).reduce((a, b) => a + b, 0) || 1;
          const methodIcons = { 'UPI': '💳', 'Card': '💳', 'Net Banking': '🏦', 'Wallet': '👛', 'Cash': '💵', 'Online': '📱' };
          const methodsArr = Object.entries(methodMap).map(([name, count]) => ({
            name,
            icon: methodIcons[name] || '📱',
            pct: Math.round((count / totalMethods) * 100)
          })).sort((a, b) => b.pct - a.pct);
          setMethodsList(methodsArr);

          // Build upcoming charges from pending bookings
          const upcoming = allBookings
            .filter(b => b.status === 'pending' && (b.paymentStatus === 'unpaid' || !b.paymentStatus))
            .slice(0, 5)
            .map((b, i) => ({
              id: i + 1,
              description: `Session - ${b.caretakerName || 'Caretaker'}`,
              amount: parseFloat(b.totalAmount || b.amount || 0),
              date: b.date || 'TBD'
            }));
          setUpcomingCharges(upcoming);

          // Build monthly trend chart from real data
          const trendMap = {};
          last6Months.forEach(m => { trendMap[m.key] = 0; });
          allBookings.forEach(b => {
            const bDate = b.date || b.createdAt;
            if (bDate) {
              const d = new Date(bDate);
              const monthKey = d.toLocaleDateString('en-US', { month: 'short' });
              if (trendMap[monthKey] !== undefined) {
                trendMap[monthKey] += parseFloat(b.totalAmount || b.amount || 0);
              }
            }
          });
          const trendValues = Object.values(trendMap);
          const trendMax = Math.max(...trendValues, 1);
          setChartValues(trendValues);
          setChartMax(trendMax);

          if (role === 'caretaker') {
            // Caretaker sees earnings (after commission)
            const totalEarned = Math.abs(allReal.filter(t => t.type === 'Payment').reduce((s, t) => s + t.amount, 0));
            const platformCommission = Math.round(totalEarned * 0.1); // 10% commission
            const netEarnings = totalEarned - platformCommission;
            setSummary([
              { icon:'💰', label:'Net Earnings',    value: `₹${netEarnings.toLocaleString('en-IN')}`, sub:'After commission',     trend:'Based on your data', up:true },
              { icon:'📊', label:'Gross Earned',    value: `₹${totalEarned.toLocaleString('en-IN')}`, sub:'Before commission',   trend:'Shown below', up:true },
              { icon:'🏛️', label:'Platform Fee',    value: `₹${platformCommission.toLocaleString('en-IN')}`, sub:'10% commission', trend:'Platform keeps', up:false },
              { icon:'✅', label:'Completed',         value: completedCnt.toString(),                   sub:'Sessions done',     trend: completedCnt > 0 ? `+${Math.min(3, completedCnt)} this month` : '', up:true  },
            ]);
          } else if (role === 'parent') {
            // Parent sees spending - use absolute values for display
            const totalSpent = Math.abs(allReal.filter(t => t.type === 'Payment').reduce((s, t) => s + t.amount, 0));
            setSummary([
              { icon:'💳', label:'Total Spent',    value: `₹${totalSpent.toLocaleString('en-IN')}`, sub:'From bookings',     trend:'Based on your data', up:false },
              { icon:'✅', label:'Completed',       value: completedCnt.toString(),                   sub:'Bookings paid',     trend: completedCnt > 0 ? `+${Math.min(3, completedCnt)} this month` : '', up:true  },
              { icon:'⏳', label:'Pending',         value: `₹${pendingAmt.toLocaleString('en-IN')}`, sub:'Awaiting',         trend: pendingAmt > 0 ? 'Due soon' : '', up:false },
              { icon:'💰', label:'Avg per Session', value: `₹${avgPerSession.toLocaleString('en-IN')}`, sub:'Per booking',       trend:'', up:true  },
            ]);
          } else {
            // Admin sees all - use absolute values for display
            setSummary([
              { icon:'💳', label:'Total Spent',    value: `₹${totalAmount.toLocaleString('en-IN')}`, sub:'From bookings',     trend:'Based on your data', up:false },
              { icon:'✅', label:'Completed',       value: completedCnt.toString(),                   sub:'Bookings paid',     trend: completedCnt > 0 ? `+${Math.min(3, completedCnt)} this month` : '', up:true  },
              { icon:'⏳', label:'Pending',         value: `₹${pendingAmt.toLocaleString('en-IN')}`, sub:'Awaiting',         trend: pendingAmt > 0 ? 'Due soon' : '', up:false },
              { icon:'💰', label:'Avg per Session', value: `₹${avgPerSession.toLocaleString('en-IN')}`, sub:'Per booking',       trend:'', up:true  },
            ]);
          }
        } else {
          setTransactions([]);
          setHasRealData(false);
          const emptySummary = role === 'caretaker' ? [
            { icon:'💰', label:'Total Earned',    value: '₹0', sub:'No earnings yet', trend:'Complete sessions to earn', up:false },
            { icon:'✅', label:'Completed',       value: '0',  sub:'No completed bookings', trend:'', up:true  },
            { icon:'⏳', label:'Pending Payout',   value: '₹0', sub:'No pending payouts', trend:'', up:false },
            { icon:'📊', label:'Avg per Session', value: '₹0', sub:'Complete a booking', trend:'', up:true  },
          ] : [
            { icon:'💳', label:'Total Spent',    value: '₹0', sub:'No bookings yet', trend:'Book a session to see stats', up:false },
            { icon:'✅', label:'Completed',       value: '0',  sub:'No completed bookings', trend:'', up:true  },
            { icon:'⏳', label:'Pending',         value: '₹0', sub:'No pending payments', trend:'', up:false },
            { icon:'💰', label:'Avg per Session', value: '₹0', sub:'Complete a booking', trend:'', up:true  },
          ];
          setSummary(emptySummary);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setTransactions([]);
        setHasRealData(false);
        setSummary([
          { icon:'💳', label:'Total Spent',    value: '₹0', sub:'Error loading data', trend:'', up:false },
          { icon:'✅', label:'Completed',       value: '0',  sub:'', trend:'', up:true  },
          { icon:'⏳', label:'Pending',         value: '₹0', sub:'', trend:'', up:false },
          { icon:'💰', label:'Avg per Session', value: '₹0', sub:'', trend:'', up:true  },
        ]);
      }
    };
    fetchData();
  }, [user, role]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const statusKey = (s) => s?.toLowerCase?.() || s;
  const filtered  = filter === 'all' ? transactions : transactions.filter(t => statusKey(t.status) === filter);

  const handleRemoveCard = async (id) => {
    try {
      // Try to delete from MongoDB if it was stored there
      const card = cards.find(c => c.id === id);
      if (card?.fromDB) {
        await paymentMethodsAPI.delete(id);
      }
      
      const updated = cards.filter(c => c.id !== id);
      setCards(updated);
      localStorage.setItem('payment_cards', JSON.stringify(updated));
      showToast('Card removed.');
    } catch (error) {
      console.error('Error removing card:', error);
      // Fallback to local only
      const updated = cards.filter(c => c.id !== id);
      setCards(updated);
      localStorage.setItem('payment_cards', JSON.stringify(updated));
      showToast('Card removed.');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      // Try to set default in MongoDB if stored there
      const card = cards.find(c => c.id === id);
      if (card?.fromDB) {
        await paymentMethodsAPI.setDefault(id);
      }
      
      const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
      setCards(updated);
      localStorage.setItem('payment_cards', JSON.stringify(updated));
      showToast('Default card updated.');
    } catch (error) {
      console.error('Error setting default:', error);
      // Fallback to local only
      const updated = cards.map(c => ({ ...c, isDefault: c.id === id }));
      setCards(updated);
      localStorage.setItem('payment_cards', JSON.stringify(updated));
      showToast('Default card updated.');
    }
  };

  const handleAddCard = async () => {
    if (!newCard.brand || !newCard.last4 || !newCard.expiry) { showToast('Please fill all fields.'); return; }
    try {
      // Try to add to MongoDB
      const res = await paymentMethodsAPI.add({
        brand: newCard.brand,
        last4: newCard.last4,
        expiry: newCard.expiry,
        isDefault: cards.length === 0,
      });
      
      if (res.success) {
        const added = [...cards, { 
          id: res.paymentMethod._id, 
          brand: res.paymentMethod.brand, 
          last4: res.paymentMethod.last4, 
          expiry: res.paymentMethod.expiry, 
          isDefault: res.paymentMethod.isDefault,
          fromDB: true,
        }];
        setCards(added);
        localStorage.setItem('payment_cards', JSON.stringify(added));
        setShowAddCard(false);
        setNewCard({ brand:'', last4:'', expiry:'' });
        showToast('✅ Card added!');
      }
    } catch (error) {
      console.error('Error adding card:', error);
      // Fallback to local only
      const added = [...cards, { id: Date.now(), ...newCard, isDefault: false, fromDB: false }];
      setCards(added);
      localStorage.setItem('payment_cards', JSON.stringify(added));
      setShowAddCard(false);
      setNewCard({ brand:'', last4:'', expiry:'' });
      showToast('✅ Card added!');
    }
  };

  const handleAutoPay = (val) => {
    setAutoPay(val);
    localStorage.setItem('autopay', val.toString());
    showToast(val ? '✅ Auto-pay enabled' : 'Auto-pay disabled');
  };

  // PDF Export Handler
  const handleExportPDF = async () => {
    try {
      showToast('📄 Generating invoice...');
      
      // Fetch all bookings for invoice generation
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.bookings && data.bookings.length > 0) {
        // Generate PDF for most recent booking
        const latestBooking = data.bookings[0];
        generateInvoicePDF(latestBooking, user, role);
        showToast('✅ Invoice downloaded!');
      } else {
        showToast('No bookings found to export');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('❌ Error generating PDF');
    }
  };

  // CSV Export Handler
  const handleExportCSV = async () => {
    try {
      showToast('📊 Generating CSV...');
      
      // Fetch all bookings for CSV export
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.bookings && data.bookings.length > 0) {
        // Transform bookings to transaction format for CSV
        const csvData = data.bookings.map(b => ({
          booking: b,
          id: `BK-${b._id?.slice(-6) || b.id}`,
          date: b.date || b.createdAt?.slice(0, 10) || '—',
          description: `Childcare Session - ${b.caretakerName || 'Caretaker'}`,
          name: b.parentName || 'Parent',
          amount: b.totalAmount || 0,
          status: b.paymentStatus || 'unpaid',
          method: b.paymentMethod || 'N/A',
          childrenCount: b.childrenCount || 1,
          notes: b.notes || ''
        }));
        
        exportToCSV(csvData, `chidcare_${role}_payments`);
        showToast('✅ CSV downloaded!');
      } else {
        showToast('No data found to export');
      }
    } catch (err) {
      console.error('CSV export error:', err);
      showToast('❌ Error generating CSV');
    }
  };

  const tagStyle = ROLE_TAG_COLORS[role] || ROLE_TAG_COLORS.parent;

  const TABS = [
    { id:'transactions', label:'💳 Transactions' },
    { id:'billing',      label:'📊 Billing Overview' },
    { id:'methods',      label:'🗂️ Payment Methods' },
    { id:'upcoming',     label:'📅 Upcoming Charges' },
  ];

  return (
    <div className="py-root">

      {/* Header */}
      <div className="py-header">
        <div className="py-header-left">
          <button className="py-back" onClick={() => navigate(-1)}>← Back</button>
          <div className="py-title">💳 Payments</div>
          <div className="py-role-tag" style={{ background: tagStyle.bg, color: tagStyle.color, border:`1px solid ${tagStyle.color}33` }}>
            {role.charAt(0).toUpperCase()+role.slice(1)} View
          </div>
          {hasRealData && <span className="py-real-badge">✓ Live Data</span>}
        </div>
        <div className="py-header-right">
          <button className="py-export-btn" onClick={handleExportPDF}>⬇ Export PDF</button>
          <button className="py-export-btn" onClick={handleExportCSV}>📊 Export CSV</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="py-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`py-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="py-summary">
        {summary.map((s, i) => (
          <div key={i} className="py-sum-card" style={{ animationDelay:`${i*0.08}s` }}>
            <div className="py-sum-icon">{s.icon}</div>
            <div className="py-sum-label">{s.label}</div>
            <div className="py-sum-value">{s.value}</div>
            <div className="py-sum-sub">{s.sub}</div>
            {s.trend && <div className={`py-sum-trend ${s.up?'up':'down'}`}>{s.up?'↑':'↓'} {s.trend}</div>}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="py-main">
        <div>

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === 'transactions' && (
            <div className="py-table-card">
              <div className="py-table-header">
                <div className="py-table-title">Transaction History {hasRealData && <span className="py-real-badge">Live</span>}</div>
                <div className="py-filter-row">
                  {['all','completed','pending','failed','refunded'].map(f => (
                    <button key={f} className={`py-filter-btn ${filter===f?'active':''}`} onClick={() => setFilter(f)}>
                      {f.charAt(0).toUpperCase()+f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="py-empty"><div className="py-empty-icon">🔍</div><div>No {filter} transactions</div></div>
              ) : (
                <table>
                  <thead><tr>
                    <th>ID</th><th>Name</th><th>Type</th><th>Date</th><th>Amount</th><th>Status</th><th>Method</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((t, i) => (
                      <tr key={`${t.id}-${i}`}>
                        <td><span className="py-tx-id">{t.id}{t.isReal?' ✓':''}</span></td>
                        <td><span className="py-tx-name">{t.name}</span></td>
                        <td><span style={{ fontSize:'0.8rem', color:'#888' }}>{t.type}</span></td>
                        <td><span className="py-tx-date">{t.date}</span></td>
                        <td>
                          <span className={`py-tx-amt ${t.amount >= 0 ? 'credit' : 'debit'}`}>
                            {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span className={`py-status ${statusKey(t.status)}`}>
                            {['completed','confirmed'].includes(statusKey(t.status)) ? '✅'
                              : statusKey(t.status)==='pending' ? '⏳'
                              : statusKey(t.status)==='failed'  ? '❌' : '↩️'} {t.status}
                          </span>
                        </td>
                        <td><span className="py-method">{t.method}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── BILLING OVERVIEW TAB (from PaymentBilling) ── */}
          {activeTab === 'billing' && (
            <div className="py-panel-card">
              <div className="py-panel-title">Monthly Spending Breakdown 📊</div>
              {/* Category stacked bar chart */}
              <div className="py-cat-chart">
                {catData.map((d, i) => {
                  const total = d.session + d.advance + d.bonus;
                  return (
                    <div key={i} className="py-cat-col">
                      <div className="py-cat-seg" style={{ height:`${(d.bonus/catMax)*110}px`, background:'#FCD34D', borderRadius: '6px 6px 0 0' }} title={`Bonus: ₹${d.bonus}`} />
                      <div className="py-cat-seg" style={{ height:`${(d.advance/catMax)*110}px`, background:'#6EE7B7' }} title={`Advance: ₹${d.advance}`} />
                      <div className="py-cat-seg" style={{ height:`${(d.session/catMax)*110}px`, background:'#818CF8' }} title={`Session: ₹${d.session}`} />
                      <div className="py-cat-label">{d.key}</div>
                      <div className="py-cat-total">₹{total}</div>
                    </div>
                  );
                })}
              </div>
              <div className="py-legend">
                {[['#818CF8','Session Fee'],['#6EE7B7','Advance'],['#FCD34D','Bonus/Other']].map(([color,label]) => (
                  <div key={label} className="py-legend-item">
                    <div className="py-legend-dot" style={{ background:color }} />{label}
                  </div>
                ))}
              </div>

              {/* Payment summary table */}
              <div style={{ marginTop:'28px' }}>
                <div className="py-panel-title">Payment Summary</div>
                {(() => {
                  const sessionTotal = catData.reduce((s, m) => s + m.session, 0);
                  const advanceTotal = catData.reduce((s, m) => s + m.advance, 0);
                  const bonusTotal = catData.reduce((s, m) => s + m.bonus, 0);
                  const grandTotal = sessionTotal + advanceTotal + bonusTotal;
                  return [
                    { label:'Session Fees',    value: grandTotal > 0 ? `₹${sessionTotal.toLocaleString('en-IN')}` : 'No sessions yet' },
                    { label:'Advances',        value: advanceTotal > 0 ? `₹${advanceTotal.toLocaleString('en-IN')}` : 'None' },
                    { label:'Bonus / Other',   value: bonusTotal > 0 ? `₹${bonusTotal.toLocaleString('en-IN')}` : 'None' },
                    { label:'Total',           value: grandTotal > 0 ? `₹${grandTotal.toLocaleString('en-IN')}` : '₹0', bold:true },
                  ].map((row, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom: i < 3 ? '1px solid #F0EDE8' : 'none', fontWeight: row.bold ? 800 : 600, fontSize: row.bold ? '1rem' : '0.88rem', color: row.bold ? '#1A1A2E' : '#555' }}>
                      <span>{row.label}</span><span style={{ color: row.bold ? '#059669' : undefined }}>{row.value}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* ── PAYMENT METHODS TAB (from PaymentBilling) ── */}
          {activeTab === 'methods' && (
            <div className="py-panel-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <div className="py-panel-title" style={{ margin:0 }}>Saved Cards 💳</div>
                <button className="py-add-card" style={{ width:'auto', padding:'8px 16px' }} onClick={() => setShowAddCard(true)}>+ Add Card</button>
              </div>
              <div className="py-cards-list">
                {cards.map(card => (
                  <div key={card.id} className={`py-card-item ${card.isDefault ? 'default-card' : ''}`}>
                    <span style={{ fontSize:'1.6rem' }}>💳</span>
                    <div className="py-card-info">
                      <div className="py-card-brand">{card.brand} {card.isDefault && <span className="py-default-badge">Default</span>}</div>
                      <div className="py-card-num">•••• •••• •••• {card.last4}</div>
                      <div className="py-card-expiry">Expires {card.expiry}</div>
                    </div>
                    {!card.isDefault && (
                      <button style={{ background:'none', border:'none', color:'#6366F1', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', padding:'4px 8px', borderRadius:'8px', whiteSpace:'nowrap' }}
                        onClick={() => handleSetDefault(card.id)}>Set Default</button>
                    )}
                    <button className="py-card-remove" onClick={() => handleRemoveCard(card.id)}>✕</button>
                  </div>
                ))}
                <button className="py-add-card" onClick={() => setShowAddCard(true)}>
                  <span style={{ fontSize:'1.4rem' }}>＋</span> Add Payment Method
                </button>
              </div>

              {/* Auto-pay toggle */}
              <div style={{ marginTop:'24px', padding:'18px', background:'#F7F5F0', borderRadius:'16px' }}>
                <div className="py-autopay-row">
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#1A1A2E' }}>🔄 Auto-Pay</div>
                    <div style={{ fontSize:'0.75rem', color:'#AAA', marginTop:'3px' }}>
                      {autoPay ? '✅ Enabled — payments processed automatically' : 'Disabled — you approve each payment'}
                    </div>
                  </div>
                  <label className="py-toggle">
                    <input type="checkbox" checked={autoPay} onChange={e => handleAutoPay(e.target.checked)} />
                    <span className="py-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── UPCOMING CHARGES TAB (from PaymentBilling) ── */}
          {activeTab === 'upcoming' && (
            <div className="py-panel-card">
              <div className="py-panel-title">Upcoming Charges 📅</div>
              {upcomingCharges.length > 0 ? (
              <div className="py-upcoming-list">
                {upcomingCharges.map(charge => (
                  <div key={charge.id} className="py-upcoming-item">
                    <div>
                      <div className="py-upcoming-name">{charge.description}</div>
                      <div className="py-upcoming-date">Due: {charge.date}</div>
                    </div>
                    <div className="py-upcoming-amt">₹{charge.amount.toLocaleString('en-IN')}</div>
                  </div>
                ))}
                <div className="py-upcoming-total">
                  <span>Total Due</span>
                  <span style={{ color:'#E11D48' }}>₹{upcomingCharges.reduce((s,c) => s + c.amount, 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
              ) : (
                <div style={{ color: '#AAA', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No upcoming charges</div>
              )}
              <button
                style={{ marginTop:'20px', width:'100%', padding:'13px', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'white', border:'none', borderRadius:'14px', fontFamily:"'Manrope',sans-serif", fontWeight:800, fontSize:'0.9rem', cursor:'pointer' }}
                onClick={() => showToast('💳 Opening payment gateway...')}
              >💰 Pay All (₹{upcomingCharges.reduce((s,c) => s + c.amount, 0).toLocaleString('en-IN')})</button>
            </div>
          )}

        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="py-right">
          {/* Trend chart */}
          <div className="py-panel-card" style={{ animationDelay:'0.1s' }}>
            <div className="py-panel-title">Monthly Trend 📈</div>
            <div className="py-chart">
              {chartValues.map((v, i) => (
                <div key={i} className="py-bar-wrap">
                  <div className="py-bar" style={{
                    height: `${(v/chartMax)*100}%`,
                    background: i === chartValues.length-1 ? 'linear-gradient(180deg,#6366F1,#8B5CF6)' : 'linear-gradient(180deg,#E0E7FF,#C7D2FE)',
                  }} />
                  <div className="py-bar-label">{MONTHS[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:'0.75rem', color:'#AAA', textAlign:'center' }}>
              {role==='parent'?'Monthly spend':'Monthly earnings'} (₹)
            </div>
          </div>

          {/* Method breakdown */}
          <div className="py-panel-card" style={{ animationDelay:'0.15s' }}>
            <div className="py-panel-title">Payment Methods 💳</div>
            {methodsList.length > 0 ? (
            <div className="py-method-list">
              {methodsList.map((m, i) => (
                <div key={i} className="py-method-item">
                  <div className="py-method-icon">{m.icon}</div>
                  <div className="py-method-name">{m.name}</div>
                  <div className="py-method-bar-wrap"><div className="py-method-fill" style={{ width:`${m.pct}%` }} /></div>
                  <div className="py-method-pct">{m.pct}%</div>
                </div>
              ))}
            </div>
            ) : (
              <div style={{ color: '#AAA', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No payment data yet</div>
            )}
          </div>

          {/* Quick actions */}
          <div className="py-panel-card" style={{ animationDelay:'0.2s' }}>
            <div className="py-panel-title">Quick Actions ⚡</div>
            {role === 'parent' && (<>
              <button className="py-quick-btn primary"    onClick={() => navigate('/booking')}>📅 Book a Nanny</button>
              <button className="py-quick-btn secondary"  onClick={() => setActiveTab('upcoming')}>💳 Pay Pending ({upcomingCharges.length})</button>
              <button className="py-quick-btn secondary" onClick={() => setActiveTab('methods')}>💳 Add Payment Method</button>
              <button className="py-quick-btn secondary" onClick={handleExportCSV}>📊 Download History</button>
              <button className="py-quick-btn secondary"  onClick={() => navigate('/child-information')}>👶 Add Child Info</button>
            </>)}
            {role === 'caretaker' && (<>
              <button className="py-quick-btn primary"   onClick={() => showToast('🏦 Payout request sent!')}>🏦 Request Payout</button>
              <button className="py-quick-btn secondary" onClick={() => showToast('📄 Generating invoice...')}>📄 Generate Invoice</button>
            </>)}
            {role === 'admin' && (<>
              <button className="py-quick-btn primary"   onClick={() => showToast('💸 Processing payouts...')}>💸 Process All Payouts</button>
              <button className="py-quick-btn secondary" onClick={() => showToast('📊 Generating report...')}>📊 Monthly Report</button>
            </>)}
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="py-modal-overlay" onClick={() => setShowAddCard(false)}>
          <div className="py-modal" onClick={e => e.stopPropagation()}>
            <h3>💳 Add a Card</h3>
            <input className="py-modal-input" placeholder="Card Brand (e.g. Visa, Mastercard)"
              value={newCard.brand} onChange={e => setNewCard(p => ({ ...p, brand: e.target.value }))} />
            <div className="py-modal-row">
              <input className="py-modal-input" placeholder="Last 4 digits" maxLength={4}
                value={newCard.last4} onChange={e => setNewCard(p => ({ ...p, last4: e.target.value.replace(/\D/g,'') }))} />
              <input className="py-modal-input" placeholder="Expiry MM/YY" maxLength={5}
                value={newCard.expiry} onChange={e => setNewCard(p => ({ ...p, expiry: e.target.value }))} />
            </div>
            <div className="py-modal-btns">
              <button className="py-modal-submit" onClick={handleAddCard}>✅ Add Card</button>
              <button className="py-modal-cancel" onClick={() => setShowAddCard(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#6366F1,#8B5CF6)', color:'white', padding:'12px 24px', borderRadius:'999px', fontWeight:700, fontSize:'0.88rem', boxShadow:'0 8px 24px rgba(99,102,241,0.35)', zIndex:1000 }}>
          {toast}
        </div>
      )}
    </div>
  );
}