import React, { useState, useEffect, useRef } from 'react';
import { uploadToCloudinary, isConfigured as cloudinaryConfigured } from '../cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader2,
  Trash2, Plus, Save, Camera, Film, Smartphone, Sparkles, Aperture,
  Eye, EyeOff, PlayCircle, Images, LayoutDashboard, MessageSquare,
  Pencil, X, Phone, Mail, CheckCheck, Bell,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  setDoc, getDoc, orderBy, query, serverTimestamp, where,
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'elitestudio2024';

const extractYtId = (input) => {
  if (!input) return input;
  input = input.trim();
  // youtu.be/ID
  const short = input.match(/youtu\.be\/([\w-]+)/);
  if (short) return short[1];
  // youtube.com/watch?v=ID
  const watch = input.match(/[?&]v=([\w-]+)/);
  if (watch) return watch[1];
  // youtube.com/shorts/ID
  const shorts = input.match(/shorts\/([\w-]+)/);
  if (shorts) return shorts[1];
  // already just an ID (no slashes/dots)
  return input;
};

const toEmbedUrl = (url) => {
  if (!url) return url;
  url = url.trim();
  // Already an embed URL — return as-is
  if (url.includes('/embed') || url.includes('youtube.com/embed')) return url;
  // YouTube Shorts: https://youtube.com/shorts/ID  → 9:16 marker
  const ytShorts = url.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}?vertical=1`;
  // YouTube watch URL: https://www.youtube.com/watch?v=ID
  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  // YouTube short link: https://youtu.be/ID
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  // Instagram Reel: https://www.instagram.com/reel/ID/
  const instaReel = url.match(/instagram\.com\/reel\/([\w-]+)/);
  if (instaReel) return `https://www.instagram.com/reel/${instaReel[1]}/embed/`;
  // Instagram Post: https://www.instagram.com/p/ID/
  const instaPost = url.match(/instagram\.com\/p\/([\w-]+)/);
  if (instaPost) return `https://www.instagram.com/p/${instaPost[1]}/embed/`;
  return url;
};

const inputCls = "w-full px-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-gold-500 dark:text-white text-black transition-colors text-sm";
const labelCls = "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

