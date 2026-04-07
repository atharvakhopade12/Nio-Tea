import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiCheckCircle } from 'react-icons/hi';
import { useSiteContent } from '../hooks/useSiteContent';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const { data } = useSiteContent('contact', {
    heroSubtitle: "Have a question, bulk enquiry, or just want to talk tea? We'd love to hear from you.",
    formSubtitle: 'Whether you\'re a retailer, distributor, or simply a tea lover looking for your next favourite brew, our team is here to help. We typically respond within 24 hours.',
    address: '123 Garden Lane, Darjeeling, West Bengal – 734101, India',
    phone: '+91 99999 99999',
    email: 'hello@niotea.com',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3569.937!2d88.263!3d27.041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDAyJzI4LjAiTiA4OMKwMTUnNTYuMCJF!5e0!3m2!1sen!2sin!4v1',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('/enquiries/contact', form);
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const contactItems = [
    { icon: HiLocationMarker, label: 'Address', value: data.address || '123 Garden Lane, Darjeeling' },
    { icon: HiPhone, label: 'Phone', value: data.phone || '+91 99999 99999', href: `tel:${(data.phone || '').replace(/\s/g,'')}` },
    { icon: HiMail, label: 'Email', value: data.email || 'hello@niotea.com', href: `mailto:${data.email || 'hello@niotea.com'}` },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section
        className="py-24 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A18, #2d5520)' }}
      >
        <div className="container-custom relative z-10">
          <p className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-3" data-aos="fade-up">Reach Out</p>
          <h1 className="text-5xl font-serif font-bold text-white mb-3" data-aos="fade-up" data-aos-delay="100">Contact Us</h1>
          <div className="gold-divider" />
          <p className="text-nio-green-200 mt-4 max-w-lg mx-auto" data-aos="fade-up" data-aos-delay="200">
            {data.heroSubtitle || "Have a question, bulk enquiry, or just want to talk tea? We'd love to hear from you."}
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 right-0 fill-white" viewBox="0 0 1440 40">
          <path d="M0,20 C480,40 960,0 1440,20 L1440,40 L0,40 Z" />
        </svg>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Info */}
            <div data-aos="fade-right">
              <h2 className="section-title mb-6">Get in <span className="text-gradient">Touch</span></h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                {data.formSubtitle || "Whether you're a retailer, distributor, or simply a tea lover looking for your next favourite brew, our team is here to help. We typically respond within 24 hours."}
              </p>

              <div className="space-y-5">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4 p-4 rounded-xl bg-nio-cream border border-nio-green-100">
                    <div className="w-10 h-10 rounded-xl bg-nio-green-800 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-nio-gold-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-nio-green-800 font-medium hover:text-nio-gold-600 transition-colors">{value}</a>
                      ) : (
                        <p className="text-nio-green-800 font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="mt-8 rounded-2xl overflow-hidden h-56 bg-nio-cream border border-nio-green-100 flex items-center justify-center relative">
                {data.mapEmbed ? (
                  <iframe
                    title="Nio Tea Location"
                    src={data.mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="grayscale opacity-80"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Map not configured</p>
                )}
              </div>
            </div>

            {/* Form */}
            <div data-aos="fade-left">
              <div className="bg-nio-cream rounded-2xl p-8 border border-nio-green-100">
                <h3 className="font-serif font-bold text-nio-green-900 text-2xl mb-6">Send a Message</h3>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                      <HiCheckCircle className="w-16 h-16 text-nio-green-600 mx-auto mb-4" />
                      <h4 className="font-serif font-bold text-nio-green-900 text-xl mb-2">Message Sent!</h4>
                      <p className="text-gray-500 text-sm mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                      <button onClick={() => setSent(false)} className="btn-primary text-sm py-2 px-6">Send Another Message</button>
                    </motion.div>
                  ) : (
                    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Your Name *</label>
                          <input name="name" value={form.name} onChange={handleChange} required placeholder="Arjun Mehta" className="input-field" />
                        </div>
                        <div>
                          <label className="label">Phone Number</label>
                          <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" className="input-field" />
                        </div>
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className="input-field" />
                      </div>
                      <div>
                        <label className="label">Subject</label>
                        <input name="subject" value={form.subject} onChange={handleChange} placeholder="Bulk Order Enquiry / Partnership / General" className="input-field" />
                      </div>
                      <div>
                        <label className="label">Message *</label>
                        <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Tell us what you need..." className="input-field resize-none" />
                      </div>
                      {error && <p className="text-red-500 text-sm">{error}</p>}
                      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? 'Sending...' : 'Send Message'}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
