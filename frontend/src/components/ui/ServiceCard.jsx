import { Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import imgHaircut from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (2).png';
import imgKeratin from '../../assets/Keratin Treatment Shine.png';
import imgBalayage from '../../assets/Balayage & Color Dimension.jpg';
import imgGoldFacial from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (5).png';
import imgHydratingFacial from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (6).png';
import imgBridalMakeup from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (7).png';
import imgBridalPackage from '../../assets/Bridal Package Preparation.png';
import imgGelNailArt from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (8).png';
import imgSwedishMassage from '../../assets/Gemini_Generated_Image_i5xu87i5xu87i5xu (3).png';
import imgPartyMakeup from '../../assets/Party Makeup Editorial.png';
import './ServiceCard.css';

const categoryColors = {
  Hair: '#c9a96e',
  Skincare: '#d4a574',
  Bridal: '#c97eb0',
  Nails: '#a074c9',
  Massage: '#74a8c9',
  Makeup: '#c9745a',
  Other: '#8a8a8a',
};

const serviceImages = {
  'Signature Haircut & Style': imgHaircut,
  'Signature Haircut': imgHaircut,
  'Balayage & Color': imgBalayage,
  'Keratin Treatment': imgKeratin,
  'Gold Facial': imgGoldFacial,
  'Hydrating Facial': imgHydratingFacial,
  'Bridal Makeup': imgBridalMakeup,
  'Bridal Package': imgBridalPackage,
  'Gel Nail Art': imgGelNailArt,
  'Swedish Massage': imgSwedishMassage,
  'Party Makeup': imgPartyMakeup,
};

export default function ServiceCard({ service }) {
  const color = categoryColors[service.category] || '#c9a96e';
  const imageUrl = service.image || serviceImages[service.name];

  return (
    <motion.div 
      className="service-card card"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <div className="service-card__image" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }}>
        {imageUrl ? (
          <>
            <motion.img 
              src={imageUrl} 
              alt={service.name} 
              className="service-card__img"
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.08 }
              }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            />
            <div className="service-card__gradient-overlay" />
          </>
        ) : (
          <div className="service-card__icon" style={{ color }}>✦</div>
        )}
        <div className="service-card__category-badge" style={{ borderColor: color, color: imageUrl ? '#fff' : color, background: imageUrl ? 'rgba(0,0,0,0.5)' : 'white' }}>
          {service.category}
        </div>
      </div>

      <div className="service-card__body">
        <h3 className="service-card__title">{service.name}</h3>
        <p className="service-card__desc">{service.description}</p>

        <div className="service-card__meta">
          <div className="service-card__meta-item">
            <Clock size={13} />
            <span>{service.duration} min</span>
          </div>
          <div className="service-card__price">
            <Tag size={13} />
            <span>₹{service.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Link to="/booking" className="btn btn-primary btn-sm w-full service-card__btn">
          Book This Service
        </Link>
      </div>
    </motion.div>
  );
}
