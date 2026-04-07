import { Link } from 'react-router-dom';
import { useSiteContent } from '../../hooks/useSiteContent';

const FALLBACK = {
  label: 'Our Philosophy',
  title: 'Crafted with',
  titleHighlight: 'Passion & Purpose',
  subtitle: "Nio Tea was born from a deep reverence for India's extraordinary tea heritage. From the misty hills of Darjeeling to the lush valleys of Assam, we source only the most exceptional leaves.",
  body: 'We believe tea is more than a beverage — it is a ritual, a moment of stillness in the rush of life. Our mission is to bring that experience to every household with uncompromising quality and care.',
  ctaText: 'Discover Our Story',
  values: [
    { icon: '🌱', title: 'Sustainability', desc: 'Ethically sourced from eco-friendly gardens that care for the environment.' },
    { icon: '✋', title: 'Handpicked', desc: 'Every leaf hand-selected by experienced tea artisans for superior quality.' },
    { icon: '🏆', title: 'Premium Quality', desc: 'Rigorous quality checks ensure only the finest teas reach your cup.' },
    { icon: '❤️', title: 'Pure Heritage', desc: 'Rooted in centuries of Indian tea tradition, delivered with modern excellence.' },
  ],
};

export default function AboutSection() {
  const { data } = useSiteContent('homeAbout', FALLBACK);
  const values = data.values?.length ? data.values : FALLBACK.values;

  return (
    <section className="section-padding bg-white leaf-bg relative">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div data-aos="fade-right">
            <p className="text-nio-gold-600 text-xs font-sans tracking-[0.3em] uppercase mb-4">{data.label || FALLBACK.label}</p>
            <h2 className="section-title mb-4">
              {data.title || FALLBACK.title}<br />
              <span className="text-gradient italic">{data.titleHighlight || FALLBACK.titleHighlight}</span>
            </h2>
            <div className="gold-divider ml-0 mb-6" />
            <p className="section-subtitle mb-5">{data.subtitle || FALLBACK.subtitle}</p>
            <p className="text-nio-green-700 text-base leading-relaxed mb-8">{data.body || FALLBACK.body}</p>
            <Link to="/about" className="btn-primary">{data.ctaText || FALLBACK.ctaText}</Link>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-5" data-aos="fade-left" data-aos-delay="200">
            {values.map(({ icon, title, desc }, i) => (
              <div
                key={i}
                className="bg-nio-cream rounded-2xl p-5 border border-nio-green-100 hover:shadow-nio transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h4 className="font-serif font-bold text-nio-green-900 mb-1.5 group-hover:text-nio-green-700 transition-colors">{title}</h4>
                <p className="text-nb-green-600 text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
