import { Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';

type TypingIndicatorProps = {
  label?: string;
  sx?: SxProps;
};

export function TypingIndicator({ label = 'Bitte einen Moment Geduld ...', sx }: TypingIndicatorProps) {
  const sxToUse = {
    ...sx,
    bgcolor: 'background.default',
    py: 1,
  };

  return (
    <Box sx={sxToUse}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="subtitle1" color="text.secondary">
          {label}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              animation: 'pulse 1s infinite',
              animationDelay: '0s',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
              mx: 0.5,
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              animation: 'pulse 1s infinite',
              animationDelay: '0.2s',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
              mx: 0.5,
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              animation: 'pulse 1s infinite',
              animationDelay: '0.4s',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1)' },
              },
              mx: 0.5,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
