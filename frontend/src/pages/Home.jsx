import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaMagic, FaChartLine } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-dark-bg z-0 transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 dark:bg-primary-600 bg-teal-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 dark:bg-blue-600 bg-blue-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 dark:bg-purple-600 bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold dark:text-white text-slate-900 mb-6 tracking-tight">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-500">Civic Management</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl dark:text-gray-300 text-slate-600 mx-auto mb-10">
            Report local issues instantly. Our AI automatically detects duplicates, prioritizes critical problems, and assigns them to the right department for a better city.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/report" className="btn-primary text-lg px-8 py-4">Report an Issue</Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">Admin Portal</Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500 text-3xl">
              <FaMapMarkedAlt />
            </div>
            <h3 className="text-2xl font-bold dark:text-white text-slate-900 mb-4">Location Based</h3>
            <p className="dark:text-gray-400 text-slate-600">Pinpoint exactly where the issue is using our interactive map. Precision leads to faster resolution.</p>
          </div>
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 dark:text-blue-400 text-3xl">
              <FaMagic />
            </div>
            <h3 className="text-2xl font-bold dark:text-white text-slate-900 mb-4">Smart Merging</h3>
            <p className="dark:text-gray-400 text-slate-600">Our system detects duplicate complaints nearby and merges them to automatically increase priority.</p>
          </div>
          <div className="glass-card p-8 text-center hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500 dark:text-purple-400 text-3xl">
              <FaChartLine />
            </div>
            <h3 className="text-2xl font-bold dark:text-white text-slate-900 mb-4">Real-time Analytics</h3>
            <p className="dark:text-gray-400 text-slate-600">Track the progress of your city's maintenance with live charts, resolution rates, and departmental stats.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
