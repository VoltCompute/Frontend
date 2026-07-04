import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Minus, Plus, Shield, Landmark, Gauge, X, Loader2, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { AppShell } from "@/components/AppShell";
import { notify } from "@/components/ui/notify";
import { getStoredUser } from "@/api/auth";
import { getTransactions, getWalletSummary, withdraw } from "@/api/wallet";
import type { Transaction } from "@/api/wallet";
import type { ApiError } from "@/api/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const revenueChartConfig = {
  sats: { label: "Revenus", color: "var(--success)" },
} satisfies ChartConfig;

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
      notify.error("Veuillez entrer une facture Lightning.");
      return;
    }
    if (!Number.isInteger(amountSats) || amountSats <= 0) {
      notify.error("Montant invalide.");
      return;
    }
    if (balance !== null && amountSats > balance) {
      notify.error(`Solde insuffisant (${balance} Sats disponibles).`);
      return;
    }
    setWithdrawing(true);
    try {
      await withdraw(user.user_id, amountSats, invoice.trim());
      notify.success(`Retrait de ${amountSats} Sats initié avec succès !`);
      setShowWithdraw(false);
      setInvoice("");
      setAmount("");
      await loadWallet();
    } catch (err) {
      notify.error((err as ApiError).message || "Échec du retrait.");
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

  // Revenus = gains ("earning") uniquement, agrégés par jour pour visualiser la variation.
  const revenueHistory = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const t of transactions) {
      if (t.tx_type !== "earning" || t.amount_sats <= 0) continue;
      const day = new Date(t.created_at).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + t.amount_sats);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, sats]) => ({ day, sats }));
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

      <div className="card-surface p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="size-5 text-success" /> Évolution de vos revenus
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Gains quotidiens tirés de vos sessions louées.
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Chargement...
          </div>
        ) : revenueHistory.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Pas encore de revenus enregistrés pour tracer une tendance.
          </div>
        ) : (
          <ChartContainer config={revenueChartConfig} className="aspect-auto h-65 w-full">
            <AreaChart data={revenueHistory} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sats)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-sats)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value: string) => format(new Date(value), "d MMM", { locale: fr })}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={56}
                tickFormatter={(value: number) => value.toLocaleString("fr-FR")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => format(new Date(value), "d MMMM yyyy", { locale: fr })}
                    formatter={(value) => (
                      <div className="flex w-full flex-1 justify-between items-center leading-none">
                        <span className="text-muted-foreground">Revenus</span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {Number(value).toLocaleString("fr-FR")} Sats
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="sats"
                stroke="var(--color-sats)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>

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
