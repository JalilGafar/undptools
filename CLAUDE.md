# CLAUDE.md — undptools

## Rôle de l'application

**undptools** est le frontend Angular de la plateforme UNDP de consultance d'entreprises. Les consultants y saisissent leurs diagnostics et suivent leurs entreprises. Les managers supervisent l'ensemble des livrables. Le backend API tourne séparément sur `http://localhost:8080` (`BackUndp`).

---

## Commandes

```bash
ng serve                                      # Dev server — http://localhost:4200
ng build                                      # Build de production
ng build --watch --configuration development  # Watch mode
ng test                                       # Tests Karma/Jasmine
ng test --include='**/t1c/**'                 # Tests d'un composant spécifique
node dist/undptools/server/server.mjs         # Servir le build SSR
```

---

## Stack technique

- **Angular 20** avec SSR (`@angular/ssr`) — version 1.2.0
- **Tous les composants sont standalone** (Angular 14+)
- Les modules (`ConsultantModule`, `ManagerModule`, `MintoulModule`) ne déclarent aucun composant — ils montent uniquement leur routing
- **PrimeNG 20** (thème Aura via `@primeuix/themes`)
- **Bootstrap 5** + `bootstrap-icons`
- **RxJS** sans NgRx — state géré via BehaviorSubjects dans les services

---

## Routing

### Racine (`src/app/app.routes.ts`)

| Route | Composant | Garde |
|---|---|---|
| `/login` | `LoginComponent` | — |
| `/register` | `RegisterComponent` | — |
| `/profile` | `ProfileComponent` | — |
| `/visitor` | `VisitorHomeComponent` | — |
| `/supervisor` | `SupervisorComponent` | — |
| `/program` | `ProgramComponent` | — |
| `/home` ou `` | `HomeComponent` | — |
| `/build` | `OnconstructionComponent` | — |
| `/consultant/**` | `ConsultantModule` (lazy) | `AuthGuard` |
| `/manager/**` | `ManagerModule` (lazy) | `AdminGuard` |
| `/mintoul/**` | `MintoulModule` (lazy) | — |

### Module Consultant (`src/app/consultant/consultant-routing.module.ts`)

| Route | Composant | Statut |
|---|---|---|
| `/consultant/` | `ConsulHomeComponent` | ✅ |
| `/consultant/companies` | `EntreprisesComponent` | ✅ |
| `/consultant/newcompany` | `AddCompanyComponent` | ✅ |
| `/consultant/dashbord/:id` | `DashbordComponent` | ✅ Point d'entrée des outils |
| `/consultant/documentation` | `DocumentaionComponent` | ✅ |
| `/consultant/tool/attribut` | `AttributComponent` | ✅ Pré-diagnostic 19 critères |
| `/consultant/tool/t1b` | `T1bComponent` | ✅ |
| `/consultant/tool/t1c` | `T1cComponent` | ✅ Gantt (frappe-gantt) |
| `/consultant/tool/t1d` | `T1dComponent` | ✅ Matrice intégrale 62 questions |
| `/consultant/tool/t1ea` | `T1eaComponent` | ✅ |
| `/consultant/tool/t2d` | `T2dComponent` | ✅ Business Model Canvas |
| `/consultant/tool/inmotion` | `InmotionComponent` | ✅ Viewer 360° |
| `/consultant/tool/evaluation` | `EvaluationComponent` | ✅ |
| `/consultant/tool/t1a` | `OnconstructionComponent` | 🚧 |
| `/consultant/tool/t1eb` | `OnconstructionComponent` | 🚧 |
| `/consultant/tool/t1f` à `t1l` | `OnconstructionComponent` | 🚧 |
| `/consultant/tool/t2a` à `t2c` | `OnconstructionComponent` | 🚧 |
| `/consultant/tool/t2e` à `t2g` | `OnconstructionComponent` | 🚧 |

> `T1fComponent` à `T2gComponent` existent dans `src/app/consultant/components/tools/` mais sont actuellement routés vers `OnconstructionComponent`.

