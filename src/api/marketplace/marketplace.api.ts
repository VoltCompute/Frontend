import { apiClient } from "../client";
import type { MarketplaceMachine } from "./marketplace.types";

/**
 * Liste les machines disponibles à la location (GET /api/marketplace).
 * Route publique : aucun JWT requis. Le backend ne renvoie déjà que les
 * machines `status=active` ET `is_online=true` — tout ce qui revient ici
 * est réservable immédiatement.
 *
 * @param filters.gpu  ne garder que les machines avec GPU.
 * @param filters.ram  RAM minimale en GB (filtre approximatif côté backend).
 */
export async function getMarketplaceMachines(filters?: {
  gpu?: boolean;
  ram?: number;
}): Promise<MarketplaceMachine[]> {
  const { data } = await apiClient.get<MarketplaceMachine[]>("/api/marketplace", {
    params: filters,
  });
  return data;
}
