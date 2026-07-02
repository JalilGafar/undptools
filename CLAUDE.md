# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rôle de l'application

**undptools** est le frontend Angular de la plateforme **SDP-GYB-CMR** (UNDP) de consultance d'entreprises PME/PMI au Cameroun. Les consultants saisissent leurs diagnostics et suivent leurs entreprises. Les managers supervisent l'ensemble des livrables et consultants. Le backend API Node.js tourne séparément (`BackUndp`).

- **Dev** : `http://localhost:8080` → `src/environment/environment.ts`
- **Prod** : `https://nodeapi.sdp-gyb-cmr.com` → `src/environment/environment.prod.ts`

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

- **Angular 20** (v20.3.0) avec SSR (`@angular/ssr ^20.3.1`) — version app 1.2.0
- **TypeScript 5.9.2** — strict mode activé
- **Tous les composants sont standalone** (Angular 14+)
- Les modules (`ConsultantModule`, `ManagerModule`, `MintoulModule`) ne déclarent aucun composant — ils montent uniquement leur routing
- **PrimeNG 20** (thème Aura via `@primeuix/themes/aura`)
- **Bootstrap 5.3.7** + `bootstrap-icons 1.13.1`
- **RxJS 7.8** sans NgRx — state géré via BehaviorSubjects dans les services
- **PWA** (`@angular/service-worker v20.3.0`) — `ngsw-config.json` + `manifest.webmanifest`
- **SCSS** (`inlineStyleLanguage: "scss"`)

### Mise à jour automatique (PWA / cache-busting)

`AppComponent` intègre `SwUpdate` pour détecter les nouvelles versions déployées et notifier l'utilisateur sans rechargement forcé :

```typescript
// AppComponent.ngOnInit()
if (this.swUpdate.isEnabled) {
  this.swUpdate.versionUpdates
    .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
    .subscribe(() => { this.updateAvailable = true; });
}
```

Quand `updateAvailable` passe à `true`, une bannière apparaît en bas de page. `applyUpdate()` appelle `swUpdate.activateUpdate()` puis recharge la page.

> **Côté serveur (obligatoire)** : `index.html`, `ngsw.json` et `ngsw-worker.js` doivent être servis avec `Cache-Control: no-cache`. Sans ça, le SW ne détecte jamais les nouvelles versions. Voir `.htaccess` à la racine du déploiement frontend.

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
| `/manager/**` | `ManagerModule` (lazy) | `ManagerGuard` |
| `/mintoul/**` | `MintoulModule` (lazy) | — |
| `**` | redirect `/` | — |

### Module Consultant (`src/app/consultant/consultant-routing.module.ts`)

| Route | Composant | Statut |
|---|---|---|
| `/consultant/` | `ConsulHomeComponent` | ✅ |
| `/consultant/companies` | `EntreprisesComponent` | ✅ |
| `/consultant/newcompany` | `AddCompanyComponent` | ✅ |
| `/consultant/edit-company/:id` | `EditCompanyComponent` | ✅ |
| `/consultant/dashbord/:id` | `DashbordComponent` | ✅ Point d'entrée des outils |
| `/consultant/documentation` | `DocumentaionComponent` | ✅ |
| `/consultant/tool/attribut` | `AttributComponent` | ✅ Pré-diagnostic 19 critères |
| `/consultant/tool/t1b` | `T1bComponent` | ✅ Compte-rendu de réunion |
| `/consultant/tool/t1c` | `T1cComponent` | ✅ Gantt (frappe-gantt) |
| `/consultant/tool/t1d` | `T1dComponent` | ✅ Matrice intégrale 62 questions + SWOT |
| `/consultant/tool/t1ea` | `T1eaComponent` | ✅ Diagnostic BPF |
| `/consultant/tool/t1eb` | `T1ebComponent` | ✅ Diagnostic BPA |
| `/consultant/tool/t2d` | `T2dComponent` | ✅ Business Model Canvas |
| `/consultant/tool/inmotion` | `InmotionComponent` | ✅ Viewer 360° |
| `/consultant/tool/evaluation` | `EvaluationComponent` | ✅ |
| `/consultant/tool/t1a` | `OnconstructionComponent` | 🚧 Rapport final étape 1 |
| `/consultant/tool/t1f` à `t1l` | `OnconstructionComponent` | 🚧 Composants existent |
| `/consultant/tool/t2a` à `t2c` | `OnconstructionComponent` | 🚧 Composants existent |
| `/consultant/tool/t2e` à `t2g` | `OnconstructionComponent` | 🚧 Composants existent |