### Module Manager (`src/app/manager/manager-routing.module.ts`)

| Route | Composant |
|---|---|
| `/manager/` ou `/manager/home` | `ManHomeComponent` |
| `/manager/manOneConsult/:id` | `OneConsultantComponent` — set `ConsultantId` |
| `/manager/dashbord` | `ManDashbordComponent` |
| `/manager/listconsult` | `ListConsultantComponent` |
| `/manager/listcompany/:id` | `ListCompanyComponent` |
| `/manager/newCompany` | `NewCompanyComponent` |
| `/manager/global` | `GlobalComponent` |
| `/manager/Tooltest` | `TooltestComponent` |
| `/manager/listLivrable/:id` | `ListLivrableComponent` |

---

## Authentification & Session

- JWT via header `x-access-token` (retourné par le backend au signin).
- `HttpRequestInterceptor` (`src/app/_helpers/http.interceptor.ts`) : ajoute `withCredentials: true` à toutes les requêtes.
- `AuthGuard` : vérifie `StorageService.isLoggedIn()` (sessionStorage).
- `AdminGuard` : vérifie le rôle `ROLE_ADMIN` dans l'objet user en session.

---

## Services principaux — NE PAS DUPLIQUER

### `ConsultantService` (`src/app/consultant/consultant.service.ts`)

Store central de l'application. Chaque domaine suit le même pattern BehaviorSubject :

```typescript
private _X$ = new BehaviorSubject<T[]>([]);
get X$(): Observable<T[]> { return this._X$.asObservable(); }
clearX() { this._X$.next([]); }

getXById(idUser: number, idComp: number) {
  this.http.get<T[]>(...).pipe(tap(data => this._X$.next(data))).subscribe();
}
```

Flux exposés :

| BehaviorSubject | Type | Méthodes |
|---|---|---|
| `_company$` | `Company[]` | `getCompanyFromServer()`, `getCompanyForConslFromServer(id)`, `getCompanyById(id)` |
| `_ToolAttribData$` | `ToolAttrib[]` | `getAttribDataById(idUser, idComp)`, `clearAttrib()`, `saveToolAttrib(form)` |
| `_ToolMatDiagIntegData$` | `ToolMatDiagInteg[]` | `getMatIntegDataById(idUser, idComp)`, `clearMatDiagInteg()`, `saveToolMatDiagInteg(form)` |
| `_ToolActivities$` | `GanttTask[]` | `getActivitiesById(idUser, idComp)`, `clearActivities()`, `saveActivities(form)`, `updateActivities(id, payload)` |
| `_MatPrediaLabel$` | `PrediaLabelJSON[]` | `getMatPrediaLabel()` |
| `_MatIntegLabel$` | `IntegLabel[]` | `getMatIntegLabel()` |
| `_BusinessModelCanvas$` | `BusinessModelCanvas\|null` | `getBusinessModelCanvasById(idUser, idComp)`, `clearBusinessModelCanvas()`, `saveBusinessModelCanvas(data)` |

Méthode utilitaire : `transformToMysqlJsonString(input: string)` — normalise une chaîne JSON pour stockage MySQL.

### `StorageService` (`src/app/_services/storage.service.ts`)

SSR-safe (`isPlatformBrowser` sur toutes les opérations `window`).

| Propriété / Méthode | Description |
|---|---|
| `CompanyId: number` | ID entreprise courante (en mémoire, perdu au refresh) |
| `ConsultantId: number` (défaut: 0) | 0 = consultant connecté, autre = consultant vu par un manager |
| `currentUser$: Observable<any>` | Flux réactif de l'utilisateur courant |
| `visibleTools$: Observable<boolean>` | Contrôle la visibilité de la sidebar des outils |
| `saveUser(user)` / `getUser()` / `isLoggedIn()` | Gestion session `sessionStorage` (clé: `auth-user`) |
| `setIdComp(id)` / `setIdConsultant(id)` | Setters des IDs runtime |
| `setVisibleToolsTrue()` / `setVisibleToolsFalse()` | Contrôle sidebar |
| `clean()` | Efface session + reset user$ |

