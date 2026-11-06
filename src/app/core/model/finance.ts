/**
 * Outil « Analyse financière » (3H) : postes de saisie, calcul du compte de résultat et formes échangées avec GET /api/finance.
 * Montants saisis et stockés en FCFA (entiers), 12 montants mensuels par poste.
 */

export type SectionKey = 'ventes' | 'autres_revenus' | 'materiaux' | 'main_oeuvre' | 'frais_vente' | 'frais_admin' | 'financier';
export type TabKey = 'donnees' | 'ventes' | 'couts' | 'frais' | 'financier' | 'resultat';

export const MONTH_LABELS = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

/** Un poste prédéfini ; `renamable` : le consultant peut le renommer (ex. « Produit / Service 1 ») */
export interface LineDef { code: string; label: string; renamable?: boolean; /** Bulle d'information « i » à côté du poste */ tip?: string; }

export interface SectionDef {
  key: SectionKey;
  title: string;
  /** Bulle d'information « i » à côté du titre de la section */
  tip?: string;
  /** Texte d'exemple du champ « nom » d'une ligne ajoutée par le consultant */
  newLinePlaceholder?: string;
  /** Saisie mois par mois dès l'ouverture (ventes : elles varient d'un mois à l'autre) ; sinon un seul montant mensuel suffit au départ */
  monthly?: boolean;
  lines: LineDef[];
  /** Nombre de lignes libres proposées en plus (le consultant peut en ajouter d'autres) */
  freeLines: number;
}

/** Une ligne saisie : montants mensuels (null = vide), nom libre pour les postes ajoutés ou renommés */
export interface FinanceLine {
  section: SectionKey;
  code: string | null;
  libelle: string | null;
  m: (number | null)[];
}

export interface FinanceApiLine { section: SectionKey; code: string | null; libelle: string | null; m: number[]; }

