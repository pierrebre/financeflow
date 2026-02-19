# FinanceFlow — Audit Complet
> Généré le 2026-02-19 | Branche : `develop`

---

## Table des matières
1. [Architecture & Structure](#1-architecture--structure)
2. [Qualité du Code](#2-qualité-du-code)
3. [Performance](#3-performance)
4. [SEO & Accessibilité](#4-seo--accessibilité)
5. [Sécurité](#5-sécurité)
6. [UX/UI](#6-uxui)
7. [Base de données](#7-base-de-données)
8. [Tests & CI/CD](#8-tests--cicd)
9. [Résumé exécutif & Priorités](#9-résumé-exécutif--priorités)

---

## 1. Architecture & Structure

### 1.1 Arborescence du projet
```
financeflow/
├── app/                          # Next.js App Router
│   ├── (protected)/
│   │   ├── admin/page.tsx
│   │   └── dashboard/page.tsx
│   ├── api/
│   │   ├── avatar/upload/route.ts
│   │   └── favorites/route.ts
│   ├── auth/                     # Login, register, reset, verify
│   ├── blog/page.tsx
│   ├── coin/[id]/                # Dynamic coin page
│   ├── watchlist/page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (crypto market table)
│   └── providers.tsx
├── src/
│   ├── actions/                  # Server Actions
│   │   ├── auth/                 # login, register, reset, settings
│   │   ├── external/             # crypto.ts (CoinGecko), rss.ts
│   │   ├── portfolio/            # portfolio.ts, portfolioCoin.ts
│   │   └── transaction/          # transaction.ts
│   ├── components/
│   │   ├── auth/                 # Auth forms
│   │   ├── blog/                 # BlogCard
│   │   ├── coin/                 # AllTimeStats, CoinStats, PriceHighLow
│   │   ├── dashboard/
│   │   │   ├── portfolio/        # Portfolio, PortfolioList, dialogs
│   │   │   │   ├── asset/        # PortfolioCoinProvider
│   │   │   │   ├── statistic/    # PortfolioAllocationChart
│   │   │   │   └── transaction/  # TransactionForm, TransactionProvider
│   │   │   └── formProfil.tsx
│   │   ├── dataTable/            # DataTable, columns, TableCell
│   │   ├── skeletons/            # CoinPageSkeleton
│   │   └── ui/                   # Radix UI wrappers
│   ├── hooks/                    # use-favorites, use-intersection-observer
│   ├── lib/                      # utils, mail, prisma singleton
│   ├── repositories/             # portfolio (server-side DB queries)
│   └── schemas/                  # Zod schemas + TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── auth.ts / auth-config.ts      # NextAuth v5 configuration
├── middleware.ts                 # Route protection
├── routes.ts                     # Public/protected route definitions
└── providersProviders.cy.tsx     # ⚠️ Cypress test à la racine (mauvais emplacement)
```

### 1.2 Routing
- **App Router** : utilisé correctement avec route groups `(protected)`
- Middleware implémenté pour protéger les routes `/dashboard`, `/admin`
- Routes publiques correctement définies dans `routes.ts`

### 1.3 Séparation des responsabilités
- ✅ Bonne séparation Server Actions / Repository / Composants
- ✅ Hooks custom isolés dans `src/hooks/`
- ✅ Schémas de validation centralisés dans `src/schemas/`
- ⚠️ `providersProviders.cy.tsx` à la racine du projet (devrait être dans `cypress/`)

### 1.4 Fichiers orphelins / mal placés
| Fichier | Problème |
|---|---|
| `providersProviders.cy.tsx` (racine) | Test Cypress à la racine au lieu de `cypress/` |
| `result.html` (racine) | Fichier non versionné, probablement un artefact de test |
| `cypress.config` (sans extension) | Doublon de `cypress.config.ts` |
| `.loc.env` | Fichier d'env non documenté |

### 1.5 Dépendances
| Problème | Détail |
|---|---|
| `next-auth` 5.0.0-beta.19 | Version bêta en production — instabilité possible |
| `resend` 4.0.1-alpha.0 | Version alpha en production |
| `bcrypt` ET `bcryptjs` | Les deux packages sont installés (doublon) |
| `dotenv` | Inutile avec Next.js (gestion native des .env) |
| Pas de `.env.example` | Impossible d'onboarder un nouveau dev sans les secrets |

---

## 2. Qualité du Code

### 2.1 Erreurs TypeScript (`npx tsc --noEmit`)
**1 erreur bloquante :**

```
.next/types/app/layout.ts(28,13): error TS2344
Type 'OmitWithTag<Readonly<{ children: ReactNode; session: Session; }>, keyof LayoutProps, "default">'
does not satisfy the constraint '{ [x: string]: never; }'.
Property 'session' is incompatible with index signature.
```

**Cause** : `app/layout.tsx` accepte un prop `session` non standard dans l'App Router.
Les layouts Next.js App Router n'acceptent que `children` comme prop. La session doit être obtenue via `auth()` en interne.

**Fichier** : `app/layout.tsx:23`
```tsx
// ❌ Incorrect
export default function RootLayout({ children, session }: Readonly<{ children: React.ReactNode; session: Session }>) {

// ✅ Correct
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
```

### 2.2 Usages de `any` (11 occurrences)
| Fichier | Ligne | Problème |
|---|---|---|
| `src/components/coin/all-time-stats.tsx` | 5 | `getNumericValue(value: any)` |
| `src/components/coin/all-time-stats.tsx` | 11 | `getDateString(dateValue: any)` |
| `src/components/coin/all-time-stats.tsx` | 21,25 | Cast complexe vers `{ [key: string]: any }` |
| `src/components/dataTable/table-cell.tsx` | 9-10 | `cell: any; row: any;` |
| `src/components/confirmation-dialog.tsx` | 9 | `onConfirm: any` — devrait être `() => Promise<void>` |
| `src/schemas/transaction.ts` | 21 | `portfolioCoin?: any` |
| `src/components/dashboard/portfolio/statistic/portfolio-allocation-chart.tsx` | 69 | `CustomTooltip = ({ active, payload }: any)` |
| `src/components/dashboard/portfolio/statistic/portfolio-allocation-chart.tsx` | 99 | `formatter={(value: any) => ...}` |
| `src/actions/external/crypto.ts` | 177 | `data.map((coin: any) => ...)` |
| `src/actions/external/crypto.ts` | ~40 | `context: Record<string, any>` dans `withErrorHandling` |

### 2.3 Erreurs ESLint (1 erreur, 7 warnings)
| Fichier | Sévérité | Problème |
|---|---|---|
| `providersProviders.cy.tsx:7` | **ERROR** | `children` passés comme prop au lieu d'être nestés |
| `src/components/blog/blog-card.tsx:13` | WARNING | `<img>` au lieu de `<Image />` de `next/image` |
| `portfolio-coin-provider.tsx:98,112` | WARNING | `addCoin`/`removeCoin` invalident `useMemo` à chaque render |
| `transaction-form.tsx:52` | WARNING | `useMemo` dependency manquante (`form`) + expression complexe |
| `use-transaction-form.tsx:36` | WARNING | `useEffect` dependency manquante (`fetchCoinData`) |

### 2.4 Conventions de nommage incohérentes
| Problème | Fichiers concernés |
|---|---|
| **Typo "portoflio"** (au lieu de "portfolio") | `portoflio-table-actions.tsx`, `portoflio-update-dialog.tsx`, `TableCellProps.portoflioId` dans `table-cell.tsx` |
| **Enum en français** (`ACHAT`, `VENTE`) | `prisma/schema.prisma`, `src/schemas/transaction.ts` — mélange langue dans codebase anglophone |

### 2.5 Console statements (18 occurrences)
Tous sont des `console.error` utilisés légitimement pour le logging d'erreurs. Acceptable mais devrait être remplacé par un vrai système de monitoring en production (Sentry, etc.).

### 2.6 Imports inutilisés
- `next-auth.d.ts` : étend les types NextAuth (correct, à conserver)
- `bcrypt` importé en `@types/bcrypt` sans utilisation directe (seul `bcryptjs` est utilisé dans le code)

---

## 3. Performance

### 3.1 Images non optimisées
- `src/components/blog/blog-card.tsx:13` — utilise `<img>` au lieu de `<Image />` Next.js
  - Pas de lazy-loading automatique, pas d'optimisation WebP/AVIF, pas de `placeholder blur`

### 3.2 Next.js Image config trop permissive
`next.config.mjs` :
```js
// ❌ Accepte TOUTES les images de TOUS les domaines
remotePatterns: [{ protocol: 'https', hostname: '**', pathname: '**' }]
```
Risque de sécurité + coût Vercel Image Optimization non maîtrisé.

### 3.3 React Hooks / Re-renders
- `portfolio-coin-provider.tsx` : `addCoin` et `removeCoin` sont recréés à chaque render → invalident le `useMemo` à la ligne 139 → re-renders inutiles. Nécessite `useCallback`.
- `use-transaction-form.tsx` : `fetchCoinData` absent du tableau de dépendances de `useEffect` → comportement potentiellement incorrect (stale closure).

### 3.4 Points positifs
- ✅ React Query avec `staleTime` et `gcTime` configurés
- ✅ `useIntersectionObserver` pour le scroll infini (lazy loading)
- ✅ Pagination (20 items/page, max 5 pages)
- ✅ `useMemo` dans `portfolio-allocation-chart.tsx`
- ✅ Framer Motion déjà intégré
- ✅ `next/font` pour l'Inter (optimisation de chargement des fonts)

### 3.5 Code splitting / Suspense
- Pas de `React.lazy()` / `dynamic()` pour les composants lourds (charts, tables)
- Pas de `Suspense` boundaries explicites

---

## 4. SEO & Accessibilité

### 4.1 Metadata
```tsx
// app/layout.tsx — Metadata basique, suffisant pour le moment
export const metadata: Metadata = {
  title: 'FinanceFlow',
  description: 'FinanceFlow is a web application...'
};
```
- ✅ Title et description présents
- ❌ Pas d'Open Graph tags (`og:image`, `og:url`, `og:type`)
- ❌ Pas de Twitter/X Cards
- ❌ Pas de metadata dynamique pour `/coin/[id]` (chaque page crypto devrait avoir son propre titre/description)
- ✅ `sitemap.xml` configuré via `next-sitemap`
- ✅ `robots.txt` présent

### 4.2 Accessibilité
- ✅ `aria-label` présent sur plusieurs éléments interactifs
- ✅ `alt="bg"` sur l'image du BlogCard (peu descriptif — devrait être le titre de l'article)
- ⚠️ `alt="bg"` générique dans `blog-card.tsx` — doit correspondre au contenu
- ✅ Semantic HTML correct (main, nav, section)
- ⚠️ Certains boutons icône manquent d'`aria-label` explicite

### 4.3 Responsive
- ✅ Tailwind CSS utilisé avec breakpoints
- ✅ Menu mobile présent (`mobile-menu.tsx`)

---

## 5. Sécurité

### 5.1 ✅ Fichier `.env` correctement ignoré par Git
```bash
$ git check-ignore -v .env
.gitignore:29:*.env   .env   # ← IGNORED ✓
```
Le fichier `.env` est bien exclu du versioning via le pattern `*.env` dans `.gitignore`. Aucun secret n'est exposé dans l'historique Git.

Néanmoins, un fichier `.env.example` documentant les variables requises est absent — ce qui complique l'onboarding.

### 5.2 URLs API hardcodées (pas de variables d'env)
`src/actions/external/crypto.ts` — 6 occurrences :
```ts
// ❌ Hardcodé
const url = `https://api.coingecko.com/api/v3/coins/markets?...`

// ✅ Recommandé
const COINGECKO_BASE_URL = process.env.COINGECKO_API_URL ?? 'https://api.coingecko.com/api/v3';
```

### 5.3 Image remote patterns trop permissifs
Voir section 3.2 — `hostname: '**'` accepte n'importe quelle source.

### 5.4 Pas de rate limiting sur les routes API
`app/api/favorites/route.ts` — Aucun rate limiting → vulnérable aux abus.

### 5.5 Points positifs
- ✅ `bcryptjs` pour le hashing des mots de passe
- ✅ Middleware de protection des routes
- ✅ NextAuth avec CSRF protection
- ✅ Validation Zod sur les inputs
- ✅ Prisma avec requêtes paramétrées (protection SQL injection)
- ✅ `rel="noopener noreferrer"` sur les liens externes

---

## 6. UX/UI

### 6.1 Points positifs
- ✅ Design system cohérent via Radix UI + Tailwind
- ✅ Toasts pour le feedback utilisateur
- ✅ Skeletons de chargement (`loading-skeleton.tsx`, `coin-page-skeleton.tsx`)
- ✅ Framer Motion déjà intégré (animations)
- ✅ États vides gérés (ex: `no-transactions-placeholder.tsx`)
- ✅ Dialog de confirmation pour les actions destructives

### 6.2 Manques
- ❌ Pas de dark/light mode toggle (thème unique)
- ❌ Pas de `Error Boundary` global (les erreurs non catchées font crasher l'app entière)
- ❌ Le `CustomTooltip` du PieChart a un fond blanc fixe — invisible en dark mode si ajouté

---

## 7. Base de données

### 7.1 Schéma Prisma
- ✅ Relations bien définies avec `onDelete: Cascade`
- ✅ Singleton Prisma client (évite les connexions multiples en dev)
- ⚠️ **Mélange d'ID** : `@default(cuid())` pour User/auth tokens, `@default(uuid())` pour Portfolio/Watchlist/Transaction — à uniformiser
- ⚠️ **Enum en français** : `TransactionType { ACHAT VENTE }` — incohérent avec le reste du code en anglais

---

## 8. Tests & CI/CD

### 8.1 Couverture de tests
- ✅ Cypress E2E configuré
- ❌ **Aucun test unitaire** (pas de Jest, pas de Vitest, pas de React Testing Library)
- ❌ `providersProviders.cy.tsx` à la racine (mauvais emplacement, devrait être dans `cypress/e2e/`)
- ⚠️ Le fichier Cypress a une erreur ESLint bloquante (children prop)

### 8.2 CI/CD
- ✅ GitHub Actions présent (`.github/`)
- ✅ Script `vercel-build` : `prisma generate && prisma migrate deploy && next build && next-sitemap`
- ⚠️ Pas de lint/typecheck dans le pipeline CI constaté

---

## 9. Résumé exécutif & Priorités

### 🔴 CRITIQUE (à corriger immédiatement)
| # | Problème | Fichier |
|---|---|---|
| C1 | Erreur TypeScript bloquante — prop `session` invalide dans layout App Router | `app/layout.tsx` |

### 🟠 IMPORTANT
| # | Problème | Fichier |
|---|---|---|
| I1 | 11 usages de `any` — rupture du contrat TypeScript strict | Multiple |
| I2 | `<img>` non optimisé dans BlogCard | `src/components/blog/blog-card.tsx` |
| I3 | `react-hooks/exhaustive-deps` warnings — bugs potentiels | 3 fichiers |
| I4 | Enum français (`ACHAT`/`VENTE`) incohérent avec codebase anglophone | `prisma/schema.prisma` |
| I5 | Typo "portoflio" dans 5 fichiers | Multiple |
| I6 | Image remote patterns trop permissifs (`**`) | `next.config.mjs` |
| I7 | URLs API hardcodées (CoinGecko) | `src/actions/external/crypto.ts` |
| I8 | Beta/Alpha deps en production (`next-auth`, `resend`) | `package.json` |
| I9 | Doublon de dépendances (`bcrypt` + `bcryptjs`) | `package.json` |
| I10 | Pas de metadata Open Graph / Twitter Cards | `app/layout.tsx` |
| I11 | Pas de metadata dynamique pour les pages `/coin/[id]` | `app/coin/[id]/page.tsx` |

### 🟡 MINEUR
| # | Problème | Fichier |
|---|---|---|
| M1 | Fichiers orphelins à la racine (`result.html`, `cypress.config`) | Racine |
| M2 | `providersProviders.cy.tsx` mal placé + erreur ESLint | Racine |
| M3 | Pas de `.env.example` | — |
| M4 | `console.error` sans monitoring structuré | Multiple |
| M5 | Pas d'Error Boundary global | — |
| M6 | Pas de rate limiting API | `app/api/favorites/route.ts` |
| M7 | Mélange cuid/uuid dans Prisma | `prisma/schema.prisma` |
| M8 | `dotenv` installé mais inutile avec Next.js | `package.json` |
| M9 | README.md minimal | `README.md` |
| M10 | Aucun test unitaire | — |

---

*Fin de l'audit. Voir Phase 2 pour les corrections.*
