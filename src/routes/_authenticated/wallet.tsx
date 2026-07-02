import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Minus, Plus, Shield, Landmark, Gauge, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { getStoredUser } from "@/api/auth";
import { getTransactions, getWalletSummary, withdraw, getPlatformRevenue } from "@/api/wallet";
import type { Transaction, PlatformRevenue } from "@/api/wallet";
import type { ApiError } from "@/api/types";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "Portefeuille — VoltCompute" },
      {
        name: "description",
        content: "Suivez votre solde Lightning, vos gains et l'historique de vos transactions.",
      },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const user = getStoredUser();

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenue, setRevenue] = useState<PlatformRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showAll, setShowAll] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  async function loadWallet() {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [summary, txs] = await Promise.all([
        getWalletSummary(user.user_id),
        getTransactions(user.user_id),
      ]);
      setBalance(summary.balance_sats);
      setTransactions(txs);
    } catch (err) {
      setLoadError((err as ApiError).message || "Impossible de charger le portefeuille.");
    } finally {
      setLoading(false);
    }
    // Revenus plateforme : chargé séparément → n'impacte JAMAIS le portefeuille si ça échoue.
    getPlatformRevenue()
      .then(setRevenue)
      .catch(() => setRevenue(null));
  }

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openWithdraw() {
    setAmount(balance ? String(balance) : "");
    setShowWithdraw(true);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const amountSats = Number(amount);
    if (!invoice.trim()) {
      toast.error("Veuillez entrer une facture Lightning.");
      return;
    }
    if (!Number.isInteger(amountSats) || amountSats <= 0) {
      toast.error("Montant invalide.");
      return;
    }
    if (balance !== null && amountSats > balance) {
      toast.error(`Solde insuffisant (${balance} Sats disponibles).`);
      return;
    }
    setWithdrawing(true);
    try {
      await withdraw(user.user_id, amountSats, invoice.trim());
      toast.success(`Retrait de ${amountSats} Sats initié avec succès !`);
      setShowWithdraw(false);
      setInvoice("");
      setAmount("");
      await loadWallet();
    } catch (err) {
      toast.error((err as ApiError).message || "Échec du retrait.");
    } finally {
      setWithdrawing(false);
    }
  }

  // Dérivé du vrai historique : le backend n'expose pas d'agrégat 24h tout fait.
  const { in24h, out24h } = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let inSum = 0;
    let outSum = 0;
    for (const t of transactions) {
      if (new Date(t.created_at).getTime() < cutoff) continue;
      if (t.amount_sats > 0) inSum += t.amount_sats;
      else outSum += t.amount_sats;
    }
    return { in24h: inSum, out24h: outSum };
  }, [transactions]);

  const visibleTx = showAll ? transactions : transactions.slice(0, 4);

  if (!user) {
    return (
      <AppShell>
        <div className="text-center py-16 text-sm text-destructive">
          Session invalide. Reconnectez-vous.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
        <div className="card-surface p-7">
          <div className="text-sm text-muted-foreground">Solde total disponible</div>
          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            {loading ? (
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-5xl font-bold premium-gradient-text">
                {(balance ?? 0).toLocaleString("fr-FR")} Satoshis
              </span>
            )}
          </div>
          {loadError && <p className="text-sm text-destructive mt-2">{loadError}</p>}

          {showWithdraw ? (
            <form onSubmit={handleWithdraw} className="mt-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Retrait Lightning</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdraw(false);
                    setInvoice("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Montant en Sats"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
              <input
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="Facture Lightning (lnbc...)"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <button
                type="submit"
                disabled={withdrawing}
                className="premium-gradient text-white font-semibold rounded-lg px-6 py-3 inline-flex items-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-60"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Envoi...
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" /> Confirmer le retrait
                  </>
                )}
              </button>
            </form>
          ) : (
            <button
              onClick={openWithdraw}
              disabled={loading || !balance}
              className="mt-6 premium-gradient text-white font-semibold rounded-lg px-6 py-3 inline-flex items-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-60"
            >
              <LogOut className="size-4" /> 💰 Retirer mes gains
            </button>
          )}
        </div>
        <div className="grid grid-rows-2 gap-4">
          <SmallStat label="Entrées 24h" value={`+${in24h} Sats`} tone="success" />
          <SmallStat label="Sorties 24h" value={`${out24h} Sats`} tone="tertiary" />
        </div>
      </div>

      {revenue && (
        <div className="card-surface p-6 mb-5 border-primary/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Landmark className="size-4 text-primary" /> Revenus plateforme · commission{" "}
                {Math.round(revenue.commission_rate * 100)}%
              </div>
              <div className="mt-2 text-4xl font-bold premium-gradient-text">
                {revenue.total_commission_sats.toLocaleString("fr-FR")} Sats
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                prélevés sur {revenue.session_count} session
                {revenue.session_count > 1 ? "s" : ""} · volume total{" "}
                {revenue.total_volume_sats.toLocaleString("fr-FR")} Sats
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Reversé aux fournisseurs</div>
              <div className="text-2xl font-bold text-success mt-1">
                {revenue.total_net_to_providers_sats.toLocaleString("fr-FR")} Sats
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-surface p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Historique des transactions</h2>
          {transactions.length > 4 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-sm text-primary font-medium hover:underline"
            >
              {showAll ? "Réduire" : "Voir tout"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Chargement...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Aucune transaction pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleTx.map((t) => {
              const isCredit = t.amount_sats > 0;
              return (
                <div key={t.transaction_id} className="py-4 flex items-center gap-4">
                  <div
                    className={`size-10 rounded-full grid place-items-center ${
                      isCredit ? "bg-success/15 text-success" : "bg-tertiary/15 text-tertiary"
                    }`}
                  >
                    {isCredit ? <Plus className="size-4" /> : <Minus className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{t.description}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span
                        className={`size-1.5 rounded-full ${isCredit ? "bg-success" : "bg-tertiary"}`}
                      />
                      {isCredit ? "Crédit" : "Débit"} ·{" "}
                      {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-bold font-mono ${isCredit ? "text-success" : "text-tertiary"}`}
                    >
                      {isCredit ? "+" : ""}
                      {t.amount_sats} Sats
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Réf. #{t.transaction_id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          icon={Shield}
          tone="primary"
          title="Sécurité"
          body="Vos fonds sont sécurisés par le protocole Lightning. Les transactions sont instantanées et souveraines."
        />
        <FeatureCard
          icon={Landmark}
          tone="tertiary"
          title="Frais minimes"
          body="Profitez des frais de transaction les plus bas du marché grâce à notre infrastructure décentralisée."
        />
        <FeatureCard
          icon={Gauge}
          tone="secondary"
          title="Instant Cash-out"
          body="Retirez vos gains à tout moment vers n'importe quel portefeuille compatible Lightning Network."
        />
      </div>
    </AppShell>
  );
}

function SmallStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "tertiary";
}) {
  const color = tone === "success" ? "text-success" : "text-tertiary";
  return (
    <div className="card-surface p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tone: "primary" | "secondary" | "tertiary";
}) {
  const ring =
    tone === "primary"
      ? "border-primary/30"
      : tone === "secondary"
        ? "border-secondary/30"
        : "border-tertiary/30";
  const color =
    tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-tertiary";
  return (
    <div className={`card-surface p-5 ${ring}`}>
      <Icon className={`size-5 ${color} mb-3`} />
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
