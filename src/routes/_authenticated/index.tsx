import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, X, Server, ChevronDown, BadgeCheck, Cpu } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Marketplace — VoltCompute" },
      { name: "description", content: "Parcourez les nodes GPU/CPU disponibles et louez de la puissance de calcul à la minute." },
    ],
  }),
  component: MarketplacePage,
});

type Machine = {
  id: string;
  name: string;
  rate: number;
  status: "online" | "busy";
  type: "GPU" | "CPU";
  spec: string;
  ram: string;
  location: string;
  premium?: boolean;
};

const MACHINES: Machine[] = [
  { id: "1", name: "Benin-Alpha-Node", rate: 3, status: "online", type: "GPU", spec: "RTX 3060", ram: "16 GB RAM", location: "Cotonou, BJ", premium: true },
  { id: "2", name: "Lagos-Core-Edge", rate: 1.5, status: "online", type: "CPU", spec: "Xeon 8-Core", ram: "32 GB RAM", location: "Lagos, NG" },
  { id: "3", name: "Cotonou-Hub-Gamer", rate: 1, status: "busy", type: "GPU", spec: "GTX 1080", ram: "8 GB RAM", location: "Cotonou, BJ" },
  { id: "4", name: "Abidjan-ML-Rig", rate: 4.5, status: "online", type: "GPU", spec: "RTX 4080", ram: "64 GB RAM", location: "Abidjan, CI", premium: true },
  { id: "5", name: "Dakar-Batch-01", rate: 0.8, status: "online", type: "CPU", spec: "Ryzen 9", ram: "24 GB RAM", location: "Dakar, SN" },
];

function MarketplacePage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [typeFilter, setTypeFilter] = useState<"GPU" | "CPU" | "ALL">("GPU");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const selected = MACHINES.find((m) => m.id === selectedId) ?? null;

  const list = useMemo(() => {
    let result = MACHINES.filter((m) => {
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
      if (onlineOnly && m.status !== "online") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.spec.toLowerCase().includes(q) && !m.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (sortAsc) result = [...result].sort((a, b) => a.rate - b.rate);
    return result;
  }, [typeFilter, onlineOnly, search, sortAsc]);

  return (
    <AppShell>
      <div className="flex gap-6">
        <section className="flex-1 min-w-0 space-y-6">
          <div className="relative">
            <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une machine..."
              className="w-full bg-input border border-border rounded-lg pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Chip active={typeFilter === "GPU"} onClick={() => setTypeFilter(typeFilter === "GPU" ? "ALL" : "GPU")}>GPU Dédié</Chip>
            <Chip active={typeFilter === "CPU"} onClick={() => setTypeFilter(typeFilter === "CPU" ? "ALL" : "CPU")}>CPU Uniquement</Chip>
            <Chip active={sortAsc} onClick={() => setSortAsc((v) => !v)}>
              Prix croissant <ChevronDown className={`size-3.5 inline transition-transform ${sortAsc ? "rotate-180" : ""}`} />
            </Chip>
            <Chip active={onlineOnly} onClick={() => setOnlineOnly((v) => !v)}>En ligne seulement</Chip>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Aucune machine ne correspond à votre recherche.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {list.map((m) => (
                <MachineCard key={m.id} machine={m} active={selectedId === m.id} onClick={() => setSelectedId(m.id)} />
              ))}
            </div>
          )}
        </section>

        {selected && (
          <aside className="w-[380px] shrink-0 card-surface p-6 self-start sticky top-8">
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-xl font-semibold">Spécifications</h2>
              <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="aspect-video rounded-lg bg-input border border-border grid place-items-center mb-5">
              <Server className="size-12 text-muted-foreground" strokeWidth={1.25} />
            </div>
            <div className="flex gap-2 mb-3">
              {selected.premium && <Pill tone="primary">PREMIUM NODE</Pill>}
              <Pill tone="success"><BadgeCheck className="size-3 inline -mt-0.5" /> VERIFIED</Pill>
            </div>
            <h3 className="text-2xl font-bold mb-2">{selected.name}</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Node opéré par Volt-Infra {selected.location}. Haute performance pour IA et rendu 3D.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Stat label="Uptime" value="99.9%" />
              <Stat label="Bande passante" value="1 Gbps" />
            </div>
            <div className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Configuration logicielle</div>
              <SpecRow k="OS" v="Ubuntu 22.04 LTS" />
              <SpecRow k="Docker" v="v24.0.5" />
              <SpecRow k="CUDA" v="12.2" />
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 mb-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tarif Estimé</div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold">{Math.round(selected.rate * 60)} Sats <span className="text-sm font-normal text-muted-foreground">/ heure</span></span>
                <span className="text-xs text-muted-foreground">≈ {Math.round(selected.rate * 60 * 0.58)} FCFA</span>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/execution" })}
              className="w-full premium-gradient text-white font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
            >
              ⚡ Utiliser cette machine
            </button>
          </aside>
        )}
      </div>
    </AppShell>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
        active
          ? "premium-gradient text-white border-transparent shadow-md"
          : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function MachineCard({ machine, active, onClick }: { machine: Machine; active: boolean; onClick: () => void }) {
  const online = machine.status === "online";
  return (
    <button
      onClick={onClick}
      className={`text-left card-surface p-5 transition-all ${
        active ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_30px_-8px_var(--primary)]" : "hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-base">{machine.name}</h3>
        <span className="text-sm font-mono text-muted-foreground"><span className="text-foreground font-semibold">{machine.rate}</span> Sats/min</span>
      </div>
      <div className="flex items-center gap-2 mb-5">
        <span className={`size-2 rounded-full pulse-dot ${online ? "bg-success text-success" : "bg-tertiary text-tertiary"}`} />
        <span className={`text-xs font-semibold ${online ? "text-success" : "text-tertiary"}`}>
          {online ? "En ligne" : "Occupé"}
        </span>
        {online && <span className="ml-auto text-xs text-muted-foreground">≈ {(machine.rate * 0.58).toFixed(1)} FCFA</span>}
      </div>
      <div className="space-y-2.5 text-sm">
        <Row k={machine.type} v={machine.spec} />
        <Row k="RAM" v={machine.ram} />
        <Row k="Localisation" v={machine.location} />
      </div>
      {active && (
        <div className="mt-4 rounded-md bg-background/60 border border-border p-3 font-mono text-[11px] text-muted-foreground">
          <div>root@volt:~$ monitor --node alpha-01</div>
          <div className="flex gap-0.5 mt-2 items-end h-6">
            {[3, 6, 4, 8, 5, 9, 7, 4, 6, 8, 5].map((h, i) => (
              <span key={i} style={{ height: `${h * 10}%` }} className="w-1 premium-gradient rounded-sm" />
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
function Pill({ children, tone }: { children: React.ReactNode; tone: "primary" | "success" }) {
  const cls = tone === "primary" ? "bg-primary/15 text-primary" : "bg-success/15 text-success";
  return <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${cls}`}>{children}</span>;
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-0.5">{value}</div>
    </div>
  );
}
function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/60 last:border-0 font-mono text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
