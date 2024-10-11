import React from "react";
import {useTranslation} from "react-i18next";
import {styled} from "@mui/material/styles";

const CancelledTeamMemberText = styled('span')(({theme}) => ({
  color: theme.palette.secondary.main,
  letterSpacing: "2px",
  textTransform: "uppercase"
}));

export function CancelledTeamMember() {

  const {t} = useTranslation(['common', 'admin']);
  return (
      <CancelledTeamMemberText>{(t('admin:cancelled'))}</CancelledTeamMemberText>
  );

}
