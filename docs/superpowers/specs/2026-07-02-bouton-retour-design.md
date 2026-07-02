# Design — Bouton retour cohérent sur les pages secondaires

## Contexte

`CompanyDetailComponent` (`src/app/manager/components/company-detail/`) et sept autres pages déjà correctement équipées (`EditCompanyComponent`, `ListConsultantComponent`, `GlobalComponent`, `TooltestComponent`, `ListCompanyComponent`, `ConsultantProfileComponent`, `RegisterComponent`) exposent un bouton "← Retour" qui appelle `history.back()`. La majorité des autres pages secondaires de l'application n'ont aucun mécanisme de retour, ou en ont un cassé.

## Audit complet

Toutes les routes de `app.routes.ts`, `consultant-routing.module.ts`, `manager-routing.module.ts` et `mintoul-routing.module.ts` ont été inspectées (composant + template) pour établir l'état actuel :

**Déjà correctement équipées (aucune action) :**
`EditCompanyComponent`, `ListConsultantComponent`, `GlobalComponent`, `TooltestComponent`, `ListCompanyComponent`, `CompanyDetailComponent`, `ConsultantProfileComponent`, `RegisterComponent`.

**Boutons cassés à corriger :**
- `AddCompanyComponent` (`src/app/consultant/components/add-company/`) — le template a déjà un bouton lié à `onGoBack()`, mais la méthode est un no-op vide (`onGoBack() { }`).
- `NewCompanyComponent` (`src/app/manager/components/new-company/`) — même défaut exact.

**Cas particulier — bouton trompeur :**
- `T1bComponent` (`src/app/consultant/components/tools/t1b/`) a un bouton libellé "Retour" qui ferme en réalité une modale Bootstrap (`data-bs-dismiss="modal"`), sans naviguer. Ce bouton reste tel quel (il ferme bien la modale, c'est son rôle) ; un second bouton, le vrai bouton retour de page, est ajouté en plus.

**Aucun mécanisme de retour — à ajouter (18 composants) :**

Module consultant :
- `EntreprisesComponent`, `DashbordComponent`, `DocumentaionComponent`, `InmotionComponent`, `EvaluationComponent`, `AttributComponent`, `T1cComponent`, `T1dComponent`, `T1eaComponent` (template actuellement vide), `T2dComponent`

Module manager :
- `OneConsultantComponent`, `ManDashbordComponent`, `ListLivrableComponent`, `LivrableTypesComponent`, `LivrableTypeTableComponent`

Racine de l'app :
- `ProfileComponent`, `SupervisorComponent`, `ProgramComponent`

**Explicitement hors périmètre :**
- Pages d'accueil : `HomeComponent`, `ManHomeComponent`, `ConsulHomeComponent`, `VisitorHomeComponent`, `HomeMintoulComponent`.
- `LoginComponent` — page d'entrée/auth, pas de "précédent" fiable vers lequel revenir.
- `OnconstructionComponent` — placeholder générique routé sur de nombreux chemins non implémentés ; pas une page réelle à traiter individuellement.

## Pattern standard

Repris tel quel du pattern déjà en place dans `CompanyDetailComponent` :

**TS** — méthode ajoutée à la classe du composant (nom `goBack`, pas `onGoBack`, pour uniformiser avec le pattern dominant) :

```typescript
goBack(): void {
  history.back();
}
```

**HTML** — bloc inséré comme premier élément visible de la page :

```html
<!-- Retour -->
<button class="btn btn-outline-secondary btn-sm mb-4" (click)="goBack()">
  ← Retour
</button>
```

**Correction des boutons cassés** (`AddCompanyComponent`, `NewCompanyComponent`) : remplacer le corps vide de `onGoBack()` par `history.back();` (on garde le nom de méthode existant `onGoBack()` dans ces deux fichiers spécifiquement, pour ne pas devoir aussi modifier le binding `(click)` du template — seul le corps de la méthode change).

**Insertion selon la structure du template :**
- Si le template commence déjà par un conteneur avec marge (`<div class="container ...">`, `<div class="container py-4">`, etc.), le bouton est inséré comme premier enfant de ce conteneur, exactement comme dans `CompanyDetailComponent`.
- Si le template commence par un élément plein-largeur sans marge (ex. `EntreprisesComponent` qui démarre par `<div class="ent-header">`), le bouton est enveloppé dans un conteneur dédié inséré avant le contenu existant :
  ```html
  <div class="container pt-3">
    <!-- Retour -->
    <button class="btn btn-outline-secondary btn-sm mb-2" (click)="goBack()">
      ← Retour
    </button>
  </div>
  ```
  (marge réduite à `mb-2` dans ce cas pour ne pas creuser un espace excessif avant un bandeau déjà espacé)
- Ce choix est vérifié fichier par fichier à l'implémentation — il n'est pas mécanique à 100 % vu l'hétérogénéité des templates existants.

**Cas `T1eaComponent`** : le template est actuellement vide (0 ligne) et la classe n'a aucune méthode. On y ajoute uniquement le bouton retour + `goBack()`, sans rien implémenter d'autre du composant (hors périmètre de ce chantier).

**Cas `T1bComponent`** : le bouton retour standard est ajouté en tête de page (pattern habituel), en plus du bouton "Retour" existant dans la modale de confirmation (qui reste un `data-bs-dismiss="modal"` inchangé).

## Hors périmètre

- Aucune modification du contenu fonctionnel des pages stubs (`DocumentaionComponent`, `InmotionComponent`, `EvaluationComponent`, `T1eaComponent`) au-delà de l'ajout du bouton retour.
- Pas de bouton "Suivant"/breadcrumb — uniquement le retour simple `history.back()`, cohérent avec l'existant.
- Pas de modification de `SidebarComponent` (composant mort, non utilisé dans aucun template — hors sujet).
- Pas de renommage de `onGoBack()` en `goBack()` dans `AddCompanyComponent`/`NewCompanyComponent` (seul le corps de la méthode est corrigé, pas son nom).
