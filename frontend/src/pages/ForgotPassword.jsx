import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaKey, FaArrowLeft } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email,
        newPassword,
      });
      toast.success(res.data.message || 'Password reset successful');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 dark:bg-slate-900 bg-slate-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full dark:bg-slate-800/60 bg-white p-10 rounded-3xl border dark:border-slate-700 border-slate-200 shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
            <FaKey />
          </div>
          <h2 className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-2 text-sm dark:text-slate-400 text-slate-600">
            Enter your registered email address and choose a new password.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
              Registered Email
            </label>
            <input
              type="email"
              required
              className="w-full px-5 py-3.5 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-3.5 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-5 py-3.5 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all text-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <FaArrowLeft /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
