// File Path: src/pages/Payment.jsx
// Description: Payment page - dummy payment system

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, paymentsAPI } from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get booking data from state
  const bookingData = location.state;
  const { bookingType, nanny, amount, bookingData: details } = bookingData || {};

  const [paymentStep, setPaymentStep] = useState('method'); // 'method' | 'form' | 'processing' | 'success'
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '', cardName: '', expiryDate: '', cvv: '', upiId: '', bankName: ''
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Redirect if no booking data
  useEffect(() => {
    if (!bookingData || (!amount && !details?.bookingId)) {
      navigate('/');
    }
  }, [bookingData, amount, details, navigate]);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '💳' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Wallet', icon: '👛' },
    { id: 'cash', name: 'Cash', icon: '💵' },
  ];

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    setPaymentStep('form');
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (selectedMethod === 'card') {
      if (!paymentDetails.cardNumber || paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Enter valid 16-digit card number';
      }
      if (!paymentDetails.cardName) {
        newErrors.cardName = 'Enter cardholder name';
      }
      if (!paymentDetails.expiryDate || paymentDetails.expiryDate.length < 5) {
        newErrors.expiryDate = 'Enter valid expiry (MM/YY)';
      }
      if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
        newErrors.cvv = 'Enter valid CVV';
      }
    }
    
    if (selectedMethod === 'upi') {
      if (!paymentDetails.upiId || !paymentDetails.upiId.includes('@')) {
        newErrors.upiId = 'Enter valid UPI ID (e.g. name@upi)';
      }
    }
    
    if (selectedMethod === 'netbanking') {
      if (!paymentDetails.bankName) {
        newErrors.bankName = 'Select your bank';
      }
    }
    
    // Cash method doesn't need validation
    if (selectedMethod === 'cash') {
      // No validation needed for cash
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processPayment = async () => {
    // Skip validation for cash payment
    if (selectedMethod !== 'cash' && !validateForm()) return;

    setPaymentStep('processing');

    // Simulate payment processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate transaction ID
    const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setTransactionId(txnId);

    // Update booking payment status in backend
    if (details?.bookingId) {
      try {
        await paymentsAPI.confirmPayment({
          bookingId: details.bookingId,
          paymentIntentId: txnId,
          method: selectedMethod,
        });
      } catch (err) {
        console.log('Payment API error:', err);
      }
    }

    setPaymentStep('success');
  };

  // ── Success Screen ──
  if (paymentStep === 'success') {
    return (
      <div style={styles.successPage}>
        <div style={styles.successContainer}>
          <div style={styles.checkmarkCircle}>✓</div>
          <h1 style={styles.successTitle}>Payment Successful!</h1>
          <p style={styles.successText}>Amount: <strong>₹{amount || details?.amount || 0}</strong></p>
          <p style={styles.successText}>Transaction ID: {transactionId}</p>
          <p style={styles.successText}>Payment Method: {selectedMethod.toUpperCase()}</p>
          <button 
            style={styles.successBtn}
            onClick={() => navigate('/parent-dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Processing Screen ──
  if (paymentStep === 'processing') {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.processingContainer}>
            <div style={styles.spinner}></div>
            <h2 style={styles.processingTitle}>Processing Payment...</h2>
            <p style={styles.processingText}>Please wait, do not close this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main UI ──
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.btnBack} onClick={() => navigate(-1)}>← Back</button>
        <h1 style={styles.title}>Complete Payment</h1>

        <div style={styles.content}>
          {/* Left Section - Summary */}
          <div style={styles.leftSection}>
            <div style={styles.summaryCard}>
              <h3>Payment Summary</h3>
              {nanny && (
                <div style={styles.nannyInfo}>
                  <div style={styles.nannyThumbFallback}>👩</div>
                  <div>
                    <h4>{nanny.name || 'Caregiver'}</h4>
                    <p>{details?.startDate || 'Session'}</p>
                  </div>
                </div>
              )}
              <div style={styles.amountRow}>
                <span>Total Amount</span>
                <strong>₹{amount || 0}</strong>
              </div>
            </div>

            <h3>Select Payment Method</h3>
            {paymentMethods.map(method => (
              <div
                key={method.id}
                style={{
                  ...styles.methodCard,
                  ...(selectedMethod === method.id ? styles.methodCardSelected : {})
                }}
                onClick={() => handleMethodSelect(method.id)}
              >
                <span style={styles.methodIcon}>{method.icon}</span>
                <span>{method.name}</span>
                {selectedMethod === method.id && <span style={styles.checkmark}>✓</span>}
              </div>
            ))}
          </div>

          {/* Right Section - Payment Form */}
          <div style={styles.rightSection}>
            {paymentStep === 'form' ? (
              <div style={styles.form}>
                <h3>Enter Payment Details</h3>

                {selectedMethod === 'card' && (
                  <>
                    <div style={styles.formGroup}>
                      <label>Card Number *</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                          const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                          handleInputChange('cardNumber', formatted);
                        }}
                        maxLength="19"
                        style={{...styles.input, ...(errors.cardNumber ? styles.inputError : {})}}
                      />
                      {errors.cardNumber && <span style={styles.errorText}>{errors.cardNumber}</span>}
                    </div>

                    <div style={styles.formGroup}>
                      <label>Cardholder Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentDetails.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                        style={{...styles.input, ...(errors.cardName ? styles.inputError : {})}}
                      />
                      {errors.cardName && <span style={styles.errorText}>{errors.cardName}</span>}
                    </div>

                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentDetails.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2,4);
                            handleInputChange('expiryDate', value);
                          }}
                          maxLength="5"
                          style={{...styles.input, ...(errors.expiryDate ? styles.inputError : {})}}
                        />
                        {errors.expiryDate && <span style={styles.errorText}>{errors.expiryDate}</span>}
                      </div>
                      <div style={styles.formGroup}>
                        <label>CVV *</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={paymentDetails.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                          maxLength="3"
                          style={{...styles.input, ...(errors.cvv ? styles.inputError : {})}}
                        />
                        {errors.cvv && <span style={styles.errorText}>{errors.cvv}</span>}
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === 'upi' && (
                  <div style={styles.formGroup}>
                    <label>UPI ID *</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={paymentDetails.upiId}
                      onChange={(e) => handleInputChange('upiId', e.target.value)}
                      style={{...styles.input, ...(errors.upiId ? styles.inputError : {})}}
                    />
                    {errors.upiId && <span style={styles.errorText}>{errors.upiId}</span>}
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div style={styles.formGroup}>
                    <label>Select Your Bank *</label>
                    <select
                      value={paymentDetails.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      style={{...styles.input, ...(errors.bankName ? styles.inputError : {})}}
                    >
                      <option value="">Choose a bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                    </select>
                    {errors.bankName && <span style={styles.errorText}>{errors.bankName}</span>}
                  </div>
                )}

                {selectedMethod === 'wallet' && (
                  <div style={styles.walletGrid}>
                    <button style={styles.walletBtn} onClick={() => handleInputChange('wallet', 'paytm')}>PayTM</button>
                    <button style={styles.walletBtn} onClick={() => handleInputChange('wallet', 'phonepe')}>PhonePe</button>
                    <button style={styles.walletBtn} onClick={() => handleInputChange('wallet', 'amazon')}>Amazon Pay</button>
                  </div>
                )}

                {selectedMethod === 'cash' && (
                  <div style={{ textAlign:'center', padding:'30px', background:'#FFF8E1', borderRadius:'12px', border:'2px solid #F57F17' }}>
                    <span style={{ fontSize:'3rem' }}>💵</span>
                    <h3 style={{ color:'#F57F17', margin:'12px 0 8px', fontSize:'1.1rem' }}>Cash Payment</h3>
                    <p style={{ color:'#90A4AE', fontSize:'0.88rem', margin:'0 0 12px' }}>
                      Pay ₹{amount || 0} in cash directly to the caretaker
                    </p>
                    <p style={{ color:'#C62828', fontSize:'0.82rem', margin:0, fontWeight:600 }}>
                      ⚠️ Cash transactions are tracked for compliance
                    </p>
                  </div>
                )}

                <div style={styles.formActions}>
                  <button style={styles.btnBack2} onClick={() => setPaymentStep('method')}>Change Method</button>
                  <button style={styles.btnPay} onClick={processPayment}>Pay ₹{amount || 0}</button>
                </div>
              </div>
            ) : (
              <div style={styles.formPlaceholder}>
                <p>👈 Please select a payment method</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Styles ──
const styles = {
  page: {
    minHeight: '100vh',
    background: '#F0F7FF',
    padding: '40px 20px',
    fontFamily: "'Nunito', sans-serif",
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  btnBack: {
    background: 'white',
    border: '2px solid #E3F2FD',
    borderRadius: '999px',
    padding: '10px 20px',
    fontWeight: '700',
    color: '#1A237E',
    cursor: 'pointer',
    marginBottom: '24px',
  },
  btnBack2: {
    background: 'white',
    border: '2px solid #E3F2FD',
    borderRadius: '999px',
    padding: '12px 24px',
    fontWeight: '700',
    color: '#1A237E',
    cursor: 'pointer',
  },
  title: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '2rem',
    color: '#1A237E',
    marginBottom: '24px',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(26,35,126,0.08)',
    border: '1px solid #E3F2FD',
  },
  nannyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  nannyThumbFallback: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E3F2FD, #F3E5F5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  amountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '2px solid #F0F7FF',
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#1A237E',
  },
  methodCard: {
    background: 'white',
    border: '2px solid #E3F2FD',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  methodCardSelected: {
    borderColor: '#4FC3F7',
    background: '#F0F7FF',
  },
  methodIcon: {
    fontSize: '1.5rem',
  },
  checkmark: {
    marginLeft: 'auto',
    color: '#4FC3F7',
    fontWeight: '800',
  },
  rightSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(26,35,126,0.08)',
    border: '1px solid #E3F2FD',
    minHeight: '300px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #E3F2FD',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1A237E',
    outline: 'none',
  },
  inputError: {
    borderColor: '#E11D48',
  },
  errorText: {
    color: '#E11D48',
    fontSize: '0.78rem',
    fontWeight: '600',
  },
  walletGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  walletBtn: {
    padding: '16px',
    border: '2px solid #E3F2FD',
    borderRadius: '12px',
    background: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  btnPay: {
    flex: 1,
    background: 'linear-gradient(135deg, #4FC3F7, #43C6AC)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 28px',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(79,195,247,0.4)',
  },
  formPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#90A4AE',
    fontWeight: '600',
  },
  processingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '5px solid #E3F2FD',
    borderTopColor: '#4FC3F7',
    borderRadius: '50%',
    margin: '0 auto 24px',
    animation: 'spin 1s linear infinite',
  },
  processingTitle: {
    color: '#1A237E',
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  processingText: {
    color: '#90A4AE',
  },
  successPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  successContainer: {
    background: 'white',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '420px',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
  },
  checkmarkCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #43C6AC, #4FC3F7)',
    color: 'white',
    fontSize: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  successTitle: {
    fontFamily: "'Fredoka One', cursive",
    fontSize: '2rem',
    color: '#1A237E',
    marginBottom: '16px',
  },
  successText: {
    color: '#37474F',
    fontSize: '1rem',
    marginBottom: '8px',
  },
  successBtn: {
    marginTop: '24px',
    background: 'linear-gradient(135deg, #4FC3F7, #43C6AC)',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '14px 32px',
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

// Add keyframes for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Payment;
