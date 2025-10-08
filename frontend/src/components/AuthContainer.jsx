import React, { useState, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../api/auth';
import { FaUser, FaLock, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const UserProfile = ({ user, onLogout }) => (
  <div className="p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-xl font-bold text-gray-800 mb-4">مرحباً بك، {user.firstName || 'المستخدم'}!</h2>
    <p className="text-gray-600 mb-2">البريد: {user.email}</p>
    <p className="text-gray-600 mb-4">الدور: <span className="font-semibold text-blue-600">{user.role}</span></p>
    <button
      onClick={onLogout}
      className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
    >
      <FaSignOutAlt className="ml-2" /> تسجيل الخروج
    </button>
  </div>
);

const LoginSection = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('shxii9rt@gmail.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      onLoginSuccess();
    } catch (err) {
      setError('فشل تسجيل الدخول. تحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-xl w-full max-w-sm">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول (Admin)</h2>
      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <FaUser className="mx-3 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 focus:ring-blue-500 focus:border-blue-500 border-none rounded-md"
            placeholder="shxii9rt@gmail.com"
            required
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <FaLock className="mx-3 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 focus:ring-blue-500 focus:border-blue-500 border-none rounded-md"
            placeholder="password123"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 focus:outline-none"
      >
        <FaSignInAlt className="ml-2" />
        {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
      </button>
      <p className="text-xs text-gray-500 mt-2 text-center">البيانات الافتراضية للمدير تم ملؤها تلقائياً.</p>
    </form>
  );
};

const AuthContainer = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (loading) {
    return <div className="text-lg text-blue-600">جاري التحقق من حالة المصادقة...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-700 mb-8">نظام المزادات - اختبار المصادقة</h1>
      {user ? (
        <UserProfile user={user} onLogout={handleLogout} />
      ) : (
        <LoginSection onLoginSuccess={checkAuthStatus} />
      )}
    </div>
  );
};

export default AuthContainer;
