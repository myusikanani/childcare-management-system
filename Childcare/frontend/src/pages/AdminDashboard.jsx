import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaDollarSign, FaCalendarCheck, FaChartLine, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { MdRateReview, MdVerifiedUser } from 'react-icons/md';
import { GiCarProfile } from 'react-icons/gi';
import { BsShieldLock } from 'react-icons/bs';
import '../styles/Animations.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCaretakers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    verifiedCaretakers: 0,
    monthlyRevenue: [],
    bookingsByStatus: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  });
  const [users, setUsers] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ userId: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, caretakersRes, bookingsRes, statsRes] = await Promise.all([
        api.get('/api/auth/users'),
        api.get('/api/auth/caretakers'),
        api.get('/api/bookings'),
        api.get('/api/stats/admin')
      ]);

      const allUsers = usersRes.data;
      const allCaretakers = caretakersRes.data;
      const allBookings = bookingsRes.data;
      const adminStats = statsRes.data;

      setUsers(allUsers.filter(u => u.role !== 'admin'));
      setCaretakers(allCaretakers);
      setBookings(allBookings);

      setStats({
        totalUsers: allUsers.filter(u => u.role === 'user').length,
        totalCaretakers: allCaretakers.length,
        totalBookings: allBookings.length,
        totalRevenue: adminStats?.totalRevenue || 0,
        pendingApprovals: adminStats?.pendingApprovals || 0,
        verifiedCaretakers: adminStats?.verifiedCaretakers || 0,
        monthlyRevenue: adminStats?.monthlyRevenue || [0, 0, 0, 0, 0, 0],
        bookingsByStatus: {
          pending: allBookings.filter(b => b.status === 'pending').length,
          confirmed: allBookings.filter(b => b.status === 'confirmed').length,
          completed: allBookings.filter(b => b.status === 'completed').length,
          cancelled: allBookings.filter(b => b.status === 'cancelled').length
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCaretaker = async (caretakerId) => {
    try {
      await api.put(`/api/auth/caretaker/${caretakerId}/verify`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving caretaker:', error);
    }
  };

  const handleRejectCaretaker = async (caretakerId) => {
    try {
      await api.put(`/api/auth/caretaker/${caretakerId}/reject`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting caretaker:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/auth/user/${userId}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      await api.put(`/api/auth/user/${passwordData.userId}/reset-password`, {
        password: passwordData.newPassword
      });
      setPasswordSuccess('Password reset successfully!');
      setPasswordData({ userId: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError('Failed to reset password');
    }
  };

  const openPasswordModal = (userId) => {
    setPasswordData({ ...passwordData, userId });
    setShowPasswordModal(true);
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: stats.monthlyRevenue,
        fill: true,
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        borderColor: '#9333ea',
        tension: 0.4
      }
    ]
  };

  const bookingsChartData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.bookingsByStatus.pending,
          stats.bookingsByStatus.confirmed,
          stats.bookingsByStatus.completed,
          stats.bookingsByStatus.cancelled
        ],
        backgroundColor: ['#fbbf24', '#3b82f6', '#22c55e', '#ef4444']
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#374151', padding: 20 }
      }
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-md p-6 hover-lift ripple">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className="text-2xl" style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your Trusted Care platform</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ripple"
          >
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaUsers}
            title="Total Users"
            value={stats.totalUsers}
            color="#3b82f6"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={GiCarProfile}
            title="Caretakers"
            value={stats.totalCaretakers}
            color="#8b5cf6"
            bgColor="bg-purple-100"
          />
          <StatCard
            icon={FaCalendarCheck}
            title="Total Bookings"
            value={stats.totalBookings}
            color="#22c55e"
            bgColor="bg-green-100"
          />
          <StatCard
            icon={FaDollarSign}
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="#f59e0b"
            bgColor="bg-yellow-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={MdRateReview}
            title="Pending Approvals"
            value={stats.pendingApprovals}
            color="#ef4444"
            bgColor="bg-red-100"
          />
          <StatCard
            icon={MdVerifiedUser}
            title="Verified Caretakers"
            value={stats.verifiedCaretakers}
            color="#10b981"
            bgColor="bg-emerald-100"
          />
          <StatCard
            icon={FaChartLine}
            title="Active Bookings"
            value={stats.bookingsByStatus.confirmed}
            color="#6366f1"
            bgColor="bg-indigo-100"
          />
          <StatCard
            icon={BsShieldLock}
            title="Security Status"
            value="Secure"
            color="#14b8a6"
            bgColor="bg-teal-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 hover-lift ripple">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue Trend</h3>
            <div style={{ height: '250px' }}>
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover-lift ripple">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Bookings by Status</h3>
            <div style={{ height: '250px' }}>
              <Doughnut data={bookingsChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-8 hover-lift ripple">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'users' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
            >
              <FaUsers className="inline mr-2" />Users
            </button>
            <button
              onClick={() => setActiveTab('caretakers')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'caretakers' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
            >
              <GiCarProfile className="inline mr-2" />Caretakers
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
            >
              <FaCalendarCheck className="inline mr-2" />Bookings
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{user.avatar || '👤'}</span>
                          <span className="font-medium">{user.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openPasswordModal(user._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Reset Password"
                          >
                            <FaLock />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete User"
                            >
                              <FaExclamationTriangle />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'caretakers' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Caretaker</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {caretakers.map((caretaker) => (
                    <tr key={caretaker._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{caretaker.avatar || '👩‍🍼'}</span>
                          <span className="font-medium">{caretaker.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{caretaker.email}</td>
                      <td className="py-3 px-4 text-gray-600">{caretaker.experience || 0} years</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          caretaker.isVerified
                            ? 'bg-green-100 text-green-700'
                            : caretaker.isRejected
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {caretaker.isVerified ? 'Verified' : caretaker.isRejected ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {!caretaker.isVerified && !caretaker.isRejected && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveCaretaker(caretaker._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ripple"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCaretaker(caretaker._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition ripple"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'bookings' && (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Booking ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Parent</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Caretaker</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{booking._id.slice(-8)}</td>
                      <td className="py-3 px-4">{booking.parentName || 'N/A'}</td>
                      <td className="py-3 px-4">{booking.caretakerName || 'N/A'}</td>
                      <td className="py-3 px-4">{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold">${booking.amount || 0}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700'
                          : booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700'
                          : booking.status === 'cancelled' ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md hover-lift">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reset User Password</h3>
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              {passwordError && <p className="text-red-600 mb-4">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-600 mb-4">{passwordSuccess}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition ripple"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