> `T1fComponent` à `T2gComponent` existent dans `src/app/consultant/components/tools/` mais sont routés vers `OnconstructionComponent`. Ils sont à implémenter.

### Module Manager (`src/app/manager/manager-routing.module.ts`)

| Route | Composant | Description |
|---|---|---|
| `/manager/` ou `/manager/home` | `ManHomeComponent` | Dashboard manager |
| `/manager/manOneConsult/:id` | `OneConsultantComponent` | Détails consultant (set `ConsultantId`) |
| `/manager/dashbord` | `ManDashbordComponent` | Dashboard avec graphiques |
| `/manager/listconsult` | `ListConsultantComponent` | Liste tous les consultants |
| `/manager/listcompany/:id` | `ListCompanyComponent` | Entreprises d'un consultant |
| `/manager/newCompany` | `NewCompanyComponent` | Créer une entreprise |
| `/manager/global` | `GlobalComponent` | Analytics globaux |
| `/manager/Tooltest` | `TooltestComponent` | Test d'outils |
| `/manager/listLivrable/:id` | `ListLivrableComponent` | Livrables d'un consultant |
| `/manager/company/:id` | `CompanyDetailComponent` | Détail entreprise |
| `/manager/consultant-profile/:id` | `ConsultantProfileComponent` | Profil d'un consultant |

### Module Mintoul (`src/app/mintoul/mintoul-routing.module.ts`)

| Route | Composant |
|---|---|
| `/mintoul/` | `HomeMintoulComponent` |

---

## Authentification & Session

- JWT — token dans `user.accessToken` (stocké en sessionStorage, clé : `auth-user`)
- `HttpRequestInterceptor` (`src/app/_helpers/http.interceptor.ts`) : ajoute `Authorization: Bearer ${token}` **et** `withCredentials: true` à toutes les requêtes HTTP. Exporté comme `httpInterceptorProviders`.
- `AuthGuard` (`src/app/core/guard/auth.guard.ts`) : vérifie `StorageService.isLoggedIn()` → redirige vers `/login`.
- `ManagerGuard` (`src/app/core/guard/manager.guard.ts`) : garde de `/manager/**`, vérifie `roles.includes('ROLE_ADMIN' | 'ROLE_MODERATOR')` → redirige vers `/login`. Remplace `AdminGuard` (`src/app/core/guard/admin.guard.ts`, toujours présent mais plus utilisé dans `app.routes.ts`).

### `LoginComponent` (`src/app/auth/login/`)

- Flag `isLoading: boolean` — mis à `true` au début de `onSubmit()`, remis à `false` uniquement en cas d'erreur (en cas de succès, la navigation détruit le composant).
- Pendant le chargement : bouton désactivé avec `spinner-border` Bootstrap + texte "Connexion en cours…", inputs et bouton œil désactivés.
- Gestion d'erreur réseau : `err.error?.message ?? 'Une erreur est survenue.'` protège contre les erreurs sans body (timeout, serveur down).
- `isLoginFailed` est remis à `false` au début de chaque soumission pour éviter d'afficher une ancienne erreur pendant une nouvelle tentative.

---

## Services principaux — NE PAS DUPLIQUER

### `ConsultantService` (`src/app/consultant/consultant.service.ts`)

Store central de l'application. Pattern BehaviorSubject uniforme :

```typescript
private _X$ = new BehaviorSubject<T[]>([]);
get X$(): Observable<T[]> { return this._X$.asObservable(); }
clearX() { this._X$.next([]); }

getXById(idUser: number, idComp: number) {
  this.http.get<T[]>(...).pipe(tap(data => this._X$.next(data))).subscribe();
}
```

| BehaviorSubject | Type | Méthodes clés |
|---|---|---|
| `_company$` | `Company[]` | `getCompanyFromServer()`, `getCompanyForConslFromServer(id)`, `getCompanyById(id)` |
| `_ToolAttribData$` | `ToolAttrib[]` | `getAttribDataById(u,c)`, `clearAttrib()`, `saveToolAttrib(form)` |
| `_ToolMatDiagIntegData$` | `ToolMatDiagInteg[]` | `getMatIntegDataById(u,c)`, `clearMatDiagInteg()`, `saveToolMatDiagInteg(form)` |
| `_ToolActivities$` | `GanttTask[]` | `getActivitiesById(u,c)`, `clearActivities()`, `saveActivities(form)`, `updateActivities(id, dto)` |
| `_MatPrediaLabel$` | `PrediaLabelJSON[]` | `getMatPrediaLabel()` |
| `_MatIntegLabel$` | `IntegLabel[]` | `getMatIntegLabel()` |
| `_BusinessModelCanvas$` | `BusinessModelCanvas\|null` | `getBusinessModelCanvasById(u,c)`, `clearBusinessModelCanvas()`, `saveBusinessModelCanvas(data)` |

