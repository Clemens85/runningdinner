
export function sendTeamMessagesToAllTeams(adminId) {
  const body = {
    subject: "Subject",
    message: "Message",
    hostMessagePartTemplate: "Host Message Part",
    nonHostMessagePartTemplate: "Non Host Message Part",
    teamSelection: "ALL",
  }
  return cy.request({
    method: "PUT",
    url:  `/rest/messageservice/v1/runningdinner/${adminId}/mails/team`,
    body
  });
}

export function acknowledgeRunningDinner(adminId) {
  return cy.request({
    method: "PUT",
    url:  `/rest/developservice/v1/runningdinner/${adminId}/acknowledge`
  });
}