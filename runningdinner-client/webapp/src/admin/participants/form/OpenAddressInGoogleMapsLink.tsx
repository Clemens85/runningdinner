import { Box, Tooltip } from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import { GeocodingResult, isGeocodingResultValid } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

type OpenAddressInGoogleMapsLinkProps = {
  geocodingResult?: GeocodingResult | undefined;
};

export function OpenAddressInGoogleMapsLink({ geocodingResult }: OpenAddressInGoogleMapsLinkProps) {
  const { t } = useTranslation('admin');

  if (!isGeocodingResultValid(geocodingResult)) {
    return null;
  }

  return (
    <Box mt={1} display="flex" justifyContent="flex-end">
      <Tooltip title={t('participant_open_in_google_maps_tooltip')}>
        <a
          href={`https://www.google.com/maps?q=${geocodingResult!.lat},${geocodingResult!.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'inherit', opacity: 0.6 }}
        >
          <RoomIcon sx={{ fontSize: '1rem' }} />
          {t('participant_open_in_google_maps')}
        </a>
      </Tooltip>
    </Box>
  );
}
