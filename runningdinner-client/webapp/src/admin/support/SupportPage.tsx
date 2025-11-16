import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Alert, Box, Button, CircularProgress, Stack } from '@mui/material';
import { styled } from '@mui/system';
import { BaseRunningDinnerProps, Fullname, getParticipantsExportJsonUrl, importParticipantsFromJson, isArrayNotEmpty, Participant } from '@runningdinner/shared';
import { useState } from 'react';

import { PrimaryButton } from '../../common/theme/PrimaryButton';
import { PageTitle, Span } from '../../common/theme/typography/Tags';

export function SupportPage({ runningDinner }: BaseRunningDinnerProps) {
  return (
    <Box>
      <ExportParticipantsToJsonView runningDinner={runningDinner} />
      <ImportParticipantsFromJsonView runningDinner={runningDinner} />
    </Box>
  );
}

function ExportParticipantsToJsonView({ runningDinner }: BaseRunningDinnerProps) {
  return (
    <Box>
      <PageTitle>Export</PageTitle>
      <PrimaryButton href={getParticipantsExportJsonUrl(runningDinner.adminId)} target={'_blank'}>
        Exportieren...
      </PrimaryButton>
    </Box>
  );
}

function ImportParticipantsFromJsonView({ runningDinner }: BaseRunningDinnerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>();
  const [failedParticipantsAfterImport, setFailedParticipantsAfterImport] = useState<Participant[]>();

  async function handleUpload(file: File) {
    reset();
    const reader = new FileReader();
    reader.onload = async (event) => {
      const contents = event.target?.result;
      if (typeof contents === 'string') {
        try {
          const failedParticipants = await importParticipantsFromJson(runningDinner.adminId, contents);
          handleSuccess(failedParticipants);
        } catch (error) {
          handleError(`Error sending to API: ${JSON.stringify(error)}`);
        }
      }
    };
    reader.onerror = () => {
      handleError('Error reading file');
    };
    reader.readAsText(file);
  }

  function handleError(error: string) {
    setIsUploading(false);
    setErrorMsg(error);
  }
  function handleSuccess(failedParticipants: Participant[]) {
    setIsUploading(false);
    setErrorMsg(undefined);
    setFailedParticipantsAfterImport(failedParticipants);
  }

  function reset() {
    setErrorMsg(undefined);
    setFailedParticipantsAfterImport(undefined);
    setIsUploading(false);
  }

  return (
    <Box sx={{ mt: 4 }}>
      <PageTitle>Import</PageTitle>
      <Stack direction="column" gap={1} alignItems="center" justifyContent={'flex-start'}>
        <InputFileUpload onUpload={handleUpload} disabled={isUploading} />
        {isUploading && <CircularProgress size={20} />}
      </Stack>

      <Box sx={{ mt: 2 }}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {failedParticipantsAfterImport && (
          <Alert severity="success">
            Die Teilnehmer wurden erfolgreich importiert.
            {isArrayNotEmpty(failedParticipantsAfterImport) && (
              <>
                <Span>Folgende Teilnehmer konnten nicht importiert werden:</Span>
                {failedParticipantsAfterImport.map((p) => (
                  <Box key={p.participantNumber}>
                    <Fullname {...p} />
                  </Box>
                ))}
              </>
            )}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

type InputFileUploadProps = {
  onUpload: (file: File) => unknown;
  disabled?: boolean;
};

function InputFileUpload({ onUpload, disabled }: InputFileUploadProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onUpload(file);
    }
  }

  return (
    <Button component="label" role={undefined} variant="contained" disabled={disabled} tabIndex={-1} color={'primary'} startIcon={<CloudUploadIcon />}>
      Importieren...
      <VisuallyHiddenInput type="file" onChange={handleChange} multiple={false} />
    </Button>
  );
}
