import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Mail, Lock, User as UserIcon, Loader2, ArrowLeft, Check, Server, Shield, Wallet, BarChart3 } from "lucide-react";
import logo from "@/assets/logo.png";
import { login, register } from "@/api/auth";
import type { ApiError } from "@/api/types";

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
    try {
      if (mode === "signup") {
        // L'inscription ne renvoie pas de token : on enchaîne avec un login
        // pour récupérer le JWT et démarrer la session.
        await register({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
        });
      }
      await login({ email: form.email, password: form.password });
      navigate({ to: "/marketplace" });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 size-[40rem] rounded-full bg-secondary/15 blur-[120px]" />
      </div>

      {/* Left Panel - Product Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 pt-8 xl:pt-10 bg-background border-r border-border">
        <Link to="/" className="flex items-center">
          <div className="h-11 w-44 overflow-hidden">
            <img src={logo} alt="VoltCompute" className="block w-full h-full object-contain object-left" />
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl xl:text-6xl font-bold tracking-tight mb-8 mt-6 leading-[1.1] uppercase">
            Louez ou monétisez
            <br />
            <span className="premium-gradient-text">de la puissance GPU/CPU</span>
          </h1>

          {/* Dashboard Image */}
          <div className="rounded-xl border border-border bg-surface p-4 mb-8 shadow-lg overflow-hidden">
            <img 
              src="/screenshot-marketplace.png" 
              alt="Dashboard VoltCompute" 
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: Server, title: "Accès aux nodes GPU/CPU disponibles sur le réseau" },
              { icon: Wallet, title: "Paiement instantané en Satoshis via Lightning" },
              { icon: Shield, title: "Environnement sécurisé avec conteneurs Docker isolés" },
              { icon: BarChart3, title: "Monitoring en temps réel avec console live" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="size-8 rounded-lg grid place-items-center shrink-0">
                  <feature.icon className="size-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="size-4 text-success" />
          <span>Réseau actif — 4 250 nodes en ligne</span>
        </div> */}
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 lg:pt-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex justify-center mb-8 lg:hidden">
            <div className="h-10 w-40 overflow-hidden">
              <img src={logo} alt="VoltCompute" className="block w-full h-full object-contain" />
            </div>
          </Link>

          <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-1">Bienvenue</h1>
              <p className="text-sm text-muted-foreground">Créez votre compte ou connectez-vous pour continuer</p>
            </div>

            <div className="flex rounded-lg p-1 mb-6 border border-border bg-card">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className={`flex-1 py-2 px-4 text-sm font-medium text-center rounded-md transition-all ${
                    mode === m 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted-foreground/10"
                  }`}
                >
                  {m === "signin" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">PRÉNOM</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="size-4 text-muted-foreground" />
                      </div>
                      <input
                        id="first_name"
                        type="text"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        placeholder="Prénom"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">NOM</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="size-4 text-muted-foreground" />
                      </div>
                      <input
                        id="last_name"
                        type="text"
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        placeholder="Nom"
                        className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">ADRESSE E-MAIL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@example.com"
                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-2">MOT DE PASSE</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-4 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full premium-gradient text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                Continuer vers votre espace →
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                {mode === "signin" ? "Pas encore de compte ? " : "Déjà inscrit ? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
                  className="text-foreground font-medium hover:underline"
                >
                  {mode === "signin" ? "Créer un compte" : "Se connecter"}
                </button>
              </p>
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="size-4" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
