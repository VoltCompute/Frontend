import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Zap, Shield, BarChart3, Cpu, Globe, Store,
  Wallet, Menu, X, ArrowRight,
} from "lucide-react";
import logo from "@/assets/logo.png";
import heroIllustration from "@/assets/undraw_nakamoto_uy67.svg";

export const Route = createFileRoute("/")({
  component: LandingPage,
});



/* ─── Data ──────────────────────────────────────────────────── */
const stats = [
  { value: "4250+", label: "Nodes en ligne" },
  { value: "1.2M", label: "Sats routés" },
  { value: "99.98%", label: "Uptime réseau" },
  { value: "< 500ms", label: "Latence P95" },
];

const features = [
  {
    icon: Zap,
    title: "Paiement au satoshi près",
    desc: "Chaque minute de calcul se règle instantanément en Sats via Lightning. Pas de carte, pas de délai de compensation, pas de frais cachés.",
  },
  {
    icon: Globe,
    title: "Ancré en Afrique de l'Ouest",
    desc: "Nodes à Cotonou, Abidjan, Lagos, Accra, Dakar, Lomé. La latence reste locale — la disponibilité aussi.",
  },
  {
    icon: Shield,
    title: "Isolation par conteneur",
    desc: "Chaque workload s'exécute dans son propre conteneur Docker. Aucune donnée ne fuit vers un autre utilisateur.",
  },
  {
    icon: BarChart3,
    title: "Console en direct",
    desc: "Logs qui défilent, métriques CPU/GPU à la seconde. Vous voyez tourner votre calcul, littéralement.",
  },
];

const steps = [
  {
    num: "01",
    icon: Store,
    title: "Choisissez un node",
    desc: "Filtrez le marketplace par GPU, CPU, tarif ou localisation. Specs et latence sont visibles avant d'engager le moindre satoshi.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "Lancez le workload",
    desc: "Script Python, JS, Shell ou repo GitHub complet — connectez, et la console s'anime dès le premier octet reçu.",
  },
  {
    num: "03",
    icon: Wallet,
    title: "Payez en Sats",
    desc: "Le node facture à la minute, réglé au fil de l'eau via Lightning. Pas d'avance de frais, pas de facture surprise.",
  },
  {
    num: "04",
    icon: Zap,
    title: "Monétisez votre machine",
    desc: "GPU ou CPU inactif : listez-le, fixez votre tarif en Sats/min, et laissez le réseau vous payer pendant que vous dormez.",
  },
];

