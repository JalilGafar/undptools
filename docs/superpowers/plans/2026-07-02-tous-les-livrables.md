# Tous les livrables (dashboard manager) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manager-facing view that lists every deliverable on the platform grouped by type (Diagnostic intégral / Prédiagnostic), drilling down from type cards to a per-type table to the individual deliverable.

**Architecture:** One new backend endpoint (`GET /api/manager/all-livrables`) unions the two existing deliverable tables across all consultants (no per-consultant filter) and joins `users` for the consultant name. Two new Angular standalone components consume it through a new `ManagerService.getAllLivrables()` BehaviorSubject: a cards view (`livrable-types`) and a filtered table view (`livrable-type-table`), wired into `manager-routing.module.ts` and linked from a new card on `man-home`.

**Tech Stack:** Node/Express + `sql-template-strings` + raw MySQL (`BackUndp`), Angular 20 standalone components + RxJS BehaviorSubjects (`undptools`).

## Global Constraints

- Spec source of truth: `docs/superpowers/specs/2026-07-02-tous-les-livrables-design.md` (already reviewed and approved).
- Scope is exactly two deliverable types: `t1d` (Diagnostic intégral, table `matrice_diag_integral_note`) and `attribut` (Prédiagnostic, table `mat_predia_crev_note`). Gantt (`t1c`) and BMC (`t2d`) are explicitly out of scope.
- The `updated_at` columns on both tables were already added manually by the user in the database — do not write a migration.
- New backend route must use the existing `express.Router()` + `sql-template-strings` + `console.log(err); res.sendStatus(500); return;` error-handling style already used in `manager.routes.js`. No additional role middleware (`isModeratorOrAdmin`) — matches existing `/api/manager/*` routes which rely only on the `verifyToken` mounted globally in `app.js`.
- New Angular model must NOT modify the existing `Livrable` class (`src/app/core/model/livrable.ts`), which is used by `ListLivrableComponent` and must stay untouched.
- All new components are standalone (`standalone: true`), matching every other component in this codebase.
- Reuse the existing `.nav-card` visual pattern (`man-home.component.scss`) for the type cards rather than inventing a new style.
- This repo has two independent git repos: `BackUndp` and `undptools`. Commit backend and frontend changes separately, in their own repo.
- `BackUndp` has no test runner configured (`npm test` → `"Error: no test specified" && exit 1`). Backend verification is manual (`curl`), not automated.
- `undptools` frontend tests use minimal Angular CLI boilerplate (`should create`) in this codebase — new component specs follow that same minimal convention, plus one focused unit test per piece of non-trivial logic added (grouping/filtering), consistent with how selectively this codebase tests things.

---

### Task 1: Backend — `GET /api/manager/all-livrables` endpoint

**Files:**
- Modify: `BackUndp/app/routes/manager.routes.js` (add route after the existing `/livrables` route, before the "Détail entreprise" section)

**Interfaces:**
- Produces: `GET /api/manager/all-livrables` → `200 [{ livrable: string, tableur: string, tool_code: string, id_livrable: number, comp_id: number, company: string, cons_id: number, consultant: string, date: string, updated_at: string }]`, protected by the `verifyToken` middleware already mounted on `/api/manager` in `app.js` (no body/query params).

- [ ] **Step 1: Add the route**

Open `BackUndp/app/routes/manager.routes.js` and insert this immediately after the closing `});` of the existing `router.get("/livrables", ...)` handler (i.e. right before the `// ── Détail entreprise ──...` comment block):

```javascript
// Get ALL livrables across every consultant, grouped by type, with consultant name
router.get("/all-livrables", (req, res) => {
    con.query(SQL
                `
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
                ) Livrable ON (entreprises.id = Livrable.comp_id)
                JOIN users ON (users.id = Livrable.cons_id)
                ORDER BY Livrable.updated_at DESC;
                `,
                function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        res.sendStatus(500);
                        return;
                    };
                    res.status(200).json(result);
                    return;
                }
            );
});
```

- [ ] **Step 2: Start the backend and verify the route is mounted and protected**

Run (from `BackUndp/`): `node server.js`
Then in a second terminal, with the server running:

```bash
curl -i http://localhost:8080/api/manager/all-livrables
```

Expected: `HTTP/1.1 403` (or `401`) — confirms the route exists and `verifyToken` is rejecting the unauthenticated request, matching every other `/api/manager/*` route. A `404` here means the route wasn't registered correctly — re-check Step 1's placement inside `manager.routes.js` (it must be before `module.exports = router;`).