### `ShareServiceService` (`src/app/shared/share-service.service.ts`)

| Flux | Description |
|---|---|
| `menuVisible$` | Visibilité du menu consultant |
| `manMenuVisible$` | Visibilité du menu manager |
| État loading global | — |

### `AuthService` (`src/app/_services/auth.service.ts`)

Appels HTTP : `signin`, `signup`, `signout`.

---

## Logique double identité consultant / manager

`StorageService.ConsultantId` vaut `0` quand un consultant consulte ses propres données. Un manager navigue vers `/manager/manOneConsult/:id`, ce qui set `ConsultantId` à l'ID du consultant ciblé.

**Tous les outils doivent appliquer ce pattern sans exception :**

```typescript
const id = this.storageService.ConsultantId === 0
  ? this.storageService.getUser().id
  : this.storageService.ConsultantId;
this.toolService.getXById(id, this.storageService.CompanyId);
```

---

## Sidebar des outils (`visibleTools$`)

`DashbordComponent` appelle `storageService.setVisibleToolsTrue()` dans `ngOnInit` via `setTimeout` (pour éviter `ExpressionChangedAfterChecked`). La sidebar n'est visible que dans le contexte d'une entreprise. Tout nouveau composant qui se substituerait au `DashbordComponent` doit reproduire ce comportement.

---

## Outils de diagnostic (`src/app/consultant/components/tools/`)

| Outil | Composant | Backend | Description |
|---|---|---|---|
| `attribut` | `AttributComponent` | POST/GET `/api/tools/attribut` | 19 critères pondérés → score sur 100, graphique ngx-charts. Pondération : crit_1×25 + crit_2×20 + crit_3×20 + crit_4×25 + crit_5×10 |
| `t1c` | `T1cComponent` | POST/GET `/api/tools/activities` + PUT `/:id`* | Gantt (frappe-gantt), drag pour modifier dates/progress |
| `t1d` | `T1dComponent` | POST/GET `/api/tools/integral` | 62 questions (note + commentaire `comt_N`) + SWOT |
| `t1ea` | `T1eaComponent` | — | — |
| `t1b` | `T1bComponent` | — | — |
| `t2d` | `T2dComponent` | POST/GET `/api/tools/bmc` | BMC 12 sections × 3 inputs → canvas imprimable |
| `inmotion` | `InmotionComponent` | — | Viewer 360° (`@photo-sphere-viewer`) |
| `evaluation` | `EvaluationComponent` | — | — |

*`PUT /api/tools/activities/:id` est appelé par `updateActivities()` dans le service mais **n'est pas encore implémenté côté backend** (`tools.routes.js`).

---

## Modèles (`src/app/core/model/`)

| Fichier | Interface/Classe | Description |
|---|---|---|
| `company.ts` | `Company` | Entité entreprise avec GPS (x, y) et métadonnées |
| `gantt-task.model.ts` | `GanttTask` | Tâche Gantt — dates `string` format `YYYY-MM-DD`, `id: string` |
| `updateGantt.ts` | `UpdateGanttTaskDto` | Payload partiel PUT activité (date ou progress) |
| `toolAttrib.ts` | `ToolAttrib` | 19 notes + 19 commentaires + cons_id + comp_id |
| `tool1D.ts` | `ToolMatDiagInteg` | 62 notes + SWOT + cons_id + comp_id |
| `businessModelCanvas.ts` | `BusinessModelCanvas` | 12 sections × 3 champs + métadonnées (id, cons_id, comp_id, date) |
| `prediaJSON.ts` | `PrediaLabelJSON` | Label brut du pré-diagnostic — `children` est un JSON sérialisé à parser |
| `predia_mat_label.ts` | `PrediaLabel` | Label parsé avec `children: Child[]` |
| `child.ts` | `Child` | `{label: string, plage: string}` |
| `mat_integ_label.ts` | `IntegLabel` | Label du diagnostic intégral |
| `activity.ts` | `Activity` | Modèle local d'affichage (non API) |
| `livrable.ts` | `Livrable` | Livrable vu par le manager (livrable, tableur, tool_code, id_livrable, comp_id, company, date) |
| `user.ts` | `User` | Utilisateur authentifié |
| `personnel-entreprise.ts` | `PersonnelEntreprise` | Personnel associé à une entreprise |

