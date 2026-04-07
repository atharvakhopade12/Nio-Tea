import { useSiteContent } from '../../hooks/useSiteContent';

const FALLBACK_ITEMS = [
  { name: 'Vikram Joshi',  location: 'Mumbai',    rating: 5, text: "Nio Tea's Darjeeling First Flush is absolutely magical. The floral aroma, the golden hue — it's as close to the garden as you can get in your cup." },
  { name: 'Meera Pillai',  location: 'Bangalore', rating: 5, text: "I've tried dozens of tea brands but Nio Tea stands apart. The quality is consistently exceptional." },
  { name: 'Sanjay Kumar',  location: 'Delhi',     rating: 5, text: 'The masala chai blend is phenomenal — bold, balanced, and the warmth on a winter morning is unmatched.' },
  { name: 'Ritu Agarwal',  location: 'Kolkata',   rating: 5, text: "As a tea sommelier, I'm extremely selective. Nio Tea's sourcing standards are impeccable." },
];

export default function Testimonials() {
  const { data } = useSiteContent('testimonials', { sectionLabel: 'What People Say', sectionTitle: 'Loved by Tea Connoisseurs', items: FALLBACK_ITEMS });
  const items = data.items?.length ? data.items : FALLBACK_ITEMS;

  return (
    <section className="section-padding" style={{ background: 'linear-gradient(135deg, #1B3A18 0%, #2d5520 100%)' }}>
      <div className="container-custom">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-3">{data.sectionLabel || 'What People Say'}</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            {(data.sectionTitle || 'Loved by Tea Connoisseurs').replace('Connoisseurs', '')}
            <span className="text-nio-gold-400">Connoisseurs</span>
          </h2>
          <div className="gold-divider" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map(({ name, location, rating, text }, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className="flex mb-3">
                {[...Array(Math.min(rating || 5, 5))].map((_, j) => (
                  <span key={j} className="text-nio-gold-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-white/85 text-sm leading-relaxed mb-4 italic">"{text}"</p>
              <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
                <div className="w-8 h-8 rounded-full bg-nio-gold-500/30 flex items-center justify-center">
                  <span className="text-nio-gold-400 font-bold text-xs">{name?.[0]}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-xs">{name}</p>
                  <p className="text-nio-green-300 text-xs">{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

