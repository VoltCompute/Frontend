import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Minus, Plus, Shield, Landmark, Gauge, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({
    meta: [
      { title: "Portefeuille — VoltCompute" },
      { name: "description", content: "Suivez votre solde Lightning, vos gains et l'historique de vos transactions." },
    ],
  }),
  component: WalletPage,
});

const ALL_TX = [
  { dir: "out", title: "Calcul Python - Session #4823", time: "Il y a 2h", amount: -30, id: "v8x...2p9" },
  { dir: "in", title: "Hébergement - Node Alpha", time: "Il y a 5h", amount: 120, id: "k1z...9w4" },
  { dir: "out", title: "Calcul ML - Session #4801", time: "Hier", amount: -85, id: "b4l...7r1" },
  { dir: "in", title: "Hébergement - Node Alpha", time: "Hier", amount: 200, id: "t2q...0x8" },
  { dir: "out", title: "Calcul GPU - Session #4780", time: "Il y a 3j", amount: -50, id: "c9m...3k5" },
  { dir: "in", title: "Hébergement - Cluster Beta", time: "Il y a 3j", amount: 340, id: "p7r...6n2" },
  { dir: "out", title: "Calcul Python - Session #4760", time: "Il y a 5j", amount: -20, id: "h3s...1f8" },
];

function WalletPage() {
  const [showAll, setShowAll] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const transactions = showAll ? ALL_TX : ALL_TX.slice(0, 4);

  function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice.trim()) { toast.error("Veuillez entrer une adresse Lightning."); return; }
    setWithdrawing(true);
    // TODO: remplacer par l'appel API réel
    setTimeout(() => {
      setWithdrawing(false);
      setShowWithdraw(false);
      setInvoice("");
      toast.success("Retrait de 4 250 Sats initié avec succès !");
    }, 1800);
  }

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
        <div className="card-surface p-7">
          <div className="text-sm text-muted-foreground">Solde total disponible</div>
          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-bold premium-gradient-text">4 250 Satoshis</span>
            <span className="text-muted-foreground">≈ 2 480 FCFA</span>
          </div>

          {showWithdraw ? (
            <form onSubmit={handleWithdraw} className="mt-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Adresse Lightning</span>
                <button type="button" onClick={() => { setShowWithdraw(false); setInvoice(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
              <input
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
                placeholder="lnbc... ou user@domaine.com"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <button
                type="submit"
                disabled={withdrawing}
                className="premium-gradient text-white font-semibold rounded-lg px-6 py-3 inline-flex items-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-60"
              >
                {withdrawing ? <><Loader2 className="size-4 animate-spin" /> Envoi...</> : <><LogOut className="size-4" /> Confirmer le retrait</>}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowWithdraw(true)}
              className="mt-6 premium-gradient text-white font-semibold rounded-lg px-6 py-3 inline-flex items-center gap-2 shadow-lg hover:opacity-95"
            >
              <LogOut className="size-4" /> 💰 Retirer mes gains
            </button>
          )}
        </div>
        <div className="grid grid-rows-2 gap-4">
          <SmallStat label="Gains 24h" value="+320 Sats" tone="success" />
          <SmallStat label="Consommation 24h" value="-115 Sats" tone="tertiary" />
        </div>
      </div>

      <div className="card-surface p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Historique des transactions</h2>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm text-primary font-medium hover:underline"
          >
            {showAll ? "Réduire" : "Voir tout"}
          </button>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((t, i) => (
            <div key={i} className="py-4 flex items-center gap-4">
              <div
                className={`size-10 rounded-full grid place-items-center ${
                  t.dir === "in" ? "bg-success/15 text-success" : "bg-tertiary/15 text-tertiary"
                }`}
              >
                {t.dir === "in" ? <Plus className="size-4" /> : <Minus className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <span className={`size-1.5 rounded-full ${t.dir === "in" ? "bg-success" : "bg-tertiary"}`} />
                  {t.dir === "in" ? "Crédit" : "Débit"} · {t.time}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold font-mono ${t.dir === "in" ? "text-success" : "text-tertiary"}`}>
                  {t.amount > 0 ? "+" : ""}{t.amount} Sats
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">Blockchain ID: {t.id}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard icon={Shield} tone="primary" title="Sécurité" body="Vos fonds sont sécurisés par le protocole Lightning. Les transactions sont instantanées et souveraines." />
        <FeatureCard icon={Landmark} tone="tertiary" title="Frais minimes" body="Profitez des frais de transaction les plus bas du marché grâce à notre infrastructure décentralisée." />
        <FeatureCard icon={Gauge} tone="secondary" title="Instant Cash-out" body="Retirez vos gains à tout moment vers n'importe quel portefeuille compatible Lightning Network." />
      </div>
    </AppShell>
  );
}

function SmallStat({ label, value, tone }: { label: string; value: string; tone: "success" | "tertiary" }) {
  const color = tone === "success" ? "text-success" : "text-tertiary";
  return (
    <div className="card-surface p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body, tone }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; tone: "primary" | "secondary" | "tertiary" }) {
  const ring = tone === "primary" ? "border-primary/30" : tone === "secondary" ? "border-secondary/30" : "border-tertiary/30";
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "text-tertiary";
  return (
    <div className={`card-surface p-5 ${ring}`}>
      <Icon className={`size-5 ${color} mb-3`} />
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
    </div>
  );
}
