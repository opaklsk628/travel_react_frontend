import React, { useEffect, useState } from 'react';
import { amadeusService } from '../services/api';

// catalog
interface HotelItem {
  id: string;
  name: string;
  image: string | null;
  stars: string;
  cityCode: string;
}
interface CityItem {
  iataCode: string;
  name: string;
  address?: { countryName?: string };
}

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// homepage
export default function AmadeusHotelsPage() {
  const [keyword, setKeyword] = useState('');
  const [cities, setCities] = useState<CityItem[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce(keyword);

  // check the city name in search box
  useEffect(() => {
    if (!debounced) {
      setCities([]);
      return;
    }
    amadeusService
      .cities(debounced)
      .then(r => setCities(r.data.slice(0, 8))) // 取前 8 筆候選
      .catch(() => setCities([]));
  }, [debounced]);

  // hotel list
  const fetchHotels = (cityCode: string) => {
    setLoading(true);
    setError(null);
    amadeusService
      .list(cityCode)
      .then(r => setHotels(r.data))
      .catch(err =>
        setError(err.response?.data?.message || err.message || 'error')
      )
      .finally(() => setLoading(false));
  };

  // default hotel in Paris (PAR)
  useEffect(() => {
    fetchHotels('PAR');
  }, []);

  // UI
  return (
    <div style={{ padding: '1rem' }}>
      <h2>Amadeus — Hotel Search</h2>

      {/* search hotel and suggest list */}
      <div style={{ position: 'relative', maxWidth: 300 }}>
        <input
          type="text"
          placeholder="Type city name…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ width: '100%', padding: 8 }}
        />
        {cities.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              border: '1px solid #ccc',
              background: '#fff',
              zIndex: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {cities.map(c => (
              <li
                key={c.iataCode}
                style={{ padding: '4px 8px', cursor: 'pointer' }}
                onClick={() => {
                  setKeyword(`${c.name} (${c.iataCode})`);
                  setCities([]);
                  fetchHotels(c.iataCode);
                }}
              >
                {c.name} ({c.iataCode}) {c.address?.countryName && '— '}
                {c.address?.countryName}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* hotel list */}
      {loading ? (
        <p>Loading hotels…</p>
      ) : (
        <table
          border={1}
          cellPadding={6}
          style={{ borderCollapse: 'collapse', marginTop: '1rem', width: '100%' }}
        >
          <thead>
            <tr>
              <th style={{ width: 120 }}>Image</th>
              <th>Name</th>
              <th>Stars</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id}>
                <td>
                  {h.image ? (
                    <img src={h.image} alt={h.name} width={100} />
                  ) : (
                    '—'
                  )}
                </td>
                <td>{h.name}</td>
                <td>{h.stars}</td>
                <td>{h.cityCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
