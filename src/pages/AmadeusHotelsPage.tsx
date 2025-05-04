import React, { useEffect, useState } from 'react';
import { amadeusService } from '../services/api';

interface HotelItem {
  id: string;
  name: string;
  image: string | null;
  stars: string;
  cityCode: string;
}

export default function AmadeusHotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    amadeusService
      .list('PAR')
      .then(res => setHotels(res.data))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '1rem' }}>Loading…</p>;
  if (error)   return <p style={{ padding: '1rem', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Amadeus — Sample Hotels (Paris)</h2>
      <table border={1} cellPadding={6} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Image</th><th>Name</th><th>Stars</th><th>City</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(h => (
            <tr key={h.id}>
              <td>{h.image ? <img src={h.image} alt={h.name} width={100}/> : '—'}</td>
              <td>{h.name}</td>
              <td>{h.stars}</td>
              <td>{h.cityCode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
