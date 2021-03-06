import React from 'react';
import WizardMenuNotificationBar from "./WizardMenuNotificationBar";
import {AppBar, List, ListItem, ListItemText, Toolbar} from "@material-ui/core";
import {useWizardSelector} from "./WizardStore";
import {getNavigationStepsSelector} from "./WizardSlice";
import {useTranslation} from "react-i18next";

export default function WizardMenu() {

  const navigationSteps = useWizardSelector(getNavigationStepsSelector);
  const {t} = useTranslation('wizard');

  return (
      <div>
        <WizardMenuNotificationBar />
        <AppBar position="static">
          <Toolbar component={"nav"}>
            <List component="nav" aria-labelledby="main navigation">
              {navigationSteps.map(({ label, value }) => (
                <ListItem button key={value}>
                  <ListItemText primary={t(label)} />
                </ListItem>
              ))}
            </List>
          </Toolbar>
        </AppBar>
      </div>
  );
}
