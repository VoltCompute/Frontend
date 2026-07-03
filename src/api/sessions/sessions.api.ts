import { apiClient } from "../client";
import type {
  CloseResult,
  InitSessionResult,
  InvoiceResult,
  PaymentStatusResult,
  SessionResult,
  UploadResult,
} from "./sessions.types";

/** Crée une session sur la machine choisie (POST /api/sessions/init). La machine doit être active. */
export async function initSession(machineId: number): Promise<InitSessionResult> {
  const { data } = await apiClient.post<InitSessionResult>("/api/sessions/init", {
    machine_id: machineId,
  });
  return data;
}

/** Envoie le code (.py ou .zip, ≤50 Mo) → fait passer la session en pending_payment. */
export async function uploadCode(sessionId: number, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<UploadResult>(`/api/sessions/${sessionId}/upload`, form);
  return data;
}

/** Fige le montant (price_per_min × 30) et génère la facture Lightning à payer. */
export async function requestInvoice(sessionId: number): Promise<InvoiceResult> {
  const { data } = await apiClient.post<InvoiceResult>(
    `/api/sessions/${sessionId}/request-invoice`,
  );
  return data;
}

/**
 * À appeler en polling après paiement : si payé, fait passer la session à
 * "running" et déclenche l'exécution côté agent (aucun versement ici).
 */
export async function getPaymentStatus(sessionId: number): Promise<PaymentStatusResult> {
  const { data } = await apiClient.get<PaymentStatusResult>(
    `/api/sessions/${sessionId}/payment-status`,
  );
  return data;
}

/** Résultat de l'exécution, à poller : result_output reste null tant que status="running". */
export async function getSessionResult(sessionId: number): Promise<SessionResult> {
  const { data } = await apiClient.get<SessionResult>(`/api/sessions/${sessionId}/result`);
  return data;
}

/**
 * Clôture la session : verse les fonds au fournisseur (ou annule l'exécution en
 * cours via cancel_job si la session tourne encore, puis clôture sans paiement).
 */
export async function closeSession(sessionId: number): Promise<CloseResult> {
  const { data } = await apiClient.post<CloseResult>(`/api/sessions/${sessionId}/close`);
  return data;
}