Méthode utilitaire : `transformToMysqlJsonString(input: string)` — normalise une chaîne JSON pour stockage MySQL.

### `StorageService` (`src/app/_services/storage.service.ts`)

SSR-safe (`isPlatformBrowser` sur tous les accès `window`/`sessionStorage`).

| Propriété / Méthode | Description |
|---|---|
| `CompanyId: number` | ID entreprise courante (en mémoire, perdu au refresh) |
| `ConsultantId: number` (défaut: `0`) | `0` = consultant connecté, `N` = consultant vu par un manager |
| `currentUser$: Observable<any>` | Flux réactif de l'utilisateur courant |
| `visibleTools$: Observable<boolean>` | Contrôle la visibilité de la sidebar des outils |
| `saveUser(user)` / `getUser()` / `isLoggedIn()` | Gestion session sessionStorage (clé: `auth-user`) |
| `setIdComp(id)` / `setIdConsultant(id)` | Setters des IDs runtime |
| `setVisibleToolsTrue()` / `setVisibleToolsFalse()` | Contrôle sidebar |
| `clean()` | Efface session + reset user$ |

### `ManagerService` (`src/app/manager/manager.service.ts`)

| Méthode | Endpoint | Description |
|---|---|---|
| `getUserFromServer()` | GET `/api/manager/user` | Liste tous les consultants |
| `getCompanyFromServer()` | GET `/api/consultant/companies` | Toutes les entreprises |
| `getCompanyFromConsultantId(id)` | GET `/api/consultant/companiesUser?idUser=id` | Entreprises d'un consultant |
| `getLivrableFromUserId(id)` | GET `/api/manager/livrables?idUser=id` | Livrables d'un consultant |
| `addCompany(data)` | POST `/api/manager/newCompany` | Créer entreprise |
| `getCompanyDetailById(id)` | GET `/api/manager/company/:id` | Détail entreprise |
| `updateCompany(id, data)` | PUT `/api/manager/company/:id` | Mettre à jour |
| `deleteCompany(id)` | DELETE `/api/manager/company/:id` | Supprimer |

### `ShareServiceService` (`src/app/shared/share-service.service.ts`)

| BehaviorSubject | Description |
|---|---|
| `menuVisible$` | Visibilité du menu consultant |
| `manMenuVisible$` | Visibilité du menu manager |
| `loading$` | État de chargement global |
| `showMenu()` / `hideMenu()` | Contrôle menu consultant |
| `showManMenu()` / `hideManMenu()` | Contrôle menu manager |
| `setLoadingStatus(bool)` | Contrôle loading |

### `AuthService` (`src/app/_services/auth.service.ts`)

Appels HTTP : `login()` → `/api/auth/signin`, `register()` → `/api/auth/signup`, `logout()` → `/api/auth/signout`.

### `GeolocationService` (`src/app/_services/geolocation.service.ts`)

SSR-safe. `getCurrentPosition()`, `isAvailable()`, `getPermissionState()`. Vérifie `isPlatformBrowser` avant d'accéder à `navigator`.

### `UserService` (`src/app/_services/user.service.ts`)

Legacy — `getPublicContent()`, `getUserBoard()`, `getModeratorBoard()`, `getAdminBoard()`. Peu utilisé.

### `TokenStorageService` (`src/app/_services/token-storage.service.ts`)

Legacy — remplacé par `StorageService`. Ne pas utiliser pour du nouveau code.

### `AttribPdfService` (`src/app/consultant/components/tools/attribut/attrib-pdf.service.ts`)

SSR-safe (`generate()` retourne immédiatement si `!isPlatformBrowser`). Génère le PDF du pré-diagnostic (`AttributComponent`) via `jsPDF` (import dynamique). Regroupe les 19 critères en 5 groupes pondérés (`FALLBACK_GROUPS`) et exporte les champs `gen_*` (`GENERAL_FIELDS`) + les scores. Pattern à réutiliser pour tout export PDF d'un autre outil.

---

## Logique double identité consultant / manager

