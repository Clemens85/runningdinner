import axios from "axios";
import {BackendConfig} from "../BackendConfig.ts";
import { Participant, ParticipantList } from "../index.ts";

export function getParticipantsExportJsonUrl(adminId: string) {
  return BackendConfig.buildUrl(`/export/v1/runningdinner/${adminId}/participants`);
}

export async function importParticipantsFromJson(adminId: string, participantsAsJson: string): Promise<Participant[]> {
  const url = BackendConfig.buildUrl(`/import/v1/runningdinner/${adminId}/participants`);
  const response = await axios.request<ParticipantList>({
    url: url,
    method: 'POST',
    data: participantsAsJson,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const failedParticipantsList = response.data;
  return failedParticipantsList.participants || [];
}