Ne pas recréer ces interfaces — les importer depuis `src/app/core/model/`.

---

## Parsing des labels pré-diagnostic

`PrediaLabelJSON.children` est une chaîne JSON sérialisée en base. `AttributComponent` utilise `parseChildren(obj: PrediaLabelJSON): PrediaLabel` pour la parser en `Child[]`. Reproduire ce pattern pour tout autre outil consommant `matrice_prediagnostic`.

---

## Pattern de composant outil — template à suivre

```typescript
@Component({ standalone: true, imports: [CommonModule, ReactiveFormsModule, ...] })
export class MonOutilComponent implements OnInit {

  ngOnInit(): void {
    const id = this.storageService.ConsultantId === 0
      ? this.storageService.getUser().id
      : this.storageService.ConsultantId;

    this.toolService.clearX();
    this.toolService.getXById(id, this.storageService.CompanyId);
    this.data$ = this.toolService.X$;
  }

  save() {
    this.toolService.saveX(this.form.value).subscribe();
    setTimeout(() => window.location.reload(), 2500); // pattern existant
  }
}
```

---

## Shared Module PrimeNG

`src/app/shared/primeng.module.ts` re-exporte les composants PrimeNG utilisés globalement. Importer ce module dans les feature modules plutôt que les composants PrimeNG individuellement.

---

## API Endpoints — mapping complet

Base URL : `environment.apiUrl` = `http://localhost:8080`

```
POST   /api/auth/signin
POST   /api/auth/signup
POST   /api/auth/signout

GET    /api/consultant/companies
GET    /api/consultant/companiesUser?idUser=
POST   /api/consultant/newCompany

GET    /api/manager/user
GET    /api/manager/livrables?idUser=
POST   /api/manager/newCompany

GET    /api/tools/attribut?idUser=&idComp=
POST   /api/tools/attribut

GET    /api/tools/integral?idUser=&idComp=
POST   /api/tools/integral

GET    /api/tools/matPrediaLabel
GET    /api/tools/matIntegLabel

GET    /api/tools/activities?idUser=&idComp=
POST   /api/tools/activities
PUT    /api/tools/activities/:id        ← NON IMPLÉMENTÉ côté backend

GET    /api/tools/bmc?idUser=&idComp=
POST   /api/tools/bmc
```

---

## Dépendances installées (ne pas réinstaller)

| Librairie | Usage |
|---|---|
| `primeng` v20 + `@primeuix/themes/aura` | Composants UI, thème Aura |
| `bootstrap` v5 + `bootstrap-icons` | Layout, grille, icônes |
| `@swimlane/ngx-charts` | Graphique score dans `AttributComponent` |
| `ng2-charts` v8 + `chart.js` v4 | Graphiques bar/radar dans les dashboards |
| `frappe-gantt` v1 | Diagramme Gantt dans `T1cComponent` |
| `@photo-sphere-viewer/core` v5 + `gyroscope-plugin` | Viewer 360° dans `InmotionComponent` |
| `marzipano` | Viewer 360° alternatif (présent, usage à confirmer) |
| `@angular/fire` v20 | Firebase (présent, usage à confirmer) |
| `d3-shape` v3 | Dépendance ngx-charts |

---

## Notes SSR

Le frontend utilise `@angular/ssr`. `StorageService` injecte `PLATFORM_ID` et protège tous les accès `window`/`sessionStorage` avec `isPlatformBrowser`. Reproduire ce pattern dans tout nouveau service accédant au DOM ou au stockage navigateur.
