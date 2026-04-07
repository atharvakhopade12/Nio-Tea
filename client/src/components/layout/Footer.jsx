import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { useSiteContent } from '../../hooks/useSiteContent';

const footerLinks = {
  Company: [
    { to: '/about', label: 'About Us' },
    { to: '/products', label: 'Our Products' },
    { to: '/contact', label: 'Contact' },
  ],
  Products: [
    { to: '/products?category=Black Tea', label: 'Black Tea' },
    { to: '/products?category=Green Tea', label: 'Green Tea' },
    { to: '/products?category=White Tea', label: 'White Tea' },
    { to: '/products?category=Herbal Tea', label: 'Herbal Tea' },
    { to: '/products?category=Specialty Tea', label: 'Specialty Tea' },
  ],
};

export default function Footer() {
  const { data: footerData } = useSiteContent('footer', {
    tagline: "India's finest premium tea — from garden to your cup.",
    instagram: '',
    facebook: '',
    twitter: '',
    whatsapp: '',
  });

  const { data: contactData } = useSiteContent('contact', {
    address: '123 Garden Lane, Darjeeling, West Bengal – 734101, India',
    phone: '+91 99999 99999',
    email: 'hello@niotea.com',
  });

  const socials = [
    footerData.instagram && { Icon: FaInstagram, href: footerData.instagram, label: 'Instagram' },
    footerData.facebook  && { Icon: FaFacebookF,  href: footerData.facebook,  label: 'Facebook' },
    footerData.twitter   && { Icon: FaTwitter,    href: footerData.twitter,   label: 'Twitter' },
    footerData.whatsapp  && { Icon: FaWhatsapp,   href: `https://wa.me/${footerData.whatsapp.replace(/\D/g, '')}`, label: 'WhatsApp' },
  ].filter(Boolean);

  // Fallback socials for demo
  const displaySocials = socials.length > 0 ? socials : [
    { Icon: FaInstagram, href: '#', label: 'Instagram' },
    { Icon: FaFacebookF, href: '#', label: 'Facebook' },
    { Icon: FaTwitter,   href: '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-nio-green-950 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-nio-gold-500 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6 fill-white">
                  <path d="M20 4C12 4 6 12 6 20c0 4 2 8 5 10.5C13 32 16 33 20 33s7-1 9-2.5C32 28 34 24 34 20c0-8-6-16-14-16zm0 2c3 0 6 1.5 8.5 4-3 .5-6 2-8.5 4.5C17.5 12 14.5 10.5 11.5 10c2.5-2.5 5.5-4 8.5-4zm0 27c-3.5 0-6.5-1-8.5-3 1-3 3-6 6-8 1-1 2-1.7 2.5-2.5.5.8 1.5 1.5 2.5 2.5 3 2 5 5 6 8-2 2-5 3-8.5 3z" />
                </svg>
              </div>
              <div>
                <span className="font-display font-semibold text-xl text-white">Nio Tea</span>
                <p className="text-xs text-nio-gold-400 tracking-widest uppercase">Premium Teas</p>
              </div>
            </div>
            <p className="text-nio-green-300 text-sm leading-relaxed mb-6">
              {footerData.tagline || "Bringing the finest handpicked teas from the best gardens of India."}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {displaySocials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-nio-green-800 flex items-center justify-center text-nio-green-300 hover:bg-nio-gold-500 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-serif font-bold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ to, label }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-nio-green-300 text-sm hover:text-nio-gold-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <HiLocationMarker className="w-4 h-4 text-nio-gold-400 mt-0.5 shrink-0" />
                <span className="text-nio-green-300 text-sm">{contactData.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <HiPhone className="w-4 h-4 text-nio-gold-400 shrink-0" />
                <a href={`tel:${contactData.phone}`} className="text-nio-green-300 text-sm hover:text-nio-gold-400 transition-colors">
                  {contactData.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <HiMail className="w-4 h-4 text-nio-gold-400 shrink-0" />
                <a href={`mailto:${contactData.email}`} className="text-nio-green-300 text-sm hover:text-nio-gold-400 transition-colors">
                  {contactData.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-nio-green-800">
        <div className="container-custom py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-nio-green-400 text-xs">
            © {new Date().getFullYear()} Nio Tea. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-nio-green-400">
            <span>Crafted with ♥ in India</span>
            <span>•</span>
            <Link to="/contact" className="hover:text-nio-gold-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-nio-gold-400 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
