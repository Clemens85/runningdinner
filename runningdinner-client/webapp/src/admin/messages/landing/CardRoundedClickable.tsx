import { Card } from '@mui/material';
import { alpha, styled } from '@mui/system';

export const brand = {
  100: '#CEE5FD',
  300: '#55A6F6',
};

export const gray = {
  50: '#FBFCFE',
  200: '#D6E2EB',
};

export const CardRoundedClickable = styled(Card)(({}) => ({
  backgroundColor: gray[50],
  borderRadius: 10,
  border: `1px solid ${alpha(gray[200], 0.8)}`,
  boxShadow: 'none',
  transition: 'background-color, border, 80ms ease',
  background: `linear-gradient(to bottom, #FFF, ${gray[50]})`,
  '&:hover': {
    borderColor: brand[300],
    boxShadow: `0 0 24px ${brand[100]}`,
  },
  cursor: 'pointer',
}));
