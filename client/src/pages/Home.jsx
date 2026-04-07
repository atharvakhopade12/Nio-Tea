import Hero from '../components/home/Hero';
import AboutSection from '../components/home/AboutSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import TeamSection from '../components/home/TeamSection';
import Testimonials from '../components/home/Testimonials';
import StatsSection from '../components/home/StatsSection';
import FirmsSection from '../components/home/FirmsSection';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <StatsSection />
      <FeaturedProducts />
      <TeamSection />
      <FirmsSection />
      <Testimonials />

      {/* CTA Section */}
      <section className="section-padding bg-nio-cream">
        <div className="container-custom text-center" data-aos="fade-up">
          <p className="text-nio-gold-600 text-xs tracking-[0.3em] uppercase mb-4">Ready to Explore?</p>
          <h2 className="section-title mb-4 max-w-2xl mx-auto">
            Discover the World of<br />
            <span className="text-gradient">Premium Indian Tea</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-4 mb-8 max-w-xl mx-auto">
            Browse our complete catalog of over 50 premium tea varieties — from classic Darjeeling to exotic blends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary">
              Browse All Products
            </Link>
            <Link to="/contact" className="btn-outline">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
