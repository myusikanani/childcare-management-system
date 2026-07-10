import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, bookingsAPI } from '../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [activeReport, setActiveReport] = useState('overview');

  const [stats, setStats] = useState({
    bookings: [],
    users: [],
    payments: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, bookingsData] = await Promise.all([
          usersAPI.getAllUsers(),
          bookingsAPI.getAll(),
        ]);

        setStats({
          users: usersData.users || [],
          bookings: bookingsData.bookings || [],
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterByDate = (data, dateField = 'createdAt') => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate;
    });
  };

  const getReportData = () => {
    const filteredBookings = filterByDate(stats.bookings, 'createdAt');
    const filteredUsers = filterByDate(stats.users, 'createdAt');

    const completedBookings = filteredBookings.filter(b => 
      ['completed', 'confirmed'].includes(b.status?.toLowerCase())
    );
    const cancelledBookings = filteredBookings.filter(b => 
      b.status?.toLowerCase() === 'cancelled'
    );
    const pendingBookings = filteredBookings.filter(b => 
      b.status?.toLowerCase() === 'pending'
    );

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const platformCommission = completedBookings.reduce((sum, b) => sum + (b.platformEarns || Math.round((b.totalAmount || 0) * 0.1)), 0);

    const parents = stats.users.filter(u => u.role === 'user');
    const caretakers = stats.users.filter(u => u.role === 'caretaker');
    const pendingCaretakers = caretakers.filter(c => !c.isVerified && !c.isRejected);
    const activeCaretakers = caretakers.filter(c => c.isVerified);

    const topCaretakers = completedBookings.reduce((acc, b) => {
      const id = b.caretaker?._id || b.caretaker;
      const name = b.caretakerName || 'Unknown';
      if (!acc[id]) acc[id] = { name, count: 0, revenue: 0 };
      acc[id].count += 1;
      acc[id].revenue += (b.caretakerReceives || b.totalAmount || 0);
      return acc;
    }, {});

    const topParents = completedBookings.reduce((acc, b) => {
      const id = b.parent?._id || b.parent;
      const name = b.parentName || 'Unknown';
      if (!acc[id]) acc[id] = { name, count: 0, spent: 0 };
      acc[id].count += 1;
      acc[id].spent += (b.totalAmount || 0);
      return acc;
    }, {});

    const hourlyBookings = Array(24).fill(0);
    const dailyBookings = Array(7).fill(0);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    filteredBookings.forEach(b => {
      if (b.createdAt) {
        const date = new Date(b.createdAt);
        hourlyBookings[date.getHours()]++;
        dailyBookings[date.getDay()]++;
      }
    });

    return {
      bookings: {
        total: filteredBookings.length,
        completed: completedBookings.length,
        cancelled: cancelledBookings.length,
        pending: pendingBookings.length,
        completionRate: filteredBookings.length > 0 
          ? ((completedBookings.length / filteredBookings.length) * 100).toFixed(1) 
          : 0,
      },
      financial: {
        totalRevenue,
        platformCommission,
        caretakerEarnings: totalRevenue - platformCommission,
        avgBookingValue: completedBookings.length > 0 
          ? totalRevenue / completedBookings.length 
          : 0,
        refundAmount: cancelledBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      },
      users: {
        total: stats.users.length,
        newSignups: filteredUsers.length,
        parents: parents.length,
        caretakers: caretakers.length,
        pendingCaretakers: pendingCaretakers.length,
        activeCaretakers: activeCaretakers.length,
        caretakerApprovalRate: caretakers.length > 0 
          ? ((activeCaretakers.length / caretakers.length) * 100).toFixed(1) 
          : 0,
      },
      performance: {
        topCaretakers: Object.values(topCaretakers).sort((a, b) => b.count - a.count).slice(0, 5),
        topParents: Object.values(topParents).sort((a, b) => b.count - a.count).slice(0, 5),
        avgRating: caretakers.reduce((sum, c) => sum + (c.rating || 0), 0) / (activeCaretakers.length || 1),
      },
      analytics: {
        hourlyBookings,
        dailyBookings,
        dayNames,
      }
    };
  };

  const data = getReportData();

  const exportToCSV = () => {
    let csvContent = '';
    
    // Overview Report
    if (activeReport === 'overview') {
      csvContent += 'OVERVIEW REPORT\n';
      csvContent += '===============\n\n';
      csvContent += 'Booking Summary\n';
      csvContent += `Total Bookings,${data.bookings.total}\n`;
      csvContent += `Completed,${data.bookings.completed}\n`;
      csvContent += `Pending,${data.bookings.pending}\n`;
      csvContent += `Cancelled,${data.bookings.cancelled}\n`;
      csvContent += `Completion Rate,${data.bookings.completionRate}%\n\n`;
      csvContent += 'Financial Summary\n';
      csvContent += `Total Revenue,${data.financial.totalRevenue}\n`;
      csvContent += `Platform Commission,${data.financial.platformCommission}\n`;
      csvContent += `Caretaker Earnings,${data.financial.caretakerEarnings}\n\n`;
      csvContent += 'User Summary\n';
      csvContent += `Total Users,${data.users.total}\n`;
      csvContent += `Parents,${data.users.parents}\n`;
      csvContent += `Caretakers,${data.users.caretakers}\n`;
      csvContent += `Pending Approval,${data.users.pendingCaretakers}\n`;
    }
    // Bookings Report
    else if (activeReport === 'bookings') {
      csvContent += 'BOOKING REPORT\n';
      csvContent += '===============\n\n';
      csvContent += 'Summary\n';
      csvContent += `Total,${data.bookings.total}\n`;
      csvContent += `Completed,${data.bookings.completed}\n`;
      csvContent += `Pending,${data.bookings.pending}\n`;
      csvContent += `Cancelled,${data.bookings.cancelled}\n\n`;
      csvContent += 'Booking Details\n';
      csvContent += 'ID,Parent,Caretaker,Date,Time,Amount,Status,Payment Method\n';
      stats.bookings.forEach(b => {
        csvContent += `"${b._id || b.id || ''}","${b.parentName || ''}","${b.caretakerName || ''}","${b.date || ''}","${b.startTime || ''} - ${b.endTime || ''}",${b.totalAmount || 0},"${b.status || ''}","${b.paymentMethod || 'N/A'}"\n`;
      });
    }
    // Financial Report
    else if (activeReport === 'financial') {
      csvContent += 'FINANCIAL REPORT\n';
      csvContent += '=================\n\n';
      csvContent += 'Summary\n';
      csvContent += `Total Revenue,${data.financial.totalRevenue}\n`;
      csvContent += `Platform Commission (10%),${data.financial.platformCommission}\n`;
      csvContent += `Caretaker Earnings,${data.financial.caretakerEarnings}\n`;
      csvContent += `Average Booking Value,${Math.round(data.financial.avgBookingValue)}\n`;
      csvContent += `Refunded Amount,${data.financial.refundAmount}\n\n`;
      csvContent += 'Revenue Breakdown\n';
      csvContent += 'Caretaker Share,90%\n';
      csvContent += `Platform Share,10%\n`;
    }
    // Users Report
    else if (activeReport === 'users') {
      csvContent += 'USER REPORT\n';
      csvContent += '=============\n\n';
      csvContent += 'Summary\n';
      csvContent += `Total Users,${data.users.total}\n`;
      csvContent += `New Signups,${data.users.newSignups}\n`;
      csvContent += `Parents,${data.users.parents}\n`;
      csvContent += `Caretakers,${data.users.caretakers}\n`;
      csvContent += `Pending Approval,${data.users.pendingCaretakers}\n`;
      csvContent += `Approval Rate,${data.users.caretakerApprovalRate}%\n\n`;
      csvContent += 'User Details\n';
      csvContent += 'Name,Email,Role,Status,Joined Date,Rating\n';
      stats.users.forEach(u => {
        const status = u.role === 'caretaker' 
          ? (u.isVerified ? 'Active' : u.isRejected ? 'Rejected' : 'Pending')
          : 'Active';
        csvContent += `"${u.name || ''}","${u.email || ''}","${u.role === 'user' ? 'Parent' : 'Caretaker'}","${status}","${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}",${u.rating || 0}\n`;
      });
    }
    // Performance Report
    else if (activeReport === 'performance') {
      csvContent += 'PERFORMANCE REPORT\n';
      csvContent += '====================\n\n';
      csvContent += `Average Rating,${data.performance.avgRating.toFixed(1)}/5\n\n`;
      csvContent += 'Top Caretakers\n';
      csvContent += 'Rank,Name,Sessions,Revenue\n';
      data.performance.topCaretakers.forEach((c, i) => {
        csvContent += `${i + 1},"${c.name}",${c.count},${c.revenue}\n`;
      });
      csvContent += '\nTop Parents\n';
      csvContent += 'Rank,Name,Bookings,Total Spent\n';
      data.performance.topParents.forEach((p, i) => {
        csvContent += `${i + 1},"${p.name}",${p.count},${p.spent}\n`;
      });
    }
    // Analytics Report
    else if (activeReport === 'analytics') {
      csvContent += 'ANALYTICS REPORT\n';
      csvContent += '=================\n\n';
      csvContent += 'Bookings by Day of Week\n';
      csvContent += 'Day,Bookings\n';
      data.analytics.dayNames.forEach((day, i) => {
        csvContent += `${day},${data.analytics.dailyBookings[i]}\n`;
      });
      csvContent += '\nBookings by Hour\n';
      csvContent += 'Hour,Bookings\n';
      data.analytics.hourlyBookings.forEach((val, i) => {
        csvContent += `${i}:00,${val}\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ icon, label, value, sub, color }) => (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      border: `2px solid ${color}20`,
      transition: 'all 0.2s',
    }}>
      <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1A237E', fontFamily: "'Fredoka One', cursive" }}>
        {value}
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#90A4AE', marginBottom: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#90A4AE' }}>{sub}</div>}
    </div>
  );

  const MiniChart = ({ data, maxValue, color }) => {
    const max = maxValue || Math.max(...data, 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
        {data.map((val, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${(val / max) * 70}px`,
              minHeight: '4px',
              background: color,
              borderRadius: '4px 4px 0 0',
            }} />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'Nunito', sans-serif",
        fontSize: '1.2rem',
        color: '#90A4AE'
      }}>
        Loading reports...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F0F7FF',
      fontFamily: "'Nunito', sans-serif",
      padding: '32px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2rem', color: '#1A237E', margin: 0 }}>
            📊 Reports
          </h1>
          <p style={{ color: '#90A4AE', margin: '8px 0 0' }}>
            Comprehensive analytics and insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              border: '2px solid #E3F2FD',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#1A237E',
              cursor: 'pointer',
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={exportToCSV}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #43C6AC, #00C853)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📈' },
          { id: 'bookings', label: 'Bookings', icon: '📅' },
          { id: 'financial', label: 'Financial', icon: '💰' },
          { id: 'users', label: 'Users', icon: '👥' },
          { id: 'performance', label: 'Performance', icon: '⭐' },
          { id: 'analytics', label: 'Analytics', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              border: activeReport === tab.id ? '2px solid #1A237E' : '2px solid #E3F2FD',
              background: activeReport === tab.id ? '#1A237E' : 'white',
              color: activeReport === tab.id ? 'white' : '#90A4AE',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            📈 Overview Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="📅" label="Total Bookings" value={data.bookings.total} color="#4FC3F7" />
            <StatCard icon="✅" label="Completed" value={data.bookings.completed} color="#2E7D32" />
            <StatCard icon="💰" label="Revenue" value={`₹${data.financial.totalRevenue.toLocaleString()}`} color="#7B1FA2" />
            <StatCard icon="👥" label="Total Users" value={data.users.total} color="#FF5722" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Bookings by Status */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                Bookings by Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Completed', value: data.bookings.completed, color: '#2E7D32' },
                  { label: 'Pending', value: data.bookings.pending, color: '#F57F17' },
                  { label: 'Cancelled', value: data.bookings.cancelled, color: '#C62828' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#37474F' }}>{item.label}</span>
                      <span style={{ fontWeight: 800, color: item.color }}>{item.value}</span>
                    </div>
                    <div style={{ background: '#F0F7FF', borderRadius: '8px', height: '8px' }}>
                      <div style={{
                        width: `${data.bookings.total > 0 ? (item.value / data.bookings.total) * 100 : 0}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '8px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Distribution */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                User Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Parents', value: data.users.parents, color: '#4FC3F7' },
                  { label: 'Caretakers', value: data.users.caretakers, color: '#CE93D8' },
                  { label: 'Pending Caretakers', value: data.users.pendingCaretakers, color: '#FFD54F' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#37474F' }}>{item.label}</span>
                      <span style={{ fontWeight: 800, color: item.color }}>{item.value}</span>
                    </div>
                    <div style={{ background: '#F0F7FF', borderRadius: '8px', height: '8px' }}>
                      <div style={{
                        width: `${data.users.total > 0 ? (item.value / data.users.total) * 100 : 0}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '8px',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Report */}
      {activeReport === 'bookings' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            📅 Booking Report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="📅" label="Total Bookings" value={data.bookings.total} color="#4FC3F7" />
            <StatCard icon="✅" label="Completed" value={data.bookings.completed} color="#2E7D32" />
            <StatCard icon="⏳" label="Pending" value={data.bookings.pending} color="#F57F17" />
            <StatCard icon="❌" label="Cancelled" value={data.bookings.cancelled} color="#C62828" />
            <StatCard icon="🎯" label="Completion Rate" value={`${data.bookings.completionRate}%`} color="#7B1FA2" />
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
              Recent Bookings
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F0F7FF' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Parent</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Caretaker</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.bookings.slice(0, 10).map((b, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0F7FF' }}>
                    <td style={{ padding: '12px' }}>{b.parentName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{b.caretakerName || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{b.date || 'N/A'}</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: '#2E7D32' }}>₹{b.totalAmount || 0}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: b.status === 'completed' ? '#DCFCE7' : b.status === 'pending' ? '#FEF3C7' : '#FFEBEE',
                        color: b.status === 'completed' ? '#166534' : b.status === 'pending' ? '#92400E' : '#991B1B',
                      }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.bookings.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#90A4AE' }}>
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {activeReport === 'financial' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            💰 Financial Report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="💰" label="Total Revenue" value={`₹${data.financial.totalRevenue.toLocaleString()}`} color="#7B1FA2" />
            <StatCard icon="🏛️" label="Platform Commission" value={`₹${data.financial.platformCommission.toLocaleString()}`} color="#4FC3F7" />
            <StatCard icon="👩‍🍼" label="Caretaker Earnings" value={`₹${data.financial.caretakerEarnings.toLocaleString()}`} color="#2E7D32" />
            <StatCard icon="📊" label="Avg Booking Value" value={`₹${Math.round(data.financial.avgBookingValue)}`} color="#FF5722" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                Revenue Breakdown
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2E7D32' }}>
                    ₹{(data.financial.caretakerEarnings / 1000).toFixed(1)}k
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Caretakers</div>
                </div>
                <div style={{ width: '1px', height: '60px', background: '#E3F2FD' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4FC3F7' }}>
                    ₹{(data.financial.platformCommission / 1000).toFixed(1)}k
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Platform</div>
                </div>
              </div>
              <div style={{ background: '#F0F7FF', borderRadius: '8px', height: '12px' }}>
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{
                    width: `${data.financial.totalRevenue > 0 ? (data.financial.caretakerEarnings / data.financial.totalRevenue) * 100 : 0}%`,
                    background: '#2E7D32',
                    borderRadius: '8px 0 0 8px',
                  }} />
                  <div style={{
                    width: `${data.financial.totalRevenue > 0 ? (data.financial.platformCommission / data.financial.totalRevenue) * 100 : 0}%`,
                    background: '#4FC3F7',
                    borderRadius: '0 8px 8px 0',
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: 700 }}>● Caretakers</span>
                <span style={{ fontSize: '0.75rem', color: '#4FC3F7', fontWeight: 700 }}>● Platform (10%)</span>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                💳 Payment Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F0F7FF', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#37474F' }}>Completed Payments</span>
                  <span style={{ fontWeight: 800, color: '#2E7D32' }}>{data.bookings.completed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F0F7FF', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#37474F' }}>Pending Payments</span>
                  <span style={{ fontWeight: 800, color: '#F57F17' }}>{data.bookings.pending}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#F0F7FF', borderRadius: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#37474F' }}>Refunded</span>
                  <span style={{ fontWeight: 800, color: '#C62828' }}>₹{data.financial.refundAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Report */}
      {activeReport === 'users' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            👥 User Report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="👥" label="Total Users" value={data.users.total} color="#4FC3F7" />
            <StatCard icon="📝" label="New Signups" value={data.users.newSignups} color="#FF5722" />
            <StatCard icon="👨‍👩" label="Parents" value={data.users.parents} color="#7B1FA2" />
            <StatCard icon="👩‍🍼" label="Caretakers" value={data.users.caretakers} color="#CE93D8" />
            <StatCard icon="⏳" label="Pending Approval" value={data.users.pendingCaretakers} color="#F57F17" />
            <StatCard icon="✅" label="Approval Rate" value={`${data.users.caretakerApprovalRate}%`} color="#2E7D32" />
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
              All Users
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F0F7FF' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.78rem', color: '#90A4AE', fontWeight: 700 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0F7FF' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '12px', color: '#90A4AE' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: u.role === 'user' ? '#E3F2FD' : '#F3E5F5',
                        color: u.role === 'user' ? '#1565C0' : '#7B1FA2',
                      }}>
                        {u.role === 'user' ? 'Parent' : 'Caretaker'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: u.role === 'caretaker' 
                          ? (u.isVerified ? '#DCFCE7' : u.isRejected ? '#FFEBEE' : '#FEF3C7')
                          : '#DCFCE7',
                        color: u.role === 'caretaker'
                          ? (u.isVerified ? '#166534' : u.isRejected ? '#991B1B' : '#92400E')
                          : '#166534',
                      }}>
                        {u.role === 'caretaker' 
                          ? (u.isVerified ? 'Active' : u.isRejected ? 'Rejected' : 'Pending')
                          : 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#90A4AE' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {stats.users.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#90A4AE' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Report */}
      {activeReport === 'performance' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            ⭐ Performance Report
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <StatCard icon="⭐" label="Avg Rating" value={data.performance.avgRating.toFixed(1)} color="#FFD54F" sub="/ 5.0" />
            <StatCard icon="🏆" label="Top Caretakers" value={data.performance.topCaretakers.length} color="#7B1FA2" />
            <StatCard icon="👨‍👩" label="Top Parents" value={data.performance.topParents.length} color="#FF5722" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                🏆 Top Caretakers
              </h3>
              {data.performance.topCaretakers.map((c, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: i === 0 ? '#FFF8E1' : '#F8FAFC',
                  borderRadius: '12px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: i === 0 ? '#FFD54F' : i === 1 ? '#90A4AE' : i === 2 ? '#CD7F32' : '#E3F2FD',
                    color: i < 3 ? 'white' : '#1A237E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1A237E' }}>{c.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#90A4AE' }}>{c.count} sessions</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#2E7D32' }}>₹{c.revenue.toLocaleString()}</div>
                </div>
              ))}
              {data.performance.topCaretakers.length === 0 && (
                <p style={{ color: '#90A4AE', textAlign: 'center', padding: '20px' }}>No caretaker data</p>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                👨‍👩 Top Parents
              </h3>
              {data.performance.topParents.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: i === 0 ? '#F0F9FF' : '#F8FAFC',
                  borderRadius: '12px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#4FC3F7',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                  }}>
                    {p.name?.[0]?.toUpperCase() || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1A237E' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#90A4AE' }}>{p.count} bookings</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#C62828' }}>₹{p.spent.toLocaleString()}</div>
                </div>
              ))}
              {data.performance.topParents.length === 0 && (
                <p style={{ color: '#90A4AE', textAlign: 'center', padding: '20px' }}>No parent data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Report */}
      {activeReport === 'analytics' && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '20px' }}>
            📊 Analytics
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                📅 Bookings by Day of Week
              </h3>
              <MiniChart data={data.analytics.dailyBookings} color="#4FC3F7" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {data.analytics.dayNames.map((day, i) => (
                  <span key={i} style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>{day}</span>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", color: '#1A237E', marginBottom: '16px' }}>
                🕐 Bookings by Hour
              </h3>
              <MiniChart data={data.analytics.hourlyBookings} color="#7B1FA2" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>12AM</span>
                <span style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>6AM</span>
                <span style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>12PM</span>
                <span style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>6PM</span>
                <span style={{ fontSize: '0.72rem', color: '#90A4AE', fontWeight: 700 }}>11PM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
