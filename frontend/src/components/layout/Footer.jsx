import { Link } from 'react-router-dom';
import { Scissors, MapPin, Phone, Mail, Share2, Video } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <div className="footer__logo">
                <Scissors size={20} className="footer__logo-icon" />
                <span>Snigdha Beauty Parlour</span>
              </div>
              <p className="footer__tagline">
                Where beauty meets luxury. Experience the art of transformation in an atmosphere of pure elegance.
              </p>
              <div className="footer__social">
                <a href="#" className="footer__social-link" aria-label="Instagram"><Share2 size={18} /></a>
                <a href="#" className="footer__social-link" aria-label="Twitter"><Share2 size={18} /></a>
                <a href="#" className="footer__social-link" aria-label="YouTube"><Video size={18} /></a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer__col">
              <h4 className="footer__col-title">Quick Links</h4>
              <ul className="footer__links">
                {['About', 'Services', 'Gallery', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase()}`} className="footer__link">{item}</Link>
                  </li>
                ))}
                <li><Link to="/booking" className="footer__link">Book Appointment</Link></li>
                <li><Link to="/track" className="footer__link">Track Booking</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer__col">
              <h4 className="footer__col-title">Services</h4>
              <ul className="footer__links">
                {['Hair Styling', 'Skincare & Facials', 'Bridal Packages', 'Nail Art', 'Massage Therapy', 'Makeup'].map((s) => (
                  <li key={s}><span className="footer__link">{s}</span></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer__col">
              <h4 className="footer__col-title">Visit Us</h4>
              <ul className="footer__contact">
                <li>
                  <MapPin size={15} className="footer__contact-icon" />
                  <span>Surya Complex, Near Jagannath Temple,<br />Puri, Odisha 752001</span>
                </li>

                <li>
                  <Mail size={15} className="footer__contact-icon" />
                  <a href="mailto:purnimamohanty662@gmail.com" className="footer__link">purnimamohanty662@gmail.com</a>
                </li>
              </ul>
              <div className="footer__hours">
                <p><strong>Mon – Sat</strong> &nbsp;9:00 AM – 10:30 PM</p>
                <p><strong>Sunday</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:00 AM – 10:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Snigdha Beauty Parlour. All rights reserved. Crafted with ♥
          </p>
          <div className="footer__legal">
            <a href="#" className="footer__link">Privacy Policy</a>
            <a href="#" className="footer__link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
