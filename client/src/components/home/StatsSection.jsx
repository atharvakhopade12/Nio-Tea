import { useSiteContent } from '../../hooks/useSiteContent';

const FALLBACK = [
  { value: '50+', label: 'Tea Varieties' },
  { value: '12',  label: 'Garden Sources' },
  { value: '10K+', label: 'Happy Customers' },
  { value: '6',   label: 'Awards Won' },
];

export default function StatsSection() {
  const { data } = useSiteContent('stats', { items: FALLBACK });
  const items = data.items?.length ? data.items : FALLBACK;

  return (
    <section className="bg-nio-gold-500 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ value, label }, i) => (
            <div key={i} className="text-center" data-aos="zoom-in" data-aos-delay={i * 100}>
              <p className="text-4xl md:text-5xl font-serif font-bold text-white mb-1">{value}</p>
              <p className="text-nio-green-900 text-sm font-medium tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

