import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import './Contact.css';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    // Using FormSubmit.co pattern for email delivery (replace with your email)
    try {
      await fetch('https://formspree.io/f/mlgzwrpk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Message sent! We\'ll get back to you soon. ✨');
      reset();
    } catch {
      toast.error('Failed to send. Please email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      <section className="page-hero bg-dark">
        <div className="container">
          <p className="section-label">Get In Touch</p>
          <h1 style={{ color: 'var(--dark)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginTop: 12 }}>
            Contact Us
          </h1>
          <p className="page-hero__sub">We'd love to hear from you</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Info */}
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <p className="section-label">Find Us</p>
              <span className="gold-divider" />
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginTop: 12, marginBottom: 32 }}>
                Visit Our Salon
              </h2>

              {[
                {
                  icon: <MapPin size={22} />,
                  title: 'Address',
                  lines: ['Surya Complex, Near Jagannath Temple', 'Puri, Odisha 752001', 'India'],
                },

                {
                  icon: <Mail size={22} />,
                  title: 'Email',
                  lines: ['purnimamohanty662@gmail.com'],
                },
                {
                  icon: <Clock size={22} />,
                  title: 'Opening Hours',
                  lines: ['Mon – Sat: 9:00 AM – 10:30 PM', 'Sunday: 10:00 AM – 10:30 PM'],
                },
              ].map(({ icon, title, lines }) => (
                <div key={title} className="contact-info__item">
                  <div className="contact-info__icon">{icon}</div>
                  <div>
                    <p className="contact-info__title">{title}</p>
                    {lines.map((l) => <p key={l} className="contact-info__line">{l}</p>)}
                  </div>
                </div>
              ))}

              {/* Google Maps Embed */}
              <div className="contact-map">
                <iframe
                  title="Snigdha Beauty Parlour Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.577239700868!2d85.811831!3d19.799718!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19c417937418eb%3A0xf510cd5af09d7df9!2sPuri%2C%20Odisha!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  width="100%"
                  height="220"
                  style={{ border: 0, borderRadius: 'var(--radius-md)' }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="contact-form-card">
                <h2 style={{ fontSize: 24, marginBottom: 8 }}>Send Us a Message</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
                  Have a question or want to know more? We'll reply within 24 hours.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      className={`form-input ${errors.name ? 'input-error' : ''}`}
                      placeholder="Priya Sharma"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <span className="field-error">{errors.name.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'input-error' : ''}`}
                      placeholder="you@example.com"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && <span className="field-error">{errors.email.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone (Optional)</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      {...register('phone')}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      className={`form-input ${errors.subject ? 'input-error' : ''}`}
                      placeholder="Appointment inquiry, feedback..."
                      {...register('subject', { required: 'Subject is required' })}
                    />
                    {errors.subject && <span className="field-error">{errors.subject.message}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className={`form-textarea ${errors.message ? 'input-error' : ''}`}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Message too short' } })}
                    />
                    {errors.message && <span className="field-error">{errors.message.message}</span>}
                  </div>

                  <button type="submit" className="btn btn-primary w-full btn-lg" disabled={submitting}>
                    <Send size={18} />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
