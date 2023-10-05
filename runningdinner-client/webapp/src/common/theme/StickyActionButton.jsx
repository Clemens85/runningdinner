import AddIcon from "@mui/icons-material/Add";
import React from "react";
import {Fab} from "@mui/material";
import {styled} from "@mui/material/styles";

const StickyActionCircle = styled(Fab)({
  margin: 0,
  top: 'auto',
  left: 'auto',
  bottom: 20,
  right: 20,
  position: 'fixed',
  color: 'white'
});

export const StickyActionButton = ({onClick}) => {
  return (
      <StickyActionCircle color="primary" aria-label="add" onClick={onClick}>
        <AddIcon />
      </StickyActionCircle>
  );
};