- [ ] **Step 3: Verify the query returns real data with a valid token**

Log in through the running frontend (or via `curl -X POST http://localhost:8080/api/auth/signin -H "Content-Type: application/json" -d '{"username":"<a real manager/moderator username>","password":"<their password>"}'`) to obtain an `accessToken`, then:

```bash
curl -s http://localhost:8080/api/manager/all-livrables -H "Authorization: Bearer <accessToken>" | head -c 2000
```

Expected: a JSON array where every element has `tool_code` equal to either `t1d` or `attribut`, plus non-null `company` and `consultant` fields. If `consultant` is missing/null for rows that should have one, the `JOIN users` condition is wrong — verify `cons_id` really matches `users.id` for that row directly in the database.

- [ ] **Step 4: Commit**

```bash
cd BackUndp
git add app/routes/manager.routes.js
git commit -m "feat: add GET /api/manager/all-livrables endpoint for cross-consultant deliverable listing"
```

---

### Task 2: Frontend — `LivrableGlobal` model and shared type metadata

**Files:**
- Create: `undptools/src/app/core/model/livrable-global.ts`
- Create: `undptools/src/app/manager/livrable-types.ts`

**Interfaces:**
- Produces: `LivrableGlobal` class with fields `livrable, tableur, tool_code, id_livrable, comp_id, company, cons_id, consultant, date, updated_at` (all typed to match the backend JSON shape from Task 1).
- Produces: `LIVRABLE_TYPES: LivrableTypeMeta[]` constant, where `LivrableTypeMeta = { tool_code: string, label: string, icon: string }`, containing exactly two entries (`attribut` → "Prédiagnostic", `t1d` → "Diagnostic intégral").

- [ ] **Step 1: Create the model file**

Create `undptools/src/app/core/model/livrable-global.ts`:

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

- [ ] **Step 2: Create the shared type metadata file**

Create `undptools/src/app/manager/livrable-types.ts`:

```typescript
export interface LivrableTypeMeta {
    tool_code: string;
    label: string;
    icon: string;
}

export const LIVRABLE_TYPES: LivrableTypeMeta[] = [
    { tool_code: 'attribut', label: 'Prédiagnostic', icon: 'bi-list-check' },
    { tool_code: 't1d', label: 'Diagnostic intégral', icon: 'bi-clipboard2-data' },
];
```

- [ ] **Step 3: Verify it compiles**

Run: `cd undptools && npx tsc --noEmit -p tsconfig.app.json`
Expected: no new errors referencing `livrable-global.ts` or `livrable-types.ts`.

- [ ] **Step 4: Commit**

```bash
cd undptools
git add src/app/core/model/livrable-global.ts src/app/manager/livrable-types.ts
git commit -m "feat: add LivrableGlobal model and shared deliverable-type metadata"
```

---

### Task 3: Frontend — `ManagerService.getAllLivrables()`

**Files:**
- Modify: `undptools/src/app/manager/manager.service.ts`
- Test: `undptools/src/app/manager/manager.service.spec.ts` (create if it doesn't already exist)

**Interfaces:**
- Consumes: `LivrableGlobal` from `../core/model/livrable-global` (Task 2).
- Produces: `ManagerService.allLivrables$: Observable<LivrableGlobal[]>` and `ManagerService.getAllLivrables(): void` (fetches `GET /api/manager/all-livrables` and pushes the result into `allLivrables$`).

- [ ] **Step 1: Check whether `manager.service.spec.ts` exists**

Run: `ls undptools/src/app/manager/manager.service.spec.ts`

If it does not exist, create it with:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManagerService } from './manager.service';
import { LivrableGlobal } from '../core/model/livrable-global';
import { environment } from '../../environment/environment';

describe('ManagerService', () => {
  let service: ManagerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ManagerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

- [ ] **Step 2: Write the failing test for `getAllLivrables()`**

Add this `it` block inside the `describe('ManagerService', ...)` in `manager.service.spec.ts`:

```typescript
  it('getAllLivrables() should fetch and push into allLivrables$', () => {
    const mockData: LivrableGlobal[] = [
      { livrable: 'Prédiagnostic', tableur: 'mat_predia_crev_note', tool_code: 'attribut', id_livrable: 1, comp_id: 10, company: 'ACME', cons_id: 5, consultant: 'jdupont', date: '2026-01-01', updated_at: '2026-01-02' } as LivrableGlobal,
    ];

    let received: LivrableGlobal[] = [];
    service.allLivrables$.subscribe(data => received = data);

    service.getAllLivrables();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/manager/all-livrables`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);

    expect(received).toEqual(mockData);
  });
