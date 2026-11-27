import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaMagic,
  FaCamera,
  FaCheckCircle,
  FaTimes,
  FaMapMarkerAlt,
  FaCrosshairs,
  FaEnvelope,
  FaCopy,
  FaPaperPlane,
} from 'react-icons/fa';

const PREDEFINED_CATEGORIES = [
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

const ReportIssue = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locating, setLocating] = useState(false);

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Modals
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [submittedIssue, setSubmittedIssue] = useState(null);

  // Live Camera Modal States
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to report an issue');
      navigate('/login');
      return;
    }
    requestCurrentLocation(true);
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopCameraStream();
    };
  }, [previewUrl]);

  const requestCurrentLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) toast.error('Geolocation is not supported by your browser. Please enter location manually.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lon);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const geo = await res.json();
          if (geo?.display_name) {
            setLocationName(geo.display_name);
          } else {
            setLocationName(`GPS: ${lat}, ${lon} (Mathura-Vrindavan)`);
          }
        } catch {
          setLocationName(`GPS: ${lat}, ${lon} (Mathura-Vrindavan)`);
        }

        setLocating(false);
        if (!silent) toast.success('Current GPS location captured!');
      },
      () => {
        setLocating(false);
        if (!silent) {
          toast.info('Location permission denied — please type your landmark or area manually below.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const openLiveCamera = async (e) => {
    e.stopPropagation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setShowCameraModal(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      toast.error('Camera access denied or unavailable on this device.');
    }
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `camera_capture_${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        stopCameraStream();
        setShowCameraModal(false);
        processSelectedImage(capturedFile);
      },
      'image/jpeg',
      0.9
    );
  };

  const processSelectedImage = async (file) => {
    if (!file) return;

    setImage(file);
    setAiResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));

    const aiFormData = new FormData();
    aiFormData.append('image', file);

    setAnalyzing(true);
    try {
      const config = {
        timeout: 30000,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const res = await axios.post('http://localhost:5000/api/issues/analyze-image', aiFormData, config);
      const data = res.data;

      setAiResult(data);
      if (data.category) setCategory(data.category);
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);

      if (data.isCivicIssue === false) {
        toast.warning('AI could not confirm a civic issue — please verify or pick a predefined category below.');
      } else {
        toast.success(`AI detected: ${data.category} (${data.confidence} confidence)`);
      }
    } catch (error) {
      const exactError = error.response?.data?.error || error.response?.data?.message || error.message;
      toast.error(`AI Detection Error: ${exactError}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('locationName', locationName || 'Mathura-Vrindavan, Uttar Pradesh');
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
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
        setSubmittedIssue(res.data.issue);
        setShowEmailModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error reporting issue');
    } finally {
      setLoading(false);
    }
  };

  const buildEmailDraft = (issue) => {
    if (!issue) return { to: '', subject: '', body: '' };
    const to = issue.authorityEmail || 'khushikprajapati9053@gmail.com';
    const subject = `Civic Grievance [${issue.category}]: ${issue.title} - Mathura-Vrindavan`;
    const mapLink =
      issue.latitude && issue.longitude
        ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
        : 'Coordinates not attached (manual landmark provided)';

    const body = `Respected Officer (${issue.department}),

I am writing to report an urgent civic issue in Mathura-Vrindavan that requires immediate municipal inspection and resolution.

• Complaint ID: ${issue._id}
• Problem Category: ${issue.category}
• Issue Title: ${issue.title}
• Exact Location / Landmark: ${issue.locationName || 'Mathura-Vrindavan, UP'}
• Google Maps Pin: ${mapLink}

Detailed Description:
${issue.description}

Please take necessary action at the earliest and reply once resolved so we can verify and close this civic complaint on CivilSaarthi.

Sincerely,
${user?.name || 'Concerned Citizen'}
${user?.email || ''}`;

    return { to, subject, body };
  };

  const handleCopyEmail = () => {
    const draft = buildEmailDraft(submittedIssue);
    const fullText = `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Official grievance email copied to clipboard!');
  };

  const handleDirectEmailSend = () => {
    const draft = buildEmailDraft(submittedIssue);
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      draft.to
    )}&su=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
    window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] dark:bg-orange-950/10 bg-orange-50/20 overflow-hidden py-12 transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-orange-600 rounded-full mix-blend-multiply filter blur-[150px] dark:opacity-40 opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-900 rounded-full mix-blend-multiply filter blur-[120px] dark:opacity-50 opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="dark:bg-black/40 bg-white/95 backdrop-blur-2xl border dark:border-orange-500/30 border-orange-200 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.08)] relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-orange-400 to-pink-500 blur-3xl dark:opacity-50 opacity-20 rounded-full"></div>

          <div className="flex items-center mb-8 border-b dark:border-orange-500/20 border-orange-200 pb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center mr-6 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <FaExclamationTriangle className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r dark:from-orange-300 dark:to-pink-400 from-orange-600 to-pink-600">
                Report an Issue
              </h2>
              <p className="dark:text-orange-200/60 text-orange-800 mt-1 font-medium">
                Snap a photo for AI detection, capture GPS or manual location, and generate an official authority email.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 relative z-10">
            <div className="space-y-6">
              {/* Step 1: Photo Capture / Upload */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 uppercase tracking-wide">
                    1. Capture or Upload Photo (AI Auto-Detect)
                  </label>
                  <span className="text-xs dark:text-orange-300 text-orange-700 font-bold uppercase tracking-wider dark:bg-orange-500/10 bg-orange-100 px-2.5 py-0.5 rounded border dark:border-orange-500/20 border-orange-200 flex items-center gap-1">
                    <FaMagic className="text-orange-500" /> CivilSaarthi AI Vision
                  </span>
                </div>

                <div className="mt-1 flex flex-col items-center justify-center px-6 pt-8 pb-6 border-2 dark:border-orange-500/40 border-orange-300 border-dashed rounded-xl dark:hover:border-orange-400 hover:border-orange-500 dark:hover:bg-orange-500/10 hover:bg-orange-50 transition-all group relative">
                  <div className="relative w-full flex flex-col items-center cursor-pointer">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <div className="space-y-2 text-center pointer-events-none">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Issue preview"
                          className="mx-auto max-h-56 rounded-xl object-cover border dark:border-orange-500/40 border-orange-300 shadow-md"
                        />
                      ) : (
                        <FaCloudUploadAlt className="mx-auto h-16 w-16 dark:text-orange-400 text-orange-500 group-hover:text-pink-500 transition-colors" />
                      )}
                      <div className="flex text-sm text-gray-500 dark:text-gray-400 justify-center items-center gap-2 pt-2">
                        <span className="font-bold dark:text-orange-300 text-orange-600 group-hover:text-pink-500">
                          {previewUrl ? 'Click here to upload a different image' : 'Click or drag an image file to upload'}
                        </span>
                      </div>
                      <p className="text-xs dark:text-orange-200/50 text-slate-500">PNG, JPG up to 10MB</p>
                      {image && (
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-black/40 px-3 py-1 rounded-full inline-block">
                          Selected: {image.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openLiveCamera}
                    className="mt-4 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-300 border border-orange-500/40 font-bold text-sm transition-all cursor-pointer"
                  >
                    <FaCamera /> Open Live Camera
                  </button>
                </div>

                {analyzing && (
                  <div className="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl dark:bg-orange-500/15 bg-orange-100/80 border dark:border-orange-500/30 border-orange-300 text-sm font-semibold dark:text-orange-200 text-orange-900">
                    <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI is inspecting the photo and auto-filling the problem details...
                  </div>
                )}

                {!analyzing && aiResult && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl dark:bg-emerald-950/40 bg-emerald-50 border dark:border-emerald-500/30 border-emerald-200 text-xs font-semibold dark:text-emerald-300 text-emerald-900">
                    <span className="flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-500 text-base" />
                      AI Matched: <strong>{aiResult.category}</strong> ({aiResult.confidence} confidence) → {aiResult.department}
                    </span>
                    <span className="dark:text-emerald-400/80 text-emerald-700">
                      Wrong match? Change category below
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2: Location (GPS Auto-Fill + Manual Fallback) */}
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-orange-500" /> 2. Issue Location (Mathura-Vrindavan)
                  </label>
                  <button
                    type="button"
                    onClick={() => requestCurrentLocation(false)}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-300 border border-orange-500/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <FaCrosshairs className={locating ? 'animate-spin' : ''} />
                    {locating ? 'Detecting GPS...' : 'Use Current GPS Location'}
                  </button>
                </div>

                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-orange-300/30 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all shadow-inner"
                  placeholder="Enter exact landmark or address (e.g., Near Banke Bihari Temple, Vrindavan)"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />

                {latitude && longitude ? (
                  <p className="mt-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    ✓ GPS Coordinates locked: {latitude}, {longitude} (will show as a Red Pin on Mathura-Vrindavan Map)
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs dark:text-orange-200/60 text-slate-500">
                    Location permission not granted? You can type any street, ghat, or colony name above.
                  </p>
                )}
              </div>

              {/* Step 3: Predefined Category Override */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 uppercase tracking-wide">
                    3. Problem Category (Predefined Override)
                  </label>
                  <span className="text-xs dark:text-orange-300/70 text-orange-700 font-medium">
                    Editable if AI misclassifies
                  </span>
                </div>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 appearance-none focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all cursor-pointer shadow-inner"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {PREDEFINED_CATEGORIES.map((item) => (
                      <option
                        key={item}
                        className="dark:bg-slate-900 dark:text-white text-slate-900 bg-white"
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-orange-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 4: Issue Title */}
              <div>
                <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 mb-2 uppercase tracking-wide">
                  4. Issue Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-orange-300/30 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all shadow-inner"
                  placeholder="e.g., Dirty public washroom near bus stand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Step 5: Description */}
              <div>
                <label className="block text-sm font-bold dark:text-orange-200 text-orange-950 mb-2 uppercase tracking-wide">
                  5. Description
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-5 py-4 dark:bg-orange-950/40 bg-white border dark:border-orange-500/30 border-orange-200 rounded-xl dark:text-white text-slate-900 placeholder-slate-400 dark:placeholder-orange-300/30 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all shadow-inner resize-none"
                  placeholder="Provide specific details to help the maintenance team..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t dark:border-orange-500/20 border-orange-200 flex justify-end">
              <button
                type="submit"
                className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold text-xl px-12 py-5 rounded-xl shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center group cursor-pointer"
                disabled={loading || analyzing}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <>
                    Submit & Generate Authority Email{' '}
                    <svg className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Official Authority Email Modal (Next Step After Reporting) */}
      {showEmailModal && submittedIssue && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl w-full dark:bg-slate-900 bg-white border-2 border-orange-500 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-left max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b dark:border-slate-700 border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-pink-600 flex items-center justify-center text-white text-xl">
                  <FaEnvelope />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white text-slate-900">
                    Next Step: Notify {submittedIssue.department}
                  </h3>
                  <p className="text-xs dark:text-slate-400 text-slate-600">
                    Copy this official grievance email or open it directly in your mail app.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  navigate('/dashboard');
                }}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {(() => {
              const draft = buildEmailDraft(submittedIssue);
              return (
                <div className="space-y-3">
                  <div className="dark:bg-slate-800/80 bg-slate-100 p-3 rounded-xl border dark:border-slate-700 border-slate-200 text-xs space-y-1">
                    <p className="dark:text-slate-300 text-slate-800">
                      <strong>To Authority Email:</strong>{' '}
                      <span className="font-mono text-orange-500 font-bold">{draft.to}</span>
                    </p>
                    <p className="dark:text-slate-300 text-slate-800">
                      <strong>Subject:</strong> {draft.subject}
                    </p>
                  </div>

                  <textarea
                    readOnly
                    rows="10"
                    value={draft.body}
                    className="w-full p-4 rounded-xl dark:bg-slate-950 bg-slate-50 border dark:border-slate-700 border-slate-300 dark:text-slate-200 text-slate-800 font-mono text-xs leading-relaxed focus:outline-none"
                  />
                </div>
              );
            })()}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl dark:bg-slate-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 dark:text-white text-slate-900 font-bold text-sm transition-all cursor-pointer"
                >
                  <FaCopy /> Copy Email Text
                </button>
                <button
                  type="button"
                  onClick={handleDirectEmailSend}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  <FaPaperPlane /> Send Directly via Email App
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEmailModal(false);
                  navigate('/dashboard');
                }}
                className="px-4 py-3 rounded-xl text-xs font-bold dark:text-slate-400 text-slate-600 hover:text-orange-500 cursor-pointer"
              >
                Go to Dashboard →
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Live Camera Capture Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-lg w-full dark:bg-slate-900 bg-white border-2 border-orange-500 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white text-slate-900 flex items-center gap-2">
                <FaCamera className="text-orange-500" /> Capture Civic Issue Photo
              </h3>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowCameraModal(false);
                }}
                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black max-h-80 object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowCameraModal(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-500/40 text-slate-400 hover:text-white font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhotoFromCamera}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold shadow-lg cursor-pointer"
              >
                Capture & Auto-Detect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Detection Warning Modal */}
      {showDuplicateModal && duplicateInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full dark:bg-slate-900 bg-white border-2 dark:border-orange-500 border-orange-300 rounded-3xl p-8 shadow-[0_0_50px_rgba(249,115,22,0.3)] relative overflow-hidden text-left"
          >
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
                  <span className="bg-orange-500/20 text-orange-650 dark:text-orange-400 border border-orange-500/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                    {duplicateInfo.category}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="dark:text-slate-400 text-slate-600 text-sm">Reports Count</span>
                  <span className="bg-pink-500/20 text-pink-650 dark:text-pink-400 border border-pink-500/30 px-3 py-0.5 rounded-full text-sm font-black">
                    {duplicateInfo.reportsCount} reports
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
