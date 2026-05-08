import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';
import './Gallery.css';

const fallbackGalleryItems = [
  { _id: '1', category: 'Hair', title: 'Luxury Balayage', gradient: 'linear-gradient(135deg, #8B6914, #C9A96E)' },
  { _id: '2', category: 'Bridal', title: 'Bridal Glam', gradient: 'linear-gradient(135deg, #7B2D8B, #C97EB0)' },
  { _id: '3', category: 'Skincare', title: 'Radiant Glow', gradient: 'linear-gradient(135deg, #B8570A, #D4A574)' },
  { _id: '4', category: 'Nails', title: 'Nail Art Masterpiece', gradient: 'linear-gradient(135deg, #5C3D8B, #A074C9)' },
  { _id: '5', category: 'Hair', title: 'Keratin Perfection', gradient: 'linear-gradient(135deg, #1A6B45, #4DB87A)' },
  { _id: '6', category: 'Makeup', title: 'Smoky Editorial', gradient: 'linear-gradient(135deg, #8B2D2D, #C9745A)' },
  { _id: '7', category: 'Bridal', title: 'Full Bridal Package', gradient: 'linear-gradient(135deg, #6B4E1A, #C9A96E)' },
  { _id: '8', category: 'Massage', title: 'Spa Retreat', gradient: 'linear-gradient(135deg, #1A4E6B, #74A8C9)' },
];

const cats = ['All', 'Hair', 'Bridal', 'Skincare', 'Nails', 'Makeup', 'Massage'];

export default function Gallery() {
  const [active, setActive] = useState('All');
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/gallery')
      .then(res => {
        if (res.data.items && res.data.items.length > 0) {
          setGalleryItems(res.data.items);
        } else {
          setGalleryItems(fallbackGalleryItems);
        }
      })
      .catch((err) => {
        console.error('Failed to load gallery', err);
        setGalleryItems(fallbackGalleryItems);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === 'All' ? galleryItems : galleryItems.filter((g) => g.category === active);

  return (
    <main style={{ paddingTop: 'var(--nav-height)' }}>
      <section className="page-hero bg-dark">
        <div className="container">
          <p className="section-label">Our Portfolio</p>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2.5rem, 6vw, 5rem)', marginTop: 12 }}>
            Gallery
          </h1>
          <p className="page-hero__sub">A showcase of our finest work and transformations</p>
        </div>
      </section>

      <section className="section bg-dark">
        <div className="container">
          <div className="category-tabs mb-32" style={{ justifyContent: 'center' }}>
            {cats.map((c) => (
              <button key={c} className={`category-tab ${active === c ? 'category-tab--active' : ''}`} onClick={() => setActive(c)}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
             <div className="flex-center" style={{ height: 200 }}>
                <div className="loader-ring" />
             </div>
          ) : (
            <motion.div className="gallery-grid" layout>
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  className={`gallery-item gallery-item--${(i % 7 === 0 || i % 7 === 4) ? 'wide' : 'normal'}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="gallery-item__img" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="gallery-item__img" style={{ background: item.gradient || '#c9a96e' }}>
                      <div className="gallery-item__symbol">✦</div>
                    </div>
                  )}
                  <div className="gallery-item__overlay">
                    <span className="badge badge-gold">{item.category}</span>
                    <h3 className="gallery-item__title">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
