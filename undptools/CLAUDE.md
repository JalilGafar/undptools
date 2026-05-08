# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
ng serve                                      # Dev server at http://localhost:4200
ng build                                      # Production build
ng build --watch --configuration development  # Watch mode
ng test                                       # Run all tests (Karma/Jasmine)
ng test --include='**/t1c/**'                 # Run tests for a specific component
node dist/undptools/server/server.mjs         # Serve the SSR build
```

The backend API must be running separately at `http://localhost:8080` (configured in `src/environment/environment.ts`).

## Architecture

### Overview

Angular 20 SPA with SSR (`@angular/ssr`). Application UNDP d'accompagnement de consultants pour le diagnostic et le suivi d'entreprises. Trois modules lazy-loaded (`consultant`, `manager`, `mintoul`) routés depuis `src/app/app.routes.ts`. UI : PrimeNG 20 (thème Aura) + Bootstrap 5.

Tous les composants sont **standalone** (Angular 14+). Les modules ne déclarent aucun composant — ils se contentent d'importer le module de routing.

---

### Routing

**Racine (`src/app/app.routes.ts`) :**

| Route | Composant | Garde |
|---|---|---|
| `/login`, `/register` | Auth | — |
| `/visitor` | VisitorHomeComponent | — |
| `/consultant/**` | ConsultantModule | `AuthGuard` |
| `/manager/**` | ManagerModule | `AdminGuard` |
| `/mintoul/**` | MintoulModule | — |

**Module Consultant :**

| Route | Composant |
|---|---|
| `/consultant/companies` | Liste des entreprises |
| `/consultant/dashbord/:id` | Dashboard entreprise — **point d'entrée des outils** |
| `/consultant/tool/attribut` | Outil pré-diagnostic (19 critères) |
| `/consultant/tool/t1c` | Suivi des activités (Gantt) |
| `/consultant/tool/t1d` | Matrice intégrale (62 questions) |
| `/consultant/tool/t1ea` | Outil t1ea |
| `/consultant/tool/t2d` | Business Model Canvas |
| `/consultant/tool/t1b`, `t1f`… | `OnconstructionComponent` (à venir) |

**Module Manager :**

| Route | Composant |
|---|---|
| `/manager/listconsult` | Liste des consultants |
| `/manager/manOneConsult/:id` | Profil consultant — **set ConsultantId** |
| `/manager/listcompany/:id` | Entreprises d'un consultant |
| `/manager/dashbord` | Dashboard manager |

---

### Authentification & Session

- Auth par cookie HTTP-only (session Spring Boot).
- `HttpRequestInterceptor` (`src/app/_helpers/http.interceptor.ts`) ajoute `withCredentials: true` à toutes les requêtes.
- `StorageService` (`src/app/_services/storage.service.ts`) :
  - Persiste l'objet user en `sessionStorage` (clé `auth-user`).
  - Stocke **en mémoire** `CompanyId` et `ConsultantId` (non persistés, perdus au refresh).
- `AuthGuard` vérifie `sessionStorage`; `AdminGuard` vérifie le rôle admin.

---

### Services principaux

| Service | Fichier | Rôle |
|---|---|---|
| `ConsultantService` | `consultant/consultant.service.ts` | Store central : BehaviorSubjects pour entreprises, outils, labels |
| `StorageService` | `_services/storage.service.ts` | Session user + IDs runtime (`CompanyId`, `ConsultantId`) + visibilité sidebar |
| `ShareServiceService` | `shared/share-service.service.ts` | Visibilité menus (`menuVisible$`, `manMenuVisible$`) et état loading global |
| `AuthService` | `_services/auth.service.ts` | Appels HTTP signin / signup / signout |

#### Pattern `ConsultantService`

Chaque domaine suit le même schéma — pas de NgRx :

```ts
private _X$ = new BehaviorSubject<T[]>([]);
get X$(): Observable<T[]> { return this._X$.asObservable(); }
clearX() { this._X$.next([]); }

getXById(idUser, idComp) {
  this.http.get<T[]>(...).pipe(tap(data => this._X$.next(data))).subscribe();
}
```

Les composants appellent `clearX()` puis `getXById()` dans `ngOnInit`, et s'abonnent à `X$`.

#### Logique de double identité (consultant vs manager)

`StorageService.ConsultantId` vaut `0` quand le consultant consulte ses propres données. Un manager navigue vers `/manager/manOneConsult/:id`, ce qui set `ConsultantId` à l'ID du consultant ciblé. Tous les outils testent ce cas :

