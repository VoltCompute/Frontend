import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Server, Plus, Trash2, CloudOff, X, Loader2, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { addMachine, deleteMachine, getMyMachines, toggleMachine } from "@/api/machines";
import type { AddMachineResult, Machine } from "@/api/machines";
import type { ApiError } from "@/api/types";

export const Route = createFileRoute("/_authenticated/machines")({
  head: () => ({
    meta: [
      { title: "Mes Machines — VoltCompute" },
      {
        name: "description",
        content: "Gérez vos rigs de calcul connectés au réseau VoltCompute et suivez vos revenus.",
      },
    ],
  }),
  component: MachinesPage,
});

const EMPTY_FORM = { name: "", price_per_min: "", localisation_ville: "", localisation_pays: "" };

/** GPU/CPU/RAM ne sont connus qu'une fois l'agent connecté (update_specs). */
function formatSpec(m: Machine): string {
  const parts = [m.gpu || m.cpu, m.ram].filter(Boolean);
  return parts.length ? parts.join(" · ") : "En attente de connexion de l'agent";
}

function formatLocation(m: Machine): string | null {
  return [m.localisation_ville, m.localisation_pays].filter(Boolean).join(", ") || null;
}

function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  // Réponse de création : contient l'agent_token, jamais redonné ensuite par GET /machines.
  const [createdAgent, setCreatedAgent] = useState<AddMachineResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadMachines() {
    setLoading(true);
    setLoadError(null);
    try {
      setMachines(await getMyMachines());
    } catch (err) {
      setLoadError((err as ApiError).message || "Impossible de charger vos machines.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMachines();
  }, []);

  function closeAddModal() {
    setShowAddModal(false);
    setForm(EMPTY_FORM);
    setCreatedAgent(null);
    setCopied(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price_per_min);
    if (!form.name.trim() || !Number.isInteger(price) || price <= 0) {
      toast.error("Nom et tarif (un nombre entier de sats/min) requis.");
      return;
    }
    setAdding(true);
    try {
      const result = await addMachine({
        name: form.name.trim(),
        price_per_min: price,
        localisation_ville: form.localisation_ville.trim() || undefined,
        localisation_pays: form.localisation_pays.trim() || undefined,
      });
      setCreatedAgent(result);
      await loadMachines();
      toast.success(`Machine "${form.name.trim()}" créée.`);
    } catch (err) {
      toast.error((err as ApiError).message || "Échec de la création de la machine.");
    } finally {
      setAdding(false);
    }
  }

  // Bascule status active/inactive : condition manuelle de réservation sur le marketplace
  // (l'autre condition, is_online, vient de l'agent et n'est pas pilotable depuis le front).
  async function handleToggle(m: Machine) {
    const nextStatus = m.status === "active" ? "inactive" : "active";
    setBusyId(m.machine_id);
    try {
      const result = await toggleMachine(m.machine_id, nextStatus);
      setMachines((prev) =>
        prev.map((x) => (x.machine_id === m.machine_id ? { ...x, status: result.new_status } : x)),
      );
    } catch (err) {
      toast.error((err as ApiError).message || "Échec du changement de statut.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(m: Machine) {
    if (!window.confirm(`Supprimer "${m.name}" du réseau ?`)) return;
    setBusyId(m.machine_id);
    try {
      await deleteMachine(m.machine_id);
      setMachines((prev) => prev.filter((x) => x.machine_id !== m.machine_id));
      toast.success("Machine supprimée.");
    } catch (err) {
      toast.error((err as ApiError).message || "Échec de la suppression.");
    } finally {
      setBusyId(null);
    }
  }

  function copyRunCommand() {
    if (!createdAgent) return;
    navigator.clipboard.writeText(createdAgent.run_command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const onlineCount = machines.filter((m) => m.is_online).length;
  const activeCount = machines.filter((m) => m.status === "active").length;
  const totalGain = machines.reduce((sum, m) => sum + m.gain_total_fait_avec, 0);

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
        <Metric
          label="Gains Totaux"
          value={totalGain.toLocaleString("fr-FR")}
          sub="Sats"
          tone="primary"
        />
        <Metric
          label="Machines En Ligne"
          value={String(onlineCount)}
          sub={`/ ${machines.length} Total`}
        />
        <Metric
          label="Machines Actives"
          value={String(activeCount)}
          sub={`/ ${machines.length} Total`}
          tone="secondary"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" />
            Chargement de vos machines...
          </div>
        ) : loadError ? (
          <div className="text-center py-16 text-sm text-destructive">{loadError}</div>
        ) : machines.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Aucune machine connectée.{" "}
            <button onClick={() => setShowAddModal(true)} className="text-primary hover:underline">
              Ajouter une machine
            </button>
          </div>
        ) : (
          machines.map((m) => (
            <div
              key={m.machine_id}
              className="w-full text-left card-surface p-5 flex items-center gap-4 hover:border-primary/40 transition"
            >
              <div className="size-14 rounded-lg border border-border grid place-items-center bg-surface-2 relative">
                {m.is_online ? (
                  <>
                    <Server className="size-6" />
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-success pulse-dot text-success" />
                  </>
                ) : (
                  <CloudOff className="size-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`font-bold ${!m.is_online ? "text-muted-foreground" : ""}`}>
                  {m.name}
                </div>
                <div className="text-sm text-muted-foreground truncate">{formatSpec(m)}</div>
                {formatLocation(m) && (
                  <div className="text-xs text-muted-foreground/80 truncate">
                    {formatLocation(m)}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">Tarif</div>
                <div className="font-bold">{m.price_per_min} Sats/min</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-muted-foreground">Gains totaux</div>
                <div className="font-bold text-success">{m.gain_total_fait_avec} Sats</div>
              </div>

              <div className="flex items-center gap-3 ml-2 shrink-0">
                <Switch
                  checked={m.status === "active"}
                  disabled={busyId === m.machine_id}
                  onCheckedChange={() => handleToggle(m)}
                  title={m.status === "active" ? "Désactiver (retirer du marketplace)" : "Activer"}
                />
                <button
                  onClick={() => handleDelete(m)}
                  disabled={busyId === m.machine_id}
                  className="p-2 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ajout machine */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAddModal} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {createdAgent ? "Connectez votre agent" : "Ajouter une machine"}
              </h2>
              <button
                onClick={closeAddModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {createdAgent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  La machine est enregistrée mais hors-ligne. Lancez cette commande sur la machine à
                  louer : l'agent détectera ses specs (GPU/CPU/RAM) et la connectera au réseau.
                </p>
                <div className="relative">
                  <pre className="bg-input border border-border rounded-lg px-4 py-3 text-xs font-mono overflow-x-auto pr-12">
                    {createdAgent.run_command}
                  </pre>
                  <button
                    onClick={copyRunCommand}
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
                <p className="text-xs text-muted-foreground">
                  ⚠️ Ce token ne sera plus jamais affiché : conservez-le en lieu sûr.
                </p>
                <button
                  onClick={closeAddModal}
                  className="w-full premium-gradient text-white font-semibold rounded-lg py-3 shadow-lg hover:opacity-95"
                >
                  Terminé
                </button>
              </div>
            ) : (
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

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tarif (Sats/min) *</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.price_per_min}
                    onChange={(e) => setForm({ ...form, price_per_min: e.target.value })}
                    placeholder="ex: 5"
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Ville</label>
                    <input
                      value={form.localisation_ville}
                      onChange={(e) => setForm({ ...form, localisation_ville: e.target.value })}
                      placeholder="ex: Cotonou"
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Pays</label>
                    <input
                      value={form.localisation_pays}
                      onChange={(e) => setForm({ ...form, localisation_pays: e.target.value })}
                      placeholder="ex: Benin"
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  GPU, CPU et RAM sont détectés automatiquement par l'agent à sa connexion — inutile
                  de les saisir ici.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    className="flex-1 py-3 rounded-lg border border-border text-sm font-medium hover:bg-accent transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 premium-gradient text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 disabled:opacity-60"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Ajout...
                      </>
                    ) : (
                      "Ajouter la machine"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "primary" | "secondary";
}) {
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
