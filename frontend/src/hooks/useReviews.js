import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';

export function useReviews({ featured, service } = {}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (featured) params.set('featured', 'true');
    if (service) params.set('service', service);

    API.get(`/reviews?${params}`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [featured, service]);

  return { reviews, loading, error };
}