const StatusBanner = ({ status }) => {
  if (!status) return null;
  const configs = {
    success: { bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/40 text-green-700 dark:text-green-400', icon: <CheckCircle className="w-4 h-4 shrink-0" />, text: 'Saved successfully!' },
    error:   { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-400',             icon: <AlertCircle className="w-4 h-4 shrink-0" />,   text: 'Something went wrong. Try again.' },
    loading: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40 text-blue-700 dark:text-blue-400',        icon: <Loader2 className="w-4 h-4 shrink-0 animate-spin" />, text: 'Saving...' },
  };
  const c = configs[status];
  if (!c) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm mb-4 ${c.bg}`}>
      {c.icon} {c.text}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardTab = ({ onTabChange }) => {
  const [stats, setStats] = useState({ portfolio: 0, gallery: 0, inquiries: 0, newInquiries: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'portfolioItems')).catch(() => ({ size: 0, docs: [] })),
      getDocs(collection(db, 'galleryItems')).catch(() => ({ size: 0, docs: [] })),
      getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))).catch(() => ({ size: 0, docs: [] })),
    ]).then(([portfolio, gallery, inquiries]) => {
      const inquiryDocs = inquiries.docs || [];
      setStats({
        portfolio: portfolio.size,
        gallery: gallery.size,
        inquiries: inquiryDocs.length,
        newInquiries: inquiryDocs.filter(d => d.data().status === 'new').length,
      });
      setRecent(inquiryDocs.slice(0, 5).map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;

  const cards = [
    { label: 'Portfolio Items', value: stats.portfolio,     tab: 'portfolio',  color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',     icon: <Film className="w-5 h-5" /> },
    { label: 'Gallery Photos',  value: stats.gallery,       tab: 'gallery',    color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10', icon: <Images className="w-5 h-5" /> },
    { label: 'Total Inquiries', value: stats.inquiries,     tab: 'inquiries',  color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', icon: <MessageSquare className="w-5 h-5" /> },
    { label: 'New Inquiries',   value: stats.newInquiries,  tab: 'inquiries',  color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',   icon: <Bell className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <button key={c.label} onClick={() => onTabChange(c.tab)}
            className="text-left bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-xl p-5 hover:border-gold-500/50 transition-all group">
            <div className={`inline-flex p-2.5 rounded-lg ${c.color} mb-3 group-hover:scale-110 transition-transform`}>{c.icon}</div>
            <p className="text-3xl font-serif text-black dark:text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-black dark:text-white">Recent Inquiries</h3>
          <button onClick={() => onTabChange('inquiries')} className="text-xs text-gold-500 hover:underline">View all →</button>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">No inquiries yet. They'll appear here when visitors contact you.</p>
        ) : (
          <div className="space-y-3">
            {recent.map(inq => (
              <div key={inq.id} className="flex items-center gap-4 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${inq.status === 'new' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black dark:text-white text-sm truncate">{inq.name}</p>
                  <p className="text-xs text-gray-500">{inq.eventType} · {inq.phone}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {inq.createdAt?.toDate?.()
                    ? new Date(inq.createdAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// INQUIRIES TAB
// ═══════════════════════════════════════════════════════════════════════════════
const InquiriesTab = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setInquiries([]); }
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    await deleteDoc(doc(db, 'inquiries', id)).catch(() => {});
    fetchInquiries();
  };

  const handleMarkRead = async (id) => {
    await setDoc(doc(db, 'inquiries', id), { status: 'read' }, { merge: true }).catch(() => {});
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: 'read' } : inq));
  };

  const newCount  = inquiries.filter(i => i.status === 'new').length;
  const readCount = inquiries.filter(i => i.status === 'read').length;
  const filtered  = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {[['all', inquiries.length], ['new', newCount], ['read', readCount]].map(([f, count]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-gold-500 text-black' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gold-500'}`}>
            {f} ({count})
          </button>
        ))}
        <button onClick={fetchInquiries} className="ml-auto text-xs text-gray-400 hover:text-gold-500 transition-colors">↺ Refresh</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No inquiries here yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(inq => (
            <div key={inq.id}
              className={`rounded-xl p-5 border transition-colors ${inq.status === 'new' ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20' : 'bg-gray-50 dark:bg-[#0a0a0a] border-gray-100 dark:border-white/5'}`}>

              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {inq.status === 'new' && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                  )}
                  <h4 className="font-semibold text-black dark:text-white">{inq.name}</h4>
                  <span className="text-xs text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full">{inq.eventType}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {inq.status === 'new' && (
                    <button onClick={() => handleMarkRead(inq.id)} title="Mark as read" className="text-gray-400 hover:text-emerald-500 transition-colors">
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <a href={`tel:${inq.phone}`} className="text-gray-400 hover:text-gold-500 transition-colors" title="Call">
                    <Phone className="w-4 h-4" />
                  </a>
                  {inq.email && (
                    <a href={`mailto:${inq.email}`} className="text-gray-400 hover:text-gold-500 transition-colors" title="Email">
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(inq.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-black dark:text-white font-medium">{inq.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-black dark:text-white font-medium truncate">{inq.email || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Event</p>
                  <p className="text-black dark:text-white font-medium">{inq.eventType || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-black dark:text-white font-medium">
                    {inq.createdAt?.toDate?.()
                      ? new Date(inq.createdAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>

              {inq.message && (
                <p className="text-gray-600 dark:text-gray-400 text-sm bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 rounded-lg p-3">{inq.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO TAB (with edit mode)
// ═══════════════════════════════════════════════════════════════════════════════
const PortfolioTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ category: 'Wedding', title: '', image: '', videoUrl: '' });
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'portfolioItems'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const resetForm = () => { setForm({ category: 'Wedding', title: '', image: '', videoUrl: '' }); setEditId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      if (editId) {
        await setDoc(doc(db, 'portfolioItems', editId), { ...form, updatedAt: serverTimestamp() }, { merge: true });
      } else {
        await addDoc(collection(db, 'portfolioItems'), { ...form, createdAt: serverTimestamp() });
      }
      resetForm();
      setStatus('success');
      fetchItems();
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ category: item.category || 'Wedding', title: item.title || '', image: item.image || '', videoUrl: item.videoUrl || '' });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await deleteDoc(doc(db, 'portfolioItems', id)); fetchItems(); }
    catch { alert('Delete failed.'); }
  };

  const categories = ['Wedding', 'Pre-wedding', 'Haldi', 'Reels', 'Promotional'];

  return (
    <div className="space-y-8">
      <div ref={formRef} className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-serif text-black dark:text-white flex items-center gap-2">
            {editId
              ? <><Pencil className="w-5 h-5 text-gold-500" /> Edit Item</>
              : <><Plus className="w-5 h-5 text-gold-500" /> Add New Item</>}
          </h3>
          {editId && (
            <button type="button" onClick={resetForm} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>
        <StatusBanner status={status} />
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls} required>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. A Royal Wedding" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Thumbnail Image</label>
            <div className="flex gap-2">
              <input type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="Paste URL or upload via Cloudinary →" className={`${inputCls} flex-1`} required />
              <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                ☁️ Upload
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  try {
                    const { url } = await uploadToCloudinary(f, () => {});
                    setForm(prev => ({ ...prev, image: url }));
                  } catch (err) { alert('Cloudinary Error: ' + err.message); }
                }} />
              </label>
            </div>
            {form.image?.includes('cloudinary') && (
              <p className="text-[10px] text-emerald-500 mt-1">☁️ Cloudinary image</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Video URL (YouTube or Instagram)</label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={e => setForm({ ...form, videoUrl: toEmbedUrl(e.target.value) })}
              placeholder="Paste YouTube or Instagram Reel link..."
              className={inputCls}
              required
            />
            {form.videoUrl ? (
              <p className="text-[10px] text-emerald-500 mt-1">
                ✓ Embed URL: {form.videoUrl.includes('instagram') ? '📸 Instagram' : '▶ YouTube'}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1">
                Paste any link — auto converts to embed format
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={status === 'loading'}
              className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-60">
              {editId ? <><Save className="w-4 h-4" /> Update Item</> : <><Plus className="w-4 h-4" /> Add to Portfolio</>}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-serif text-black dark:text-white mb-4">Current Items ({items.length})</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
        ) : items.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No items yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className={`flex items-center gap-4 bg-white dark:bg-[#111] border rounded-xl p-4 transition-colors ${editId === item.id ? 'border-gold-500' : 'border-gray-100 dark:border-white/5'}`}>
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg bg-gray-200 shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black dark:text-white truncate">{item.title}</p>
                  <span className="text-xs text-gold-500 uppercase tracking-wider">{item.category}</span>
                </div>
                <button onClick={() => handleEdit(item)} title="Edit" className="text-gray-400 hover:text-gold-500 transition-colors shrink-0">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} title="Delete" className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HERO TAB
// ═══════════════════════════════════════════════════════════════════════════════
const HeroTab = () => {
  const [form, setForm] = useState({ title: '', titleItalic: '', subtitle: '', videoUrl: '', posterUrl: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'hero')).then(d => {
      if (d.exists()) setForm(f => ({ ...f, ...d.data() }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await setDoc(doc(db, 'siteConfig', 'hero'), form);
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <StatusBanner status={status} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Heading (normal text)</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Capturing" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Heading (italic gold word)</label>
          <input value={form.titleItalic} onChange={e => setForm({ ...form, titleItalic: e.target.value })} placeholder="Moments" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Subtitle / Tagline</label>
        <textarea rows={3} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="Elevating weddings..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Background Video (.mp4)</label>
        <div className="flex gap-2">
          <input value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="Paste URL or upload via Cloudinary →" className={`${inputCls} flex-1`} />
          <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap">
            ☁️ Upload Video
            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
              const f = e.target.files[0]; if (!f) return;
              try { const { url } = await uploadToCloudinary(f, () => {}); setForm(prev => ({ ...prev, videoUrl: url })); }
              catch (err) { alert('Upload error: ' + err.message); }
            }} />
          </label>
        </div>
        {form.videoUrl?.includes('cloudinary') && <p className="text-[10px] text-emerald-500 mt-1">☁️ Cloudinary video</p>}
      </div>
      <div>
        <label className={labelCls}>Poster Image (shown while video loads)</label>
        <div className="flex gap-2">
          <input value={form.posterUrl} onChange={e => setForm({ ...form, posterUrl: e.target.value })} placeholder="Paste URL or upload via Cloudinary →" className={`${inputCls} flex-1`} />
          <label className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap">
            ☁️ Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files[0]; if (!f) return;
              try { const { url } = await uploadToCloudinary(f, () => {}); setForm(prev => ({ ...prev, posterUrl: url })); }
              catch (err) { alert('Upload error: ' + err.message); }
            }} />
          </label>
        </div>
        {form.posterUrl?.includes('cloudinary') && <p className="text-[10px] text-emerald-500 mt-1">☁️ Cloudinary image</p>}
      </div>
      <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
        <Save className="w-4 h-4" /> Save Hero Content
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT TAB
// ═══════════════════════════════════════════════════════════════════════════════
const AboutTab = () => {
  const [form, setForm] = useState({ founderName: '', role: '', bio1: '', bio2: '', yearsOfExperience: '', portraitUrl: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'about')).then(d => {
      if (d.exists()) setForm(f => ({ ...f, ...d.data() }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await setDoc(doc(db, 'siteConfig', 'about'), form);
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <StatusBanner status={status} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Founder Name</label>
          <input value={form.founderName} onChange={e => setForm({ ...form, founderName: e.target.value })} placeholder="Rahul Sharma" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Role / Title</label>
          <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Founder & Lead Director" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Years of Experience</label>
          <input value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} placeholder="5+" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Portrait Image URL</label>
          <input value={form.portraitUrl} onChange={e => setForm({ ...form, portraitUrl: e.target.value })} placeholder="/videographer_portrait.png" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Bio Paragraph 1</label>
        <textarea rows={3} value={form.bio1} onChange={e => setForm({ ...form, bio1: e.target.value })} placeholder="As a passionate videographer..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Bio Paragraph 2</label>
        <textarea rows={3} value={form.bio2} onChange={e => setForm({ ...form, bio2: e.target.value })} placeholder="Whether it's the chaotic beauty..." className={inputCls} />
      </div>
      <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
        <Save className="w-4 h-4" /> Save About Content
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC / SHOWREEL TAB
// ═══════════════════════════════════════════════════════════════════════════════
const CinematicTab = () => {
  const [form, setForm] = useState({ videoId: '', cloudinaryUrl: '', title: '', titleItalic: '', subtitle: '' });
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'cinematic')).then(d => {
      if (d.exists()) setForm(f => ({ ...f, ...d.data() }));
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await setDoc(doc(db, 'siteConfig', 'cinematic'), form);
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <StatusBanner status={status} />
      {/* Source toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
        <button type="button" onClick={() => setForm(f => ({ ...f, cloudinaryUrl: '' }))}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${!form.cloudinaryUrl ? 'bg-gold-500 text-black shadow' : 'text-gray-500 hover:text-gold-500'}`}>
          ▶ YouTube
        </button>
        <button type="button" onClick={() => setForm(f => ({ ...f, videoId: '' }))}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${form.cloudinaryUrl ? 'bg-gold-500 text-black shadow' : 'text-gray-500 hover:text-gold-500'}`}>
          ☁️ Cloudinary
        </button>
      </div>

      {!form.cloudinaryUrl ? (
        <div>
          <label className={labelCls}>YouTube Link or Video ID</label>
          <input
            value={form.videoId}
            onChange={e => setForm({ ...form, videoId: extractYtId(e.target.value) })}
            placeholder="Paste any YouTube link or Video ID..."
            className={inputCls}
          />
          {form.videoId && <p className="text-[11px] text-emerald-500 mt-1.5">✓ ID: <span className="font-mono">{form.videoId}</span></p>}
          <p className="text-[11px] text-gray-400 mt-1">youtu.be/ID · youtube.com/watch?v=ID · youtube.com/shorts/ID</p>
        </div>
      ) : (
        <div>
          <label className={labelCls}>Cloudinary Video</label>
          {form.cloudinaryUrl ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-700/30 rounded-lg">
              <span className="text-emerald-600 text-sm flex-1 truncate">☁️ {form.cloudinaryUrl.split('/').pop()}</span>
              <button type="button" onClick={() => setForm(f => ({ ...f, cloudinaryUrl: '' }))}
                className="text-red-400 hover:text-red-600 text-xs">Remove</button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer p-6 text-center transition-all ${uploading ? 'border-gold-500/50 bg-gold-500/5' : 'border-gray-300 dark:border-white/10 hover:border-gold-500/60'}`}>
              {uploading ? (
                <div className="w-full">
                  <p className="text-sm text-gold-500 font-medium mb-2">Uploading... {uploadPct}%</p>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-3xl mb-2">🎬</span>
                  <p className="text-sm text-gray-500"><span className="text-gold-500 font-semibold">Click to upload</span> showreel video</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, WebM — no ads, no YouTube branding</p>
                </>
              )}
              <input type="file" accept="video/*" className="hidden" disabled={uploading} onChange={async (e) => {
                const f = e.target.files[0]; if (!f) return;
                setUploading(true);
                try {
                  const { url } = await uploadToCloudinary(f, setUploadPct);
                  setForm(prev => ({ ...prev, cloudinaryUrl: url }));
                } catch (err) { alert('Upload error: ' + err.message); }
                setUploading(false); setUploadPct(0);
              }} />
            </label>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Section Title (normal)</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Our Cinematic" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Section Title (italic gold word)</label>
          <input value={form.titleItalic} onChange={e => setForm({ ...form, titleItalic: e.target.value })} placeholder="Showreel" className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Subtitle</label>
        <textarea rows={2} value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} placeholder="A glimpse into the stories we have told..." className={inputCls} />
      </div>
      <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
        <Save className="w-4 h-4" /> Save Showreel
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// GALLERY TAB
// ═══════════════════════════════════════════════════════════════════════════════
const GalleryTab = () => {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState(null);
  const [caption, setCaption]     = useState('');
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode]           = useState('cloudinary'); // 'cloudinary' | 'url' | 'social' | 'file'
  const [manualUrl, setManualUrl] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [cloudPct, setCloudPct]   = useState(0);
  const [cloudFile, setCloudFile] = useState(null);
  const [cloudPreview, setCloudPreview] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(), 5000));
      const q = query(collection(db, 'galleryItems'), orderBy('order', 'asc'));
      const snap = await Promise.race([getDocs(q), timeout]);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const detectSocialType = (url) => {
    if (!url) return null;
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return null;
  };

  const handleCloudFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCloudFile(f);
    setCloudPreview(f.type.startsWith('video/') ? null : URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'cloudinary') {
      if (!cloudFile) return;
      setUploading(true); setStatus('loading'); setCloudPct(0);
      try {
        const { url, resourceType } = await uploadToCloudinary(cloudFile, setCloudPct);
        const type = resourceType === 'video' ? 'cloudinary-video' : 'image';
        await addDoc(collection(db, 'galleryItems'), {
          imageUrl: url, caption, type,
          order: items.length, createdAt: serverTimestamp(),
        });
        setCaption(''); setCloudFile(null); setCloudPreview(null); setCloudPct(0);
        setStatus('success'); fetchItems();
      } catch (err) {
        console.error(err); setStatus('error');
      }
      setUploading(false);
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (mode === 'social') {
      const embedUrl = toEmbedUrl(socialUrl.trim());
      const type = detectSocialType(socialUrl);
      if (!embedUrl || !type) return;
      setStatus('loading');
      try {
        await addDoc(collection(db, 'galleryItems'), {
          imageUrl: embedUrl, caption, type,
          order: items.length, createdAt: serverTimestamp(),
        });
        setCaption(''); setSocialUrl('');
        setStatus('success'); fetchItems();
      } catch { setStatus('error'); }
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (mode === 'url') {
      if (!manualUrl.trim()) return;
      setStatus('loading');
      try {
        await addDoc(collection(db, 'galleryItems'), {
          imageUrl: manualUrl.trim(), caption, type: 'image',
          order: items.length, createdAt: serverTimestamp(),
        });
        setCaption(''); setManualUrl('');
        setStatus('success'); fetchItems();
      } catch { setStatus('error'); }
      setTimeout(() => setStatus(null), 3000);
      return;
    }

    if (!file) return;
    setUploading(true); setStatus('loading');
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          snap => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject, resolve
        );
      });
      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
      await addDoc(collection(db, 'galleryItems'), {
        imageUrl: downloadUrl, caption, type: 'image',
        order: items.length, createdAt: serverTimestamp(),
      });
      setCaption(''); setFile(null); setPreview(null); setUploadPct(0);
      setStatus('success'); fetchItems();
    } catch (err) {
      console.error(err); setStatus('error');
    }
    setUploading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item?')) return;
    try { await deleteDoc(doc(db, 'galleryItems', id)); fetchItems(); }
    catch { alert('Delete failed.'); }
  };

  const socialType = detectSocialType(socialUrl);

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="text-lg font-serif text-black dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-gold-500" /> Add to Gallery
          </h3>
          <div className="flex flex-wrap items-center bg-gray-100 dark:bg-white/5 rounded-lg p-1 text-xs font-medium gap-0.5">
            {[['cloudinary', '☁️ Cloudinary'], ['url', '🔗 URL'], ['social', '📱 Insta/YT'], ['file', '📁 Firebase']].map(([m, label]) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-md transition-all ${mode === m ? 'bg-gold-500 text-black shadow' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <StatusBanner status={status} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'cloudinary' && (
            <div>
              <label className={labelCls}>
                Upload Image or Video (via Cloudinary)
                <span className="ml-2 font-mono text-gold-500 normal-case tracking-normal">
                  preset: {import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '❌ not set'}
                </span>
              </label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all p-6 text-center ${cloudFile ? 'border-gold-500/50 bg-gold-500/5' : 'border-gray-300 dark:border-white/10 hover:border-gold-500/60 bg-gray-50 dark:bg-white/[0.02]'}`}>
                {cloudPreview ? (
                  <div><img src={cloudPreview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover shadow-md" /><p className="text-xs text-gray-500 mt-2">{cloudFile?.name}</p></div>
                ) : cloudFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🎬</span>
                    <p className="text-sm text-gold-500 font-semibold">{cloudFile.name}</p>
                    <p className="text-xs text-gray-400">{(cloudFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400"><span className="text-gold-500 font-semibold">Click to upload</span> image or video</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, MP4, MOV — stored on Cloudinary</p>
                  </>
                )}
                <input type="file" accept="image/*,video/*" onChange={handleCloudFileChange} className="hidden" />
              </label>
              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Uploading to Cloudinary...</span><span>{cloudPct}%</span></div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full transition-all duration-300" style={{ width: `${cloudPct}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'social' && (
            <div>
              <label className={labelCls}>Instagram or YouTube Link</label>
              <input
                type="text"
                value={socialUrl}
                onChange={e => setSocialUrl(e.target.value)}
                placeholder="Paste Instagram post/reel or YouTube/Shorts link..."
                className={inputCls}
                required
              />
              {socialUrl && socialType && (
                <p className="text-[11px] text-emerald-500 mt-1.5">
                  ✓ Detected: {socialType === 'instagram' ? '📸 Instagram' : '▶ YouTube'} — will embed in gallery
                </p>
              )}
              {socialUrl && !socialType && (
                <p className="text-[11px] text-red-400 mt-1.5">⚠ Not a valid Instagram or YouTube link</p>
              )}
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700/30 rounded-lg px-3 py-2 text-[11px] text-blue-600 dark:text-blue-400 space-y-0.5">
                <p>✓ instagram.com/p/... &nbsp;✓ instagram.com/reel/...</p>
                <p>✓ youtube.com/watch?v=... &nbsp;✓ youtube.com/shorts/... &nbsp;✓ youtu.be/...</p>
              </div>
            </div>
          )}

          {mode === 'url' && (
            <div>
              <label className={labelCls}>Image URL (Cloudinary / any hosting)</label>
              <input type="url" value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." className={inputCls} required />
            </div>
          )}

          {mode === 'file' && (
            <div>
              <label className={labelCls}>Choose Image from Device</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all p-6 text-center ${preview ? 'border-gold-500/50 bg-gold-500/5' : 'border-gray-300 dark:border-white/10 hover:border-gold-500/60 bg-gray-50 dark:bg-white/[0.02]'}`}>
                {preview ? (
                  <div>
                    <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover shadow-md" />
                    <p className="text-xs text-gray-500 mt-2">{file?.name}</p>
                  </div>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400"><span className="text-gold-500 font-semibold">Click to upload</span> or drag &amp; drop</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {uploading && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Uploading...</span><span>{uploadPct}%</span></div>
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500 rounded-full transition-all duration-300" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            <label className={labelCls}>Caption (optional)</label>
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="A beautiful wedding moment..." className={inputCls} />
          </div>
          <button type="submit" disabled={uploading || status === 'loading'}
            className="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadPct}%...</> : <><Plus className="w-4 h-4" /> Add to Gallery</>}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-serif text-black dark:text-white mb-4 flex items-center gap-2">
          <Images className="w-5 h-5 text-gold-500" /> Gallery ({items.length} items)
        </h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No items yet. Add one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-900 shadow-sm">
                {item.type === 'instagram' || item.type === 'youtube' ? (
                  <div className="aspect-square flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-800 p-3 gap-2">
                    <span className="text-2xl">{item.type === 'instagram' ? '📸' : '▶️'}</span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.type}</span>
                    {item.caption && <p className="text-[10px] text-gray-400 text-center truncate w-full">{item.caption}</p>}
                  </div>
                ) : (
                  <div className="aspect-square">
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e => { e.target.style.opacity = '0.3'; }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-start p-2">
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {item.caption && <p className="absolute bottom-2 left-2 right-2 text-white text-xs text-center">{item.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES TAB (with add / remove)
// ═══════════════════════════════════════════════════════════════════════════════
const defaultServices = [
  { title: 'Wedding Shoot',     description: 'Cinematic coverage of your special day, capturing every emotion and ritual with an artistic eye.' },
  { title: 'Pre-Wedding Shoot', description: 'Story-driven pre-wedding films set in breathtaking locations to celebrate your journey.' },
  { title: 'Event Coverage',    description: 'High-end videography for birthdays, anniversaries, and corporate events.' },
  { title: 'Reel Creation',     description: 'Engaging, fast-paced vertical video editing tailored for Instagram and TikTok.' },
  { title: 'Brand Promotion',   description: 'Professional promotional videos and influencer campaigns to elevate your brand presence.' },
  { title: 'Drone & Aerial',    description: 'Breathtaking aerial videography and photography to add a cinematic scale to your visual story.' },
];

const ServicesTab = () => {
  const [services, setServices] = useState(defaultServices);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'services')).then(d => {
      if (d.exists() && d.data().items) setServices(d.data().items);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await setDoc(doc(db, 'siteConfig', 'services'), { items: services });
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  const updateService = (i, field, value) => {
    const updated = [...services];
    updated[i] = { ...updated[i], [field]: value };
    setServices(updated);
  };

  const addService = () => setServices([...services, { title: '', description: '' }]);

  const removeService = (i) => {
    if (!window.confirm('Remove this service?')) return;
    setServices(services.filter((_, idx) => idx !== i));
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <StatusBanner status={status} />
      <div className="space-y-4">
        {services.map((svc, i) => (
          <div key={i} className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-xl p-4 space-y-3 relative">
            <button type="button" onClick={() => removeService(i)}
              className="absolute top-3 right-3 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div>
              <label className={labelCls}>Service {i + 1} — Title</label>
              <input
                value={svc.title}
                onChange={e => updateService(i, 'title', e.target.value)}
                placeholder="e.g. Wedding Shoot"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={2}
                value={svc.description}
                onChange={e => updateService(i, 'description', e.target.value)}
                placeholder="Describe this service..."
                className={inputCls}
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={addService}
          className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-white/10 rounded-xl text-sm text-gray-500 hover:border-gold-500 hover:text-gold-500 transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </button>
        <button type="submit"
          className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Save All Services
        </button>
      </div>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT INFO TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ContactTab = () => {
  const [form, setForm] = useState({ phone: '', email: '', location: '', instagramUrl: '', whatsappNumber: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'siteConfig', 'contact')).then(d => {
      if (d.exists()) setForm(f => ({ ...f, ...d.data() }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await setDoc(doc(db, 'siteConfig', 'contact'), form);
      setStatus('success');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <StatusBanner status={status} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone / WhatsApp</label>
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 95632 12598" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="hello@elitestudio.com" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Studio Location</label>
          <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Haveli Kharagpur, Bihar" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>WhatsApp Number (digits only, with country code)</label>
          <input value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="919563212598" className={inputCls} />
        </div>
        <div className="md:col-span-2">
          <label className={labelCls}>Instagram URL</label>
          <input value={form.instagramUrl} onChange={e => setForm({ ...form, instagramUrl: e.target.value })} placeholder="https://instagram.com/elitestudio" className={inputCls} />
        </div>
      </div>
      <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-black font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
        <Save className="w-4 h-4" /> Save Contact Info
      </button>
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const tabs = [
  { id: 'dashboard', label: 'Dashboard',   desc: 'Stats & overview',         icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  { id: 'inquiries', label: 'Inquiries',   desc: 'Customer leads & messages', icon: <MessageSquare  className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'portfolio', label: 'Portfolio',   desc: 'Video projects & work',     icon: <Film           className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'gallery',   label: 'Gallery',     desc: 'Photos & social embeds',    icon: <Images         className="w-5 h-5" />, color: 'text-pink-500',   bg: 'bg-pink-500/10'   },
  { id: 'cinematic', label: 'Showreel',    desc: 'Main featured video',       icon: <PlayCircle     className="w-5 h-5" />, color: 'text-red-500',    bg: 'bg-red-500/10'    },
  { id: 'hero',      label: 'Homepage',    desc: 'Hero text & background',    icon: <Camera         className="w-5 h-5" />, color: 'text-amber-500',  bg: 'bg-amber-500/10'  },
  { id: 'about',     label: 'About',       desc: 'Founder info & bio',        icon: <Sparkles       className="w-5 h-5" />, color: 'text-gold-500',   bg: 'bg-gold-500/10'   },
  { id: 'services',  label: 'Services',    desc: 'Service cards & pricing',   icon: <Aperture       className="w-5 h-5" />, color: 'text-cyan-500',   bg: 'bg-cyan-500/10'   },
  { id: 'contact',   label: 'Contact Info', desc: 'Phone, email & location',  icon: <Smartphone     className="w-5 h-5" />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
];

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  useEffect(() => {
    if (!authenticated) return;
    getDocs(query(collection(db, 'inquiries'), where('status', '==', 'new')))
      .then(snap => setNewInquiriesCount(snap.size))
      .catch(() => {});
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuth', 'true');
      setAuthenticated(true);
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 2000);
    }
  };

  // ── Password Gate ─────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8 bg-black text-center">
            <Camera className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h1 className="text-2xl font-serif text-white">Admin Access</h1>
            <p className="text-gray-400 text-sm mt-1">Elite Studio Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <label className={labelCls}>Admin Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  className={`${inputCls} pr-12 ${pwError ? 'border-red-400' : ''}`}
                  autoFocus
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pwError && <p className="text-red-500 text-xs mt-1.5">Incorrect password.</p>}
            </div>
            <button type="submit" className="w-full bg-gold-500 hover:bg-gold-400 text-black font-semibold py-3 rounded-lg transition-colors">
              Login
            </button>
            <div className="text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gold-500 transition-colors">← Back to website</Link>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Admin Panel ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-black dark:text-white">Elite Studio</h1>
            <p className="text-gray-400 text-xs mt-0.5 uppercase tracking-wider">Admin Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gold-500 transition-colors bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-lg">
              <ArrowLeft className="w-3.5 h-3.5" /> Site
            </Link>
            <button
              onClick={() => { sessionStorage.removeItem('adminAuth'); setAuthenticated(false); }}
              className="text-xs text-red-400 hover:text-red-600 border border-red-200 dark:border-red-900 px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Nav Grid — show when no active section, or as compact strip */}
        {activeTab === 'dashboard' ? (
          /* Full grid on dashboard */
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border text-center transition-all active:scale-95 ${
                  tab.id === 'dashboard'
                    ? 'bg-gold-500 text-black border-gold-500 shadow-lg'
                    : 'bg-white dark:bg-[#111] border-gray-100 dark:border-white/5 hover:border-gold-500/50 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-xl ${tab.id === 'dashboard' ? 'bg-black/10' : tab.bg}`}>
                  <span className={tab.id === 'dashboard' ? 'text-black' : tab.color}>{tab.icon}</span>
                </div>
                <span className={`text-xs font-semibold leading-tight ${tab.id === 'dashboard' ? 'text-black' : 'text-gray-700 dark:text-gray-300'}`}>
                  {tab.label}
                </span>
                {tab.id === 'inquiries' && newInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {newInquiriesCount > 9 ? '9+' : newInquiriesCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Compact strip when inside a section */
          <div className="flex items-center gap-3 mb-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-500 transition-colors shrink-0"
            >
              <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Menu</span>
            </button>
            <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />
            <div className="flex overflow-x-auto gap-2 scrollbar-hide">
              {tabs.filter(t => t.id !== 'dashboard').map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gold-500 text-black'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gold-500'
                  }`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'inquiries' && newInquiriesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {newInquiriesCount > 9 ? '9+' : newInquiriesCount}
                </span>
              )}
            </button>
          ))}
            </div>
          </div>
        )}

        {/* Section Header */}
        {activeTab !== 'dashboard' && (() => {
          const t = tabs.find(t => t.id === activeTab);
          return (
            <div className={`flex items-center gap-3 mb-5 p-4 rounded-xl border ${t.bg} border-current/10`}>
              <div className={`p-2 rounded-lg ${t.bg}`}>
                <span className={t.color}>{t.icon}</span>
              </div>
              <div>
                <h2 className="font-semibold text-black dark:text-white text-sm">{t.label}</h2>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </div>
            </div>
          );
        })()}

        {/* Tab Content */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-5 md:p-8 shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard'  && <DashboardTab onTabChange={setActiveTab} />}
              {activeTab === 'portfolio'  && <PortfolioTab />}
              {activeTab === 'hero'       && <HeroTab />}
              {activeTab === 'cinematic'  && <CinematicTab />}
              {activeTab === 'gallery'    && <GalleryTab />}
              {activeTab === 'about'      && <AboutTab />}
              {activeTab === 'services'   && <ServicesTab />}
              {activeTab === 'contact'    && <ContactTab />}
              {activeTab === 'inquiries'  && <InquiriesTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Admin;
