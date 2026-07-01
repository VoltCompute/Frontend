import { apiClient } from "../client";
import type { Transaction, WalletSummary } from "./wallet.types";

/** Solde courant en sats (GET /api/wallet/summary/{user_id}). */
export async function getWalletSummary(userId: number): Promise<WalletSummary> {
  const { data } = await apiClient.get<WalletSummary>(`/api/wallet/summary/${userId}`);
  return data;
}

/** Historique des transactions (earning/consumption/withdrawal/refund), récent → ancien. */
export async function getTransactions(userId: number): Promise<Transaction[]> {
  const { data } = await apiClient.get<Transaction[]>(`/api/wallet/transactions/${userId}`);
  return data;
}

/**
 * Effectue un retrait complet en deux appels, comme l'exige le backend :
 *  1. POST /amount_retrait — enregistre le montant à retirer (vérifie le solde).
 *  2. GET  /withdraw — paie réellement la facture Lightning fournie et déduit le solde.
 * `lightning_invoice` est répété dans les deux appels par le schéma backend,
 * mais seul le second l'utilise réellement.
 */
export async function withdraw(
  userId: number,
  amountSats: number,
  lightningInvoice: string,
): Promise<void> {
  await apiClient.post(
    "/api/wallet/amount_retrait",
    { amount_sats: amountSats, lightning_invoice: lightningInvoice },
    { params: { user_id: userId } },
  );
  await apiClient.get("/api/wallet/withdraw", {
    params: { user_id: userId, lightning_invoice: lightningInvoice },
  });
}
