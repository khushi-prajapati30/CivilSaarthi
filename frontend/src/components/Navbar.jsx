import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { FaCity, FaUserCircle, FaMapMarkedAlt, FaPlusCircle, FaChartBar, FaShieldAlt, FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getLinkClass = (path, activeBg, activeText) => {
    const base = "px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center cursor-pointer";
    if (isActive(path)) {
      return `${base} ${activeBg} ${activeText}`;
    }
    return `${base} dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white text-slate-600 hover:bg-slate-100 hover:text-slate-950`;
  };

  return (
    <nav className="sticky top-0 z-50 dark:bg-slate-900/80 bg-white/95 backdrop-blur-xl border-b dark:border-cyan-500/30 border-slate-200 shadow-[0_4px_20px_rgba(6,182,212,0.1)] transition-colors duration-300">
      {/* Decorative top rainbow border */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:rotate-12 transition-transform">
                <FaCity className="text-xl text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r dark:from-white dark:to-cyan-200 from-slate-900 to-cyan-700">
                SmartCity
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Always visible options */}
            <Link 
              to="/" 
              className={getLinkClass('/', 'dark:bg-cyan-500/20 bg-cyan-50 text-cyan-600 dark:text-cyan-300', 'font-black')}
            >
              Home
            </Link>
            <Link 
              to="/all-issues" 
              className={getLinkClass('/all-issues', 'dark:bg-purple-500/20 bg-purple-50 text-purple-600 dark:text-purple-300', 'font-black')}
            >
              <FaMapMarkedAlt className="mr-1" /> All Issues
            </Link>
            <Link 
              to="/report" 
              className={getLinkClass('/report', 'dark:bg-orange-500/20 bg-orange-50 text-orange-600 dark:text-orange-300', 'font-black')}
            >
              <FaPlusCircle className="mr-1" /> Report
            </Link>

            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Link 
                      to="/admin" 
                      className={getLinkClass('/admin', 'dark:bg-blue-500/20 bg-blue-50 text-blue-600 dark:text-blue-300', 'font-black')}
                    >
                      <FaShieldAlt className="mr-1" /> Admin
                    </Link>
                    <Link 
                      to="/analytics" 
                      className={getLinkClass('/analytics', 'dark:bg-fuchsia-500/20 bg-fuchsia-50 text-fuchsia-600 dark:text-fuchsia-300', 'font-black')}
                    >
                      <FaChartBar className="mr-1" /> Analytics
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/dashboard" 
                    className={getLinkClass('/dashboard', 'dark:bg-teal-500/20 bg-teal-50 text-teal-600 dark:text-teal-300', 'font-black')}
                  >
                    Dashboard
                  </Link>
                )}
                
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-lg dark:text-slate-300 text-slate-600 dark:hover:bg-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-all focus:outline-none flex items-center justify-center cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <FaSun className="text-yellow-400 text-lg animate-pulse" />
                  ) : (
                    <FaMoon className="text-indigo-600 text-lg" />
                  )}
                </button>

                <div className="flex items-center pl-4 ml-4 border-l dark:border-slate-700 border-slate-200">
                  <div className="flex items-center dark:text-cyan-400 dark:bg-cyan-950/50 text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border dark:border-cyan-800 border-cyan-200 mr-3">
                    <FaUserCircle className="text-lg mr-2" />
                    <span className="font-semibold text-sm truncate max-w-[100px]">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-600 dark:text-rose-300 border border-rose-500/50 text-sm font-bold px-4 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-lg dark:text-slate-300 text-slate-600 dark:hover:bg-slate-800 hover:bg-slate-100 hover:text-slate-950 transition-all focus:outline-none flex items-center justify-center cursor-pointer"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <FaSun className="text-yellow-400 text-lg animate-pulse" />
                  ) : (
                    <FaMoon className="text-indigo-600 text-lg" />
                  )}
                </button>

                <div className="flex items-center pl-4 ml-4 border-l dark:border-slate-700 border-slate-200 space-x-3">
                  <Link to="/login" className="dark:text-slate-300 dark:hover:text-white text-slate-600 hover:text-slate-950 font-bold text-sm transition-colors">Login</Link>
                  <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm px-5 py-2 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all transform hover:-translate-y-0.5">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