`StorageService.ConsultantId` vaut `0` quand un consultant consulte ses propres données. Un manager navigue vers `/manager/manOneConsult/:id`, ce qui set `ConsultantId` à l'ID du consultant ciblé. `OneConsultantComponent` est le seul endroit où ce set est réalisé.

**Tous les outils doivent appliquer ce pattern sans exception :**

```typescript
const id = this.storageService.ConsultantId === 0
  ? this.storageService.getUser().id
  : this.storageService.ConsultantId;
this.toolService.clearX();
this.toolService.getXById(id, this.storageService.CompanyId);
```

---

## Sidebar des outils (`visibleTools$`)

`DashbordComponent` appelle `storageService.setVisibleToolsTrue()` dans `ngOnInit` via `setTimeout` (pour éviter `ExpressionChangedAfterChecked`). La sidebar n'est visible que dans le contexte d'une entreprise. Tout nouveau composant qui se substituerait au `DashbordComponent` doit reproduire ce comportement.

---

## Outils de diagnostic (`src/app/consultant/components/tools/`)

| Code | Composant | Endpoint backend | Description |
|---|---|---|---|
| `attribut` | `AttributComponent` | POST/GET `/api/tools/attribut` | Pré-diagnostic 19 critères pondérés → score /100, graphique ngx-charts. Pondération : crit_1×25 + crit_2×20 + crit_3×20 + crit_4×25 + crit_5×10 |
| `t1b` | `T1bComponent` | — | Compte-rendu de réunion |
| `t1c` | `T1cComponent` | POST/GET `/api/tools/activities` + PUT `/:id`* | Suivi d'activités Gantt (frappe-gantt), drag pour modifier dates/progress |
| `t1d` | `T1dComponent` | POST/GET `/api/tools/integral` | Diagnostic intégral 62 questions (note + commentaire `comt_N`) + SWOT + radar chart ngx-charts |
| `t1ea` | `T1eaComponent` | — | Diagnostic BPF |
| `t1eb` | `T1ebComponent` | — | Diagnostic BPA |
| `t1a` | `T1aComponent` | — | Rapport final étape 1 (🚧 en construction) |
| `t1f` | `T1fComponent` | — | Capacité de production (🚧) |
| `t1g` | `T1gComponent` | — | Cartographie clients (🚧) |
| `t1h` | `T1hComponent` | — | Photos de l'entreprise (🚧) |
| `t1i` | `T1iComponent` | — | Données initiales de référence (🚧) |
| `t1l` | `T1lComponent` | — | Profil d'information (🚧) |
| `t2a` | `T2aComponent` | — | Rapport final (🚧) |
| `t2b` | `T2bComponent` | — | Compte-rendu réunion étape 2 (🚧) |
| `t2c` | `T2cComponent` | — | Suivi activités étape 2 (🚧) |
| `t2d` | `T2dComponent` | POST/GET `/api/tools/bmc` | Business Model Canvas 12 sections × 3 inputs → canvas imprimable |
| `t2e` | `T2eComponent` | — | Plan d'amélioration matriciel (🚧) |
| `t2f` | `T2fComponent` | — | Désignation gestionnaire GYB (🚧) |
| `t2g` | `T2gComponent` | — | Demande de matériels (🚧) |
| `inmotion` | `InmotionComponent` | — | Viewer 360° panoramique (`@photo-sphere-viewer`) |
| `evaluation` | `EvaluationComponent` | — | Évaluation |

*`PUT /api/tools/activities/:id` est appelé par `updateActivities()` dans `ConsultantService` mais **n'est pas encore implémenté côté backend**.

---

## Modèles (`src/app/core/model/`)

Ne pas recréer ces interfaces — les importer depuis `src/app/core/model/`.

