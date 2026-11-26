import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaExclamationTriangle } from 'react-icons/fa';

const ReportIssue = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to report an issue');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (image) {
      formData.append('image', image);
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const res = await axios.post('http://localhost:5000/api/issues', formData, config);
      
      if (res.data.isDuplicate) {
        setDuplicateInfo(res.data.issue);
        setShowDuplicateModal(true);
      } else {
        toast.success(res.data.message || 'Issue reported successfully');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reporting issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-orange-950/10 bg-orange-50/20 overflow-hidden py-12 transition-colors duration-300">
      {/* Animated Sunset Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-600 rounded-full mix-blend-multiply filter blur-[150px] dark:opacity-40 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-900 rounded-full mix-blend-multiply filter blur-[120px] dark:opacity-50 opacity-10 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="dark:bg-black/40 bg-white/95 backdrop-blur-2xl border dark:border-orange-500/30 border-orange-200 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.08)] relative overflow-hidden"
        >
          {/* Decorative Corner Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl dark:opacity-50 opacity-20 rounded-full"></div>

          <div className="flex items-center mb-8 border-b dark:border-orange-500/20 border-orange-200 pb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center mr-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <FaExclamationTriangle className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-orange-300 dark:to-pink-400 from-orange-600 to-pink-600">Report an Issue</h2>
              <p className="dark:text-orange-200/60 text-orange-800 mt-1 font-medium">Help us make the city better by providing detailed information.</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 mb-2 uppercase tracking-wide">Issue Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-orange-300/30 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all shadow-inner"
                  placeholder="e.g., Deep pothole on Main Street"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 mb-2 uppercase tracking-wide">Category</label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 appearance-none focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all cursor-pointer shadow-inner"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white" value="Pothole">Pothole</option>
                    <option className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white" value="Garbage">Garbage</option>
                    <option className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white" value="Water Leakage">Water Leakage</option>
                    <option className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white" value="Streetlight">Streetlight</option>
                    <option className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white" value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-orange-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 mb-2 uppercase tracking-wide">Description</label>
                <textarea
                  required
                  rows="5"
                  className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-orange-300/30 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all shadow-inner resize-none"
                  placeholder="Provide specific details to help the maintenance team..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 uppercase tracking-wide">Photographic Evidence</label>
                  <span className="text-xs dark:text-orange-300/60 text-orange-700 font-bold uppercase tracking-wider dark:bg-orange-500/10 bg-orange-100 px-2 py-0.5 rounded border dark:border-orange-500/20 border-orange-200">Optional</span>
                </div>
                <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 dark:border-orange-500/40 border-orange-300 border-dashed rounded-xl dark:hover:border-orange-400 hover:border-orange-500 dark:hover:bg-orange-500/10 hover:bg-orange-50 transition-all cursor-pointer group relative">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                  <div className="space-y-2 text-center pointer-events-none">
                    <FaCloudUploadAlt className="mx-auto h-16 w-16 dark:text-orange-400 text-orange-500 group-hover:text-pink-500 transition-colors" />
                    <div className="flex text-sm text-gray-500 dark:text-gray-400 justify-center">
                      <span className="font-bold dark:text-orange-300 text-orange-600 group-hover:text-pink-500">Click or drag an image here</span>
                    </div>
                    <p className="text-xs dark:text-orange-200/50 text-slate-500">PNG, JPG up to 10MB</p>
                    {image && <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-4 bg-green-50 dark:bg-black/40 px-3 py-1 rounded-full inline-block">Selected: {image.name}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t dark:border-orange-500/20 border-orange-200 flex justify-end">
              <button 
                type="submit" 
                className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold text-xl px-12 py-5 rounded-xl shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center group cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </span>
                ) : (
                  <>Submit Report <svg className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Duplicate Detection Warning Modal */}
      {showDuplicateModal && duplicateInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full dark:bg-slate-900 bg-white border-2 dark:border-orange-500 border-orange-300 rounded-3xl p-8 shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden text-left"
          >
            <div className="absolute top-[-20%] left-[-20%] w-48 h-48 bg-orange-500 rounded-full blur-[80px] dark:opacity-30 opacity-10"></div>
            
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
                <FaExclamationTriangle />
              </div>
              
              <h3 className="text-2xl font-black dark:text-white text-slate-900 mb-2">Similar Complaint Exists Nearby</h3>
              <p className="dark:text-slate-400 text-slate-650 text-sm mb-6">
                Our smart duplicate detection system identified an existing active report for this location. We have automatically merged your complaint to boost its priority.
              </p>
              
              <div className="dark:bg-slate-800/80 bg-slate-50 border dark:border-slate-700 border-slate-200 rounded-2xl p-5 mb-8 text-left space-y-4 shadow-inner">
                <div className="flex justify-between items-center pb-3 border-b dark:border-slate-700/50 border-slate-200">
                  <span className="dark:text-slate-400 text-slate-600 text-sm">Issue Title</span>
                  <span className="dark:text-white text-slate-950 font-bold truncate max-w-[200px]">{duplicateInfo.title}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b dark:border-slate-700/50 border-slate-200">
                  <span className="dark:text-slate-400 text-slate-600 text-sm">Category</span>
                  <span className="bg-orange-500/20 text-orange-650 dark:text-orange-400 border border-orange-500/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">{duplicateInfo.category}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b dark:border-slate-700/50 border-slate-200">
                  <span className="dark:text-slate-400 text-slate-600 text-sm">Reports Count</span>
                  <span className="bg-pink-500/20 text-pink-650 dark:text-pink-400 border border-pink-500/30 px-3 py-0.5 rounded-full text-sm font-black">{duplicateInfo.reportsCount} reports</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-slate-400 text-slate-600 text-sm">System Priority</span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                    duplicateInfo.priority <= 2 ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' :
                    duplicateInfo.priority <= 4 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30' :
                    duplicateInfo.priority <= 6 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30' :
                    'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 font-bold'
                  }`}>
                    {duplicateInfo.priority <= 2 ? '🟢 Low' :
                     duplicateInfo.priority <= 4 ? '🟡 Medium' :
                     duplicateInfo.priority <= 6 ? '🟠 High' : '🔴 Critical'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setShowDuplicateModal(false);
                  navigate('/dashboard');
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
              >
                View in Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
