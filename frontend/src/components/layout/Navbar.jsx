import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, ChevronDown, Scissors, User, LogOut, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <Scissors size={20} className="navbar__logo-icon" />
          <span className="navbar__logo-text">Snigdha Beauty Parlour</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setUserMenuOpen((p) => !p)}
                aria-label="User menu"
              >
                <span className="navbar__user-avatar">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="navbar__user-name">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`navbar__chevron ${userMenuOpen ? 'rotated' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="navbar__dropdown"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="navbar__dropdown-item" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={15} /> Admin Panel
                      </Link>
                    )}
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          <Link to="/booking" className="btn btn-primary btn-sm navbar__book-btn">
            Book Now
          </Link>

          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="navbar__mobile-inner">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div className="navbar__mobile-actions">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn btn-outline btn-sm w-full" onClick={() => setMobileOpen(false)}>
                      My Bookings
                    </Link>
                    <button className="btn btn-sm w-full" style={{ color: 'var(--gold-dark)' }} onClick={handleLogout}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-sm w-full" onClick={() => setMobileOpen(false)}>
                    Sign In
                  </Link>
                )}
                <Link to="/booking" className="btn btn-primary btn-sm w-full" onClick={() => setMobileOpen(false)}>
                  Book Appointment
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
