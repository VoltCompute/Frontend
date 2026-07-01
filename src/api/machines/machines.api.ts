import { apiClient } from "../client";
import type {
  AddMachinePayload,
  AddMachineResult,
  Machine,
  ToggleMachineResult,
} from "./machines.types";

/** Liste les machines du fournisseur connecté (GET /api/machines). JWT requis. */
export async function getMyMachines(): Promise<Machine[]> {
  const { data } = await apiClient.get<Machine[]>("/api/machines");
  return data;
}

/**
 * Enregistre une nouvelle machine (POST /api/machines/add), créée `inactive`
 * et sans specs : il faut ensuite lancer l'agent sur la machine physique
 * avec le `run_command` renvoyé pour qu'elle détecte ses specs et passe en
 * ligne (`update_specs` côté Socket.IO).
 */
export async function addMachine(payload: AddMachinePayload): Promise<AddMachineResult> {
  const { data } = await apiClient.post<AddMachineResult>("/api/machines/add", payload);
  return data;
}

/** Active (réservable sur le marketplace) ou désactive une machine. */
export async function toggleMachine(
  machineId: number,
  status: "active" | "inactive",
): Promise<ToggleMachineResult> {
  const { data } = await apiClient.put<ToggleMachineResult>(`/api/machines/${machineId}/toggle`, {
    status,
  });
  return data;
}

/** Supprime définitivement une machine du compte du fournisseur. */
export async function deleteMachine(machineId: number): Promise<void> {
  await apiClient.delete(`/api/machines/${machineId}`);
}
