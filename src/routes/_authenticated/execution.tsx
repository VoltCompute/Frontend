import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  FileText,
  FolderArchive,
  AlertCircle,
  X,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  initSession,
  uploadCode,
  requestInvoice,
  getPaymentStatus,
  getSessionResult,
  closeSession,
  mockPay,
} from "@/api/sessions";
import type { InvoiceResult, SessionResult } from "@/api/sessions";
import type { ApiError } from "@/api/types";

export const Route = createFileRoute("/_authenticated/execution")({
  // machineId/machineName/pricePerMin sont passés par le marketplace (bouton
  // "Utiliser cette machine") : pas de route GET /machines/{id} publique
  // côté backend pour les re-résoudre depuis cette page.
  validateSearch: (search: Record<string, unknown>) => ({
    machineId: search.machineId !== undefined ? Number(search.machineId) : undefined,
    machineName: typeof search.machineName === "string" ? search.machineName : undefined,
    pricePerMin: search.pricePerMin !== undefined ? Number(search.pricePerMin) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Exécution — VoltCompute" },
      {
        name: "description",
        content: "Configurez et lancez vos workloads décentralisés sur les nodes du réseau.",
      },
    ],
  }),
  component: ExecutionPage,
});

type Phase =
  "idle" | "launching" | "awaiting_payment" | "running" | "completed" | "closed" | "error";

