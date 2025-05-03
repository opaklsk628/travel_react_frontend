import React, { useEffect, useState } from 'react';
import { extHotelService } from '../services/api';

interface HotelItem {
  code: number;
  name?: { content: string };
  category?: { description: string };
  cityCode?: string;
}

export default function HotelbedsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    extHotelService
      .list({ from: 1, to: 10, lang: 'ENG' })
      .then(r => setHotels(r.data.hotels || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '1rem' }}>Loading hotels…</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Hotelbeds — Sample Hotels (Test Env)</h2>

      <table border={1} cellPadding={6} cellSpacing={0}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Category</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {hotels.map(h => (
            <tr key={h.code}>
              <td>{h.code}</td>
              <td>{h.name?.content ?? '—'}</td>
              <td>{h.category?.description ?? '—'}</td>
              <td>{h.cityCode ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
