import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaCity } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-slate-900 bg-slate-50 transition-colors duration-300">
      {/* Left side - Colorful Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 items-center justify-center p-12">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 text-white max-w-lg">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <FaCity className="text-7xl mb-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            <h1 className="text-5xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-300">
              Welcome Back to SmartCity.
            </h1>
            <p className="text-xl text-indigo-200 font-light leading-relaxed">
              Log in to manage your civic reports, track city maintenance progress, and help us build a better community together.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full dark:bg-slate-800/60 bg-white p-10 rounded-3xl border dark:border-slate-700 border-slate-200 shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">Sign In</h2>
            <p className="mt-3 text-sm dark:text-slate-400 text-slate-600">
              Don't have an account? <Link to="/register" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">Create one now</Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium dark:text-slate-300 text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-sm font-semibold text-fuchsia-500 hover:text-fuchsia-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-4 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg cursor-pointer">
                Sign In
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
