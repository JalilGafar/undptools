# Design — Rapport PDF Matrice Pré-diagnostic (AttributComponent)

**Date :** 2026-06-27
**Composant cible :** `undptools/src/app/consultant/components/tools/attribut/`

---

## Contexte

Le composant `AttributComponent` gère la saisie et la visualisation de la matrice de pré-diagnostic (19 critères pondérés) pour la sélection des entreprises dans le cadre du programme SDP-GYB-CMR (UNDP). L'utilisateur souhaite pouvoir télécharger un rapport PDF complet après enregistrement, destiné à être transmis par email.

---

## Objectif

Ajouter un bouton "Télécharger le rapport PDF" qui génère et télécharge automatiquement un fichier PDF structuré contenant toutes les informations de la matrice : données générales de l'entreprise, scores pondérés par critère avec visualisation colorée, et tableau détaillé des 19 attributs avec notes et commentaires.

---

## Contraintes

- `jspdf` v4.2.1 est déjà installé — aucune dépendance supplémentaire
- Le composant est standalone Angular 20
- Compatible SSR (`@angular/ssr`) — pas d'accès direct au DOM
- Le bouton n'est visible que lorsque des données existent en base (`data.length > 0`)
- Le logo utilisé : `src/assets/images/pnud.png` et `src/assets/images/gyb.png`

---

## Architecture

### Nouveau fichier : `AttribPdfService`

**Chemin :** `undptools/src/app/consultant/components/tools/attribut/attrib-pdf.service.ts`

Service Angular injectable (`providedIn: 'root'`) encapsulant toute la logique de génération PDF. Expose une seule méthode publique :

```typescript
generate(
  data: ToolAttrib,
  labels: PrediaLabel[],
  scores: { crit_1: number; crit_2: number; crit_3: number; crit_4: number; crit_5: number; eval_total: number }
): void
```

La méthode construit le document jsPDF et déclenche le téléchargement via `doc.save(filename)`.

### Modification : `AttributComponent`

- Inject `AttribPdfService`
- Ajouter méthode `downloadPdf()` qui appelle `pdfService.generate(matAttribData[0], matPrediaLabel, scores)`
- Ajouter le bouton dans le template, conditionnel sur `data.length > 0`

---

## Structure du PDF

### En-tête (toutes les pages)

| Élément | Détail |
|---|---|
| Logo | `pnud.png` — 30×30px, `gyb.png`— 30×30px, coin supérieur gauche |
| Titre | "MATRICE DE PRÉ-DIAGNOSTIC DE L'ENTREPRISES [Nom_de_l_entreprise_en_session] " — centré, gras |
| Date | Date de génération format `JJ/MM/AAAA` — coin supérieur droit |
| Ligne séparatrice | Ligne horizontale bleue UNDP sous l'en-tête |

### Section 1 — Informations générales

Tableau 2 colonnes listant les 15 champs du `generalForm` :

| Champ | Affiché si |
|---|---|
| Nom et prénom | toujours |
| Sexe | si renseigné |
| Âge | si renseigné |
| Téléphone | si renseigné |
| Email | si renseigné |
| Adresse | si renseigné |
| Ville | si renseigné |
| Nom de l'entreprise | si renseigné |
| Type d'entreprise | si renseigné |
| Activité principale | si renseigné (avec précision si "Autre") |
| Ventes mensuelles | si renseigné |
| Rôle dans l'entreprise | si renseigné |
| Situation entreprise | si renseigné |
| Intéressé formation | si renseigné |

### Section 2 — Scores pondérés

5 lignes, une par critère. Chaque ligne contient :
- Nom du critère (texte)
- Barre de progression : rectangle gris de fond + rectangle coloré proportionnel à la valeur `/10`
- Valeur affichée `X.X / 10`

**Seuils de couleur (appliqués aux critères individuels et au score total) :**
- Rouge `#dc3545` : valeur 0–2
- Orange `#fd7e14` : valeur 3–7
- Vert `#28a745` : valeur 8–10

La valeur de chaque critère est normalisée : `crit_N / 10` (les critères sont déjà sur une base 100, affichés `/10`).

### Encadré Score Total

Bloc mis en évidence avec fond coloré selon le seuil, affichant :
- "Score Total Pondéré : X.X / 10"
- Couleur de fond selon les mêmes seuils

### Section 3 — Tableau détaillé des 19 critères

Colonnes : **Critère | Attribut | Note | Commentaire**

Lignes regroupées par critère (cellule "Critère" fusionnée verticalement) :
- Ressources Opérationnelles : attributs 1–4
- Compétences Techniques : attributs 5–6
- Potentiel de l'Entreprise : attributs 7–9
- Marketing : attributs 10–12
- Stratégie du PNUD : attributs 13–19

La note est affichée `N/10`. Le commentaire est affiché en texte brut (tronqué si trop long).

### Pied de page (toutes les pages)

- Gauche : "SDP-GYB-CMR — UNDP"
- Centre : numéro de page (`Page X / Y`)
- Droite : date de génération

---

## Bouton de téléchargement

**Emplacement :** Dans la section résumé (`#collapseExample2`), après les cartes de scores et gauge, visible uniquement quand `data.length > 0`.

```html
<button type="button" class="btn btn-danger btn-sm" (click)="downloadPdf()">
  <i class="bi bi-file-earmark-pdf me-1"></i> Télécharger le rapport PDF
</button>
```

**Nom du fichier généré :** `rapport-prediagnostic-{nom_entreprise}-{date}.pdf`

---

## Gestion SSR

Le service utilise `jsPDF` côté client uniquement. L'import sera dynamique (`import('jspdf')`) ou protégé par `isPlatformBrowser` pour éviter les erreurs SSR.

---

## Données utilisées

Les données proviennent de `matAttribData[0]` (déjà chargé depuis le serveur), `matPrediaLabel` (labels parsés) et les propriétés calculées `crit_1`…`crit_5`, `eval_total` du composant — aucun appel HTTP supplémentaire n'est nécessaire.
