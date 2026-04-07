import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  HiSave, HiPlus, HiTrash, HiChevronUp, HiChevronDown,
  HiPhotograph, HiInformationCircle,
} from 'react-icons/hi';
import { adminAPI } from '../../api/axios';
import { invalidateContentCache } from '../../hooks/useSiteContent';

/* ─── helpers ─── */
const deepClone = (v) => JSON.parse(JSON.stringify(v));

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls  = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nio-green-400';
const btnAdd    = 'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl bg-nio-green-50 border border-nio-green-200 text-nio-green-700 hover:bg-nio-green-100 transition';
const btnDanger = 'p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition';
const btnMove   = 'p-1 rounded text-gray-400 hover:bg-gray-100 transition';

/* ── DEFAULTS (one source of truth matching contentController DEFAULTS) ── */
const DEFAULTS = {
  hero: { subTagline: 'Est. 2020 • Premium Tea Estate', tagline: 'Where every leaf tells a story of nature, tradition, and excellence.', ctaPrimary: 'Explore Collection', ctaSecondary: 'Our Story' },
  homeAbout: { label: 'Our Philosophy', title: 'Crafted with', titleHighlight: 'Passion & Purpose', subtitle: "Nio Tea was born from a deep reverence for India's extraordinary tea heritage.", body: 'We believe tea is more than a beverage — it is a ritual, a moment of stillness in the rush of life.', ctaText: 'Discover Our Story', values: [{ icon: '🌱', title: 'Sustainability', desc: 'Ethically sourced from eco-friendly gardens.' }, { icon: '✋', title: 'Handpicked', desc: 'Every leaf hand-selected by experienced artisans.' }, { icon: '🏆', title: 'Premium Quality', desc: 'Rigorous quality checks ensure only the finest.' }, { icon: '❤️', title: 'Pure Heritage', desc: 'Rooted in centuries of Indian tea tradition.' }] },
  stats: { items: [{ value: '12+', label: 'Partner Estates' }, { value: '50+', label: 'Tea Varieties' }, { value: '25K+', label: 'Happy Customers' }, { value: '5★', label: 'Average Rating' }] },
  testimonials: { sectionLabel: 'What People Say', sectionTitle: 'Loved by Tea Connoisseurs', items: [{ name: 'Vikram Joshi', location: 'Mumbai', rating: 5, text: "Nio Tea's Darjeeling First Flush is absolutely magical." }] },
  team: { sectionLabel: 'Meet The Team', sectionTitle: 'The People Behind Nio Tea', members: [{ name: 'Arjun Mehta', role: 'Founder & CEO', bio: 'Third-generation tea enthusiast.', image: '' }, { name: 'Priya Nair', role: 'Head of Sourcing', bio: 'Expert in garden relations.', image: '' }] },
  about: { heroTitle: 'About Nio Tea', heroSubtitle: "Born from a deep love for India's extraordinary tea heritage.", storyTitle: 'The Nio Tea Story', storyParagraphs: ['Nio Tea was founded in 2020...'], mission: [{ icon: '🎯', title: 'Our Vision', desc: "To be India's most trusted premium tea brand." }, { icon: '🌿', title: 'Our Mission', desc: 'Source and deliver exceptional teas.' }, { icon: '🌟', title: 'Our Goals', desc: 'Partner with 25 sustainable tea estates.' }], values: [{ icon: '🌱', title: 'Sustainability', desc: 'Responsible farming.' }, { icon: '🤝', title: 'Integrity', desc: 'Fair trade sourcing.' }, { icon: '💎', title: 'Excellence', desc: 'Rigorous quality.' }, { icon: '🧡', title: 'Community', desc: 'Celebrate tea culture.' }, { icon: '🔬', title: 'Innovation', desc: 'Explore new flavours.' }, { icon: '🗺️', title: 'Heritage', desc: "India's tea legacy." }] },
  contact: { heroSubtitle: "Have a question, bulk enquiry, or just want to talk tea?", formSubtitle: "Our team is here to help. We typically respond within 24 hours.", address: '123 Garden Lane, Darjeeling, West Bengal – 734101, India', phone: '+91 99999 99999', email: 'hello@niotea.com', mapEmbed: '' },
  footer: { tagline: 'Premium teas sourced from the finest gardens of India.', instagram: '', facebook: '', twitter: '', whatsapp: '' },
  seo: { siteTitle: 'Nio Tea — Premium Tea Trading Company', description: 'Nio Tea brings you the finest handpicked teas from the best tea gardens of India.', keywords: 'Nio Tea, premium tea, black tea, green tea, Indian tea' },
  firms: {
    sectionLabel: 'Our Network',
    sectionTitle: 'Our Firms',
    sectionSubtitle: 'Trusted trading partners and affiliated companies working together to bring the finest teas to you.',
    firms: [
      { name: 'Madhuraj Emporium', tagline: 'Premium Tea Traders since 1985', description: 'Madhuraj Emporium is a distinguished tea trading house specialising in high-grade Darjeeling and Assam teas.', phone: '+91 98765 43210', email: 'contact@madhurajemporium.com', address: '12, Tea Traders Lane, Darjeeling, West Bengal – 734101', badge: 'ME', color: 'green' },
      { name: 'PM Trading Company', tagline: 'Wholesale & Export Specialists', description: 'PM Trading Company is a leading wholesale and export firm with a strong presence in domestic and international tea markets.', phone: '+91 98765 12345', email: 'info@pmtradingco.com', address: '45, Commerce Street, Kolkata, West Bengal – 700001', badge: 'PM', color: 'gold' },
    ],
  },
  rebranding: {
    showInNav: true,
    heroLabel: 'Transform Your Brand',
    heroTitle: 'Premium Tea Rebranding Services',
    heroSubtitle: 'We help businesses reimagine their tea products — from packaging and identity to formulation — with expertise trusted by leading distributors across India.',
    description: 'Nio Tea offers end-to-end rebranding solutions for tea businesses, distributors, and retailers.',
    services: [
      { icon: '🎨', title: 'Packaging Design', desc: 'Custom packaging that tells your brand story.' },
      { icon: '🏷️', title: 'Private Labelling', desc: "Launch your own premium tea line using Nio Tea's curated blends." },
      { icon: '🍃', title: 'Custom Blending', desc: 'Signature tea blends crafted exclusively for your brand.' },
      { icon: '📋', title: 'Brand Identity', desc: 'Logo, colour palette, typography and messaging.' },
      { icon: '🚀', title: 'Market Launch Support', desc: 'From strategy to shelf — we support your go-to-market plan.' },
      { icon: '♻️', title: 'Sustainable Options', desc: 'Eco-friendly packaging and sustainable sourcing options.' },
    ],
    whyTitle: 'Why Choose Nio Tea for Rebranding?',
    whyPoints: [
      'Over 5 years of experience in premium tea branding',
      'Access to 50+ curated tea varieties from certified gardens',
      'End-to-end service from concept to delivery',
      'Competitive pricing for bulk and wholesale orders',
      'Dedicated account manager throughout the project',
    ],
    ctaTitle: 'Ready to Transform Your Brand?',
    ctaSubtitle: "Let's talk. Our rebranding specialists are ready to help you create something extraordinary.",
  },
};

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData]   = useState({});
  const [saving, setSaving]       = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  useEffect(() => {
    adminAPI.get('/admin/content')
      .then((res) => { const d = res.data.data || {}; setFormData(deepClone(d)); })
      .catch(() => toast.error('Failed to load content'))
      .finally(() => setLoadedAll(true));
  }, []);

  const fd = formData[activeTab] ?? deepClone(DEFAULTS[activeTab] ?? {});

  const setField = (key, val) =>
    setFormData((prev) => ({ ...prev, [activeTab]: { ...(prev[activeTab] ?? deepClone(DEFAULTS[activeTab] ?? {})), [key]: val } }));

  const setArrayItem = (arrayKey, idx, field, val) => {
    const arr = deepClone(fd[arrayKey] ?? []);
    arr[idx] = { ...arr[idx], [field]: val };
    setField(arrayKey, arr);
  };

  const addArrayItem = (arrayKey, template) => {
    const arr = deepClone(fd[arrayKey] ?? []);
    arr.push(deepClone(template));
    setField(arrayKey, arr);
  };

  const removeArrayItem = (arrayKey, idx) => {
    const arr = deepClone(fd[arrayKey] ?? []);
    arr.splice(idx, 1);
    setField(arrayKey, arr);
  };

  const moveArrayItem = (arrayKey, idx, dir) => {
    const arr = deepClone(fd[arrayKey] ?? []);
    const to = idx + dir;
    if (to < 0 || to >= arr.length) return;
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setField(arrayKey, arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.put(`/admin/content/${activeTab}`, { data: fd });
      invalidateContentCache(activeTab);
      toast.success('Saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await adminAPI.post('/admin/content/upload-image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setArrayItem('members', idx, 'image', res.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  const tabs = [
    { id: 'hero',         label: 'Hero' },
    { id: 'homeAbout',    label: 'Home About' },
    { id: 'stats',        label: 'Stats' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'team',         label: 'Team' },
    { id: 'about',        label: 'About Page' },
    { id: 'contact',      label: 'Contact' },
    { id: 'firms',        label: 'Our Firms' },
    { id: 'rebranding',   label: 'Rebranding' },
    { id: 'footer',       label: 'Footer' },
    { id: 'seo',          label: 'SEO' },
  ];

  if (!loadedAll) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-nio-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-nio-green-900">Site Content</h2>
        <p className="text-gray-400 text-sm">Every field on the public website is editable here — no developer needed.</p>
      </div>

      <div className="bg-nio-green-50 border border-nio-green-200 rounded-xl px-4 py-3 flex gap-2 items-start">
        <HiInformationCircle className="w-5 h-5 text-nio-green-600 shrink-0 mt-0.5" />
        <p className="text-nio-green-700 text-sm">Changes are saved to the database and reflected on the live site instantly. Each tab is saved independently.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-nio-green-800 text-white shadow' : 'bg-white text-nio-green-700 border border-nio-green-100 hover:border-nio-green-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Form panel */}
      <div className="bg-white rounded-2xl shadow-nio p-6 space-y-6">

        {/* ── HERO ── */}
        {activeTab === 'hero' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Hero Section</h3>
            <Field label="Sub-tagline (small text above logo)">
              <input className={inputCls} value={fd.subTagline ?? ''} onChange={(e) => setField('subTagline', e.target.value)} placeholder="Est. 2020 • Premium Tea Estate" />
            </Field>
            <Field label="Tagline (appears beneath Nio Tea heading)">
              <textarea className={inputCls} rows={2} value={fd.tagline ?? ''} onChange={(e) => setField('tagline', e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Primary CTA button text">
                <input className={inputCls} value={fd.ctaPrimary ?? ''} onChange={(e) => setField('ctaPrimary', e.target.value)} placeholder="Explore Collection" />
              </Field>
              <Field label="Secondary CTA button text">
                <input className={inputCls} value={fd.ctaSecondary ?? ''} onChange={(e) => setField('ctaSecondary', e.target.value)} placeholder="Our Story" />
              </Field>
            </div>
          </>
        )}

        {/* ── HOME ABOUT ── */}
        {activeTab === 'homeAbout' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Home — About Section</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Section label (small caps)"><input className={inputCls} value={fd.label ?? ''} onChange={(e) => setField('label', e.target.value)} /></Field>
              <Field label="CTA button text"><input className={inputCls} value={fd.ctaText ?? ''} onChange={(e) => setField('ctaText', e.target.value)} /></Field>
              <Field label="Title (first line)"><input className={inputCls} value={fd.title ?? ''} onChange={(e) => setField('title', e.target.value)} /></Field>
              <Field label="Title highlight (italic gradient line)"><input className={inputCls} value={fd.titleHighlight ?? ''} onChange={(e) => setField('titleHighlight', e.target.value)} /></Field>
            </div>
            <Field label="Subtitle paragraph"><textarea className={inputCls} rows={3} value={fd.subtitle ?? ''} onChange={(e) => setField('subtitle', e.target.value)} /></Field>
            <Field label="Body paragraph"><textarea className={inputCls} rows={3} value={fd.body ?? ''} onChange={(e) => setField('body', e.target.value)} /></Field>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">Value cards</span>
                <button className={btnAdd} onClick={() => addArrayItem('values', { icon: '✨', title: 'New Value', desc: '' })}><HiPlus className="w-4 h-4" />Add card</button>
              </div>
              {(fd.values ?? []).map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-xl p-3 mb-2">
                  <input className={`${inputCls} col-span-1`} value={v.icon ?? ''} onChange={(e) => setArrayItem('values', i, 'icon', e.target.value)} placeholder="🌱" />
                  <input className={`${inputCls} col-span-3`} value={v.title ?? ''} onChange={(e) => setArrayItem('values', i, 'title', e.target.value)} placeholder="Label" />
                  <input className={`${inputCls} col-span-7`} value={v.desc ?? ''} onChange={(e) => setArrayItem('values', i, 'desc', e.target.value)} placeholder="Description" />
                  <button className={`${btnDanger} col-span-1`} onClick={() => removeArrayItem('values', i)}><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STATS ── */}
        {activeTab === 'stats' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Stats Bar</h3>
            <div className="flex justify-end mb-2">
              <button className={btnAdd} onClick={() => addArrayItem('items', { value: '0+', label: 'New Stat' })}><HiPlus className="w-4 h-4" />Add stat</button>
            </div>
            {(fd.items ?? []).map((item, i) => (
              <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3 mb-2">
                <div className="flex flex-col gap-0.5">
                  <button className={btnMove} onClick={() => moveArrayItem('items', i, -1)}><HiChevronUp className="w-4 h-4" /></button>
                  <button className={btnMove} onClick={() => moveArrayItem('items', i, 1)}><HiChevronDown className="w-4 h-4" /></button>
                </div>
                <input className={`${inputCls} w-28`} value={item.value ?? ''} onChange={(e) => setArrayItem('items', i, 'value', e.target.value)} placeholder="12+" />
                <input className={inputCls} value={item.label ?? ''} onChange={(e) => setArrayItem('items', i, 'label', e.target.value)} placeholder="Partner Estates" />
                <button className={btnDanger} onClick={() => removeArrayItem('items', i)}><HiTrash className="w-4 h-4" /></button>
              </div>
            ))}
          </>
        )}

        {/* ── TESTIMONIALS ── */}
        {activeTab === 'testimonials' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Testimonials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Section label"><input className={inputCls} value={fd.sectionLabel ?? ''} onChange={(e) => setField('sectionLabel', e.target.value)} /></Field>
              <Field label="Section title"><input className={inputCls} value={fd.sectionTitle ?? ''} onChange={(e) => setField('sectionTitle', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end mb-2">
              <button className={btnAdd} onClick={() => addArrayItem('items', { name: '', location: '', rating: 5, text: '' })}><HiPlus className="w-4 h-4" />Add testimonial</button>
            </div>
            {(fd.items ?? []).map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Testimonial #{i + 1}</span>
                  <button className={btnDanger} onClick={() => removeArrayItem('items', i)}><HiTrash className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Name"><input className={inputCls} value={item.name ?? ''} onChange={(e) => setArrayItem('items', i, 'name', e.target.value)} /></Field>
                  <Field label="Location"><input className={inputCls} value={item.location ?? ''} onChange={(e) => setArrayItem('items', i, 'location', e.target.value)} /></Field>
                  <Field label="Rating (1–5)"><input className={inputCls} type="number" min={1} max={5} value={item.rating ?? 5} onChange={(e) => setArrayItem('items', i, 'rating', parseInt(e.target.value) || 5)} /></Field>
                </div>
                <Field label="Review text"><textarea className={inputCls} rows={3} value={item.text ?? ''} onChange={(e) => setArrayItem('items', i, 'text', e.target.value)} /></Field>
              </div>
            ))}
          </>
        )}

        {/* ── TEAM ── */}
        {activeTab === 'team' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Team Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Field label="Section label"><input className={inputCls} value={fd.sectionLabel ?? ''} onChange={(e) => setField('sectionLabel', e.target.value)} /></Field>
              <Field label="Section title"><input className={inputCls} value={fd.sectionTitle ?? ''} onChange={(e) => setField('sectionTitle', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end mb-2">
              <button className={btnAdd} onClick={() => addArrayItem('members', { name: '', role: '', bio: '', image: '' })}><HiPlus className="w-4 h-4" />Add member</button>
            </div>
            {(fd.members ?? []).map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Member #{i + 1}</span>
                  <div className="flex gap-1">
                    <button className={btnMove} onClick={() => moveArrayItem('members', i, -1)}><HiChevronUp className="w-4 h-4" /></button>
                    <button className={btnMove} onClick={() => moveArrayItem('members', i, 1)}><HiChevronDown className="w-4 h-4" /></button>
                    <button className={btnDanger} onClick={() => removeArrayItem('members', i)}><HiTrash className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-nio-green-100 flex items-center justify-center border border-nio-green-200 mb-2">
                      {m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-nio-green-600 text-xl font-bold">{m.name?.[0] || '?'}</span>}
                    </div>
                    <label className={`${btnAdd} cursor-pointer text-xs`}>
                      {uploadingIdx === i ? <span>Uploading…</span> : <><HiPhotograph className="w-4 h-4" /><span>{m.image ? 'Change' : 'Upload'}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(i, e.target.files[0])} disabled={uploadingIdx !== null} /></>}
                    </label>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Name"><input className={inputCls} value={m.name ?? ''} onChange={(e) => setArrayItem('members', i, 'name', e.target.value)} /></Field>
                      <Field label="Role / Title"><input className={inputCls} value={m.role ?? ''} onChange={(e) => setArrayItem('members', i, 'role', e.target.value)} /></Field>
                    </div>
                    <Field label="Bio (1–2 sentences)"><textarea className={inputCls} rows={2} value={m.bio ?? ''} onChange={(e) => setArrayItem('members', i, 'bio', e.target.value)} /></Field>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── ABOUT PAGE ── */}
        {activeTab === 'about' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">About Page</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hero title"><input className={inputCls} value={fd.heroTitle ?? ''} onChange={(e) => setField('heroTitle', e.target.value)} /></Field>
              <Field label="Story section title"><input className={inputCls} value={fd.storyTitle ?? ''} onChange={(e) => setField('storyTitle', e.target.value)} /></Field>
            </div>
            <Field label="Hero subtitle"><textarea className={inputCls} rows={2} value={fd.heroSubtitle ?? ''} onChange={(e) => setField('heroSubtitle', e.target.value)} /></Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Story paragraphs</span>
                <button className={btnAdd} onClick={() => addArrayItem('storyParagraphs', '')}><HiPlus className="w-4 h-4" />Add paragraph</button>
              </div>
              {(fd.storyParagraphs ?? []).map((para, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <textarea className={`${inputCls} flex-1`} rows={3} value={para} onChange={(e) => { const arr = deepClone(fd.storyParagraphs ?? []); arr[i] = e.target.value; setField('storyParagraphs', arr); }} />
                  <button className={btnDanger} onClick={() => removeArrayItem('storyParagraphs', i)}><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Vision / Mission / Goals cards</span>
                <button className={btnAdd} onClick={() => addArrayItem('mission', { icon: '🎯', title: '', desc: '' })}><HiPlus className="w-4 h-4" />Add card</button>
              </div>
              {(fd.mission ?? []).map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-3 mb-2">
                  <input className={`${inputCls} col-span-1`} value={m.icon ?? ''} onChange={(e) => setArrayItem('mission', i, 'icon', e.target.value)} placeholder="🎯" />
                  <input className={`${inputCls} col-span-3`} value={m.title ?? ''} onChange={(e) => setArrayItem('mission', i, 'title', e.target.value)} placeholder="Title" />
                  <input className={`${inputCls} col-span-7`} value={m.desc ?? ''} onChange={(e) => setArrayItem('mission', i, 'desc', e.target.value)} placeholder="Description" />
                  <button className={`${btnDanger} col-span-1`} onClick={() => removeArrayItem('mission', i)}><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Core values</span>
                <button className={btnAdd} onClick={() => addArrayItem('values', { icon: '✨', title: '', desc: '' })}><HiPlus className="w-4 h-4" />Add value</button>
              </div>
              {(fd.values ?? []).map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-3 mb-2">
                  <input className={`${inputCls} col-span-1`} value={v.icon ?? ''} onChange={(e) => setArrayItem('values', i, 'icon', e.target.value)} placeholder="🌱" />
                  <input className={`${inputCls} col-span-3`} value={v.title ?? ''} onChange={(e) => setArrayItem('values', i, 'title', e.target.value)} placeholder="Title" />
                  <input className={`${inputCls} col-span-7`} value={v.desc ?? ''} onChange={(e) => setArrayItem('values', i, 'desc', e.target.value)} placeholder="Description" />
                  <button className={`${btnDanger} col-span-1`} onClick={() => removeArrayItem('values', i)}><HiTrash className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CONTACT ── */}
        {activeTab === 'contact' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Contact Info</h3>
            <Field label="Hero page subtitle"><textarea className={inputCls} rows={2} value={fd.heroSubtitle ?? ''} onChange={(e) => setField('heroSubtitle', e.target.value)} /></Field>
            <Field label="Form section description"><textarea className={inputCls} rows={2} value={fd.formSubtitle ?? ''} onChange={(e) => setField('formSubtitle', e.target.value)} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone"><input className={inputCls} value={fd.phone ?? ''} onChange={(e) => setField('phone', e.target.value)} /></Field>
              <Field label="Email"><input className={inputCls} value={fd.email ?? ''} onChange={(e) => setField('email', e.target.value)} /></Field>
            </div>
            <Field label="Address"><textarea className={inputCls} rows={2} value={fd.address ?? ''} onChange={(e) => setField('address', e.target.value)} /></Field>
            <Field label="Google Maps embed URL (paste the src= from the embed iframe)">
              <textarea className={inputCls} rows={2} value={fd.mapEmbed ?? ''} onChange={(e) => setField('mapEmbed', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
            </Field>
          </>
        )}

        {/* ── FIRMS ── */}
        {activeTab === 'firms' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Our Firms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Field label="Section label (small caps)"><input className={inputCls} value={fd.sectionLabel ?? ''} onChange={(e) => setField('sectionLabel', e.target.value)} placeholder="Our Network" /></Field>
              <Field label="Section title"><input className={inputCls} value={fd.sectionTitle ?? ''} onChange={(e) => setField('sectionTitle', e.target.value)} placeholder="Our Firms" /></Field>
              <Field label="Subtitle paragraph"><input className={inputCls} value={fd.sectionSubtitle ?? ''} onChange={(e) => setField('sectionSubtitle', e.target.value)} /></Field>
            </div>
            <div className="flex justify-end mb-2">
              <button className={btnAdd} onClick={() => addArrayItem('firms', { name: '', tagline: '', description: '', phone: '', email: '', address: '', badge: '', color: 'green' })}><HiPlus className="w-4 h-4" />Add firm</button>
            </div>
            {(fd.firms ?? []).map((firm, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-3 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Firm #{i + 1}</span>
                  <div className="flex gap-1">
                    <button className={btnMove} onClick={() => moveArrayItem('firms', i, -1)}><HiChevronUp className="w-4 h-4" /></button>
                    <button className={btnMove} onClick={() => moveArrayItem('firms', i, 1)}><HiChevronDown className="w-4 h-4" /></button>
                    <button className={btnDanger} onClick={() => removeArrayItem('firms', i)}><HiTrash className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Firm name"><input className={inputCls} value={firm.name ?? ''} onChange={(e) => setArrayItem('firms', i, 'name', e.target.value)} placeholder="e.g. Madhuraj Emporium" /></Field>
                  <Field label="Tagline / badge text"><input className={inputCls} value={firm.tagline ?? ''} onChange={(e) => setArrayItem('firms', i, 'tagline', e.target.value)} placeholder="e.g. Premium Tea Traders since 1985" /></Field>
                </div>
                <Field label="Description">
                  <textarea className={inputCls} rows={3} value={firm.description ?? ''} onChange={(e) => setArrayItem('firms', i, 'description', e.target.value)} placeholder="Brief description of the firm…" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Phone"><input className={inputCls} value={firm.phone ?? ''} onChange={(e) => setArrayItem('firms', i, 'phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
                  <Field label="Email"><input className={inputCls} value={firm.email ?? ''} onChange={(e) => setArrayItem('firms', i, 'email', e.target.value)} placeholder="contact@example.com" /></Field>
                </div>
                <Field label="Address"><input className={inputCls} value={firm.address ?? ''} onChange={(e) => setArrayItem('firms', i, 'address', e.target.value)} placeholder="Street, City, State – PIN" /></Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Badge initials (2 chars shown on card)">
                    <input className={inputCls} value={firm.badge ?? ''} maxLength={3} onChange={(e) => setArrayItem('firms', i, 'badge', e.target.value)} placeholder="ME" />
                  </Field>
                  <Field label="Card accent colour">
                    <select className={inputCls} value={firm.color ?? 'green'} onChange={(e) => setArrayItem('firms', i, 'color', e.target.value)}>
                      <option value="green">Green</option>
                      <option value="gold">Gold</option>
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── FOOTER ── */}
        {activeTab === 'footer' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Footer</h3>
            <Field label="Tagline / description"><textarea className={inputCls} rows={2} value={fd.tagline ?? ''} onChange={(e) => setField('tagline', e.target.value)} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Instagram URL"><input className={inputCls} value={fd.instagram ?? ''} onChange={(e) => setField('instagram', e.target.value)} placeholder="https://instagram.com/..." /></Field>
              <Field label="Facebook URL"><input className={inputCls} value={fd.facebook ?? ''} onChange={(e) => setField('facebook', e.target.value)} placeholder="https://facebook.com/..." /></Field>
              <Field label="Twitter / X URL"><input className={inputCls} value={fd.twitter ?? ''} onChange={(e) => setField('twitter', e.target.value)} placeholder="https://x.com/..." /></Field>
              <Field label="WhatsApp number (with country code)"><input className={inputCls} value={fd.whatsapp ?? ''} onChange={(e) => setField('whatsapp', e.target.value)} placeholder="+919999999999" /></Field>
            </div>
          </>
        )}

        {/* ── SEO ── */}
        {activeTab === 'seo' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">SEO Settings</h3>
            <Field label="Site title (browser tab)"><input className={inputCls} value={fd.siteTitle ?? ''} onChange={(e) => setField('siteTitle', e.target.value)} /></Field>
            <Field label="Meta description (≤160 chars)">
              <textarea className={inputCls} rows={3} value={fd.description ?? ''} onChange={(e) => setField('description', e.target.value)} maxLength={160} />
              <p className="text-xs text-gray-400 mt-1">{(fd.description ?? '').length}/160</p>
            </Field>
            <Field label="Keywords (comma-separated)"><input className={inputCls} value={fd.keywords ?? ''} onChange={(e) => setField('keywords', e.target.value)} placeholder="Nio Tea, premium tea, black tea" /></Field>
          </>
        )}

        {/* ── REBRANDING ── */}
        {activeTab === 'rebranding' && (
          <>
            <h3 className="font-serif font-bold text-nio-green-900 text-lg">Rebranding Page</h3>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between bg-nio-green-50 border border-nio-green-200 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-nio-green-900">Show in Navbar</p>
                <p className="text-xs text-gray-500">Toggle the "Rebranding" link visibility in the navigation bar.</p>
              </div>
              <button
                type="button"
                onClick={() => setField('showInNav', !(fd.showInNav ?? true))}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  (fd.showInNav ?? true) ? 'bg-nio-green-700' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    (fd.showInNav ?? true) ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hero label (small caps)">
                <input className={inputCls} value={fd.heroLabel ?? ''} onChange={(e) => setField('heroLabel', e.target.value)} placeholder="Transform Your Brand" />
              </Field>
              <Field label="Hero title">
                <input className={inputCls} value={fd.heroTitle ?? ''} onChange={(e) => setField('heroTitle', e.target.value)} placeholder="Premium Tea Rebranding Services" />
              </Field>
            </div>
            <Field label="Hero subtitle">
              <textarea className={inputCls} rows={2} value={fd.heroSubtitle ?? ''} onChange={(e) => setField('heroSubtitle', e.target.value)} />
            </Field>
            <Field label="Main description paragraph">
              <textarea className={inputCls} rows={3} value={fd.description ?? ''} onChange={(e) => setField('description', e.target.value)} />
            </Field>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Services</label>
                <button className={btnAdd} onClick={() => addArrayItem('services', { icon: '⭐', title: '', desc: '' })}>
                  <HiPlus className="w-3.5 h-3.5" /> Add Service
                </button>
              </div>
              <div className="space-y-3">
                {(fd.services ?? []).map((svc, i) => (
                  <div key={i} className="bg-nio-cream rounded-xl p-3 space-y-2 border border-nio-green-100">
                    <div className="flex items-center gap-2">
                      <input className={`${inputCls} w-16 text-center text-xl`} value={svc.icon ?? ''} onChange={(e) => setArrayItem('services', i, 'icon', e.target.value)} placeholder="🎨" />
                      <input className={`${inputCls} flex-1`} value={svc.title ?? ''} onChange={(e) => setArrayItem('services', i, 'title', e.target.value)} placeholder="Service title" />
                      <div className="flex gap-1">
                        <button className={btnMove} onClick={() => moveArrayItem('services', i, -1)}><HiChevronUp className="w-4 h-4" /></button>
                        <button className={btnMove} onClick={() => moveArrayItem('services', i, 1)}><HiChevronDown className="w-4 h-4" /></button>
                        <button className={btnDanger} onClick={() => removeArrayItem('services', i)}><HiTrash className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <textarea className={inputCls} rows={2} value={svc.desc ?? ''} onChange={(e) => setArrayItem('services', i, 'desc', e.target.value)} placeholder="Short description" />
                  </div>
                ))}
              </div>
            </div>

            {/* Why points */}
            <Field label="'Why Choose Us' section title">
              <input className={inputCls} value={fd.whyTitle ?? ''} onChange={(e) => setField('whyTitle', e.target.value)} />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why Points</label>
                <button className={btnAdd} onClick={() => addArrayItem('whyPoints', '')}>
                  <HiPlus className="w-3.5 h-3.5" /> Add Point
                </button>
              </div>
              <div className="space-y-2">
                {(fd.whyPoints ?? []).map((pt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={pt}
                      onChange={(e) => {
                        const arr = deepClone(fd.whyPoints ?? []);
                        arr[i] = e.target.value;
                        setField('whyPoints', arr);
                      }}
                      placeholder="Why point…"
                    />
                    <button className={btnDanger} onClick={() => removeArrayItem('whyPoints', i)}><HiTrash className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="CTA title">
                <input className={inputCls} value={fd.ctaTitle ?? ''} onChange={(e) => setField('ctaTitle', e.target.value)} />
              </Field>
              <Field label="CTA subtitle">
                <input className={inputCls} value={fd.ctaSubtitle ?? ''} onChange={(e) => setField('ctaSubtitle', e.target.value)} />
              </Field>
            </div>
          </>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-4 border-t">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-nio-green-800 text-white text-sm font-semibold hover:bg-nio-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
              : <><HiSave className="w-5 h-5" />Save {tabs.find((t) => t.id === activeTab)?.label}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
