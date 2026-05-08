import { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../components/ui/ServiceCard';
import { useServices } from '../hooks/useServices';
import './Services.css';

const categories = ['All', 'Hair', 'Skincare', 'Bridal', 'Nails', 'Massage', 'Makeup'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { services, loading } = useServices({
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const FALLBACK = PLACEHOLDER_SERVICES.filter(
    (s) => activeCategory === 'All' || s.category === activeCategory
  );
  const displayServices = services.length > 0 ? services : FALLBACK;

  return (
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Page Hero */}
      <section className="page-hero bg-dark">
        <div className="container">
          <motion.p className="section-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Indulge Yourself
          </motion.p>
          <motion.h1
            style={{ color: 'var(--dark)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginTop: 12 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Our Services
          </motion.h1>
          <motion.p
            className="page-hero__sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Premium treatments crafted for your beauty journey
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="section bg-cream-2">
        <div className="container">
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'category-tab--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex-center" style={{ height: 300 }}>
              <div className="loader-ring" style={{ borderTopColor: 'var(--gold)', border: '2px solid rgba(142, 68, 173, 0.2)' }} />
            </div>
          ) : (
            <motion.div
              className="grid-3 mt-48"
              key={activeCategory}
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {displayServices.map((s) => (
                <motion.div key={s._id || s.name} variants={fadeUp}>
                  <ServiceCard service={s} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}

const PLACEHOLDER_SERVICES = [
  { _id: '1', name: 'Signature Haircut & Style', category: 'Hair', price: 1200, duration: 60, description: 'Precision cut and style tailored to your face shape by our expert stylists.' },
  { _id: '2', name: 'Balayage & Color', category: 'Hair', price: 3500, duration: 120, description: 'Sun-kissed balayage or full color using premium ammonia-free dyes.' },
  { _id: '3', name: 'Keratin Treatment', category: 'Hair', price: 4500, duration: 150, description: 'Luxurious smoothing treatment for frizz-free, silky hair for 6 months.' },
  { _id: '4', name: 'Gold Facial', category: 'Skincare', price: 2800, duration: 75, description: 'Rejuvenating 24K gold facial for brightening and firming.' },
  { _id: '5', name: 'Hydrating Facial', category: 'Skincare', price: 1800, duration: 60, description: 'Deep hydration facial with hyaluronic acid and vitamin C.' },
  { _id: '6', name: 'Bridal Makeup', category: 'Bridal', price: 8000, duration: 180, description: 'Complete bridal makeover using luxury brands and airbrush.' },
  { _id: '7', name: 'Bridal Package', category: 'Bridal', price: 15000, duration: 300, description: 'All-inclusive bridal: hairdo, makeup, draping, and touch-ups.' },
  { _id: '8', name: 'Gel Nail Art', category: 'Nails', price: 1500, duration: 90, description: 'Long-lasting gel extensions with custom nail art designs.' },
  { _id: '9', name: 'Swedish Massage', category: 'Massage', price: 2200, duration: 60, description: 'Full-body relaxation massage with warm aromatherapy oils.' },
  { _id: '10', name: 'Party Makeup', category: 'Makeup', price: 3000, duration: 90, description: 'Glamorous evening look with contouring and smoky eyes.' },
];