```

- [ ] **Step 3: Run the test suite and verify it fails**

Run: `cd undptools && npm test -- --include='**/manager.service.spec.ts'`
Expected: FAIL — `service.getAllLivrables is not a function` (or `allLivrables$` is undefined), since the service method doesn't exist yet.

- [ ] **Step 4: Implement `getAllLivrables()` in `ManagerService`**

In `undptools/src/app/manager/manager.service.ts`, add the import at the top (alongside the existing `Livrable` import):

```typescript
import { LivrableGlobal } from '../core/model/livrable-global';
```

Then add this BehaviorSubject and method inside the `ManagerService` class, right after the existing `getLivrableFromUserId` method (before the closing `}` of the class):

```typescript
  private _allLivrables$ = new BehaviorSubject<LivrableGlobal[]>([]);
  get allLivrables$(): Observable<LivrableGlobal[]> {
    return this._allLivrables$.asObservable()
  }

  //Tous les livrables de la plateforme, tous consultants confondus
  getAllLivrables() {
    this.http.get<LivrableGlobal[]>(`${environment.apiUrl}/api/manager/all-livrables`).pipe(
      tap(livrables => {
        this._allLivrables$.next(livrables);
      })
    ).subscribe();
  }
```

- [ ] **Step 5: Run the test suite and verify it passes**

Run: `cd undptools && npm test -- --include='**/manager.service.spec.ts'`
Expected: PASS — both `should be created` and `getAllLivrables() should fetch and push into allLivrables$`.

- [ ] **Step 6: Commit**

```bash
cd undptools
git add src/app/manager/manager.service.ts src/app/manager/manager.service.spec.ts
git commit -m "feat: add ManagerService.getAllLivrables() for cross-consultant deliverable listing"
```

---

### Task 4: Frontend — `LivrableTypesComponent` (cards by type)

**Files:**
- Create: `undptools/src/app/manager/components/livrable-types/livrable-types.component.ts`
- Create: `undptools/src/app/manager/components/livrable-types/livrable-types.component.html`
- Create: `undptools/src/app/manager/components/livrable-types/livrable-types.component.scss`
- Test: `undptools/src/app/manager/components/livrable-types/livrable-types.component.spec.ts`

**Interfaces:**
- Consumes: `ManagerService.allLivrables$` / `getAllLivrables()` (Task 3), `LIVRABLE_TYPES` (Task 2), `LivrableGlobal` (Task 2).
- Produces: `LivrableTypesComponent` with `countByType(livrables: LivrableGlobal[], toolCode: string): number` and `goToType(toolCode: string): void` (navigates to `manager/all-livrables/${toolCode}`). Consumed by routing in Task 6.

- [ ] **Step 1: Write the failing test**

Create `undptools/src/app/manager/components/livrable-types/livrable-types.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { LivrableTypesComponent } from './livrable-types.component';
import { ManagerService } from '../../manager.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';

