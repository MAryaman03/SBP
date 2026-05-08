import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Award, Users } from 'lucide-react';
import ServiceCard from '../components/ui/ServiceCard';
import TestimonialCard from '../components/ui/TestimonialCard';
import { useServices } from '../hooks/useServices';
import { useReviews } from '../hooks/useReviews';
import ReviewModal from '../components/ReviewModal';
import homeCardImg from '../assets/homePageCard copy.png';
import './Home.css';

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.12 } },
};

const stats = [
  { icon: <Users size={28} />, value: '10,000+', label: 'Happy Clients' },
  { icon: <Award size={28} />, value: '15+', label: 'Years of Excellence' },
  { icon: <Sparkles size={28} />, value: '50+', label: 'Expert Stylists' },
  { icon: <Clock size={28} />, value: '99%', label: 'Satisfaction Rate' },
];

export default function Home() {
  const { services } = useServices({ featured: true });
  const { reviews } = useReviews();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <main className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__overlay" />
        <div className="hero__content container">
          <motion.p
            className="section-label"
            initial={{ opacity: 0, letterSpacing: '8px' }}
            animate={{ opacity: 1, letterSpacing: '4px' }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Premium Salon & Spa
          </motion.p>

          <motion.h1
            className="hero__title display-title"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            Beauty Is An
            <br />
            <em className="hero__title-italic">Art Form</em>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Indulge in personalized treatments crafted by Purnima Mohanty.
            <br />
            Your transformation begins here.
          </motion.p>

          <motion.div
            className="hero__cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            <Link to="/booking" className="btn btn-primary btn-lg">
              Book an Appointment <ArrowRight size={18} />
            </Link>
            <Link to="/services" className="btn btn-outline btn-lg hero__cta-secondary">
              Explore Services
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="hero__scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
        >
          <div className="hero__scroll-line" />
          <span>SCROLL</span>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <Section className="stats-section bg-dark">
        <motion.div className="stats-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {stats.map(({ icon, value, label }) => (
            <motion.div key={label} className="stat-card" variants={fadeUp}>
              <div className="stat-card__icon">{icon}</div>
              <h3 className="stat-card__value">{value}</h3>
              <p className="stat-card__label">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── Featured Services ── */}
      <Section>
        <motion.div className="section-header text-center" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="section-label">What We Offer</p>
          <span className="gold-divider center" />
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8 }}>Our Signature Services</h2>
          <p className="section-desc">
            From precision cuts to luxurious spa treatments, every service is tailored to perfection.
          </p>
        </motion.div>

        <motion.div
          className="grid-3 mt-48"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {(services.length > 0 ? services : PLACEHOLDER_SERVICES).slice(0, 3).map((s) => (
            <motion.div key={s._id || s.name} variants={fadeUp}>
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="text-center mt-32">
          <Link 
            to="/services" 
            className="btn btn-primary inline-flex items-center gap-2"
          >
            View All Services <ArrowRight size={18} />
          </Link>
        </motion.div>
      </Section>

      {/* ── Why Choose Us ── */}
      <Section className="bg-cream-2">
        <div className="why-grid">
          <motion.div
            className="why-image"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="why-image__inner" style={{ backgroundImage: `url(${homeCardImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="why-image__badge">
              <Sparkles size={20} className="text-gold" />
              <span>Est. 2009</span>
            </div>
          </motion.div>

          <motion.div
            className="why-content"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.p className="section-label" variants={fadeUp}>Why Snigdha Beauty Parlour</motion.p>
            <motion.span className="gold-divider" variants={fadeUp} />
            <motion.h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginTop: 8 }} variants={fadeUp}>
              A Sanctuary of Beauty & Well-being
            </motion.h2>
            <motion.p style={{ color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.9, fontSize: 15 }} variants={fadeUp}>
              At Snigdha Beauty Parlour, we believe beauty is more than skin deep. Our team of industry-certified experts uses only premium,
              cruelty-free products to create looks that enhance your unique beauty.
            </motion.p>

            <motion.ul className="why-list" variants={stagger}>
              {[
                'Hand-picked expert stylists with 5+ years experience',
                'Premium, cruelty-free product lines (Kerastase, L\'Oréal)',
                'State-of-the-art salon with a relaxing ambiance',
                'Personalized consultations for every service',
                'ISO-certified hygiene and safety standards',
              ].map((item) => (
                <motion.li key={item} className="why-list__item" variants={fadeUp}>
                  <span className="why-list__dot" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp} className="mt-32">
              <Link to="/about" className="btn btn-primary">Our Story <ArrowRight size={16} /></Link>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section className="bg-dark">
        <motion.div className="section-header text-center" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <p className="section-label">Client Stories</p>
          <span className="gold-divider center" />
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 8, color: 'var(--dark)' }}>
            Words That Warm Our Hearts
          </h2>
        </motion.div>

        {reviews.length > 0 ? (
          <motion.div
            className="grid-3 mt-48"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {reviews.slice(0, 3).map((r, i) => (
              <motion.div key={r._id || i} variants={fadeUp}>
                <TestimonialCard review={r} dark />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="text-center mt-32 py-16 bg-white/5 border border-white/10 rounded-2xl">
            <Award size={48} className="mx-auto text-white/20 mb-4" />
            <h3 className="text-xl font-serif text-white/50">No customer reviews yet</h3>
            <p className="text-white/30 mt-2">Be the first to share your experience with us.</p>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="text-center mt-32">
          <button 
            className="btn btn-primary"
            onClick={() => setIsReviewModalOpen(true)}
          >
            Share Your Experience
          </button>
        </motion.div>
      </Section>

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        services={services}
      />

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="cta-banner__overlay" />
        <div className="container cta-banner__content">
          <motion.h2
            className="cta-banner__title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Ready for Your Glow-Up?
          </motion.h2>
          <motion.p
            className="cta-banner__sub"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Book your appointment today and experience the Snigdha difference.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to="/booking" className="btn btn-primary btn-lg">
              Book Now — It's Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// Helper section wrapper
function Section({ children, className = '' }) {
  return (
    <section className={`section ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

// Placeholder data for when API isn't connected
const PLACEHOLDER_SERVICES = [
  { _id: '1', name: 'Signature Haircut', category: 'Hair', price: 1200, duration: 60, description: 'Precision cut tailored to your face shape by expert stylists.', isFeatured: true },
  { _id: '2', name: 'Gold Facial', category: 'Skincare', price: 2800, duration: 75, description: 'Rejuvenating 24K gold facial for a radiant glow.', isFeatured: true },
  { _id: '3', name: 'Bridal Makeup', category: 'Bridal', price: 8000, duration: 180, description: 'Complete bridal makeover with luxury brands.', isFeatured: true },
  { _id: '4', name: 'Keratin Treatment', category: 'Hair', price: 4500, duration: 150, description: 'Frizz-free, silky smooth hair for up to 6 months.', isFeatured: false },
  { _id: '5', name: 'Swedish Massage', category: 'Massage', price: 2200, duration: 60, description: 'Full-body relaxation massage with aromatherapy oils.', isFeatured: true },
  { _id: '6', name: 'Gel Nail Art', category: 'Nails', price: 1500, duration: 90, description: 'Long-lasting gel extensions with custom nail art.', isFeatured: false },
];

const PLACEHOLDER_REVIEWS = [
  { _id: 'r1', rating: 5, title: 'Absolutely Stunning!', comment: 'The bridal package was beyond my expectations. Every guest complimented my look. Will definitely be back!', user: { name: 'Priya Sharma' }, createdAt: new Date() },
  { _id: 'r2', rating: 5, title: 'World-class experience', comment: 'The gold facial left my skin glowing for weeks! The staff is professional and the ambiance is truly luxurious.', user: { name: 'Anjali Mehta' }, createdAt: new Date() },
  { _id: 'r3', rating: 5, title: 'Best salon in the city', comment: 'My keratin treatment was flawless. The stylist took time to understand exactly what I wanted. Highly recommend!', user: { name: 'Ritika Gupta' }, createdAt: new Date() },
];
