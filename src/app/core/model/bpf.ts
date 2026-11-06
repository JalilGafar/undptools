/** Outil 1E_a « Diagnostic BPF » (bonnes pratiques de fabrication) : formes échangées avec GET /api/bpf, échelle d'appréciation et calcul des scores. */

export interface BpfItem {
  /** Identifiant interne (1 à 92), enregistré avec la réponse : il ne change jamais */
  id: number;
  /** Numéro affiché, ex. « 1.2.4 » */
  num: string;
  text: string;
  /** Nombre maximal de points de l'exigence */
  max: number;
  /** Consigne de vérification (« Comment vérifier ») ; null quand le classeur n'en donne pas */
  guide: string | null;
}

export interface BpfCategory {
  id: number;
  name: string;
  icon: string;
  items: BpfItem[];
}

/** Réponse enregistrée pour une exigence : points attribués (0 au maximum) ou « non applicable » (alors sans points) */
export interface BpfItemAnswer {
  item: number;
  points: number | null;
  na: boolean;
  observations: string | null;
}

export interface BpfCategoryText {
  cat: number;
  conclusions: string | null;
  recommandations: string | null;
}

export interface BpfResponse {
  data: { id: number; date_evaluation: string | null; remarques_generales: string | null; updated_at: string } | null;
  items: BpfItemAnswer[];
  categories: BpfCategoryText[];
  actions: { action: string }[];
  company: { id: number; name: string } | null;
  consultant: { username: string } | null;
}

/** Nombre maximal d'actions prioritaires (le classeur en fixe 5) ; identique côté serveur */
export const BPF_MAX_ACTIONS = 10;

// ── Échelle d'appréciation (mêmes seuils que le classeur : 80 % et 60 %, comparés sans arrondi) ─────────────

export type BpfAppreciation = 'bon' | 'acceptable' | 'a_ameliorer';

export const BPF_APPRECIATIONS: { value: BpfAppreciation; label: string; seuil: string; description: string }[] = [
  { value: 'bon', label: 'BON', seuil: '80 % et plus', description: 'Conforme aux normes BPF' },
  { value: 'acceptable', label: 'ACCEPTABLE', seuil: '60 % à moins de 80 %', description: 'Améliorations mineures nécessaires' },
  { value: 'a_ameliorer', label: 'À AMÉLIORER', seuil: 'Moins de 60 %', description: 'Lacunes importantes – mesures à prendre' },
];

export const BPF_SEUIL_BON = 80;
export const BPF_SEUIL_ACCEPTABLE = 60;

/** Appréciation d'un résultat ; null s'il n'y a rien d'évalué (max = 0). Comparaison en entiers : 80 % pile est « BON », 60 % pile « ACCEPTABLE ». */
export function bpfAppreciation(obtenu: number, max: number): BpfAppreciation | null {
  if (max <= 0) return null;
  if (obtenu * 100 >= max * BPF_SEUIL_BON) return 'bon';
  if (obtenu * 100 >= max * BPF_SEUIL_ACCEPTABLE) return 'acceptable';
  return 'a_ameliorer';
}

// ── Calcul des scores ──────────────────────────────────────────────────────────────────────────────────────

export interface BpfScore {
  /** Points attribués aux exigences évaluées */
  obtenu: number;
  /** Maximum des exigences évaluées : ni les « non applicables » ni les exigences pas encore évaluées n'y entrent */
  max: number;
  /** max − obtenu */
  ecart: number;
  /** Exigences notées (points saisis) */
  evaluees: number;
  nonApplicables: number;
  /** Exigences au total */
  total: number;
  /** obtenu / max (0 à 1) ; null si rien n'est évalué */
  taux: number | null;
  appreciation: BpfAppreciation | null;
}

type AnswerOf = (id: number) => { points: number | null; na: boolean } | undefined;

const toScore = (obtenu: number, max: number, evaluees: number, nonApplicables: number, total: number): BpfScore => ({
  obtenu, max, ecart: max - obtenu, evaluees, nonApplicables, total,
  taux: max > 0 ? obtenu / max : null,
  appreciation: bpfAppreciation(obtenu, max),
});

/**
 * Score d'un groupe d'exigences. Règle (différente du classeur, voir l'écran) : « non applicable » retire l'exigence du maximum,
 * et une exigence pas encore évaluée n'est comptée ni dans les points ni dans le maximum (le résultat reste provisoire).
 * Quand tout est évalué et que rien n'est « non applicable », le résultat est identique à celui du classeur.
 */
export function bpfScore(items: BpfItem[], answerOf: AnswerOf): BpfScore {
  let obtenu = 0, max = 0, evaluees = 0, nonApplicables = 0;
  for (const it of items) {
    const a = answerOf(it.id);
    if (!a) continue;
    if (a.na) { nonApplicables++; continue; }
    if (typeof a.points === 'number') { obtenu += a.points; max += it.max; evaluees++; }
  }
  return toScore(obtenu, max, evaluees, nonApplicables, items.length);
}

/** Score global : somme des points et des maxima de toutes les catégories (le taux est pondéré par les maxima, pas une moyenne de taux) */
export function bpfTotal(scores: BpfScore[]): BpfScore {
  const sum = (key: 'obtenu' | 'max' | 'evaluees' | 'nonApplicables' | 'total') => scores.reduce((acc, s) => acc + s[key], 0);
  return toScore(sum('obtenu'), sum('max'), sum('evaluees'), sum('nonApplicables'), sum('total'));
}

/** Mode d'emploi affiché en haut de la grille */
export const BPF_MODE_EMPLOI: string[] = [
  'Évaluez chaque exigence pendant la visite : « Conforme » donne tous les points, « Non conforme » aucun, « Partiel » demande une note estimative (réglez les points avec − et +).',
  '« Non applicable » retire l\'exigence du calcul : elle ne pénalise pas l\'entreprise. Utilisez-le quand l\'exigence ne concerne pas l\'unité visitée.',
  'Touchez « Comment vérifier » pour lire la consigne de contrôle, et « Remarque » pour noter une observation ou une preuve (photo prise, registre consulté…).',
  'Vous pouvez enregistrer à tout moment. Les exigences pas encore évaluées ne comptent pas : les résultats restent « provisoires » jusqu\'à la dernière.',
  'La visite terminée, ouvrez l\'onglet Rapport pour lire les résultats, puis rédiger les conclusions, les recommandations et les actions prioritaires.',
];
