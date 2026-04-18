const SiteContent = require('../models/SiteContent');
const supabase = require('../config/supabase');
const sharp = require('sharp');

const CONTENT_BUCKET = process.env.SUPABASE_CONTENT_BUCKET || 'content';

const uploadToSupabaseStorage = async (buffer, objectPath) => {
  const { error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .upload(objectPath, buffer, {
      contentType: 'image/webp',
      upsert: false,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(CONTENT_BUCKET).getPublicUrl(objectPath);
  return {
    secure_url: data.publicUrl,
    public_id: `supabase/${CONTENT_BUCKET}/${objectPath}`,
  };
};

// Default content so pages always have something to show
const DEFAULTS = {
  hero: {
    subTagline: 'Est. 2020 • Premium Tea Estate',
    tagline: 'Where every leaf tells a story of nature, tradition, and excellence.',
    ctaPrimary: 'Explore Our Teas',
    ctaSecondary: 'Our Story',
  },
  about: {
    heroTitle: 'About Nio Tea',
    heroSubtitle: "Born from a deep love for India's extraordinary tea heritage, Nio Tea is more than a brand — it's a movement.",
    storyTitle: 'The Nio Tea Story',
    storyParagraphs: [
      "Nio Tea was founded in 2020 by Arjun Mehta, a third-generation tea enthusiast whose grandfather was a legendary tea taster in Darjeeling.",
      "After spending 15 years working with tea estates across Darjeeling, Assam, Nilgiris, and Munnar, Arjun noticed a glaring gap: the most extraordinary teas rarely reached consumers who could truly appreciate them.",
      "Nio Tea was created to bridge that gap. Our name — \"Nio\" — is derived from the Sanskrit word for \"clarity\" and \"purpose.\"",
      "Today, Nio Tea partners with over 12 certified estates and offers more than 50 premium tea varieties to customers across India and internationally.",
    ],
    mission: [
      { icon: '🎯', title: 'Our Vision', desc: "To be India's most trusted and beloved premium tea brand — bringing the finest garden-fresh teas to every home." },
      { icon: '🌿', title: 'Our Mission', desc: 'To source, curate, and deliver exceptional teas that honour the artisans and ecosystems behind every leaf.' },
      { icon: '🌟', title: 'Our Goals', desc: 'Partner with 25 sustainable tea estates across India and establish Nio Tea as a global ambassador of Indian tea culture.' },
    ],
    values: [
      { icon: '🌱', title: 'Sustainability', desc: 'We partner only with gardens that practise responsible farming.' },
      { icon: '🤝', title: 'Integrity', desc: 'Fair trade and transparent sourcing mean growers earn their rightful reward.' },
      { icon: '💎', title: 'Excellence', desc: 'Every product is rigorously tested before it reaches you.' },
      { icon: '🧡', title: 'Community', desc: 'We celebrate the culture of tea as a shared human experience.' },
      { icon: '🔬', title: 'Innovation', desc: 'We constantly explore new flavours while staying rooted in traditional excellence.' },
      { icon: '🗺️', title: 'Heritage', desc: "India's 200-year tea legacy is our greatest inspiration." },
    ],
  },
  team: {
    sectionLabel: 'The People Behind',
    sectionTitle: 'Meet Our Team',
    sectionSubtitle: 'A passionate group of tea lovers dedicated to bringing you the finest brews.',
    members: [
      { name: 'Arjun Mehta', role: 'Founder & Tea Master', bio: '20+ years of expertise in tea cultivation and blending across Darjeeling estates.', image: '', initials: 'AM' },
      { name: 'Priya Sharma', role: 'Head of Sourcing', bio: 'Passionate about discovering rare single-origin teas from remote Indian gardens.', image: '', initials: 'PS' },
      { name: 'Rahul Nair', role: 'Quality & Operations', bio: 'Ensures every batch meets our uncompromising standards from garden to cup.', image: '', initials: 'RN' },
      { name: 'Ananya Das', role: 'Brand & Experience', bio: 'Crafts the Nio Tea story and curates memorable experiences for our community.', image: '', initials: 'AD' },
    ],
  },
  stats: {
    items: [
      { value: '50+', label: 'Tea Varieties' },
      { value: '12', label: 'Garden Sources' },
      { value: '10K+', label: 'Happy Customers' },
      { value: '6', label: 'Awards Won' },
    ],
  },
  testimonials: {
    sectionLabel: 'What People Say',
    sectionTitle: 'Loved by Tea Connoisseurs',
    items: [
      { name: 'Vikram Joshi', location: 'Mumbai', rating: 5, text: "Nio Tea's Darjeeling First Flush is absolutely magical. The floral aroma, the golden hue — it's as close to the garden as you can get in your cup." },
      { name: 'Meera Pillai', location: 'Bangalore', rating: 5, text: "I've tried dozens of tea brands but Nio Tea stands apart. The quality is consistently exceptional." },
      { name: 'Sanjay Kumar', location: 'Delhi', rating: 5, text: 'The masala chai blend is phenomenal — bold, balanced, and the warmth on a winter morning is unmatched.' },
      { name: 'Ritu Agarwal', location: 'Kolkata', rating: 5, text: "As a tea sommelier, I'm extremely selective. Nio Tea's sourcing standards are impeccable." },
    ],
  },
  contact: {
    address: '123 Garden Lane, Darjeeling, West Bengal – 734101, India',
    phone: '+91 99999 99999',
    email: 'hello@niotea.com',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3569.937!2d88.263!3d27.041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDAyJzI4LjAiTiA4OMKwMTUnNTYuMCJF!5e0!3m2!1sen!2sin!4v1',
    heroSubtitle: "Have a question, bulk enquiry, or just want to talk tea? We'd love to hear from you.",
    formSubtitle: "Whether you're a retailer, distributor, or a tea lover, our team is here to help. We typically respond within 24 hours.",
  },
  footer: {
    tagline: "India's finest premium tea — from garden to your cup.",
    copyrightYear: new Date().getFullYear().toString(),
    socialLinks: { instagram: '', facebook: '', twitter: '', whatsapp: '' },
  },
  seo: {
    siteTitle: 'Nio Tea — Premium Tea Trading Company',
    description: 'Nio Tea brings you the finest handpicked teas from the best tea gardens of India.',
    keywords: 'Nio Tea, premium tea, black tea, green tea, Indian tea, Darjeeling tea',
  },
  firms: {
    sectionLabel: 'Our Network',
    sectionTitle: 'Our Firms',
    sectionSubtitle: 'Trusted trading partners and affiliated companies working together to bring the finest teas to you.',
    firms: [
      {
        name: 'Madhuraj Emporium',
        tagline: 'Premium Tea Traders since 1985',
        description: 'Madhuraj Emporium is a distinguished tea trading house specialising in high-grade Darjeeling and Assam teas. With decades of expertise, we ensure every batch meets stringent quality standards before reaching our customers.',
        phone: '+91 98765 43210',
        email: 'contact@madhurajemporium.com',
        address: '12, Tea Traders Lane, Darjeeling, West Bengal – 734101',
        badge: 'ME',
        color: 'green',
      },
      {
        name: 'PM Trading Company',
        tagline: 'Wholesale & Export Specialists',
        description: 'PM Trading Company is a leading wholesale and export firm with a strong presence in domestic and international tea markets. We bridge premium Indian tea estates with buyers across the globe.',
        phone: '+91 98765 12345',
        email: 'info@pmtradingco.com',
        address: '45, Commerce Street, Kolkata, West Bengal – 700001',
        badge: 'PM',
        color: 'gold',
      },
    ],
  },
  homeAbout: {
    label: 'Our Philosophy',
    title: 'Crafted with Passion & Purpose',
    subtitle: "Nio Tea was born from a deep reverence for India's extraordinary tea heritage. From the misty hills of Darjeeling to the lush valleys of Assam, we source only the most exceptional leaves.",
    body: 'We believe tea is more than a beverage — it is a ritual, a moment of stillness in the rush of life. Our mission is to bring that experience to every household with uncompromising quality and care.',
    values: [
      { icon: '🌱', title: 'Sustainability', desc: 'Ethically sourced from eco-friendly gardens that care for the environment.' },
      { icon: '✋', title: 'Handpicked', desc: 'Every leaf hand-selected by experienced tea artisans for superior quality.' },
      { icon: '🏆', title: 'Premium Quality', desc: 'Rigorous quality checks ensure only the finest teas reach your cup.' },
      { icon: '❤️', title: 'Pure Heritage', desc: 'Rooted in centuries of Indian tea tradition, delivered with modern excellence.' },
    ],
  },
  rebranding: {
    showInNav: true,
    heroLabel: 'Transform Your Brand',
    heroTitle: 'Premium Tea Rebranding Services',
    heroSubtitle: 'We help businesses reimagine their tea products — from packaging and identity to formulation — with expertise trusted by leading distributors across India.',
    description: 'Nio Tea offers end-to-end rebranding solutions for tea businesses, distributors, and retailers. Whether you want to create a private label, refresh your existing packaging, or launch a new tea range under your brand, our team of experts will guide you every step of the way.',
    services: [
      { icon: '🎨', title: 'Packaging Design', desc: 'Custom packaging that tells your brand story — from pouches and caddies to gift boxes and premium tins.' },
      { icon: '🏷️', title: 'Private Labelling', desc: "Launch your own premium tea line using Nio Tea's curated blends and expert-quality standards." },
      { icon: '🍃', title: 'Custom Blending', desc: 'Signature tea blends crafted exclusively for your brand — unique flavours that set you apart.' },
      { icon: '📋', title: 'Brand Identity', desc: 'Logo, colour palette, typography and messaging tailored specifically for the tea market.' },
      { icon: '🚀', title: 'Market Launch Support', desc: 'From strategy to shelf — we support your go-to-market plan with industry expertise.' },
      { icon: '♻️', title: 'Sustainable Options', desc: 'Eco-friendly packaging and sustainable sourcing options to align with modern consumer values.' },
    ],
    whyTitle: 'Why Choose Nio Tea for Rebranding?',
    whyPoints: [
      'Over 5 years of experience in premium tea branding and distribution',
      'Access to 50+ curated tea varieties from certified garden sources',
      'End-to-end service from concept to delivery',
      'Competitive pricing for bulk and wholesale orders',
      'Dedicated account manager throughout the project',
    ],
    ctaTitle: 'Ready to Transform Your Brand?',
    ctaSubtitle: 'Let\'s talk. Our rebranding specialists are ready to help you create something extraordinary.',
  },
};

// @desc  Get a section (public)
// @route GET /api/content/:section
const getSection = async (req, res) => {
  const { section } = req.params;
  const doc = await SiteContent.findOne({ section });
  if (!doc) {
    // Return defaults if not yet saved to DB
    return res.status(200).json({ success: true, section, data: DEFAULTS[section] || {} });
  }
  res.status(200).json({ success: true, section, data: doc.data });
};

// @desc  Get ALL sections at once (public)
// @route GET /api/content
const getAllContent = async (req, res) => {
  const docs = await SiteContent.findAll();
  const result = {};
  // Seed defaults for anything not yet in DB
  Object.keys(DEFAULTS).forEach((k) => { result[k] = DEFAULTS[k]; });
  docs.forEach((d) => { result[d.section] = d.data; });
  res.status(200).json({ success: true, data: result });
};

// @desc  Upsert a section (admin)
// @route PUT /api/admin/content/:section
const updateSection = async (req, res) => {
  const { section } = req.params;
  const validSections = Object.keys(DEFAULTS);
  if (!validSections.includes(section)) {
    return res.status(400).json({ success: false, message: `Invalid section "${section}".` });
  }
  const doc = await SiteContent.upsertSection(section, req.body.data);
  res.status(200).json({ success: true, section, data: doc.data });
};

// @desc  Upload a content image (team member photo, etc.)
// @route POST /api/admin/content/upload-image
const uploadContentImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file provided.' });

  const processed = await sharp(req.file.buffer)
    .resize({ width: 900, height: 900, fit: 'contain', withoutEnlargement: true, background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 90 })
    .toBuffer();

  const objectPath = `team/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`;
  const result = await uploadToSupabaseStorage(processed, objectPath);

  res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
};

module.exports = { getSection, getAllContent, updateSection, uploadContentImage };
