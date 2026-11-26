import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const Analytics = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cyberpunk Neon Colors
  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', config);
        setStats(res.data);
      } catch (error) {
        toast.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, navigate]);

  if (loading) return <div className="text-center py-20 text-fuchsia-400 font-mono text-2xl tracking-[0.2em] animate-pulse">SYSTEM INITIALIZING...</div>;

  const isDark = theme === 'dark';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-[#09090b] bg-slate-50 overflow-hidden py-12 transition-colors duration-300">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 z-0 dark:opacity-20 opacity-[0.06]" 
           style={{ backgroundImage: 'linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg) scale(2.5) translateY(-100px)' }}>
      </div>
      
      {/* Neon Glow Blobs */}
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[150px] dark:opacity-20 opacity-[0.08] animate-blob"></div>
      <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-cyan-600 rounded-full mix-blend-screen filter blur-[150px] dark:opacity-20 opacity-[0.08] animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 border-l-4 border-fuchsia-500 pl-6">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-cyan-400 dark:via-fuchsia-400 dark:to-purple-500 from-cyan-600 via-fuchsia-600 to-purple-600 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(232,121,249,0.5)]">
            Neural Analytics
          </h2>
          <p className="dark:text-cyan-400 text-cyan-800 font-mono text-sm mt-2 tracking-widest opacity-80">REAL-TIME CITYWIDE SENSOR DATA</p>
        </motion.div>
        
        {/* Neon Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="dark:bg-[#18181b]/80 bg-white backdrop-blur-md p-6 rounded-xl border dark:border-cyan-500/50 border-cyan-200 shadow-md dark:shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            <h3 className="dark:text-cyan-500 text-cyan-700 font-mono text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-cyan-500 transition-colors">Total Complaints</h3>
            <p className="text-4xl font-black dark:text-white text-slate-900 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{stats.totalComplaints}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="dark:bg-[#18181b]/80 bg-white backdrop-blur-md p-6 rounded-xl border dark:border-yellow-500/50 border-yellow-200 shadow-md dark:shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            <h3 className="dark:text-yellow-500 text-yellow-700 font-mono text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-yellow-500 transition-colors">Pending Processing</h3>
            <p className="text-4xl font-black dark:text-white text-slate-900 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">{stats.pendingIssues}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="dark:bg-[#18181b]/80 bg-white backdrop-blur-md p-6 rounded-xl border dark:border-emerald-500/50 border-emerald-200 shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>
            <h3 className="dark:text-emerald-500 text-emerald-700 font-mono text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">Resolved Status</h3>
            <p className="text-4xl font-black dark:text-white text-slate-900 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">{stats.resolvedIssues}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="dark:bg-[#18181b]/80 bg-white backdrop-blur-md p-6 rounded-xl border dark:border-fuchsia-500/50 border-fuchsia-200 shadow-md dark:shadow-[0_0_15px_rgba(217,70,239,0.2)] hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"></div>
            <h3 className="dark:text-fuchsia-500 text-fuchsia-700 font-mono text-xs font-bold uppercase tracking-widest mb-2 group-hover:text-fuchsia-500 transition-colors">Critical Alerts</h3>
            <p className="text-4xl font-black dark:text-white text-slate-900 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]">{stats.highPriorityIssues}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Complaints by Category (Pie Chart) */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="dark:bg-[#09090b]/90 bg-white backdrop-blur-xl p-8 rounded-2xl border dark:border-purple-500/30 border-purple-200 shadow-lg dark:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <h3 className="text-xl font-bold dark:text-white text-slate-850 mb-2 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></span>
              Category Distribution
            </h3>
            <div className="w-full h-[1px] bg-gradient-to-r from-purple-500/50 to-transparent mb-8"></div>
            
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelStyle={{ fill: isDark ? '#a5b4fc' : '#334155', fontSize: '12px', fontFamily: 'monospace' }}
                  >
                    {stats.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ filter: isDark ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]})` : 'none' }} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.98)', 
                      border: isDark ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid rgba(139, 92, 246, 0.2)', 
                      borderRadius: '8px', 
                      color: isDark ? '#fff' : '#0f172a', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                    itemStyle={{ color: isDark ? '#e2e8f0' : '#334155', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Performance (Bar Chart) */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="dark:bg-[#09090b]/90 bg-white backdrop-blur-xl p-8 rounded-2xl border dark:border-cyan-500/30 border-cyan-200 shadow-lg dark:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <h3 className="text-xl font-bold dark:text-white text-slate-850 mb-2 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-pulse"></span>
              Department Metrics
            </h3>
            <div className="w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent mb-8"></div>
            
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.departmentStats}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#71717a' : '#64748b'} tick={{fontSize: 11, fontFamily: 'monospace', fill: isDark ? '#a1a1aa' : '#475569'}} axisLine={false} tickLine={false} />
                  <YAxis stroke={isDark ? '#71717a' : '#64748b'} tick={{fontSize: 11, fontFamily: 'monospace', fill: isDark ? '#a1a1aa' : '#475569'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? 'rgba(9, 9, 11, 0.9)' : 'rgba(255, 255, 255, 0.98)', 
                      border: isDark ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(6, 182, 212, 0.2)', 
                      borderRadius: '8px', 
                      color: isDark ? '#fff' : '#0f172a', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                    cursor={{ fill: isDark ? 'rgba(39, 39, 42, 0.4)' : 'rgba(241, 245, 249, 0.6)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontFamily: 'monospace', fontSize: '12px', color: isDark ? '#a1a1aa' : '#475569' }} />
                  <Bar dataKey="total" name="ASSIGNED" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="RESOLVED" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
