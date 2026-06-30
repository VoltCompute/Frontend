import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Server, Plus, Pencil, Trash2, ChevronRight, CloudOff, Check, X, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/machines")({
  head: () => ({
    meta: [
      { title: "Mes Machines — VoltCompute" },
      { name: "description", content: "Gérez vos rigs de calcul connectés au réseau VoltCompute et suivez vos revenus." },
    ],
  }),
  component: MachinesPage,
});

type Machine = {
  id: string;
  name: string;
  spec: string;
  online: boolean;
  rate: number;
  gain: string;
  load?: number;
  featured?: boolean;
};

const INITIAL_MACHINES: Machine[] = [
  { id: "1", name: "Rig-Alpha-01", spec: "RTX 4090 · 64GB RAM · Ubuntu 22.04", online: true, rate: 12, gain: "+340 Sats", load: 72, featured: true },
  { id: "2", name: "Cluster-West-Beta", spec: "Tesla A100 · 128GB RAM · Ubuntu 22.04", online: true, rate: 8, gain: "+1 200 Sats" },
  { id: "3", name: "Home-Worker-03", spec: "GTX 1080ti · 16GB RAM · Windows 11", online: false, rate: 3, gain: "—" },
];

const EMPTY_FORM = { name: "", gpu: "", ram: "", os: "", rate: "" };

