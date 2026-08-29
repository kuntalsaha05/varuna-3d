import { useState, useEffect } from 'react';
import axios from 'axios';

export function useObservations(limit: number = 300) {
  const [floats, setFloats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('http://127.0.0.1:8000/api/v1/observations/floats', {
      params: { limit }
    })
      .then(res => {
        setFloats(res.data.floats || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [limit]);

  return { floats, loading, error };
}
