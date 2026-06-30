import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Check, Loader2, Shield, Zap, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon Profil — VoltCompute" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [form, setForm] = useState({
    first_name: "Akakpo",
    last_name: "Godwin",
    email: "benedoffice1@gmail.com",
    lightning: "godwin@getalby.com",
    bio: "Développeur & opérateur de nodes GPU au Bénin.",
  });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      toast.error("Prénom, nom et email sont obligatoires.");
      return;
    }
    setSaving(true);
    // TODO: appel API
    setTimeout(() => { setSaving(false); toast.success("Profil mis à jour."); }, 1000);
  }

  function handleSavePw(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    if (pwForm.next.length < 6) { toast.error("6 caractères minimum."); return; }
    if (pwForm.next !== pwForm.confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setSavingPw(true);
    // TODO: appel API
    setTimeout(() => {
      setSavingPw(false);
      setPwForm({ current: "", next: "", confirm: "" });
      toast.success("Mot de passe modifié.");
    }, 1000);
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground mt-1.5">Gérez vos informations personnelles et votre sécurité.</p>
        </div>

        {/* Avatar */}
        <div className="card-surface p-6 flex items-center gap-6">
          <div className="relative">
            <div className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white text-2xl font-bold select-none">
              {form.first_name[0]}{form.last_name[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 size-7 rounded-full bg-surface border border-border grid place-items-center hover:bg-accent transition">
              <Camera className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div>
            <div className="font-bold text-lg">{form.first_name} {form.last_name}</div>
            <div className="text-sm text-muted-foreground">{form.email}</div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="size-1.5 rounded-full bg-success" />
              <span className="text-xs text-success font-medium">Compte vérifié</span>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-4 text-center">
            <div><div className="text-xl font-bold text-primary">4 250</div><div className="text-xs text-muted-foreground">Sats</div></div>
            <div><div className="text-xl font-bold">3</div><div className="text-xs text-muted-foreground">Machines</div></div>
            <div><div className="text-xl font-bold text-success">12</div><div className="text-xs text-muted-foreground">Sessions</div></div>
          </div>
        </div>

        {/* Infos personnelles */}
        <form onSubmit={handleSaveProfile} className="card-surface p-6 space-y-4">
          <h2 className="text-base font-semibold">Informations personnelles</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <Field label="Nom" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
          </div>

          <Field label="Adresse email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />

          <div>
            <label className="text-sm font-medium mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
              <Zap className="size-3.5 text-primary" /> Adresse Lightning
            </label>
            <input
              value={form.lightning}
              onChange={(e) => setForm({ ...form, lightning: e.target.value })}
              placeholder="user@getalby.com"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Utilisée pour recevoir vos paiements automatiquement.</p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="premium-gradient text-white font-semibold rounded-lg px-6 py-2.5 flex items-center gap-2 shadow hover:opacity-95 disabled:opacity-60"
            >
              {saving ? <><Loader2 className="size-4 animate-spin" /> Enregistrement...</> : <><Check className="size-4" /> Enregistrer</>}
            </button>
          </div>
        </form>

        {/* Sécurité */}
        <form onSubmit={handleSavePw} className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="size-4 text-primary" />
            <h2 className="text-base font-semibold">Sécurité</h2>
          </div>

          <Field label="Mot de passe actuel" type="password" value={pwForm.current} onChange={(v) => setPwForm({ ...pwForm, current: v })} placeholder="••••••••" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nouveau mot de passe" type="password" value={pwForm.next} onChange={(v) => setPwForm({ ...pwForm, next: v })} placeholder="••••••••" />
            <Field label="Confirmer" type="password" value={pwForm.confirm} onChange={(v) => setPwForm({ ...pwForm, confirm: v })} placeholder="••••••••" />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingPw}
              className="px-6 py-2.5 rounded-lg border border-border bg-surface-2 text-sm font-semibold hover:border-primary/50 flex items-center gap-2 disabled:opacity-60"
            >
              {savingPw ? <><Loader2 className="size-4 animate-spin" /> Modification...</> : "Modifier le mot de passe"}
            </button>
          </div>
        </form>

        {/* Zone dangereuse */}
        <div className="card-surface p-6 border-destructive/30">
          <div className="flex items-center gap-2 mb-1">
            <Trash2 className="size-4 text-destructive" />
            <h2 className="text-base font-semibold text-destructive">Zone dangereuse</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">La suppression de votre compte est irréversible. Toutes vos données et machines seront définitivement supprimées.</p>
          <button
            onClick={() => {
              if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                toast.error("Suppression du compte — fonctionnalité à connecter à l'API.");
              }
            }}
            className="px-5 py-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/25 transition"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
