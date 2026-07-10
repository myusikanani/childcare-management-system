import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../services/api';

const PaymentHistory = () => {
  const { user, isParent, isCaretaker, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getPaymentHistory();
      if (response.success) {
        setPayments(response.payments);
      }
    } catch (err) {
      setError('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const styles = {
    page: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '24px' },
    title: { fontSize: '1.8rem', fontWeight: '700', color: '#1a1a2e' },
    card: { background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #e0e0e0', color: '#666', fontSize: '0.9rem', fontWeight: '600' },
    td: { padding: '16px', borderBottom: '1px solid #f0f0f0' },
    empty: { textAlign: 'center', padding: '60px 20px', color: '#999' },
    badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
    loading: { textAlign: 'center', padding: '60px', color: '#666' },
  };

  const getBadgeStyle = (status) => ({
    background: status === 'paid' ? '#e8f5e9' : '#fff3e0',
    color: status === 'paid' ? '#2e7d32' : '#e65100',
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment History</h1>
        <p style={{ color: '#666', marginTop: '4px' }}>
          {isParent && 'View your payment records for childcare sessions'}
          {isCaretaker && 'View payments received for your services'}
          {isAdmin && 'View all payment transactions'}
        </p>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.loading}>Loading payment history...</div>
        ) : error ? (
          <div style={{ ...styles.empty, color: '#f44336' }}>{error}</div>
        ) : payments.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</p>
            <p>No payment records found</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Service</th>
                <th style={styles.th}>
                  {isCaretaker ? 'Parent' : 'Caretaker'}
                </th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td style={styles.td}>{formatDate(payment.paidAt || payment.createdAt)}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>Childcare Session</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      {payment.date} · {payment.startTime} - {payment.endTime}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {isCaretaker 
                      ? (payment.parent?.fullName || 'Unknown')
                      : (payment.caretaker?.fullName || 'Unknown')
                    }
                  </td>
                  <td style={{ ...styles.td, fontWeight: '700', color: '#2e7d32' }}>
                    ₹{payment.totalAmount}
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getBadgeStyle(payment.paymentStatus) }}>
                      {payment.paymentStatus?.toUpperCase() || 'PAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
