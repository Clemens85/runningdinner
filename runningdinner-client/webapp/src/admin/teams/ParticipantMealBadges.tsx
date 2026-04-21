import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { isStringNotEmpty, Participant } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

interface DietBadgeProps {
  label: string;
  tooltip: string;
  bgColor: string;
}

function DietBadge({ label, tooltip, bgColor }: DietBadgeProps) {
  return (
    <Tooltip title={tooltip} placement="top">
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 0.5,
          borderRadius: 0.5,
          fontSize: '0.6rem',
          fontWeight: 700,
          lineHeight: '1.5',
          letterSpacing: '0.02em',
          bgcolor: bgColor,
          color: '#fff',
          cursor: 'default',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Box>
    </Tooltip>
  );
}

interface NoteIconProps {
  note: string;
  tooltipPrefix: string;
  color: string;
  icon: React.ReactNode;
}

function NoteIcon({ note, tooltipPrefix, color, icon }: NoteIconProps) {
  return (
    <Tooltip title={`${tooltipPrefix}: ${note}`} placement="top">
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'default',
          color,
          '& svg': { fontSize: '0.85rem' },
        }}
      >
        {icon}
      </Box>
    </Tooltip>
  );
}

interface ParticipantMealBadgesProps {
  participant: Participant;
}

export function ParticipantMealBadges({ participant }: ParticipantMealBadgesProps) {
  const { t } = useTranslation('common');

  const { vegetarian, vegan, lactose, gluten, mealSpecificsNote, notes } = participant;

  const hasMealNote = isStringNotEmpty(mealSpecificsNote);
  const hasNotes = isStringNotEmpty(notes);

  if (!vegetarian && !vegan && !lactose && !gluten && !hasMealNote && !hasNotes) {
    return null;
  }

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, ml: 0.5, flexWrap: 'nowrap' }}>
      {vegan && <DietBadge label="Ve" tooltip={t('vegan')} bgColor="success.dark" />}
      {!vegan && vegetarian && <DietBadge label="V" tooltip={t('vegetarian')} bgColor="success.main" />}
      {lactose && <DietBadge label="L" tooltip={t('lactose')} bgColor="warning.dark" />}
      {gluten && <DietBadge label="G" tooltip={t('gluten')} bgColor="#795548" />}
      {hasMealNote && <NoteIcon note={mealSpecificsNote} tooltipPrefix={t('mealnotes')} color="warning.main" icon={<StickyNote2OutlinedIcon />} />}
      {hasNotes && <NoteIcon note={notes} tooltipPrefix={t('misc_notes')} color="text.secondary" icon={<InfoOutlinedIcon />} />}
    </Box>
  );
}

export function ParticipantMealDetails({ participant }: ParticipantMealBadgesProps) {
  const { t } = useTranslation('common');

  const { vegetarian, vegan, lactose, gluten, mealSpecificsNote, notes } = participant;

  const hasMealNote = isStringNotEmpty(mealSpecificsNote);
  const hasNotes = isStringNotEmpty(notes);

  if (!vegetarian && !vegan && !lactose && !gluten && !hasMealNote && !hasNotes) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center', mt: 0.25, mb: 0.5 }}>
      {vegan && <Chip label={t('vegan')} size="small" color="success" variant="outlined" />}
      {!vegan && vegetarian && <Chip label={t('vegetarian')} size="small" color="success" variant="outlined" />}
      {lactose && <Chip label={t('lactose')} size="small" color="warning" variant="outlined" />}
      {gluten && <Chip label={t('gluten')} size="small" sx={{ borderColor: '#795548', color: '#795548' }} variant="outlined" />}
      {hasMealNote && (
        <Typography variant="caption" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: 'warning.dark' }}>
          <StickyNote2OutlinedIcon sx={{ fontSize: '0.85rem' }} />
          {mealSpecificsNote}
        </Typography>
      )}
      {hasNotes && (
        <Typography variant="caption" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: 'text.secondary' }}>
          <InfoOutlinedIcon sx={{ fontSize: '0.85rem' }} />
          {notes}
        </Typography>
      )}
    </Box>
  );
}
