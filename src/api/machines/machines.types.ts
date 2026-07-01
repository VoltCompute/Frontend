/** Miroir de `MachineResponse` (backend/app/schemas/machine.py). */
export type Machine = {
  machine_id: number;
  name: string;
  owner_id: number;
  gpu: string | null;
  cpu: string | null;
  ram: string | null;
  /** Prix en sats par minute. */
  price_per_min: number;
  localisation_pays: string | null;
  localisation_ville: string | null;
  /** "active" | "inactive" — bascule manuelle du fournisseur. */
  status: "active" | "inactive";
  /** Agent connecté en Socket.IO en ce moment. Réservable ⇔ status="active" ET is_online. */
  is_online: boolean;
  gain_total_fait_avec: number;
  last_seen_at: string | null;
  specs_json: Record<string, unknown> | null;
};

/**
 * Miroir de `AddMachineRequest` (backend/app/schemas/machine.py).
 * gpu/cpu/ram ne se saisissent PAS à la création : ils sont détectés
 * automatiquement par l'agent (événement Socket.IO `update_specs`) dès
 * qu'il se connecte avec l'agent_token retourné par cet appel.
 */
export type AddMachinePayload = {
  name: string;
  price_per_min: number;
  localisation_pays?: string;
  localisation_ville?: string;
};

/**
 * Miroir de `AddMachineResponse`. `agent_token` n'est renvoyé qu'ici, une
 * seule fois : GET /api/machines ne le redonne jamais ensuite.
 */
export type AddMachineResult = {
  success: boolean;
  machine_id: number;
  agent_token: string;
  run_command: string;
};

export type ToggleMachineResult = {
  success: boolean;
  new_status: "active" | "inactive";
};
