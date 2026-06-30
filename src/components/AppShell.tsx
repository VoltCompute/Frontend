import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Moon, Plus, Store, Zap, Cpu, Wallet, Sun, LogOut, User, Settings, CheckCircle, AlertTriangle, CreditCard } from "lucide-react";
import { type ReactNode, useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/theme";

const nav = [
  { to: "/marketplace", label: "Marketplace", icon: Store },
  { to: "/execution", label: "Exécution", icon: Zap },
  { to: "/machines", label: "Mes Machines", icon: Cpu },
  { to: "/wallet", label: "Portefeuille", icon: Wallet },
] as const;

const NOTIFS = [
  { id: 1, icon: CheckCircle, color: "text-success", bg: "bg-success/15", title: "Exécution terminée", body: "compute_main.py a été exécuté avec succès", time: "Il y a 2h", read: false },
  { id: 2, icon: CreditCard, color: "text-primary", bg: "bg-primary/15", title: "Paiement reçu", body: "120 Sats reçus pour Node Alpha", time: "Il y a 5h", read: false },
  { id: 3, icon: AlertTriangle, color: "text-tertiary", bg: "bg-tertiary/15", title: "Machine hors ligne", body: "Home-Worker-03 est hors ligne depuis 1h", time: "Hier", read: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const unread = NOTIFS.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem("auth_token");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-[260px] shrink-0 border-r border-border bg-surface flex flex-col">
        <div className="px-6 pt-7 pb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="size-10 rounded-lg premium-gradient grid place-items-center shadow-lg">
              <Zap className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg tracking-tight">VoltCompute</div>
              <div className="text-[11px] text-muted-foreground font-mono">4 250 Sats · ≈ 2 480 FCFA</div>
            </div>
          </Link>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-foreground border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <Icon className="size-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <button
            onClick={() => navigate({ to: "/execution" })}
            className="w-full premium-gradient text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition"
          >
            <Plus className="size-4" /> Nouveau Compute
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-8 flex items-center justify-end gap-3 border-b border-border">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="size-10 grid place-items-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="size-10 grid place-items-center rounded-full hover:bg-destructive/15 text-destructive transition"
          >
            <LogOut className="size-5" />
          </button>

          {/* Cloche notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen((v) => !v); setAvatarOpen(false); }}
              className="size-10 grid place-items-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition relative"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-tertiary" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="font-semibold text-sm">Notifications</span>
                  {unread > 0 && (
                    <span className="text-xs text-muted-foreground">{unread} non lues</span>
                  )}
                </div>
                <div className="divide-y divide-border max-h-72 overflow-y-auto">
                  {NOTIFS.map((n) => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-accent/40 transition cursor-pointer ${!n.read ? "bg-accent/20" : ""}`}>
                      <div className={`size-8 rounded-full ${n.bg} grid place-items-center shrink-0 mt-0.5`}>
                        <n.icon className={`size-4 ${n.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-tight">{n.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{n.time}</div>
                      </div>
                      {!n.read && <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
                <div className="border-t border-border">
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="block text-center text-sm text-primary font-medium py-3 hover:bg-accent/40 transition"
                  >
                    Voir toutes les notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Avatar + menu profil */}
          <div ref={avatarRef} className="relative">
            <button
              onClick={() => { setAvatarOpen((v) => !v); setNotifOpen(false); }}
              className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white text-sm font-semibold hover:opacity-90 transition"
            >
              AK
            </button>

            {avatarOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <div className="font-semibold text-sm">Akakpo Godwin</div>
                  <div className="text-xs text-muted-foreground mt-0.5">benedoffice1@gmail.com</div>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 transition"
                  >
                    <User className="size-4 text-muted-foreground" /> Mon profil
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 transition"
                  >
                    <Bell className="size-4 text-muted-foreground" /> Notifications
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 transition"
                  >
                    <Settings className="size-4 text-muted-foreground" /> Paramètres
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="size-4" /> Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden relative">
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute -bottom-40 -right-40 size-[40rem] rounded-full bg-secondary/10 blur-[120px]" />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
