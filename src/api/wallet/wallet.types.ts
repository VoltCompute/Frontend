/** Miroir de `WalletSummaryResponse` (backend/app/schemas/wallet.py). */
export type WalletSummary = {
  balance_sats: number;
};

/** Miroir de `TransactionResponse`. amount_sats signé : > 0 crédit, < 0 débit. */
export type Transaction = {
  transaction_id: number;
  amount_sats: number;
  tx_type: "earning" | "consumption" | "withdrawal" | "refund";
  description: string;
  session_id: number | null;
  created_at: string;
};

/** Miroir de `PlatformRevenueResponse` — commissions cumulées de la plateforme. */
export type PlatformRevenue = {
  total_commission_sats: number;
  total_volume_sats: number;
  total_net_to_providers_sats: number;
  session_count: number;
  commission_rate: number;
};
