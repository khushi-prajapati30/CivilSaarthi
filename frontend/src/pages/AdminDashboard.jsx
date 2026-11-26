import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchAllIssues = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/issues');
        setIssues(res.data);
      } catch (error) {
        toast.error('Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };
    fetchAllIssues();
  }, [user, navigate]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      await axios.put(`http://localhost:5000/api/issues/${id}/status`, { status: newStatus }, config);
      
      setIssues(issues.map(issue => 
        issue._id === id ? { ...issue, status: newStatus } : issue
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getPriorityBadge = (priority) => {
    const val = Number(priority);
    if (val <= 2) return <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded border border-blue-700 text-xs font-bold tracking-wider">🟢 LOW</span>;
    if (val <= 4) return <span className="bg-yellow-900 text-slate-900 px-2 py-1 rounded border border-yellow-700 text-xs font-bold tracking-wider">🟡 MEDIUM</span>;
    if (val <= 6) return <span className="bg-orange-900 text-orange-300 px-2 py-1 rounded border border-orange-700 text-xs font-bold tracking-wider shadow-[0_0_10px_rgba(249,115,22,0.4)]">🟠 HIGH</span>;
    return <span className="bg-red-900 text-red-300 px-2 py-1 rounded border border-red-700 text-xs font-extrabold tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.6)] animate-pulse">🔴 CRITICAL</span>;
  };

  if (loading) return <div className="text-center py-20 text-blue-300 font-mono text-xl tracking-widest animate-pulse">FETCHING RECORDS...</div>;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-blue-950 bg-slate-50 overflow-hidden py-12 transition-colors duration-300">
      {/* Animated Deep Blue Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-800 rounded-full mix-blend-multiply filter blur-[150px] dark:opacity-60 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900 rounded-full mix-blend-multiply filter blur-[120px] dark:opacity-70 opacity-10 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8 dark:bg-blue-900/40 bg-white border dark:border-blue-500/30 border-blue-200 p-6 rounded-2xl backdrop-blur-md shadow-md dark:shadow-[0_0_30px_rgba(30,58,138,0.2)]"
        >
          <div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-blue-300 dark:to-indigo-300 from-blue-700 to-indigo-700">Command Center</h2>
            <p className="dark:text-blue-300/70 text-blue-900 mt-1 font-mono text-sm">ADMINISTRATIVE ISSUE OVERSIGHT</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="dark:bg-blue-950/80 bg-blue-50 px-4 py-2 rounded-lg border dark:border-blue-800 border-blue-200 flex flex-col items-center">
              <span className="dark:text-blue-400 text-blue-700 text-xs font-bold tracking-widest">TOTAL</span>
              <span className="dark:text-white text-blue-950 text-xl font-black">{issues.length}</span>
            </div>
            <div className="dark:bg-blue-950/80 bg-blue-50 px-4 py-2 rounded-lg border dark:border-blue-800 border-blue-200 flex flex-col items-center shadow-inner">
              <span className="text-red-600 dark:text-red-400 text-xs font-bold tracking-widest">CRITICAL</span>
              <span className="dark:text-white text-blue-950 text-xl font-black">{issues.filter(i => Number(i.priority) >= 7).length}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="dark:bg-[#0b1120]/80 bg-white backdrop-blur-xl border dark:border-blue-800/50 border-blue-200 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="dark:bg-blue-900/60 bg-blue-50/60 border-b dark:border-blue-700/50 border-blue-200">
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase">Issue Details</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase">Category / Dept</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase">Location (Lat, Lng)</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase">Priority</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase text-center">Reports</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase">Current Status</th>
                  <th className="p-5 dark:text-blue-200 text-blue-900 font-bold tracking-wider text-xs uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-blue-900/30 divide-blue-100">
                {issues.map((issue, idx) => (
                  <tr key={issue._id} className="dark:hover:bg-blue-800/20 hover:bg-slate-50 transition-colors group">
                    <td className="p-5">
                      <p className="font-bold dark:text-blue-50 text-slate-900 text-base">{issue.title}</p>
                      <p className="text-xs dark:text-blue-400/60 text-slate-500 mt-1 font-mono">By: {issue.user?.name || 'Unknown'}</p>
                    </td>
                    <td className="p-5">
                      <p className="text-sm font-semibold dark:text-blue-200 text-slate-800">{issue.category}</p>
                      <p className="text-xs dark:text-indigo-400 text-indigo-700 mt-1">{issue.department}</p>
                    </td>
                    <td className="p-5">
                      <div className="px-3 py-2 text-xs dark:text-blue-300/70 text-slate-700 font-mono dark:bg-blue-950/30 bg-blue-50 rounded border dark:border-transparent border-blue-100">
                        {issue.latitude !== undefined && issue.latitude !== null ? (
                          <>
                            {Number(issue.latitude).toFixed(4)}<br/>
                            {Number(issue.longitude).toFixed(4)}
                          </>
                        ) : (
                          <span className="text-blue-600/60 italic font-sans font-bold">Not Provided</span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      {getPriorityBadge(issue.priority)}
                    </td>
                    <td className="p-5 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full dark:bg-blue-900 bg-blue-100 border dark:border-blue-700 border-blue-200 dark:text-white text-blue-900 font-bold shadow-inner">
                        {issue.reportsCount}
                      </div>
                    </td>
                     <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider flex inline-block w-max items-center ${
                        issue.status === 'Resolved' ? 'dark:bg-emerald-900/80 dark:text-emerald-300 dark:border-emerald-700 bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        issue.status === 'In Progress' ? 'dark:bg-cyan-900/80 dark:text-cyan-300 dark:border-cyan-700 bg-cyan-50 text-cyan-700 border border-cyan-200' :
                        issue.status === 'Assigned' ? 'dark:bg-blue-900/80 dark:text-blue-300 dark:border-blue-700 bg-blue-50 text-blue-700 border border-blue-200' :
                        'dark:bg-amber-900/80 dark:text-amber-300 dark:border-amber-700 bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {issue.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse"></span>}
                        {issue.status === 'Assigned' && <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>}
                        {issue.status === 'In Progress' && <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>}
                        {issue.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="relative inline-block text-left">
                        <select 
                          className="appearance-none dark:bg-blue-950 bg-white border-2 dark:border-blue-700 border-blue-200 hover:border-blue-500 dark:text-blue-100 text-blue-950 text-xs font-bold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors cursor-pointer shadow shadow-inner"
                          value={issue.status}
                          onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                        >
                          <option className="dark:bg-blue-900 bg-white text-slate-800 dark:text-white font-semibold" value="Pending">Set Pending</option>
                          <option className="dark:bg-blue-900 bg-white text-slate-800 dark:text-blue-300 font-semibold" value="Assigned">Set Assigned</option>
                          <option className="dark:bg-blue-900 bg-white text-slate-800 dark:text-cyan-300 font-semibold" value="In Progress">Set In Progress</option>
                          <option className="dark:bg-blue-900 bg-white text-slate-800 dark:text-emerald-300 font-semibold" value="Resolved">Set Resolved</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-blue-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center dark:text-blue-400/50 text-slate-500 font-mono">NO ISSUES FOUND IN DATABASE</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