| Fichier | Classe/Interface | Champs clés |
|---|---|---|
| `company.ts` | `Company` | id, name, date_creation, produits, services, description, gerant, descrt_gerant, nbr_employer, nbr_femme, region, departement, ville, commune, quartier, lieu, **x** (GPS lng), **y** (GPS lat), idUser, logo |
| `user.ts` | `User` | id, username, name, email, tel |
| `toolAttrib.ts` | `ToolAttrib` | attr_id, cons_id, comp_id, date, **note_1→19**, **comment_1→19**, + 15 champs génériques entreprise (`gen_nom_prenom`, `gen_sexe`, `gen_age`, `gen_telephone`, `gen_adresse`, `gen_ville`, `gen_nom_entreprise`, `gen_type_entreprise`, `gen_email`, `gen_activite_principale`, `gen_activite_autre`, `gen_ventes_mensuelles`, `gen_role_entreprise`, `gen_situation_entreprise`, `gen_formation_interesse`) |
| `tool1D.ts` | `ToolMatDiagInteg` | id_diag_integ_note, cons_id, comp_id, date, **note_1→62**, **comt_1→62**, **difficult_1→3**, **force_1→3**, **faiblesse_1→3**, **besoin_1→3** (SWOT) |
| `gantt-task.model.ts` | `GanttTask` | id (string), name, details, start (`YYYY-MM-DD`), end (`YYYY-MM-DD`), progress, status, dependencies, close, responsable, comments, cons_id, comp_id |
| `updateGantt.ts` | `UpdateGanttTaskDto` | id, start?, end?, progress?, responsable?, status?, details?, comments?, close? |
| `businessModelCanvas.ts` | `BusinessModelCanvas` | id, cons_id, comp_id, date, createdAt, updatedAt, 12 sections × 3 champs : customerSegments/valuePropositions/channels/problemeIdentifie/but/mesureImpact/customerRelationships/revenueStreams/keyResources/keyActivities/keyPartnerships/costStructure (suffixe `_1` à `_3`) |
| `prediaJSON.ts` | `PrediaLabelJSON` | reper, question, critere, attribut, **children** (JSON sérialisé — string à parser) |
| `predia_mat_label.ts` | `PrediaLabel` | reper, critere, attribut, question, **children: Child[]** (parsé) |
| `child.ts` | `Child` | plage, label |
| `mat_integ_label.ts` | `IntegLabel` | id_diaginteg, reper, domaine, libele |
| `livrable.ts` | `Livrable` | id, livrable, tableur, tool_code, company, date, comp_id, cons_id |
| `activity.ts` | `Activity` | Modèle local d'affichage — miroir de `GanttTask`, non API |
| `personnel-entreprise.ts` | `PersonnelEntreprise` | nom_poste, nom_personne, temps_poste, activites, cons_id?, comp_id? |

---

## Parsing des labels pré-diagnostic

`PrediaLabelJSON.children` est une chaîne JSON sérialisée en base. `AttributComponent` utilise `parseChildren(obj: PrediaLabelJSON): PrediaLabel` pour la convertir en `Child[]`. Reproduire ce pattern pour tout outil consommant `matrice_prediagnostic`.

---

## Directive (`src/app/mintoul/`)

| Directive | Sélecteur | Usage |
|---|---|---|
| `PhotosphereViewerDirective` | `[photoSphereViewer]` | Initialise `Viewer` de `@photo-sphere-viewer/core` avec `GyroscopePlugin`. Utilisée dans `InmotionComponent` pour les photos panoramiques 360°. |

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

## Shared components (`src/app/shared/components/`)

| Composant | Description |
|---|---|
| `HeaderComponent` | Barre de navigation consultant |
| `ManHeaderComponent` | Barre de navigation manager |
| `SidebarComponent` | Sidebar outils consultant (contrôlée par `visibleTools$`) |
| `FooterComponent` | Pied de page |
| `ChartComponent` | Graphique réutilisable (ng2-charts) |
| `OnconstructionComponent` | Placeholder "en construction" |
| `ProgramComponent` | Informations programme |

---

## Shared Module PrimeNG

`src/app/shared/primeng.module.ts` re-exporte les composants PrimeNG utilisés globalement. Importer ce module dans les feature modules plutôt que les composants PrimeNG individuellement.

---

## API Endpoints — mapping complet

Base URL : `environment.apiUrl`

