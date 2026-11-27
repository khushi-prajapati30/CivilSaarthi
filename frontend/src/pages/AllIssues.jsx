import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimes,
  FaExternalLinkAlt,
  FaEnvelope,
} from 'react-icons/fa';

const ALL_CATEGORIES = [
  'All',
  'Pothole',
  'Garbage',
  'Water Leakage',
  'Streetlight',
  'Dirty Washroom',
  'Drainage / Sewage',
  'Damaged Road',
  'Stray Animals',
  'Encroachment',
  'Other',
];

// Default Mathura-Vrindavan center coordinates
const MATHURA_VRINDAVAN_CENTER = [27.5450, 77.6737];

const AllIssues = () => {
  const { user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolving, setResolving] = useState(false);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues/all');
      setIssues(res.data);
    } catch {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleMarkCompleted = async (issueId) => {
    if (!user) {
      toast.error('Please login to verify and mark an issue as completed');
      return;
    }

    setResolving(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const res = await axios.put(`http://localhost:5000/api/issues/${issueId}/resolve`, {}, config);
      toast.success(res.data.message || 'Issue marked as Completed!');
      setIssues((prev) =>
        prev.map((item) => (item._id === issueId ? { ...item, status: 'Resolved' } : item))
      );
      setSelectedIssue((prev) => (prev && prev._id === issueId ? { ...prev, status: 'Resolved' } : prev));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update issue status');
    } finally {
      setResolving(false);
    }
  };

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
    if (val <= 6) return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    return 'bg-red-500/20 text-red-300 border-red-500/50 font-bold';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'border-amber-400 text-amber-300';
      case 'Assigned':
        return 'border-blue-400 text-blue-300 bg-blue-900/20';
      case 'In Progress':
        return 'border-cyan-400 text-cyan-300';
      case 'Resolved':
        return 'border-emerald-400 text-emerald-300';
      default:
        return 'border-gray-500 text-gray-300';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = filter === 'All' || issue.category === filter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      (issue.title?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.locationName?.toLowerCase().includes(q) ||
        issue.department?.toLowerCase().includes(q) ||
        issue.category?.toLowerCase().includes(q))
    );
  });

  // Assign fallback Mathura-Vrindavan coordinates near center if an older issue had no GPS
  const mapIssues = filteredIssues.map((issue, idx) => {
    const hasCoords =
      typeof issue.latitude === 'number' &&
      !isNaN(issue.latitude) &&
      typeof issue.longitude === 'number' &&
      !isNaN(issue.longitude);
    const offset = ((idx % 7) - 3) * 0.004;
    return {
      ...issue,
      plotLat: hasCoords ? issue.latitude : MATHURA_VRINDAVAN_CENTER[0] + offset,
      plotLon: hasCoords ? issue.longitude : MATHURA_VRINDAVAN_CENTER[1] - offset,
      hasExactCoords: hasCoords,
    };
  });

  if (loading)
    return (
      <div className="text-center py-20 text-purple-300 font-bold text-xl tracking-widest animate-pulse">
        LOADING MATHURA-VRINDAVAN CIVIC DATA...
      </div>
    );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-slate-950 bg-slate-50 overflow-hidden py-12 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] dark:opacity-40 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[120px] dark:opacity-30 opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 space-y-8">
        {/* Header + Search Bar */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b dark:border-purple-500/30 border-purple-200 pb-6">
            <div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-violet-400 dark:to-pink-400 from-violet-600 to-pink-600">
                Mathura-Vrindavan Citywide Issues
              </h2>
              <p className="dark:text-purple-200/70 text-purple-900 mt-1 font-medium">
                Click any red map dot or issue card to inspect location details and mark resolved complaints completed.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full lg:w-96">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by area, problem, or department..."
                className="w-full pl-11 pr-4 py-3 rounded-xl dark:bg-slate-900/90 bg-white border dark:border-purple-500/40 border-purple-200 dark:text-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-pink-500 shadow-sm"
              />
            </div>
          </div>

          {/* All Category Filter Pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filter === cat
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-[0_0_15px_rgba(219,39,119,0.3)]'
                    : 'dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700 hover:bg-purple-600 hover:text-white border dark:border-slate-700 border-slate-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Interactive Mathura-Vrindavan Live Map */}
        <div className="dark:bg-slate-900/80 bg-white border dark:border-purple-500/30 border-purple-200 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-3 border-b dark:border-slate-800 border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <span className="dark:text-purple-200 text-purple-950 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Live Mathura-Vrindavan Issue Map (Tap any dot to inspect or verify completion)
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-red-500">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse"></span> Active Issue ({mapIssues.filter((i) => i.status !== 'Resolved').length})
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Completed ({mapIssues.filter((i) => i.status === 'Resolved').length})
              </span>
            </div>
          </div>

          <div className="h-80 w-full relative z-0">
            <MapContainer
              center={MATHURA_VRINDAVAN_CENTER}
              zoom={12}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mapIssues.map((issue) => {
                const isResolved = issue.status === 'Resolved';
                return (
                  <CircleMarker
                    key={issue._id}
                    center={[issue.plotLat, issue.plotLon]}
                    radius={10}
                    pathOptions={{
                      color: isResolved ? '#10b981' : '#ef4444',
                      fillColor: isResolved ? '#10b981' : '#ef4444',
                      fillOpacity: 0.85,
                    }}
                    eventHandlers={{
                      click: () => setSelectedIssue(issue),
                    }}
                  >
                    <Popup>
                      <div className="text-slate-900 space-y-1 min-w-[180px]">
                        <p className="font-bold text-sm">{issue.title}</p>
                        <p className="text-xs font-semibold text-purple-700">{issue.category} • {issue.status}</p>
                        <p className="text-xs text-slate-600">{issue.locationName}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                          className="mt-1 w-full bg-purple-600 text-white text-xs font-bold py-1.5 px-2 rounded cursor-pointer"
                        >
                          Open Details / Verify
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Clickable Issue Cards Grid */}
        {filteredIssues.length === 0 ? (
          <div className="dark:bg-slate-900/60 bg-white backdrop-blur-xl border dark:border-purple-500/30 border-purple-200 rounded-3xl p-16 text-center shadow-lg">
            <p className="text-2xl dark:text-purple-300/80 text-purple-950 mb-2 font-light">No matching issues found.</p>
            <p className="text-pink-600 font-semibold">Try clearing your search or selecting "All" categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue._id}
                onClick={() => setSelectedIssue(issue)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="cursor-pointer group flex flex-col dark:bg-slate-900/80 bg-white border dark:border-purple-900/50 border-purple-200 hover:border-pink-500 rounded-2xl overflow-hidden hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(219,39,119,0.2)] transition-all duration-300"
              >
                <div className="h-48 overflow-hidden relative border-b dark:border-purple-900/50 border-purple-100 bg-slate-950 flex items-center justify-center">
                  {issue.image ? (
                    <img
                      src={`http://localhost:5000${issue.image}`}
                      alt={issue.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-950/60 to-pink-950/60 flex flex-col items-center justify-center p-6">
                      <span className="text-5xl mb-2">📍</span>
                      <span className="text-purple-300/60 text-xs font-bold uppercase tracking-widest">
                        {issue.category}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent pointer-events-none"></div>

                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-black bg-slate-950/85 backdrop-blur-md border ${getStatusColor(issue.status)} tracking-wider`}>
                      {issue.status === 'Resolved' ? 'COMPLETED' : issue.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${getPriorityColor(issue.priority)} tracking-wider`}>
                      {getPriorityLabel(issue.priority).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-1.5 line-clamp-1 group-hover:text-pink-500 transition-colors">
                      {issue.title}
                    </h3>
                    <p className="text-xs text-purple-600 dark:text-purple-300 font-semibold flex items-center gap-1 mb-2 line-clamp-1">
                      <FaMapMarkerAlt className="shrink-0 text-pink-500" />
                      {issue.locationName || 'Mathura-Vrindavan, Uttar Pradesh'}
                    </p>
                    <p className="dark:text-slate-400 text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <span className="dark:bg-purple-900/40 bg-purple-50 dark:text-purple-300 text-purple-700 border dark:border-purple-700/50 border-purple-200 px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase">
                        {issue.category}
                      </span>
                      <span className="text-xs font-bold text-pink-500 group-hover:underline">
                        Click for full details →
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 dark:bg-slate-950/50 bg-slate-50 rounded-xl border dark:border-slate-800 border-slate-200 text-xs">
                      <span className="dark:text-slate-300 text-slate-700 font-semibold truncate max-w-[65%]">
                        🛠️ {issue.department}
                      </span>
                      <span className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 px-2.5 py-0.5 rounded-full font-black">
                        {issue.reportsCount} reports
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Full Issue Detail & Citizen Completion Verification Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full dark:bg-slate-900 bg-white border-2 border-purple-500 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto text-left"
          >
            {selectedIssue.image && (
              <div className="h-64 w-full bg-black relative">
                <img
                  src={`http://localhost:5000${selectedIssue.image}`}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 text-white hover:bg-red-500 flex items-center justify-center cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/40 uppercase">
                      {selectedIssue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(selectedIssue.status)}`}>
                      {selectedIssue.status === 'Resolved' ? '✓ COMPLETED' : selectedIssue.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black dark:text-white text-slate-900">{selectedIssue.title}</h3>
                </div>
                {!selectedIssue.image && (
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(null)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                )}
              </div>

              <p className="dark:text-slate-300 text-slate-700 text-sm leading-relaxed">
                {selectedIssue.description}
              </p>

              <div className="dark:bg-slate-800/80 bg-slate-100 p-4 rounded-2xl border dark:border-slate-700 border-slate-200 space-y-2.5 text-xs">
                <p className="dark:text-slate-200 text-slate-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-red-500 text-sm shrink-0" />
                  <span>
                    <strong>Exact Location:</strong> {selectedIssue.locationName || 'Mathura-Vrindavan, Uttar Pradesh'}
                  </span>
                </p>
                {selectedIssue.latitude && selectedIssue.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedIssue.latitude},${selectedIssue.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-500 hover:underline font-bold"
                  >
                    <FaExternalLinkAlt /> Open Exact Pin in Google Maps ({selectedIssue.latitude}, {selectedIssue.longitude})
                  </a>
                )}
                <p className="dark:text-slate-300 text-slate-700">
                  <strong>Assigned Authority:</strong> {selectedIssue.department} ({selectedIssue.authorityEmail || 'khushikprajapati9053@gmail.com'})
                </p>
                <p className="dark:text-slate-400 text-slate-600">
                  <strong>Reported On:</strong> {new Date(selectedIssue.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t dark:border-slate-800 border-slate-200">
                {selectedIssue.status !== 'Resolved' ? (
                  <button
                    type="button"
                    disabled={resolving}
                    onClick={() => handleMarkCompleted(selectedIssue._id)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FaCheckCircle />
                    {resolving ? 'Marking Completed...' : 'Verify & Mark as Completed'}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <FaCheckCircle /> Verified & Completed (Green on Map)
                  </span>
                )}

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    selectedIssue.authorityEmail || 'khushikprajapati9053@gmail.com'
                  )}&su=${encodeURIComponent(
                    `Follow-up [${selectedIssue.category}]: ${selectedIssue.title}`
                  )}&body=${encodeURIComponent(
                    `Respected Officer (${selectedIssue.department}),\n\nFollowing up on civic complaint "${selectedIssue.title}" at ${selectedIssue.locationName || 'Mathura-Vrindavan, UP'}.\n\nPlease update on resolution status.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl dark:bg-slate-800 bg-slate-200 dark:text-white text-slate-900 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all"
                >
                  <FaEnvelope /> Open in Gmail
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AllIssues;
