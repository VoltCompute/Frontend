import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Zap, Server, Shield, BarChart3, Cpu, Globe, Store,
  Wallet, Rocket, Check, Menu, X, ArrowRight, Search,
  Github, ExternalLink, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ─── Scroll reveal ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); }
      }),
      { threshold: 0.1 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Count-up ──────────────────────────────────────────────── */
function CountUp({ to, suffix = "", prefix = "", decimals = 0, duration = 1800 }: {
  to: number; suffix?: string; prefix?: string; decimals?: number; duration?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !done.current) {
        done.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(parseFloat((ease * to).toFixed(decimals)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, decimals, duration]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString("fr-FR")}{suffix}
    </span>
  );
}

/* ─── Dashboard Mockup ──────────────────────────────────────── */
const MOCK_MACHINES = [
  { name: "Benin-Alpha", spec: "RTX 3060", rate: "3",   active: true  },
  { name: "Abidjan-ML",  spec: "RTX 4080", rate: "4.5", active: false },
  { name: "Lagos-Core",  spec: "Xeon 8c",  rate: "1.5", active: false },
];

const BEZEL   = "oklch(0.20 0.022 270)";
const BEZEL_D = "oklch(0.16 0.018 270)";
const BEZEL_L = "oklch(0.26 0.022 270)";

function DashboardMockup() {
  return (
    <div className="mockup-wrapper relative select-none w-full">
      <div className="relative">

        {/* ── Ambient glow ── */}
        <div className="absolute pointer-events-none -z-10" style={{
          inset: "-80px",
          background: "radial-gradient(ellipse at 65% 40%, oklch(0.62 0.22 268 / 0.30), oklch(0.55 0.25 305 / 0.18) 55%, transparent 75%)",
          filter: "blur(40px)",
        }} />

        {/* ── LAPTOP (stable — no ongoing animation) ── */}
        <div className="relative">
          {/* Screen bezel */}
          <div
            className="relative rounded-t-[22px] shadow-[0_32px_120px_-12px_rgba(0,0,0,0.85)]"
            style={{ background: BEZEL, padding: "11px 11px 0 11px" }}
          >
            {/* Camera */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-20">
              <div className="size-[7px] rounded-full" style={{ background: BEZEL_D }} />
            </div>

            {/* Screen — 16:10 */}
            <div className="rounded-t-[12px] overflow-hidden bg-background" style={{ aspectRatio: "16/10" }}>

              {/* Browser chrome */}
              <div className="h-9 bg-surface border-b border-border flex items-center px-4 gap-3 shrink-0">
                <div className="flex gap-1.5">
                  <span className="size-[9px] rounded-full bg-[#ff5f57]" />
                  <span className="size-[9px] rounded-full bg-[#febc2e]" />
                  <span className="size-[9px] rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/80 rounded-md h-[20px] flex items-center px-3 w-56">
                    <span className="text-[9px] text-muted-foreground font-mono">app.voltcompute.com</span>
                  </div>
                </div>
              </div>

              {/* App layout */}
              <div className="flex" style={{ height: "calc(100% - 36px)" }}>

                {/* Sidebar */}
                <div className="bg-surface border-r border-border flex flex-col shrink-0" style={{ width: "148px" }}>
                  <div className="px-3 py-2.5 flex items-center gap-2 border-b border-border">
                    <div className="size-[18px] rounded premium-gradient grid place-items-center shadow">
                      <Zap className="size-[9px] text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-bold truncate">VoltCompute</span>
                  </div>
                  <nav className="p-1.5 space-y-px flex-1">
                    {([
                      { icon: Store,  label: "Marketplace", active: true  },
                      { icon: Zap,    label: "Exécution",   active: false },
                      { icon: Cpu,    label: "Machines",    active: false },
                      { icon: Wallet, label: "Portefeuille",active: false },
                    ] as const).map((it) => (
                      <div
                        key={it.label}
                        className={`flex items-center gap-1.5 px-2 py-[7px] rounded text-[9px] font-medium ${it.active ? "bg-accent text-foreground border border-border" : "text-muted-foreground"}`}
                      >
                        <it.icon className="size-[11px] shrink-0" />
                        {it.label}
                      </div>
                    ))}
                  </nav>
                  <div className="p-2">
                    <div className="premium-gradient rounded text-[8px] font-bold py-[7px] text-white text-center">+ Nouveau</div>
                  </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="h-8 border-b border-border flex items-center justify-end px-3 gap-2 shrink-0">
                    <div className="size-[20px] rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-bold" style={{ fontSize: "7px" }}>AK</div>
                  </div>
                  <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
                    <div className="h-7 bg-input border border-border rounded-md flex items-center px-2.5 gap-1.5 shrink-0">
                      <Search className="size-[10px] text-muted-foreground shrink-0" />
                      <span className="text-[8.5px] text-muted-foreground">Rechercher une machine...</span>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="px-2.5 py-[3px] rounded-full text-[7.5px] font-bold premium-gradient text-white shadow">GPU Dédié</span>
                      <span className="px-2.5 py-[3px] rounded-full text-[7.5px] border border-border text-muted-foreground">CPU</span>
                      <span className="px-2.5 py-[3px] rounded-full text-[7.5px] border border-border text-muted-foreground">En ligne</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 shrink-0">
                      {MOCK_MACHINES.map((m) => (
                        <div key={m.name} className={`rounded-lg p-2.5 border ${m.active ? "border-primary bg-primary/5 shadow-[0_0_12px_-3px_var(--primary)]" : "border-border bg-card"}`}>
                          <div className="text-[8px] font-semibold truncate mb-1.5">{m.name}</div>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="size-[5px] rounded-full bg-success" />
                            <span className="text-[7px] text-success">En ligne</span>
                          </div>
                          <div className="text-[7px] text-muted-foreground">{m.spec}</div>
                          <div className="text-[9px] font-bold mt-1">{m.rate} <span className="text-[7px] font-normal text-muted-foreground">Sats/min</span></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 rounded-lg border border-border bg-input p-2.5 font-mono min-h-0">
                      <div className="text-[8px] text-muted-foreground mb-1.5">
                        <span className="text-primary">root@volt</span>:~$ monitor --live
                        <span className="cursor-blink text-primary ml-px">▌</span>
                      </div>
                      <div className="flex gap-px items-end h-7">
                        {[3,6,4,8,5,9,7,4,6,8,5,3,7,5,8,6,9,4,7,5].map((h, i) => (
                          <span key={i} style={{ height: `${h * 10}%` }} className="flex-1 premium-gradient rounded-sm opacity-75" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Hinge + keyboard base */}
          <div style={{ marginLeft: "-5%", width: "110%" }}>
            <div className="h-[6px]" style={{ background: `linear-gradient(to bottom, ${BEZEL_L}, ${BEZEL})` }} />
            <div
              className="h-[24px] flex items-center justify-center"
              style={{
                background: `linear-gradient(to bottom, ${BEZEL}, ${BEZEL_D})`,
                borderRadius: "0 0 16px 16px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div className="w-20 h-[4px] rounded-full" style={{ background: BEZEL_L }} />
            </div>
          </div>

          {/* Beam sweep */}
          <div
            className="absolute top-0 inset-x-0 overflow-hidden rounded-t-[22px] pointer-events-none"
            style={{ height: "calc(100% - 30px)" }}
          >
            <div className="beam-sweep" />
          </div>
        </div>

        {/* ── TABLET (floating) ── */}
        <div className="tablet-float absolute z-20" style={{ bottom: "-80px", right: "0" }}>
          {/* Glow */}
          <div className="absolute -inset-5 -z-10" style={{
            background: "oklch(0.55 0.25 305 / 0.35)",
            filter: "blur(28px)",
            borderRadius: "28px",
          }} />

          <div className="overflow-hidden" style={{
            width: "196px",
            borderRadius: "22px",
            border: `6px solid ${BEZEL}`,
            background: "var(--color-background)",
            boxShadow: "0 32px 90px rgba(0,0,0,0.7)",
          }}>
            {/* Top bar + camera */}
            <div className="flex items-center justify-center py-[8px]" style={{ background: BEZEL_D }}>
              <div className="size-[7px] rounded-full" style={{ background: BEZEL }} />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-[20px] rounded premium-gradient grid place-items-center shadow">
                    <Zap className="size-[10px] text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-[11px] font-bold">Portefeuille</span>
                </div>
                <div className="size-[22px] rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-bold" style={{ fontSize: "8px" }}>AK</div>
              </div>
              <div className="rounded-xl premium-gradient p-4 mb-4 text-white">
                <div className="text-[9px] opacity-70 mb-1">Solde Lightning</div>
                <div className="text-[22px] font-bold leading-tight">4 250</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] opacity-80">Satoshis</span>
                  <span className="text-[9px] opacity-70">≈ 2 480 FCFA</span>
                </div>
              </div>
              <div className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Récent</div>
              <div className="space-y-2.5">
                {[
                  { label: "Node Alpha · Gain",    amount: "+240 Sats", color: "text-success" },
                  { label: "compute.py exécution", amount: "−18 Sats",  color: "text-destructive" },
                  { label: "Node Beta · Gain",     amount: "+180 Sats", color: "text-success" },
                ].map((tx) => (
                  <div key={tx.label} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                    <span className="text-[9px] text-muted-foreground truncate flex-1 mr-2">{tx.label}</span>
                    <span className={`text-[10px] font-bold shrink-0 ${tx.color}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Home bar */}
            <div className="flex items-center justify-center py-[7px]" style={{ background: BEZEL_D }}>
              <div className="w-14 h-[3px] rounded-full bg-foreground/20" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Landing Page ──────────────────────────────────────────── */
function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goAuth = () => navigate({ to: "/auth" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-surface/85 backdrop-blur-xl border-b border-border shadow-lg" : ""
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-lg premium-gradient grid place-items-center shadow-lg">
              <Zap className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight">VoltCompute</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[["#features", "Fonctionnalités"], ["#pricing", "Tarifs"], ["#about", "À propos"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="size-9 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button onClick={goAuth} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition">
              Se connecter
            </button>
            <button onClick={goAuth} className="px-4 py-2 text-sm font-semibold rounded-lg premium-gradient text-white shadow hover:opacity-90 transition">
              Commencer
            </button>
          </div>

          <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden size-9 grid place-items-center rounded-lg hover:bg-accent transition">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl px-6 py-4 space-y-1">
            {[["#features", "Fonctionnalités"], ["#pricing", "Tarifs"], ["#about", "À propos"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block text-sm py-2.5 text-muted-foreground hover:text-foreground">{label}</a>
            ))}
            <div className="flex gap-3 pt-3">
              <button onClick={goAuth} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-border text-muted-foreground">Se connecter</button>
              <button onClick={goAuth} className="flex-1 py-2.5 text-sm font-semibold rounded-lg premium-gradient text-white">Commencer</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 py-12 overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="blob-1 absolute -top-64 -left-64 size-[900px] rounded-full bg-primary/12 blur-[150px]" />
          <div className="blob-2 absolute -bottom-48 -right-48 size-[700px] rounded-full bg-secondary/12 blur-[120px]" />
          <div className="blob-3 absolute top-1/2 left-1/4 size-[500px] rounded-full bg-tertiary/8 blur-[100px]" />
          <div className="dot-grid absolute inset-0 opacity-20" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── LEFT : Texte ── */}
          <div className="max-w-xl">
            {/* <div className="hero-d1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success/30 bg-success/10 text-success text-sm font-medium mb-8">
              <span className="size-2 rounded-full bg-success pulse-dot" />
              Réseau actif — 4 250 nodes en ligne
            </div> */}

            <h1 className="hero-d2 text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              La puissance de calcul
              <br />
              <span className="premium-gradient-text">décentralisée d'Afrique</span>
            </h1>

            <p className="hero-d3 text-lg text-muted-foreground mb-10 leading-relaxed">
              Louez de la puissance GPU/CPU à la minute ou monétisez votre machine inactive.
              Paiement instantané en Satoshis via le Lightning Network.
            </p>

            <div className="hero-d4 flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={goAuth}
                className="px-8 py-4 rounded-xl premium-gradient text-white font-semibold text-base shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                ⚡ Louer du compute <ArrowRight className="size-4" />
              </button>
              <button
                onClick={goAuth}
                className="px-8 py-4 rounded-xl border border-border font-semibold text-base hover:border-primary/50 hover:bg-accent/40 transition text-center"
              >
                Monétiser ma machine
              </button>
            </div>
          </div>

          {/* ── RIGHT : Device mockup ── */}
          <div className="relative hidden lg:flex items-center justify-center pt-8 pb-28">
            <DashboardMockup />
          </div>

        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-border bg-surface py-16" data-reveal>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { label: "Nodes actifs", el: <CountUp to={4250} suffix="+" /> },
            { label: "Sats échangés", el: <CountUp to={1.2} suffix="M" decimals={1} /> },
            { label: "Uptime réseau", el: <CountUp to={99.98} suffix="%" decimals={2} /> },
            { label: "Latence max", el: <CountUp to={500} prefix="< " suffix="ms" /> },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-bold premium-gradient-text">{s.el}</div>
              <div className="text-sm text-muted-foreground mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="about" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Comment ça marche</div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Lancez votre premier workload<br />en moins de 2 minutes
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Server, title: "Choisissez un node", body: "Parcourez le marketplace, filtrez par GPU/CPU, tarif et localisation. Comparez les specs en un coup d'œil.", delay: "" },
              { n: "02", icon: Rocket, title: "Lancez votre workload", body: "Uploadez votre script (.py, .js, .sh) ou connectez un repo GitHub. Démarrez en un clic depuis la console.", delay: "data-reveal-d1" },
              { n: "03", icon: Zap, title: "Payez en Sats", body: "Paiement automatique à la minute via Lightning Network. Rapide, souverain et sans intermédiaire.", delay: "data-reveal-d2" },
            ].map((step) => (
              <div
                key={step.n}
                data-reveal
                className={`card-surface p-7 hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 ${step.delay}`}
              >
                <div className="font-mono text-xs font-bold text-primary/40 mb-5 tracking-widest">{step.n}</div>
                <div className="size-12 rounded-xl premium-gradient grid place-items-center mb-5 shadow-lg">
                  <step.icon className="size-5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6 bg-surface/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-secondary mb-3">Fonctionnalités</div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Tout ce dont vous avez besoin<br />pour le calcul décentralisé
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Zap,       color: "text-primary",   bg: "bg-primary/15",   title: "Lightning Network",       body: "Paiements instantanés en Satoshis. Pas de frais bancaires, pas d'attente." },
              { icon: Globe,     color: "text-success",   bg: "bg-success/15",   title: "Réseau africain",         body: "Nodes localisés en Afrique de l'Ouest. Faible latence, forte disponibilité locale." },
              { icon: Shield,    color: "text-secondary", bg: "bg-secondary/15", title: "Sécurisé",                body: "Chaque workload s'exécute dans un conteneur Docker isolé. Vos données restent privées." },
              { icon: BarChart3, color: "text-tertiary",  bg: "bg-tertiary/15",  title: "Monitoring temps réel",   body: "Console live, métriques CPU/GPU, logs en streaming. Visualisez tout en direct." },
              { icon: Wallet,    color: "text-primary",   bg: "bg-primary/15",   title: "Monétisez vos machines",  body: "Transformez votre GPU idle en source de revenus passifs payés en Satoshis." },
              { icon: Cpu,       color: "text-success",   bg: "bg-success/15",   title: "Multi-workload",          body: "Python, JavaScript, Shell, repos GitHub. Tous les formats supportés nativement." },
            ].map((f, i) => (
              <div
                key={i}
                data-reveal
                className="card-surface p-6 hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 group"
              >
                <div className={`size-10 rounded-lg ${f.bg} grid place-items-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`size-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Tarifs</div>
            <h2 className="text-3xl sm:text-4xl font-bold">Simple, transparent, en Sats</h2>
            <p className="text-muted-foreground mt-3 text-lg">Payez uniquement ce que vous consommez. À la minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter", price: "0.5", fcfa: "≈ 0.29 FCFA/min",
                desc: "Idéal pour les projets personnels et tests",
                features: ["CPU Xeon standard", "8 GB RAM", "50 MB upload max", "Logs console", "Support communauté"],
                cta: "Commencer gratuitement", highlight: false,
              },
              {
                name: "Pro", price: "3", fcfa: "≈ 1.74 FCFA/min",
                desc: "Pour les workloads ML et data science",
                badge: "Populaire",
                features: ["GPU dédié RTX 3060+", "32 GB RAM", "200 MB upload max", "Console live + métriques", "Support prioritaire", "Nodes premium"],
                cta: "Choisir Pro", highlight: true,
              },
              {
                name: "Enterprise", price: "10+", fcfa: "≈ 5.80+ FCFA/min",
                desc: "Clusters haute performance sur mesure",
                features: ["GPU A100 / H100", "128 GB RAM+", "Taille illimitée", "API dédiée", "SLA 99.99%", "Account manager"],
                cta: "Nous contacter", highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                data-reveal
                className={`card-surface p-7 flex flex-col relative transition-all duration-300 ${
                  plan.highlight
                    ? "border-primary shadow-[0_0_0_1px_var(--primary),0_0_50px_-10px_var(--primary)]"
                    : "hover:border-primary/30 hover:-translate-y-1"
                }`}
              >
                {"badge" in plan && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full premium-gradient text-white text-xs font-bold shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-5">
                  <div className="font-bold text-xl mb-1">{plan.name}</div>
                  <div className="text-sm text-muted-foreground">{plan.desc}</div>
                </div>
                <div className="mb-7">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1.5">Sats/min</span>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">{plan.fcfa}</div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="size-4 text-success shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={goAuth}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition ${
                    plan.highlight
                      ? "premium-gradient text-white shadow-lg hover:opacity-90"
                      : "border border-border hover:border-primary/50 hover:bg-accent/40"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {(() => {
        const TESTIMONIALS = [
          { initials: "KA", name: "Koffi A.",  role: "Développeur ML",  location: "Cotonou, BJ", from: "from-primary",   to: "to-secondary", quote: "J'ai réduit mes coûts de calcul de 60% en passant sur VoltCompute. Le paiement en Sats c'est un vrai plus pour moi." },
          { initials: "FM", name: "Fatou M.",  role: "Data Scientist",  location: "Dakar, SN",   from: "from-secondary", to: "to-tertiary",  quote: "La console en direct et les métriques temps réel m'ont permis d'optimiser mes scripts comme jamais. Interface vraiment soignée." },
          { initials: "EO", name: "Emeka O.",  role: "Opérateur Node",  location: "Lagos, NG",   from: "from-success",   to: "to-primary",   quote: "Mon RTX 3080 génère maintenant 4 000 Sats par jour en idle. Je recommande à tous les gamers africains." },
        ];

        function TestimonialsCarousel() {
          const [active, setActive] = useState(0);
          const [fading, setFading] = useState(false);
          const timeoutRef = useRef<number | null>(null);

          useEffect(() => {
            const id = window.setInterval(() => {
              setFading(true);
              if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
              timeoutRef.current = window.setTimeout(() => {
                setActive((v) => (v + 1) % TESTIMONIALS.length);
                setFading(false);
              }, 350);
            }, 4000);

            return () => {
              window.clearInterval(id);
              if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            };
          }, []);

          const go = (i: number) => {
            if (i === active) return;
            setFading(true);
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
              setActive(i);
              setFading(false);
            }, 350);
          };

          const t = TESTIMONIALS[active];

          return (
            <div className="max-w-2xl mx-auto px-6 text-center">
              <div
                className="card-surface p-8 sm:p-10 transition-all duration-350"
                style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)" }}
              >
                <div className="flex justify-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-tertiary text-lg">★</span>
                  ))}
                </div>
                <p className="text-base sm:text-lg text-foreground leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className={`size-10 rounded-full bg-linear-to-br ${t.from} ${t.to} grid place-items-center text-white text-sm font-bold shrink-0`}>
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role} · {t.location}</div>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 premium-gradient" : "w-2 h-2 bg-border hover:bg-muted-foreground"}`}
                  />
                ))}
              </div>
            </div>
          );
        }

        return (
          <section className="py-28 bg-surface/50" data-reveal>
            <div className="text-center mb-12 px-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-tertiary mb-3">Témoignages</div>
              <h2 className="text-3xl sm:text-4xl font-bold">Ils font confiance à VoltCompute</h2>
            </div>
            <TestimonialsCarousel />
          </section>
        );
      })()}

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto" data-reveal>
          <div className="relative overflow-hidden rounded-3xl premium-gradient p-14 sm:p-20 text-center">
            <div className="pointer-events-none absolute inset-0">
              <div className="blob-1 absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="blob-2 absolute -bottom-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                Prêt à rejoindre<br />le réseau ?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Commencez à louer du compute ou monétisez votre machine dès aujourd'hui.
                Inscription gratuite, paiement à la minute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={goAuth}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-always-dark font-bold text-base hover:bg-white/90 transition shadow-xl flex items-center justify-center gap-2"
                >
                  ⚡ Créer mon compte <ArrowRight className="size-4" />
                </button>
                <button
                  onClick={goAuth}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/30 text-white font-semibold text-base hover:bg-white/10 transition"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-surface py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-lg premium-gradient grid place-items-center shadow">
                  <Zap className="size-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold">VoltCompute</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le calcul décentralisé d'Afrique de l'Ouest, payé en Satoshis via le Lightning Network.
              </p>
            </div>
            {[
              { title: "Produit", links: ["Marketplace", "Exécution", "Mes Machines", "Portefeuille"] },
              { title: "Ressources", links: ["Documentation", "API", "Status", "Blog"] },
              { title: "Légal", links: ["Confidentialité", "Conditions", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold text-sm mb-4">{col.title}</div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VoltCompute. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              {[Github, ExternalLink, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" className="size-8 grid place-items-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
