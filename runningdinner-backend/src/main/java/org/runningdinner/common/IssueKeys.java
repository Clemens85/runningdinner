package org.runningdinner.common;

public interface IssueKeys {

  String PARTICIPANT_ALREADY_REGISTERED = "participant_already_registered";
  String PARTICIPANT_ASSINGED_IN_TEAM = "participant_assigned_in_team";
  String TEAM_NO_TEAM_MEMBERS_LEFT = "team_no_team_members_left";
  String PARTICIPANT_EMAIL_EQUALS_TEAM_PARTNER_WISH = "participant_email_equals_team_partner_wish";
  String TEAM_PARTNER_WISH_UPDATE_INVALID = "team_partner_wish_update_invalid";

  String FULLNAME_NOT_VALID = "fullname_invalid";

  String REGISTRATION_DATE_EXPIRED = "registration_date_expired";
  String RUNNINGDINNER_DATE_EXPIRED = "runningdinner_date_expired";

  String PARTICIPANT_ACTIVATION_INVALID_DEMO_DINNER = "participant_activation_invalid_demo_dinner";

  String TOO_MANY_PARTICIPANTS = "too_many_participants";

  String ADDRESS_FORMAT_INVALID = "address_format_invalid";
  String ADDRESS_STREET_NR_INVALID = "address_street_nr_invalid";
  String ADDRESS_CITY_ZIP_INVALID = "address_city_zip_invalid";

  String INVALID_SIZE_REPLACEMENT_PARTICIPANTS_TOO_LITTLE = "invalid_size_replacement_participants_too_little";
  String INVALID_SIZE_REPLACEMENT_PARTICIPANTS_TOO_MANY = "invalid_size_replacement_participants_too_many";

  String INVALID_SIZE_SELECTED_PARTICIPANTS_MESSAGE_EMPTY = "invalid_size_selected_participants_message_empty";
  String TEAM_SWAP_VIOLATES_TEAM_PARTNER_WISH = "team_swap_violates_team_partner_wish";

  String INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_ASSIGN = "invalid_size_waitinglist_participants_to_assign";
  String INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_GENERATE_TEAMS = "invalid_size_waitinglist_participants_to_generate_teams";
  String INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_GENERATE_TEAMS_TOO_FEW = "invalid_size_waitinglist_participants_to_generate_teams_too_few";
  
  String NUM_SEATS_TEAMPARTNER_REGISTRATION_INVALID = "num_seats_teampartner_registration_invalid";
  
  String REGISTRATION_NOT_POSSIBLE_WITHOUT_PAYMENT = "registration_not_possible_without_payment";
  
  String INVALID_TEAM_MEMBER_CANCELLATION_ROOT_TEAMPARTNER = "invalid_team_member_cancellation_root_teampartner";
  String INVALID_REPLACEMENT_PARTICIPANTS_INCONSISTENT_TEAMPARTNER_WISH = "invalid_replacement_participants_inconsistent_teampartner_wish";
  String INVALID_WAITINGLIST_TEAMGENERATION_INCONSISTENT_TEAMPARTNER_WISH = "invalid_waitinglist_teamgeneration_inconsistent_teampartner_wish";
  
  String PARTICIPANT_SWAP_NUMBER_VIOLATES_TEAM_PARTNER_WISH = "participant_swap_number_violates_team_partner_wish";
}
