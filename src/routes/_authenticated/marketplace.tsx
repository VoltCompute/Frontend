import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Search, X, Server, ChevronDown, BadgeCheck, Cpu, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getMarketplaceMachines } from "@/api/marketplace";
import type { MarketplaceMachine } from "@/api/marketplace";
import type { ApiError } from "@/api/types";

export const Route = createFileRoute("/_authenticated/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — VoltCompute" },
      {
        name: "description",
        content:
          "Parcourez les nodes GPU/CPU disponibles et louez de la puissance de calcul à la minute.",
      },
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

/**
 * Adapte une machine renvoyée par le backend (GET /api/marketplace) au
 * format attendu par cette page. Le backend ne renvoie que des machines
 * actives ET en ligne, donc `status` vaut toujours "online" ici.
 */
function toViewMachine(m: MarketplaceMachine): Machine {
  const hasGpu = Boolean(m.gpu);
  return {
    id: String(m.machine_id),
    name: m.name,
    rate: m.price_per_min,
    status: m.is_online ? "online" : "busy",
    type: hasGpu ? "GPU" : "CPU",
    spec: (hasGpu ? m.gpu : m.cpu) || "Specs inconnues",
    ram: m.ram || "RAM inconnue",
    location:
      [m.localisation_ville, m.localisation_pays].filter(Boolean).join(", ") ||
      "Localisation inconnue",
  };
}

function MarketplacePage() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"GPU" | "CPU" | "ALL">("ALL");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getMarketplaceMachines()
      .then((data) => {
        if (!cancelled) setMachines(data.map(toViewMachine));
      })
      .catch((err: ApiError) => {
        if (!cancelled) setLoadError(err.message || "Impossible de charger le marketplace.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = machines.find((m) => m.id === selectedId) ?? null;

  const list = useMemo(() => {
    let result = machines.filter((m) => {
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
      if (onlineOnly && m.status !== "online") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.spec.toLowerCase().includes(q) &&
          !m.location.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    if (sortAsc) result = [...result].sort((a, b) => a.rate - b.rate);
    return result;
  }, [machines, typeFilter, onlineOnly, search, sortAsc]);

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
            <Chip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>
              Tous
            </Chip>
            <Chip active={typeFilter === "GPU"} onClick={() => setTypeFilter("GPU")}>
              GPU Dédié
            </Chip>
            <Chip active={typeFilter === "CPU"} onClick={() => setTypeFilter("CPU")}>
              CPU Uniquement
            </Chip>
            <Chip active={sortAsc} onClick={() => setSortAsc((v) => !v)}>
              Prix croissant{" "}
              <ChevronDown
                className={`size-3.5 inline transition-transform ${sortAsc ? "rotate-180" : ""}`}
              />
            </Chip>
            <Chip active={onlineOnly} onClick={() => setOnlineOnly((v) => !v)}>
              En ligne seulement
            </Chip>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" />
              Chargement des machines...
            </div>
          ) : loadError ? (
            <div className="text-center py-16 text-sm text-destructive">{loadError}</div>
          ) : list.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Aucune machine ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {list.map((m) => (
                <MachineCard
                  key={m.id}
                  machine={m}
                  active={selectedId === m.id}
                  onClick={() => setSelectedId(m.id)}
                />
              ))}
            </div>
          )}
        </section>

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <div
              className="w-[500px] max-w-[95vw] card-surface p-6 rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-5">
                <h2 className="text-xl font-semibold">Spécifications</h2>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* IMAGE */}
              <div className="aspect-video rounded-lg bg-input border border-border grid place-items-center mb-5">
                <Server className="size-12 text-muted-foreground" strokeWidth={1.25} />
              </div>

              <h3 className="text-2xl font-bold mb-2">{selected.name}</h3>

              <p className="text-sm text-muted-foreground mb-5">
                Node opéré par Volt-Infra {selected.location}. Haute performance pour IA et rendu
                3D.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <Stat label="Uptime" value="99.9%" />
                <Stat label="Bande passante" value="1 Gbps" />
              </div>

              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 mb-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tarif Estimé
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold">
                    {Math.round(selected.rate * 60)} Sats{" "}
                    <span className="text-sm font-normal text-muted-foreground">/ heure</span>
                  </span>

                  <span className="text-xs text-muted-foreground">
                    ≈ {Math.round(selected.rate * 60 * 0.58)} FCFA
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate({
                    to: "/execution",
                    search: {
                      machineId: Number(selected.id),
                      machineName: selected.name,
                      pricePerMin: selected.rate,
                    },
                  })
                }
                className="w-full premium-gradient text-white font-semibold rounded-lg py-3.5 flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
              >
                Utiliser cette machine
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
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

function MachineCard({
  machine,
  active,
  onClick,
}: {
  machine: Machine;
  active: boolean;
  onClick: () => void;
}) {
  const online = machine.status === "online";
  return (
    <button
      onClick={onClick}
      className={`text-left card-surface p-5 transition-all ${
        active
          ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_30px_-8px_var(--primary)]"
          : "hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-semibold text-base">{machine.name}</h3>
        <span className="text-sm font-mono text-muted-foreground">
          <span className="text-foreground font-semibold">{machine.rate}</span> Sats/min
        </span>
      </div>
      <div className="flex items-center gap-2 mb-5">
        <span
          className={`size-2 rounded-full pulse-dot ${online ? "bg-success text-success" : "bg-tertiary text-tertiary"}`}
        />
        <span className={`text-xs font-semibold ${online ? "text-success" : "text-tertiary"}`}>
          {online ? "En ligne" : "Occupé"}
        </span>
        {online && (
          <span className="ml-auto text-xs text-muted-foreground">
            ≈ {(machine.rate * 0.58).toFixed(1)} FCFA
          </span>
        )}
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
              <span
                key={i}
                style={{ height: `${h * 10}%` }}
                className="w-1 premium-gradient rounded-sm"
              />
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
  return (
    <span
      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {children}
    </span>
  );
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
