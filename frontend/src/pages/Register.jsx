import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, user } = useContext(AuthContext);
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
      await register(name, email, password);
      toast.success('Registration successful');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-slate-900 bg-slate-50 transition-colors duration-300">
      
      {/* Left side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full dark:bg-slate-800/60 bg-white p-10 rounded-3xl border dark:border-slate-700 border-slate-200 shadow-2xl relative z-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold dark:text-white text-slate-900 tracking-tight">Create Account</h2>
            <p className="mt-3 text-sm dark:text-slate-400 text-slate-600">
              Already have an account? <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">Sign in here</Link>
            </p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-slate-300 text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full px-5 py-4 dark:bg-slate-900/80 bg-white border dark:border-slate-700 border-slate-300 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 text-lg cursor-pointer">
                Create Account
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right side - Colorful Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-bl from-teal-900 via-slate-900 to-slate-900 items-center justify-center p-12">
        {/* Animated background elements */}
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="relative z-10 text-white max-w-lg text-right flex flex-col items-end">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-end">
            <FaUserPlus className="text-7xl mb-8 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
            <h1 className="text-5xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-teal-300 text-right">
              Join the Movement.
            </h1>
            <p className="text-xl text-teal-100/70 font-light leading-relaxed text-right">
              Become a verified citizen today. Report hazards, track repairs, and ensure your neighborhood remains safe and clean for everyone.
            </p>
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Register;
