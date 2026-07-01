/**
 * Cycle de vie d'une session (backend/app/models/session.py) :
 * pending_upload → pending_payment → running → completed → closed
 * (ou running → panne agent → closed, remboursée).
 */
export type SessionStatus =
  "pending_upload" | "pending_payment" | "running" | "completed" | "closed";

export type InitSessionResult = {
  success: boolean;
  session_id: number;
  status: SessionStatus;
};

export type UploadResult = {
  success: boolean;
  session_id: number;
  status: SessionStatus;
  file_path: string;
};

/** Miroir de `InvoiceResponse`. amount_sats = price_per_min × 30 (figé ici, jamais recalculé). */
export type InvoiceResult = {
  payment_request: string;
  payment_hash: string;
  amount_sats: number;
};

export type PaymentStatusResult = {
  paid: boolean;
  status: SessionStatus;
};

/** Miroir de `ResultResponse`. result_output reste null tant que status="running". */
export type SessionResult = {
  session_id: number;
  status: SessionStatus;
  execution_result: "success" | "error" | null;
  result_output: string | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type CloseResult = {
  success: boolean;
  session_id: number;
  status: "closed";
  amount_credited: number;
};
