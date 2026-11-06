/** Outil « Suivi et évaluation » : questionnaire (servi par GET /api/suivi/questionnaire) et réponses. */

export type SuiviPhase = 'initial' | 'final';
export type SuiviQType = 'choice' | 'multi' | 'number' | 'money' | 'percent' | 'text' | 'longtext' | 'list';

export interface SuiviQuestion {
  key: string;
  section: string;
  /** Question posée une seule fois (saisie initiale) */
  once?: boolean;
  type: SuiviQType;
  label: string;
  note?: string;
  options?: string[];
  list?: 'regions' | 'citi1' | 'citi2' | 'citi3';
  min?: number;
  max?: number;
  unit?: string;
  optional?: boolean;
  /** Deux options courtes (Oui / Non) : affichées côte à côte */
  compact?: boolean;
  showIf?: { key: string; anyOf: number[] };
  /** Champ de la fiche entreprise qui pré-remplit la réponse */
  prefill?: 'name' | 'region' | 'ville' | 'secteur' | 'nbr_employer' | 'nbr_femme';
}

export interface SuiviSection {
  id: string;
  title: string;
  icon: string;
  note?: string;
}

export interface ListItem { code: string; label: string; }

export interface SuiviQuestionnaire {
  sections: SuiviSection[];
  questions: SuiviQuestion[];
  lists: Record<string, ListItem[]>;
  fx: { year: number; xafPerUsd: number };
}

/** choice → numéro de l'option ; multi → numéros ; number / money / percent → nombre ; list / text → texte */
export type SuiviAnswer = number | number[] | string;
export type SuiviAnswers = Record<string, SuiviAnswer>;

export interface SuiviCompany {
  id: number;
  name: string;
  region: string | null;
  ville: string | null;
  secteur: string | null;
  nbr_employer: number | null;
  nbr_femme: number | null;
}

export interface SuiviResponse {
  phase: SuiviPhase;
  data: { id: number; updated_at: string } | null;
  answers: SuiviAnswers;
  /** Réponses du démarrage, pour la saisie finale */
  initial: SuiviAnswers | null;
  company: SuiviCompany | null;
  consultant: { username: string } | null;
  fx: { year: number; xafPerUsd: number };
}

// ── Tableau de bord du portefeuille (managers) ─────────────────────────────

export interface SuiviDistribution {
  n: number;
  counts?: Record<string, number>;
  somme?: number;
  moyenne?: number | null;
  mediane?: number | null;
}

export interface SuiviRatio { part: number; n: number; effectif: number; }

export interface SuiviIndicators {
  entreprises: number;
  emplois: number | null;
  femmes: SuiviRatio | null;
  jeunes: SuiviRatio | null;
  handicap: SuiviRatio | null;
  vulnerables: SuiviRatio | null;
  ca_moyen: number | null;
  marge_moyenne: number | null;
}

export interface SuiviPortfolio {
  phases: Record<SuiviPhase, { indicateurs: SuiviIndicators; questions: Record<string, SuiviDistribution> }>;
  paired: { entreprises: number; initial: SuiviIndicators; final: SuiviIndicators };
  fx: { year: number; xafPerUsd: number };
  filtres: { regions: string[]; consultants: { id: number; username: string }[] };
}
