import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle, AlertTriangle, CreditCard, Info, Check, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [{ title: "Notifications — VoltCompute" }],
  }),
  component: NotificationsPage,
});

type Notif = {
  id: number;
  type: "success" | "warning" | "payment" | "info";
  title: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
};

const INITIAL_NOTIFS: Notif[] = [
  { id: 1, type: "success", title: "Exécution terminée", body: "compute_main.py a été exécuté avec succès sur Benin-Alpha-Node en 4 min 32s.", time: "Il y a 2h", date: "Aujourd'hui", read: false },
  { id: 2, type: "payment", title: "Paiement reçu", body: "120 Sats reçus pour la location de Node Alpha (session #4824).", time: "Il y a 5h", date: "Aujourd'hui", read: false },
  { id: 3, type: "warning", title: "Machine hors ligne", body: "Home-Worker-03 est hors ligne depuis plus d'1 heure. Vérifiez la connexion.", time: "Il y a 8h", date: "Aujourd'hui", read: false },
  { id: 4, type: "success", title: "Nouvelle location", body: "Abidjan-ML-Rig a été loué pour 2h par un client du réseau.", time: "14:30", date: "Hier", read: true },
  { id: 5, type: "payment", title: "Retrait effectué", body: "2 000 Sats retirés vers godwin@getalby.com avec succès.", time: "11:15", date: "Hier", read: true },
  { id: 6, type: "info", title: "Mise à jour disponible", body: "VoltCompute v2.1 est disponible avec de nouvelles fonctionnalités de monitoring.", time: "09:00", date: "Hier", read: true },
  { id: 7, type: "success", title: "Machine reconnectée", body: "Lagos-Core-Edge est de nouveau en ligne après une interruption de 30 min.", time: "Lundi 18:45", date: "Cette semaine", read: true },
  { id: 8, type: "payment", title: "Paiement reçu", body: "340 Sats reçus pour la location de Rig-Alpha-01 (session #4812).", time: "Lundi 10:20", date: "Cette semaine", read: true },
];

const ICONS = {
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/15" },
  warning: { icon: AlertTriangle, color: "text-tertiary", bg: "bg-tertiary/15" },
  payment: { icon: CreditCard, color: "text-primary", bg: "bg-primary/15" },
  info: { icon: Info, color: "text-secondary", bg: "bg-secondary/15" },
};

const FILTERS = ["Toutes", "Non lues", "Paiements", "Alertes"] as const;
type Filter = typeof FILTERS[number];

function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<Filter>("Toutes");

  const unread = notifs.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Toutes les notifications marquées comme lues.");
  }

  function markRead(id: number) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function deleteNotif(id: number) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  function clearAll() {
    if (!window.confirm("Supprimer toutes les notifications ?")) return;
    setNotifs([]);
    toast.success("Notifications supprimées.");
  }

  const filtered = notifs.filter((n) => {
    if (filter === "Non lues") return !n.read;
    if (filter === "Paiements") return n.type === "payment";
    if (filter === "Alertes") return n.type === "warning";
    return true;
  });

  const groups = filtered.reduce<Record<string, Notif[]>>((acc, n) => {
    acc[n.date] = acc[n.date] ? [...acc[n.date], n] : [n];
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1.5">
              {unread > 0 ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
            </p>
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-surface-2 text-sm font-medium hover:border-primary/50 transition"
              >
                <Check className="size-3.5" /> Tout marquer lu
              </button>
            )}
            {notifs.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition"
              >
                <Trash2 className="size-3.5" /> Tout effacer
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                filter === f
                  ? "premium-gradient text-white border-transparent shadow-md"
                  : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {f}
              {f === "Non lues" && unread > 0 && (
                <span className="ml-2 size-5 inline-flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">{unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Liste groupée */}
        {Object.keys(groups).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <CheckCircle className="size-10 mx-auto mb-3 text-success opacity-50" />
            <div className="font-semibold">Aucune notification</div>
            <div className="text-sm mt-1">Vous êtes à jour !</div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([date, items]) => (
              <div key={date}>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{date}</div>
                <div className="card-surface divide-y divide-border overflow-hidden">
                  {items.map((n) => {
                    const { icon: Icon, color, bg } = ICONS[n.type];
                    return (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`flex gap-4 px-5 py-4 transition cursor-pointer hover:bg-accent/40 ${!n.read ? "bg-accent/20" : ""}`}
                      >
                        <div className={`size-9 rounded-full ${bg} grid place-items-center shrink-0 mt-0.5`}>
                          <Icon className={`size-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-sm font-semibold ${!n.read ? "" : "text-muted-foreground"}`}>{n.title}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                        </div>
                        <div className="flex flex-col items-center gap-2 ml-1">
                          {!n.read && <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                            className="text-muted-foreground hover:text-destructive transition opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10"
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
