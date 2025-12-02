import { Typography } from '@mui/material';
import { Box, SxProps } from '@mui/system';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type TypingIndicatorProps = {
  // label?: string;
  sx?: SxProps;
};

export function TypingIndicator({ sx }: TypingIndicatorProps) {
  const { t } = useTranslation('common');

  const labels = [
    {
      text: t('feedback_agent_typing_patience'),
      durationMillis: 4000,
    },
    {
      text: t('feedback_agent_typing_working'),
      durationMillis: 4000,
    },
    {
      text: t('feedback_agent_typing_preparing'),
      durationMillis: 4000,
    },
  ];

  const [labelIndex, setLabelIndex] = useState(0);
  const label = labels[labelIndex].text;

  useEffect(() => {
    if (labelIndex < labels.length - 1) {
      const timer = setTimeout(() => {
        setLabelIndex((prev) => prev + 1);
      }, labels[labelIndex].durationMillis);

      return () => clearTimeout(timer);
    }
  }, [labelIndex]);

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