/* ─── Landing Page ──────────────────────────────────────────── */
function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goAuth = () => navigate({ to: "/auth" });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <header className={`fixed top-6 left-0 right-0 z-50 mx-auto max-w-[1500px] rounded-3xl border border-border/20 bg-surface/70 backdrop-blur-xl shadow-lg px-10 py-6 sm:px-14 lg:px-20 transition-all duration-300 ${
        scrolled ? "top-4" : ""
      }`}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center shrink-0">
            <div className="h-11 w-auto max-w-[min(220px,50vw)] overflow-hidden">
              <img src={logo} alt="VoltCompute" className="block w-full h-full object-contain object-left" />
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10 text-base font-semibold text-muted-foreground">
            <a href="#fonctionnalites" className="transition-colors hover:text-foreground">
              Fonctionnalités
            </a>
            <a href="#comment-ca-marche" className="transition-colors hover:text-foreground">
              Comment ça marche
            </a>
            <a href="#a-propos" className="transition-colors hover:text-foreground">
              À propos
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={goAuth} className="px-7 py-3 text-base font-bold rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
              Se connecter
            </button>
          </div>

          <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden size-9 grid place-items-center rounded-lg hover:bg-accent transition">
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl px-6 py-4 space-y-1 mt-4 rounded-b-3xl">
            <a href="#fonctionnalites" onClick={() => setMenuOpen(false)} className="block text-sm py-2.5 text-muted-foreground hover:text-foreground">Fonctionnalités</a>
            <a href="#comment-ca-marche" onClick={() => setMenuOpen(false)} className="block text-sm py-2.5 text-muted-foreground hover:text-foreground">Comment ça marche</a>
            <a href="#a-propos" onClick={() => setMenuOpen(false)} className="block text-sm py-2.5 text-muted-foreground hover:text-foreground">À propos</a>
            <div className="flex gap-3 pt-3">
              <button onClick={goAuth} className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-border text-muted-foreground">Se connecter</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 pb-4 pt-28 sm:px-10 sm:pt-24 lg:px-14 lg:pt-28">
        {/* Subtle background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-secondary/[0.06] to-transparent" />
          <div className="absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-primary/[0.04] to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text */}
          <div className="hero-d2">
            <h1 className="text-[2rem] font-extrabold leading-[1.18] tracking-tight text-primary sm:text-[2.5rem] md:text-[2.85rem] lg:text-[3.1rem]">
              La puissance qui dormait,
              <br />
              <span className="premium-gradient-text">s'active enfin.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Louez du GPU ou du CPU à la minute, ou transformez votre machine inactive
              en revenu. Chaque paiement part et arrive en Satoshis, réglé par le
              Lightning Network instantané, sans banque, sans friction.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 hero-d4">
              <button
                onClick={goAuth}
                className="group inline-flex items-center gap-2 border-2 rounded-xl bg-primary px-7 py-3.5 text-[0.95rem] font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Louer de la puissance de calcul
              </button>
              <button
                onClick={goAuth}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-3 py-3.5 text-[0.95rem] font-semibold text-primary transition-all hover:border-primary/30 hover:shadow-md"
              >
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right — Hero illustration */}
          <div className="hero-d3 flex justify-center lg:justify-end mt-16 lg:mt-20">
            <div className="relative">
              <div className="absolute -inset-3" />
              <img
                src={heroIllustration}
                alt="Illustration VoltCompute"
                className="relative h-[clamp(400px,60vh,550px)] w-auto object-contain lg:max-h-[75vh]"
              />
            </div>
          </div>
        </div>

        {/* ──────────── STATS BAR ──────────── */}
        <div className="hero-d5 relative mx-auto mt-14 max-w-[1500px] sm:mt-16">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center px-4 text-center">
                <span className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
                  {s.value}
                </span>
                <span className="mt-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section
        id="comment-ca-marche"
        className="relative overflow-hidden bg-gradient-to-b from-surface-2 to-surface px-6 py-20 sm:px-10 sm:py-24 lg:px-14"
      >
        <div className="mx-auto max-w-[1500px]">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">
              Comment ça marche
            </span>
            <h2 className="mx-auto mt-3 max-w-xl text-[1.75rem] font-extrabold leading-tight text-primary sm:text-3xl lg:text-[2.25rem]">
              Un parcours simple en 4 étapes
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              De la sélection du node à la première invoice réglée, notre plateforme vous accompagne à chaque
              étape.
            </p>
          </div>

          <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line (desktop) */}
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-12 hidden h-[2px] bg-gradient-to-r from-transparent via-secondary/20 to-transparent lg:block" />

            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-surface shadow-soft ring-1 ring-border">
                  <step.icon className="h-9 w-9 text-primary" strokeWidth={1.5} />
                </div>
                <span className="mt-4 text-xs font-bold tracking-widest text-secondary">
                  ÉTAPE {step.num}
                </span>
                <h3 className="mt-2 text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── FEATURES / "Our Services" ──────────── */}
      <section id="fonctionnalites" className="px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">
                Nos fonctionnalités
              </span>
              <h2 className="mt-3 text-[1.75rem] font-extrabold leading-tight text-primary sm:text-3xl lg:text-[2.25rem]">
                Des outils puissants
                <br />
                pour votre compute
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground lg:ml-auto lg:text-right">
              Notre plateforme combine puissance de calcul distribuée, paiement instantané en Lightning
              et isolation par conteneur pour une expérience de compute sans friction.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((f, i) => (
              <div key={f.title} className="group relative flex flex-col rounded-2xl border border-border bg-surface p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-lift sm:p-8">
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.06] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <f.icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <button
                    onClick={goAuth}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CTA SECTION ──────────── */}
      <section className="px-6 py-20 sm:px-10 sm:py-24 lg:px-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#15294a] px-10 py-16 text-center sm:px-20 sm:py-24">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-secondary/10" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/[0.06]" />

            <div className="relative">
              <h2 className="text-2xl font-extrabold text-primary-foreground sm:text-3xl lg:text-4xl">
                Prêt à activer votre puissance de calcul ?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Rejoignez le réseau VoltCompute et commencez dès aujourd'hui à louer du compute
                ou monétiser votre machine — tout réglé en Satoshis.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={goAuth}
                  className="group inline-flex items-center gap-2 rounded-xl bg-surface px-8 py-3.5 text-[0.95rem] font-bold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Créer un compte
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={goAuth}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-8 py-3.5 text-[0.95rem] font-bold text-primary-foreground transition-all hover:border-white/40 hover:bg-white/5"
                >
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER ──────────── */}
      <footer id="a-propos" className="border-t border-border bg-surface px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="h-9 w-auto max-w-[180px] overflow-hidden">
                <img src={logo} alt="VoltCompute" className="block w-full h-full object-contain object-left" />
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Réseau de calcul distribué en Afrique de l'Ouest, réglé en Satoshis via Lightning Network.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Navigation</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <a href="#fonctionnalites" className="transition-colors hover:text-foreground">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#comment-ca-marche" className="transition-colors hover:text-foreground">
                    Comment ça marche
                  </a>
                </li>
                <li>
                  <a href="#a-propos" className="transition-colors hover:text-foreground">
                    À propos
                  </a>
                </li>
              </ul>
            </div>

            {/* Accès */}
            <div>
              <h4 className="text-sm font-bold text-foreground">Accès</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <button onClick={goAuth} className="transition-colors hover:text-foreground">
                    Connexion
                  </button>
                </li>
                <li>
                  <button onClick={goAuth} className="transition-colors hover:text-foreground">
                    Inscription
                  </button>
                </li>
              </ul>
            </div>

            {/* Projet */}
            <div>
              <h4 className="text-sm font-bold text-foreground">À propos</h4>
              <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li>BMM Hack — G3N3S1S</li>
                <li>Réseau ouest-africain</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VoltCompute — Réseau de calcul distribué
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/70">v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