```ts
const id = this.storageService.ConsultantId === 0
  ? this.storageService.getUser().id
  : this.storageService.ConsultantId;
this.toolService.getXById(id, this.storageService.CompanyId);
```

#### `StorageService.visibleTools$`

`DashbordComponent` appelle `setVisibleToolsTrue()` dans `ngOnInit` (via `setTimeout` pour éviter ExpressionChangedAfterChecked). La sidebar des outils s'affiche uniquement quand on est dans le contexte d'une entreprise.

---

### Outils de diagnostic

Répertoire : `src/app/consultant/components/tools/`

| Outil | Route | Statut | Description |
|---|---|---|---|
| `attribut` | `/tool/attribut` | ✅ | Pré-diagnostic : 19 questions, 5 critères pondérés, score sur 100, graphique ngx-charts |
| `t1c` | `/tool/t1c` | ✅ | Suivi des activités : CRUD + diagramme Gantt (frappe-gantt), drag pour modifier dates/progress |
| `t1d` | `/tool/t1d` | ✅ | Matrice intégrale : 62 questions (note + commentaire) |
| `t1ea` | `/tool/t1ea` | ✅ | — |
| `t1b` | `/tool/t1b` | ✅ | — |
| `t2d` | `/tool/t2d` | ✅ | Business Model Canvas : 12 sections × 3 inputs, formulaire → canvas imprimable |
| `inmotion` | `/tool/inmotion` | ✅ | Viewer 360° (`@photo-sphere-viewer`) |
| `evaluation` | `/tool/evaluation` | ✅ | — |
| `t1a`, `t1f`–`t1l`, `t2a`–`t2c`, `t2e`–`t2g` | — | 🚧 | `OnconstructionComponent` |

Chaque outil persiste ses données avec `cons_id` + `comp_id` comme clés étrangères.

---

### Modèles (`src/app/core/model/`)

| Modèle | Description |
|---|---|
| `Company` | Entité principale sur laquelle travaillent les consultants |
| `GanttTask` | Tâche Gantt — dates en `string` format `YYYY-MM-DD` |
| `UpdateGanttTaskDto` | Payload partiel pour PUT activités (date ou progress uniquement) |
| `ToolAttrib` | Résultats outil attribut (19 notes + commentaires) |
| `BusinessModelCanvas` | BMC : 12 sections × 3 champs + métadonnées (`cons_id`, `comp_id`, `date`) |
| `PrediaLabelJSON` / `PrediaLabel` / `Child` | Labels de la matrice pré-diagnostic — `children` est un JSON sérialisé à parser manuellement |
| `IntegLabel` | Labels de la matrice intégrale |
| `Activity` | Modèle local (non API) pour l'affichage des activités |

---

### Shared Module

`src/app/shared/primeng.module.ts` re-exporte les composants PrimeNG utilisés globalement (Button, InputText, Drawer, MegaMenu…). À importer dans les feature modules plutôt que les composants PrimeNG individuellement.

---

### API Endpoints

Toutes les requêtes passent par `environment.apiUrl` (`http://localhost:8080`) :

```
POST   /api/auth/signin
POST   /api/auth/signup
POST   /api/auth/signout

GET    /api/consultant/companies
GET    /api/consultant/companiesUser?idUser=
POST   /api/consultant/newCompany

GET    /api/tools/attribut?idUser=&idComp=
POST   /api/tools/attribut

GET    /api/tools/integral?idUser=&idComp=
POST   /api/tools/integral

GET    /api/tools/activities?idUser=&idComp=
POST   /api/tools/activities
PUT    /api/tools/activities/:id

GET    /api/tools/bmc?idUser=&idComp=
POST   /api/tools/bmc

GET    /api/tools/matPrediaLabel
GET    /api/tools/matIntegLabel
```

---

### Dépendances clés

| Librairie | Usage |
|---|---|
| `primeng` v20 + `@primeuix/themes/aura` | Composants UI, thème Aura |
| `bootstrap` v5 + `bootstrap-icons` | Layout, grille, popovers Bootstrap natifs |
| `@swimlane/ngx-charts` | Graphiques dans `AttributComponent` |
| `ng2-charts` + `chart.js` | Graphiques bar/radar dans les dashboards |
| `frappe-gantt` | Diagramme de Gantt dans `T1cComponent` |
| `@photo-sphere-viewer/core` + `gyroscope-plugin` | Viewer 360° dans `InmotionComponent` |
| `@angular/fire` | Intégration Firebase (présente, usage à confirmer) |
