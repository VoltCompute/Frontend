import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — VoltCompute" },
      { name: "description", content: "Connectez-vous ou créez un compte VoltCompute pour louer ou monétiser de la puissance de calcul." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    if (form.password.length < 6) {
      setError("6 caractères minimum pour le mot de passe.");
      return;
    }
    if (mode === "signup" && (!form.first_name || !form.last_name)) {
      setError("Prénom et nom requis.");
      return;
    }

    setLoading(true);
    // TODO: remplacer par l'appel à votre API
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("auth_token", "demo");
      navigate({ to: "/" });
    }, 800);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-[40rem] rounded-full bg-secondary/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <Link to="/auth" className="flex items-center gap-3 justify-center mb-8">
          <div className="size-11 rounded-lg premium-gradient grid place-items-center shadow-lg">
            <Zap className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight text-center">
            <div className="font-bold text-xl tracking-tight">VoltCompute</div>
            <div className="text-[11px] text-muted-foreground font-mono">Calcul décentralisé</div>
          </div>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur p-8 shadow-2xl">
          <div className="flex gap-1 p-1 rounded-lg bg-accent/60 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {mode === "signin" ? "Heureux de vous revoir" : "Créer un compte"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signin" ? "Connectez-vous à votre tableau de bord." : "Rejoignez le réseau VoltCompute."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={UserIcon} placeholder="Prénom" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
                <Field icon={UserIcon} placeholder="Nom" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
              </div>
            )}
            <Field icon={Mail} type="email" placeholder="vous@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={Lock} type="password" placeholder="Mot de passe" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full premium-gradient text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            {mode === "signin" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
              className="text-foreground font-medium hover:underline"
            >
              {mode === "signin" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Icon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-3 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
      />
    </div>
  );
}
