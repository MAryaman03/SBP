import { motion } from 'framer-motion';
import { ArrowRight, Heart, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import purnimaImg from '../assets/Purnima Mohanty.webp';
import pratimaImg from '../assets/Pratima Majhi.webp';
import aboutCardImg from '../assets/aboutPagecard.png';
import './About.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const team = [
  { 
    name: 'Purnima Mohanty', 
    role: 'Founder & Master Bridal Artist', 
    exp: '20+ Years (10+ in HD Airbrush)', 
    specialty: 'Bridal Makeovers, Skin Treatments, Airbrush & HD Makeup', 
    image: purnimaImg 
  },
  { 
    name: 'Pratima Majhi', 
    role: 'Nail Art Specialist', 
    exp: '8 Years Experience', 
    specialty: 'Gel, Acrylic, 3D Nail Art', 
    image: pratimaImg 
  },
];

export default function About() {
  return (
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      {/* Hero */}
      <section className="about-hero bg-dark">
        <div className="container">
          <motion.p className="section-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Our Story
          </motion.p>
          <motion.h1
            style={{ color: 'var(--dark)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginTop: 12, maxWidth: 700 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Where Passion Meets <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Perfection</em>
          </motion.h1>
          <motion.p
            style={{ color: 'var(--text-secondary)', maxWidth: 560, marginTop: 20, fontSize: 16, lineHeight: 1.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Since 2002, Snigdha Beauty Parlour has been Odisha's most trusted destination for premium beauty experiences, 
            transforming thousands of clients with artistry, care, and luxury.
          </motion.p>
        </div>
      </section>

      {/* Brand Story */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <motion.div
              className="about-story__content"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="section-label">Our Journey</p>
              <span className="gold-divider" />
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginTop: 12 }}>
                A Legacy of Beauty
              </h2>
              <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                Snigdha Beauty Parlour was born from a simple dream — to create a space where every woman feels like royalty. 
                Founded by Purnima Mohanty in 2002, we have grown into a full-service beauty parlour 
                trusted by thousands of clients.
              </p>
              <p style={{ marginTop: 16, fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
                Our philosophy is simple: combine world-class technique with genuine care. Every service is a personalized 
                experience. Every client leaves feeling extraordinary. We don't just change how you look — we change how you feel.
              </p>
              <div className="about-story__values">
                {[
                  { icon: <Heart size={20} />, label: 'Passion-Driven' },
                  { icon: <Star size={20} />, label: 'Excellence First' },
                  { icon: <Users size={20} />, label: 'Client-Centric' },
                ].map(({ icon, label }) => (
                  <div key={label} className="about-story__value">
                    <span style={{ color: 'var(--gold)' }}>{icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="about-story__visual"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="about-story__image-main" style={{ backgroundImage: `url(${aboutCardImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="about-story__image-accent">
                <p className="about-story__year">2002</p>
                <p className="about-story__year-sub">Est. Puri</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-dark">
        <div className="container">
          <motion.div
            style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <p className="section-label" style={{ color: 'var(--gold)' }}>Our Mission</p>
            <span className="gold-divider center" />
            <blockquote className="about__mission">
              "To empower every woman by enhancing her natural beauty, boosting her confidence, and providing an 
              experience that transcends a simple salon visit — creating moments of pure luxury and self-care."
            </blockquote>
            <p style={{ color: 'var(--dark-2)', fontSize: 13, marginTop: 16, fontWeight: 600, letterSpacing: 2 }}>
              — PURNIMA MOHANTY, FOUNDER
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="section-label">The Artisans</p>
            <span className="gold-divider center" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginTop: 12 }}>Meet Our Experts</h2>
          </motion.div>

          <div className="grid-2 mt-48">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                className="team-card luxury-team-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover="hover"
                transition={{ delay: i * 0.15, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                viewport={{ once: true }}
              >
                <div className="team-card__avatar-container">
                  {member.image ? (
                    <motion.img 
                      src={member.image} 
                      alt={member.name} 
                      className="team-card__avatar--img"
                      variants={{
                        rest: { scale: 1 },
                        hover: { scale: 1.1 }
                      }}
                      initial="rest"
                      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                    />
                  ) : (
                    <div className="team-card__avatar">
                      {member.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="team-card__name">{member.name}</h3>
                <p className="team-card__role">{member.role}</p>
                <p className="team-card__exp">{member.exp}</p>
                <p className="team-card__specialty">{member.specialty}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-cream-2">
        <div className="container text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Ready to Experience the Difference?</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 12, marginBottom: 32, fontSize: 15 }}>
            Book an appointment with one of our expert stylists today.
          </p>
          <Link to="/booking" className="btn btn-primary btn-lg">
            Book an Appointment <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
