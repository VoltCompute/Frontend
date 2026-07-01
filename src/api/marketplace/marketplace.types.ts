/** Miroir de `MachineOwner` (backend/app/schemas/machine.py). */
export type MachineOwner = {
  first_name: string;
  last_name: string;
};

/** Miroir de `MachineResponse` (backend/app/schemas/machine.py). */
export type MarketplaceMachine = {
  machine_id: number;
  name: string;
  owner_id: number;
  owner: MachineOwner | null;
  gpu: string | null;
  cpu: string | null;
  ram: string | null;
  /** Prix en sats par minute. Le montant facturé = price_per_min × 30 (bloc de session). */
  price_per_min: number;
  localisation_pays: string | null;
  localisation_ville: string | null;
  status: string;
  is_online: boolean;
  gain_total_fait_avec: number;
  last_seen_at: string | null;
  specs_json: unknown;
};
