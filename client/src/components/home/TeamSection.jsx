import { useSiteContent } from '../../hooks/useSiteContent';

const FALLBACK_MEMBERS = [
  { name: 'Arjun Mehta',  role: 'Founder & Tea Master',   bio: '20+ years of expertise in tea cultivation and blending across Darjeeling estates.', initials: 'AM' },
  { name: 'Priya Sharma', role: 'Head of Sourcing',        bio: 'Passionate about discovering rare single-origin teas from remote Indian gardens.',  initials: 'PS' },
  { name: 'Rahul Nair',   role: 'Quality & Operations',    bio: 'Ensures every batch meets our uncompromising standards from garden to cup.',         initials: 'RN' },
  { name: 'Ananya Das',   role: 'Brand & Experience',      bio: 'Crafts the Nio Tea story and curates memorable experiences for our community.',      initials: 'AD' },
];

const AVATAR_COLORS = ['bg-nio-green-700', 'bg-nio-gold-600', 'bg-nio-green-800', 'bg-amber-700', 'bg-nio-green-600', 'bg-amber-600'];

export default function TeamSection() {
  const { data } = useSiteContent('team', {
    sectionLabel: 'The People Behind',
    sectionTitle: 'Meet Our Team',
    sectionSubtitle: 'A passionate group of tea lovers dedicated to bringing you the finest brews.',
    members: FALLBACK_MEMBERS,
  });

  const members = data.members?.length ? data.members : FALLBACK_MEMBERS;

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-14" data-aos="fade-up">
          <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-3">{data.sectionLabel || 'The People Behind'}</p>
          <h2 className="section-title">
            {data.sectionTitle || 'Meet Our'} <span className="text-gradient">Team</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4 max-w-xl mx-auto">{data.sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {members.map(({ name, role, bio, initials, image }, i) => (
            <div
              key={i}
              className="card group text-center p-6"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className={`w-20 h-20 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center mx-auto mb-4 shadow-nio group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
                {image ? (
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-serif font-bold text-2xl">
                    {initials || name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <h3 className="font-serif font-bold text-nio-green-900 text-lg mb-1">{name}</h3>
              <p className="text-nio-gold-600 text-xs font-medium tracking-wide mb-3">{role}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

