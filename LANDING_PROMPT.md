# Prompt Cursor — Landing Page VoltCompute

Je travaille sur VoltCompute, une plateforme de calcul décentralisé permettant
de louer ou monétiser de la puissance GPU/CPU avec paiement en Satoshis via le
Lightning Network. Le projet est en React 19 + TanStack Start avec routing
file-based (TanStack Router), Tailwind CSS v4 et Vite.

## Objectif

Crée une landing page publique (sans authentification requise)
professionnelle, fluide et animée pour vendre la solution VoltCompute.

## Routing

- Crée le fichier `src/routes/index.tsx` comme route publique `/` (landing page)
- Déplace `src/routes/_authenticated/index.tsx` vers
  `src/routes/_authenticated/marketplace.tsx`
- Mets à jour le lien "Marketplace" dans `src/components/AppShell.tsx`
  pour pointer vers `/marketplace` au lieu de `/`

## Design system existant (À RESPECTER ABSOLUMENT)

Police : Inter (sans) + JetBrains Mono (mono)

Classes utilitaires disponibles :
- `premium-gradient` → dégradé cobalt→violet (135deg)
- `premium-gradient-text` → même dégradé en texte transparent
- `card-surface` → carte avec fond card, border, border-radius, shadow
- `pulse-dot` → animation pulse sur un point de statut

Variables CSS (thème dark par défaut) :
- `--primary` → cobalt oklch(0.62 0.22 268)
- `--secondary` → violet oklch(0.55 0.25 305)
- `--tertiary` → corail oklch(0.78 0.14 40)
- `--success` → vert oklch(0.72 0.17 155)
- `--background` → fond sombre oklch(0.13 0.018 270)
- `--surface` → carte légèrement plus claire
- `--border` → bordure subtile
- `--muted-foreground` → texte secondaire
- `bg-primary/15`, `text-primary`, `border-primary/30` etc. fonctionnent
  avec toutes les couleurs du thème

## Sections à créer (dans l'ordre)

### 1. Navbar fixe
- Logo VoltCompute (icône Zap + nom) à gauche
- Liens de navigation : Fonctionnalités, Tarifs, À propos
- Boutons à droite : "Se connecter" (outline) + "Commencer" (premium-gradient)
- Fond transparent qui devient `bg-surface/80 backdrop-blur` au scroll

### 2. Hero
- Badge animé en haut : "⚡ Réseau actif — 4 250 nodes en ligne" avec pulse-dot vert
- Titre H1 très grand (text-6xl/7xl) en deux lignes :
  Ligne 1 normale : "La puissance de calcul"
  Ligne 2 en premium-gradient-text : "décentralisée d'Afrique"
- Sous-titre : description courte de la valeur proposition
- 2 boutons CTA : "Louer du compute" (premium-gradient, grand) +
  "Monétiser ma machine" (outline border-border)
- En dessous des CTAs : 3 micro-stats inline
  (ex: "99.9% uptime · Paiement instantané · 0 frais cachés")
- Background : grands blobs de couleur flous (primary/10, secondary/10)
  animés lentement en float, + grille de points subtile

### 3. Bande de statistiques
- Fond `bg-surface` avec border top et bottom
- 4 stats avec grands chiffres en premium-gradient-text :
  "4 250+ Nodes", "1.2M Sats échangés", "99.98% Uptime", "< 500ms Latence"
- Animation de compteur (count-up) au scroll

### 4. Comment ça marche (3 étapes)
- Section avec titre centré
- 3 cartes card-surface côte à côte avec numéro, icône, titre, description :
  1. "Choisissez un node" — Parcourez le marketplace et filtrez par GPU/CPU,
     tarif et localisation
  2. "Lancez votre workload" — Uploadez votre script ou connectez un repo
     GitHub et démarrez en un clic
  3. "Payez en Sats" — Paiement automatique via Lightning Network,
     à la minute et sans friction
- Ligne de connexion visuelle entre les cartes (dégradé horizontal)

### 5. Fonctionnalités clés (grille 2x3)
- Titre de section centré
- 6 cartes card-surface avec icône colorée, titre, description :
  - ⚡ Lightning Network — Paiements instantanés en Satoshis
  - 🌍 Réseau africain — Nodes localisés en Afrique de l'Ouest
  - 🔒 Sécurisé — Exécution isolée dans des conteneurs Docker
  - 📊 Monitoring temps réel — Console live et métriques détaillées
  - 💰 Monétisez vos machines — Transformez votre GPU en source de revenus
  - 🚀 Multi-workload — Python, JS, Shell, repos GitHub
- Chaque carte : hover avec border-primary/40 et légère élévation

### 6. Tarifs
- 3 colonnes : Starter, Pro (mis en avant avec badge "Populaire" +
  border-primary + shadow glow), Enterprise
- Prix en Sats/min avec conversion FCFA en dessous
- Liste de features par plan avec checkmarks (text-success)
- Bouton CTA sur chaque carte

### 7. Témoignages (statiques)
- Titre centré
- 3 cartes card-surface avec avatar initiales (gradient), nom, rôle,
  pays et citation
- Exemple : "Koffi A." – Développeur ML, Cotonou ·
  "J'ai réduit mes coûts de calcul de 60% en passant sur VoltCompute."

### 8. CTA final
- Section avec fond premium-gradient (dégradé direct sur la section)
- Titre blanc grand, sous-titre, 2 boutons (blanc + outline blanc)
- Blobs lumineux en arrière-plan

### 9. Footer
- Logo + tagline
- 3 colonnes de liens : Produit, Ressources, Légal
- Ligne du bas : copyright + liens réseaux sociaux (icônes)

## Animations (IMPORTANT)

Utilise uniquement du CSS et des APIs natives du navigateur (pas de lib externe) :

- **Reveal au scroll** : Intersection Observer sur chaque section →
  classe `animate-in` qui déclenche `fade-in` + `slide-in-from-bottom-4`
  (tw-animate-css est déjà installé)
- **Hero blobs** : animation CSS `@keyframes float` lente (8-12s, ease-in-out,
  infinite, alternate) sur les blobs de fond
- **Compteurs** : count-up JS natif déclenché à l'entrée dans le viewport
  (Intersection Observer)
- **Navbar** : transition douce sur le fond au scroll
  (`addEventListener('scroll', ...)`)
- **Cartes** : `transition-all duration-300` avec `hover:-translate-y-1`
  et `hover:shadow-glow`
- **Badge hero** : pulse-dot déjà disponible en CSS

## Contraintes techniques

- TanStack Router file-based : la route publique est `src/routes/index.tsx`,
  elle ne doit PAS être dans `_authenticated/`
- Pas d'import depuis `@/integrations/supabase/` (supprimé)
- Utilise `useNavigate` de `@tanstack/react-router` pour les boutons CTA
  qui redirigent vers `/auth`
- Composant nommé `LandingPage`, exporté via `createFileRoute('/')`
- Pas de dépendances npm supplémentaires — tout en CSS natif + Tailwind
- Le fichier doit être autonome (un seul fichier `.tsx`),
  pas de sous-composants séparés
- Respecte le thème dark/light déjà en place (les variables CSS s'adaptent
  automatiquement)
