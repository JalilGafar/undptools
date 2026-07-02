# Design — Onglet "Tous les livrables" (dashboard manager)

## Contexte

Le dashboard manager (`man-home`) permet de naviguer vers les consultants, les entreprises, les statistiques globales et les outils du programme. Il manque une vue transversale permettant à un manager/moderator de consulter **tous les livrables de la plateforme**, tous consultants confondus, groupés par type.

L'existant (`ListLivrableComponent`, route `/manager/listLivrable/:id`) ne montre que les livrables d'**un** consultant précis, sans regroupement par type. Le nouveau workflow s'en inspire pour la navigation finale vers un livrable, mais ajoute deux niveaux de drill-down en amont : cards par type → tableau du type sélectionné → livrable individuel.

## Périmètre

Deux types de livrables sont concernés (ceux déjà unifiés par l'endpoint existant `/api/manager/livrables`, qui reposent sur une contrainte `UNIQUE (cons_id, comp_id)` — un seul enregistrement par entreprise) :

- **Diagnostic intégral** (`tool_code = t1d`, table `matrice_diag_integral_note`)
- **Prédiagnostic** (`tool_code = attribut`, table `mat_predia_crev_note`)

Gantt (`t1c`/`activity_tab`) et BMC (`t2d`/`bmc_data`) sont exclus : ces tables acceptent plusieurs enregistrements par (consultant, entreprise) et ne correspondent pas à la même notion de "livrable unique".

## Base de données

Migration déjà appliquée manuellement en base par l'utilisateur :

```sql
ALTER TABLE matrice_diag_integral_note
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE mat_predia_crev_note
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

La colonne `date` existante sert de date de création (jamais réécrite par les `ON DUPLICATE KEY UPDATE` de `/api/tools/attribut` et `/api/tools/integral`). `updated_at` sert de date de dernière modification.

## Backend (`BackUndp`)

Nouvel endpoint dans `app/routes/manager.routes.js`, monté sous `/api/manager` (déjà protégé par `verifyToken` au niveau de `app.js`, comme le reste des routes manager) :

```
GET /api/manager/all-livrables
```

Reprend le pattern UNION de la route `/livrables` existante, sans filtre `WHERE cons_id=`, avec ajout de `cons_id` et jointure sur `users` pour le nom du consultant :

```sql
SELECT livrable, tableur, tool_code, id_livrable, comp_id,
       entreprises.name AS company, Livrable.cons_id, users.username AS consultant,
       Livrable.date, Livrable.updated_at
FROM entreprises
JOIN (
    (SELECT 'Diagnostic intégral' AS livrable, 'matrice_diag_integral_note' AS tableur,
            't1d' AS tool_code, id_diag_integ_note AS id_livrable, comp_id, cons_id, date, updated_at
     FROM matrice_diag_integral_note)
    UNION
    (SELECT 'Prédiagnostic', 'mat_predia_crev_note', 'attribut', attr_id, comp_id, cons_id, date, updated_at
     FROM mat_predia_crev_note)
) Livrable ON entreprises.id = Livrable.comp_id
JOIN users ON users.id = Livrable.cons_id
ORDER BY Livrable.updated_at DESC;
```

Style de code à suivre : `express.Router()`, `sql-template-strings`, gestion d'erreur `console.log(err); res.sendStatus(500); return;` — identique aux routes existantes du fichier.

## Frontend (`undptools`)

### Modèle

Nouvelle interface dans `src/app/core/model/livrable-global.ts` (ne modifie pas `Livrable`, utilisé ailleurs par `ListLivrableComponent`) :

```typescript
export class LivrableGlobal {
    livrable!: string;
    tableur!: string;
    tool_code!: string;
    id_livrable!: number;
    comp_id!: number;
    company!: string;
    cons_id!: number;
    consultant!: string;
    date!: string;
    updated_at!: string;
}
```

### Service (`ManagerService`)

Nouvelle méthode suivant le pattern BehaviorSubject uniforme du service :

```typescript
private _allLivrables$ = new BehaviorSubject<LivrableGlobal[]>([]);
get allLivrables$(): Observable<LivrableGlobal[]> { return this._allLivrables$.asObservable(); }

getAllLivrables() {
  this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/all-livrables`)
    .pipe(tap(data => this._allLivrables$.next(data)))
    .subscribe();
}
```

### Mapping type → libellé/icône

Petite constante partagée (dans le nouveau composant cards, pas de sur-ingénierie d'un service dédié pour 2 entrées) :

```typescript
const LIVRABLE_TYPES = [
  { tool_code: 'attribut', label: 'Prédiagnostic', icon: 'bi-list-check' },
  { tool_code: 't1d', label: 'Diagnostic intégral', icon: 'bi-clipboard2-data' },
];
```

### Composants

1. **`man-home`** — ajout d'une card juste après la card "Entreprises" :

```html
<div class="col-12 col-sm-6 col-lg-3">
    <div class="nav-card" (click)="seeAllLivrables()">
        <i class="bi bi-folder2-open nav-icon"></i>
        <h5 class="nav-title">Tous les livrables</h5>
        <p class="nav-desc">Consulter l'ensemble des livrables de la plateforme, classés par type.</p>
        <span class="nav-arrow"><i class="bi bi-arrow-right-circle"></i></span>
    </div>
</div>
```

   `seeAllLivrables()` → `this.router.navigateByUrl('manager/all-livrables')`.

2. **`livrable-types` (nouveau)**, route `/manager/all-livrables` :
   - `ngOnInit` : `managerService.getAllLivrables()`, s'abonne à `allLivrables$`.
   - Calcule côté client le regroupement par `tool_code` (via `LIVRABLE_TYPES` × `filter`) et le compteur associé.
   - Affiche une card par type (réutilise le style `.nav-card` de `man-home.component.scss` — à extraire/dupliquer selon convention SCSS du projet) avec compteur : "Diagnostic intégral — 42 livrables".
   - Clic sur une card → `router.navigateByUrl('manager/all-livrables/' + tool_code)`.
   - État vide (aucun livrable) : message "Aucun livrable disponible" par type, cohérent avec `list-livrable.component.html`.

3. **`livrable-type-table` (nouveau)**, route `/manager/all-livrables/:type` :
   - `ngOnInit` : lit `route.params['type']`, appelle `managerService.getAllLivrables()`, filtre `allLivrables$` sur `tool_code === type`.
   - Tableau (`table table-hover`, cohérent avec `list-livrable.component.html`) : colonnes Entreprise, Consultant, Date de création (`date`), Date de dernière modification (`updated_at`), triées par `updated_at` desc (déjà trié côté backend).
   - Titre de page dynamique via le libellé du type (`LIVRABLE_TYPES`).
   - Clic sur une ligne → même pattern que `ListLivrableComponent.viewLivrable()` :
     ```typescript
     viewLivrable(item: LivrableGlobal) {
       this.storageService.setIdComp(item.comp_id);
       this.storageService.setIdConsultant(item.cons_id);
       this.router.navigateByUrl('consultant/tool/' + item.tool_code);
     }
     ```
   - État vide : "Aucun livrable disponible pour ce type".

### Routing

Ajout dans `src/app/manager/manager-routing.module.ts` :

```typescript
{ path: 'all-livrables', component: LivrableTypesComponent },
{ path: 'all-livrables/:type', component: LivrableTypeTableComponent },
```

Sous la garde `ManagerGuard` déjà appliquée à tout `/manager/**`.

## Erreurs / cas limites

- Type inconnu dans l'URL (`/manager/all-livrables/xyz`) → tableau vide avec message, pas de redirection (cohérent avec le reste de l'app qui ne valide pas les params de route).
- Consultant supprimé mais livrable orphelin : le `JOIN users` exclurait la ligne. Comportement accepté (pas de `LEFT JOIN`) — cohérent avec le `JOIN entreprises` déjà strict dans `/livrables`.

## Hors périmètre

- Pas de pagination, tri interactif, ou recherche/filtre texte dans le tableau (non demandé).
- Pas de vérification de rôle supplémentaire côté backend (`isModeratorOrAdmin`) — reste cohérent avec les autres routes `/api/manager/*` qui n'appliquent que `verifyToken`, la restriction d'accès étant gérée côté frontend par `ManagerGuard`.
- Gantt et BMC ne sont pas inclus (voir Périmètre).
