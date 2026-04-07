import { HiPhone, HiMail, HiLocationMarker, HiOfficeBuilding } from 'react-icons/hi';
import { useSiteContent } from '../../hooks/useSiteContent';

const FALLBACK = {
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
};

const COLOR_MAP = {
  green: {
    badge:   'bg-nio-green-800 text-white',
    accent:  'text-nio-green-700',
    border:  'border-nio-green-100',
    hover:   'hover:border-nio-green-300 hover:shadow-nio',
    tag:     'bg-nio-green-50 text-nio-green-700 border-nio-green-100',
  },
  gold: {
    badge:   'bg-nio-gold-500 text-white',
    accent:  'text-nio-gold-600',
    border:  'border-amber-100',
    hover:   'hover:border-amber-300 hover:shadow-gold',
    tag:     'bg-amber-50 text-amber-700 border-amber-100',
  },
};

const fallbackColor = (i) => (i % 2 === 0 ? 'green' : 'gold');

export default function FirmsSection() {
  const { data } = useSiteContent('firms', FALLBACK);

  const firms    = data.firms?.length ? data.firms : FALLBACK.firms;
  const label    = data.sectionLabel    || FALLBACK.sectionLabel;
  const title    = data.sectionTitle    || FALLBACK.sectionTitle;
  const subtitle = data.sectionSubtitle || FALLBACK.sectionSubtitle;

  return (
    <section className="section-padding bg-nio-cream">
      <div className="container-custom">

        {/* ── Header ── */}
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-3">{label}</p>
          <h2 className="section-title">
            {title.includes(' ') ? (
              <>
                {title.split(' ').slice(0, -1).join(' ')}{' '}
                <span className="text-gradient">{title.split(' ').slice(-1)[0]}</span>
              </>
            ) : (
              <span className="text-gradient">{title}</span>
            )}
          </h2>
          <div className="gold-divider" />
          {subtitle && (
            <p className="section-subtitle mt-4 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* ── Firm cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {firms.map((firm, i) => {
            const c = COLOR_MAP[firm.color || fallbackColor(i)];
            const badge = firm.badge || firm.name?.slice(0, 2).toUpperCase();

            return (
              <div
                key={i}
                className={`bg-white rounded-2xl border ${c.border} ${c.hover} p-8 transition-all duration-300 group`}
                data-aos="fade-up"
                data-aos-delay={i * 120}
              >
                {/* Firm header */}
                <div className="flex items-start gap-5 mb-6">
                  <div className={`w-16 h-16 rounded-xl ${c.badge} flex items-center justify-center shrink-0 shadow-md font-serif font-bold text-xl group-hover:scale-105 transition-transform duration-300`}>
                    {badge}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-nio-green-900 text-xl leading-tight">
                      {firm.name}
                    </h3>
                    {firm.tagline && (
                      <span className={`inline-block mt-1.5 text-xs font-medium px-3 py-1 rounded-full border ${c.tag}`}>
                        {firm.tagline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {firm.description && (
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 border-b border-gray-100 pb-6">
                    {firm.description}
                  </p>
                )}

                {/* Contact details */}
                <div className="space-y-3">
                  {firm.phone && (
                    <a href={`tel:${firm.phone.replace(/\s/g, '')}`}
                      className={`flex items-center gap-3 text-sm ${c.accent} hover:underline group/link`}>
                      <HiPhone className="w-4 h-4 shrink-0" />
                      <span>{firm.phone}</span>
                    </a>
                  )}
                  {firm.email && (
                    <a href={`mailto:${firm.email}`}
                      className={`flex items-center gap-3 text-sm ${c.accent} hover:underline`}>
                      <HiMail className="w-4 h-4 shrink-0" />
                      <span>{firm.email}</span>
                    </a>
                  )}
                  {firm.address && (
                    <div className="flex items-start gap-3 text-sm text-gray-500">
                      <HiLocationMarker className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{firm.address}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom accent ── */}
        <div className="flex justify-center mt-12" data-aos="fade-up">
          <div className="flex items-center gap-3 text-xs text-gray-400 tracking-wide">
            <HiOfficeBuilding className="w-4 h-4 text-nio-gold-500" />
            <span>All firms operate under the Nio Tea trading network</span>
            <HiOfficeBuilding className="w-4 h-4 text-nio-gold-500" />
          </div>
        </div>

      </div>
    </section>
  );
}