describe('LivrableTypesComponent', () => {
  let component: LivrableTypesComponent;
  let fixture: ComponentFixture<LivrableTypesComponent>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLivrables: LivrableGlobal[] = [
    { tool_code: 'attribut', company: 'A', consultant: 'x', comp_id: 1, cons_id: 1, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 1 } as LivrableGlobal,
    { tool_code: 'attribut', company: 'B', consultant: 'y', comp_id: 2, cons_id: 2, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 2 } as LivrableGlobal,
    { tool_code: 't1d', company: 'C', consultant: 'z', comp_id: 3, cons_id: 3, date: '', updated_at: '', livrable: '', tableur: '', id_livrable: 3 } as LivrableGlobal,
  ];

  beforeEach(async () => {
    managerServiceSpy = jasmine.createSpyObj('ManagerService', ['getAllLivrables'], {
      allLivrables$: of(mockLivrables),
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LivrableTypesComponent],
      providers: [
        { provide: ManagerService, useValue: managerServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('countByType should count only matching tool_code entries', () => {
    expect(component.countByType(mockLivrables, 'attribut')).toBe(2);
    expect(component.countByType(mockLivrables, 't1d')).toBe(1);
    expect(component.countByType(mockLivrables, 'unknown')).toBe(0);
  });

  it('goToType should navigate to the per-type table route', () => {
    component.goToType('t1d');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('manager/all-livrables/t1d');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd undptools && npm test -- --include='**/livrable-types.component.spec.ts'`
Expected: FAIL — `Cannot find module './livrable-types.component'` (the component doesn't exist yet).

- [ ] **Step 3: Create the component**

Create `undptools/src/app/manager/components/livrable-types/livrable-types.component.ts`:

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES, LivrableTypeMeta } from '../../livrable-types';

@Component({
  selector: 'app-livrable-types',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './livrable-types.component.html',
  styleUrl: './livrable-types.component.scss',
})
export class LivrableTypesComponent implements OnInit {

  livrables$!: Observable<LivrableGlobal[]>;
  types: LivrableTypeMeta[] = LIVRABLE_TYPES;

  constructor(
    private managerService: ManagerService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.managerService.getAllLivrables();
    this.livrables$ = this.managerService.allLivrables$;
  }

  countByType(livrables: LivrableGlobal[], toolCode: string): number {
    return livrables.filter(l => l.tool_code === toolCode).length;
  }

  goToType(toolCode: string) {
    this.router.navigateByUrl('manager/all-livrables/' + toolCode);
  }
}
```

Create `undptools/src/app/manager/components/livrable-types/livrable-types.component.html`:

```html
<div class="container nav-grid-container">
    <h3>Tous les livrables</h3>

    @if (livrables$ | async; as data) {
        <div class="row gy-3 gx-3">
            @for (type of types; track type.tool_code) {
                <div class="col-12 col-sm-6 col-lg-4">
                    <div class="nav-card" (click)="goToType(type.tool_code)">
                        <i class="bi {{type.icon}} nav-icon"></i>
                        <h5 class="nav-title">{{type.label}}</h5>
                        <p class="nav-desc">{{countByType(data, type.tool_code)}} livrable(s)</p>
                        <span class="nav-arrow"><i class="bi bi-arrow-right-circle"></i></span>
                    </div>
                </div>
            }
        </div>
    }
</div>
```

Create `undptools/src/app/manager/components/livrable-types/livrable-types.component.scss`:

```scss
// Réutilise le pattern visuel .nav-card / .nav-icon / .nav-title / .nav-desc / .nav-arrow
// défini dans man-home.component.scss

.nav-grid-container {
    padding-top: clamp(1rem, 3vw, 2rem);
    padding-bottom: clamp(1rem, 3vw, 2rem);
}

.nav-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(1.25rem, 3vw, 1.75rem) 1rem;
    height: 100%;
    min-height: clamp(160px, 25vw, 200px);
    border: 1px solid #5c5c5c;
    border-radius: 12px;
    background: #ffffff;
    color: #006eb5;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        background-color: #006eb5;
        color: #ffffff;
        border-color: transparent;
        box-shadow: 0 6px 20px rgba(0, 110, 181, 0.35);

        .nav-arrow { opacity: 1; }
    }

    &:active {
        transform: scale(0.98);
    }
}

.nav-icon {
    font-size: clamp(1.8rem, 6vw, 2.8rem);
    margin-bottom: 0.6rem;
    display: block;
}

.nav-title {
    font-size: clamp(0.9rem, 2.5vw, 1rem);
    font-weight: 600;
    margin: 0 0 0.4rem;
}

.nav-desc {
    font-size: clamp(0.75rem, 2vw, 0.875rem);
    line-height: 1.4;
    margin: 0;
    opacity: 0.85;
}

.nav-arrow {
    position: absolute;
    bottom: 0.75rem;
    right: 0.75rem;
    font-size: 1rem;
    opacity: 0;
    transition: opacity 0.2s;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd undptools && npm test -- --include='**/livrable-types.component.spec.ts'`
Expected: PASS — all three specs (`should create`, `countByType ...`, `goToType ...`).

- [ ] **Step 5: Commit**

```bash
cd undptools
git add src/app/manager/components/livrable-types/
git commit -m "feat: add LivrableTypesComponent showing deliverable-type cards with counts"
```

---

### Task 5: Frontend — `LivrableTypeTableComponent` (table for a selected type)

**Files:**
- Create: `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.ts`
- Create: `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.html`
- Create: `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.scss`
- Test: `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.spec.ts`

**Interfaces:**
- Consumes: `ManagerService.allLivrables$` / `getAllLivrables()` (Task 3), `LIVRABLE_TYPES` (Task 2), `LivrableGlobal` (Task 2), `StorageService.setIdComp(id: number)` / `setIdConsultant(id: number)` (existing, `src/app/_services/storage.service.ts`).
- Produces: `LivrableTypeTableComponent` with `viewLivrable(item: LivrableGlobal): void` (mirrors `ListLivrableComponent.viewLivrable`). Consumed by routing in Task 6.

- [ ] **Step 1: Write the failing test**

Create `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { LivrableTypeTableComponent } from './livrable-type-table.component';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';

describe('LivrableTypeTableComponent', () => {
  let component: LivrableTypeTableComponent;
  let fixture: ComponentFixture<LivrableTypeTableComponent>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockLivrables: LivrableGlobal[] = [
    { tool_code: 'attribut', company: 'A', consultant: 'x', comp_id: 1, cons_id: 11, date: '2026-01-01', updated_at: '2026-01-02', livrable: 'Prédiagnostic', tableur: '', id_livrable: 1 } as LivrableGlobal,
    { tool_code: 't1d', company: 'B', consultant: 'y', comp_id: 2, cons_id: 22, date: '2026-01-03', updated_at: '2026-01-04', livrable: 'Diagnostic intégral', tableur: '', id_livrable: 2 } as LivrableGlobal,
  ];

  beforeEach(async () => {
    managerServiceSpy = jasmine.createSpyObj('ManagerService', ['getAllLivrables'], {
      allLivrables$: of(mockLivrables),
    });
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['setIdComp', 'setIdConsultant']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LivrableTypeTableComponent],
      providers: [
        { provide: ManagerService, useValue: managerServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ type: 'attribut' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LivrableTypeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter livrables$ to only the route type and set the label', (done) => {
    component.typeLabel;
    expect(component.typeLabel).toBe('Prédiagnostic');
    component.livrables$.subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].tool_code).toBe('attribut');
      done();
    });
  });

  it('viewLivrable should set storage IDs and navigate to the tool route', () => {
    component.viewLivrable(mockLivrables[1]);
    expect(storageServiceSpy.setIdComp).toHaveBeenCalledWith(2);
    expect(storageServiceSpy.setIdConsultant).toHaveBeenCalledWith(22);
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('consultant/tool/t1d');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd undptools && npm test -- --include='**/livrable-type-table.component.spec.ts'`
Expected: FAIL — `Cannot find module './livrable-type-table.component'`.

- [ ] **Step 3: Create the component**

Create `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.ts`:

```typescript
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagerService } from '../../manager.service';
import { StorageService } from '../../../_services/storage.service';
import { LivrableGlobal } from '../../../core/model/livrable-global';
import { LIVRABLE_TYPES } from '../../livrable-types';

@Component({
  selector: 'app-livrable-type-table',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './livrable-type-table.component.html',
  styleUrl: './livrable-type-table.component.scss',
})
export class LivrableTypeTableComponent implements OnInit {

  livrables$!: Observable<LivrableGlobal[]>;
  typeLabel = '';

  constructor(
    private managerService: ManagerService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    const toolCode = this.route.snapshot.paramMap.get('type') ?? '';
    this.typeLabel = LIVRABLE_TYPES.find(t => t.tool_code === toolCode)?.label ?? toolCode;

    this.managerService.getAllLivrables();
    this.livrables$ = this.managerService.allLivrables$.pipe(
      map(livrables => livrables.filter(l => l.tool_code === toolCode))
    );
  }

  viewLivrable(item: LivrableGlobal) {
    this.storageService.setIdComp(item.comp_id);
    this.storageService.setIdConsultant(item.cons_id);
    this.router.navigateByUrl('consultant/tool/' + item.tool_code);
  }
}
```

Create `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.html`:

```html
<div class="container">
    <h3>{{ typeLabel }}</h3>

    @if (livrables$ | async; as data) {
        @if (data.length) {
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">Entreprise</th>
                        <th scope="col">Consultant</th>
                        <th scope="col">Date de création</th>
                        <th scope="col">Date de dernière modification</th>
                    </tr>
                </thead>
                <tbody>
                    @for (item of data; track item.id_livrable) {
                        <tr (click)="viewLivrable(item)">
                            <td> {{item.company}} </td>
                            <td> {{item.consultant}} </td>
                            <td> {{item.date | date:'medium'}} </td>
                            <td> {{item.updated_at | date:'medium'}} </td>
                        </tr>
                    }
                </tbody>
            </table>
        } @else {
            <div class="empty">
                Aucun livrable disponible pour ce type
            </div>
        }
    }
</div>
```

Create `undptools/src/app/manager/components/livrable-type-table/livrable-type-table.component.scss`:

```scss
// Pas de style spécifique — hérite de .table / .table-hover Bootstrap,
// cohérent avec list-livrable.component.scss
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd undptools && npm test -- --include='**/livrable-type-table.component.spec.ts'`
Expected: PASS — all three specs.

- [ ] **Step 5: Commit**

```bash
cd undptools
git add src/app/manager/components/livrable-type-table/
git commit -m "feat: add LivrableTypeTableComponent listing deliverables for a selected type"
```

---

### Task 6: Frontend — wire routing and the `man-home` entry card

**Files:**
- Modify: `undptools/src/app/manager/manager-routing.module.ts`
- Modify: `undptools/src/app/manager/components/man-home/man-home.component.html`
- Modify: `undptools/src/app/manager/components/man-home/man-home.component.ts`

**Interfaces:**
- Consumes: `LivrableTypesComponent` (Task 4), `LivrableTypeTableComponent` (Task 5).

- [ ] **Step 1: Add the two routes**

In `undptools/src/app/manager/manager-routing.module.ts`, add the imports (alongside the existing component imports):

```typescript
import { LivrableTypesComponent } from './components/livrable-types/livrable-types.component';
import { LivrableTypeTableComponent } from './components/livrable-type-table/livrable-type-table.component';
```

Then add these two entries to the `routes` array, right after `{path: 'listLivrable/:id', component: ListLivrableComponent},`:

```typescript
  {path: 'all-livrables', component: LivrableTypesComponent},
  {path: 'all-livrables/:type', component: LivrableTypeTableComponent},
```

- [ ] **Step 2: Add the `man-home` card**

In `undptools/src/app/manager/components/man-home/man-home.component.html`, insert this block immediately after the closing `</div>` of the "Entreprises" card (i.e. right before the "Observation globale" card's opening `<div class="col-12 col-sm-6 col-lg-3">`):

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

- [ ] **Step 3: Add the `seeAllLivrables()` handler**

In `undptools/src/app/manager/components/man-home/man-home.component.ts`, add this method right after `seeCompanies()`:

```typescript
  seeAllLivrables(){
    this.router.navigateByUrl('manager/all-livrables');
  }
```

- [ ] **Step 4: Run the full frontend test suite**

Run: `cd undptools && npm test -- --watch=false`
Expected: PASS — no regressions in `man-home.component.spec.ts` or the manager routing-adjacent specs (the routing module itself has no spec file in this codebase, matching existing convention).

- [ ] **Step 5: Commit**

```bash
cd undptools
git add src/app/manager/manager-routing.module.ts src/app/manager/components/man-home/man-home.component.html src/app/manager/components/man-home/man-home.component.ts
git commit -m "feat: wire 'Tous les livrables' navigation from the manager dashboard"
```

---

### Task 7: End-to-end manual verification

**Files:** none (manual verification only, no code changes).

- [ ] **Step 1: Start both servers**

Terminal 1 (from `BackUndp/`): `node server.js`
Terminal 2 (from `undptools/`): `ng serve`

- [ ] **Step 2: Walk the full flow in the browser**

1. Open `http://localhost:4200`, log in as a user with role `ROLE_ADMIN` or `ROLE_MODERATOR`.
2. Land on `/manager` (or navigate there) — confirm the new "Tous les livrables" card appears right after "Entreprises", styled identically to the existing cards.
3. Click it — confirm navigation to `/manager/all-livrables` and that two cards appear ("Prédiagnostic" and "Diagnostic intégral"), each showing a livrable count.
4. Click the "Prédiagnostic" card — confirm navigation to `/manager/all-livrables/attribut` and a table with columns Entreprise / Consultant / Date de création / Date de dernière modification, populated with rows.
5. Click a row — confirm navigation to `/consultant/tool/attribut` and that the pré-diagnostic tool loads with that row's company data (i.e. `StorageService.CompanyId` / `ConsultantId` were set correctly).
6. Navigate back to `/manager/all-livrables`, click the "Diagnostic intégral" card, repeat steps 4–5 for `t1d` → `/consultant/tool/t1d`.
7. Confirm the empty-state message ("Aucun livrable disponible pour ce type") would show correctly by temporarily checking a type with zero rows if one exists, or by inspecting the template logic — otherwise note it as visually unverified.

Expected: every step above matches; no console errors in the browser dev tools during navigation.

- [ ] **Step 2: Report results**

If any step fails, use the systematic-debugging skill to investigate before touching code further — do not patch blindly.