```
# Auth
POST   /api/auth/signin
POST   /api/auth/signup
POST   /api/auth/signout

# Consultant
GET    /api/consultant/companies
GET    /api/consultant/companiesUser?idUser=
POST   /api/consultant/newCompany

# Manager
GET    /api/manager/user
GET    /api/manager/livrables?idUser=
POST   /api/manager/newCompany
GET    /api/manager/company/:id
PUT    /api/manager/company/:id
DELETE /api/manager/company/:id

# Outils
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

| Librairie | Version | Usage |
|---|---|---|
| `primeng` + `@primeuix/themes/aura` | v20 | Composants UI, thème Aura |
| `bootstrap` + `bootstrap-icons` | v5.3.7 / v1.13.1 | Layout, grille, icônes |
| `@swimlane/ngx-charts` | v23.0.1 | Graphique score `AttributComponent`, radar `T1dComponent` |
| `ng2-charts` + `chart.js` | v8 / v4.5.0 | Graphiques dashboards manager |
| `frappe-gantt` | v1.0.4 | Diagramme Gantt `T1cComponent` |
| `jspdf` | v4.2.1 | Export PDF (`AttribPdfService`), import dynamique côté navigateur uniquement |
| `html2canvas` | v1.4.1 | Rendu HTML→canvas pour export PDF/image |
| `@angular/cdk` | v21.2.12 | Utilitaires CDK (overlay, a11y…) sous-jacents à PrimeNG |
| `@photo-sphere-viewer/core` + `gyroscope-plugin` | v5.14.1 | Viewer 360° `InmotionComponent` |
| `d3-shape` | v3.2.0 | Dépendance transitive ngx-charts |
| `marzipano` | v0.10.2 | Viewer 360° alternatif (présent, usage à confirmer) |
| `three` | v0.77.1 | 3D (présent, usage à confirmer) |
| `@angular/fire` | v20.0.1 | Firebase (présent, usage à confirmer) |
| `@angular/ssr` | v20.3.1 | Server-Side Rendering |
| `@angular/service-worker` | v20.3.0 | PWA |
| `sharp` | v0.34.5 | Traitement images icônes PWA |

---

## Assets (`src/assets/images/`)

- **Logos** : `logo.png`, `logo2.png`, `logo4.jpg`, `pnud.png`, `sdp1.png`, `sdpgyb.png`, `gyb.png`, `partner.png`, `syb.png`
- **SDGs** : `sdg.png`, `sdg.webp`, `sdgo.png`
- **Équipe/personnes** : `Armelle.jpg`, `Jalil.jpg`, `ke.jpg`, `lord.jpg`, `lord2.jpg`
- **Photos entreprises/outils** : `inmotion.png`, `inmotiontaf.png`, `inmo.png`, `digitinmo.png`, `financier.png`, `custom.png`, `company.jpg`, `pme.jpeg`, `pme.png`
- **Consultants/relations** : `consultants.png`, `relations*.png` (relation2 à relation7)
- **Photo profil** : `item.username + '.jpg'` — convention de nommage pour les avatars consultants (ex: `Jalil.jpg`)

> Convention avatar : `src/assets/images/{{username}}.jpg`. Le username doit correspondre à un fichier existant.

---

## Notes SSR

Le frontend utilise `@angular/ssr`. Tout accès à `window`, `sessionStorage`, `navigator`, ou `document` doit être protégé par `isPlatformBrowser(platformId)`. Voir `StorageService` et `GeolocationService` comme références.

```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

someMethod() {
  if (!isPlatformBrowser(this.platformId)) return;
  // accès navigateur ici
}
```

---

## Déploiement frontend (`sdp-gyb-cmr.com`)

Le frontend Angular est servi séparément de l'API (l'API tourne sur `nodeapi.sdp-gyb-cmr.com`). Le `.htaccess` à la racine du déploiement doit contenir :

```apache
# Forcer HTTPS
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Ne jamais cacher les fichiers critiques du Service Worker
<FilesMatch "(index\.html|ngsw\.json|ngsw-worker\.js)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>

# Laisser Angular gérer le routing côté client
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ /index.html [L]
```

> `mod_headers` doit être activé sur le serveur Apache. Les fichiers JS/CSS avec hash de contenu (`main.abc123.js`) peuvent eux être cachés longtemps — Angular le gère automatiquement via `outputHashing: "all"` dans `angular.json`.

---

## Pièges connus

| Problème | Solution |
|---|---|
| `ExpressionChangedAfterChecked` sur `visibleTools$` | Toujours utiliser `setTimeout(() => setVisibleToolsTrue())` |
| BehaviorSubject stale | Appeler `clearX()` avant `getXById()` dans chaque `ngOnInit` |
| Données outil vides après navigation manager | Vérifier que `ConsultantId` est bien set avant chargement |
| `PUT /api/tools/activities/:id` | Non implémenté backend — ne pas appeler `updateActivities()` en production |
| `PrediaLabelJSON.children` est une string | Parser avec `JSON.parse()` avant usage — voir `parseChildren()` dans `AttributComponent` |
| Composant non-standalone dans un module lazy | Tous les composants sont standalone : lister les imports explicitement |
| Avatar manquant | L'image `assets/images/{{username}}.jpg` doit exister pour chaque consultant |