function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette machine du réseau ?")) return;
    setMachines((prev) => prev.filter((m) => m.id !== id));
    toast.success("Machine supprimée.");
  }

  function startEdit(m: Machine) {
    setEditingId(m.id);
    setEditName(m.name);
  }

  function confirmEdit(id: string) {
    if (!editName.trim()) { toast.error("Le nom ne peut pas être vide."); return; }
    setMachines((prev) => prev.map((m) => m.id === id ? { ...m, name: editName.trim() } : m));
    setEditingId(null);
    toast.success("Machine mise à jour.");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.gpu.trim() || !form.ram.trim() || !form.rate.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setAdding(true);
    // TODO: remplacer par l'appel API réel
    setTimeout(() => {
      const newMachine: Machine = {
        id: Date.now().toString(),
        name: form.name.trim(),
        spec: `${form.gpu} · ${form.ram} · ${form.os || "Linux"}`,
        online: true,
        rate: parseFloat(form.rate) || 1,
        gain: "—",
      };
      setMachines((prev) => [...prev, newMachine]);
      setForm(EMPTY_FORM);
      setShowAddModal(false);
      setAdding(false);
      toast.success(`Machine "${newMachine.name}" ajoutée au réseau !`);
    }, 1000);
  }

  const featured = machines.find((m) => m.featured);
  const rest = machines.filter((m) => !m.featured);

  return (
    <AppShell>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Machines</h1>
          <p className="text-muted-foreground mt-1.5">Gérez vos ressources de calcul distribuées</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="size-12 rounded-full premium-gradient grid place-items-center shadow-lg text-white hover:opacity-95"
          title="Ajouter une machine"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <Metric label="Revenus Totaux" value="128 450" sub="Sats" tone="primary" />
        <Metric label="Uptime Réseau" value="99.98%" sub="Derniers 30j" />
        <Metric label="Machines Actives" value={String(machines.filter((m) => m.online).length)} sub={`/ ${machines.length} Total`} tone="secondary" />
      </div>

      <div className="space-y-4">
        {featured && (
          <div className="card-surface p-5 border-primary shadow-[0_0_0_1px_var(--primary),0_0_30px_-8px_var(--primary)]">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-lg bg-surface-2 border border-border grid place-items-center relative">
                <Server className="size-6" />
                <span className="absolute top-1 right-1 size-2 rounded-full bg-success pulse-dot text-success" />
              </div>
              <div className="flex-1">
                {editingId === featured.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(featured.id); if (e.key === "Escape") setEditingId(null); }}
                      className="bg-input border border-primary rounded-md px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                      autoFocus
                    />
                    <button onClick={() => confirmEdit(featured.id)} className="text-success hover:text-success/80"><Check className="size-5" /></button>
                    <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-lg">{featured.name}</span>
                    <Tag>RTX 4090</Tag>
                    <Tag>64GB RAM</Tag>
                    <span className="text-success font-semibold text-sm">En ligne</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Tarif Actuel</div>
                <div className="font-bold">{featured.rate} Sats/min</div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-border flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Revenus aujourd'hui</div>
                <div className="text-primary font-bold text-lg">{featured.gain}</div>
              </div>
              <div className="flex-1 min-w-[200px] max-w-sm">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Charge CPU/GPU</span>
                  <span className="font-mono font-semibold">{featured.load}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
                  <div className="h-full premium-gradient" style={{ width: `${featured.load}%` }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(featured)}
                  className="px-4 py-2 rounded-md bg-surface-2 border border-border text-sm font-medium hover:border-primary/50 flex items-center gap-2"
                >
                  <Pencil className="size-3.5" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(featured.id)}
                  className="px-4 py-2 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/25 flex items-center gap-2"
                >
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {rest.map((m) => (
          <div key={m.id} className="w-full text-left card-surface p-5 flex items-center gap-4 hover:border-primary/40 transition">
            <div className="size-14 rounded-lg border border-border grid place-items-center bg-surface-2">
              {!m.online ? <CloudOff className="size-6 text-muted-foreground" /> : <Server className="size-6" />}
            </div>
            <div className="flex-1 min-w-0">
              {editingId === m.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(m.id); if (e.key === "Escape") setEditingId(null); }}
                    className="bg-input border border-primary rounded-md px-3 py-1.5 font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                    autoFocus
                  />
                  <button onClick={() => confirmEdit(m.id)} className="text-success hover:text-success/80"><Check className="size-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                </div>
              ) : (
                <>
                  <div className={`font-bold ${!m.online ? "text-muted-foreground" : ""}`}>{m.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{m.spec}</div>
                </>
              )}
            </div>
            {m.online
              ? <div className="text-right"><div className="text-xs text-muted-foreground">Dernier gain</div><div className="font-bold text-success">{m.gain}</div></div>
              : <span className="px-3 py-1.5 rounded-md bg-destructive/15 text-destructive text-xs font-semibold">Hors ligne</span>
            }
            <div className="flex items-center gap-1 ml-2">
              <button onClick={() => startEdit(m)} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition" title="Modifier">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => handleDelete(m.id)} className="p-2 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition" title="Supprimer">
                <Trash2 className="size-4" />
              </button>
              <ChevronRight className="size-5 text-muted-foreground ml-1" />
            </div>
          </div>
        ))}

        {machines.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Aucune machine connectée.{" "}
            <button onClick={() => setShowAddModal(true)} className="text-primary hover:underline">Ajouter une machine</button>
          </div>
        )}
      </div>

      {/* Modal ajout machine */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Ajouter une machine</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nom de la machine *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ex: Home-Rig-04"
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">GPU / CPU *</label>
                  <input
                    value={form.gpu}
                    onChange={(e) => setForm({ ...form, gpu: e.target.value })}
                    placeholder="ex: RTX 3080"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">RAM *</label>
                  <input
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    placeholder="ex: 16GB RAM"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Système d'exploitation</label>
                  <input
                    value={form.os}
                    onChange={(e) => setForm({ ...form, os: e.target.value })}
                    placeholder="ex: Ubuntu 22.04"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tarif (Sats/min) *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={form.rate}
                    onChange={(e) => setForm({ ...form, rate: e.target.value })}
                    placeholder="ex: 5"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 premium-gradient text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-60"
                >
                  {adding ? <><Loader2 className="size-4 animate-spin" /> Ajout...</> : "Ajouter la machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "primary" | "secondary" }) {
  const color = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-secondary" : "";
  return (
    <div className="card-surface p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-sm text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-md bg-surface-3 border border-border text-xs font-mono">{children}</span>;
}