export interface FinanceResponse {
  data: { annee: number | null; taux_impot: number | null; updated_at: string } | null;
  lignes: FinanceApiLine[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
  fx: { year: number; xafPerUsd: number };
}

const named = (prefix: string, labels: string[]): LineDef[] => labels.map((label, i) => ({ code: `${prefix}_${i + 1}`, label }));

export const SECTIONS: Record<SectionKey, SectionDef> = {
  ventes: {
    key: 'ventes', title: 'Ventes de produits / services', freeLines: 0, monthly: true,
    tip: "Saisissez chaque type de vente ou de recette. Une ligne suffit pour commencer : donnez-lui le nom réel du produit ou du service, puis ajoutez une ligne par produit ou service.",
    newLinePlaceholder: 'Nom du produit ou du service',
    lines: [{ code: 'vente_1', label: 'Produit / Service', renamable: true }]
  },
  autres_revenus: {
    key: 'autres_revenus', title: 'Autres revenus', freeLines: 0,
    tip: "Recettes qui ne viennent pas de l'activité principale : loyers perçus, dons, subventions.",
    lines: [
      { code: 'rev_locatifs', label: 'Revenus locatifs' },
      { code: 'rev_dons', label: 'Dons / Subventions' },
      { code: 'rev_autres', label: 'Autres recettes' },
    ]
  },
  materiaux: {
    key: 'materiaux', title: 'Matériaux et matières premières', freeLines: 0,
    newLinePlaceholder: 'Nom du matériel ou de la fourniture',
    tip: "Uniquement ce que vous avez UTILISÉ pour produire ce que vous avez vendu ce mois-ci, pas tout ce que vous avez acheté. Si vous avez acheté 100 kg de farine et en avez utilisé 60, comptez 60 kg ; le reste est du stock, pas une dépense. Sans registre de stock : (stock de début + achats du mois) − stock de fin. Exemple : 200 000 + 500 000 − 150 000 = 550 000 FCFA.",
    lines: [
      { code: 'mat_1', label: 'Matériel / Fournitures', renamable: true },
      { code: 'mat_emballages', label: 'Emballages et conteneurs', tip: "Sachets, bouteilles, cartons… utilisés pour les produits vendus." },
      { code: 'mat_autres', label: 'Autres matériaux' },
    ]
  },
  main_oeuvre: {
    key: 'main_oeuvre', title: "Main-d'œuvre directe", freeLines: 0,
    tip: "Salaires du personnel qui travaille directement à la production. Les salaires administratifs vont dans « Frais d'exploitation ». Un employé qui produit ET vend : répartissez son salaire (70 % de son temps en production = 70 % ici, 30 % en frais de vente). Une estimation raisonnable suffit.",
    lines: [
      { code: 'mo_salaires', label: 'Salaires liés à la production', tip: "Salaires du personnel de production. Si une personne produit et vend, ne comptez ici que la part de son temps passée à produire." },
      { code: 'mo_heures_sup', label: 'Heures supplémentaires' },
      { code: 'mo_avantages', label: 'Avantages sociaux / Avantages accessoires' },
      { code: 'mo_transport', label: 'Transport du personnel' },
      { code: 'mo_indemnites', label: 'Indemnités journalières' },
      { code: 'mo_primes', label: 'Primes' },
      { code: 'mo_autres', label: 'Autres coûts salariaux' },
    ]
  },
  frais_vente: {
    key: 'frais_vente', title: 'Frais de vente', freeLines: 0,
    tip: "Tout ce qui sert à trouver des clients et à vendre : salaires des commerciaux, commissions, publicité, déplacements liés à la vente, supports marketing.",
    lines: [
      { code: 'fv_salaires', label: 'Salaires des commerciaux' },
      { code: 'fv_commissions', label: 'Commissions sur les ventes' },
      { code: 'fv_publicite', label: 'Publicité et marketing' },
      { code: 'fv_deplacement', label: 'Frais de déplacement et de représentation' },
      { code: 'fv_transport', label: 'Frais de transport (ventes)' },
      { code: 'fv_supports', label: 'Supports de vente' },
      { code: 'fv_communications', label: 'Communications (ventes)' },
      { code: 'fv_autres', label: 'Autres frais de vente' },
    ]
  },
  frais_admin: {
    key: 'frais_admin', title: 'Frais administratifs', freeLines: 0,
    tip: "Les dépenses qui font fonctionner l'entreprise : loyer, eau, électricité, Internet, salaires administratifs, comptabilité, taxes locales, nettoyage…",
    lines: [
      { code: 'adm_salaires', label: 'Salaires administratifs', tip: "Si le propriétaire travaille dans l'entreprise, comptez sa rémunération ici (ou en frais de vente selon sa fonction). Sans elle, le bénéfice paraît artificiellement élevé et ne reflète pas le vrai coût de fonctionnement." },
      { code: 'adm_loyer', label: 'Loyer des locaux' },
      { code: 'adm_eau', label: 'Eau' },
      { code: 'adm_electricite', label: 'Électricité' },
      { code: 'adm_internet', label: 'Internet et téléphone' },
      { code: 'adm_nettoyage', label: 'Nettoyage et lutte contre les nuisibles' },
      { code: 'adm_securite', label: 'Sécurité et surveillance' },
      { code: 'adm_entretien', label: 'Entretien des locaux' },
      { code: 'adm_assurance', label: 'Assurance' },
      { code: 'adm_taxes', label: 'Taxes locales' },
      { code: 'adm_comptables', label: 'Services comptables' },
      { code: 'adm_juridiques', label: 'Services professionnels / juridiques' },
      { code: 'adm_fournitures', label: 'Fournitures de bureau' },
      { code: 'adm_carburant', label: 'Essence / Carburant' },
      { code: 'adm_amort_materiel', label: 'Amortissement du matériel', tip: "Coût du bien ÷ durée de vie en années ÷ 12 = montant mensuel. Exemple : 12 000 000 FCFA sur 5 ans = 200 000 FCFA par mois." },
      { code: 'adm_amort_vehicules', label: 'Amortissement des véhicules', tip: "Coût du bien ÷ durée de vie en années ÷ 12 = montant mensuel. Exemple : 12 000 000 FCFA sur 5 ans = 200 000 FCFA par mois." },
      { code: 'adm_amort_installations', label: 'Amortissement des installations', tip: "Coût du bien ÷ durée de vie en années ÷ 12 = montant mensuel. Exemple : 12 000 000 FCFA sur 5 ans = 200 000 FCFA par mois." },
      { code: 'adm_abonnements', label: 'Abonnements et licences' },
      { code: 'adm_autres', label: 'Autres frais administratifs' },
    ]
  },
  financier: {
    key: 'financier', title: 'Intérêts et charges financières', freeLines: 0,
    tip: "Uniquement les intérêts et les frais payés pour un financement obtenu (prêt bancaire, carte de crédit…). N'incluez pas les remboursements du capital emprunté.",
    lines: [
      { code: 'fin_emprunts', label: 'Intérêts sur les emprunts bancaires', tip: "Seulement la part « intérêts » de chaque échéance, pas le capital remboursé." },
      { code: 'fin_auto', label: 'Intérêts sur les crédits automobiles' },
      { code: 'fin_cartes', label: 'Intérêts sur cartes de crédit' },
      { code: 'fin_affacturage', label: 'Affacturage / Escompte de documents' },
      { code: 'fin_bancaires', label: 'Frais bancaires' },
      { code: 'fin_autres', label: 'Autres frais financiers' },
    ]
  },
};

export const SECTION_ORDER: SectionKey[] = ['ventes', 'autres_revenus', 'materiaux', 'main_oeuvre', 'frais_vente', 'frais_admin', 'financier'];

/** Sections affichées dans chaque onglet de saisie */
export const TAB_SECTIONS: Record<Exclude<TabKey, 'donnees' | 'resultat'>, SectionKey[]> = {
  ventes: ['ventes', 'autres_revenus'],
  couts: ['materiaux', 'main_oeuvre'],
  frais: ['frais_vente', 'frais_admin'],
  financier: ['financier'],
};

/** Lignes de départ d'une section : les postes prédéfinis, puis quelques lignes libres */
export function emptyLines(section: SectionKey): FinanceLine[] {
  const def = SECTIONS[section];
  const blank = (): (number | null)[] => Array(12).fill(null);
  return [
    ...def.lines.map(l => ({ section, code: l.code, libelle: null, m: blank() })),
    ...Array.from({ length: def.freeLines }, () => ({ section, code: null, libelle: null, m: blank() })),
  ];
}

/** Reconstruit les lignes affichées à partir des lignes enregistrées (postes retrouvés par leur code, autres ajoutés à la suite) */
export function mergeSaved(section: SectionKey, saved: FinanceApiLine[]): FinanceLine[] {
  const lines = emptyLines(section).filter(l => l.code !== null);   // les lignes libres vides sont recréées ci-dessous
  const mine = saved.filter(l => l.section === section);
  const custom: FinanceLine[] = [];
  mine.forEach(s => {
    const target = s.code ? lines.find(l => l.code === s.code) : undefined;
    const filled = { section, code: s.code, libelle: s.libelle, m: s.m.map(v => (v === 0 ? null : v)) };
    if (target) { target.libelle = filled.libelle; target.m = filled.m; } else custom.push(filled);
  });
  const freeNeeded = Math.max(0, SECTIONS[section].freeLines - custom.length);
  const free = Array.from({ length: freeNeeded }, () => ({ section, code: null, libelle: null, m: Array(12).fill(null) as (number | null)[] }));
  return [...lines, ...custom, ...free];
}

// ── Calcul du compte de résultat ─────────────────────────────────────────────

/** 12 mois + le total annuel en dernière position (index 12) */
export type Series = number[];

export interface FinanceResult {
  ca: Series;
  materiaux: Series;
  mainOeuvre: Series;
  coutsDirects: Series;
  margeBrute: Series;
  autresRevenus: Series;
  fraisVente: Series;
  fraisAdmin: Series;
  charges: Series;
  resultatExploitation: Series;
  financier: Series;
  resultatAvantImpots: Series;
  impot: Series;
  resultatNet: Series;
  margeBrutePct: (number | null)[];
  margeNettePct: (number | null)[];
}

/** Montants mensuels d'un ensemble de lignes + total annuel en dernière position */
export const monthTotals = (lines: FinanceLine[]): Series => {
  const out = Array(12).fill(0) as number[];
  lines.forEach(l => l.m.forEach((v, k) => { out[k] += Number(v) || 0; }));
  return [...out, out.reduce((a, b) => a + b, 0)];
};

const combine = (a: Series, b: Series, sign: 1 | -1 = 1): Series => a.map((v, i) => v + sign * b[i]);

/**
 * Compte de résultat comme la feuille Excel :
 *  marge brute = ventes − coûts directs ; résultat d'exploitation = marge brute − (frais de vente + frais administratifs) ;
 *  résultat avant impôts = résultat d'exploitation − charges financières + autres revenus ;
 *  résultat net = résultat avant impôts − impôt (taux appliqué aux mois bénéficiaires, jamais d'impôt sur une perte).
 */
export function computeFinance(lines: Record<SectionKey, FinanceLine[]>, tauxImpotPct: number | null): FinanceResult {
  const ca = monthTotals(lines.ventes);
  const materiaux = monthTotals(lines.materiaux);
  const mainOeuvre = monthTotals(lines.main_oeuvre);
  const coutsDirects = combine(materiaux, mainOeuvre);
  const margeBrute = combine(ca, coutsDirects, -1);
  const autresRevenus = monthTotals(lines.autres_revenus);
  const fraisVente = monthTotals(lines.frais_vente);
  const fraisAdmin = monthTotals(lines.frais_admin);
  const charges = combine(fraisVente, fraisAdmin);
  const resultatExploitation = combine(margeBrute, charges, -1);
  const financier = monthTotals(lines.financier);
  const resultatAvantImpots = combine(combine(resultatExploitation, financier, -1), autresRevenus);

  const rate = (tauxImpotPct ?? 0) / 100;
  const impotMois = resultatAvantImpots.slice(0, 12).map(v => Math.round(Math.max(0, v) * rate));
  const impot = [...impotMois, impotMois.reduce((a, b) => a + b, 0)];
  const resultatNet = combine(resultatAvantImpots, impot, -1);

  const pct = (num: Series): (number | null)[] => num.map((v, i) => (ca[i] ? v / ca[i] * 100 : null));
  return {
    ca, materiaux, mainOeuvre, coutsDirects, margeBrute, autresRevenus, fraisVente, fraisAdmin, charges,
    resultatExploitation, financier, resultatAvantImpots, impot, resultatNet,
    margeBrutePct: pct(margeBrute), margeNettePct: pct(resultatNet)
  };
}
