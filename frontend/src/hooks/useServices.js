import { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';

export function useServices({ featured, category } = {}) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (featured) params.set('featured', 'true');
    if (category) params.set('category', category);

    API.get(`/services?${params}`)
      .then((res) => setServices(res.data.services || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [featured, category]);

  return { services, loading, error };
}
