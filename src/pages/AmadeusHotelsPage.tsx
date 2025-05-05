import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  List,
  ListItemText,
  CircularProgress,
  Typography,
  Paper,
  ListItemButton,
} from '@mui/material';
import { amadeusService } from '../services/api';
import { Dayjs } from 'dayjs';

/* 型別 */
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

/* debounce hook */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface Props {
  checkIn: Dayjs;
  checkOut: Dayjs;
}

export default function AmadeusHotelsPage({ checkIn, checkOut }: Props) {
  const [keyword, setKeyword] = useState('');
  const [cityOptions, setCityOptions] = useState<CityItem[]>([]);
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebounce(keyword);

  /* 城市 autocomplete */
  useEffect(() => {
    if (!debounced) {
      setCityOptions([]);
      return;
    }
    amadeusService
      .cities(debounced)
      .then(res => setCityOptions(res.data.slice(0, 8)))
      .catch(() => setCityOptions([]));
  }, [debounced]);

  /* 取飯店 */
  const fetchHotels = (cityCode: string) => {
    setLoading(true);
    setError(null);
    amadeusService
      .list(cityCode)
      .then(res => setHotels(res.data))
      .catch(err =>
        setError(err.response?.data?.message || err.message || 'error')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHotels('PAR');
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" mb={2}>
        Amadeus — Hotel Search
      </Typography>

      {/* 搜尋框 */}
      <Box sx={{ position: 'relative', maxWidth: 320 }}>
        <TextField
          fullWidth
          label="Search city"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        {!!cityOptions.length && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              width: '100%',
              zIndex: 10,
              mt: 0.5,
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            <List dense>
              {cityOptions.map(c => (
                <ListItemButton
                  key={c.iataCode}
                  onClick={() => {
                    setKeyword(`${c.name} (${c.iataCode})`);
                    setCityOptions([]);
                    fetchHotels(c.iataCode);
                  }}
                >
                  <ListItemText
                    primary={`${c.name} (${c.iataCode})`}
                    secondary={c.address?.countryName}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {/* 飯店表格 */}
      {loading ? (
        <Box sx={{ mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          component="table"
          sx={{
            mt: 3,
            borderCollapse: 'collapse',
            width: '100%',
            '& th, & td': { border: '1px solid #ccc', p: 1 },
          }}
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
                    <img
                      src={h.image}
                      alt={h.name}
                      style={{ width: 100, objectFit: 'cover' }}
                    />
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
        </Box>
      )}

      <Typography variant="caption" display="block" mt={2}>
        Date: {checkIn.format('YYYY-MM-DD')} – {checkOut.format('YYYY-MM-DD')}
      </Typography>
    </Box>
  );
}
