import { Chip, Dialog, DialogContent, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { CallbackHandler, findEntityById, isAfterPartyLocationDefined, useDinnerRouteOverviewContext } from "@runningdinner/shared";
import { Trans, useTranslation } from "react-i18next";
import { commonStyles } from "../../common/theme/CommonStyles";
import { DialogTitleCloseable } from "../../common/theme/DialogTitleCloseable";
import Paragraph from "../../common/theme/typography/Paragraph";
import DialogActionsPanel from "../../common/theme/DialogActionsPanel";
import { getAfterPartyLocationIcon, getMealTypeIcon } from "../../common/dinnerroute";

type DinnerRouteOverviewHelpDialogProps = {
  onClose: CallbackHandler;
};

const LongestDistance = styled('span')(({theme}) => ({
  color: theme.palette.secondary.main,
  fontWeight: 'bold'
}));

export function DinnerRouteOverviewHelpDialog({onClose}: DinnerRouteOverviewHelpDialogProps) {

  const {t} = useTranslation(["common", "admin"]);

  const {state} = useDinnerRouteOverviewContext();
  const {mealTypeMappings, meals, afterPartyLocation} = state;

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};
  

  const handleClose = () => {
    onClose();
  };

  const dividerSxProps = {
    my: 3,
    mx: isMobileDevice ? 0 : 9
  }

  return (
    <Dialog onClose={handleClose} open={true} maxWidth={"md"} sx={{
      ...fullWidthProps,
      zIndex: 10002
    }}>
      <DialogTitleCloseable onClose={handleClose}>{t("common:help")}</DialogTitleCloseable>
      <DialogContent>
        <Paragraph>
          {t("admin:dinner_route_help_intro_1")}<br/>
          {t("admin:dinner_route_help_intro_2")}
        </Paragraph>

        <Divider sx={dividerSxProps}><strong>{t("common:general")}</strong></Divider>

        <Paragraph>
          <Trans i18nKey="admin:dinner_route_help_filter" components={{ strong: <strong /> }} />
        </Paragraph><br/>
        <Paragraph>
          {t("admin:dinner_route_help_meals")}
        </Paragraph>
        <List dense>
          { Object.keys(mealTypeMappings).map((mealId) => 
            <ListItem disablePadding key={mealId}>
              <ListItemButton>
                <ListItemIcon>
                  { getMealTypeIcon(mealTypeMappings[mealId]) }
                </ListItemIcon>
                <ListItemText primary={findEntityById(meals, mealId)?.label} />
              </ListItemButton>
            </ListItem>
          )}
          { isAfterPartyLocationDefined(afterPartyLocation) && 
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  { getAfterPartyLocationIcon() }
                </ListItemIcon>
                <ListItemText primary={afterPartyLocation?.title} />
              </ListItemButton>
            </ListItem>
          }
        </List>

        <Divider sx={dividerSxProps}><strong>{t("admin:dinner_route_help_near_distance_title")}</strong></Divider>
        <Paragraph>{t("admin:dinner_route_help_near_distance")}</Paragraph>

        <Divider sx={dividerSxProps}><strong>{t("admin:dinner_route_filter_meal_routes_title")}</strong></Divider>
        <Paragraph>
          {t("admin:dinner_route_help_from_meal_to_meal_1")}<br/>
          <Trans i18nKey={"admin:dinner_route_help_from_meal_to_meal_2"}
                  values={{ from: meals[0].label, to: meals[1].label }}
                 components={{ strong: <strong/> }} /><br/>
         <Trans i18nKey={"admin:dinner_route_help_from_meal_to_meal_3"}
                  values={{ from: meals[0].label, to: meals[1].label }}
                 components={{ strong: <strong/> }} /><br/>
          <Trans i18nKey={"admin:dinner_route_help_from_meal_to_meal_4"}
                 components={{ strong: <strong/> }} />
        </Paragraph>

        <Divider sx={dividerSxProps}><strong>{t("admin:dinner_route_help_distances")}</strong></Divider>
        <Typography variant={"body1"} component="div">
          {t("admin:dinner_route_help_distances_1")}<br/>
          {t("admin:dinner_route_help_distances_2")}<br/>
          <Trans i18nKey={"admin:dinner_route_help_distances_3"} components={{ LongestDistance: <LongestDistance /> }} />
          <br/><br/>
          
          {t("admin:dinner_route_help_distances_4")}
          (
            { meals.map((meal, index) => 
              <span key={meal.id}>
                {meal.label}{index < meals.length - 1 ? " -> " : ""}
              </span>
            )}
          ).<br/>
          {t("admin:dinner_route_help_distances_5")} <Chip label={`Team 1`} color={"primary"} variant={"filled"} sx={{ mr: 1, ml: 1}} /><br/>
        </Typography>

        <Divider sx={dividerSxProps}><strong>{t("common:misc")}</strong></Divider>
        <Paragraph>
          <Trans i18nKey={"admin:dinner_route_help_misc"} />
        </Paragraph>

      </DialogContent>
      <DialogActionsPanel onOk={handleClose}
                          onCancel={handleClose} 
                          okLabel={t("common:ok")} 
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}