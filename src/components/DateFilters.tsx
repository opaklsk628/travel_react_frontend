import React, { useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

interface Props {
  checkIn: Dayjs;
  checkOut: Dayjs;
  setCheckIn:  (d: Dayjs) => void;
  setCheckOut: (d: Dayjs) => void;
}

export default function DateFilters({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
}: Props) {
  /* 保證 check-out 至少比 check-in 晚一天 */
  useEffect(() => {
    const minCO = checkIn.add(1, 'day');
    if (checkOut.isBefore(minCO)) setCheckOut(minCO);
  }, [checkIn, checkOut, setCheckOut]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, maxWidth: 500 }}>
        <DatePicker
          label="Check-in"
          value={checkIn}
          disablePast
          onChange={d => d && setCheckIn(d)}
          slotProps={{ textField: { fullWidth: true } }}
        />
        <DatePicker
          label="Check-out"
          value={checkOut}
          minDate={checkIn.add(1, 'day')}
          onChange={d => d && setCheckOut(d)}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Box>
    </LocalizationProvider>
  );
}
