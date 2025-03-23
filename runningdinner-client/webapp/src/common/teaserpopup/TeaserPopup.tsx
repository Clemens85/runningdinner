import React from "react";
import { useTeaserPopup } from "./useTeaserPopup"
import { CallbackHandler } from "@runningdinner/shared";

// Show until 2024-04-10
const showUntil = new Date(2024, 3, 10);

export function TeaserPopup() {
  
  const [remindMe, setRemindMe] = React.useState(false);

  const {closeTeaserPopup, setTeaserPopupOpenIfSuitable, showTeaserPopup} = useTeaserPopup({popupKey: "__POPUPKEY__", showUntil});

  React.useEffect(() => {
    setTeaserPopupOpenIfSuitable();
  }, [setTeaserPopupOpenIfSuitable]);

  
  if (showTeaserPopup) {
    return <TeaserPopupView onClose={() => closeTeaserPopup(remindMe)} remindMe={remindMe} onRemindMeChanged={setRemindMe} />;
  }
  return null;
}

type RemindMeProps = {
  remindMe: boolean;
  onRemindMeChanged: (remindMe: boolean) => unknown;
  onClose: CallbackHandler;
};

function TeaserPopupView({remindMe}: RemindMeProps) {
  console.log(`TeaserPopupView: ${remindMe}`);
  return null;
}
