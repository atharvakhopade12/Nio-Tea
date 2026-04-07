import { useSiteContent } from '../hooks/useSiteContent';

const FALLBACK_MISSION = [
  { icon: '🎯', title: 'Our Vision', desc: "To be India's most trusted and beloved premium tea brand — bringing the finest garden-fresh teas to every home, office, and café across the country and beyond." },
  { icon: '🌿', title: 'Our Mission', desc: 'To source, curate, and deliver exceptional teas that honour the artisans and ecosystems behind every leaf, while making premium quality accessible to all tea lovers.' },
  { icon: '🌟', title: 'Our Goals', desc: 'Partner with 25 sustainable tea estates across India, build a community of 100,000 passionate tea lovers, and establish Nio Tea as a global ambassador of Indian tea culture.' },
];

const FALLBACK_VALUES = [
  { icon: '🌱', title: 'Sustainability', desc: 'We partner only with gardens that practise responsible farming and care for their workers and the land.' },
  { icon: '🤝', title: 'Integrity', desc: 'Fair trade and transparent sourcing mean the people who grow our tea earn their rightful reward.' },
  { icon: '💎', title: 'Excellence', desc: 'Every product is rigorously tested before it reaches you. Good enough is never good enough for Nio Tea.' },
  { icon: '🧡', title: 'Community', desc: 'We celebrate the culture of tea — from harvest festivals to brewing workshops — as a shared human experience.' },
  { icon: '🔬', title: 'Innovation', desc: 'We constantly explore new flavours, blends, and experiences while staying rooted in traditional excellence.' },
  { icon: '🗺️', title: 'Heritage', desc: "India's 200-year tea legacy is our greatest inspiration and we carry it forward with honour and pride." },
];

const FALLBACK_STORY = [
  'Nio Tea was founded in 2020 by Arjun Mehta, a third-generation tea enthusiast whose grandfather was a legendary tea taster in Darjeeling. Growing up surrounded by the intoxicating aroma of fresh tea leaves and the wisdom of master blenders, Arjun developed an intimate understanding of what makes a truly exceptional cup.',
  'After spending 15 years working with tea estates across Darjeeling, Assam, Nilgiris, and Munnar, Arjun noticed a glaring gap: the most extraordinary teas rarely reached consumers who could truly appreciate them.',
  'Nio Tea was created to bridge that gap. Our name — "Nio" — is derived from the Sanskrit word for "clarity" and "purpose." We work directly with estate owners, participate in the harvest process, and oversee every stage of production.',
  'Today, Nio Tea partners with over 12 certified estates and offers more than 50 premium tea varieties to customers across India and internationally.',
];

export default function About() {
  const { data } = useSiteContent('about', {
    heroTitle: 'About Nio Tea',
    heroSubtitle: "Born from a deep love for India's extraordinary tea heritage, Nio Tea is more than a brand — it's a movement.",
    storyTitle: 'The Nio Tea Story',
    storyParagraphs: FALLBACK_STORY,
    mission: FALLBACK_MISSION,
    values: FALLBACK_VALUES,
  });

  const storyParagraphs = data.storyParagraphs?.length ? data.storyParagraphs : FALLBACK_STORY;
  const mission = data.mission?.length ? data.mission : FALLBACK_MISSION;
  const values = data.values?.length ? data.values : FALLBACK_VALUES;

  return (
    <div className="pt-20">
      {/* Hero */}
      <section
        className="relative py-28 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B3A18 0%, #2d5520 100%)' }}
      >
        <div className="container-custom text-center relative z-10">
          <p className="text-nio-gold-400 text-xs tracking-[0.3em] uppercase mb-4" data-aos="fade-up">Our Story</p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4" data-aos="fade-up" data-aos-delay="100">
            {data.heroTitle || 'About Nio Tea'}
          </h1>
          <div className="gold-divider" />
          <p className="text-nio-green-200 text-lg max-w-2xl mx-auto mt-4" data-aos="fade-up" data-aos-delay="200">
            {data.heroSubtitle || "Born from a deep love for India's extraordinary tea heritage, Nio Tea is more than a brand — it's a movement."}
          </p>
        </div>
        <svg className="absolute bottom-0 left-0 right-0 fill-white" viewBox="0 0 1440 60">
          <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* Our Story */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto" data-aos="fade-up">
            <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-4 text-center">How It Began</p>
            <h2 className="section-title text-center mb-6">{data.storyTitle || 'The Nio Tea Story'}</h2>
            <div className="gold-divider" />
            <div className="mt-8 space-y-5 text-nio-green-700 text-base leading-relaxed">
              {storyParagraphs.map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Goals */}
      <section className="section-padding bg-nio-cream">
        <div className="container-custom">
          <div className="text-center mb-14" data-aos="fade-up">
            <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-3">Purpose & Direction</p>
            <h2 className="section-title">Vision · Mission · <span className="text-gradient">Goals</span></h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mission.map(({ icon, title, desc }, i) => (
              <div key={i} className="card p-8 text-center group" data-aos="fade-up" data-aos-delay={i * 150}>
                <div className="text-5xl mb-5">{icon}</div>
                <h3 className="font-serif font-bold text-nio-green-900 text-xl mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14" data-aos="fade-up">
            <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-3">What We Stand For</p>
            <h2 className="section-title">Our Core <span className="text-gradient">Values</span></h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map(({ icon, title, desc }, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-2xl border border-nio-green-100 hover:border-nio-green-300 hover:shadow-nio transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={i * 80}
              >
                <div className="text-3xl shrink-0">{icon}</div>
                <div>
                  <h4 className="font-serif font-bold text-nio-green-900 mb-1">{title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
