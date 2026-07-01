import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getMe } from "@/api/auth";
import type { AuthUser } from "@/api/auth";
import type { ApiError } from "@/api/types";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Mon Profil — VoltCompute" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch((err) => {
        if (!cancelled)
          setLoadError((err as ApiError).message || "Impossible de charger le profil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground mt-1.5">Vos informations de compte.</p>
        </div>

        {loading ? (
          <div className="card-surface p-10 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="size-4 animate-spin" /> Chargement...
          </div>
        ) : loadError || !user ? (
          <div className="card-surface p-10 text-center text-sm text-destructive">
            {loadError || "Profil introuvable."}
          </div>
        ) : (
          <>
            <div className="card-surface p-6 flex items-center gap-6">
              <div className="size-20 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white text-2xl font-bold select-none">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              <div>
                <div className="font-bold text-lg">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <div className="ml-auto text-center">
                <div className="text-xl font-bold text-primary">
                  {user.balance_sats.toLocaleString("fr-FR")}
                </div>
                <div className="text-xs text-muted-foreground">Sats</div>
              </div>
            </div>

            <div className="card-surface p-6 space-y-4">
              <h2 className="text-base font-semibold">Informations personnelles</h2>
              <div className="grid grid-cols-2 gap-4">
                <ReadField label="Prénom" value={user.first_name} />
                <ReadField label="Nom" value={user.last_name} />
              </div>
              <ReadField label="Adresse email" value={user.email} />
              <ReadField label="Identifiant" value={`#${user.user_id}`} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      <div className="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}
