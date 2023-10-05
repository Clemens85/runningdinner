import { Box, Container } from "@mui/material";
import { Alert, AlertTitle } from '@mui/material';
import { CallbackHandler, CONSTANTS } from "@runningdinner/shared";
import React from "react";
import { Trans } from "react-i18next";
import LinkExtern from "./common/theme/LinkExtern";
import { PrimaryButton } from "./common/theme/PrimaryButton";
import { Subtitle } from "./common/theme/typography/Tags";

interface ErrorBoundaryState {
  errorState: "ok" | "tryAgain";
}

export interface ClickHandler {
  onClick: CallbackHandler;
}

function TryAgain({onClick}: ClickHandler) {
  return (
    <Container maxWidth="lg">
      <Box my={6}>
        <Subtitle i18n="common:client_error_title"/>
        <Box my={2}>
          <Alert severity={"error"} variant={"outlined"}>
            <AlertTitle>
              <Trans i18nKey={"common:client_error_message"} values={{adminEmail: CONSTANTS.GLOBAL_ADMIN_EMAIL}}
                    // @ts-ignore
                    components={{ anchor: <LinkExtern /> }} />
            </AlertTitle>
            <Box my={1}>
              <PrimaryButton onClick={onClick}><Trans i18nKey="common:client_error_action" /></PrimaryButton>
            </Box>
          </Alert>
        </Box>
      </Box>
    </Container>
  );
}

export class ErrorBoundary extends React.Component<React.ReactNode, ErrorBoundaryState> {
  constructor(props: any) {
    super(props);

    this.state = {
      errorState: "ok",
    };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary::componentDidCatch:", error, errorInfo);
    this.setState({
      errorState: "tryAgain",
    });
  }

  resetErrorState = () => {
    this.setState({
      errorState: "ok",
    });
  };

  render() {
    if (this.state.errorState === "tryAgain") {
      return <TryAgain onClick={() => this.resetErrorState()} />;
    }
    return <>{this.props.children}</>;
  }
}