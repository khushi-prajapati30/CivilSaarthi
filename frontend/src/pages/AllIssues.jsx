import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/issues/all');
        setIssues(res.data);
      } catch (error) {
        toast.error('Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const getPriorityLabel = (priority) => {
    const val = Number(priority);
    if (val <= 2) return '🟢 Low';
    if (val <= 4) return '🟡 Medium';
    if (val <= 6) return '🟠 High';
    return '🔴 Critical';
  };

  const getPriorityColor = (priority) => {
    const val = Number(priority);
    if (val <= 2) return 'bg-green-500/20 text-green-300 border-green-500/50';
    if (val <= 4) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    if (val <= 6) return 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
    return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)] font-bold';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'border-amber-400 text-amber-300';
      case 'Assigned': return 'border-blue-400 text-blue-300 bg-blue-900/20';
      case 'In Progress': return 'border-cyan-400 text-cyan-300';
      case 'Resolved': return 'border-emerald-400 text-emerald-300';
      default: return 'border-gray-500 text-gray-300';
    }
  };

  const getDepartmentBadge = (dept) => {
    switch (dept) {
      case 'Road Department':
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 text-xs">🛣️ Road Department</span>;
      case 'Electricity Department':
        return <span className="bg-yellow-950/60 text-yellow-400 border border-yellow-800/40 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 text-xs">💡 Electricity Department</span>;
      case 'Water Department':
        return <span className="bg-blue-950/60 text-blue-400 border border-blue-800/40 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 text-xs">💧 Water Department</span>;
      case 'Sanitation Department':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 text-xs">🧹 Sanitation Department</span>;
      default:
        return <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1.5 text-xs">🛠️ {dept}</span>;
    }
  };

  const filteredIssues = filter === 'All' ? issues : issues.filter(issue => issue.category === filter);

  if (loading) return <div className="text-center py-20 text-purple-300 font-bold text-xl tracking-widest animate-pulse">LOADING CITY DATA...</div>;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-slate-950 bg-slate-50 overflow-hidden py-12 transition-colors duration-300">
      {/* Animated Violet/Pink Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] dark:opacity-40 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] dark:opacity-30 opacity-10 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b dark:border-purple-500/30 border-purple-200 pb-6">
            <div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-violet-400 dark:to-pink-400 from-violet-600 to-pink-600">
                Citywide Issues
              </h2>
              <p className="dark:text-purple-200/70 text-purple-900 mt-2 font-medium">Public feed of all reported civic problems</p>
            </div>
            
            <div className="mt-6 md:mt-0 flex space-x-2">
              {['All', 'Pothole', 'Garbage', 'Water Leakage', 'Streetlight'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    filter === cat 
                      ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.3)]' 
                      : 'dark:bg-slate-800 bg-white dark:text-slate-400 text-slate-600 hover:bg-slate-700 hover:text-white border dark:border-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {filteredIssues.length === 0 ? (
          <div className="dark:bg-slate-900/60 bg-white backdrop-blur-xl border dark:border-purple-500/30 border-purple-200 rounded-3xl p-16 text-center shadow-lg">
            <p className="text-2xl dark:text-purple-300/80 text-purple-950 mb-2 font-light">No issues found.</p>
            <p className="text-pink-600 font-semibold">The city is clean in this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredIssues.map((issue, index) => (
              <motion.div 
                key={issue._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group flex flex-col dark:bg-slate-900/80 bg-white border dark:border-purple-900/50 border-purple-200 hover:border-pink-500 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(219,39,119,0.15)] transition-all duration-300"
              >
                <div className="h-48 overflow-hidden relative border-b dark:border-purple-900/50 border-purple-100 bg-slate-950 flex items-center justify-center">
                  {issue.image ? (
                    <img 
                      src={`http://localhost:5000${issue.image}`} 
                      alt={issue.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-950/60 to-pink-950/60 flex flex-col items-center justify-center p-6 border-b border-purple-500/10">
                      <span className="text-5xl mb-2 filter drop-shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-pulse">
                        {issue.category === 'Pothole' ? '🚧' :
                         issue.category === 'Garbage' ? '🗑️' :
                         issue.category === 'Water Leakage' ? '💧' :
                         issue.category === 'Streetlight' ? '💡' : '🔧'}
                      </span>
                      <span className="text-purple-300/60 text-xs font-bold uppercase tracking-widest">
                        {issue.category} Reported
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-black bg-slate-950/80 backdrop-blur-md border ${getStatusColor(issue.status)} tracking-wider`}>
                      {issue.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${getPriorityColor(issue.priority)} tracking-wider`}>
                      {getPriorityLabel(issue.priority).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-2 line-clamp-1 group-hover:text-pink-500 transition-colors">{issue.title}</h3>
                    <p className="dark:text-slate-400 text-slate-600 text-sm mb-5 line-clamp-2 leading-relaxed">{issue.description}</p>
                    
                    <div className="flex justify-between items-center mb-5">
                      <span className="dark:bg-purple-900/40 bg-purple-50 dark:text-purple-300 text-purple-700 border dark:border-purple-700/50 border-purple-200 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
                        {issue.category}
                      </span>
                      <span className="dark:text-slate-500 text-slate-500 text-xs font-mono">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 dark:bg-slate-950/50 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200">
                      <div className="text-xs">
                        <span className="dark:text-slate-500 text-slate-500 block mb-1">Assigned Dept</span>
                        {getDepartmentBadge(issue.department)}
                      </div>
                      <div className="text-xs text-right">
                        <span className="dark:text-slate-500 text-slate-500 block mb-1">Merge Count</span>
                        <div className="inline-flex items-center justify-center bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full font-black">
                          {issue.reportsCount} <span className="ml-1 text-xs font-normal opacity-70">reports</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIssues;