function ExecutionPage() {
  const { machineId, machineName, pricePerMin } = Route.useSearch();

  const [tab, setTab] = useState<"file" | "zip">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResult | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const accept = tab === "zip" ? ".zip" : ".py";

  function appendLog(text: string) {
    setLogs((prev) => [...prev, text]);
  }

  function handleFile(file: File) {
    setSelectedFile(file);
    toast.success(`Fichier sélectionné : ${file.name}`);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleLancer() {
    if (!machineId) {
      toast.error("Sélectionnez une machine depuis le marketplace.");
      return;
    }
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier.");
      return;
    }

    setPhase("launching");
    setLogs([]);
    setResult(null);
    try {
      appendLog("Création de la session...");
      const init = await initSession(machineId);
      setSessionId(init.session_id);

      appendLog(`Upload de ${selectedFile.name}...`);
      await uploadCode(init.session_id, selectedFile);

      appendLog("Génération de la facture Lightning...");
      const inv = await requestInvoice(init.session_id);
      setInvoice(inv);
      appendLog(`Facture générée : ${inv.amount_sats} sats. En attente du paiement...`);
      setPhase("awaiting_payment");
    } catch (err) {
      const message = (err as ApiError).message || "Échec du lancement.";
      appendLog(`ERREUR : ${message}`);
      toast.error(message);
      setPhase("error");
    }
  }

  async function checkPayment() {
    if (!sessionId) return;
    setCheckingPayment(true);
    try {
      const status = await getPaymentStatus(sessionId);
      if (status.paid) {
        appendLog("Paiement confirmé. Exécution lancée sur la machine...");
        setPhase("running");
      } else {
        toast.info("Paiement non détecté pour le moment.");
      }
    } catch (err) {
      toast.error((err as ApiError).message || "Échec de la vérification du paiement.");
    } finally {
      setCheckingPayment(false);
    }
  }

  async function simulatePayment() {
    if (!sessionId) return;
    try {
      await mockPay(sessionId);
      toast.success("Paiement simulé (mode dev).");
      await checkPayment();
    } catch (err) {
      toast.error((err as ApiError).message || "Simulation indisponible (LNbits en mode réel).");
    }
  }

  function copyInvoice() {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.payment_request);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyOutput() {
    if (!result?.result_output) return;
    navigator.clipboard.writeText(result.result_output);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  }

  // Polling du résultat tant que la session tourne.
  useEffect(() => {
    if (phase !== "running" || !sessionId) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const r = await getSessionResult(sessionId);
        if (cancelled) return;
        setResult(r);
        if (r.status === "completed" || r.status === "closed") {
          appendLog(
            r.execution_result === "error"
              ? "Exécution terminée avec une erreur."
              : "Exécution terminée avec succès.",
          );
          setPhase(r.status === "closed" ? "closed" : "completed");
        }
      } catch {
        // Erreur de polling transitoire : on retentera au prochain tick.
      }
    }, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase, sessionId]);

  async function handleClose() {
    if (!sessionId) return;
    setClosing(true);
    try {
      const res = await closeSession(sessionId);
      toast.success(
        phase === "completed"
          ? `Session clôturée. ${res.amount_credited} sats versés au fournisseur.`
          : "Exécution annulée et session clôturée.",
      );
      setPhase("closed");
    } catch (err) {
      toast.error((err as ApiError).message || "Échec de la clôture.");
    } finally {
      setClosing(false);
    }
  }

  function handleNewExecution() {
    setPhase("idle");
    setSessionId(null);
    setInvoice(null);
    setResult(null);
    setLogs([]);
    setSelectedFile(null);
  }

  // Après une erreur, on revient au formulaire sans perdre le fichier déjà
  // sélectionné : l'utilisateur n'a qu'à relancer.
  function handleRetry() {
    setPhase("idle");
    setLogs([]);
    setResult(null);
  }

  if (!machineId) {
    return (
      <AppShell>
        <div className="card-surface p-10 text-center">
          <h1 className="text-2xl font-bold mb-2">Aucune machine sélectionnée</h1>
          <p className="text-muted-foreground mb-6">
            Choisissez d'abord une machine dans le marketplace pour lancer une exécution.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center premium-gradient text-white font-semibold rounded-lg px-6 py-3 shadow-lg hover:opacity-95"
          >
            Aller au Marketplace
          </Link>
        </div>
      </AppShell>
    );
  }

  // Le formulaire (upload + lancement) n'est visible qu'à l'état de repos ;
  // dès le lancement, il cède toute la place à la console/résultat.
  const formVisible = phase === "idle";
  const hasFooterAction =
    phase === "awaiting_payment" ||
    phase === "running" ||
    phase === "completed" ||
    phase === "closed" ||
    phase === "error";

  return (
    <AppShell>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration d'Exécution</h1>
          <p className="text-muted-foreground mt-1.5">
            Préparez vos fichiers et lancez votre workload décentralisé.
          </p>
        </div>
        <div className="px-4 py-2 rounded-full bg-secondary/15 border border-secondary/30 text-sm">
          <span className="text-success">✓</span>{" "}
          <span className="font-semibold">{machineName ?? `Machine #${machineId}`}</span>
          {pricePerMin !== undefined && <> — {pricePerMin} Sats/min</>}
        </div>
      </div>

      {/* Les deux colonnes partagent une grille dont les pistes s'animent :
          la piste du formulaire passe de 1fr à 0fr (et inversement pour la
          console), ce qui laisse la console récupérer fluidement tout
          l'espace libéré, gap compris (calcul automatique par CSS Grid). */}
      <div
        className="grid items-start gap-6"
        style={{
          gridTemplateColumns: formVisible ? "1fr 0fr" : "0fr 1fr",
          transition: "grid-template-columns 500ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <section
          aria-hidden={!formVisible}
          className="min-w-0 overflow-hidden"
          style={{
            opacity: formVisible ? 1 : 0,
            pointerEvents: formVisible ? "auto" : "none",
            transition: formVisible ? "opacity 400ms ease-out 150ms" : "opacity 200ms ease-in",
          }}
        >
          <div className="card-surface overflow-hidden">
            <div className="flex border-b border-border">
              <TabBtn
                active={tab === "file"}
                onClick={() => {
                  setTab("file");
                  setSelectedFile(null);
                }}
                icon={FileText}
              >
                Fichier Python
              </TabBtn>
              <TabBtn
                active={tab === "zip"}
                onClick={() => {
                  setTab("zip");
                  setSelectedFile(null);
                }}
                icon={FolderArchive}
              >
                Archive ZIP
              </TabBtn>
            </div>

            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {selectedFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-4">
                  <FileText className="size-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{selectedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {formVisible && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg py-16 text-center hover:border-primary/50 transition cursor-pointer"
                >
                  <div className="size-14 rounded-full bg-surface-3 grid place-items-center mx-auto mb-4">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <div className="font-semibold text-lg">Déposez votre script ici</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {tab === "zip" ? "Archive .zip (Max 50MB)" : "Script Python .py (Max 50MB)"}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-5 px-5 py-2 rounded-lg bg-surface-2 border border-border text-sm font-medium hover:border-primary/50 transition"
                  >
                    Parcourir les fichiers
                  </button>
                </div>
              )}

              {formVisible && (
                <button
                  onClick={handleLancer}
                  className="w-full mt-6 premium-gradient text-white font-semibold rounded-lg py-4 flex items-center justify-center gap-2.5 shadow-lg hover:opacity-95 text-base"
                >
                  {pricePerMin !== undefined
                    ? `⚡ Lancer l'exécution (${pricePerMin * 30} Sats)`
                    : "⚡ Lancer l'exécution"}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside
          aria-hidden={formVisible}
          className="min-w-0 overflow-hidden card-surface flex flex-col min-h-[600px] bg-[oklch(0.10_0.02_270)] dark:bg-[oklch(0.10_0.02_270)]"
          style={{
            opacity: formVisible ? 0 : 1,
            pointerEvents: formVisible ? "none" : "auto",
            transition: formVisible ? "opacity 200ms ease-in" : "opacity 400ms ease-out 150ms",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`size-2 rounded-full pulse-dot ${
                  phase === "running" || phase === "launching"
                    ? "bg-success text-success"
                    : "bg-destructive text-destructive"
                }`}
              />
              <span className="font-semibold">Console</span>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-md bg-surface-3 border border-border">
              {sessionId ? `Session #${sessionId} · ${phase}` : "Aucune session"}
            </div>
          </div>

          <div className="flex-1 px-5 py-4 font-mono text-[13px] leading-6 space-y-1 overflow-y-auto">
            {logs.map((line, i) => (
              <div
                key={i}
                className={line.startsWith("ERREUR") ? "text-destructive" : "text-success"}
              >
                {line}
              </div>
            ))}

            {phase === "running" && (
              <div className="flex items-center gap-2 text-muted-foreground pt-2">
                <Loader2 className="size-3.5 animate-spin" /> En attente du résultat...
              </div>
            )}

            {result?.result_output && (
              <div className="relative mt-3">
                <pre className="whitespace-pre-wrap text-foreground border border-border rounded-lg p-3 pr-12 bg-surface-2">
                  {result.result_output}
                </pre>
                <button
                  onClick={copyOutput}
                  className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                  title="Copier la sortie"
                >
                  {copiedOutput ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            )}

            {result?.execution_result === "error" && (
              <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-destructive">Le script a échoué</div>
                    {result.error_message && (
                      <div className="text-xs text-muted-foreground leading-5">
                        {result.error_message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {phase === "closed" && (
              <div className="mt-4 flex items-center gap-2 text-success">
                <CheckCircle2 className="size-4" /> Session clôturée.
              </div>
            )}

            <div className="text-muted-foreground pt-2">_</div>
          </div>

          {hasFooterAction && (
            <div className="border-t border-border px-5 py-4 font-sans">
              {phase === "awaiting_payment" && invoice && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    Facture Lightning — {invoice.amount_sats} sats
                  </div>
                  {/* QR code de la facture (scannable avec un wallet Lightning) */}
                  <div className="flex justify-center">
                    <div className="bg-white rounded-lg p-3">
                      <QRCodeSVG value={invoice.payment_request} size={180} level="M" />
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="bg-input border border-border rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto pr-12 whitespace-pre-wrap break-all">
                      {invoice.payment_request}
                    </pre>
                    <button
                      onClick={copyInvoice}
                      className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                      title="Copier"
                    >
                      {copied ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={checkPayment}
                      disabled={checkingPayment}
                      className="px-4 py-2 rounded-md premium-gradient text-white text-sm font-medium hover:opacity-95 disabled:opacity-60 inline-flex items-center gap-2"
                    >
                      {checkingPayment ? <Loader2 className="size-4 animate-spin" /> : null}
                      J'ai payé, vérifier
                    </button>
                    <button
                      onClick={simulatePayment}
                      className="px-4 py-2 rounded-md bg-surface-2 border border-border text-sm font-medium hover:border-primary/50"
                      title="Disponible uniquement si le backend tourne en mode mock LNbits"
                    >
                      Simuler le paiement (dev)
                    </button>
                  </div>
                </div>
              )}

              {(phase === "completed" || phase === "running") && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="w-full rounded-lg border border-destructive/30 bg-destructive/10 text-destructive font-semibold py-3 flex items-center justify-center gap-2 hover:bg-destructive/20 disabled:opacity-60"
                >
                  {closing ? <Loader2 className="size-4 animate-spin" /> : null}
                  {phase === "completed"
                    ? "Clôturer et verser les fonds au fournisseur"
                    : "Annuler l'exécution"}
                </button>
              )}

              {phase === "closed" && (
                <button
                  onClick={handleNewExecution}
                  className="w-full px-5 py-3 rounded-lg bg-surface-2 border border-border text-sm font-medium hover:border-primary/50 transition"
                >
                  Lancer une nouvelle exécution
                </button>
              )}

              {phase === "error" && (
                <button
                  onClick={handleRetry}
                  className="w-full px-5 py-3 rounded-lg bg-surface-2 border border-border text-sm font-medium hover:border-primary/50 transition"
                >
                  Réessayer
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  icon: Icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" /> {children}
    </button>
  );
}
