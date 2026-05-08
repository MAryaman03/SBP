import { format } from 'date-fns';
import './TestimonialCard.css';

function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialCard({ review, dark = false }) {
  return (
    <div className={`testimonial-card ${dark ? 'testimonial-card--dark' : ''} ${review.isFeatured ? 'ring-2 ring-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : ''}`}>
      <div className="testimonial-card__header">
        <Stars rating={review.rating} />
        {review.title && <h4 className="testimonial-card__title">"{review.title}"</h4>}
      </div>
      <p className="testimonial-card__comment">{review.comment}</p>
      <div className="testimonial-card__footer">
        <div className="testimonial-card__avatar">
          {review.user?.name?.[0]?.toUpperCase() || review.guestName?.[0]?.toUpperCase() || 'A'}
        </div>
        <div>
          <p className="testimonial-card__name">{review.user?.name || review.guestName || 'Anonymous'}</p>
          <p className="testimonial-card__date">
            {review.createdAt ? format(new Date(review.createdAt), 'MMM yyyy') : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
