import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.get('http://localhost:5000/api/issues/myissues', config);
        setIssues(res.data);
      } catch (error) {
        toast.error('Failed to fetch your issues');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchIssues();
    }
  }, [user]);

  const getPriorityLabel = (priority) => {
    const val = Number(priority);
    if (val <= 2) return '🟢 Low';
    if (val <= 4) return '🟡 Medium';
    if (val <= 6) return '🟠 High';
    return '🔴 Critical';
  };

  const getPriorityColor = (priority) => {
    const val = Number(priority);
    if (val <= 2) return 'bg-green-600 text-white';
    if (val <= 4) return 'bg-yellow-500 text-slate-900';
    if (val <= 6) return 'bg-orange-500 text-white shadow-[0_0_10px_#f97316]';
    return 'bg-red-600 text-white shadow-[0_0_15px_#dc2626] font-bold';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'border-yellow-500 text-yellow-300';
      case 'Assigned': return 'border-blue-500 text-blue-300';
      case 'In Progress': return 'border-cyan-400 text-cyan-300';
      case 'Resolved': return 'border-emerald-400 text-emerald-300';
      default: return 'border-gray-500 text-gray-300';
    }
  };

  const getDepartmentBadge = (dept) => {
    switch (dept) {
      case 'Road Department':
        return <span className="dark:bg-slate-750 dark:text-slate-250 bg-slate-100 text-slate-800 border dark:border-slate-600 border-slate-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">🛣️ Road Dept</span>;
      case 'Electricity Department':
        return <span className="dark:bg-yellow-950/50 dark:text-yellow-300 bg-yellow-50 text-yellow-800 border dark:border-yellow-800/50 border-yellow-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">💡 Electricity Dept</span>;
      case 'Water Department':
        return <span className="dark:bg-blue-950/50 dark:text-blue-300 bg-blue-50 text-blue-800 border dark:border-blue-800/50 border-blue-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">💧 Water Dept</span>;
      case 'Sanitation Department':
        return <span className="dark:bg-emerald-950/50 dark:text-emerald-300 bg-emerald-50 text-emerald-800 border dark:border-emerald-800/50 border-emerald-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">🧹 Sanitation Dept</span>;
      default:
        return <span className="dark:bg-slate-900 bg-slate-100 dark:text-slate-400 text-slate-800 border dark:border-slate-800 border-slate-200 px-2.5 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1">🛠️ {dept}</span>;
    }
  };

  const renderStatusTracker = (currentStatus) => {
    const steps = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = steps.indexOf(currentStatus);
    
    return (
      <div className="flex items-center justify-between w-full mt-6 dark:bg-slate-900/60 bg-slate-100/80 p-3 rounded-xl border dark:border-slate-700 border-slate-250">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <React.Fragment key={step}>
              {idx > 0 && (
                <div className={`h-[2px] flex-grow mx-1 transition-colors duration-500 ${isDone ? 'bg-teal-500' : 'dark:bg-slate-750 bg-slate-350'}`}></div>
              )}
              <div className="flex flex-col items-center relative">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  isCurrent ? 'bg-teal-500 text-slate-950 border-teal-400 ring-2 ring-teal-500/50 animate-pulse' :
                  isDone ? 'dark:bg-teal-950 bg-teal-50 dark:text-teal-400 text-teal-700 dark:border-teal-500 border-teal-200' :
                  'dark:bg-slate-800 bg-slate-205 dark:text-slate-500 text-slate-400 dark:border-slate-700 border-slate-200'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] mt-1.5 font-bold whitespace-nowrap tracking-wide uppercase ${
                  isCurrent ? 'dark:text-teal-450 text-teal-750' : isDone ? 'dark:text-teal-500/75 text-teal-650' : 'dark:text-slate-500 text-slate-450'
                }`}>
                  {step}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (!user) {
    return <div className="text-center py-20 text-teal-100 font-bold text-xl tracking-widest">REDIRECTING TO LOGIN...</div>;
  }

  if (loading) return <div className="text-center py-20 text-teal-100 font-bold text-xl tracking-widest">LOADING...</div>;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-slate-950 bg-slate-50 overflow-hidden py-12 transition-colors duration-300">
      {/* Animated Teal & Emerald Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500 rounded-full mix-blend-screen filter blur-[100px] dark:opacity-40 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600 rounded-full mix-blend-screen filter blur-[120px] dark:opacity-30 opacity-10 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* User Profile Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 dark:bg-gradient-to-r dark:from-teal-950/70 dark:to-slate-900/85 bg-white border dark:border-teal-500/30 border-slate-200 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-md dark:shadow-[0_0_30px_rgba(20,184,166,0.15)] flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-6 text-left w-full md:w-auto">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)] shrink-0">
              <span className="text-white font-black text-3xl">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-3xl font-black dark:text-white text-slate-900">{user.name}</h2>
              <p className="dark:text-teal-300/80 text-teal-700 font-mono text-sm mt-0.5">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border dark:border-teal-500/30 border-teal-200 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  👤 {user.role === 'admin' ? 'Administrator' : 'Citizen Member'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border dark:border-emerald-500/30 border-emerald-200 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  ✓ Verified Account
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 self-stretch md:self-auto justify-stretch w-full md:w-auto">
            <div className="dark:bg-slate-900/60 bg-teal-50/50 border dark:border-slate-700/60 border-teal-200 px-6 py-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] flex-grow md:flex-grow-0">
              <span className="dark:text-slate-400 text-slate-600 text-xs font-bold uppercase tracking-widest mb-1">Reports</span>
              <span className="text-teal-600 dark:text-teal-300 text-3xl font-black">{issues.length}</span>
            </div>
            <div className="dark:bg-slate-900/60 bg-teal-50/50 border dark:border-slate-700/60 border-teal-200 px-6 py-4 rounded-2xl flex flex-col items-center justify-center min-w-[120px] flex-grow md:flex-grow-0">
              <span className="dark:text-slate-400 text-slate-600 text-xs font-bold uppercase tracking-widest mb-1">Resolved</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-3xl font-black">{issues.filter(i => i.status === 'Resolved').length}</span>
            </div>
          </div>
        </motion.div>
        
        {issues.length === 0 ? (
          <div className="dark:bg-slate-800/60 bg-white backdrop-blur-xl border dark:border-teal-500/30 border-teal-200 rounded-2xl p-16 text-center shadow-lg dark:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <p className="text-2xl dark:text-teal-200/80 text-teal-950 mb-4 font-light">Your dashboard is empty.</p>
            <p className="dark:text-teal-400 text-teal-700 font-semibold">You haven't reported any issues yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {issues.map((issue, index) => (
              <motion.div 
                key={issue._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex flex-col dark:bg-slate-800/80 bg-white backdrop-blur-lg border dark:border-slate-700 border-slate-200 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(45,212,191,0.3)] transition-all duration-500"
              >
                <div className="h-52 overflow-hidden relative bg-slate-950 flex items-center justify-center">
                  {issue.image ? (
                    <img 
                      src={`http://localhost:5000${issue.image}`} 
                      alt={issue.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-900/40 to-emerald-950/60 flex flex-col items-center justify-center p-6 border-b border-teal-500/10">
                      <span className="text-5xl mb-2 filter drop-shadow-[0_0_15px_rgba(20,184,166,0.4)] animate-pulse">
                        {issue.category === 'Pothole' ? '🚧' :
                         issue.category === 'Garbage' ? '🗑️' :
                         issue.category === 'Water Leakage' ? '💧' :
                         issue.category === 'Streetlight' ? '💡' : '🔧'}
                      </span>
                      <span className="text-teal-300/60 text-xs font-bold uppercase tracking-widest">
                        {issue.category} Reported
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-85 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 backdrop-blur-md border ${getStatusColor(issue.status)}`}>
                      {issue.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs tracking-wider font-bold ${getPriorityColor(issue.priority)}`}>
                      {getPriorityLabel(issue.priority).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-2xl font-bold dark:text-teal-50 text-teal-950 mb-3 line-clamp-1">{issue.title}</h3>
                    <p className="dark:text-slate-400 text-slate-600 text-sm mb-5 line-clamp-3 leading-relaxed">{issue.description}</p>
                    
                    <div className="flex justify-between items-center text-xs font-semibold dark:text-teal-200 text-teal-800 bg-teal-50 dark:bg-teal-900/40 p-3 rounded-lg border dark:border-teal-800/50 border-teal-200">
                      <span className="uppercase tracking-wider">{issue.category}</span>
                      <span className="dark:text-teal-400 text-teal-600">{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="pt-4 border-t dark:border-slate-700 border-slate-200 text-sm flex justify-between items-center mb-2">
                      <div className="text-xs text-left">
                        <span className="dark:text-slate-500 text-slate-500 block mb-1">Assigned Dept</span>
                        {getDepartmentBadge(issue.department)}
                      </div>
                      <span className="dark:bg-slate-700 bg-slate-100 dark:text-white text-slate-800 px-3 py-1 rounded-md shadow-inner text-xs border dark:border-transparent border-slate-200">
                        Reports: <strong className="text-teal-600 dark:text-teal-300 text-base">{issue.reportsCount}</strong>
                      </span>
                    </div>
                  </div>
                  
                  {renderStatusTracker(issue.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
